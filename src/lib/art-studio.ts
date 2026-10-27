import "server-only";
import sharp from "sharp";
import manifestJson from "../../art/manifest.json";
import generated from "@/art/generated.json";
import { liveArtUrl } from "@/art/painted";
import { createAdminClient } from "@/lib/supabase/admin";

/*
 * The Admin artwork studio. Every image in art/manifest.json can be made with
 * OpenAI's image model (or uploaded), reviewed, and made live. A live version
 * replaces the committed painting in public/art for every player; the
 * committed one stays as the fallback. Files are kept in the private
 * "narration" bucket under art/ and served by /art/gen/<id>-<version>.webp.
 */

type Kind = { size: string; quality: "low" | "medium" | "high"; background: "opaque" | "transparent"; suffix: string };
type ImageDef = { id: string; kind: string; subject: string; style?: string; suffix?: string; person?: string; reference?: string };
const manifest = manifestJson as unknown as { style: string; styles?: Record<string, string>; kinds: Record<string, Kind>; people: Record<string, string>; images: ImageDef[] };
const committed = (generated as { images: Record<string, { url: string }> }).images;

const BUCKET = "narration";
const API_BASE = (process.env.OPENAI_API_BASE ?? "https://api.openai.com").replace(/\/$/, "");
const MODELS = process.env.OPENAI_IMAGE_MODEL ? [process.env.OPENAI_IMAGE_MODEL] : ["gpt-image-1.5", "gpt-image-1"];
let modelIndex = 0;

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
  return { configured: Boolean(k), from: k?.from ?? null, model: MODELS[modelIndex] };
}

/** Rough OpenAI price per image, in dollars, by quality and size. Shown as an estimate. */
function costOf(k: Kind) {
  const square = k.size === "1024x1024";
  return { low: square ? 0.011 : 0.016, medium: square ? 0.042 : 0.063, high: square ? 0.167 : 0.25 }[k.quality];
}

/** Which case an image belongs to, from its id: c002_ev_e11 is C002; site and travel art is shared. */
export const groupOf = (id: string) => (/^c\d{3}_/.test(id) ? id.slice(0, 4).toUpperCase() : "Shared");

function promptFor(img: ImageDef, subject: string) {
  const k = manifest.kinds[img.kind];
  const person = img.person && manifest.people[img.person] ? `${manifest.people[img.person]}. ` : "";
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
}

/** Every image, with what's live, every version made, and its prompt. */
export async function artRows(): Promise<ArtRow[]> {
  const [{ data: imgs }, { data: vers }] = await Promise.all([
    db().from("art_images").select("id, live_version, subject"),
    db().from("art_versions").select("image_id, version, created_at, source, model, cost_usd").order("version", { ascending: false }).limit(5000),
  ]);
  const meta = new Map(((imgs ?? []) as { id: string; live_version: number | null; subject: string | null }[]).map((r) => [r.id, r]));
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
};

/** Crops and sizes an image for its kind, cutting people and objects out of their backdrop, as webp. */
async function finish(kind: string, input: Buffer) {
  if (kind === "figure" || kind === "sprite" || kind === "strip") {
    const trimmed = await sharp(await cutOut(input)).trim({ threshold: 1 }).toBuffer();
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

/** The current picture of an image, for use as a reference (a figure is drawn from the person's portrait). */
async function currentBytes(id: string, origin: string) {
  const { data } = await db().from("art_images").select("live_version").eq("id", id).maybeSingle();
  const live = (data as { live_version: number | null } | null)?.live_version;
  if (live) {
    const b = await readArtFile(`${id}-${live}.webp`);
    if (b) return Buffer.from(b);
  }
  const url = committed[id]?.url;
  if (!url || !origin) return null;
  const res = await fetch(new URL(url, origin)).catch(() => null);
  return res?.ok ? Buffer.from(await res.arrayBuffer()) : null;
}

/** Makes one image with OpenAI, finishes it for its kind and keeps it as a new version (not live until chosen). */
export async function generateImage(id: string, origin: string) {
  const img = manifest.images.find((i) => i.id === id);
  if (!img) throw new Error("Unknown image.");
  const k = manifest.kinds[img.kind];
  const key = await apiKey();
  if (!key) throw new Error("No OpenAI key is set. Add OPENAI_API_KEY in Vercel.");
  const { data: m } = await db().from("art_images").select("subject").eq("id", id).maybeSingle();
  const prompt = promptFor(img, (m as { subject: string | null } | null)?.subject ?? img.subject);
  const ref = img.reference ? await currentBytes(img.reference, origin) : null;

  for (let attempt = 0; attempt < 4; attempt++) {
    const model = MODELS[modelIndex];
    const common = { model, prompt, size: k.size, quality: k.quality, background: k.background, output_format: "webp", output_compression: 88, n: 1 };
    let res: Response;
    if (ref) {
      const form = new FormData();
      for (const [kk, v] of Object.entries(common)) form.append(kk, String(v));
      form.append("image[]", new Blob([new Uint8Array(ref)], { type: "image/webp" }), `${img.reference}.webp`);
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
      if (unknownModel && modelIndex < MODELS.length - 1) {
        modelIndex++;
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
    const webp = await finish(img.kind, Buffer.from(b64, "base64"));
    const version = await nextVersion(id);
    const saved = await store(id, version, webp, { source: "generated", model, prompt, cost: costOf(k) });
    return { ...saved, model, cost: costOf(k) };
  }
  throw new Error("OpenAI is busy. Try again in a minute.");
}

/** Keeps an uploaded picture as a new version of an image (not live until chosen). */
export async function uploadImage(id: string, file: File) {
  const img = manifest.images.find((i) => i.id === id);
  if (!img) throw new Error("Unknown image.");
  if (file.size > 15 * 1024 * 1024) throw new Error("The file is too large (15 MB at most).");
  const webp = await finish(img.kind, Buffer.from(await file.arrayBuffer()));
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
