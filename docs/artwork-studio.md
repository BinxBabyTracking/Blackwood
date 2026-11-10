# Artwork Studio

How Blackwood artwork is made, Oct 27, 2026 (walkable rooms added Nov 10, 2026). Read this before adding or changing art for any case.

## Where art comes from

- **Prompts** live in `art/manifest.json`: a style line (per case under `styles`), a framing line per kind (`kinds`), and one entry per image (`id`, `kind`, `subject`, optional `person`, `reference`, `style`, `suffix`). Image ids start with the case (`c004_ev_e03`); site and travel art has no case prefix.
- **Committed paintings** are in `public/art/<id>.webp`, listed in `src/art/generated.json`. They come from `node scripts/import-art.mjs` (hand-made images dropped in `art/inbox/`) or `node scripts/generate-art.mjs` (OpenAI, run on a computer).
- **Admin-made paintings** come from the Admin page's "Artwork" sections (below). They are stored in Supabase, not in the code, and replace the committed painting for every player once made live.

## The Admin artwork sections

One section per case, plus "Site and travel pictures". Each image shows:

- the picture players see now (a live version, the committed painting, or "Not made yet");
- its subject line, with **Edit prompt** (saved in the `art_images` table; the manifest is untouched) and **Full prompt**;
- **Generate** (OpenAI: gpt-image-1.5, falling back to gpt-image-1), **Upload my own**;
- every version made, with **Use vN** and **Use original**.

"Generate all missing" works through a case one image at a time, showing the estimated cost first. With "Make missing images live straight away" ticked, an image that had no picture goes live at once; anything else waits for review. "Generate all again" makes a new version of every image for review.

Generated and uploaded pictures are finished the same way as `import-art.mjs`: figures, objects and travel strips are cut out of their backdrop and trimmed; scenes, portraits, evidence and maps are cropped to size. A figure with a `reference` is drawn from that person's current portrait.

## How a live version reaches players

- Versions are kept in the private `art` bucket (images only, 20 MB each) at `art/<id>-<version>.webp`, served by `src/app/art/gen/[file]/route.ts` at `/art/gen/<id>-<version>.webp` (cached for good, since every version has its own name).
- `art_images.live_version` says which version is live. `refreshArt()` in `src/game/registry.ts` reads it (at most every 20 seconds), lays live versions over the committed paintings in `src/art/painted.ts`, and rebuilds every case's assets. The play pages and game actions call it before building a view.
- Case covers load through `/art/live/<image id>`, which sends the browser to the live version (else the committed painting), so a new cover shows within about 20 seconds on every page. Other site and travel pictures (home page, travel scenes, maps) are read from the committed list (`src/art/generated.json`), so an Admin-made version of those shows only once it is committed to `public/art` with `node scripts/import-art.mjs`; ask a chat to do that.

## Rules for a case's art

1. **`assets.ts` must use the shared painting list and be rebuildable.** Import `painted` from `@/art/painted` (never `generated.json` directly), and export `buildAssets()` with `export const assets = buildAssets();`. Register it in `BUILD` in `src/game/registry.ts` next to the case. Without this, Admin-made art for that case never reaches players.
2. **Text that matters is spelled out in the prompt.** For a headline, sign, label or name on a door, quote the exact words line by line and say they must be printed exactly as written. Everything else stays soft and unreadable; the full wording lives in the evidence text.
3. **Every image has a manifest entry**, so it appears on Admin. A picture added only as a file in `public/art` can't be regenerated there.

## Walkable rooms (every case after C001)

Cases after C001 are played in walkable 3D rooms, and their old flat scene paintings (`background`, `panorama`, `pov`, `strip`, `sprite`, `figure`) are no longer listed on Admin. Pictures already made for them stay in the game until the walkable rooms replace them. The full contract is `art/WALKABLE.md`; in short:

