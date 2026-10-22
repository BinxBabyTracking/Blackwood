import { recordUsage } from "@/lib/usage";
import type { NextRequest } from "next/server";
import { canNarrate, normalizeState } from "@/game/engine/engine";
import { findInvestigation } from "@/game/persistence";
import { loadCase } from "@/game/registry";
import { narrate, NarrationError } from "@/lib/narration/elevenlabs";
import { actingUser, fromGuestScreen } from "@/lib/party";

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
    const loaded = await findInvestigation(user.id, def.id);
    if (!loaded || !canNarrate(def, normalizeState(def, loaded.state), ev.id)) return fail("You have not found that evidence yet.", 403);
    const { audio, cached } = await narrate(`${def.id}/${ev.id}`, ev.inspection);
    recordUsage({ userId: user.id, sessionId: loaded.sessionId, caseId: def.id, service: "tts", purpose: "narration", characters: ev.inspection.length, saved: cached });
    return new Response(audio, {
      headers: { "Content-Type": "audio/mpeg", "Cache-Control": "private, max-age=86400", "X-Narration-Cache": cached ? "hit" : "miss" },
    });
  } catch (e) {
    if (e instanceof NarrationError) return fail(e.message, e.status);
    console.error("narration", e);
    return fail("Narration is unavailable right now.", 503);
  }
}
