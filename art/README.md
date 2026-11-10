# Painted artwork

`manifest.json` lists every painted image: the shared style, how each kind of image is framed, a fixed description of each person (reused everywhere so they stay recognizable), and one subject line per image.

`node scripts/generate-art.mjs` generates whatever is missing with the OpenAI Images API, using `OPENAI_API_KEY` from `.env.local` (optional `OPENAI_IMAGE_MODEL`; it tries `gpt-image-1.5` and falls back to `gpt-image-1`). Images are saved as WebP in `public/art/` and listed in `src/art/generated.json`; the game switches to each image as soon as it is listed and keeps the drawn placeholder until then.

Useful options: `--dry` (show prompts, generate nothing), `--kind background`, `--only id1,id2`, `--force` (regenerate), `--concurrency 3`.

How a C001 flat scene was built: the location background is painted without people or small objects; each person (`figure`, a full-length cut-out drawn from their portrait so the face matches) and each small object (`sprite`, transparent cut-out) is drawn on top at its hotspot rectangle in `src/cases/C001/locations.ts`. Large fixtures (doors, windows, sofas, the jukebox) are part of the background, so after a background is generated its hotspot rectangles are adjusted to match where those fixtures landed.

To change an image: edit its subject (or the shared style) and run with `--force --only <id>`.

Walkable 3D rooms (every case after C001) are listed differently: tileable walls, floors and ceilings, trim run around the room in code, wall pieces, ceiling lights, views outside, Meshy 3D models and character views, with a room record giving each room's size and layout. See `WALKABLE.md`.
