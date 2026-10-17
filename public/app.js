import { CHARACTERS, CHARACTER_KEYS } from '/engine/characters.js';
import { RELICS } from '/engine/relics.js';
import { ITEMS } from '/engine/cards.js';
import { boardMarkup, previewSvg, REGION, S as TILE } from './board.js';

const $app = document.getElementById('app');
const $toast = document.getElementById('toast');
const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const store = {
  get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage may be blocked */ } },
  del(k) { try { localStorage.removeItem(k); } catch { /* ignore */ } },
};

const st = {
  ws: null, ready: false, queue: [], retry: 0,
  session: store.get('favor.session'), // { token, code }
  lobby: null, view: null, screen: 'home',
  offerSel: new Set(), multiSel: new Set(), sideOpen: false, info: null, localModal: null,
  cam: { auto: true, cx: 0, cy: 0, w: 900 },
};

// ------------------------------------------------------------------ network

function connect() {
  const proto = location.protocol === 'https:' ? 'wss' : 'ws';
  const ws = new WebSocket(`${proto}://${location.host}/ws`);
  st.ws = ws;
  ws.onopen = () => {
    st.ready = true; st.retry = 0;
    if (st.session) ws.send(JSON.stringify({ t: 'rejoin', ...st.session }));
    for (const m of st.queue.splice(0)) ws.send(JSON.stringify(m));
  };
  ws.onmessage = (e) => handle(JSON.parse(e.data));
  ws.onclose = () => {
    st.ready = false;
    setTimeout(connect, Math.min(8000, 600 * 2 ** st.retry++));
  };
}

function send(msg) {
  if (st.ready) st.ws.send(JSON.stringify(msg)); else st.queue.push(msg);
}
const act = (action) => send({ t: 'act', action });
const respond = (answer) => act({ type: 'respond', answer });

function handle(m) {
  switch (m.t) {
    case 'hello':
      st.session = { token: m.token, code: m.code };
      store.set('favor.session', st.session);
      break;
    case 'lobby':
      st.lobby = m.lobby;
      if (m.lobby.status === 'lobby') { st.view = null; st.screen = 'lobby'; st.localModal = null; }
      render();
      break;
    case 'state':
      st.view = m.view; st.screen = 'game';
      if (st.view.turn !== st.view.me || st.view.prompt) st.offerSel.clear();
      render();
      break;
    case 'error': toast(m.message); break;
    case 'gone':
      st.session = null; store.del('favor.session'); st.lobby = null; st.view = null; st.screen = 'home'; render();
      break;
  }
}

