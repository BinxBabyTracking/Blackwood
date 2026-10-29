import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

/** The agency owner's account, the only one that can reset its own cases for retesting. */
export const OWNER_EMAIL = "imbush89@gmail.com";
export const isOwner = (email: string | null | undefined) => (email ?? "").toLowerCase() === OWNER_EMAIL;

/**
 * Wipes one case from an account as if it had never been accepted: every
 * investigation of it (with its saves), the first-solve record, the account's
 * leaderboard entries for it and any open team lobby. Access (free, bought or
 * early access) is kept, so the case can be accepted again straight away.
 * Spending and feedback records are kept for the ledger.
 */
export async function resetCaseForTesting(userId: string, caseId: string) {
  const db = createAdminClient();
  if (!db) throw new Error("The server is not configured.");
  const { data: parts } = await db
    .from("investigation_participants")
    .select("session_id, session:investigation_sessions!inner(id, case_id)")
    .eq("user_id", userId)
    .eq("session.case_id", caseId);
  const sessions = [...new Set(((parts ?? []) as unknown as { session_id: string }[]).map((p) => p.session_id))];
  await db.from("case_completions").delete().eq("user_id", userId).eq("case_id", caseId);
  await db.from("leaderboard_entries").delete().eq("user_id", userId).eq("case_id", caseId);
  await db.from("party_lobbies").update({ status: "ended" }).eq("host_user_id", userId).eq("case_id", caseId).neq("status", "ended");
  if (sessions.length) {
    const { error } = await db.from("investigation_sessions").delete().in("id", sessions);
    if (error) throw new Error(error.message);
  }
  return sessions.length;
}
