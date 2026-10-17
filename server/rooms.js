// Room management: lobby, seats, reconnection and game wrapping.
import crypto from 'node:crypto';
import { createGame, applyAction, viewFor } from '../engine/engine.js';
import { CHARACTERS, CHARACTER_KEYS } from '../engine/characters.js';

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const MAX_PLAYERS = 6;
const ROOM_TTL_MS = 1000 * 60 * 60 * 12;

export class Room {
  constructor(code) {
    this.code = code;
    this.players = []; // { id, token, name, char, ws, connected }
    this.hostId = null;
    this.game = null;
    this.touched = Date.now();
    this.nextId = 1;
  }

  get status() { return !this.game ? 'lobby' : this.game.phase === 'over' ? 'over' : 'playing'; }
  touch() { this.touched = Date.now(); }
  byToken(token) { return this.players.find((p) => p.token === token); }

  addPlayer(name, ws) {
    if (this.game) throw new Error('That game has already started.');
    if (this.players.length >= MAX_PLAYERS) throw new Error('That room is full.');
    const p = { id: `p${this.nextId++}`, token: crypto.randomBytes(12).toString('hex'), name: cleanName(name), char: null, ws, connected: true };
    this.players.push(p);
    if (!this.hostId) this.hostId = p.id;
    this.touch();
    return p;
  }

  removePlayer(id) {
    this.players = this.players.filter((p) => p.id !== id);
    if (this.hostId === id) this.hostId = this.players[0]?.id || null;
    this.touch();
  }

  pickCharacter(id, char) {
    if (this.game) throw new Error('The game has already started.');
    const p = this.players.find((x) => x.id === id);
    if (char !== null && !CHARACTER_KEYS.includes(char)) throw new Error('Unknown character.');
    if (char && this.players.some((x) => x.id !== id && x.char === char)) throw new Error('Someone already picked that character.');
    p.char = char;
    this.touch();
  }

  start(id) {
    if (this.game) throw new Error('Already started.');
    if (id !== this.hostId) throw new Error('Only the host can start the game.');
    if (this.players.length < 2) throw new Error('You need at least 2 players.');
    const free = CHARACTER_KEYS.filter((c) => !this.players.some((p) => p.char === c));
    for (const p of this.players) if (!p.char) p.char = free.splice(Math.floor(Math.random() * free.length), 1)[0];
    this.game = createGame({ players: this.players.map((p) => ({ id: p.id, name: p.name, char: p.char })) });
    this.touch();
  }

  act(id, action) {
    if (!this.game) throw new Error('The game has not started.');
    const res = applyAction(this.game, id, action);
    this.touch();
    if (!res.ok) throw new Error(res.error);
  }

  backToLobby(id) {
    if (id !== this.hostId) throw new Error('Only the host can do that.');
    this.game = null;
    for (const p of this.players) p.char = null;
    this.touch();
  }

  lobbyView(forId) {
    return {
      code: this.code, status: this.status, you: forId, host: this.hostId,
      players: this.players.map((p) => ({ id: p.id, name: p.name, char: p.char, connected: p.connected })),
      characters: Object.fromEntries(Object.entries(CHARACTERS).map(([k, c]) => [k, { name: c.name, emoji: c.emoji, color: c.color, hearts: c.hearts, fight: c.fight, charm: c.charm, wit: c.wit, boon: c.boon, blurb: c.blurb }])),
    };
  }

  send(p, msg) {
    if (p.ws && p.ws.readyState === 1) p.ws.send(JSON.stringify(msg));
  }

  broadcast() {
    for (const p of this.players) {
      this.send(p, { t: 'lobby', lobby: this.lobbyView(p.id) });
      if (this.game) this.send(p, { t: 'state', view: viewFor(this.game, p.id) });
    }
  }
}

function cleanName(n) {
  const s = String(n || '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 18);
  return s || 'Player';
}

export class Rooms {
  constructor() {
    this.rooms = new Map();
    setInterval(() => this.sweep(), 1000 * 60 * 10).unref();
  }

  create() {
    let code;
    do { code = Array.from({ length: 4 }, () => CODE_CHARS[crypto.randomInt(CODE_CHARS.length)]).join(''); } while (this.rooms.has(code));
    const room = new Room(code);
    this.rooms.set(code, room);
    return room;
  }

  get(code) { return this.rooms.get(String(code || '').toUpperCase().trim()); }

  sweep() {
    const now = Date.now();
    for (const [code, r] of this.rooms) if (now - r.touched > ROOM_TTL_MS && !r.players.some((p) => p.connected)) this.rooms.delete(code);
  }
}
