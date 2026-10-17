// Favor: Gods of Oethera rules engine.
// Pure, serializable game state. All randomness comes from state.rng.
// Anything that needs a player decision creates state.prompt and pauses the effect queue.
import { nextInt, shuffle } from './rng.js';
import { CHARACTERS } from './characters.js';
import { REGION_KEYS, REGIONS, TERRAIN } from './regions.js';
import { RELIC_LIST, RELICS } from './relics.js';
import { ACTION_CARDS, ACTION_BY_ID, GOD_CARDS, EVENT_CARDS, ITEMS, TRAP_TOKENS } from './cards.js';

export const DIRS = [[0, -1], [1, 0], [0, 1], [-1, 0]]; // N E S W
export const WIN_FAVOR = 10;
const BLANKS = { 2: 0, 3: 1, 4: 2, 5: 3, 6: 4 };
const COLORS = ['#e4572e', '#29a0b1', '#f2b134', '#7d5ba6', '#4caf50', '#e86a92'];

const opp = (d) => (d + 2) % 4;
const key = (x, y) => `${x},${y}`;
const xy = (c) => c.split(',').map(Number);
const step = (c, d) => { const [x, y] = xy(c); return key(x + DIRS[d][0], y + DIRS[d][1]); };
export const rotateExits = (e, r) => { const o = [false, false, false, false]; for (let d = 0; d < 4; d++) o[(d + r) % 4] = e[d]; return o; };
const clone = (o) => JSON.parse(JSON.stringify(o));
const cardDef = (id) => ACTION_BY_ID[id.split('#')[0]];

// ---------------------------------------------------------------- setup

function randomExits(s) {
  const n = nextInt(s, 10);
  const base = n < 3 ? [1, 0, 1, 0] : n < 6 ? [1, 1, 0, 0] : n < 9 ? [1, 1, 1, 0] : [1, 1, 1, 1];
  return rotateExits(base.map(Boolean), nextInt(s, 4));
}

function buildStack(s, region, blanks) {
  const mk = (kind, extra = {}) => ({ kind, region, exits: randomExits(s), ...extra });
  const list = [mk('ruin'), mk('ruin'), mk('event'), mk('warp'), mk('terrain', { terrain: 'pos' }), mk('terrain', { terrain: 'neg' })];
  for (let i = 0; i < blanks; i++) list.push(mk('blank'));
  return shuffle(s, list);
}

export function createGame({ players, seed = Date.now() }) {
  if (players.length < 2 || players.length > 6) throw new Error('2 to 6 players required');
  const s = {
    v: 1, rng: seed | 0, players: [], tiles: {}, stacks: {}, gates: [], settlements: {},
    decks: {}, traps: { bag: [], placed: {} }, banners: {}, turn: 0, step: 'start', phase: 'play',
    winner: null, queue: [], prompt: null, pending: null, pendingEnd: false, log: [], logN: 0,
  };
  const deck = (ids) => ({ draw: shuffle(s, ids), discard: [] });
  const actionIds = [];
  for (const c of ACTION_CARDS) for (let i = 1; i <= c.count; i++) actionIds.push(`${c.id}#${i}`);
  s.decks.god = deck(GOD_CARDS.map((c) => c.id));
  s.decks.action = deck(actionIds);
  s.decks.relic = deck(RELIC_LIST.map((r) => r.id));
  s.decks.event = deck(EVENT_CARDS.map((c) => c.id));
  s.traps.bag = [...TRAP_TOKENS];

  // Altar in the middle, a Settlement Tile two steps out on each side. The Tile between
  // them is revealed the first time someone steps off the Altar.
  s.tiles['0,0'] = { kind: 'altar', region: 'altar', exits: [true, true, true, true] };
  const order = shuffle(s, [...REGION_KEYS]);
  for (let d = 0; d < 4; d++) {
    const region = order[d];
    s.gates[d] = region;
    const cell = key(DIRS[d][0] * 2, DIRS[d][1] * 2);
    s.settlements[region] = cell;
    s.tiles[cell] = { kind: 'settlement', region, exits: [true, true, true, true] };
    s.banners[region] = null;
    s.stacks[region] = buildStack(s, region, BLANKS[players.length]);
  }

  players.forEach((pl, i) => {
    const ch = CHARACTERS[pl.char];
    s.players.push({
      id: pl.id, name: pl.name, char: pl.char, color: COLORS[i], seat: i,
      hearts: ch.hearts, favor: 0, energy: 4, hand: [], relics: [], items: [], pos: '0,0',
      stunned: false, boonReady: true, hexes: [], temp: {}, invisible: false,
      daily: { moved: false, attack: false, boon: false, discount: false },
    });
  });
  for (const p of s.players) drawActions(s, p, stat(s, p, 'wit'));
  s.turn = nextInt(s, s.players.length);
  log(s, `The Gods look down on Oethera. ${s.players[s.turn].name} goes first.`);
  startTurn(s);
  run(s);
  return s;
}

// ---------------------------------------------------------------- helpers

export const P = (s, id) => s.players.find((p) => p.id === id);
export const cur = (s) => s.players[s.turn];
function log(s, text) { s.log.push({ n: ++s.logN, text }); if (s.log.length > 300) s.log.shift(); }

function relicDefs(p) { return p.relics.map((id) => RELICS[id]); }
function hook(p, name) {
  let v = 0;
  for (const r of relicDefs(p)) { const h = r.hooks[name]; if (typeof h === 'number') v += h; else if (h) v = v || 1; }
  return v;
}
const advantage = (p, stat_) => relicDefs(p).some((r) => (r.hooks.advantage || []).includes(stat_));
export const has = (p, name) => p.hexes.includes(name) || !!p.temp[name];

