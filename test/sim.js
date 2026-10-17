// Plays many random games with random-but-legal moves and checks invariants.
// Usage: node test/sim.js [games] [seed]
import assert from 'node:assert/strict';
import { createGame, applyAction, legalActions, viewFor, P, cur, maxHearts, WIN_FAVOR } from '../engine/engine.js';
import { CHARACTER_KEYS } from '../engine/characters.js';
import { REGION_KEYS } from '../engine/regions.js';

const games = Number(process.argv[2] || 300);
let seed = Number(process.argv[3] || 1);
const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const pick = (a) => a[Math.floor(rnd() * a.length)];

function checkInvariants(s) {
  const cells = Object.keys(s.tiles);
  assert.equal(cells.filter((c) => s.tiles[c].kind === 'altar').length, 1);
  for (const p of s.players) {
    assert.ok(s.tiles[p.pos], `player ${p.name} is on a missing tile ${p.pos}`);
    assert.ok(p.energy >= 0 && Number.isFinite(p.energy), 'energy');
    assert.ok(p.hearts >= 0 && p.hearts <= maxHearts(s, p), `hearts ${p.hearts}/${maxHearts(s, p)}`);
    assert.ok(p.favor >= 0 && (s.phase === 'over' || p.favor < WIN_FAVOR), `favor ${p.favor}`);
    assert.equal(p.stunned, p.hearts === 0, `stun/hearts mismatch for ${p.name}: ${p.hearts} ${p.stunned}`);
    assert.equal(new Set(p.hexes).size, p.hexes.length);
  }
  // every card is in exactly one place
  const relics = [...s.decks.relic.draw, ...s.decks.relic.discard, ...s.players.flatMap((p) => p.relics)];
  assert.equal(relics.length, 36);
  assert.equal(new Set(relics).size, 36);
  const actions = [...s.decks.action.draw, ...s.decks.action.discard, ...s.players.flatMap((p) => p.hand)];
  assert.equal(actions.length, 60);
  assert.equal(new Set(actions).size, 60);
  const traps = s.traps.bag.length + Object.keys(s.traps.placed).length;
  assert.equal(traps, 16);
  for (const r of REGION_KEYS) assert.ok(s.banners[r] === null || P(s, s.banners[r]));
  // all tiles connected to the altar
  const seen = new Set(['0,0']); const st = ['0,0'];
  const D = [[0, -1], [1, 0], [0, 1], [-1, 0]];
  while (st.length) {
    const c = st.pop(); const [x, y] = c.split(',').map(Number);
    for (let d = 0; d < 4; d++) {
      const n = `${x + D[d][0]},${y + D[d][1]}`;
      if (!seen.has(n) && s.tiles[n] && s.tiles[c].exits[d] && s.tiles[n].exits[(d + 2) % 4]) { seen.add(n); st.push(n); }
    }
  }
  for (const c of cells) if (s.tiles[c].kind !== 'settlement') assert.ok(seen.has(c), `tile ${c} cut off from the altar`);
}

const stats = { finished: 0, favorWins: 0, bannerWins: 0, turns: 0, maxTurns: 0, actions: {} };
for (let g = 0; g < games; g++) {
  const n = 2 + Math.floor(rnd() * 5);
  const chars = [...CHARACTER_KEYS].sort(() => rnd() - 0.5).slice(0, n);
  const s = createGame({ players: chars.map((c, i) => ({ id: `p${i}`, name: `P${i}-${c}`, char: c })), seed: Math.floor(rnd() * 1e9) });
  let steps = 0; let turns = 0; let lastTurn = null;
  while (s.phase === 'play' && steps++ < 6000) {
    checkInvariants(s);
    if (cur(s).id !== lastTurn) { lastTurn = cur(s).id; turns++; }
    let res;
    if (s.prompt) {
      const pr = s.prompt; const ids = pr.options.map((o) => o.id);
      let answer;
      if (pr.multi) {
        const k = pr.multi.min + Math.floor(rnd() * (pr.multi.max - pr.multi.min + 1));
        answer = [...ids].sort(() => rnd() - 0.5).slice(0, k);
      } else answer = pick(ids);
      res = applyAction(s, pr.pid, { type: 'respond', answer });
    } else {
      const legal = legalActions(s, cur(s).id);
      assert.ok(legal.length, 'no legal actions');
      const nonEnd = legal.filter((l) => l.type !== 'endTurn');
      let a = rnd() < 0.12 || !nonEnd.length ? legal.find((l) => l.type === 'endTurn') : pick(nonEnd);
      stats.actions[a.type] = (stats.actions[a.type] || 0) + 1;
      if (a.type === 'offer') {
        const p = cur(s);
        a = { type: 'offer', relics: p.relics.filter(() => rnd() < 0.7) };
        if (!a.relics.length) a.relics = [p.relics[0]];
      }
      res = applyAction(s, cur(s).id, a);
    }
    assert.ok(res.ok, `action rejected: ${res.error}`);
    // views must serialize and not leak other players' hands
    if (steps % 25 === 0) {
      const v = viewFor(s, s.players[0].id);
      JSON.stringify(v);
      assert.ok(!('hand' in v.players[1]));
    }
  }
  checkInvariants(s);
  JSON.parse(JSON.stringify(s)); // state stays serializable
  if (s.phase === 'over') {
    stats.finished++;
    const w = P(s, s.winner);
    if (w.favor >= WIN_FAVOR) stats.favorWins++; else stats.bannerWins++;
    stats.turns += turns; stats.maxTurns = Math.max(stats.maxTurns, turns);
  }
}
console.log(`games: ${games}, finished: ${stats.finished}, favor wins: ${stats.favorWins}, banner wins: ${stats.bannerWins}`);
console.log(`avg turns (finished): ${(stats.turns / Math.max(1, stats.finished)).toFixed(1)}, max: ${stats.maxTurns}`);
console.log('action mix:', stats.actions);
assert.ok(stats.finished > games * 0.5, 'too few random games finished');
console.log('OK');
