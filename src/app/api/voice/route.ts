import { recordUsage } from "@/lib/usage";
import type { NextRequest } from "next/server";
import { heldNow, normalizeState, spokenLine } from "@/game/engine/engine";
import { findInvestigation } from "@/game/persistence";
import { loadCase } from "@/game/registry";
import { cachedTiming, castVoice, narrate, NarrationError, refreshVoices } from "@/lib/narration/elevenlabs";
import { actingUser, fromGuestScreen } from "@/lib/party";

const recent = new Map<string, number[]>();
const LIMIT = 60; // lines per user per minute

function rateLimited(userId: string) {
  const now = Date.now();
  const hits = (recent.get(userId) ?? []).filter((t) => now - t < 60000);
  hits.push(now);
  recent.set(userId, hits);
  return hits.length > LIMIT;
}

const KINDS = new Set(["conversation", "statement", "call", "delivery", "resolution", "document", "intro"]);

/**
 * Character voices. GET /api/voice?caseId=C001&kind=conversation&id=margaret&n=3
 *
 * The server looks the line up in the player's own save (or in a statement or
 * call they have access to) and speaks exactly that text in the speaker's
 * fixed voice, so audio always matches the subtitle and nothing unheard can
 * be requested. Each line is generated once and shared from the cache.
 *
 * With &timing=1 it returns, instead of audio, when each character of the line
 * is spoken (JSON), for a talking portrait. Timing is only ever read from the
 * cache, never generated: a line spoken before timing was kept gets 404 and
 * the portrait paces its mouth from the text.
 */
export async function GET(request: NextRequest) {
  const p = request.nextUrl.searchParams;
  const caseId = p.get("caseId") ?? "";
  const kind = p.get("kind") ?? "";
  const id = p.get("id") ?? "";
  const n = Number(p.get("n"));
  const fail = (error: string, status: number) => Response.json({ error }, { status });

  if (!KINDS.has(kind) || !/^[a-z0-9_]{1,40}$/i.test(id) || !Number.isInteger(n) || n < 0 || n > 2000) return fail("Unknown line.", 400);

  // A guest in a joint investigation hears the host's investigation.
  const acting = await actingUser(caseId, fromGuestScreen(request));
  if (!acting) return fail("Sign in to hear voices.", 401);
  const user = { id: acting.userId };
  if (rateLimited(acting.guest?.id ?? user.id)) return fail("Too many voice requests. Wait a moment.", 429);

  const def = loadCase(caseId);
  if (!def) return fail("Unknown case.", 404);

  try {
    await refreshVoices();
    const loaded = await findInvestigation(user.id, def.id);
    if (!loaded) return fail("Accept the assignment first.", 403);
    const state = normalizeState(def, loaded.state);
    const line = spokenLine(def, state, { kind: kind as "conversation", id, n });
    if (!line) return fail("That line is not available.", 403);
    // Something only the held investigator heard stays theirs until it is over.
    const held = heldNow(state);
    if (held && held.seat !== (acting.guest?.id ?? "host") && kind === "call" && def.calls.find((c) => c.id === id)?.overheard) return fail("That line is not available.", 403);
    const speaker = line.speakerId === "narrator" ? undefined : def.characters.find((c) => c.id === line.speakerId);
    if (p.get("timing") === "1") {
      if (!speaker?.voice) return fail("No timing for this line.", 404);
      const timing = await cachedTiming(`${def.id}/voices/${speaker.id}`, line.text, castVoice(def.id, speaker.voice.sameAs ?? speaker.id, speaker.voice));
      return timing ? Response.json(timing, { headers: { "Cache-Control": "private, max-age=600" } }) : fail("No timing for this line.", 404);
    }
    let result;
    if (line.speakerId === "narrator") {
      // Written notes use the existing evidence narrator voice.
      result = await narrate(`${def.id}/voices/narrator`, line.text);
    } else {
      if (!speaker?.voice) return fail("This person has no voice assigned.", 404);
      // People with a talking portrait keep the timing of every line, from the same request.
      const timing = Boolean(def.assets.images[`face.${speaker.id}.rest`]);
      result = await narrate(`${def.id}/voices/${speaker.id}`, line.text, castVoice(def.id, speaker.voice.sameAs ?? speaker.id, speaker.voice), { timing });
    }
    const { audio, cached } = result;
    recordUsage({
      userId: user.id,
      sessionId: loaded.sessionId,
      caseId: def.id,
      characterId: line.speakerId === "narrator" ? null : line.speakerId,
      service: "tts",
      purpose: "voice",
      characters: line.text.length,
      saved: cached,
    });
    return new Response(audio, {
      headers: { "Content-Type": "audio/mpeg", "Cache-Control": "private, max-age=600", "X-Voice-Cache": cached ? "hit" : "miss" },
    });
  } catch (e) {
    if (e instanceof NarrationError) return fail(e.message, e.status);
    console.error("voice", e);
    return fail("Voices are unavailable right now.", 503);
  }
}
