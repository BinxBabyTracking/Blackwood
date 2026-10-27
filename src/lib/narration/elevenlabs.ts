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

export interface VoiceOptions {
  voiceId: string;
  settings?: { stability?: number; similarity_boost?: number; style?: number; use_speaker_boost?: boolean };
}

/** A character's voice, allowing a deployment to recast it with ELEVENLABS_VOICE_<CHARACTER>. */
export function castVoice(characterId: string, voice: VoiceOptions): VoiceOptions {
  const override = process.env[`ELEVENLABS_VOICE_${characterId.toUpperCase()}`];
  return override ? { ...voice, voiceId: override } : voice;
}

/**
 * Speaks `text` once and caches it. Evidence narration uses the default
 * narrator voice; characters pass their own voice so each one sounds the
 * same in every scene. Identical text and voice is shared by every player.
 */
/** When each character of a line is spoken, in seconds: what a talking portrait moves its mouth to. */
export interface Timing {
  characters: string[];
  starts: number[];
  ends: number[];
}

/** Where a line's audio lives in the cache (and its timing, beside it). */
function cachePath(cacheKey: string, text: string, voice?: VoiceOptions) {
  const voiceId = voice?.voiceId ?? VOICE_ID;
  const settings = voice?.settings ? `|${JSON.stringify(voice.settings)}` : "";
  // Evidence narration keeps its original key format so existing recordings stay valid.
  const hash = createHash("sha256").update(`${voiceId}|${MODEL_ID}|${text}${settings}`).digest("hex").slice(0, 20);
  return `${cacheKey}-${hash}.mp3`;
}

/**
 * The timing saved with a line when it was spoken, if any. Never generates:
 * lines spoken before timing was kept simply have none, and the portrait
 * paces its mouth from the text instead.
 */
export async function cachedTiming(cacheKey: string, text: string, voice?: VoiceOptions): Promise<Timing | null> {
  const db = createAdminClient();
  if (!db) return null;
  const { data } = await db.storage.from(BUCKET).download(cachePath(cacheKey, text, voice).replace(/\.mp3$/, ".json"));
  if (!data) return null;
  try {
    return JSON.parse(await data.text()) as Timing;
  } catch {
    return null;
  }
}

/**
 * Speaks `text` once and caches it. With `timing`, the same request also
 * returns when each character is spoken (ElevenLabs' with-timestamps
 * endpoint), saved beside the audio for a talking portrait.
 */
export async function narrate(cacheKey: string, text: string, voice?: VoiceOptions, opts: { timing?: boolean } = {}): Promise<{ audio: ArrayBuffer; cached: boolean }> {
  if (!API_KEY) throw new NarrationError("Narration is not configured on this server.", 501);
  const voiceId = voice?.voiceId ?? VOICE_ID;
  const path = cachePath(cacheKey, text, voice);
  const db = createAdminClient();

  if (db) {
    const { data } = await db.storage.from(BUCKET).download(path);
    if (data) return { audio: await data.arrayBuffer(), cached: true };
  }

  const endpoint = opts.timing ? "/with-timestamps" : "";
  const res = await fetch(`${API_BASE}/v1/text-to-speech/${encodeURIComponent(voiceId)}${endpoint}?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": API_KEY, "Content-Type": "application/json", Accept: opts.timing ? "application/json" : "audio/mpeg" },
    body: JSON.stringify({ text, model_id: MODEL_ID, ...(voice?.settings ? { voice_settings: voice.settings } : {}) }),
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("ElevenLabs narration failed", res.status, detail.slice(0, 300));
    const message =
      res.status === 401
        ? "The voice service rejected the API key."
        : res.status === 404 || res.status === 400
          ? "This voice is not available on the voice account."
          : "The voice service is unavailable right now.";
    throw new NarrationError(message, 502);
  }
  let audio: ArrayBuffer;
  let timing: Timing | null = null;
  if (opts.timing) {
    const body = (await res.json()) as {
      audio_base64: string;
      alignment?: { characters: string[]; character_start_times_seconds: number[]; character_end_times_seconds: number[] } | null;
    };
    const bytes = Buffer.from(body.audio_base64, "base64");
    audio = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
    const a = body.alignment;
    if (a?.characters?.length) timing = { characters: a.characters, starts: a.character_start_times_seconds, ends: a.character_end_times_seconds };
  } else {
    audio = await res.arrayBuffer();
  }

  if (db) {
    // Caching is best effort; a failed upload just means generating again next time.
    const { error } = await db.storage.from(BUCKET).upload(path, new Blob([audio], { type: "audio/mpeg" }), { contentType: "audio/mpeg", upsert: true });
    if (error) console.error("Narration cache upload failed", error.message);
    if (timing) {
      const t = await db.storage.from(BUCKET).upload(path.replace(/\.mp3$/, ".json"), new Blob([JSON.stringify(timing)], { type: "application/json" }), { contentType: "application/json", upsert: true });
      if (t.error) console.error("Timing cache upload failed", t.error.message);
    }
  }
  return { audio, cached: false };
}
