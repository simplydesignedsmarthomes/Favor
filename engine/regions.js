export const REGION_KEYS = ['forest', 'wasteland', 'marshland', 'mountains'];

export const REGIONS = {
  forest: { name: 'Forest', color: '#2f6b3a', path: '#cdbf86', emoji: '🌲', banner: '+1 Wit' },
  wasteland: { name: 'Wasteland', color: '#c27428', path: '#ecd9a0', emoji: '🏜️', banner: '+1 Fight' },
  marshland: { name: 'Marshland', color: '#2b8a8f', path: '#d4ecec', emoji: '🪷', banner: '+1 Charm' },
  mountains: { name: 'Mountains', color: '#6f68b3', path: '#d8d4ee', emoji: '🏔️', banner: '+1 Heart' },
};

// Each region has one helpful and one harmful Terrain Tile.
export const TERRAIN = {
  forest: {
    pos: { name: 'Mossy Glade', text: 'Heal 1 Heart when you move onto this Tile.', do: [{ op: 'heal', to: 'it', n: 1 }] },
    neg: {
      name: 'Thorn Tangle',
      text: 'Wit Challenge. Failure: you are Poisoned until the end of your turn.',
      do: [{ op: 'challenge', stat: 'wit', failure: [{ op: 'status', to: 'it', name: 'poison' }] }],
    },
  },
  wasteland: {
    pos: { name: 'Hidden Oasis', text: 'Heal 1 Heart when you move onto this Tile.', do: [{ op: 'heal', to: 'it', n: 1 }] },
    neg: {
      name: 'Scorching Dunes',
      text: 'Fight Challenge. Failure: take 1 damage.',
      do: [{ op: 'challenge', stat: 'fight', failure: [{ op: 'damage', to: 'it', n: 1 }] }],
    },
  },
  marshland: {
    pos: { name: 'Glowing Spring', text: 'Gain 1 Energy when you move onto this Tile.', do: [{ op: 'energy', to: 'it', n: 1 }] },
    neg: {
      name: 'Sinking Mire',
      text: 'Wit Challenge. Failure: lose 2 Energy.',
      do: [{ op: 'challenge', stat: 'wit', failure: [{ op: 'energy', to: 'it', n: -2 }] }],
    },
  },
  mountains: {
    pos: { name: 'Crystal Vein', text: 'Draw 1 Action Card when you move onto this Tile.', do: [{ op: 'draw', to: 'it', n: 1 }] },
    neg: {
      name: 'Frozen Pass',
      text: 'Fight Challenge. Failure: you are Cold until the end of your turn.',
      do: [{ op: 'challenge', stat: 'fight', failure: [{ op: 'status', to: 'it', name: 'cold' }] }],
    },
  },
};