export function maxHearts(s, p) {
  return CHARACTERS[p.char].hearts + (s.banners.mountains === p.id ? 1 : 0) + hook(p, 'maxHearts');
}
function recalcHearts(s, p, prevMax) {
  if (p.stunned) return;
  const m = maxHearts(s, p);
  p.hearts = m > prevMax ? p.hearts + (m - prevMax) : Math.min(p.hearts, m);
}

export function stat(s, p, name, flag) {
  let v = CHARACTERS[p.char][name];
  if ((name === 'wit' && s.banners.forest === p.id) || (name === 'fight' && s.banners.wasteland === p.id) || (name === 'charm' && s.banners.marshland === p.id)) v++;
  for (const r of relicDefs(p)) {
    v += r.mods[name] || 0;
    if (flag === 'settlement' && name === 'charm') v += r.hooks.settlementCharm || 0;
    if (flag === 'event') v += r.hooks.eventAll || 0;
  }
  if ((name === 'fight' && has(p, 'feeble')) || (name === 'charm' && has(p, 'jinx')) || (name === 'wit' && has(p, 'dullness'))) v--;
  return Math.max(0, v);
}

function playersFrom(s, pid) {
  const start = P(s, pid).seat;
  return s.players.map((_, i) => s.players[(start + i) % s.players.length]);
}

function tileAt(s, cell) { return s.tiles[cell]; }
function playersAt(s, cell) { return s.players.filter((p) => p.pos === cell); }
const connected = (s, cell, d) => {
  const a = s.tiles[cell]; const b = s.tiles[step(cell, d)];
  return !!(a && b && a.exits[d] && b.exits[opp(d)]);
};

// Opponents on my Tile or in a straight line of Connected Tiles.
function lineTargets(s, p, { ignoreInvis = false } = {}) {
  const found = new Set();
  const add = (cell) => { for (const o of playersAt(s, cell)) if (o.id !== p.id) found.add(o.id); };
  add(p.pos);
  for (let d = 0; d < 4; d++) {
    let cell = p.pos;
    while (connected(s, cell, d)) { cell = step(cell, d); add(cell); }
  }
  return [...found].map((id) => P(s, id)).filter((o) => !o.stunned && (ignoreInvis || !o.invisible));
}

function drawCard(s, name) {
  const d = s.decks[name];
  if (!d.draw.length) { d.draw = shuffle(s, d.discard); d.discard = []; }
  return d.draw.length ? d.draw.shift() : null;
}
function drawActions(s, p, n) { for (let i = 0; i < n; i++) { const c = drawCard(s, 'action'); if (c) p.hand.push(c); } }

function addFavor(s, pid, n) {
  const p = P(s, pid);
  p.favor += n;
  log(s, `${p.name} gains ${n} Favor (${p.favor}/${WIN_FAVOR}).`);
  if (p.favor >= WIN_FAVOR) win(s, p, `${p.name} has earned the Favor of the Gods!`);
}
function win(s, p, text) {
  if (s.phase === 'over') return;
  s.phase = 'over'; s.winner = p.id; s.queue = []; s.prompt = null;
  log(s, text);
}
function setBanner(s, region, pid) {
  const old = s.banners[region] ? P(s, s.banners[region]) : null;
  const prevOld = old && maxHearts(s, old);
  const nw = P(s, pid); const prevNew = maxHearts(s, nw);
  s.banners[region] = pid;
  if (old) recalcHearts(s, old, prevOld);
  recalcHearts(s, nw, prevNew);
  if (REGION_KEYS.every((r) => s.banners[r] === pid)) win(s, nw, `${nw.name} controls all four Settlement Banners!`);
}

function giveRelic(s, p, id) {
  const prev = maxHearts(s, p);
  p.relics.push(id);
  recalcHearts(s, p, prev);
  log(s, `${p.name} finds the Relic ${RELICS[id].name}.`);
}
function discardRelic(s, p, id) {
  const prev = maxHearts(s, p);
  p.relics.splice(p.relics.indexOf(id), 1);
  s.decks.relic.discard.push(id);
  recalcHearts(s, p, prev);
}

function heal(s, p, n) {
  if (p.stunned || n <= 0) return;
  const amt = n + hook(p, 'healBonus');
  const before = p.hearts;
  p.hearts = Math.min(maxHearts(s, p), p.hearts + amt);
  log(s, `${p.name} heals ${p.hearts - before} Heart${p.hearts - before === 1 ? '' : 's'}.`);
}

function dealDamage(s, targetId, n, byId, kind) {
  const t = P(s, targetId);
  if (t.stunned || n <= 0) return;
  n = Math.max(0, n - hook(t, 'dmgReduce'));
  if (kind === 'trap' && hook(t, 'trapImmune')) n = 0;
  if (n === 0) { log(s, `${t.name} takes no damage.`); return; }
  t.hearts = Math.max(0, t.hearts - n);
  log(s, `${t.name} takes ${n} damage.`);
  const by = byId && byId !== targetId ? P(s, byId) : null;
  if (by && hook(by, 'lifesteal')) heal(s, by, n);
  if (t.hearts > 0) return;
  const pf = t.relics.find((id) => RELICS[id].hooks.preventStun);
  if (pf) {
    discardRelic(s, t, pf);
    t.hearts = Math.min(2, maxHearts(s, t));
    log(s, `${t.name}'s Phoenix Feather burns away and saves them from being Stunned!`);
    return;
  }
  stun(s, t, by);
}

