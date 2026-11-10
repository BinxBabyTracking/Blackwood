import "server-only";
import sharp from "sharp";
import manifestJson from "../../art/manifest.json";
import generated from "@/art/generated.json";
import { liveArtUrl, liveModelUrl } from "@/art/painted";
import { createAdminClient } from "@/lib/supabase/admin";
import { meshyText } from "@/lib/meshy";

/*
 * The Admin artwork studio. Every image in art/manifest.json can be made with
 * OpenAI's image model (or uploaded), reviewed, and made live. A live version
 * replaces the committed painting in public/art for every player; the
 * committed one stays as the fallback. Files are kept in the private
 * "art" bucket (art/<id>-<version>.webp) and served by /art/gen/<id>-<version>.webp.
 */

/** look: a walkable-room kind, drawn flat-lit in the case's look line (looks) instead of its lit painting style. */
type Kind = { size: string; quality: "low" | "medium" | "high"; background: "opaque" | "transparent"; suffix: string; look?: boolean };
/**
 * size overrides the kind's (wall pieces come tall, wide or square); room is the walkable room it belongs to;
 * also lists more pictures to draw from beside the reference (a side view also sees the front view).
 */
type ImageDef = { id: string; kind: string; subject: string; style?: string; suffix?: string; person?: string; reference?: string; also?: string[]; size?: string; room?: string };
/** A walkable room: its size and what goes where. See art/WALKABLE.md. */
export type RoomSpec = { id: string; case: string; location?: string; name: string; type?: "interior" | "exterior"; sizeFt?: number[]; reuse?: string; note?: string; [k: string]: unknown };
const manifest = manifestJson as unknown as {
  style: string;
  styles?: Record<string, string>;
  looks?: Record<string, string>;
  kinds: Record<string, Kind>;
  people: Record<string, string>;
  images: ImageDef[];
  rooms?: RoomSpec[];
};
/** Every walkable room record, for showing each room's size and pieces on Admin. */
export const roomSpecs = (): RoomSpec[] => manifest.rooms ?? [];
/** Kinds that are a 3D model made in Meshy: the picture is its reference, and a GLB file is uploaded for it. */
export const isModelKind = (kind: string) => kind === "model";
const committed = (generated as { images: Record<string, { url: string }> }).images;

const BUCKET = "art";
const API_BASE = (process.env.OPENAI_API_BASE ?? "https://api.openai.com").replace(/\/$/, "");

/**
 * Quality settings chosen on Admin. Draft is for trying ideas cheaply; Standard
 * is the everyday setting; Best is for the few pictures that matter most.
 * OPENAI_IMAGE_MODEL, if set on the server, replaces the model for every setting.
 */
export type Tier = "draft" | "standard" | "best";
const TIERS: Record<Tier, { model: string; quality: "low" | "medium" | "high" }> = {
  draft: { model: "gpt-image-1-mini", quality: "low" },
  standard: { model: "gpt-image-1.5", quality: "medium" },
  best: { model: "gpt-image-1.5", quality: "high" },
};
/** Used when a model isn't available on the account (gpt-image-1.5 can need a verified organization). */
const FALLBACK = "gpt-image-1-mini";
const unavailable = new Set<string>();
const modelFor = (tier: Tier) => {
  const want = process.env.OPENAI_IMAGE_MODEL || TIERS[tier].model;
  return unavailable.has(want) ? FALLBACK : want;
};

function db() {
  const a = createAdminClient();
  if (!a) throw new Error("The server is not configured for storage.");
  return a;
}

/** The OpenAI key: the OPENAI_API_KEY setting on the server, or (until that is set) the one saved in site settings. */
async function apiKey() {
  if (process.env.OPENAI_API_KEY) return { key: process.env.OPENAI_API_KEY, from: "server setting" as const };
  const { data } = await db().from("site_settings").select("value").eq("key", "openai_api_key").maybeSingle();
  const v = (data as { value: unknown } | null)?.value;
  return typeof v === "string" && v.startsWith("sk-") ? { key: v, from: "site settings" as const } : null;
}

export async function artKeyStatus() {
  const k = await apiKey().catch(() => null);
  return { configured: Boolean(k), from: k?.from ?? null, model: modelFor("standard") };
}

/** OpenAI's list price per square image, by model and quality (Oct 2026). Wide and tall pictures cost about half as much again. */
const PRICE: Record<string, Record<"low" | "medium" | "high", number>> = {
  "gpt-image-1.5": { low: 0.009, medium: 0.034, high: 0.133 },
  "gpt-image-1-mini": { low: 0.005, medium: 0.011, high: 0.036 },
};

/** Rough price of one image of a kind at a quality setting, in dollars. Edits from a reference image cost a little more. */
function costOf(k: Kind, model: string, quality: "low" | "medium" | "high", edit = false, size = k.size) {
  const base = (PRICE[model] ?? PRICE["gpt-image-1.5"])[quality] * (size === "1024x1024" ? 1 : 1.5);
  return Math.round(base * (edit ? 1.2 : 1) * 1000) / 1000;
}

