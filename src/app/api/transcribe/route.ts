import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/*
 * Push-to-talk. POST /api/transcribe with a short recording (multipart field
 * "audio"). Sends it to ElevenLabs speech-to-text with the server's key and
 * returns { text }. Nothing is stored. Signed-in investigators only.
 */

const API_BASE = (process.env.ELEVENLABS_API_BASE ?? "https://api.elevenlabs.io").replace(/\/$/, "");
const API_KEY = process.env.ELEVENLABS_API_KEY ?? "";
const MODEL = process.env.ELEVENLABS_STT_MODEL ?? "scribe_v1";
const MAX_BYTES = 3 * 1024 * 1024; // about a minute of compressed speech

const recent = new Map<string, number[]>();
function rateLimited(userId: string) {
  const now = Date.now();
  const hits = (recent.get(userId) ?? []).filter((t) => now - t < 60000);
  hits.push(now);
  recent.set(userId, hits);
  return hits.length > 30;
}

export async function POST(request: NextRequest) {
  const fail = (error: string, status: number) => Response.json({ error }, { status });
  const supabase = await createClient();
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;
  if (!user) return fail("Sign in to use the microphone.", 401);
  if (!API_KEY) return fail("Speech recognition is not configured on this server. Type your question instead.", 501);
  if (rateLimited(user.id)) return fail("Too many recordings. Wait a moment.", 429);

  let audio: File | null = null;
  try {
    const form = await request.formData();
    const f = form.get("audio");
    audio = f instanceof File ? f : null;
  } catch {
    return fail("The recording could not be read.", 400);
  }
  if (!audio || audio.size === 0) return fail("Nothing was recorded.", 400);
  if (audio.size > MAX_BYTES) return fail("That recording is too long. Keep questions short.", 413);
  if (audio.type && !audio.type.startsWith("audio/") && !audio.type.startsWith("video/webm")) return fail("That is not an audio recording.", 415);

  const out = new FormData();
  out.append("model_id", MODEL);
  out.append("language_code", "en");
  out.append("tag_audio_events", "false");
  out.append("file", audio, audio.name || "question.webm");
  try {
    const res = await fetch(`${API_BASE}/v1/speech-to-text`, {
      method: "POST",
      headers: { "xi-api-key": API_KEY },
      body: out,
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) {
      console.error("ElevenLabs speech-to-text failed", res.status, (await res.text().catch(() => "")).slice(0, 300));
      return fail(res.status === 401 ? "The speech service rejected the API key." : "The speech service is unavailable. Type your question instead.", 502);
    }
    const body = (await res.json()) as { text?: string };
    const text = (body.text ?? "").replace(/\s+/g, " ").trim().slice(0, 300);
    return Response.json({ text });
  } catch (e) {
    console.error("transcribe", e);
    return fail("The speech service is unavailable. Type your question instead.", 503);
  }
}
