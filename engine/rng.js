// Tiny seeded PRNG (mulberry32). The seed lives in game state so a game is
// fully serializable and reproducible.
export function nextInt(state, n) {
  state.rng = (state.rng + 0x6d2b79f5) | 0;
  let t = Math.imul(state.rng ^ (state.rng >>> 15), 1 | state.rng);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  const r = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  return Math.floor(r * n);
}

export function shuffle(state, arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = nextInt(state, i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
