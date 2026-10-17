// SVG rendering for the board. Pure functions that return markup strings.
import { CHARACTERS } from '/engine/characters.js';

export const S = 100; // tile size in SVG units
export const REGION = {
  forest: { name: 'Forest', color: '#2f6b3a', path: '#d6c98f', emoji: '🌲' },
  wasteland: { name: 'Wasteland', color: '#c27428', path: '#f1dfa8', emoji: '🏜️' },
  marshland: { name: 'Marshland', color: '#2b8a8f', path: '#d9f0ef', emoji: '🪷' },
  mountains: { name: 'Mountains', color: '#6f68b3', path: '#dedaf3', emoji: '🏔️' },
  altar: { name: 'Altar', color: '#d9c25a', path: '#fff3b0', emoji: '✨' },
};
const END = [[S / 2, 0], [S, S / 2], [S / 2, S], [0, S / 2]];
const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function icon(t) {
  switch (t.kind) {
    case 'ruin': return t.ruin === 'ready' ? '🏛️' : '🪨';
    case 'event': return '❗';
    case 'warp': return '🌀';
    case 'terrain': return t.terrain === 'pos' ? '✚' : '☠';
    case 'settlement': return '🏘️';
    case 'altar': return '✺';
    default: return '';
  }
}

// Tile drawn at origin (0,0), size S. Used by the board and by rotation previews.
export function tileMarkup(t) {
  const reg = REGION[t.region] || REGION.altar;
  const c = S / 2;
  let g = `<rect x="2" y="2" width="${S - 4}" height="${S - 4}" rx="12" fill="${reg.color}" stroke="rgba(0,0,0,.4)" stroke-width="2"/>`;
  if (t.kind === 'altar') g += `<rect x="12" y="12" width="${S - 24}" height="${S - 24}" rx="18" fill="#a77bd1" opacity=".55"/>`;
  for (let d = 0; d < 4; d++) {
    if (!t.exits[d]) continue;
    g += `<line x1="${c}" y1="${c}" x2="${END[d][0]}" y2="${END[d][1]}" stroke="${reg.path}" stroke-width="20" stroke-linecap="butt"/>`;
  }
  g += `<circle cx="${c}" cy="${c}" r="19" fill="${reg.path}" stroke="rgba(0,0,0,.25)" stroke-width="2"/>`;
  const ic = icon(t);
  if (ic) {
    const color = t.kind === 'terrain' ? (t.terrain === 'pos' ? '#2c8f46' : '#a13a2f') : '#3a2c14';
    g += `<text x="${c}" y="${c + 1}" text-anchor="middle" dominant-baseline="central" font-size="${t.kind === 'terrain' ? 24 : 22}" fill="${color}" font-weight="700" opacity="${t.kind === 'ruin' && t.ruin !== 'ready' ? 0.55 : 1}">${ic}</text>`;
  }
  return g;
}

export function previewSvg(tile) {
  return `<svg viewBox="0 0 ${S} ${S}">${tileMarkup(tile)}</svg>`;
}

function banner(region, holder, players) {
  const col = REGION[region].color;
  const flag = `<g transform="translate(70,6)"><rect x="0" y="0" width="22" height="30" rx="3" fill="${col}" stroke="#fff" stroke-width="2"/><text x="11" y="15" text-anchor="middle" dominant-baseline="central" font-size="14" fill="#fff">🚩</text></g>`;
  if (!holder) return flag;
  const p = players.find((x) => x.id === holder);
  return `<g transform="translate(70,6)" opacity=".95"><rect x="0" y="0" width="22" height="30" rx="3" fill="${p.color}" stroke="#fff" stroke-width="2"/><text x="11" y="15" text-anchor="middle" dominant-baseline="central" font-size="13">${CHARACTERS[p.char].emoji}</text></g>`;
}

