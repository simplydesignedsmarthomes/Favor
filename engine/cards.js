// Card content. The rulebook describes how each card TYPE works but does not print the
// cards, so everything here is stand-in content that uses the same mechanics.
// Effects are plain JSON ops interpreted by engine.js, so a real card list can be dropped in.
//
// number expressions: 2 | 'fight' | { stat:'fight', add:1, mul:2 }

const A = (id, name, type, cost, count, text, needs, d) => ({ id, name, type, cost, count, text, needs, do: d });
const dmgLine = (n) => [{ op: 'pickPlayer', filter: 'line', then: [{ op: 'damage', to: 'target', n, kind: 'attack' }] }];
const dmgSame = (n) => [{ op: 'pickPlayer', filter: 'same', then: [{ op: 'damage', to: 'target', n, kind: 'attack' }] }];
const hex = (name) => [{ op: 'pickPlayer', filter: 'any', hex: name, then: [{ op: 'hex', to: 'target', name }] }];

export const ACTION_CARDS = [
  // Attacks (20)
  A('snipe', 'Snipe', 'attack', 1, 6, 'Deal damage equal to your Fight to an opponent within a straight line of Connected Tiles.', 'line', dmgLine('fight')),
  A('power_strike', 'Power Strike', 'attack', 1, 4, 'Deal Fight +1 damage to an opponent on your Tile.', 'same', dmgSame({ stat: 'fight', add: 1 })),
  A('cleave', 'Cleave', 'attack', 2, 3, 'Deal Fight +2 damage to an opponent on your Tile.', 'same', dmgSame({ stat: 'fight', add: 2 })),
  A('volley', 'Volley', 'attack', 2, 3, 'Deal 2 damage to an opponent within a straight line of Connected Tiles.', 'line', dmgLine(2)),
  A('shockwave', 'Shockwave', 'attack', 3, 2, 'Deal 1 damage to every opponent within a straight line of Connected Tiles.', 'line', [{ op: 'damageLine', n: 1 }]),
  A('smite', 'Smite', 'attack', 3, 2, 'Deal 3 damage to an opponent within a straight line of Connected Tiles.', 'line', dmgLine(3)),
  // Spells (18)
  A('mend', 'Mend', 'spell', 1, 4, 'Heal 2 Hearts.', null, [{ op: 'heal', to: 'self', n: 2 }]),
  A('focus', 'Focus', 'spell', 0, 3, 'Gain 1 Energy.', null, [{ op: 'energy', to: 'self', n: 1 }]),
  A('study', 'Study', 'spell', 1, 3, 'Draw 2 Action Cards.', null, [{ op: 'draw', to: 'self', n: 2 }]),
  A('homeward', 'Homeward', 'spell', 1, 3, 'Teleport to the Altar.', 'notAltar', [{ op: 'teleport', to: 'self', where: 'altar' }]),
  A('teleport', 'Teleport', 'spell', 3, 2, 'Teleport to any revealed Tile.', 'tele', [{ op: 'pickCell', filter: 'tele', then: [{ op: 'teleport', to: 'self', where: 'cell' }] }]),
  A('transcend', 'Transcend', 'spell', 1, 1, 'Take 1 damage, then double your Energy.', null, [{ op: 'damage', to: 'self', n: 1, kind: 'effect' }, { op: 'doubleEnergy' }]),
  A('rekindle', 'Rekindle', 'spell', 2, 2, 'Replenish all Ruin Tokens in one Region.', 'ruinSpent', [{ op: 'replenish', scope: 'region' }]),
  // Hexes (14)
  A('silence', 'Silence', 'hex', 1, 2, 'Hex: the target is Silenced and cannot play Action Cards.', 'anyOpp:silenced', hex('silenced')),
  A('frostbite', 'Frostbite', 'hex', 1, 2, 'Hex: the target is Cold. Basic Movement costs 1 extra Energy.', 'anyOpp:cold', hex('cold')),
  A('venom', 'Venom', 'hex', 1, 2, 'Hex: the target is Poisoned. They take 1 damage after each Basic Movement.', 'anyOpp:poison', hex('poison')),
  A('weary', 'Weary', 'hex', 1, 2, 'Hex: the target starts their turn with 1 less Energy.', 'anyOpp:weary', hex('weary')),
  A('feeble', 'Feeble', 'hex', 1, 2, 'Hex: the target has -1 Fight.', 'anyOpp:feeble', hex('feeble')),
  A('jinx', 'Jinx', 'hex', 1, 2, 'Hex: the target has -1 Charm.', 'anyOpp:jinx', hex('jinx')),
  A('dullness', 'Dullness', 'hex', 1, 2, 'Hex: the target has -1 Wit.', 'anyOpp:dullness', hex('dullness')),
  // Traps (8)
  A('divine_trap', 'Divine Trap', 'trap', 0, 8, 'Draw a Trap Token and place it face down on any unoccupied Tile.', 'trap', [{ op: 'placeTrap' }]),
];
export const ACTION_BY_ID = Object.fromEntries(ACTION_CARDS.map((c) => [c.id, c]));