let toastTimer;
function toast(text, kind = 'err') {
  $toast.textContent = text;
  $toast.className = `show ${kind === 'info' ? 'info' : ''}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { $toast.className = ''; }, 3200);
}

// ------------------------------------------------------------------ rendering

let mounted = null;
function render() {
  if (st.screen === 'game' && st.view) {
    if (mounted !== 'game') { $app.innerHTML = gameSkeleton(); mounted = 'game'; bindBoard(); }
    renderGame();
  } else if (st.screen === 'lobby' && st.lobby) {
    mounted = 'lobby'; $app.innerHTML = lobbyHtml();
  } else if (st.session) {
    mounted = 'wait'; $app.innerHTML = '<div class="screen"><div class="hero"><p>Reconnecting to your game...</p></div></div>';
  } else if (mounted !== 'home') { mounted = 'home'; $app.innerHTML = homeHtml(); }
}

function homeHtml() {
  const code = new URLSearchParams(location.search).get('room') || '';
  return `<div class="screen">
    <div class="hero"><h1>Favor: Gods of Oethera</h1>
      <p>Explore the lands, delve into ruins, and offer relics to the Gods. First to 10 Favor, or all four Settlement Banners, wins. 2 to 6 players, online.</p></div>
    <div class="card-box"><div class="field"><label for="name">Your name</label><input id="name" maxlength="18" autocomplete="nickname" value="${esc(store.get('favor.name') || '')}" placeholder="Ambassador"></div></div>
    <div class="home-grid">
      <div class="card-box"><h3>Host a game</h3><p class="sub">You get a room code to share with friends.</p><button class="btn gold" data-act="create">Create room</button></div>
      <div class="card-box"><h3>Join a game</h3><div class="field"><label for="code">Room code</label><input id="code" class="code-input" maxlength="4" value="${esc(code)}" placeholder="ABCD"></div><button class="btn" data-act="join">Join room</button></div>
    </div>
    <p class="note">Unofficial fan-made adaptation of the board game by Lichenwood Games. Support the designers and buy the real game!</p>
  </div>`;
}

function lobbyHtml() {
  const L = st.lobby; const me = L.players.find((p) => p.id === L.you);
  const taken = new Map(L.players.filter((p) => p.char).map((p) => [p.char, p]));
  const link = `${location.origin}/?room=${L.code}`;
  return `<div class="screen">
    <div class="hero" style="padding-bottom:6px"><h1>Gathering at the Altar</h1></div>
    <div class="card-box" style="text-align:center">
      <div class="roomcode">Room <b>${esc(L.code)}</b><button class="btn small ghost" data-act="copy" data-link="${esc(link)}">Copy invite link</button></div>
      <div class="plist">${L.players.map((p) => `<span class="pchip ${p.id === L.you ? 'you' : ''} ${p.connected ? '' : 'off'}">${p.char ? CHARACTERS[p.char].emoji : '❔'} ${esc(p.name)}${p.id === L.host ? ' 👑' : ''}</span>`).join('')}</div>
      <p class="sub">${L.players.length} / 6 players. Pick a character below (or leave it blank and the Gods will choose).</p>
    </div>
    <h2 style="margin:18px 0 10px">Choose your character</h2>
    <div class="chars">${CHARACTER_KEYS.map((k) => {
    const c = L.characters[k]; const owner = taken.get(k); const mine = owner && owner.id === L.you;
    return `<button class="char ${mine ? 'mine' : ''}" data-act="pick" data-char="${k}" ${owner && !mine ? 'disabled' : ''}>
        <span class="face" style="background:${c.color}33;border:3px solid ${c.color}">${c.emoji}</span>
        <span><h3>${c.name}</h3><div class="stats">❤️ ${c.hearts} &nbsp; ⚔️ ${c.fight} &nbsp; 💬 ${c.charm} &nbsp; 🧠 ${c.wit}</div>
        <div class="boon"><b>${esc(c.boon.name)}:</b> ${esc(c.boon.text)}</div>${owner && !mine ? `<div class="taken">Taken by ${esc(owner.name)}</div>` : ''}</span></button>`;
  }).join('')}</div>
    <div style="display:flex;gap:10px;justify-content:center;margin-top:22px;flex-wrap:wrap">
      <button class="btn ghost" data-act="leave">Leave room</button>
      ${me && L.you === L.host ? `<button class="btn gold" data-act="start" ${L.players.length < 2 ? 'disabled' : ''}>Start game</button>` : '<span class="sub" style="align-self:center">Waiting for the host to start...</span>'}
    </div>
  </div>`;
}

function gameSkeleton() {
  return `<div class="game">
    <div class="top" id="top"></div>
    <div class="players" id="players"></div>
    <div class="boardwrap" id="boardwrap">
      <svg id="bsvg" viewBox="0 0 900 600" preserveAspectRatio="xMidYMid meet"></svg>
      <div class="boardtools"><button class="btn small ghost" data-act="zoomin" title="Zoom in">＋</button><button class="btn small ghost" data-act="zoomout" title="Zoom out">－</button><button class="btn small ghost" data-act="recenter" title="Recenter">⌖</button></div>
      <div id="boardmsg"></div><div class="tileinfo" id="tileinfo" hidden></div>
    </div>
    <div class="side" id="side"><div class="plist2" id="plist2"></div><div class="log" id="log"></div></div>
    <div class="dock" id="dock"></div>
    <div id="modal"></div>
  </div>`;
}

const face = (p, size) => `<span class="face" style="background:${p.color};${size ? `width:${size}px;height:${size}px;` : ''}">${CHARACTERS[p.char].emoji}</span>`;
const heartsStr = (p) => '❤️'.repeat(p.hearts) + '🖤'.repeat(Math.max(0, p.maxHearts - p.hearts));
const STATUS = { poison: '☠ Poisoned', cold: '❄ Cold', silenced: '🤐 Silenced', weary: '😮‍💨 Weary', feeble: '💪- Feeble', jinx: '💬- Jinxed', dullness: '🧠- Dull' };

function relicChip(id) {
  const r = RELICS[id];
  return `<span class="chip relic ${r.type}" title="${esc(r.name)}: ${esc(r.text)}">${esc(r.name)}</span>`;
}

function playerCard(v, p) {
  return `<div class="pc ${p.id === v.turn ? 'turn' : ''} ${p.id === v.me ? 'me' : ''}">
    <div class="row">${face(p)}<span class="nm">${esc(p.name)}${p.id === v.me ? ' (you)' : ''}</span><span class="sub">${CHARACTERS[p.char].name}</span>${p.boonReady ? '<span class="tag" title="Boon ready">✨ Boon</span>' : ''}</div>
    <div class="row hearts" title="Hearts">${heartsStr(p)}${p.stunned ? ' 💫 Stunned' : ''}</div>
    <div class="row"><span title="Favor">⭐ ${p.favor}/10</span><span class="favorbar"><i style="width:${Math.min(100, p.favor * 10)}%"></i></span><span title="Action cards in hand">🂠 ${p.handCount}</span></div>
    <div class="row sub">⚔️ ${p.stats.fight} 💬 ${p.stats.charm} 🧠 ${p.stats.wit}${p.banners.map((r) => ` ${REGION[r].emoji}🚩`).join('')}</div>
    ${p.statuses.length || p.invisible ? `<div class="row">${p.statuses.map((x) => `<span class="tag bad">${STATUS[x] || x}</span>`).join('')}${p.invisible ? '<span class="tag">👻 Invisible</span>' : ''}</div>` : ''}
    ${p.relics.length || p.items.length ? `<div class="row">${p.relics.map(relicChip).join('')}${p.items.map((i) => `<span class="chip" title="${esc(ITEMS[i].text)}">🎒 ${esc(ITEMS[i].name)}</span>`).join('')}</div>` : ''}
  </div>`;
}

function renderGame() {
  const v = st.view; const me = v.players.find((p) => p.id === v.me);
  const cur = v.players.find((p) => p.id === v.turn);
  const mine = v.turn === v.me;
  const g = (id) => document.getElementById(id);

  g('top').innerHTML = `<b>Favor</b>
    <span class="turnbadge ${mine ? 'mine' : ''}">${v.phase === 'over' ? 'Game over' : mine ? 'Your turn' : `${esc(cur.name)}'s turn`}</span>
    <span class="decks grow">🏛 stacks: ${Object.entries(v.stacks).map(([r, n]) => `${REGION[r].emoji}${n}`).join(' ')} · 🪤 bag ${v.trapBag} · 🂠 ${v.decks.action} · 💎 ${v.decks.relic}</span>
    <button class="btn small ghost" data-act="side">Log</button>
    <button class="btn small ghost" data-act="leave">Leave</button>`;
  g('players').innerHTML = v.players.map((p) => playerCard(v, p)).join('');
  g('players').style.display = matchMedia('(max-width: 900px)').matches ? 'flex' : 'none';
  g('plist2').innerHTML = v.players.map((p) => playerCard(v, p)).join('');
  g('side').classList.toggle('open', st.sideOpen);

  const lg = g('log'); const stick = lg.scrollTop + lg.clientHeight >= lg.scrollHeight - 30;
  lg.innerHTML = v.log.map((l) => `<p class="${l.text.startsWith('---') ? 'turn' : ''}">${esc(l.text.replace(/^-+\s*|\s*-+$/g, ''))}</p>`).join('');
  if (stick || !lg.dataset.init) { lg.scrollTop = lg.scrollHeight; lg.dataset.init = '1'; }

  renderBoard(v, me, mine);
  renderDock(v, me, mine);
  renderModal(v, me, mine);
}

function renderBoard(v, me, mine) {
  const moves = new Map(); const pick = new Set();
  if (mine && !v.prompt) for (const a of v.legal) if (a.type === 'move') moves.set(a.cell, a);
  if (v.prompt && !v.prompt.hidden && v.prompt.kind === 'cell') for (const o of v.prompt.options) pick.add(o.cell);
  const { markup, bounds } = boardMarkup(v, { moves, pick });
  st.bounds = bounds;
  document.getElementById('bsvg').innerHTML = markup;
  applyCam(me);
  const msg = document.getElementById('boardmsg');
  if (v.prompt && v.prompt.hidden) msg.innerHTML = `<div class="waiting">Waiting for ${esc(v.players.find((p) => p.id === v.prompt.pid).name)}: ${esc(v.prompt.text)}</div>`;
  else if (v.prompt && v.prompt.kind === 'cell') msg.innerHTML = `<div class="hint">${esc(v.prompt.text)}: tap a glowing tile</div>`;
  else if (mine && v.phase === 'play') msg.innerHTML = '<div class="hint">Tap a glowing tile to move, or use an action below</div>';
  else msg.innerHTML = '';
}

function applyCam(me) {
  const wrap = document.getElementById('boardwrap'); const svg = document.getElementById('bsvg');
  const cw = wrap.clientWidth || 800; const ch = wrap.clientHeight || 500;
  const c = st.cam; const b = st.bounds;
  if (c.auto) {
    const pad = 0.6 * TILE;
    const minX = b.minX * TILE - pad; const maxX = (b.maxX + 1) * TILE + pad;
    const minY = b.minY * TILE - pad; const maxY = (b.maxY + 1) * TILE + pad;
    let w = Math.max(maxX - minX, ((maxY - minY) * cw) / ch);
    c.cx = (minX + maxX) / 2; c.cy = (minY + maxY) / 2;
    const cap = (cw / 64) * TILE; // keep tiles at least ~64px wide
    if (w > cap) {
      w = cap;
      const mine = st.view.players.find((p) => p.id === st.view.me);
      const pos = mine.pos.split(',').map(Number);
      c.cx = (pos[0] + 0.5) * TILE; c.cy = (pos[1] + 0.5) * TILE;
    }
    c.w = w;
  }
  const h = (c.w * ch) / cw;
  svg.setAttribute('viewBox', `${c.cx - c.w / 2} ${c.cy - h / 2} ${c.w} ${h}`);
}

function bindBoard() {
  const wrap = document.getElementById('boardwrap'); const svg = document.getElementById('bsvg');
  const ptrs = new Map(); let moved = 0; let pinch = 0;
  const scale = () => st.cam.w / (wrap.clientWidth || 800);
  // Capture the pointer only once a drag starts; capturing on press would retarget the click away from the tile.
  svg.addEventListener('pointerdown', (e) => { ptrs.set(e.pointerId, e); if (ptrs.size === 1) moved = 0; });
  svg.addEventListener('pointermove', (e) => {
    const prev = ptrs.get(e.pointerId); if (!prev) return;
    if (ptrs.size === 1) {
      const dx = e.clientX - prev.clientX; const dy = e.clientY - prev.clientY;
      moved += Math.abs(dx) + Math.abs(dy);
      if (moved > 6) { try { svg.setPointerCapture(e.pointerId); } catch { /* pointer already gone */ } st.cam.auto = false; st.cam.cx -= dx * scale(); st.cam.cy -= dy * scale(); applyCam(); }
    }
    ptrs.set(e.pointerId, e);
    if (ptrs.size === 2) {
      const [a, b] = [...ptrs.values()]; const d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      if (pinch) { st.cam.auto = false; st.cam.w = Math.min(4000, Math.max(250, st.cam.w * (pinch / d))); applyCam(); moved = 99; }
      pinch = d;
    }
  });
  const up = (e) => { ptrs.delete(e.pointerId); if (ptrs.size < 2) pinch = 0; };
  svg.addEventListener('pointerup', up); svg.addEventListener('pointercancel', up);
  svg.addEventListener('wheel', (e) => {
    e.preventDefault(); st.cam.auto = false;
    st.cam.w = Math.min(4000, Math.max(250, st.cam.w * (e.deltaY > 0 ? 1.12 : 0.89))); applyCam();
  }, { passive: false });
  svg.addEventListener('click', (e) => {
    if (moved > 6) return;
    const v = st.view; if (!v) return;
    const pk = e.target.closest('[data-pick]'); const cell = e.target.closest('[data-cell]');
    if (pk && v.prompt && !v.prompt.hidden && v.prompt.kind === 'cell') { respond(pk.dataset.pick); return; }
    const a = cell && v.turn === v.me && !v.prompt && v.legal.find((l) => l.type === 'move' && l.cell === cell.dataset.cell);
    if (a) { act({ type: 'move', cell: a.cell }); return; }
    const t = cell && v.tiles[cell.dataset.cell];
    showInfo(t ? `<b>${esc(t.info.name)}</b>: ${esc(t.info.text)}` : null);
  });
  new ResizeObserver(() => { if (st.view) applyCam(); }).observe(wrap);
}

let infoTimer;
function showInfo(html) {
  const el = document.getElementById('tileinfo'); if (!el) return;
  if (!html) { el.hidden = true; return; }
  el.innerHTML = html; el.hidden = false;
  clearTimeout(infoTimer); infoTimer = setTimeout(() => { el.hidden = true; }, 4000);
}

function whyNot(v, me, a, cost) {
  if (v.turn !== v.me) return 'Not your turn';
  if (me.statuses.includes('silenced')) return 'You are Silenced';
  if (cost > v.players.find((p) => p.id === v.me).energy) return 'Not enough Energy';
  return 'No valid target';
}

function renderDock(v, me, mine) {
  const canAct = mine && !v.prompt && v.phase === 'play';
  const has = (t) => canAct && v.legal.some((l) => l.type === t);
  const energy = me.energy;
  const pips = energy <= 10 ? Array.from({ length: Math.max(energy, 4) }, (_, i) => `<i class="pip ${i < energy ? '' : 'off'}"></i>`).join('') : `<i class="pip"></i> x${energy}`;
  const boon = CHARACTERS[me.char].boon;
  const legalCard = new Map(v.legal.filter((l) => l.type === 'playCard').map((l) => [l.cardId, l]));
  document.getElementById('dock').innerHTML = `
    <div class="dockrow">
      ${face(me, 30)}<b>${esc(me.name)}</b>
      <span class="energy" title="Energy">⚡ ${pips}</span>
      <span class="stat" title="Hearts">${heartsStr(me)}</span>
      <span class="stat" title="Fight">⚔️ ${me.stats.fight}</span><span class="stat" title="Charm">💬 ${me.stats.charm}</span><span class="stat" title="Wit">🧠 ${me.stats.wit}</span>
      <span class="stat">⭐ ${me.favor}/10</span>
      ${me.banners.map((r) => `<span class="stat" title="${REGION[r].name} Banner">${REGION[r].emoji}🚩</span>`).join('')}
    </div>
    ${mine && v.phase === 'play' ? `<div class="dockrow">
      <button class="btn small" data-act="delve" ${has('delve') ? '' : 'disabled'}>🏛 Delve</button>
      <button class="btn small" data-act="offer" ${has('offer') ? '' : 'disabled'}>🙏 Offer relics</button>
      <button class="btn small" data-act="settle" ${has('settle') ? '' : 'disabled'}>🚩 Capture banner</button>
      <button class="btn small" data-act="attack" ${has('attack') ? '' : 'disabled'}>⚔️ Attack</button>
      <button class="btn small" data-act="boon" ${has('boon') ? '' : 'disabled'} title="${esc(boon.text)}">✨ ${esc(boon.name)}${me.boonReady ? '' : ' (spent)'}</button>
      <button class="btn small gold" data-act="end" ${canAct ? '' : 'disabled'}>End turn</button>
    </div>` : ''}
    ${me.relics.length || me.items.length ? `<div class="dockrow">${me.relics.map(relicChip).join('')}${me.items.map((i, idx) => `<button class="chip" data-act="item" data-item="${i}" ${canAct ? '' : 'disabled'} title="${esc(ITEMS[i].text)}">🎒 ${esc(ITEMS[i].name)}</button>`).join('')}</div>` : ''}
    <div class="hand">${v.hand.length ? v.hand.map((c) => {
    const l = legalCard.get(c.id);
    return `<button class="acard ${c.type}" data-act="card" data-card="${c.id}" ${l ? '' : 'disabled'} title="${esc(c.name)}: ${esc(c.text)}${l ? '' : ` (${whyNot(v, me, c, c.cost)})`}">
      <span class="cost"><span>${l ? l.cost : c.cost}</span></span><span class="nm">${esc(c.name)}</span><span>${esc(c.text)}</span><span class="tp">${c.type}</span></button>`;
  }).join('') : '<span class="sub">Your hand is empty. You draw up to your Wit at the end of your turn.</span>'}</div>`;
}

function renderModal(v, me, mine) {
  const el = document.getElementById('modal');
  let html = '';
  const pr = v.prompt;
  if (v.phase === 'over') {
    const w = v.players.find((p) => p.id === v.winner);
    const host = st.lobby && st.lobby.host === v.me;
    html = `<div class="modal-bg"><div class="modal"><div class="confetti">🏆</div><h2 style="text-align:center">${esc(w.name)} wins the Favor of the Gods!</h2>
      <p class="big">${CHARACTERS[w.char].emoji}</p><p style="text-align:center" class="sub">${w.favor} Favor · ${w.banners.length} Banner${w.banners.length === 1 ? '' : 's'}</p>
      <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap"><button class="btn ghost" data-act="leave">Leave</button>${host ? '<button class="btn gold" data-act="lobby">Play again</button>' : '<span class="sub">Waiting for the host to start another game...</span>'}</div></div></div>`;
  } else if (st.localModal === 'offer' && mine && !pr) {
    const n = st.offerSel.size;
    html = `<div class="modal-bg"><div class="modal"><h2>Offer Relics to the Gods</h2><p class="sub">Each Relic offered is worth 1 Favor and replenishes your Boon. Costs 1 Energy total.</p>
      <div class="opts">${me.relics.map((r) => `<button class="opt ${st.offerSel.has(r) ? 'sel' : ''}" data-act="offersel" data-relic="${r}"><b>${st.offerSel.has(r) ? '☑' : '☐'} ${esc(RELICS[r].name)}</b><div class="sub">${esc(RELICS[r].text)}</div></button>`).join('')}</div>
      <div style="display:flex;gap:10px;justify-content:flex-end"><button class="btn ghost" data-act="closemodal">Cancel</button><button class="btn gold" data-act="offerok" ${n ? '' : 'disabled'}>Offer ${n || ''} (+${n} Favor)</button></div></div></div>`;
  } else if (pr && !pr.hidden && pr.kind !== 'cell') {
    if (pr.kind === 'rotation') {
      const base = pr.cell && v.tiles[pr.cell] ? v.tiles[pr.cell] : v.pending ? { kind: v.pending.kind, region: v.pending.region, terrain: v.pending.terrain, ruin: v.pending.kind === 'ruin' ? 'ready' : null } : { kind: 'blank', region: 'forest' };
      html = `<div class="modal-bg bottom"><div class="modal"><h2>${esc(pr.text)}</h2>${v.pending ? `<p class="sub">${esc(v.pending.info.name)}: ${esc(v.pending.info.text)}</p>` : ''}
        <div class="rots">${pr.options.map((o) => `<button class="rot" data-act="resp" data-id="${esc(o.id)}" title="${esc(o.label)}">${previewSvg({ ...base, exits: o.exits })}</button>`).join('')}</div></div></div>`;
    } else if (pr.multi) {
      const n = st.multiSel.size; const ok = n >= pr.multi.min && n <= pr.multi.max;
      html = `<div class="modal-bg"><div class="modal"><h2>${esc(pr.text)}</h2><p class="sub">Choose ${pr.multi.min === pr.multi.max ? pr.multi.min : `${pr.multi.min} to ${pr.multi.max}`} (${n} selected)</p>
        <div class="opts">${pr.options.map((o) => `<button class="opt ${st.multiSel.has(o.id) ? 'sel' : ''}" data-act="multisel" data-id="${esc(o.id)}">${st.multiSel.has(o.id) ? '☑' : '☐'} ${esc(o.label)}</button>`).join('')}</div>
        <div style="text-align:right"><button class="btn gold" data-act="multiok" ${ok ? '' : 'disabled'}>Confirm</button></div></div></div>`;
    } else {
      html = `<div class="modal-bg"><div class="modal"><h2>${esc(pr.text)}</h2><div class="opts">${pr.options.map((o) => `<button class="opt" data-act="resp" data-id="${esc(o.id)}">${esc(o.label)}</button>`).join('')}</div></div></div>`;
    }
  }
  if (!pr || pr.hidden || pr.kind === 'cell') st.multiSel.clear();
  el.innerHTML = html;
}

