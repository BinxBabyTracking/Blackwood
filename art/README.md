# Painted artwork

`manifest.json` lists every painted image: the shared style, how each kind of image is framed, a fixed description of each person (reused everywhere so they stay recognisable), and one subject line per image.

`node scripts/generate-art.mjs` generates whatever is missing with the OpenAI Images API, using `OPENAI_API_KEY` from `.env.local` (optional `OPENAI_IMAGE_MODEL`; it tries `gpt-image-1.5` and falls back to `gpt-image-1`). Images are saved as WebP in `public/art/` and listed in `src/art/generated.json`; the game switches to each image as soon as it is listed and keeps the drawn placeholder until then.

Useful options: `--dry` (show prompts, generate nothing), `--kind background`, `--only id1,id2`, `--force` (regenerate), `--concurrency 3`.

How a scene is built: the location background is painted without people or small objects; each person (`figure`, a full-length cut-out drawn from their portrait so the face matches) and each small object (`sprite`, transparent cut-out) is drawn on top at its hotspot rectangle in `src/cases/C001/locations.ts`. Large fixtures (doors, windows, sofas, the jukebox) are part of the background, so after a background is generated its hotspot rectangles are adjusted to match where those fixtures landed.

To change an image: edit its subject (or the shared style) and run with `--force --only <id>`.
