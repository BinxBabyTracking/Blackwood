# Blackwood desktop client (Godot)

The game client being rebuilt in Godot 4.7 for Steam (controller support, 3D performance, Steam Deck).
Phase 2 prototype: the 80s detective office from The Whitmore File (C001).

## What works

- The office built from the website's own room data (`data/c001_office.json`), with the same Meshy models and wall art.
- Walking with WASD or a controller, mouse or right-stick look, sitting at the desk, bumping into furniture.
- Lighting in code: the ceiling light on its switch (with a flicker), the desk lamp and fan glow, city light through the window.
- Sign in with a Blackwood account. Every action goes to the live game server, so the save is the same one the website plays.
- Reading Det. Bennett's case file, answering the telephone, and questioning Bennett by phone in your own words (same interview AI, same voices).

## Not yet (Phase 3 and later)

Murder board, travel map, notebook, tapes, evidence screens, other rooms, talking portraits, Steam sign-in and the Steam on-screen keyboard.

## Running it

- Open this folder in Godot 4.7 and press F5, or run an exported build.
- `--server=https://...` after `--` points the client at another server (a Vercel preview, say).
- `-- --shot=/tmp/office.png` renders check screenshots and quits (used for automated checks).

## How it connects

The client signs in at `/api/client/login` and sends its token as a bearer header to
`/api/client/view`, `/api/client/play` and `/api/voice`. The server runs the same `playAction` as
the website; nothing about the case lives in the client.

## Adding a room

1. `node scripts/godot/export-room.mjs <file> <EXPORT_NAME>` (from the repo root) writes `godot/data/<file>.json`.
2. Copy the room's art and models under `godot/rooms/`, then remove the mesh quantization Godot can't read:
   `npx @gltf-transform/cli dequantize in.glb in.glb` for each model.
