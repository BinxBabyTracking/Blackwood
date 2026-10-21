import type { NextRequest } from "next/server";
import { normalizeState, spokenLine } from "@/game/engine/engine";
import { findInvestigation } from "@/game/persistence";
import { loadCase } from "@/game/registry";
import { castVoice, narrate, NarrationError } from "@/lib/narration/elevenlabs";
import { createClient } from "@/lib/supabase/server";

const recent = new Map<string, number[]>();
const LIMIT = 60; // lines per user per minute

function rateLimited(userId: string) {
  const now = Date.now();
  const hits = (recent.get(userId) ?? []).filter((t) => now - t < 60000);
  hits.push(now);
  recent.set(userId, hits);
  return hits.length > LIMIT;
}

const KINDS = new Set(["conversation", "statement", "call"]);

/**
 * Character voices. GET /api/voice?caseId=C001&kind=conversation&id=margaret&n=3
 *
 * The server looks the line up in the player's own save (or in a statement or
 * call they have access to) and speaks exactly that text in the speaker's
 * fixed voice, so audio always matches the subtitle and nothing unheard can
 * be requested. Each line is generated once and shared from the cache.
 */
export async function GET(request: NextRequest) {
  const p = request.nextUrl.searchParams;
  const caseId = p.get("caseId") ?? "";
  const kind = p.get("kind") ?? "";
  const id = p.get("id") ?? "";
  const n = Number(p.get("n"));
  const fail = (error: string, status: number) => Response.json({ error }, { status });

  if (!KINDS.has(kind) || !/^[a-z0-9_]{1,40}$/i.test(id) || !Number.isInteger(n) || n < 0 || n > 2000) return fail("Unknown line.", 400);

  const supabase = await createClient();
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;
  if (!user) return fail("Sign in to hear voices.", 401);
  if (rateLimited(user.id)) return fail("Too many voice requests. Wait a moment.", 429);

  const def = loadCase(caseId);
  if (!def) return fail("Unknown case.", 404);

  try {
    const loaded = await findInvestigation(user.id, def.id);
    if (!loaded) return fail("Accept the assignment first.", 403);
    const line = spokenLine(def, normalizeState(def, loaded.state), { kind: kind as "conversation", id, n });
    if (!line) return fail("That line is not available.", 403);
    const speaker = def.characters.find((c) => c.id === line.speakerId);
    if (!speaker?.voice) return fail("This person has no voice assigned.", 404);
    const voice = castVoice(speaker.id, speaker.voice);
    const { audio, cached } = await narrate(`${def.id}/voices/${speaker.id}`, line.text, voice);
    return new Response(audio, {
      headers: { "Content-Type": "audio/mpeg", "Cache-Control": "private, max-age=86400", "X-Voice-Cache": cached ? "hit" : "miss" },
    });
  } catch (e) {
    if (e instanceof NarrationError) return fail(e.message, e.status);
    console.error("voice", e);
    return fail("Voices are unavailable right now.", 503);
  }
}