// 16 tokens, damage 0, 1 or 2
export const TRAP_TOKENS = [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2];

export const ITEMS = {
  invisibility_cloak: { name: 'Invisibility Cloak', text: 'Discard to become Invisible until your next turn.', do: [{ op: 'status', to: 'self', name: 'invisible' }] },
  healing_draught: { name: 'Healing Draught', text: 'Discard to heal 3 Hearts.', do: [{ op: 'heal', to: 'self', n: 3 }] },
  energy_elixir: { name: 'Energy Elixir', text: 'Discard to gain 2 Energy.', do: [{ op: 'energy', to: 'self', n: 2 }] },
  smoke_bomb: { name: 'Smoke Bomb', text: 'Discard to teleport to the Altar.', do: [{ op: 'teleport', to: 'self', where: 'altar' }] },
};

const G = (id, god, name, text, d) => ({ id, god, name, text, do: d });
const all = (d) => [{ op: 'each', who: 'all', do: d }];
const ch = (stat, success, failure) => ({ op: 'challenge', stat, success, failure });

// 40 God Cards, 8 per God
export const GOD_CARDS = [
  G('cel1', 'Celdium', 'Starlight Blessing', 'All players heal 1 Heart.', all([{ op: 'heal', to: 'it', n: 1 }])),
  G('cel2', 'Celdium', 'Heavenly Census', 'The player(s) with the smallest sum of Favor + Relics draw 1 Relic.', [{ op: 'lowestRelic' }]),
  G('cel3', 'Celdium', 'Moonlit Trial', 'All players make a Charm Challenge. Failure: take 1 damage.', all([ch('charm', [], [{ op: 'damage', to: 'it', n: 1 }])])),
  G('cel4', 'Celdium', 'Decree of Order', 'The current player chooses: heal 2 Hearts or draw 2 Action Cards.', [
    { op: 'choose', who: 'self', text: 'Celdium decrees...', options: [{ label: 'Heal 2 Hearts', do: [{ op: 'heal', to: 'self', n: 2 }] }, { label: 'Draw 2 Action Cards', do: [{ op: 'draw', to: 'self', n: 2 }] }] },
  ]),
  G('cel5', 'Celdium', 'Gaze of the Heavens', 'The current player replenishes all Ruin Tokens in a Region of their choice.', [{ op: 'replenish', scope: 'region' }]),
  G('cel6', 'Celdium', 'Constellation Walk', 'All players teleport to the Altar.', all([{ op: 'teleport', to: 'it', where: 'altar' }])),
  G('cel7', 'Celdium', 'Divine Scrutiny', 'All players make a Wit Challenge. Failure: discard 1 Action Card.', all([ch('wit', [], [{ op: 'discardChoose', to: 'it', n: 1 }])])),
  G('cel8', 'Celdium', 'Royal Audience', 'The current player makes a Charm Challenge. Success: draw 1 Relic.', [ch('charm', [{ op: 'relic', to: 'self', n: 1 }], [])]),

  G('gru1', 'Gruuvda', 'Feast!', 'All players heal 2 Hearts.', all([{ op: 'heal', to: 'it', n: 2 }])),
  G('gru2', 'Gruuvda', 'Bar Brawl', 'All players make a Fight Challenge. Failure: take 1 damage.', all([ch('fight', [], [{ op: 'damage', to: 'it', n: 1 }])])),
  G('gru3', 'Gruuvda', 'Drinking Contest', 'The current player makes a Fight Challenge. Success: gain 2 Energy. Failure: take 1 damage.', [ch('fight', [{ op: 'energy', to: 'self', n: 2 }], [{ op: 'damage', to: 'self', n: 1 }])]),
  G('gru4', 'Gruuvda', 'Thunderous Cheer', 'The current player draws 2 Action Cards.', [{ op: 'draw', to: 'self', n: 2 }]),
  G('gru5', 'Gruuvda', 'Roaring Toast', 'All players make a Wit Challenge. Success: heal 2 Hearts.', all([ch('wit', [{ op: 'heal', to: 'it', n: 2 }], [])])),
  G('gru6', 'Gruuvda', 'Hearty Meal', 'The current player heals 3 Hearts.', [{ op: 'heal', to: 'self', n: 3 }]),
  G('gru7', 'Gruuvda', 'Trial by Combat', 'The current player makes a Fight Challenge. Success: draw 1 Relic. Failure: take 2 damage.', [ch('fight', [{ op: 'relic', to: 'self', n: 1 }], [{ op: 'damage', to: 'self', n: 2 }])]),
  G('gru8', 'Gruuvda', 'Spoils of War', 'The player(s) with the smallest sum of Favor + Relics draw 1 Relic.', [{ op: 'lowestRelic' }]),

  G('aag1', 'Aagaru', 'Cosmic Glimpse', 'The current player draws 2 Action Cards.', [{ op: 'draw', to: 'self', n: 2 }]),
  G('aag2', 'Aagaru', 'Chaotic Currents', 'All players teleport to the Altar.', all([{ op: 'teleport', to: 'it', where: 'altar' }])),
  G('aag3', 'Aagaru', 'Whispers of the Void', 'The current player chooses: replenish a Region\'s Ruins, or take 1 damage and draw 1 Relic.', [
    { op: 'choose', who: 'self', text: 'Aagaru whispers...', options: [{ label: 'Replenish a Region\'s Ruins', do: [{ op: 'replenish', scope: 'region' }] }, { label: 'Take 1 damage, draw 1 Relic', do: [{ op: 'damage', to: 'self', n: 1 }, { op: 'relic', to: 'self', n: 1 }] }] },
  ]),
  G('aag4', 'Aagaru', 'Shifting Sands', 'Rotate a Tile that has no player on it.', [{ op: 'rotateTile' }]),
  G('aag5', 'Aagaru', 'Meditation', 'The current player gains 2 Energy.', [{ op: 'energy', to: 'self', n: 2 }]),
  G('aag6', 'Aagaru', 'Omen', 'All players make a Wit Challenge. Failure: take 1 damage.', all([ch('wit', [], [{ op: 'damage', to: 'it', n: 1 }])])),
  G('aag7', 'Aagaru', 'Cosmic Alignment', 'Replenish every Ruin Token.', [{ op: 'replenish', scope: 'all' }]),
  G('aag8', 'Aagaru', 'Void Swap', 'The current player switches places with an opponent of their choice.', [{ op: 'pickPlayer', filter: 'anyStunnedOk', then: [{ op: 'swapPlaces' }] }]),

  G('bro1', 'Broki', 'Stolen Satchel', 'The current player discards 1 Action Card.', [{ op: 'discardChoose', to: 'self', n: 1 }]),
  G('bro2', 'Broki', 'Trickster\'s Dice', 'The current player makes a Wit Challenge. Success: draw 2 Action Cards. Failure: take 1 damage.', [ch('wit', [{ op: 'draw', to: 'self', n: 2 }], [{ op: 'damage', to: 'self', n: 1 }])]),
  G('bro3', 'Broki', 'Switcheroo', 'The current player switches places with an opponent of their choice.', [{ op: 'pickPlayer', filter: 'anyStunnedOk', then: [{ op: 'swapPlaces' }] }]),
  G('bro4', 'Broki', 'Bad Luck', 'The current player is Jinxed (-1 Charm) until the end of their turn.', [{ op: 'hex', to: 'self', name: 'jinx' }]),
  G('bro5', 'Broki', 'Rearranged Roads', 'Rotate a Tile that has no player on it.', [{ op: 'rotateTile' }]),
  G('bro6', 'Broki', 'Mischief', 'The current player chooses: take 1 damage to draw 1 Relic, or do nothing.', [
    { op: 'choose', who: 'self', text: 'Broki offers a gamble...', options: [{ label: 'Take 1 damage, draw 1 Relic', do: [{ op: 'damage', to: 'self', n: 1 }, { op: 'relic', to: 'self', n: 1 }] }, { label: 'No thanks', do: [] }] },
  ]),
  G('bro7', 'Broki', 'Unexpected Gift', 'The current player draws 1 Relic.', [{ op: 'relic', to: 'self', n: 1 }]),
  G('bro8', 'Broki', 'Practical Joke', 'All players make a Charm Challenge. Failure: discard 1 Action Card.', all([ch('charm', [], [{ op: 'discardChoose', to: 'it', n: 1 }])])),

  G('wyl1', 'Wylip', 'Healing Rain', 'All players heal 2 Hearts.', all([{ op: 'heal', to: 'it', n: 2 }])),
  G('wyl2', 'Wylip', 'Kind Words', 'All players make a Charm Challenge. Success: heal 1 Heart.', all([ch('charm', [{ op: 'heal', to: 'it', n: 1 }], [])])),
  G('wyl3', 'Wylip', 'Helping Hand', 'The player(s) with the smallest sum of Favor + Relics draw 1 Relic.', [{ op: 'lowestRelic' }]),
  G('wyl4', 'Wylip', 'Gentle Breeze', 'The current player heals 2 Hearts and gains 1 Energy.', [{ op: 'heal', to: 'self', n: 2 }, { op: 'energy', to: 'self', n: 1 }]),
  G('wyl5', 'Wylip', 'Gift of Growth', 'The current player draws 2 Action Cards.', [{ op: 'draw', to: 'self', n: 2 }]),
  G('wyl6', 'Wylip', 'Disguised Visitor', 'The current player makes a Charm Challenge. Success: draw 1 Relic.', [ch('charm', [{ op: 'relic', to: 'self', n: 1 }], [])]),
  G('wyl7', 'Wylip', 'Blessed Meal', 'All players draw 1 Action Card.', all([{ op: 'draw', to: 'it', n: 1 }])),
  G('wyl8', 'Wylip', 'Renewal', 'The current player replenishes all Ruin Tokens in a Region of their choice.', [{ op: 'replenish', scope: 'region' }]),
];

