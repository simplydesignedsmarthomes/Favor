// 36 Relics: 12 Charm, 12 Fight, 6 Blessings, 6 Curses (counts match the rulebook).
// Names/effects other than a handful quoted in the rulebook are stand-ins.
//
// mods:  flat stat changes while held
// hooks: settlementCharm, eventAll, lifesteal, discount, eventSkip, maxHearts, energy,
//        drawBonus, dmgReduce, advantage[stat], preventStun, startDamage, moveSurcharge,
//        atkBonus, healBonus, trapImmune, firstMoveFree
const R = (id, name, type, text, mods = {}, hooks = {}) => ({ id, name, type, text, mods, hooks });

export const RELIC_LIST = [
  // Charm
  R('universal_translator', 'Universal Translator', 'charm', '+1 Charm. +1 EXTRA Charm during Settlement rolls.', { charm: 1 }, { settlementCharm: 1 }),
  R('royal_circlet', 'Royal Circlet', 'charm', '+1 Charm. +1 EXTRA Charm, Fight and Wit during Events.', { charm: 1 }, { eventAll: 1 }),
  R('honeyed_lute', 'Honeyed Lute', 'charm', '+1 Charm. Whenever you heal, heal 1 extra Heart.', { charm: 1 }, { healBonus: 1 }),
  R('mask_many_faces', 'Mask of Many Faces', 'charm', '+1 Charm. Roll twice on Charm Challenges and take the better roll.', { charm: 1 }, { advantage: ['charm'] }),
  R('gilded_compass', 'Gilded Compass', 'charm', '+1 Charm. Your first Basic Movement each turn costs 1 less Energy.', { charm: 1 }, { firstMoveFree: true }),
  R('diplomats_seal', "Diplomat's Seal", 'charm', '+1 Charm. +1 EXTRA Charm during Settlement rolls.', { charm: 1 }, { settlementCharm: 1 }),
  R('amber_pendant', 'Amber Pendant', 'charm', '+1 Charm. +1 Heart Token.', { charm: 1 }, { maxHearts: 1 }),
  R('songbird_whistle', 'Songbird Whistle', 'charm', '+1 Charm. After drawing an Event Card you may discard it instead of resolving it.', { charm: 1 }, { eventSkip: true }),
  R('velvet_gloves', 'Velvet Gloves', 'charm', '+1 Charm. Traps deal no damage to you.', { charm: 1 }, { trapImmune: true }),
  R('jade_fan', 'Jade Fan', 'charm', '+1 Charm. Once per turn, an Action Card costs 1 less Energy.', { charm: 1 }, { discount: 1 }),
  R('silken_sash', 'Silken Sash', 'charm', '+1 Charm. Draw 1 extra Action Card at the end of your turn.', { charm: 1 }, { drawBonus: 1 }),
  R('moonstone_ring', 'Moonstone Ring', 'charm', '+1 Charm. Roll twice on Wit Challenges and take the better roll.', { charm: 1 }, { advantage: ['wit'] }),
  // Fight
  R('crystal_scepter', 'Crystal Scepter', 'fight', '+1 Fight. Heal Hearts equal to the damage you deal.', { fight: 1 }, { lifesteal: true }),
  R('iron_knuckles', 'Iron Knuckles', 'fight', '+1 Fight. Your attacks deal 1 extra damage.', { fight: 1 }, { atkBonus: 1 }),
  R('spike_shield', 'Spike Shield', 'fight', '+1 Fight. Reduce every instance of damage you take by 1.', { fight: 1 }, { dmgReduce: 1 }),
  R('hunters_bow', "Hunter's Bow", 'fight', '+1 Fight. Roll twice on Fight Challenges and take the better roll.', { fight: 1 }, { advantage: ['fight'] }),
  R('war_drum', 'War Drum', 'fight', '+1 Fight. Once per turn, an Action Card costs 1 less Energy.', { fight: 1 }, { discount: 1 }),
  R('obsidian_blade', 'Obsidian Blade', 'fight', '+1 Fight. Your attacks deal 1 extra damage.', { fight: 1 }, { atkBonus: 1 }),
  R('troll_hide', 'Troll Hide', 'fight', '+1 Fight. +1 Heart Token.', { fight: 1 }, { maxHearts: 1 }),
  R('storm_gauntlets', 'Storm Gauntlets', 'fight', '+1 Fight. Traps deal no damage to you.', { fight: 1 }, { trapImmune: true }),
  R('sunstone_mace', 'Sunstone Mace', 'fight', '+1 Fight. Whenever you heal, heal 1 extra Heart.', { fight: 1 }, { healBonus: 1 }),
  R('hiking_boots', 'Hiking Boots', 'fight', '+1 Fight. After drawing an Event Card you may discard it instead of resolving it.', { fight: 1 }, { eventSkip: true }),
  R('quartz_pendant', 'Quartz Pendant', 'fight', '+1 Fight. Once per turn, an Action Card costs 1 less Energy.', { fight: 1 }, { discount: 1 }),
  R('warlords_helm', "Warlord's Helm", 'fight', '+1 Fight. Draw 1 extra Action Card at the end of your turn.', { fight: 1 }, { drawBonus: 1 }),
  // Blessings
  R('phoenix_feather', 'Phoenix Feather', 'blessing', 'The next time you would be Stunned, discard this and keep 2 Hearts instead.', {}, { preventStun: true }),
  R('horn_of_plenty', 'Horn of Plenty', 'blessing', 'Reset your Energy to 5 instead of 4 each turn.', {}, { energy: 1 }),
  R('scholars_tome', "Scholar's Tome", 'blessing', '+1 Wit. Draw 1 extra Action Card at the end of your turn.', { wit: 1 }, { drawBonus: 1 }),
  R('aegis_of_oethera', 'Aegis of Oethera', 'blessing', '+1 Heart Token. Reduce every instance of damage you take by 1.', {}, { maxHearts: 1, dmgReduce: 1 }),
  R('heartstone', 'Heartstone', 'blessing', '+2 Heart Tokens.', {}, { maxHearts: 2 }),
  R('lucky_coin', 'Lucky Coin', 'blessing', 'Roll twice on every Challenge and take the better roll.', {}, { advantage: ['charm', 'fight', 'wit'] }),
  // Curses
  R('leaden_boots', 'Leaden Boots', 'curse', 'Your first Basic Movement each turn costs 1 extra Energy.', {}, { moveSurcharge: 1 }),
  R('hollow_idol', 'Hollow Idol', 'curse', 'Take 1 damage at the start of your turn.', {}, { startDamage: 1 }),
  R('cracked_mirror', 'Cracked Mirror', 'curse', '-1 Charm (cannot go below zero).', { charm: -1 }),
  R('rusted_blade', 'Rusted Blade', 'curse', '-1 Fight (cannot go below zero).', { fight: -1 }),
  R('clouded_lens', 'Clouded Lens', 'curse', '-1 Wit (cannot go below zero).', { wit: -1 }),
  R('cursed_map', 'Cursed Map', 'curse', '-1 Wit. Your first Basic Movement each turn costs 1 extra Energy.', { wit: -1 }, { moveSurcharge: 1 }),
];

export const RELICS = Object.fromEntries(RELIC_LIST.map((r) => [r.id, r]));