function stun(s, t, by) {
  t.stunned = true;
  t.hearts = 0;
  log(s, `${t.name} is Stunned!`);
  if (by) addFavor(s, by.id, 1);
  if (s.phase === 'over') return;
  const k = Math.floor(t.relics.length / 2);
  if (k > 0) pushFront(s, [{ op: 'stunDiscard', who: t.id, k }], { self: t.id, it: t.id }, null);
  if (cur(s).id === t.id) s.pendingEnd = true;
  s.queue = s.queue.filter((f) => f.tag !== `tile:${t.id}`);
}

// ---------------------------------------------------------------- queue / prompts

function pushFront(s, effs, ctx, tag) {
  s.queue.unshift(...effs.map((eff) => ({ eff, ctx: { ...ctx }, tag: tag ?? null })));
}

function ask(s, pid, text, options, cont, extra = {}) {
  s.prompt = { pid, text, kind: extra.kind || 'options', options, multi: extra.multi || null, cont };
}

export function run(s) {
  let guard = 0;
  while (guard++ < 5000) {
    if (s.phase === 'over') { s.queue = []; s.prompt = null; return; }
    if (s.prompt) return;
    if (s.queue.length) { exec(s, s.queue.shift()); continue; }
    if (s.pendingEnd) { endTurn(s); continue; }
    return;
  }
  throw new Error('effect loop did not settle');
}

function startTurn(s) {
  const p = cur(s);
  s.step = 'start';
  p.daily = { moved: false, attack: false, boon: false, discount: false };
  if (p.stunned) {
    p.stunned = false;
    p.hearts = maxHearts(s, p);
    log(s, `${p.name} gets back up with full Hearts.`);
  }
  p.invisible = false;
  if (p.hexes.includes('weary')) p.energy = Math.max(0, p.energy - 1);
  log(s, `--- ${p.name}'s turn ---`);
  const frames = [{ op: 'godCard' }];
  const sd = hook(p, 'startDamage');
  if (sd) frames.push({ op: 'damage', to: 'self', n: sd, kind: 'effect' });
  frames.push({ op: 'startDone' });
  pushFront(s, frames, { self: p.id, it: p.id }, null);
}

function endTurn(s) {
  const p = cur(s);
  s.pendingEnd = false;
  p.temp = {};
  p.energy = 4 + hook(p, 'energy');
  drawActions(s, p, Math.max(0, stat(s, p, 'wit') - p.hand.length) + hook(p, 'drawBonus'));
  p.hexes = [];
  s.turn = (s.turn + 1) % s.players.length;
  startTurn(s);
}

function num(s, ctx, n) {
  if (typeof n === 'number') return n;
  const me = P(s, ctx.self);
  if (typeof n === 'string') return stat(s, me, n);
  return Math.floor((stat(s, me, n.stat) + (n.add || 0)) * (n.mul || 1));
}
const who = (w, ctx) => (w === 'self' ? ctx.self : w === 'it' ? ctx.it || ctx.self : w === 'target' ? ctx.target : w);

function rollChallenge(s, p, statName, flag) {
  const value = stat(s, p, statName, flag);
  let roll = nextInt(s, 5);
  if (advantage(p, statName)) roll = Math.min(roll, nextInt(s, 5));
  const success = roll < value;
  log(s, `${p.name} rolls a ${roll} against ${statName} ${value}: ${success ? 'success' : 'failure'}.`);
  return success;
}

function discardActionCard(s, p, cid) {
  p.hand.splice(p.hand.indexOf(cid), 1);
  s.decks.action.discard.push(cid);
}