const E = (id, name, kind, text, d) => ({ id, name, kind, text, do: d });

// 16 Event Cards
export const EVENT_CARDS = [
  E('cloak_merchant', 'Cloak Merchant', 'Charm', 'A young Sapling offers a shimmering cloak. Charm Challenge. Success: gain the Invisibility Cloak Item. Failure: take 1 damage.',
    [ch('charm', [{ op: 'item', to: 'self', id: 'invisibility_cloak' }], [{ op: 'damage', to: 'it', n: 1 }])]),
  E('wandering_healer', 'Wandering Healer', 'Choose', 'Choose one: heal 3 Hearts, or draw 2 Action Cards.',
    [{ op: 'choose', who: 'it', text: 'Wandering Healer', options: [{ label: 'Heal 3 Hearts', do: [{ op: 'heal', to: 'it', n: 3 }] }, { label: 'Draw 2 Action Cards', do: [{ op: 'draw', to: 'it', n: 2 }] }] }]),
  E('ruin_hermit', 'Ruin Hermit', 'Wit', 'A hermit knows the old ways. Wit Challenge. Success: replenish all Ruin Tokens in a Region of your choice.',
    [ch('wit', [{ op: 'replenish', scope: 'region' }], [])]),
  E('highway_bandits', 'Highway Bandits', 'Fight', 'Bandits block the road. Fight Challenge. Success: draw 1 Relic. Failure: take 2 damage.',
    [ch('fight', [{ op: 'relic', to: 'it', n: 1 }], [{ op: 'damage', to: 'it', n: 2 }])]),
  E('sleeping_giant', 'Sleeping Giant', 'Wit', 'Tiptoe past a snoring giant. Wit Challenge. Success: draw 1 Relic. Failure: take 2 damage.',
    [ch('wit', [{ op: 'relic', to: 'it', n: 1 }], [{ op: 'damage', to: 'it', n: 2 }])]),
  E('market_day', 'Market Day', 'Choose', 'Choose one: draw 2 Action Cards, or gain 2 Energy.',
    [{ op: 'choose', who: 'it', text: 'Market Day', options: [{ label: 'Draw 2 Action Cards', do: [{ op: 'draw', to: 'it', n: 2 }] }, { label: 'Gain 2 Energy', do: [{ op: 'energy', to: 'it', n: 2 }] }] }]),
  E('strange_shrine', 'Strange Shrine', 'Choose', 'Choose one: heal 2 Hearts, or take 1 damage and draw 1 Relic.',
    [{ op: 'choose', who: 'it', text: 'Strange Shrine', options: [{ label: 'Heal 2 Hearts', do: [{ op: 'heal', to: 'it', n: 2 }] }, { label: 'Take 1 damage, draw 1 Relic', do: [{ op: 'damage', to: 'it', n: 1 }, { op: 'relic', to: 'it', n: 1 }] }] }]),
  E('pack_mule', 'Pack Mule', 'Charm', 'A trader\'s mule carries potions. Charm Challenge. Success: gain the Healing Draught Item.',
    [ch('charm', [{ op: 'item', to: 'self', id: 'healing_draught' }], [])]),
  E('treasure_map', 'Treasure Map', 'Wit', 'You find half a map. Wit Challenge. Success: draw 1 Relic. Failure: lose 1 Energy.',
    [ch('wit', [{ op: 'relic', to: 'it', n: 1 }], [{ op: 'energy', to: 'it', n: -1 }])]),
  E('rival_scout', 'Rival Scout', 'Fight', 'A scout challenges you to a scuffle. Fight Challenge. Success: gain 2 Energy. Failure: take 1 damage.',
    [ch('fight', [{ op: 'energy', to: 'it', n: 2 }], [{ op: 'damage', to: 'it', n: 1 }])]),
  E('storm_warning', 'Storm Warning', 'Choose', 'Choose one: teleport to the Altar, or take 1 damage and gain 2 Energy.',
    [{ op: 'choose', who: 'it', text: 'Storm Warning', options: [{ label: 'Teleport to the Altar', do: [{ op: 'teleport', to: 'it', where: 'altar' }] }, { label: 'Take 1 damage, gain 2 Energy', do: [{ op: 'damage', to: 'it', n: 1 }, { op: 'energy', to: 'it', n: 2 }] }] }]),
  E('smoke_peddler', 'Smoke Peddler', 'Charm', 'A peddler sells clever gadgets. Charm Challenge. Success: gain the Smoke Bomb Item. Failure: take 1 damage.',
    [ch('charm', [{ op: 'item', to: 'self', id: 'smoke_bomb' }], [{ op: 'damage', to: 'it', n: 1 }])]),
  E('old_well', 'Old Well', 'None', 'Cool water and a lucky find. Heal 1 Heart and draw 1 Action Card.',
    [{ op: 'heal', to: 'it', n: 1 }, { op: 'draw', to: 'it', n: 1 }]),
  E('wild_beast', 'Wild Beast', 'Fight', 'A beast lunges from the brush. Fight Challenge. Success: draw 2 Action Cards. Failure: take 1 damage and become Poisoned until the end of your turn.',
    [ch('fight', [{ op: 'draw', to: 'it', n: 2 }], [{ op: 'damage', to: 'it', n: 1 }, { op: 'status', to: 'it', name: 'poison' }])]),
  E('gambling_goblins', 'Gambling Goblins', 'Choose', 'Choose one: take 1 damage and draw 1 Relic, or walk away.',
    [{ op: 'choose', who: 'it', text: 'Gambling Goblins', options: [{ label: 'Take 1 damage, draw 1 Relic', do: [{ op: 'damage', to: 'it', n: 1 }, { op: 'relic', to: 'it', n: 1 }] }, { label: 'Walk away', do: [] }] }]),
  E('wandering_trader', 'Wandering Trader', 'Charm', 'A trader haggles with you. Charm Challenge. Success: gain the Energy Elixir Item.',
    [ch('charm', [{ op: 'item', to: 'self', id: 'energy_elixir' }], [])]),
];
