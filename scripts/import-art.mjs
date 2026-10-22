#!/usr/bin/env node
/**
 * Brings hand-made artwork into the game.
 *
 *   node scripts/import-art.mjs            import every new or changed image in art/inbox
 *   node scripts/import-art.mjs --force    re-import everything in art/inbox
 *
 * Save each image in art/inbox named after its id in art/manifest.json
 * (c001_loc_office.png, c001_obj_phone.jpg, ...). PNG, JPG and WebP all work.
 * Each one is cropped and resized for its kind, saved as public/art/<id>.webp
 * and listed in src/art/generated.json, which is what the game reads.
 *
 * People (figure) and objects (sprite) are painted on a plain background; that
 * background is removed here by flooding in from the edges, so the person or
 * object can stand in a scene. Images that already have transparency are kept as they are.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const force = process.argv.includes("--force");
const inbox = join(root, "art", "inbox");
const outDir = join(root, "public", "art");
const registryPath = join(root, "src", "art", "generated.json");
const manifest = JSON.parse(readFileSync(join(root, "art", "manifest.json"), "utf8"));
const byId = new Map(manifest.images.map((i) => [i.id, i]));
mkdirSync(outDir, { recursive: true });
mkdirSync(inbox, { recursive: true });
const registry = existsSync(registryPath) ? JSON.parse(readFileSync(registryPath, "utf8")) : { images: {} };

/** Output size per kind. Backgrounds are 16:9 to match the game screen. */
const SIZE = {
  background: [1920, 1080],
  site: [1536, 1024],
  portrait: [1024, 1536],
  evidence: [1024, 1024],
  panorama: [1920, 1080],
  pov: [1920, 1080],
  map: [1600, 1200],
  figure: null,
  sprite: null,
  strip: null,
};

/** Makes the plain backdrop around a person or object transparent. */
async function cutOut(input) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  if ((await sharp(input).metadata()).hasAlpha) {
    // Already cut out if the corners are transparent.
    const corners = [0, w - 1, (h - 1) * w, h * w - 1];
    if (corners.every((p) => data[p * 4 + 3] < 16)) return sharp(input).png().toBuffer();
  }
  // Backdrop colour: the median of the border pixels.
  const border = [];
  for (let x = 0; x < w; x += 4) border.push(x, (h - 1) * w + x);
  for (let y = 0; y < h; y += 4) border.push(y * w, y * w + w - 1);
  const med = [0, 1, 2].map((c) => border.map((p) => data[p * 4 + c]).sort((a, b) => a - b)[border.length >> 1]);
  const dist = (p) => Math.hypot(data[p * 4] - med[0], data[p * 4 + 1] - med[1], data[p * 4 + 2] - med[2]);
  const HARD = 30; // clearly backdrop
  const SOFT = 52; // edge: partly transparent
  const seen = new Uint8Array(w * h);
  const queue = new Int32Array(w * h);
  let head = 0;
  let tail = 0;
  const push = (p) => {
    if (!seen[p] && dist(p) < SOFT) {
      seen[p] = 1;
      queue[tail++] = p;
    }
  };
  for (let x = 0; x < w; x++) push(x), push((h - 1) * w + x);
  for (let y = 0; y < h; y++) push(y * w), push(y * w + w - 1);
  while (head < tail) {
    const p = queue[head++];
    const d = dist(p);
    data[p * 4 + 3] = d <= HARD ? 0 : Math.round((255 * (d - HARD)) / (SOFT - HARD));
    if (d > HARD) continue; // do not flood through the soft edge into the subject
    const x = p % w;
    if (x > 0) push(p - 1);
    if (x < w - 1) push(p + 1);
    if (p >= w) push(p - w);
    if (p < w * (h - 1)) push(p + w);
  }
  // Trim to the subject with a small margin.
  return sharp(data, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer();
}

const files = readdirSync(inbox).filter((f) => /\.(png|jpe?g|webp)$/i.test(f));
let imported = 0;
const unknown = [];
for (const f of files) {
  const id = f.slice(0, -extname(f).length).trim().toLowerCase();
  const img = byId.get(id);
  if (!img) {
    unknown.push(f);
    continue;
  }
  const src = join(inbox, f);
  const out = join(outDir, `${id}.webp`);
  if (!force && existsSync(out) && statSync(out).mtimeMs >= statSync(src).mtimeMs && registry.images[id]) continue;
  let pipeline;
  if (img.kind === "figure" || img.kind === "sprite" || img.kind === "strip") {
    const cut = await cutOut(readFileSync(src));
    const trimmed = await sharp(cut).trim({ threshold: 1 }).toBuffer();
    // Travel strips (the roadside row and the car) are wide; people and objects are not.
    const [mw, mh] = img.kind === "strip" ? [2400, 1350] : [1024, 1536];
    pipeline = sharp(trimmed).resize({ width: mw, height: mh, fit: "inside", withoutEnlargement: true });
  } else {
    const [width, height] = SIZE[img.kind];
    pipeline = sharp(src).resize({ width, height, fit: "cover", position: "centre" });
  }
  await pipeline.webp({ quality: 86, alphaQuality: 90 }).toFile(out);
  registry.images[id] = { url: `/art/${id}.webp`, kind: img.kind, model: "hand-imported", generatedAt: new Date().toISOString() };
  imported++;
  console.log(`  ok   ${id}`);
}
writeFileSync(registryPath, JSON.stringify({ images: Object.fromEntries(Object.entries(registry.images).sort()) }, null, 2) + "\n");
console.log(`\nImported ${imported} image(s). ${Object.keys(registry.images).length} of ${manifest.images.length} are in the game.`);
if (unknown.length) console.log(`Not recognised (check the file name): ${unknown.join(", ")}`);
const missing = manifest.images.filter((i) => !registry.images[i.id]).map((i) => i.id);
if (missing.length) console.log(`Still to make: ${missing.join(", ")}`);
