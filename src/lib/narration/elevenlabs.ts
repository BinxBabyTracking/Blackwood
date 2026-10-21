import "server-only";
import { createHash } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

/*
 * Server-side ElevenLabs text-to-speech with a Supabase Storage cache.
 * The API key never leaves the server. Each distinct (voice, model, text)
 * is generated once and then served from the private "narration" bucket.
 */

const API_BASE = (process.env.ELEVENLABS_API_BASE ?? "https://api.elevenlabs.io").replace(/\/$/, "");
const API_KEY = process.env.ELEVENLABS_API_KEY ?? "";
/** One neutral investigator voice for all evidence narration. Set ELEVENLABS_VOICE_ID to change it. */
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID ?? "JBFqnCBsd6RMkjVDRZzb";
const MODEL_ID = process.env.ELEVENLABS_MODEL_ID ?? "eleven_multilingual_v2";
const BUCKET = "narration";

export const isNarrationConfigured = Boolean(API_KEY);

export class NarrationError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export async function narrate(cacheKey: string, text: string): Promise<{ audio: ArrayBuffer; cached: boolean }> {
  if (!API_KEY) throw new NarrationError("Narration is not configured on this server.", 501);
  const hash = createHash("sha256").update(`${VOICE_ID}|${MODEL_ID}|${text}`).digest("hex").slice(0, 20);
  const path = `${cacheKey}-${hash}.mp3`;
  const db = createAdminClient();

  if (db) {
    const { data } = await db.storage.from(BUCKET).download(path);
    if (data) return { audio: await data.arrayBuffer(), cached: true };
  }

  const res = await fetch(`${API_BASE}/v1/text-to-speech/${encodeURIComponent(VOICE_ID)}?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": API_KEY, "Content-Type": "application/json", Accept: "audio/mpeg" },
    body: JSON.stringify({ text, model_id: MODEL_ID }),
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("ElevenLabs narration failed", res.status, detail.slice(0, 300));
    throw new NarrationError(res.status === 401 ? "The narration service rejected the API key." : "The narration service is unavailable right now.", 502);
  }
  const audio = await res.arrayBuffer();

  if (db) {
    // Caching is best effort; a failed upload just means generating again next time.
    const { error } = await db.storage.from(BUCKET).upload(path, new Blob([audio], { type: "audio/mpeg" }), { contentType: "audio/mpeg", upsert: true });
    if (error) console.error("Narration cache upload failed", error.message);
  }
  return { audio, cached: false };
}