function exec(s, f) {
  const { eff, ctx, tag } = f;
  switch (eff.op) {
    case 'seq': pushFront(s, eff.do, ctx, tag); break;
    case 'startDone': s.step = 'actions'; if (cur(s).stunned) s.pendingEnd = true; break;
    case 'godCard': {
      const id = drawCard(s, 'god');
      const card = GOD_CARDS.find((c) => c.id === id);
      s.decks.god.discard.push(id);
      log(s, `${card.god} decrees "${card.name}": ${card.text}`);
      pushFront(s, clone(card.do), ctx, tag);
      break;
    }
    case 'each': {
      const frames = playersFrom(s, ctx.self).map((p) => ({ eff: { op: 'seq', do: eff.do }, ctx: { ...ctx, it: p.id }, tag: tag ?? null }));
      s.queue.unshift(...frames);
      break;
    }
    case 'damage': {
      let n = num(s, ctx, eff.n);
      if (eff.kind === 'attack' && n > 0) n += hook(P(s, ctx.self), 'atkBonus');
      dealDamage(s, who(eff.to, ctx), n, eff.kind === 'attack' ? ctx.self : null, eff.kind);
      break;
    }
    case 'damageLine': {
      const me = P(s, ctx.self);
      for (const t of lineTargets(s, me)) dealDamage(s, t.id, eff.n + hook(me, 'atkBonus'), me.id, 'attack');
      break;
    }
    case 'heal': heal(s, P(s, who(eff.to, ctx)), eff.n); break;
    case 'energy': { const p = P(s, who(eff.to, ctx)); p.energy = Math.max(0, p.energy + eff.n); break; }
    case 'doubleEnergy': { const p = P(s, who(eff.to || 'self', ctx)); p.energy *= 2; log(s, `${p.name} doubles their Energy to ${p.energy}.`); break; }
    case 'favor': addFavor(s, who(eff.to, ctx), eff.n); break;
    case 'draw': drawActions(s, P(s, who(eff.to, ctx)), eff.n); break;
    case 'relic': {
      const p = P(s, who(eff.to, ctx));
      for (let i = 0; i < eff.n; i++) { const id = drawCard(s, 'relic'); if (id) giveRelic(s, p, id); }
      break;
    }
    case 'item': { const p = P(s, who(eff.to, ctx)); p.items.push(eff.id); log(s, `${p.name} gains the Item ${ITEMS[eff.id].name}.`); break; }
    case 'status': {
      const p = P(s, who(eff.to, ctx));
      if (eff.name === 'invisible') p.invisible = true; else p.temp[eff.name] = true;
      log(s, `${p.name} is ${eff.name}.`);
      break;
    }
    case 'hex': {
      const p = P(s, who(eff.to, ctx));
      if (!p.hexes.includes(eff.name)) { p.hexes.push(eff.name); log(s, `${p.name} is hexed: ${eff.name}.`); }
      break;
    }
    case 'challenge': {
      const p = P(s, ctx.it || ctx.self);
      const ok = rollChallenge(s, p, eff.stat, ctx.flag);
      pushFront(s, (ok ? eff.success : eff.failure) || [], ctx, tag);
      break;
    }
    case 'choose': {
      const opts = eff.options.map((o, i) => ({ id: String(i), label: o.label }));
      ask(s, who(eff.who, ctx), eff.text || 'Choose one', opts, { type: 'choose', options: eff.options.map((o, i) => ({ id: String(i), do: o.do })), ctx, tag });
      break;
    }
    case 'pickPlayer': {
      const me = P(s, ctx.self);
      let c;
      if (eff.filter === 'line') c = lineTargets(s, me, { ignoreInvis: eff.invis });
      else if (eff.filter === 'same') c = playersAt(s, me.pos).filter((o) => o.id !== me.id && !o.stunned && (eff.invis || !o.invisible));
      else if (eff.filter === 'anyStunnedOk') c = s.players.filter((o) => o.id !== me.id);
      else c = s.players.filter((o) => o.id !== me.id && !o.stunned && (eff.invis || !o.invisible));
      if (eff.hex) c = c.filter((o) => !has(o, eff.hex));
      if (eff.hasRelics) c = c.filter((o) => o.relics.length > 0);
      if (!c.length) { log(s, 'There is no valid target.'); break; }
      if (c.length === 1) { pushFront(s, eff.then, { ...ctx, target: c[0].id }, tag); break; }
      ask(s, me.id, 'Choose a target', c.map((o) => ({ id: o.id, label: o.name })), { type: 'bind', bind: 'target', then: eff.then, ctx, tag });
      break;
    }
    case 'pickCell': {
      const cells = cellsFor(s, eff.filter, P(s, ctx.self));
      if (!cells.length) { log(s, 'There is no valid Tile.'); break; }
      ask(s, ctx.self, eff.text || 'Choose a Tile', cells.map((c) => ({ id: c, cell: c, label: c })), { type: 'bind', bind: 'cell', then: eff.then, ctx, tag }, { kind: 'cell' });
      break;
    }
    case 'teleport': {
      const p = P(s, who(eff.to, ctx));
      let dest;
      if (eff.where === 'altar') dest = '0,0';
      else if (eff.where === 'settlement') dest = s.settlements[s.tiles[p.pos].region];
      else dest = ctx.cell;
      if (!dest || dest === p.pos) break;
      p.pos = dest;
      log(s, `${p.name} teleports.`);
      if (!p.stunned) afterMove(s, p.id, false);
      break;
    }
    case 'swapPlaces': {
      const a = P(s, ctx.self); const b = P(s, ctx.target);
      [a.pos, b.pos] = [b.pos, a.pos];
      log(s, `${a.name} and ${b.name} switch places.`);
      if (!a.stunned) afterMove(s, a.id, false);
      if (!b.stunned) afterMove(s, b.id, false);
      break;
    }
    case 'placeTrap':
      if (!s.traps.bag.length) { log(s, 'The Trap Bag is empty.'); break; }
      pushFront(s, [{ op: 'pickCell', filter: 'trapSpot', text: 'Place a Trap on an unoccupied Tile', then: [{ op: 'putTrap' }] }], ctx, tag);
      break;
    case 'putTrap': {
      const v = s.traps.bag.splice(nextInt(s, s.traps.bag.length), 1)[0];
      s.traps.placed[ctx.cell] = v;
      log(s, `${P(s, ctx.self).name} sets a Trap.`);
      break;
    }
    case 'trapCheck': {
      const p = P(s, ctx.it || ctx.self);
      const v = s.traps.placed[p.pos];
      if (v === undefined) break;
      delete s.traps.placed[p.pos];
      s.traps.bag.push(v);
      log(s, `${p.name} triggers a Trap worth ${v} damage!`);
      dealDamage(s, p.id, v, null, 'trap');
      break;
    }
    case 'eventDraw': {
      const p = P(s, ctx.it || ctx.self);
      const id = drawCard(s, 'event');
      if (!id) break;
      const card = EVENT_CARDS.find((c) => c.id === id);
      s.decks.event.discard.push(id);
      log(s, `Event: ${card.name}. ${card.text}`);
      const ectx = { ...ctx, flag: 'event' };
      if (hook(p, 'eventSkip')) {
        ask(s, p.id, `Event: ${card.name}`, [{ id: '0', label: 'Resolve the Event' }, { id: '1', label: 'Discard it (Relic power)' }],
          { type: 'choose', options: [{ id: '0', do: clone(card.do) }, { id: '1', do: [] }], ctx: ectx, tag });
      } else pushFront(s, clone(card.do), ectx, tag);
      break;
    }
    case 'replenish': {
      if (eff.scope === 'all') { for (const t of Object.values(s.tiles)) if (t.ruin === 'spent') t.ruin = 'ready'; log(s, 'All Ruins are Replenished.'); break; }
      const regs = REGION_KEYS.filter((r) => Object.values(s.tiles).some((t) => t.region === r && t.ruin === 'spent'));
      if (!regs.length) { log(s, 'There are no spent Ruins to Replenish.'); break; }
      if (regs.length === 1) { pushFront(s, [{ op: 'replenishRegion' }], { ...ctx, region: regs[0] }, tag); break; }
      ask(s, ctx.self, 'Replenish the Ruins of which Region?', regs.map((r) => ({ id: r, label: REGIONS[r].name })), { type: 'bind', bind: 'region', then: [{ op: 'replenishRegion' }], ctx, tag });
      break;
    }
    case 'replenishRegion':
      for (const t of Object.values(s.tiles)) if (t.region === ctx.region && t.ruin === 'spent') t.ruin = 'ready';
      log(s, `The Ruins of the ${REGIONS[ctx.region].name} are Replenished.`);
      break;
    case 'rotateTile': pushFront(s, [{ op: 'pickCell', filter: 'rotatable', text: 'Choose a Tile to rotate', then: [{ op: 'rotateChoose' }] }], ctx, tag); break;
    case 'rotateChoose': {
      const t = s.tiles[ctx.cell];
      const opts = rotationOptions(s, ctx.cell);
      ask(s, ctx.self, 'Choose a new orientation', opts.map((o) => ({ id: String(o.r), exits: o.exits, label: `Rotate ${o.r * 90}°` })), { type: 'rotateTile', cell: ctx.cell, base: t.exits }, { kind: 'rotation' });
      break;
    }
    case 'discardChoose': {
      const p = P(s, who(eff.to, ctx));
      if (!p.hand.length) break;
      if (p.hand.length <= eff.n) { for (const c of [...p.hand]) discardActionCard(s, p, c); log(s, `${p.name} discards their hand.`); break; }
      ask(s, p.id, `Discard ${eff.n} Action Card${eff.n > 1 ? 's' : ''}`, p.hand.map((c) => ({ id: c, label: cardDef(c).name })), { type: 'discardCards', pid: p.id }, { multi: { min: eff.n, max: eff.n } });
      break;
    }
    case 'discardAny': {
      const p = P(s, who(eff.to, ctx));
      if (!p.hand.length) break;
      ask(s, p.id, 'Discard any number of Action Cards, then draw that many', p.hand.map((c) => ({ id: c, label: cardDef(c).name })), { type: 'discardAny', pid: p.id }, { multi: { min: 0, max: p.hand.length } });
      break;
    }
    case 'stunDiscard': {
      const p = P(s, eff.who);
      const k = Math.min(eff.k, p.relics.length);
      if (k < 1) break;
      if (p.relics.length <= k) { for (const r of [...p.relics]) discardRelic(s, p, r); break; }
      ask(s, p.id, `You were Stunned. Discard ${k} Relic${k > 1 ? 's' : ''}`, p.relics.map((r) => ({ id: r, label: RELICS[r].name })), { type: 'stunDiscard', pid: p.id }, { multi: { min: k, max: k } });
      break;
    }
    case 'lowestRelic': {
      const score = (p) => p.favor + p.relics.length;
      const min = Math.min(...s.players.map(score));
      const frames = playersFrom(s, ctx.self).filter((p) => score(p) === min).map((p) => ({ eff: { op: 'relic', to: p.id, n: 1 }, ctx: { ...ctx }, tag: tag ?? null }));
      s.queue.unshift(...frames);
      break;
    }
    case 'claimBanner': {
      const p = P(s, ctx.self);
      const region = s.tiles[p.pos].region;
      setBanner(s, region, p.id);
      log(s, `${p.name} captures the ${REGIONS[region].name} Banner!`);
      if (s.phase !== 'over') addFavor(s, p.id, 1);
      break;
    }
    case 'pickRelic': {
      const owner = P(s, who(eff.whose, ctx));
      ask(s, ctx.self, eff.text, owner.relics.map((r) => ({ id: r, label: RELICS[r].name })), { type: 'bind', bind: eff.bind, then: eff.then, ctx, tag });
      break;
    }
    case 'swapRelics': {
      const a = P(s, ctx.self); const b = P(s, ctx.target);
      const pa = maxHearts(s, a); const pb = maxHearts(s, b);
      a.relics[a.relics.indexOf(ctx.myRelic)] = ctx.theirRelic;
      b.relics[b.relics.indexOf(ctx.theirRelic)] = ctx.myRelic;
      recalcHearts(s, a, pa); recalcHearts(s, b, pb);
      log(s, `${a.name} swaps ${RELICS[ctx.myRelic].name} for ${b.name}'s ${RELICS[ctx.theirRelic].name}.`);
      break;
    }
    default: throw new Error(`unknown op ${eff.op}`);
  }
}

