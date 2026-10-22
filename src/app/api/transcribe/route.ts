import type { NextRequest } from "next/server";
import { findInvestigation } from "@/game/persistence";
import { createClient } from "@/lib/supabase/server";
import { recordUsage } from "@/lib/usage";

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
  let caseId = "";
  let characterId = "";
  let seconds = 0;
  try {
    const form = await request.formData();
    const f = form.get("audio");
    audio = f instanceof File ? f : null;
    caseId = String(form.get("caseId") ?? "").slice(0, 20);
    characterId = String(form.get("characterId") ?? "").slice(0, 40);
    seconds = Math.min(120, Math.max(0, Number(form.get("seconds")) || 0));
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
      const detail = (await res.text().catch(() => "")).slice(0, 300);
      console.error("ElevenLabs speech-to-text failed", res.status, detail);
      // ElevenLabs keys carry per-feature permissions: a key made for voices may not be allowed to transcribe.
      if (res.status === 401 && /permission/i.test(detail))
        return fail("The ElevenLabs key does not have Speech to Text permission. Turn it on for this key in your ElevenLabs account, or type your question.", 502);
      return fail(res.status === 401 ? "The speech service rejected the API key." : "The speech service is unavailable. Type your question instead.", 502);
    }
    const body = (await res.json()) as { text?: string };
    if (/^C\d{3,}$/.test(caseId)) {
      const loaded = await findInvestigation(user.id, caseId).catch(() => null);
      recordUsage({ userId: user.id, sessionId: loaded?.sessionId ?? null, caseId, characterId: characterId || null, service: "stt", purpose: "transcribe", model: MODEL, audioSeconds: seconds });
    }
    const text = (body.text ?? "").replace(/\s+/g, " ").trim().slice(0, 300);
    return Response.json({ text });
  } catch (e) {
    console.error("transcribe", e);
    return fail("The speech service is unavailable. Type your question instead.", 503);
  }
}