/** What one image costs at each setting, for the estimate shown before a run. */
export function pricesFor(id: string): Record<Tier, number> {
  const img = manifest.images.find((i) => i.id === id);
  const k = img ? manifest.kinds[img.kind] : undefined;
  const out = { draft: 0, standard: 0, best: 0 };
  if (!k) return out;
  for (const t of Object.keys(TIERS) as Tier[]) out[t] = costOf(k, process.env.OPENAI_IMAGE_MODEL || TIERS[t].model, TIERS[t].quality, Boolean(img?.reference), img?.size);
  return out;
}

/** Which case an image belongs to, from its id: c002_ev_e11 is C002; site and travel art is shared. */
/** The case an image belongs to, from its id prefix: c004_, s001c05_, hallow001_, chr001_. Anything else is the site's own. */
export const groupOf = (id: string) => /^([cs]\d{3}(?:c\d{2})?|hallow\d{3}|chr\d{3})_/.exec(id)?.[1].toUpperCase() ?? "Shared";

/** For flat-lit walkable art: what may be written in a picture. */
const WORDS =
  "The only readable words are the ones the subject spells out, printed exactly as written and correctly spelled; anything else with writing on it is soft and unreadable. No logos, brand names, watermarks or signatures.";

/** The case's style key for an image: its own, else its id prefix (c002_, s001c03_ falls back to s001). */
function styleKey(img: ImageDef) {
  if (img.style) return img.style;
  const g = groupOf(img.id).toLowerCase();
  return g === "shared" ? "c001" : g;
}

function promptFor(img: ImageDef, subject: string) {
  const k = manifest.kinds[img.kind];
  const person = img.person && manifest.people[img.person] ? `${manifest.people[img.person]}. ` : "";
  if (k.look) {
    const key = styleKey(img);
    const look = manifest.looks?.[key] ?? manifest.looks?.[key.slice(0, 4)] ?? manifest.looks?.c001 ?? "";
    return `${look} ${WORDS}\n\n${img.suffix ?? k.suffix}\n\nSubject: ${person}${subject}`;
  }
  const style = img.style && manifest.styles?.[img.style] ? manifest.styles[img.style] : manifest.style;
  return `${style}\n\n${img.suffix ?? k.suffix}\n\nSubject: ${person}${subject}`;
}


export interface ArtRow {
  id: string;
  kind: string;
  group: string;
  subject: string;
  defaultSubject: string;
  edited: boolean;
  /** What players see now: a live version, the committed painting, or nothing yet. */
  current: string | null;
  committed: string | null;
  live: number | null;
  versions: { version: number; url: string; createdAt: string; source: string; model: string | null; cost: number }[];
  cost: number;
  /** The walkable room it belongs to. */
  room: string | null;
  /** For a model: the 3D files uploaded, newest first, and which one the game uses. */
  models: { version: number; url: string; createdAt: string; bytes: number }[];
  liveModel: number | null;
}

/** Every image, with what's live, every version made, and its prompt. */
export async function artRows(): Promise<ArtRow[]> {
  const [{ data: imgs }, { data: vers }, { data: mods }] = await Promise.all([
    db().from("art_images").select("id, live_version, live_model, subject"),
    db().from("art_versions").select("image_id, version, created_at, source, model, cost_usd").order("version", { ascending: false }).limit(20000),
    db().from("art_models").select("image_id, version, created_at, size_bytes").order("version", { ascending: false }).limit(20000),
  ]);
  const meta = new Map(((imgs ?? []) as { id: string; live_version: number | null; live_model: number | null; subject: string | null }[]).map((r) => [r.id, r]));
  const modelsOf = new Map<string, ArtRow["models"]>();
  for (const v of (mods ?? []) as { image_id: string; version: number; created_at: string; size_bytes: number }[]) {
    const list = modelsOf.get(v.image_id) ?? modelsOf.set(v.image_id, []).get(v.image_id)!;
    list.push({ version: v.version, url: liveModelUrl(v.image_id, v.version), createdAt: v.created_at, bytes: Number(v.size_bytes) });
  }
  const byImage = new Map<string, ArtRow["versions"]>();
  for (const v of (vers ?? []) as { image_id: string; version: number; created_at: string; source: string; model: string | null; cost_usd: number }[]) {
    const list = byImage.get(v.image_id) ?? byImage.set(v.image_id, []).get(v.image_id)!;
    list.push({ version: v.version, url: liveArtUrl(v.image_id, v.version), createdAt: v.created_at, source: v.source, model: v.model, cost: Number(v.cost_usd) });
  }
  return manifest.images.map((img) => {
    const m = meta.get(img.id);
    const versions = byImage.get(img.id) ?? [];
    const live = m?.live_version ?? null;
    const base = committed[img.id]?.url ?? null;
    return {
      id: img.id,
      kind: img.kind,
      group: groupOf(img.id),
      subject: m?.subject ?? img.subject,
      defaultSubject: img.subject,
      edited: Boolean(m?.subject),
      current: live ? liveArtUrl(img.id, live) : base,
      committed: base,
      live,
      versions,
      cost: versions.reduce((n, v) => n + v.cost, 0),
      room: img.room ?? null,
      models: modelsOf.get(img.id) ?? [],
      liveModel: m?.live_model ?? null,
    };
  });
}

