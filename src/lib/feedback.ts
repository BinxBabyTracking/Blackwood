import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

/*
 * Player feedback: a review at the end of a case, and problem reports sent
 * from the game menu at any time. Stored server-side only, read on Admin.
 */

export type Difficulty = "too_easy" | "about_right" | "too_hard";

export type FeedbackRow = {
  id: number;
  created_at: string;
  case_id: string;
  user_id: string | null;
  guest_name: string | null;
  kind: "review" | "report";
  rating: number | null;
  difficulty: Difficulty | null;
  stuck: string | null;
  message: string | null;
  context: Record<string, unknown> | null;
};

function db() {
  const a = createAdminClient();
  if (!a) throw new Error("The server is not configured to save feedback.");
  return a;
}

export async function saveFeedback(row: Omit<FeedbackRow, "id" | "created_at"> & { session_id?: string | null }) {
  const { error } = await db().from("case_feedback").insert(row);
  if (error) throw new Error(error.message);
}

/** Whether this investigator has already reviewed this case. */
export async function hasReviewed(userId: string, caseId: string) {
  const a = createAdminClient();
  if (!a) return false;
  const { data } = await a.from("case_feedback").select("id").eq("user_id", userId).eq("case_id", caseId).eq("kind", "review").limit(1);
  return Boolean(data?.length);
}

/** The cases this investigator has reviewed. */
export async function reviewedCases(userId: string): Promise<Set<string>> {
  const a = createAdminClient();
  if (!a) return new Set();
  const { data } = await a.from("case_feedback").select("case_id").eq("user_id", userId).eq("kind", "review");
  return new Set(((data ?? []) as { case_id: string }[]).map((r) => r.case_id));
}

/** Admin: reviews summarized per case, and the latest entries with their names. */
export async function getFeedback() {
  const { data, error } = await db().from("case_feedback").select("*").order("created_at", { ascending: false }).limit(500);
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as FeedbackRow[];
  const ids = [...new Set(rows.map((r) => r.user_id).filter(Boolean))] as string[];
  const { data: profiles } = ids.length ? await db().from("detective_profiles").select("id, display_name").in("id", ids) : { data: [] };
  const names = new Map(((profiles ?? []) as { id: string; display_name: string | null }[]).map((p) => [p.id, p.display_name?.trim() || "Investigator"]));
  const byCase = new Map<string, { reviews: number; ratingSum: number; rated: number; difficulty: Record<Difficulty, number>; reports: number }>();
  for (const r of rows) {
    const c = byCase.get(r.case_id) ?? byCase.set(r.case_id, { reviews: 0, ratingSum: 0, rated: 0, difficulty: { too_easy: 0, about_right: 0, too_hard: 0 }, reports: 0 }).get(r.case_id)!;
    if (r.kind === "report") c.reports++;
    else {
      c.reviews++;
      if (r.rating) {
        c.ratingSum += r.rating;
        c.rated++;
      }
      if (r.difficulty) c.difficulty[r.difficulty]++;
    }
  }
  return {
    cases: [...byCase.entries()].map(([caseId, c]) => ({ caseId, ...c, average: c.rated ? c.ratingSum / c.rated : null })).sort((a, b) => a.caseId.localeCompare(b.caseId)),
    latest: rows.slice(0, 100).map((r) => ({ ...r, who: r.guest_name ? `${r.guest_name} (guest)` : r.user_id ? names.get(r.user_id) ?? "Investigator" : "Unknown" })),
  };
}