function resolvePrompt(s, answer) {
  const pr = s.prompt; const c = pr.cont;
  s.prompt = null;
  switch (c.type) {
    case 'bind': pushFront(s, c.then, { ...c.ctx, [c.bind]: answer }, c.tag); break;
    case 'choose': pushFront(s, c.options.find((o) => o.id === answer).do, c.ctx, c.tag); break;
    case 'place': placeRevealed(s, Number(answer)); break;
    case 'rotateTile': {
      const t = s.tiles[c.cell];
      t.exits = rotateExits(c.base, Number(answer));
      log(s, 'A Tile is rotated.');
      break;
    }
    case 'stunDiscard': { const p = P(s, c.pid); for (const r of answer) discardRelic(s, p, r); log(s, `${p.name} discards ${answer.length} Relic(s).`); break; }
    case 'discardCards': { const p = P(s, c.pid); for (const id of answer) discardActionCard(s, p, id); break; }
    case 'discardAny': { const p = P(s, c.pid); for (const id of answer) discardActionCard(s, p, id); drawActions(s, p, answer.length); break; }
    default: throw new Error('bad prompt cont');
  }
}

// ---------------------------------------------------------------- board

function cellsFor(s, filter, me) {
  const cells = Object.keys(s.tiles);
  if (filter === 'tele') { const ok = reachable(s.tiles); return cells.filter((c) => c !== me.pos && ok.has(c)); }
  if (filter === 'trapSpot') return cells.filter((c) => s.tiles[c].kind !== 'altar' && s.traps.placed[c] === undefined && !playersAt(s, c).length);
  if (filter === 'rotatable') return cells.filter((c) => !['altar', 'settlement'].includes(s.tiles[c].kind) && !playersAt(s, c).length && rotationOptions(s, c).length);
  return [];
}