export async function readArtFile(file: string) {
  const { data } = await db().storage.from(BUCKET).download(`art/${file}`);
  return data ? data.arrayBuffer() : null;
}

/** Makes the plain backdrop around a person or object transparent (the same cut as scripts/import-art.mjs). */
async function cutOut(input: Buffer) {
  const meta = await sharp(input).metadata();
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;
  if (meta.hasAlpha) {
    const corners = [0, w - 1, (h - 1) * w, h * w - 1];
    if (corners.every((p) => data[p * 4 + 3] < 16)) return sharp(input).png().toBuffer();
  }
  const border: number[] = [];
  for (let x = 0; x < w; x += 4) border.push(x, (h - 1) * w + x);
  for (let y = 0; y < h; y += 4) border.push(y * w, y * w + w - 1);
  const med = [0, 1, 2].map((c) => border.map((p) => data[p * 4 + c]).sort((a, b) => a - b)[border.length >> 1]);
  const dist = (p: number) => Math.hypot(data[p * 4] - med[0], data[p * 4 + 1] - med[1], data[p * 4 + 2] - med[2]);
  const HARD = 30;
  const SOFT = 52;
  const seen = new Uint8Array(w * h);
  const queue = new Int32Array(w * h);
  let head = 0;
  let tail = 0;
  const push = (p: number) => {
    if (!seen[p] && dist(p) < SOFT) {
      seen[p] = 1;
      queue[tail++] = p;
    }
  };
  for (let x = 0; x < w; x++) {
    push(x);
    push((h - 1) * w + x);
  }
  for (let y = 0; y < h; y++) {
    push(y * w);
    push(y * w + w - 1);
  }
  while (head < tail) {
    const p = queue[head++];
    const d = dist(p);
    data[p * 4 + 3] = d <= HARD ? 0 : Math.round((255 * (d - HARD)) / (SOFT - HARD));
    if (d > HARD) continue;
    const x = p % w;
    if (x > 0) push(p - 1);
    if (x < w - 1) push(p + 1);
    if (p >= w) push(p - w);
    if (p < w * (h - 1)) push(p + w);
  }
  return sharp(data, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer();
}

const SIZE: Record<string, [number, number]> = {
  background: [1920, 1080],
  site: [1536, 1024],
  portrait: [1024, 1536],
  evidence: [1024, 1024],
  panorama: [1920, 1080],
  pov: [1920, 1080],
  map: [1600, 1200],
  outside: [1920, 1080],
};

/**
 * A talking-portrait frame: the edit of the portrait with only the changed area
 * kept, the mouth (or the eyes, for a blink) blended into the untouched portrait.
 * An image model redraws small things on every edit, so a raw edit would make
 * the whole face shimmer as frames switch. Same method as scripts/build-faces.py.
 */
async function blendFace(id: string, edit: Buffer, base: Buffer) {
  const [W, H] = SIZE.portrait;
  const raw = (b: Buffer) => sharp(b).resize({ width: W, height: H, fit: "cover", position: "centre" }).removeAlpha().raw().toBuffer();
  const [e, b] = await Promise.all([raw(edit), raw(base)]);
  const blink = id.endsWith("_blink");
  // Where the edit differs from the portrait, softened, inside the band where a mouth or eyes can be.
  const diff = Buffer.alloc(W * H);
  for (let p = 0; p < W * H; p++) diff[p] = Math.min(255, (Math.abs(e[p * 3] - b[p * 3]) + Math.abs(e[p * 3 + 1] - b[p * 3 + 1]) + Math.abs(e[p * 3 + 2] - b[p * 3 + 2])) / 3);
  const soft = await sharp(diff, { raw: { width: W, height: H, channels: 1 } }).blur(6).extractChannel(0).raw().toBuffer();
  const [y0b, y1b] = blink ? [0.2, 0.45] : [0.3, 0.7];
  const xs: number[] = [];
  const ys: number[] = [];
  for (let y = Math.floor(y0b * H); y < Math.floor(y1b * H); y++) {
    for (let x = Math.floor(0.2 * W); x < Math.floor(0.8 * W); x++) {
      if (soft[y * W + x] > 18) {
        xs.push(x);
        ys.push(y);
      }
    }
  }
  if (xs.length < 50) throw new Error("The edit changed nothing in the face. Generate it again.");
  const pct = (a: number[], q: number) => [...a].sort((m, n) => m - n)[Math.min(a.length - 1, Math.floor(q * a.length))];
  const [x0, x1, y0, y1] = [pct(xs, 0.01), pct(xs, 0.99), pct(ys, 0.01), pct(ys, 0.99)];
  const margin = blink ? 0.25 : 0.35;
  const mx = (x1 - x0) * margin;
  const my = (y1 - y0) * margin;
  const feather = Math.max(8, (x1 - x0) * 0.12);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="100%" height="100%" fill="black"/><ellipse cx="${(x0 + x1) / 2}" cy="${(y0 + y1) / 2}" rx="${(x1 - x0) / 2 + mx}" ry="${(y1 - y0) / 2 + my}" fill="white"/></svg>`;
  const mask = await sharp(Buffer.from(svg)).blur(feather).extractChannel(0).raw().toBuffer();
  const out = Buffer.alloc(W * H * 3);
  for (let p = 0; p < W * H; p++) {
    const a = mask[p] / 255;
    for (let c = 0; c < 3; c++) out[p * 3 + c] = Math.round(e[p * 3 + c] * a + b[p * 3 + c] * (1 - a));
  }
  return sharp(out, { raw: { width: W, height: H, channels: 3 } }).webp({ quality: 92 }).toBuffer();
}

/** Crops and sizes an image for its kind, cutting people and objects out of their backdrop, as webp. */
/**
 * Removes the pale, see-through "contact shadow" an image model likes to paint
 * under a cut-out person or object. On a dark scene it reads as a white smear.
 * Only semi-transparent, light, colorless pixels in the lower part of the
 * picture go; the subject itself is solid and keeps every pixel.
 */
async function clearShadow(input: Buffer) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  for (let y = Math.floor(h * 0.6); y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const a = data[i + 3];
      if (a === 0 || a > 235) continue;
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const hi = Math.max(r, g, b), lo = Math.min(r, g, b);
      const light = (r + g + b) / 3 > 120;
      const gray = hi === 0 || (hi - lo) / hi < 0.22;
      if (light && gray) data[i + 3] = 0;
    }
  }
  return sharp(data, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer();
}

async function finish(kind: string, input: Buffer) {
  // Wall pieces, ceiling lights and model references: cut out, trimmed to the thing itself, so a piece's
  // picture is exactly the size it is placed at on the wall.
  if (kind === "piece" || kind === "fixture" || kind === "model") {
    const cut = await cutOut(input);
    const trimmed = await sharp(cut).trim({ threshold: 1 }).toBuffer();
    return sharp(trimmed).resize({ width: 1536, height: 1536, fit: "inside", withoutEnlargement: true }).webp({ quality: 90, alphaQuality: 92 }).toBuffer();
  }
  // Tileable surfaces and trim are kept exactly as painted, at full size, so they repeat cleanly.
  if (kind === "wall" || kind === "floor" || kind === "ceiling" || kind === "trim" || kind === "turn") return sharp(input).webp({ quality: 92 }).toBuffer();
  if (kind === "figure" || kind === "sprite" || kind === "strip") {
    const cut = await cutOut(input);
    const trimmed = await sharp(kind === "strip" ? cut : await clearShadow(cut)).trim({ threshold: 1 }).toBuffer();
    const [mw, mh] = kind === "strip" ? [2400, 1350] : [1024, 1536];
    return sharp(trimmed).resize({ width: mw, height: mh, fit: "inside", withoutEnlargement: true }).webp({ quality: 86, alphaQuality: 90 }).toBuffer();
  }
  const [width, height] = SIZE[kind] ?? [1024, 1024];
  return sharp(input).resize({ width, height, fit: "cover", position: "centre" }).webp({ quality: 86 }).toBuffer();
}

async function nextVersion(id: string) {
  const { data } = await db().from("art_versions").select("version").eq("image_id", id).order("version", { ascending: false }).limit(1);
  return (((data ?? []) as { version: number }[])[0]?.version ?? 0) + 1;
}

async function store(id: string, version: number, webp: Buffer, row: { source: "generated" | "uploaded"; model?: string | null; prompt?: string | null; cost?: number }) {
  const { error } = await db()
    .storage.from(BUCKET)
    .upload(`art/${id}-${version}.webp`, webp, { contentType: "image/webp", upsert: true });
  if (error) throw new Error(`Saving the image failed: ${error.message}`);
  const { error: e2 } = await db()
    .from("art_versions")
    .insert({ image_id: id, version, source: row.source, model: row.model ?? null, prompt: row.prompt ?? null, cost_usd: row.cost ?? 0 });
  if (e2) throw new Error(`Recording the image failed: ${e2.message}`);
  return { version, url: liveArtUrl(id, version) };
}

/**
 * The current picture of an image, for use as a reference (a figure is drawn
 * from the person's portrait; a talking-portrait frame is an edit of it): the
 * live version, else the committed painting, else the newest version made.
 */
async function currentBytes(id: string, origin: string) {
  const { data } = await db().from("art_images").select("live_version").eq("id", id).maybeSingle();
  const live = (data as { live_version: number | null } | null)?.live_version;
  if (live) {
    const b = await readArtFile(`${id}-${live}.webp`);
    if (b) return Buffer.from(b);
  }
  if (!committed[id]?.url) {
    const newest = await nextVersion(id).then((n) => n - 1);
    if (newest > 0) {
      const b = await readArtFile(`${id}-${newest}.webp`);
      if (b) return Buffer.from(b);
    }
  }
  const url = committed[id]?.url;
  if (!url || !origin) return null;
  const res = await fetch(new URL(url, origin)).catch(() => null);
  return res?.ok ? Buffer.from(await res.arrayBuffer()) : null;
}

/**
 * Whether a finished (trimmed) figure was painted cut off at the bottom, without
 * its feet: its lowest row is a wide band of legs or coat rather than the
 * narrow tips of two shoes. Whole figures measure under a quarter of their width there.
 */
async function feetCutOff(webp: Buffer) {
  const { data, info } = await sharp(webp).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const row = (info.height - 1) * info.width;
  let solid = 0;
  for (let x = 0; x < info.width; x++) if (data[(row + x) * 4 + 3] > 200) solid++;
  return solid / info.width > 0.3;
}

/** Makes one image with OpenAI, finishes it for its kind and keeps it as a new version (not live until chosen). */
export async function generateImage(id: string, origin: string, tier: Tier = "standard") {
  const img = manifest.images.find((i) => i.id === id);
  if (!img) throw new Error("Unknown image.");
  const k = manifest.kinds[img.kind];
  const key = await apiKey();
  if (!key) throw new Error("No OpenAI key is set. Add OPENAI_API_KEY in Vercel.");
  const { data: m } = await db().from("art_images").select("subject").eq("id", id).maybeSingle();
  const prompt = promptFor(img, (m as { subject: string | null } | null)?.subject ?? img.subject);
  const ref = img.reference ? await currentBytes(img.reference, origin) : null;
  // A talking-portrait frame is only ever an edit of the portrait; made from nothing it would be someone else.
  if (img.kind === "face" && !ref) throw new Error(`Make the portrait (${img.reference}) first.`);
  if (img.kind === "turn" && !ref) throw new Error(`Make the portrait (${img.reference}) first.`);
  // More pictures to draw from (a side view also sees the front view), when they exist.
  const extra: { id: string; bytes: Buffer }[] = [];
  for (const a of img.also ?? []) {
    const b = await currentBytes(a, origin).catch(() => null);
    if (b) extra.push({ id: a, bytes: b });
  }

  const quality = TIERS[tier]?.quality ?? "medium";
  // A figure painted without feet is painted again, up to twice, before it's kept.
  let footRetries = 0;
  for (let attempt = 0; attempt < 6; attempt++) {
    const model = modelFor(tier);
    const common = { model, prompt, size: img.size ?? k.size, quality, background: k.background, output_format: "webp", output_compression: 88, n: 1 };
    let res: Response;
    if (ref) {
      const form = new FormData();
      for (const [kk, v] of Object.entries(common)) form.append(kk, String(v));
      form.append("image[]", new Blob([new Uint8Array(ref)], { type: "image/webp" }), `${img.reference}.webp`);
      for (const x of extra) form.append("image[]", new Blob([new Uint8Array(x.bytes)], { type: "image/webp" }), `${x.id}.webp`);
      res = await fetch(`${API_BASE}/v1/images/edits`, { method: "POST", headers: { Authorization: `Bearer ${key.key}` }, body: form, signal: AbortSignal.timeout(240000) });
    } else {
      res = await fetch(`${API_BASE}/v1/images/generations`, {
        method: "POST",
        headers: { Authorization: `Bearer ${key.key}`, "Content-Type": "application/json" },
        body: JSON.stringify(common),
        signal: AbortSignal.timeout(240000),
      });
    }
    if (!res.ok) {
      const text = (await res.text().catch(() => "")).replace(/sk-[A-Za-z0-9_-]{8,}/g, "[key]");
      const unknownModel = res.status === 404 || /model[^\n]{0,80}(not found|does not exist|invalid|not supported|do not have access|not available|must be verified)/i.test(text);
      if (unknownModel && model !== FALLBACK) {
        unavailable.add(model);
        continue;
      }
      if (res.status === 401) throw new Error("OpenAI rejected the API key.");
      if (res.status === 429 && /quota|billing/i.test(text)) throw new Error("The OpenAI account is out of credit. Add billing at platform.openai.com.");
      if (/safety|moderation|rejected/i.test(text) && res.status === 400) throw new Error("OpenAI declined this prompt. Try rewording the subject.");
      if ((res.status === 429 || res.status >= 500) && attempt < 3) {
        await new Promise((r) => setTimeout(r, 3000 * (attempt + 1)));
        continue;
      }
      throw new Error(`OpenAI returned ${res.status}. ${text.slice(0, 200)}`);
    }
    const body = (await res.json()) as { data?: { b64_json?: string }[] };
    const b64 = body.data?.[0]?.b64_json;
    if (!b64) throw new Error("OpenAI returned no image.");
    const webp = img.kind === "face" ? await blendFace(id, Buffer.from(b64, "base64"), ref!) : await finish(img.kind, Buffer.from(b64, "base64"));
    if (img.kind === "figure" && footRetries < 2 && (await feetCutOff(webp))) {
      footRetries++;
      continue;
    }
    const version = await nextVersion(id);
    const cost = costOf(k, model, quality, Boolean(ref), img.size);
    const saved = await store(id, version, webp, { source: "generated", model: `${model} (${quality})`, prompt, cost });
    return { ...saved, model: `${model}, ${quality}`, cost };
  }
  throw new Error("OpenAI is busy. Try again in a minute.");
}

/** Keeps an uploaded picture as a new version of an image (not live until chosen). */
export async function uploadImage(id: string, file: File, origin = "") {
  const img = manifest.images.find((i) => i.id === id);
  if (!img) throw new Error("Unknown image.");
  if (file.size > 15 * 1024 * 1024) throw new Error("The file is too large (15 MB at most).");
  const bytes = Buffer.from(await file.arrayBuffer());
  // An uploaded talking-portrait frame is blended into the portrait the same way a generated one is.
  const ref = img.kind === "face" && img.reference ? await currentBytes(img.reference, origin) : null;
  if (img.kind === "face" && !ref) throw new Error(`Make the portrait (${img.reference}) first.`);
  const webp = img.kind === "face" ? await blendFace(id, bytes, ref!) : await finish(img.kind, bytes);
  const version = await nextVersion(id);
  return store(id, version, webp, { source: "uploaded" });
}

/** Makes a version live for every player, or (version null) goes back to the committed painting. */
export async function setLive(id: string, version: number | null) {
  if (!manifest.images.some((i) => i.id === id)) throw new Error("Unknown image.");
  if (version !== null) {
    const { data } = await db().from("art_versions").select("version").eq("image_id", id).eq("version", version).maybeSingle();
    if (!data) throw new Error("That version doesn't exist.");
  }
  const { error } = await db().from("art_images").upsert({ id, live_version: version, updated_at: new Date().toISOString() }, { onConflict: "id" });
  if (error) throw new Error(error.message);
}

/** Saves an edited subject line for the prompt (empty goes back to the manifest's). */
export async function setSubject(id: string, subject: string) {
  const img = manifest.images.find((i) => i.id === id);
  if (!img) throw new Error("Unknown image.");
  const clean = subject.trim().slice(0, 4000);
  const { error } = await db()
    .from("art_images")
    .upsert({ id, subject: clean && clean !== img.subject ? clean : null, updated_at: new Date().toISOString() }, { onConflict: "id" });
  if (error) throw new Error(error.message);
}

/** The full prompt an image is made from, for showing on Admin. */
export function fullPrompt(id: string, subject: string) {
  const img = manifest.images.find((i) => i.id === id);
  return img ? promptFor(img, subject) : "";
}

/**
 * 3D models (Meshy GLB files) for model entries. A GLB is often larger than a server request allows, so the
 * browser uploads it straight to storage with a one-time signed upload, then the server records it.
 */
async function nextModelVersion(id: string) {
  const { data } = await db().from("art_models").select("version").eq("image_id", id).order("version", { ascending: false }).limit(1);
  return (((data ?? []) as { version: number }[])[0]?.version ?? 0) + 1;
}

/** Where the browser uploads a new GLB for a model: a signed upload to art/<id>-<version>.glb. */
export async function modelUploadTarget(id: string) {
  const img = manifest.images.find((i) => i.id === id);
  if (!img || !isModelKind(img.kind)) throw new Error("That isn't a 3D model entry.");
  const version = await nextModelVersion(id);
  const path = `art/${id}-${version}.glb`;
  const { data, error } = await db().storage.from(BUCKET).createSignedUploadUrl(path, { upsert: true });
  if (error || !data) throw new Error(`Storage would not accept the upload: ${error?.message ?? "no upload address"}`);
  return { version, path: data.path, token: data.token };
}

/** Records an uploaded GLB and makes it the one the game uses. */
export async function confirmModel(id: string, version: number) {
  const img = manifest.images.find((i) => i.id === id);
  if (!img || !isModelKind(img.kind)) throw new Error("That isn't a 3D model entry.");
  const file = `${id}-${version}.glb`;
  const { data: listed } = await db().storage.from(BUCKET).list("art", { search: file, limit: 5 });
  const found = (listed ?? []).find((f) => f.name === file);
  if (!found) throw new Error("The upload didn't arrive. Try again.");
  const head = await readArtFile(file);
  const bytes = head ? Buffer.from(head) : null;
  if (!bytes || bytes.subarray(0, 4).toString("latin1") !== "glTF") throw new Error("That file isn't a GLB (binary glTF). In Meshy, download the model as GLB.");
  const { error } = await db().from("art_models").insert({ image_id: id, version, size_bytes: bytes.length });
  if (error) throw new Error(`Recording the model failed: ${error.message}`);
  const { error: e2 } = await db().from("art_images").upsert({ id, live_model: version, updated_at: new Date().toISOString() }, { onConflict: "id" });
  if (e2) throw new Error(e2.message);
  return { version, url: liveModelUrl(id, version), bytes: bytes.length };
}

/** Chooses which uploaded GLB the game uses. */
export async function setLiveModel(id: string, version: number | null) {
  if (!manifest.images.some((i) => i.id === id && isModelKind(i.kind))) throw new Error("Unknown model.");
  const { error } = await db().from("art_images").upsert({ id, live_model: version, updated_at: new Date().toISOString() }, { onConflict: "id" });
  if (error) throw new Error(error.message);
}

/*
 * Making 3D models with Meshy's API (Image to 3D from the model's reference picture). The key is the
 * MESHY_API_KEY server setting or, until that is set, the one saved in site settings (meshy_api_key).
 * A Meshy task takes a few minutes, longer than one request, so a model is started, then checked from
 * Admin every few seconds; when it has finished the server downloads the GLB, stores it as a new
 * version (source "meshy") and, if the model has no live version yet, makes it live.
 */
const MESHY = (process.env.MESHY_API_BASE ?? "https://api.meshy.ai").replace(/\/$/, "");

async function meshyKey() {
  if (process.env.MESHY_API_KEY) return { key: process.env.MESHY_API_KEY, from: "server setting" as const };
  const { data } = await db().from("site_settings").select("value").eq("key", "meshy_api_key").maybeSingle();
  const v = (data as { value: unknown } | null)?.value;
  return typeof v === "string" && v.startsWith("msy_") ? { key: v, from: "site settings" as const } : null;
}

async function meshy(path: string, init?: RequestInit) {
  const k = await meshyKey();
  if (!k) throw new Error("No Meshy key is set. Add MESHY_API_KEY in Vercel.");
  const res = await fetch(`${MESHY}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${k.key}`, "Content-Type": "application/json", ...(init?.headers ?? {}) },
    signal: AbortSignal.timeout(60000),
  });
  const text = await res.text();
  if (!res.ok) {
    if (res.status === 401) throw new Error("Meshy rejected the API key.");
    if (res.status === 402) throw new Error("Meshy says there aren't enough credits for this.");
    if (res.status === 429) throw new Error("Meshy is busy (too many tasks at once). Try again in a minute.");
    throw new Error(`Meshy returned ${res.status}. ${text.slice(0, 200)}`);
  }
  return text ? JSON.parse(text) : {};
}

/** Whether a Meshy key is set, where from, and the account's credit balance. */
export async function meshyStatus() {
  const k = await meshyKey().catch(() => null);
  if (!k) return { configured: false as const };
  const b = await meshy("/openapi/v1/balance").catch((e: unknown) => ({ error: e instanceof Error ? e.message : "Couldn't reach Meshy." }));
  return { configured: true as const, from: k.from, balance: "balance" in b ? Number(b.balance) : null, error: "error" in b ? String(b.error) : null };
}

/**
 * Starts a Meshy task for a model entry: Image to 3D from its reference picture when there is one (best for
 * keeping the case's style), otherwise Text to 3D from its prompt (a preview mesh, then a textured refine).
 * The running task is kept as "i:<id>" (image), "tp:<id>" (text preview) or "tr:<id>" (text refine).
 */
export async function startMeshyModel(id: string, origin: string) {
  const img = manifest.images.find((i) => i.id === id);
  if (!img || !isModelKind(img.kind)) throw new Error("That isn't a 3D model entry.");
  const { data: row } = await db().from("art_images").select("meshy_task, subject").eq("id", id).maybeSingle();
  const r = row as { meshy_task: string | null; subject: string | null } | null;
  if (r?.meshy_task) return { task: r.meshy_task, already: true, from: r.meshy_task.startsWith("t") ? ("prompt" as const) : ("picture" as const) };
  const bytes = await currentBytes(id, origin).catch(() => null);
  const common = { should_remesh: true, topology: "triangle", target_polycount: 20000, target_formats: ["glb"], ai_model: "latest" };
  let task: string;
  if (bytes) {
    const png = await sharp(bytes).png().toBuffer();
    const created = await meshy("/openapi/v1/image-to-3d", {
      method: "POST",
      body: JSON.stringify({
        ...common,
        image_url: `data:image/png;base64,${png.toString("base64")}`,
        should_texture: true,
        enable_pbr: false,
        texture_resolution: "2k",
        // Keep the reference picture's look (the case's art style) rather than Meshy's own enhancement.
        image_enhancement: false,
      }),
    });
    task = `i:${String(created.result ?? "")}`;
  } else {
    const created = await meshy("/openapi/v2/text-to-3d", {
      method: "POST",
      body: JSON.stringify({ ...common, mode: "preview", prompt: meshyText(r?.subject ?? img.subject, groupOf(id)) }),
    });
    task = `tp:${String(created.result ?? "")}`;
  }
  if (task.endsWith(":")) throw new Error("Meshy didn't return a task.");
  const { error } = await db().from("art_images").upsert({ id, meshy_task: task, meshy_started_at: new Date().toISOString(), updated_at: new Date().toISOString() }, { onConflict: "id" });
  if (error) throw new Error(error.message);
  return { task, already: false, from: bytes ? ("picture" as const) : ("prompt" as const) };
}

export type MeshyCheck =
  | { state: "none" }
  | { state: "working"; progress: number; status: string }
  | { state: "failed"; note: string }
  | { state: "done"; version: number; bytes: number; live: boolean; credits: number; url: string };

/** Checks a model's Meshy task; once it has succeeded, stores the GLB as a new version. */
export async function checkMeshyModel(id: string): Promise<MeshyCheck> {
  const { data: row } = await db().from("art_images").select("meshy_task, live_model").eq("id", id).maybeSingle();
  const r = row as { meshy_task: string | null; live_model: number | null } | null;
  if (!r?.meshy_task) return { state: "none" };
  const clear = () => db().from("art_images").update({ meshy_task: null, meshy_started_at: null }).eq("id", id);
  // Older tasks were stored without a prefix: those are Image to 3D.
  const [kind, taskId] = r.meshy_task.includes(":") ? (r.meshy_task.split(":", 2) as [string, string]) : ["i", r.meshy_task];
  const path = kind === "i" ? "/openapi/v1/image-to-3d" : "/openapi/v2/text-to-3d";
  const t = await meshy(`${path}/${encodeURIComponent(taskId)}`);
  const status = String(t.status ?? "");
  const progress = Number(t.progress ?? 0);
  if (status === "FAILED" || status === "CANCELED") {
    await clear();
    return { state: "failed", note: `Meshy ${status === "FAILED" ? "couldn't make it" : "canceled it"}${t.task_error?.message ? `: ${t.task_error.message}` : "."} No credits are used for a failed model.` };
  }
  // Text to 3D runs in two halves: the preview mesh, then the textured refine.
  if (status !== "SUCCEEDED") return { state: "working", progress: kind === "tp" ? Math.round(progress / 2) : kind === "tr" ? 50 + Math.round(progress / 2) : progress, status };
  if (kind === "tp") {
    const refined = await meshy("/openapi/v2/text-to-3d", { method: "POST", body: JSON.stringify({ mode: "refine", preview_task_id: taskId, enable_pbr: false, target_formats: ["glb"] }) });
    const next = String(refined.result ?? "");
    if (!next) throw new Error("Meshy didn't start texturing the model. Check again.");
    await db().from("art_images").update({ meshy_task: `tr:${next}` }).eq("id", id);
    return { state: "working", progress: 50, status: "TEXTURING" };
  }
  const url = t.model_urls?.glb ?? t.model_url;
  if (!url) {
    await clear();
    return { state: "failed", note: "Meshy finished but gave no GLB file." };
  }
  const res = await fetch(url, { signal: AbortSignal.timeout(120000) });
  if (!res.ok) throw new Error(`Downloading the model from Meshy failed (${res.status}). Check again.`);
  const bytes = Buffer.from(await res.arrayBuffer());
  if (bytes.subarray(0, 4).toString("latin1") !== "glTF") throw new Error("Meshy's file isn't a GLB. Check again.");
  if (bytes.length > 50 * 1048576) {
    await clear();
    return { state: "failed", note: `Meshy's model is ${(bytes.length / 1048576).toFixed(1)} MB, over the 50 MB limit.` };
  }
  const version = await nextModelVersion(id);
  const { error: up } = await db().storage.from(BUCKET).upload(`art/${id}-${version}.glb`, new Blob([bytes], { type: "model/gltf-binary" }), { contentType: "model/gltf-binary", upsert: true });
  if (up) throw new Error(`Saving the model failed: ${up.message}`);
  const credits = Number(t.consumed_credits ?? 0);
  const { error } = await db().from("art_models").insert({ image_id: id, version, size_bytes: bytes.length, source: "meshy", credits });
  if (error) throw new Error(`Recording the model failed: ${error.message}`);
  const live = r.live_model == null;
  await db()
    .from("art_images")
    .update({ meshy_task: null, meshy_started_at: null, ...(live ? { live_model: version } : {}), updated_at: new Date().toISOString() })
    .eq("id", id);
  return { state: "done", version, bytes: bytes.length, live, credits, url: liveModelUrl(id, version) };
}

/** Model ids with a Meshy task still running, for picking up where Admin left off. */
export async function meshyRunning(): Promise<string[]> {
  const { data } = await db().from("art_images").select("id").not("meshy_task", "is", null);
  return ((data ?? []) as { id: string }[]).map((r) => r.id);
}
