import { recordUsage } from "@/lib/usage";
import type { NextRequest } from "next/server";
import { canNarrate, heldNow, normalizeState } from "@/game/engine/engine";
import { findInvestigation } from "@/game/persistence";
import { loadCase } from "@/game/registry";
import { castVoice, narrate, NarrationError, refreshVoices } from "@/lib/narration/elevenlabs";
import { actingUser, fromGuestScreen } from "@/lib/party";

/** Allow time for a long document's pieces to be voiced. */
export const maxDuration = 60;

/** Splits text into pieces of at most `max` characters at paragraph, then sentence, boundaries. */
function chunks(text: string, max = 900): string[] {
  if (text.length <= max) return [text];
  const out: string[] = [];
  let cur = "";
  const push = (piece: string, sep: string) => {
    if (cur && cur.length + sep.length + piece.length > max) {
      out.push(cur);
      cur = piece;
    } else cur = cur ? cur + sep + piece : piece;
  };
  for (const para of text.split(/\n\s*\n/)) {
    if (para.length <= max) push(para, "\n\n");
    else for (const sentence of para.match(/[^.!?]+[.!?]+["')]*\s*|[^.!?]+$/g) ?? [para]) push(sentence.trim(), " ");
  }
  if (cur) out.push(cur);
  return out;
}

const recent = new Map<string, number[]>();
const LIMIT = 30; // requests per user per minute

function rateLimited(userId: string) {
  const now = Date.now();
  const hits = (recent.get(userId) ?? []).filter((t) => now - t < 60000);
  hits.push(now);
  recent.set(userId, hits);
  return hits.length > LIMIT;
}

/**
 * Evidence narration. GET /api/narration?caseId=C001&evidenceId=E07
 * Only for signed-in investigators, and only for evidence they have found.
 */
export async function GET(request: NextRequest) {
  const caseId = request.nextUrl.searchParams.get("caseId") ?? "";
  const evidenceId = request.nextUrl.searchParams.get("evidenceId") ?? "";
  const fail = (error: string, status: number) => Response.json({ error }, { status });

  const acting = await actingUser(caseId, fromGuestScreen(request));
  if (!acting) return fail("Sign in to hear narration.", 401);
  const user = { id: acting.userId };
  if (rateLimited(acting.guest?.id ?? user.id)) return fail("Too many narration requests. Wait a moment.", 429);

  const def = loadCase(caseId);
  const ev = def?.evidence.find((e) => e.id === evidenceId);
  if (!def || !ev) return fail("Unknown evidence.", 404);

  try {
    await refreshVoices();
    const loaded = await findInvestigation(user.id, def.id);
    const state = loaded ? normalizeState(def, loaded.state) : null;
    if (!loaded || !state || !canNarrate(def, state, ev.id)) return fail("You have not found that evidence yet.", 403);
    // While someone is held, what they find is theirs alone until it is over.
    const held = heldNow(state);
    if (held && held.seat !== (acting.guest?.id ?? "host") && def.captivity?.privateEvidence.includes(ev.id)) return fail("You have not found that evidence yet.", 403);
    // Most items are one narrated read; a few (a voice on a tape) are read part by part in each speaker's own voice.
    const parts = ev.readAloud?.length ? ev.readAloud : [{ text: ev.inspection }];
    // Long documents are voiced in pieces at the same time, then joined: one long request runs past the voice service's time limit.
    const jobs = parts.flatMap((part, i) => {
      const who = part.speakerId ? def.characters.find((c) => c.id === part.speakerId) : undefined;
      const voice = who?.voice ? castVoice(def.id, who.voice.sameAs ?? who.id, who.voice) : undefined;
      const pieces = chunks(part.text);
      return pieces.map((text, j) => ({
        // A single short read keeps its original cache key, so recordings already made stay valid.
        key: !ev.readAloud?.length && pieces.length === 1 ? `${def.id}/${ev.id}` : `${def.id}/${ev.id}-${i}${pieces.length > 1 ? `-${j}` : ""}`,
        text,
        voice,
      }));
    });
    const results = await Promise.all(jobs.map((j) => narrate(j.key, j.text, j.voice)));
    const clips: ArrayBuffer[] = [];
    let cached = true;
    results.forEach((clip, k) => {
      recordUsage({ userId: user.id, sessionId: loaded.sessionId, caseId: def.id, service: "tts", purpose: "narration", characters: jobs[k].text.length, saved: clip.cached });
      clips.push(clip.audio);
      cached &&= clip.cached;
    });
    // MP3 clips of the same format play back to back when joined.
    const audio = new Uint8Array(clips.reduce((n, c) => n + c.byteLength, 0));
    let at = 0;
    for (const c of clips) {
      audio.set(new Uint8Array(c), at);
      at += c.byteLength;
    }
    return new Response(audio, {
      headers: { "Content-Type": "audio/mpeg", "Cache-Control": "private, max-age=600", "X-Narration-Cache": cached ? "hit" : "miss" },
    });
  } catch (e) {
    if (e instanceof NarrationError) return fail(e.message, e.status);
    console.error("narration", e);
    return fail("Narration is unavailable right now.", 503);
  }
}
