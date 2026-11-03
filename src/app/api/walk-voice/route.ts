import type { NextRequest } from "next/server";
import { loadCase } from "@/game/registry";
import { requireInvestigator } from "@/lib/investigator";
import { cachedTiming, castVoice, narrate, NarrationError, refreshVoices } from "@/lib/narration/elevenlabs";
import { recordUsage } from "@/lib/usage";
import { isOwner } from "@/lib/test-reset";

/**
 * Testing Zone voices: GET /api/walk-voice?caseId=C001&id=rosa&text=... speaks a line in that person's
 * voice (with &timing=1, when each letter is spoken). Owner only; lines are cached like the game's.
 */
export async function GET(request: NextRequest) {
  const p = request.nextUrl.searchParams;
  const fail = (error: string, status: number) => Response.json({ error }, { status });
  const me = await requireInvestigator(true).catch(() => null);
  if (!me || !isOwner(me.email)) return fail("Not available.", 403);
  const def = loadCase(p.get("caseId") ?? "");
  const speaker = def?.characters.find((c) => c.id === p.get("id"));
  const text = (p.get("text") ?? "").slice(0, 600);
  if (!def || !speaker?.voice || !text) return fail("Unknown line.", 400);
  try {
    await refreshVoices();
    const voice = castVoice(def.id, speaker.voice.sameAs ?? speaker.id, speaker.voice);
    const key = `${def.id}/voices/${speaker.id}`;
    if (p.get("timing") === "1") {
      const t = await cachedTiming(key, text, voice);
      return t ? Response.json(t) : fail("No timing.", 404);
    }
    const { audio, cached } = await narrate(key, text, voice, { timing: true });
    recordUsage({ userId: me.id, sessionId: `walk-test-${me.id}`, caseId: def.id, characterId: speaker.id, service: "tts", purpose: "voice", characters: text.length, saved: cached });
    return new Response(audio, { headers: { "Content-Type": "audio/mpeg", "Cache-Control": "private, max-age=600" } });
  } catch (e) {
    if (e instanceof NarrationError) return fail(e.message, e.status);
    console.error("walk-voice", e);
    return fail("Voices are unavailable right now.", 503);
  }
}
