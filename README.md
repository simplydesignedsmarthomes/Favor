# Favor: Gods of Oethera (online)

An unofficial, fan-made web adaptation of the board game *Favor: Gods of Oethera* by Lichenwood Games.
Online multiplayer for 2 to 6 players, playable on desktop and phone browsers. If you like it, buy the real game.

## Run it

```
npm install
npm start          # http://localhost:3000  (PORT env var to change)
npm test           # plays hundreds of random games against the rules engine and checks invariants
```

One player creates a room and shares the 4 letter code (or invite link). Everyone picks a character, the host starts.
Dropped connections rejoin automatically (the session token is kept in the browser).

The server needs a long-running Node process with WebSocket support (Render, Fly.io, Railway, a VPS).
Static-only hosts such as Netlify cannot run it. Game state is held in memory, so a restart ends running games.

## Layout

- `engine/` rules engine. Pure JS, serializable state, seeded RNG, no I/O.
  - `engine.js` turn flow, movement, tile reveal, combat, challenges, prompts, legal actions, per-player views
  - `cards.js`, `relics.js`, `characters.js`, `regions.js` content data (effects are plain JSON ops)
- `server/` HTTP + WebSocket server and room/lobby handling. The server is authoritative; clients only send actions.
  Hidden information (other hands, trap values) never leaves the server.
- `public/` browser client (vanilla JS + SVG board, no build step)
- `test/sim.js` random-play stress test

## What follows the official rulebook

Setup (blank tiles by player count, 4 regions, settlements, 10 Favor / 4 Banners wins), the 3 step turn, Energy costs,
Basic Movement and tile reveal, Ruin/Event/Terrain/Warp tiles, Delving, Relics and offering, Challenge rolls (roll below the stat),
Settlement rolls and Banner bonuses, Boons (daily, replenished by offering), Action Cards (Attack, Spell, Hex, Trap),
traps, keywords (Cold, Poison, Silenced, Invisible, Stun), stunning and its Favor, and the FAQ rulings.

## What is stand-in content (please read)

The rulebook explains how each card type works but does not print the cards. These are my own stand-ins using the same mechanics:

- the 60 Action Cards, 40 God Cards, 16 Event Cards, 36 Relics, Terrain tile effects and Item cards
- stats for Sapling and The Attuned, and the Attuned's Boon (the other four characters match the rulebook)
- trap token values, and the challenge die (modelled as 0 to 4)
- board geometry: the Altar is one tile with a Settlement tile two steps out on each side, instead of the physical corner layout

All of it is data in `engine/`, so real card text can be dropped in. Photos of the real cards would let me match them exactly.

## Rules interpretations

Teleporting onto a tile triggers its trap or event like moving there. Off-turn Item interrupts (for example the rulebook's
Tourmaline Effigy) are not implemented; Items are used on your own turn. God Card tile moves and "reveal and place anywhere"
are replaced by "rotate a tile".