// ------------------------------------------------------------------ input

$app.addEventListener('click', (e) => {
  const b = e.target.closest('[data-act]'); if (!b || b.disabled) return;
  const d = b.dataset; const v = st.view;
  switch (d.act) {
    case 'create': case 'join': {
      const name = document.getElementById('name').value.trim(); store.set('favor.name', name);
      if (d.act === 'create') send({ t: 'create', name });
      else {
        const code = document.getElementById('code').value.trim().toUpperCase();
        if (code.length !== 4) { toast('Enter the 4 letter room code.'); return; }
        send({ t: 'join', code, name });
      }
      break;
    }
    case 'copy': navigator.clipboard?.writeText(d.link).then(() => toast('Invite link copied', 'info'), () => toast(d.link, 'info')); break;
    case 'pick': send({ t: 'pick', char: st.lobby.players.find((p) => p.id === st.lobby.you).char === d.char ? null : d.char }); break;
    case 'start': send({ t: 'start' }); break;
    case 'leave': if (!v || v.phase === 'over' || confirm('Leave this game? You will not be able to rejoin.')) { send({ t: 'leave' }); } break;
    case 'lobby': send({ t: 'lobby' }); break;
    case 'side': st.sideOpen = !st.sideOpen; render(); break;
    case 'zoomin': st.cam.auto = false; st.cam.w = Math.max(250, st.cam.w * 0.8); render(); break;
    case 'zoomout': st.cam.auto = false; st.cam.w = Math.min(4000, st.cam.w * 1.25); render(); break;
    case 'recenter': st.cam.auto = true; render(); break;
    case 'delve': case 'settle': case 'attack': case 'boon': act({ type: d.act }); break;
    case 'end': act({ type: 'endTurn' }); break;
    case 'offer': st.localModal = 'offer'; st.offerSel.clear(); render(); break;
    case 'closemodal': st.localModal = null; render(); break;
    case 'offersel': st.offerSel.has(d.relic) ? st.offerSel.delete(d.relic) : st.offerSel.add(d.relic); render(); break;
    case 'offerok': act({ type: 'offer', relics: [...st.offerSel] }); st.localModal = null; st.offerSel.clear(); break;
    case 'card': act({ type: 'playCard', cardId: d.card }); break;
    case 'item': act({ type: 'useItem', itemId: d.item }); break;
    case 'resp': respond(d.id); break;
    case 'multisel': st.multiSel.has(d.id) ? st.multiSel.delete(d.id) : st.multiSel.add(d.id); render(); break;
    case 'multiok': respond([...st.multiSel]); st.multiSel.clear(); break;
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && mounted === 'home') document.querySelector('[data-act="join"]')?.click();
});

render();
connect();
