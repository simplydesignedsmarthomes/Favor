// Stats for Seridian, Human, Abutian and Geodyte come straight from the rulebook.
// Sapling and Attuned stats are not printed in the rulebook, so they are stand-ins.
export const CHARACTERS = {
  seridian: {
    name: 'Seridian', emoji: '🦎', color: '#2bb3a3',
    hearts: 5, fight: 1, charm: 2, wit: 3,
    boon: { name: 'Warp Home', text: 'Teleport to the Settlement of the Region you are currently in.' },
    blurb: 'Marshland inventors and explorers.',
  },
  sapling: {
    name: 'Sapling', emoji: '🌱', color: '#6cbf4b',
    hearts: 4, fight: 1, charm: 3, wit: 3,
    boon: { name: 'Sprout Snare', text: 'Place a Trap Token on any unoccupied Tile.' },
    blurb: 'Tiny Forest folk, mighty in numbers.',
  },
  human: {
    name: 'Human', emoji: '🦀', color: '#d9534f',
    hearts: 5, fight: 1, charm: 1, wit: 4,
    boon: { name: 'Scrap Shot', text: 'Deal 2 damage to an opponent within a straight line of Connected Tiles.' },
    blurb: 'Mechanized survivors of the Wastelands.',
  },
  abutian: {
    name: 'Abutian', emoji: '🐺', color: '#4b5bd6',
    hearts: 5, fight: 1, charm: 1, wit: 4,
    boon: { name: 'Light Fingers', text: 'Swap 1 of your Relics with 1 of an opponent\'s Relics.' },
    blurb: 'Jewelers and traders of the Wastelands.',
  },
  geodyte: {
    name: 'Geodyte', emoji: '💎', color: '#7fb7e6',
    hearts: 6, fight: 1, charm: 1, wit: 3,
    boon: { name: 'Crystal Mend', text: 'Heal 3 Hearts. Then discard any number of Action Cards and draw that many.' },
    blurb: 'Crystal giants grown from the mountains.',
  },
  attuned: {
    name: 'The Attuned', emoji: '🧘', color: '#c79a52',
    hearts: 4, fight: 1, charm: 2, wit: 4,
    boon: { name: 'Shifting Order', text: 'Switch places with an opponent of your choice.' },
    blurb: 'Devotees of change and natural order.',
  },
};
export const CHARACTER_KEYS = Object.keys(CHARACTERS);