function tokens(view, cell) {
  const here = view.players.filter((p) => p.pos === cell);
  return here.map((p, i) => {
    const n = here.length;
    const ang = (i / n) * Math.PI * 2 + Math.PI / 4;
    const r = n === 1 ? 0 : 22;
    const x = S / 2 + Math.cos(ang) * r;
    const y = S / 2 + 20 + Math.sin(ang) * (r * 0.6);
    const isMe = p.id === view.me;
    return `<g transform="translate(${x},${y})" ${p.stunned ? 'opacity=".6"' : ''}>
      <title>${esc(p.name)}${p.stunned ? ' (Stunned)' : ''}${p.invisible ? ' (Invisible)' : ''}</title>
      <circle r="${isMe ? 17 : 15}" fill="${p.color}" stroke="${isMe ? '#fff' : 'rgba(0,0,0,.55)'}" stroke-width="${isMe ? 4 : 3}" ${p.invisible ? 'stroke-dasharray="4 3"' : ''}/>
      <text text-anchor="middle" dominant-baseline="central" font-size="18" ${p.stunned ? 'transform="rotate(90)"' : ''}>${CHARACTERS[p.char].emoji}</text>
      ${p.stunned ? '<text y="-20" text-anchor="middle" font-size="14">💫</text>' : ''}
    </g>`;
  }).join('');
}

// opts: { moves: Map(cell -> action), pick: Set(cell) }
export function boardMarkup(view, opts = {}) {
  const moves = opts.moves || new Map();
  const pick = opts.pick || new Set();
  const cells = Object.keys(view.tiles);
  const pend = view.pending && !view.tiles[view.pending.cell] ? view.pending.cell : null;
  const ghosts = [...moves.values()].filter((a) => a.kind === 'reveal').map((a) => a.cell);
  const all = [...cells, ...ghosts, ...(pend ? [pend] : [])].map((c) => c.split(',').map(Number));
  const xs = all.map((p) => p[0]); const ys = all.map((p) => p[1]);
  const bounds = { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) };
  let out = '';
  for (const [cell, t] of Object.entries(view.tiles)) {
    const [x, y] = cell.split(',').map(Number);
    const mv = moves.get(cell);
    const pk = pick.has(cell);
    out += `<g transform="translate(${x * S},${y * S})" data-cell="${cell}" class="tile">
      <title>${esc(t.info.name)}: ${esc(t.info.text)}</title>
      ${tileMarkup(t)}
      ${t.kind === 'settlement' ? banner(t.region, view.banners[t.region], view.players) : ''}
      ${t.trap ? '<text x="14" y="20" font-size="18" text-anchor="middle" dominant-baseline="central">🪤</text>' : ''}
      ${tokens(view, cell)}
      ${mv ? `<rect class="pulse-ring" x="4" y="4" width="${S - 8}" height="${S - 8}" rx="12" fill="rgba(103,209,122,.18)" stroke="#67d17a" stroke-width="5" data-cell="${cell}" style="cursor:pointer"/>` : ''}
      ${pk ? `<rect class="pulse-ring" x="4" y="4" width="${S - 8}" height="${S - 8}" rx="12" fill="rgba(230,211,106,.22)" stroke="#e6d36a" stroke-width="5" data-pick="${cell}" style="cursor:pointer"/>` : ''}
    </g>`;
  }
  for (const a of moves.values()) {
    if (a.kind !== 'reveal') continue;
    const [x, y] = a.cell.split(',').map(Number);
    const reg = REGION[a.region];
    out += `<g transform="translate(${x * S},${y * S})" data-cell="${a.cell}" style="cursor:pointer">
      <title>Reveal a ${reg.name} tile</title>
      <rect class="pulse-ring" x="4" y="4" width="${S - 8}" height="${S - 8}" rx="12" fill="${reg.color}" fill-opacity=".28" stroke="#67d17a" stroke-width="4" stroke-dasharray="9 7" data-cell="${a.cell}"/>
      <text x="${S / 2}" y="${S / 2}" text-anchor="middle" dominant-baseline="central" font-size="30" data-cell="${a.cell}">${reg.emoji}</text>
    </g>`;
  }
  if (pend) {
    const [x, y] = pend.split(',').map(Number);
    out += `<g transform="translate(${x * S},${y * S})"><rect x="4" y="4" width="${S - 8}" height="${S - 8}" rx="12" fill="#fff" fill-opacity=".15" stroke="#fff" stroke-width="3" stroke-dasharray="6 6"/><text x="${S / 2}" y="${S / 2}" text-anchor="middle" dominant-baseline="central" font-size="26">✨</text></g>`;
  }
  return { markup: out, bounds };
}
