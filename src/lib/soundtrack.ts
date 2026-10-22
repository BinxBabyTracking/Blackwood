import "server-only";
import type { SoundtrackDef } from "@/game/engine/types";
import { createAdminClient } from "@/lib/supabase/admin";

/*
 * Case music and room sound. Each track is made once with ElevenLabs (music
 * with Eleven Music, room sound with seamless-loop sound effects) from the
 * Admin page, kept in the private "narration" bucket, and served to players by
 * /api/case-audio. Nothing is generated while someone plays.
 */

const API_BASE = (process.env.ELEVENLABS_API_BASE ?? "https://api.elevenlabs.io").replace(/\/$/, "");
const API_KEY = process.env.ELEVENLABS_API_KEY ?? "";
const BUCKET = "narration";

const path = (caseId: string, key: string) => `soundtrack/${caseId}/${key}.mp3`;

function db() {
  const a = createAdminClient();
  if (!a) throw new Error("The server is not configured for storage.");
  return a;
}

/** Which tracks of a case have been made, with when. */
export async function soundtrackStatus(caseId: string): Promise<Record<string, string>> {
  const { data } = await db().storage.from(BUCKET).list(`soundtrack/${caseId}`, { limit: 100 });
  return Object.fromEntries((data ?? []).map((f) => [f.name.replace(/\.mp3$/, ""), f.updated_at ?? f.created_at ?? ""]));
}

export async function readTrack(caseId: string, key: string): Promise<ArrayBuffer | null> {
  const { data } = await db().storage.from(BUCKET).download(path(caseId, key));
  return data ? data.arrayBuffer() : null;
}

/** Makes one track with ElevenLabs and stores it, replacing any earlier version. */
export async function generateTrack(caseId: string, t: SoundtrackDef) {
  if (!API_KEY) throw new Error("ELEVENLABS_API_KEY is not set on the server.");
  const res =
    t.kind === "music"
      ? await fetch(`${API_BASE}/v1/music?output_format=mp3_44100_128`, {
          method: "POST",
          headers: { "xi-api-key": API_KEY, "Content-Type": "application/json", Accept: "audio/mpeg" },
          body: JSON.stringify({ prompt: t.prompt, music_length_ms: Math.round(t.seconds * 1000), force_instrumental: true }),
          signal: AbortSignal.timeout(280000),
        })
      : await fetch(`${API_BASE}/v1/sound-generation?output_format=mp3_44100_128`, {
          method: "POST",
          headers: { "xi-api-key": API_KEY, "Content-Type": "application/json", Accept: "audio/mpeg" },
          body: JSON.stringify({
            text: t.prompt,
            model_id: "eleven_text_to_sound_v2",
            loop: true,
            duration_seconds: Math.min(30, Math.max(1, t.seconds)),
            prompt_influence: 0.4,
          }),
          signal: AbortSignal.timeout(120000),
        });
  if (!res.ok) {
    const detail = (await res.text().catch(() => "")).slice(0, 400);
    console.error("ElevenLabs soundtrack failed", t.key, res.status, detail);
    if (res.status === 401 && /permission/i.test(detail))
      throw new Error(`The ElevenLabs key is missing the ${t.kind === "music" ? "Music" : "Sound Effects"} permission. Turn it on for this key in ElevenLabs.`);
    if (res.status === 401) throw new Error("ElevenLabs rejected the API key.");
    if (res.status === 402 || /quota|credits|plan|subscription/i.test(detail))
      throw new Error(`ElevenLabs says the account can't make this (${t.kind === "music" ? "music needs a paid plan" : "out of credits"}). ${detail.slice(0, 160)}`);
    throw new Error(`ElevenLabs returned ${res.status}. ${detail.slice(0, 160)}`);
  }
  const audio = await res.arrayBuffer();
  const { error } = await db()
    .storage.from(BUCKET)
    .upload(path(caseId, t.key), new Blob([audio], { type: "audio/mpeg" }), { contentType: "audio/mpeg", upsert: true });
  if (error) throw new Error(`Saving the track failed: ${error.message}`);
  return audio.byteLength;
}