function reachable(tiles) {
  const seen = new Set(['0,0']); const stack = ['0,0'];
  while (stack.length) {
    const c = stack.pop();
    for (let d = 0; d < 4; d++) {
      const n = step(c, d);
      if (seen.has(n) || !tiles[n] || !tiles[c].exits[d] || !tiles[n].exits[opp(d)]) continue;
      seen.add(n); stack.push(n);
    }
  }
  return seen;
}

// A rotation is fine as long as every Tile that could reach the Altar before still can.
function rotationOptions(s, cell) {
  const t = s.tiles[cell]; const out = []; const seen = new Set([t.exits.join()]);
  const before = reachable(s.tiles);
  for (let r = 1; r < 4; r++) {
    const exits = rotateExits(t.exits, r);
    if (seen.has(exits.join())) continue;
    seen.add(exits.join());
    const after = reachable({ ...s.tiles, [cell]: { ...t, exits } });
    if ([...before].every((c) => after.has(c))) out.push({ r, exits });
  }
  return out;
}

function revealRegion(s, cell, d) {
  const t = s.tiles[cell];
  return t.kind === 'altar' ? s.gates[d] : t.region;
}

export function moveOptions(s, p) {
  const t = s.tiles[p.pos]; const opts = []; const seen = new Set();
  const add = (o) => { if (!seen.has(o.cell)) { seen.add(o.cell); opts.push(o); } };
  for (let d = 0; d < 4; d++) {
    if (!t.exits[d]) continue;
    const cell = step(p.pos, d); const nt = s.tiles[cell];
    if (nt) { if (nt.exits[opp(d)]) add({ cell, dir: d, kind: 'move' }); }
    else {
      const region = revealRegion(s, p.pos, d);
      if (s.stacks[region].length) add({ cell, dir: d, kind: 'reveal', region });
    }
  }
  if (t.kind === 'warp') {
    for (const [c, o] of Object.entries(s.tiles)) if (c !== p.pos && (o.kind === 'warp' || o.kind === 'altar')) add({ cell: c, kind: 'warp' });
  }
  return opts;
}

function moveCost(s, p) {
  let c = 1 + (has(p, 'cold') ? 1 : 0);
  if (!p.daily.moved) {
    c += hook(p, 'moveSurcharge');
    if (hook(p, 'firstMoveFree')) c = Math.max(0, c - 1);
  }
  return c;
}

function startReveal(s, p, opt) {
  const tile = s.stacks[opt.region].shift();
  const gate = s.tiles[p.pos].kind === 'altar';
  const seen = new Set(); let rots = [];
  for (let r = 0; r < 4; r++) {
    const exits = rotateExits(tile.exits, r);
    if (!exits[opp(opt.dir)] || seen.has(exits.join())) continue; // must connect to where you came from
    seen.add(exits.join()); rots.push({ id: String(r), exits });
  }
  if (gate) {
    // the first Tile off the Altar must also reach the Settlement beyond it
    const both = rots.filter((o) => o.exits[opt.dir]);
    if (both.length) rots = both;
    else rots = rots.map((o) => ({ ...o, exits: o.exits.map((e, d) => e || d === opt.dir) }));
  }
  s.pending = { tile, cell: opt.cell, pid: p.id, rots };
  log(s, `${p.name} reveals a ${REGIONS[opt.region].name} Tile.`);
  if (rots.length === 1) placeRevealed(s, Number(rots[0].id));
  else ask(s, p.id, 'Orient the new Tile', rots.map((o) => ({ id: o.id, exits: o.exits, label: `Rotate ${o.id * 90}°` })), { type: 'place' }, { kind: 'rotation' });
}

function placeRevealed(s, r) {
  const { tile, cell, pid } = s.pending;
  tile.exits = s.pending.rots.find((o) => o.id === String(r)).exits;
  if (tile.kind === 'ruin') tile.ruin = 'ready';
  s.tiles[cell] = tile;
  s.pending = null;
  const p = P(s, pid);
  p.pos = cell;
  afterMove(s, pid, true);
}

function afterMove(s, pid, basic) {
  const p = P(s, pid); const t = s.tiles[p.pos];
  const frames = [];
  if (s.traps.placed[p.pos] !== undefined) frames.push({ op: 'trapCheck' });
  if (t.kind === 'event') frames.push({ op: 'eventDraw' });
  if (t.kind === 'terrain') frames.push(...clone(TERRAIN[t.region][t.terrain].do));
  if (basic && has(p, 'poison')) frames.push({ op: 'damage', to: 'it', n: 1, kind: 'effect' });
  if (frames.length) pushFront(s, frames, { self: pid, it: pid }, `tile:${pid}`);
}

// ---------------------------------------------------------------- legal actions

