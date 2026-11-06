# Blackwood desktop client (Godot)

The game client rebuilt in Godot 4.7 for Steam (controller support, 3D performance, Steam Deck).
It plays **The Whitmore File (C001)** start to finish in walkable 3D rooms.

## What's in it

- Every C001 place, built from the website's own room data (`data/*.json`) with the same Meshy models and
  wall art: the office, Eleanor's living room and kitchen (walk through the arch), the diner, Daniel's
  apartment, Margaret's house, Hale Automotive and the savings and loan.
- Lighting in code: switches with a flicker, lamps, fan and ceiling glow, daylight or city light through the
  windows, with the view outside running on past the window edges.
- People standing in their rooms (arms lowered from the rig pose, breathing and glancing around). Questioning
  someone turns the camera to their face, and their mouth moves with their ElevenLabs voice.
- Travel by the street map, the intro briefing, the case file, the telephone (ringing, contacts, outgoing
  calls), mail and deliveries, lab results, the police tapes, collecting evidence and photos, the notebook
  (objectives, evidence with notes, people, notes, timeline, interviews, your own notes), the murder board
  (pin, move, tie with string), showing people evidence, the final report, and the ending.
- Music and room sound from the case's soundtrack, character voices and evidence narration (toggles in the menu).
- Keyboard and mouse or a controller throughout. Offline mode walks every place without the server.

## Controls

Move WASD / left stick. Look mouse / right stick (arrows turn). Hurry Shift / L3. Use E or click / A.
Notebook Tab / Back (LB and RB change pages). Map M / Y. Menu Esc / Start. Back Esc / B.
Murder board: drag or A to pick up a card, right-click or X (C on the keyboard) to tie string, Y or Delete to take down.

## How it connects

The client signs in at `/api/client/login` and sends its token as a bearer header to `/api/client/view`,
`/api/client/play`, `/api/voice`, `/api/narration` and the case audio. The server runs the same `playAction`
as the website, so the save is shared and nothing about the case's answers lives in the client.

## Building

1. From the repo root: `node scripts/godot/export-room.mjs` copies the rooms, models (de-quantized for Godot)
   and case art into `godot/rooms` and `godot/art` (not committed; they come from `public/`).
2. Open this folder in Godot 4.7, or export: `godot --headless --export-release "Windows Desktop" build/windows/Blackwood.exe`
   (and `"Linux"` for a native Steam Deck build).

## Testing without the website

`npx tsx --conditions=react-server scripts/godot/mock-server.ts` runs the real case engine locally (no
database or interview AI; questions match authored answers only). Start the game with
`-- --server=http://127.0.0.1:8787`. `-- --autoplay=/tmp/run` plays through the case against it and saves a
screenshot of each step; `-- --shot=/tmp/x.png --walk=diner` saves four views of a place.

## Adding a case or a room

Add the room to `ROOMS` in `scripts/godot/export-room.mjs` and the location to `SCENES` in `scripts/main.gd`.
