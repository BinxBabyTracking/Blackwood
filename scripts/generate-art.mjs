#!/usr/bin/env node
/**
 * Generates the game's painted artwork with the OpenAI Images API.
 *
 *   node scripts/generate-art.mjs                    every image not yet generated
 *   node scripts/generate-art.mjs --kind background  one kind (background, portrait, figure, sprite, evidence, site)
 *   node scripts/generate-art.mjs --only c001_loc_office,c001_obj_phone
 *   node scripts/generate-art.mjs --force --only c001_loc_diner   regenerate
 *   node scripts/generate-art.mjs --dry              print what would be generated, and the prompts
 *
 * Reads OPENAI_API_KEY (and optionally OPENAI_IMAGE_MODEL) from .env.local or
 * the environment. The key is only sent to api.openai.com. Images are saved as
 * WebP in public/art/, and src/art/generated.json lists them; the game uses an
 * image as soon as it appears there and keeps its placeholder until then.
 * Plain Node 18+, no packages needed.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const value = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};

function loadEnv() {
  const env = { ...process.env };
  for (const file of [".env.local", ".env"]) {
    const p = join(root, file);
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
      const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
      if (m && env[m[1]] === undefined) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
  return env;
}

const env = loadEnv();
const KEY = env.OPENAI_API_KEY ?? "";
const BASE = (env.OPENAI_API_BASE ?? "https://api.openai.com").replace(/\/$/, "");
const MODELS = (env.OPENAI_IMAGE_MODEL ? [env.OPENAI_IMAGE_MODEL] : ["gpt-image-1.5", "gpt-image-1"]);
const manifest = JSON.parse(readFileSync(join(root, "art", "manifest.json"), "utf8"));
const outDir = join(root, "public", "art");
const registryPath = join(root, "src", "art", "generated.json");
mkdirSync(outDir, { recursive: true });
mkdirSync(dirname(registryPath), { recursive: true });
const registry = existsSync(registryPath) ? JSON.parse(readFileSync(registryPath, "utf8")) : { images: {} };

const only = value("only")?.split(",").map((s) => s.trim());
const kind = value("kind");
const force = flag("force");
const dry = flag("dry");
const concurrency = Number(value("concurrency") ?? 3);

function promptFor(img) {
  const k = manifest.kinds[img.kind];
  const person = img.person ? `${manifest.people[img.person]}. ` : "";
  // A case can have its own style line (its year and place), and an image its own framing.
  const style = img.style ? manifest.styles[img.style] : manifest.style;
  return `${style}\n\n${img.suffix ?? k.suffix}\n\nSubject: ${person}${img.subject}`;
}

const fileFor = (img) => join(outDir, `${img.id}.webp`);
const urlFor = (img) => `/art/${img.id}.webp`;

const jobs = manifest.images.filter((img) => {
  if (only && !only.includes(img.id)) return false;
  if (kind && img.kind !== kind) return false;
  if (!force && existsSync(fileFor(img))) return false;
  return true;
});
// References must exist before the images that use them: portraits before figures.
const order = { site: 0, background: 1, portrait: 2, evidence: 3, sprite: 4, figure: 5 };
jobs.sort((a, b) => order[a.kind] - order[b.kind]);

if (dry) {
  for (const j of jobs) console.log(`\n=== ${j.id} (${j.kind}, ${manifest.kinds[j.kind].size}, ${manifest.kinds[j.kind].quality}${j.reference ? `, reference ${j.reference}` : ""})\n${promptFor(j)}`);
  console.log(`\n${jobs.length} image(s) would be generated.`);
  process.exit(0);
}
if (!KEY) {
  console.error("OPENAI_API_KEY is not set. Add it to .env.local (OPENAI_API_KEY=sk-...) and run again.");
  process.exit(1);
}
if (!jobs.length) {
  console.log("Nothing to generate. Use --force to regenerate.");
  process.exit(0);
}

let model = MODELS[0];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function call(img, attempt = 1) {
  const k = manifest.kinds[img.kind];
  const prompt = promptFor(img);
  const ref = img.reference ? join(outDir, `${img.reference}.webp`) : null;
  const used = model;
  const common = { model: used, prompt, size: k.size, quality: k.quality, background: k.background, output_format: "webp", output_compression: 88, n: 1 };
  let res;
  if (ref && existsSync(ref)) {
    // Same person: draw the full figure from their portrait.
    const form = new FormData();
    for (const [key, v] of Object.entries(common)) form.append(key, String(v));
    form.append("image[]", new Blob([readFileSync(ref)], { type: "image/webp" }), `${img.reference}.webp`);
    res = await fetch(`${BASE}/v1/images/edits`, { method: "POST", headers: { Authorization: `Bearer ${KEY}` }, body: form });
  } else {
    res = await fetch(`${BASE}/v1/images/generations`, {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify(common),
    });
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    // Fall back to the next model if this one is not available on the account.
    const unknownModel = res.status === 404 || /model[^\n]{0,80}(not found|does not exist|invalid|not supported|do not have access|not available)/i.test(text);
    // Another request may already have switched models; just try again with the current one.
    if (unknownModel && used !== model) return call(img, attempt);
    if (unknownModel && MODELS.indexOf(model) < MODELS.length - 1) {
      const next = MODELS[MODELS.indexOf(model) + 1];
      console.warn(`  ${model} is not available (${res.status}); using ${next}.`);
      model = next;
      return call(img, attempt);
    }
    if ((res.status === 429 || res.status >= 500) && attempt < 4) {
      const wait = 4000 * attempt;
      console.warn(`  ${img.id}: ${res.status}, retrying in ${wait / 1000}s`);
      await sleep(wait);
      return call(img, attempt + 1);
    }
    throw new Error(`${res.status} ${text.slice(0, 400)}`);
  }
  const body = await res.json();
  const b64 = body.data?.[0]?.b64_json;
  if (!b64) throw new Error("No image returned");
  return Buffer.from(b64, "base64");
}

let done = 0;
let failed = 0;
async function worker(queue) {
  for (let img = queue.shift(); img; img = queue.shift()) {
    const started = Date.now();
    try {
      const buf = await call(img);
      writeFileSync(fileFor(img), buf);
      registry.images[img.id] = { url: urlFor(img), kind: img.kind, model, generatedAt: new Date().toISOString() };
      writeFileSync(registryPath, JSON.stringify(registry, null, 2) + "\n");
      done++;
      console.log(`  ok   ${img.id}  (${Math.round(buf.length / 1024)} KB, ${Math.round((Date.now() - started) / 1000)}s)`);
    } catch (e) {
      failed++;
      console.error(`  FAIL ${img.id}: ${e.message}`);
    }
  }
}

console.log(`Generating ${jobs.length} image(s) with ${model}...`);
// Figures wait for their portraits, so run them after everything else.
const first = jobs.filter((j) => j.kind !== "figure");
const later = jobs.filter((j) => j.kind === "figure");
await Promise.all(Array.from({ length: concurrency }, () => worker(first)));
await Promise.all(Array.from({ length: concurrency }, () => worker(later)));
console.log(`\nDone: ${done} generated, ${failed} failed. Images are in public/art; refresh the game to see them.`);
if (failed) process.exit(1);