function needsOk(s, p, needs) {
  if (!needs) return true;
  const [kind, arg] = needs.split(':');
  switch (kind) {
    case 'line': return lineTargets(s, p).length > 0;
    case 'same': return playersAt(s, p.pos).some((o) => o.id !== p.id && !o.stunned && !o.invisible);
    case 'anyOpp': return s.players.some((o) => o.id !== p.id && !o.stunned && !o.invisible && !has(o, arg));
    case 'notAltar': return s.tiles[p.pos].kind !== 'altar';
    case 'tele': return Object.keys(s.tiles).length > 1;
    case 'trap': return s.traps.bag.length > 0 && cellsFor(s, 'trapSpot', p).length > 0;
    case 'ruinSpent': return Object.values(s.tiles).some((t) => t.ruin === 'spent');
    default: return true;
  }
}

function cardCost(s, p, def) {
  if (def.cost > 0 && !p.daily.discount && hook(p, 'discount')) return Math.max(0, def.cost - hook(p, 'discount'));
  return def.cost;
}

function boonUsable(s, p) {
  if (!p.boonReady) return false;
  switch (p.char) {
    case 'seridian': return s.tiles[p.pos].kind !== 'altar';
    case 'sapling': return needsOk(s, p, 'trap');
    case 'human': return lineTargets(s, p, { ignoreInvis: true }).length > 0;
    case 'abutian': return p.relics.length > 0 && s.players.some((o) => o.id !== p.id && o.relics.length > 0);
    case 'attuned': return s.players.length > 1;
    default: return true;
  }
}

const BOONS = {
  seridian: () => [{ op: 'teleport', to: 'self', where: 'settlement' }],
  sapling: () => [{ op: 'placeTrap' }],
  human: () => [{ op: 'pickPlayer', filter: 'line', invis: true, then: [{ op: 'damage', to: 'target', n: 2, kind: 'attack' }] }],
  abutian: () => [{
    op: 'pickPlayer', filter: 'anyStunnedOk', hasRelics: true, then: [{
      op: 'pickRelic', whose: 'self', bind: 'myRelic', text: 'Choose one of your Relics to give', then: [{
        op: 'pickRelic', whose: 'target', bind: 'theirRelic', text: 'Choose a Relic to take', then: [{ op: 'swapRelics' }],
      }],
    }],
  }],
  geodyte: () => [{ op: 'heal', to: 'self', n: 3 }, { op: 'discardAny', to: 'self' }],
  attuned: () => [{ op: 'pickPlayer', filter: 'anyStunnedOk', then: [{ op: 'swapPlaces' }] }],
};

export function legalActions(s, pid) {
  if (s.phase !== 'play' || s.prompt || s.pendingEnd || cur(s).id !== pid || s.step !== 'actions') return [];
  const p = cur(s); const out = []; const t = s.tiles[p.pos];
  const cost = moveCost(s, p);
  if (p.energy >= cost) for (const o of moveOptions(s, p)) out.push({ type: 'move', cell: o.cell, kind: o.kind, cost, ...(o.kind === 'reveal' ? { region: o.region } : {}) });
  if (p.energy >= 1) {
    if (t.ruin === 'ready') out.push({ type: 'delve' });
    if (t.kind === 'altar' && p.relics.length) out.push({ type: 'offer' });
    if (t.kind === 'settlement' && s.banners[t.region] !== p.id) out.push({ type: 'settle' });
    if (!p.daily.attack && playersAt(s, p.pos).some((o) => o.id !== p.id && !o.stunned)) out.push({ type: 'attack' });
  }
  if (boonUsable(s, p)) out.push({ type: 'boon' });
  if (!has(p, 'silenced')) {
    for (const cid of p.hand) {
      const def = cardDef(cid);
      if (cardCost(s, p, def) <= p.energy && needsOk(s, p, def.needs)) out.push({ type: 'playCard', cardId: cid, cost: cardCost(s, p, def) });
    }
  }
  for (const [i, id] of p.items.entries()) out.push({ type: 'useItem', itemId: id, index: i });
  out.push({ type: 'endTurn' });
  return out;
}

// ---------------------------------------------------------------- actions

