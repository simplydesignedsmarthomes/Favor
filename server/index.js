// HTTP static server + WebSocket game server (no framework, just `ws`).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WebSocketServer } from 'ws';
import { Rooms } from './rooms.js';
import { viewFor } from '../engine/engine.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(__dirname, '..', 'public');
const ENGINE = path.join(__dirname, '..', 'engine');
// Pure data modules shared with the browser (characters, relics, cards, regions).
const SHARED = new Set(['characters.js', 'relics.js', 'cards.js', 'regions.js']);
const PORT = Number(process.env.PORT || 3000);
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json',
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  if (url.pathname === '/healthz') { res.writeHead(200).end('ok'); return; }
  const shared = url.pathname.startsWith('/engine/') && SHARED.has(url.pathname.slice(8));
  const root = shared ? ENGINE : PUBLIC;
  let file = path.normalize(path.join(root, shared ? url.pathname.slice(8) : decodeURIComponent(url.pathname)));
  if (!file.startsWith(root)) { res.writeHead(403).end(); return; }
  if (url.pathname.endsWith('/')) file = path.join(file, 'index.html');
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404).end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(data);
  });
});

const rooms = new Rooms();
const wss = new WebSocketServer({ server, path: '/ws', maxPayload: 16 * 1024 });

wss.on('connection', (ws) => {
  let room = null; let player = null;
  ws.isAlive = true;
  ws.on('pong', () => { ws.isAlive = true; });
  const fail = (message) => ws.send(JSON.stringify({ t: 'error', message }));

  ws.on('message', (raw) => {
    let m;
    try { m = JSON.parse(raw); } catch { return; }
    try {
      switch (m.t) {
        case 'create': {
          room = rooms.create();
          player = room.addPlayer(m.name, ws);
          break;
        }
        case 'join': {
          room = rooms.get(m.code);
          if (!room) return fail('No room with that code.');
          player = room.addPlayer(m.name, ws);
          break;
        }
        case 'rejoin': {
          const r = rooms.get(m.code);
          const p = r && r.byToken(m.token);
          if (!p) { ws.send(JSON.stringify({ t: 'gone' })); return; }
          room = r; player = p;
          if (p.ws && p.ws !== ws) try { p.ws.close(); } catch { /* already closed */ }
          p.ws = ws; p.connected = true;
          break;
        }
        case 'pick': room.pickCharacter(player.id, m.char); break;
        case 'start': room.start(player.id); break;
        case 'act': room.act(player.id, m.action); break;
        case 'lobby': room.backToLobby(player.id); break;
        case 'leave': {
          const r = room; const id = player.id;
          room = null; player = null;
          if (r && !r.game) { r.removePlayer(id); r.broadcast(); }
          ws.send(JSON.stringify({ t: 'gone' }));
          return;
        }
        default: return;
      }
      if (!room || !player) return fail('Join a room first.');
      if (m.t === 'create' || m.t === 'join' || m.t === 'rejoin') ws.send(JSON.stringify({ t: 'hello', token: player.token, code: room.code, id: player.id }));
      room.broadcast();
    } catch (e) {
      fail(e.message || 'Something went wrong.');
      if (room && player) { try { room.send(player, { t: 'lobby', lobby: room.lobbyView(player.id) }); if (room.game) room.send(player, { t: 'state', view: viewFor(room.game, player.id) }); } catch { /* ignore */ } }
    }
  });

  ws.on('close', () => {
    if (!player || player.ws !== ws) return;
    player.connected = false;
    if (room) room.broadcast();
  });
});

setInterval(() => {
  for (const ws of wss.clients) {
    if (!ws.isAlive) { ws.terminate(); continue; }
    ws.isAlive = false; ws.ping();
  }
}, 30000).unref();

server.listen(PORT, () => console.log(`Favor server listening on http://localhost:${PORT}`));
