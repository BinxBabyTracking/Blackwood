"use server";

import { normalizeState } from "@/game/engine/engine";
import { findInvestigation } from "@/game/persistence";
import { loadCase } from "@/game/registry";
import { saveFeedback, type Difficulty } from "@/lib/feedback";
import { actingUser } from "@/lib/party";

const DIFFICULTIES = new Set<Difficulty>(["too_easy", "about_right", "too_hard"]);
const clip = (v: unknown, n: number) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, n) : "") || null;

/** Feedback per person per hour, so a stuck button can't flood the table. */
const recent = new Map<string, number[]>();
function tooMany(key: string) {
  const now = Date.now();
  const hits = (recent.get(key) ?? []).filter((t) => now - t < 3600_000);
  hits.push(now);
  recent.set(key, hits);
  return hits.length > 20;
}

async function who(caseId: string, asGuest: boolean) {
  const def = loadCase(caseId);
  if (!def) return null;
  const acting = await actingUser(def.id, asGuest);
  if (!acting) return null;
  const loaded = await findInvestigation(acting.userId, def.id).catch(() => null);
  return { def, acting, loaded };
}

/** The end-of-case review: stars, difficulty, where they got stuck, anything else. */
export async function submitReview(
  caseId: string,
  review: { rating: number | null; difficulty: string | null; stuck: string; message: string },
  asGuest = false,
): Promise<{ ok: true } | { error: string }> {
  const w = await who(caseId, asGuest);
  if (!w) return { error: "Your session has ended. Sign in again to send a review." };
  const rating = Number.isInteger(review?.rating) && review.rating! >= 1 && review.rating! <= 5 ? review.rating : null;
  const difficulty = DIFFICULTIES.has(review?.difficulty as Difficulty) ? (review.difficulty as Difficulty) : null;
  const stuck = clip(review?.stuck, 500);
  const message = clip(review?.message, 4000);
  if (!rating && !difficulty && !stuck && !message) return { error: "Choose a rating or write something first." };
  if (tooMany(w.acting.guest?.id ?? w.acting.userId)) return { error: "Thanks, that's plenty for now." };
  try {
    await saveFeedback({
      case_id: w.def.id,
      user_id: w.acting.guest ? null : w.acting.userId,
      guest_name: w.acting.guest?.name ?? null,
      session_id: w.loaded?.sessionId ?? null,
      kind: "review",
      rating,
      difficulty,
      stuck,
      message,
      context: w.acting.guest ? { host: w.acting.userId } : null,
    });
    return { ok: true };
  } catch (e) {
    console.error("submitReview", e);
    return { error: "The review could not be sent. Try again." };
  }
}

/**
 * "Send feedback" from the game menu. What the player writes, plus where they
 * were: the location, what they had open, and the last few lines of their most
 * recent conversation, so a report like "Rosa wouldn't answer" arrives with the exchange.
 */
export async function submitReport(
  caseId: string,
  report: { message: string; open: string; characterId?: string | null },
  asGuest = false,
): Promise<{ ok: true } | { error: string }> {
  const w = await who(caseId, asGuest);
  if (!w) return { error: "Your session has ended. Sign in again to send feedback." };
  const message = clip(report?.message, 4000);
  if (!message) return { error: "Tell us what happened first." };
  if (tooMany(w.acting.guest?.id ?? w.acting.userId)) return { error: "Thanks, that's plenty for now." };
  const s = w.loaded ? normalizeState(w.def, w.loaded.state) : null;
  const talked = s ? (report?.characterId && s.conversations[report.characterId] ? report.characterId : s.talkedTo.at(-1) ?? null) : null;
  const person = talked ? w.def.characters.find((c) => c.id === talked) : null;
  const lines = talked && s ? (s.conversations[talked] ?? []).filter((l) => l.speaker !== "cue").slice(-8).map((l) => `${l.speaker === "you" ? "Investigator" : person?.name ?? l.speaker}: ${l.text}`) : [];
  const context = s
    ? {
        location: w.def.locations.find((l) => l.id === s.location)?.name ?? s.location,
        open: clip(report?.open, 80),
        evidence: s.evidence.length,
        photos: s.photos?.length ?? 0,
        deductions: s.deductions.length,
        status: s.status,
        conversation: person ? { with: person.name, lines } : null,
        ...(w.acting.guest ? { host: w.acting.userId } : {}),
      }
    : null;
  try {
    await saveFeedback({
      case_id: w.def.id,
      user_id: w.acting.guest ? null : w.acting.userId,
      guest_name: w.acting.guest?.name ?? null,
      session_id: w.loaded?.sessionId ?? null,
      kind: "report",
      rating: null,
      difficulty: null,
      stuck: null,
      message,
      context,
    });
    return { ok: true };
  } catch (e) {
    console.error("submitReport", e);
    return { error: "Your feedback could not be sent. Try again." };
  }
}