export function applyAction(s, pid, a) {
  const err = (error) => ({ ok: false, error });
  if (s.phase !== 'play') return err('The game is over.');
  if (a.type === 'respond') {
    const pr = s.prompt;
    if (!pr || pr.pid !== pid) return err('Nothing for you to answer.');
    const ids = pr.options.map((o) => o.id);
    if (pr.multi) {
      const ans = Array.isArray(a.answer) ? a.answer : [];
      if (new Set(ans).size !== ans.length || ans.length < pr.multi.min || ans.length > pr.multi.max || ans.some((x) => !ids.includes(x))) return err('Invalid selection.');
    } else if (typeof a.answer !== 'string' || !ids.includes(a.answer)) return err('Invalid choice.');
    resolvePrompt(s, a.answer);
    run(s);
    return { ok: true };
  }
  if (s.prompt) return err('A decision is pending.');
  const p = cur(s);
  if (p.id !== pid) return err('It is not your turn.');
  if (s.step !== 'actions') return err('Please wait.');
  const legal = legalActions(s, pid);
  const ctx = { self: pid, it: pid };

  if (a.type === 'offer') {
    const ids = Array.isArray(a.relics) ? a.relics : [];
    if (!legal.some((l) => l.type === 'offer') || !ids.length || new Set(ids).size !== ids.length || ids.some((id) => !p.relics.includes(id))) return err('You cannot offer that.');
    p.energy -= 1;
    for (const id of ids) discardRelic(s, p, id);
    log(s, `${p.name} offers ${ids.length} Relic${ids.length > 1 ? 's' : ''} to the Gods.`);
    p.boonReady = true;
    addFavor(s, pid, ids.length);
    run(s);
    return { ok: true };
  }

  const match = legal.find((l) => l.type === a.type && (a.cell === undefined || l.cell === a.cell) && (a.cardId === undefined || l.cardId === a.cardId) && (a.itemId === undefined || l.itemId === a.itemId));
  if (!match) return err('That is not allowed right now.');

  switch (a.type) {
    case 'move': {
      const opt = moveOptions(s, p).find((o) => o.cell === a.cell);
      p.energy -= match.cost;
      p.daily.moved = true;
      if (opt.kind === 'reveal') startReveal(s, p, opt);
      else { p.pos = opt.cell; afterMove(s, pid, true); }
      break;
    }
    case 'delve':
      p.energy -= 1; s.tiles[p.pos].ruin = 'spent';
      log(s, `${p.name} delves into the Ruins.`);
      pushFront(s, [{ op: 'relic', to: 'self', n: 1 }], ctx, null);
      break;
    case 'settle':
      p.energy -= 1;
      pushFront(s, [{ op: 'challenge', stat: 'charm', success: [{ op: 'claimBanner' }], failure: [] }], { ...ctx, flag: 'settlement' }, null);
      break;
    case 'attack':
      p.energy -= 1; p.daily.attack = true;
      pushFront(s, [{ op: 'pickPlayer', filter: 'same', invis: true, then: [{ op: 'damage', to: 'target', n: 'fight', kind: 'attack' }] }], ctx, null);
      break;
    case 'boon':
      p.boonReady = false;
      log(s, `${p.name} uses their Boon: ${CHARACTERS[p.char].boon.name}.`);
      pushFront(s, BOONS[p.char](), ctx, null);
      break;
    case 'playCard': {
      const def = cardDef(a.cardId);
      p.energy -= match.cost;
      if (def.cost > 0 && match.cost < def.cost) p.daily.discount = true;
      discardActionCard(s, p, a.cardId);
      log(s, `${p.name} plays ${def.name}.`);
      pushFront(s, clone(def.do), ctx, null);
      break;
    }
    case 'useItem': {
      const idx = p.items.indexOf(a.itemId);
      p.items.splice(idx, 1);
      log(s, `${p.name} uses ${ITEMS[a.itemId].name}.`);
      pushFront(s, clone(ITEMS[a.itemId].do), ctx, null);
      break;
    }
    case 'endTurn': s.pendingEnd = true; break;
  }
  run(s);
  return { ok: true };
}

// ---------------------------------------------------------------- views

export function tileInfo(t) {
  if (t.kind === 'terrain') { const d = TERRAIN[t.region][t.terrain]; return { name: d.name, text: d.text }; }
  if (t.kind === 'event') return { name: 'Event Tile', text: 'Draw an Event Card each time you move onto this Tile.' };
  if (t.kind === 'ruin') return { name: 'Ruins', text: t.ruin === 'ready' ? 'Delve here (1 Energy) to find a Relic.' : 'These Ruins have been picked clean until Replenished.' };
  if (t.kind === 'warp') return { name: 'Warp Tile', text: 'Move between revealed Warp Tiles or to the Altar.' };
  if (t.kind === 'settlement') return { name: `${REGIONS[t.region].name} Settlement`, text: `Make a Settlement roll (1 Energy, Charm Challenge) to capture the Banner (${REGIONS[t.region].banner}).` };
  if (t.kind === 'altar') return { name: 'The Altar', text: 'Offer Relics to the Gods here for 1 Favor each.' };
  return { name: 'Open Ground', text: 'Nothing special.' };
}

export function viewFor(s, pid) {
  const me = P(s, pid);
  const tiles = {};
  for (const [c, t] of Object.entries(s.tiles)) tiles[c] = { kind: t.kind, region: t.region, exits: t.exits, ruin: t.ruin || null, terrain: t.terrain || null, trap: s.traps.placed[c] !== undefined, info: tileInfo(t) };
  const players = s.players.map((p) => ({
    id: p.id, name: p.name, char: p.char, color: p.color, seat: p.seat, hearts: p.hearts, maxHearts: maxHearts(s, p), favor: p.favor,
    energy: p.energy, handCount: p.hand.length, relics: p.relics, items: p.items, pos: p.pos, stunned: p.stunned, boonReady: p.boonReady,
    invisible: p.invisible, statuses: [...new Set([...p.hexes, ...Object.keys(p.temp)])],
    stats: { fight: stat(s, p, 'fight'), charm: stat(s, p, 'charm'), wit: stat(s, p, 'wit') },
    banners: REGION_KEYS.filter((r) => s.banners[r] === p.id),
  }));
  let prompt = null;
  if (s.prompt) {
    prompt = s.prompt.pid === pid
      ? { pid: s.prompt.pid, text: s.prompt.text, kind: s.prompt.kind, options: s.prompt.options, multi: s.prompt.multi, cell: s.prompt.cont.cell || null }
      : { pid: s.prompt.pid, text: s.prompt.text, hidden: true };
  }
  return {
    me: pid, phase: s.phase, winner: s.winner, turn: cur(s).id, step: s.step, players, tiles,
    gates: s.gates, settlements: s.settlements, banners: s.banners,
    hand: me ? me.hand.map((id) => { const d = cardDef(id); return { id, name: d.name, type: d.type, cost: d.cost, text: d.text }; }) : [],
    pending: s.pending ? { cell: s.pending.cell, kind: s.pending.tile.kind, region: s.pending.tile.region, terrain: s.pending.tile.terrain || null, info: tileInfo(s.pending.tile) } : null,
    prompt, legal: legalActions(s, pid),
    stacks: Object.fromEntries(REGION_KEYS.map((r) => [r, s.stacks[r].length])),
    decks: { action: s.decks.action.draw.length, relic: s.decks.relic.draw.length, god: s.decks.god.draw.length, event: s.decks.event.draw.length },
    trapBag: s.traps.bag.length,
    log: s.log.slice(-80),
  };
}
