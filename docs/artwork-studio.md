# Artwork Studio

How Blackwood artwork is made, Oct 27, 2026. Read this before adding or changing art for any case.

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

- Versions are kept in the private `narration` bucket at `art/<id>-<version>.webp`, served by `src/app/art/gen/[file]/route.ts` at `/art/gen/<id>-<version>.webp` (cached for good, since every version has its own name).
- `art_images.live_version` says which version is live. `refreshArt()` in `src/game/registry.ts` reads it (at most every 20 seconds), lays live versions over the committed paintings in `src/art/painted.ts`, and rebuilds every case's assets. The play pages and game actions call it before building a view.
- Site and travel pictures (home page, travel scenes, maps, case covers) are read in the browser from the committed list, so a live version of those shows after the next site update.

## Rules for a case's art

1. **`assets.ts` must use the shared painting list and be rebuildable.** Import `painted` from `@/art/painted` (never `generated.json` directly), and export `buildAssets()` with `export const assets = buildAssets();`. Register it in `BUILD` in `src/game/registry.ts` next to the case. Without this, Admin-made art for that case never reaches players.
2. **Text that matters is spelled out in the prompt.** For a headline, sign, label or name on a door, quote the exact words line by line and say they must be printed exactly as written. Everything else stays soft and unreadable; the full wording lives in the evidence text.
3. **Every image has a manifest entry**, so it appears on Admin. A picture added only as a file in `public/art` can't be regenerated there.

## The OpenAI key

The server setting `OPENAI_API_KEY` (Vercel). Until that is set, a temporary key saved in `site_settings` (`openai_api_key`) is used, and Admin shows a note saying so. Never put a key in the code or a doc.

## Costs

Each version records an estimate (`art_versions.cost_usd`): about $0.04 for evidence and objects at medium quality, $0.25 for scenes, portraits and figures at high quality. Admin shows the running total per case.