- **Kinds:** `wall`, `floor` and `ceiling` are seamless tiles; `trim` is a length of baseboard, chair rail or crown molding that code runs around the room; `piece` is one thing on a wall (door, window, picture, board) cut out with transparent glass; `fixture` is a ceiling light seen from below; `outside` is the view through a window or around an outdoor place; `model` is a Meshy 3D model; `turn` is a person's front, side or back view for their 3D character, drawn from their portrait.
- **Flat light:** these kinds use the case's `looks` line (style, era and palette, no lighting) instead of its lit `styles` line, because the rooms are lit in code.
- **Rooms:** `rooms` in the manifest holds one record per location: its size in feet (about 50% more floor area than C001's rooms), which tiles, trim and pieces go where, the 3D models and who is found there. Admin shows each case's pictures grouped by room with the room's size, and a Room filter.
- **3D models:** a `model` row's picture is the reference for Meshy's Image to 3D. **Copy Meshy prompt** copies the text version. **Upload 3D model (GLB)** sends the file Meshy makes straight to storage (up to 50 MB; it skips the server's request limit with a signed upload), records it in `art_models`, and makes it the one in use (`art_images.live_model`). Files are `art/<id>-<version>.glb`, served at `/art/gen/<id>-<version>.glb`.
- **Character views:** every person with a portrait gets `<case>_turn_<person>_front`, `_side` and `_back`. Make the portrait first; the side and back views also look at the front view.
- **Adding or changing a case's list:** write a file in the format of `art/WALKABLE.md` and run `node scripts/merge-walkable-art.mjs <file.json>`. It checks ids, kinds, sizes and room references, retires the old 2D entries, applies prompt fixes and adds the character views. `--turns-only <prefix>` adds just the character views (C001 has them this way).
- **In the walk viewer** (`src/game/walk/walk-viewer.tsx`), a wall with `tile`, `lower` or `pieces` is built as a tiled surface with real openings cut through it for doors and windows, pieces laid on it, and the room's `trim` (baseboard, chair rail, crown) run along every wall and broken at openings. Rooms can also have `fixtures` (ceiling lights that glow with the room light) and a tiling `ceil.repeat`.

## A case's own travel scenes

The drive and the walk between places are picked by the destination's area (`area` on the location). Each layer is chosen on its own, first match wins:

1. `<case>_travel_<layer>_<area>`, e.g. `c002_travel_drive_far_tamarack` or `c004_travel_walk_wcrb`;
2. `<case>_travel_<layer>`, the case's general one;
3. the agency's Los Angeles painting (`travel_<layer>`), never for a medieval case.

The layers are `drive_far` (panorama), `drive_near` and `drive_car` (strips) and `walk` (pov). A walk happens between two places in the same area, so a walk picture is named for that area. Adding the manifest entry is all the wiring needed: the registry hands every `<case>_travel_*` painting to the case as `ui.travel_*`, live versions included.

Made so far as prompts: C002 (the coast town, Long Beach, the mountains, Oak Terrace, Wilshire; mountain pines; walks in Mariposa Bay and at the lake; it keeps the agency's car), C003 (Bellwether, Pittsburgh, downtown, Route 51, the river, the county; walks on Alder Street and downtown), C004 (1927 Chicago, the river, Hyde Park, Halsted; a Packard; walks in the WCRB corridor, the Loop, North Clark Street and the river), C005 (the moor walk).

## Talking portraits (kind "face")

A person who talks on screen has a front-facing portrait (`<case>_portrait_<person>`, with a front-facing `suffix`) and six frames: `<case>_<person>_mouth_open_slight`, `_mouth_ah`, `_mouth_ee`, `_mouth_oh`, `_mouth_oo` and `_blink` (optional `_mouth_f`). Each frame is kind `face` with `reference` set to the portrait, so it is made as an edit of the portrait that changes only the mouth (or the eyes).

When a frame is generated or uploaded, the studio blends it onto the person's current portrait (`blendFace` in `src/lib/art-studio.ts`, the same method as `scripts/build-faces.py`): only the area that changed is kept, feathered, so nothing else in the face shimmers when frames switch. So:

- **Make the portrait live before its frames.** "Generate all missing" goes in manifest order (portraits first), so with "Make missing images live straight away" ticked this happens by itself.
- **If a portrait is replaced, make its six frames again**, or the mouth will come from the old face.

The case's `assets.ts` maps them to `face.<person>.<shape>`; with every frame present, interviews show the talking portrait (`src/game/ui/talking-portrait.tsx`). See the project doc "character-animation-plan".

## The OpenAI key

The server setting `OPENAI_API_KEY` (Vercel). Until that is set, a temporary key saved in `site_settings` (`openai_api_key`) is used, and Admin shows a note saying so. Never put a key in the code or a doc.

## Quality and costs

Each case's section has a **Quality** setting, shared by every section and remembered on the device:

| Setting | Model and quality | Square picture (evidence, objects) | Wide or tall (scenes, portraits, figures) |
| --- | --- | --- | --- |
| Draft | gpt-image-1-mini, low | about $0.005 | about $0.008 |
| Standard (default) | gpt-image-1.5, medium | about $0.034 | about $0.05 |
| Best | gpt-image-1.5, high | about $0.13 | about $0.20 |

Edits from a reference image (figures, talking-portrait frames) cost about a fifth more. A flat 2D case at Standard was roughly $2 to $5. A walkable case has far more pictures (about 220 to 690 counting its portraits, evidence and talking frames; most of the new ones are Meshy reference pictures and wall pieces), so a whole case at Standard is roughly $8 to $30; Draft is a cheap way to see a room's look first. The estimate shows before every run and each version records its cost (`art_versions.cost_usd`, model and quality in `model`); Admin shows the running total per case. If gpt-image-1.5 isn't available on the account, the site falls back to gpt-image-1-mini (gpt-image-1 was retired on Oct 23, 2026). `OPENAI_IMAGE_MODEL`, if set on the server, replaces the model for every setting.
