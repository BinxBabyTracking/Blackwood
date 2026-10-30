import "server-only";
import { loadCase } from "@/game/registry";
import { createClient } from "@/lib/supabase/server";

/**
 * How each case stands for the signed-in investigator, for the status tag:
 * "available" once they may play it (early access, a purchase, or a free
 * released case they have not started), "open" once accepted and under way,
 * "solved" once closed. Missing for cases that only follow the catalog status.
 */
export type ViewerCaseState = "available" | "open" | "solved";

export async function viewerCaseStates(): Promise<Record<string, ViewerCaseState>> {
  const supabase = await createClient();
  if (!supabase) return {};
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return {};
  const [{ data: ents }, { data: rows }] = await Promise.all([
    supabase.from("case_entitlements").select("case_id").eq("user_id", user.id),
    supabase
      .from("investigation_participants")
      .select("session:investigation_sessions!inner(case_id, status, mode)")
      .eq("user_id", user.id)
      .eq("session.mode", "solo")
      .in("session.status", ["active", "closed"]),
  ]);
  const out: Record<string, ViewerCaseState> = {};
  for (const e of (ents ?? []) as { case_id: string }[]) out[e.case_id] = "available";
  for (const r of (rows ?? []) as unknown as { session: { case_id: string; status: string } }[]) {
    const id = r.session.case_id;
    if (r.session.status === "active") out[id] = "open";
    else if (out[id] !== "open") out[id] = "solved";
  }
  return out;
}

export interface CaseFailure {
  /** The losing ending's title, e.g. "The Empty Chair". */
  title: string;
  /** One line on why the investigation failed. */
  reason: string;
}

/**
 * Cases whose latest investigation ended in a losing ending and was put aside,
 * with nothing open or solved since: shown as Failed, with a fresh try offered.
 */
export async function viewerFailures(): Promise<Record<string, CaseFailure>> {
  const supabase = await createClient();
  if (!supabase) return {};
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return {};
  const { data: rows } = await supabase
    .from("investigation_participants")
    .select("session:investigation_sessions!inner(id, case_id, status, mode, last_activity_at)")
    .eq("user_id", user.id)
    .eq("session.mode", "solo");
  const sessions = ((rows ?? []) as unknown as { session: { id: string; case_id: string; status: string; last_activity_at: string | null } }[]).map((r) => r.session);
  const live = new Set(sessions.filter((x) => x.status === "active" || x.status === "closed" || x.status === "forming").map((x) => x.case_id));
  // The latest put-aside investigation of each case with nothing open or solved since.
  const latest = new Map<string, { id: string; at: string }>();
  for (const x of sessions) {
    if (x.status !== "archived" || live.has(x.case_id)) continue;
    const at = x.last_activity_at ?? "";
    if (!latest.has(x.case_id) || at > latest.get(x.case_id)!.at) latest.set(x.case_id, { id: x.id, at });
  }
  if (!latest.size) return {};
  const ids = [...latest.values()].map((v) => v.id);
  const { data: saves } = await supabase.from("save_games").select("session_id, state").in("session_id", ids);
  const out: Record<string, CaseFailure> = {};
  for (const [caseId, v] of latest) {
    const save = ((saves ?? []) as { session_id: string; state: { flags?: unknown; ending?: unknown } | null }[]).find((g) => g.session_id === v.id);
    const flags = save?.state?.flags;
    if (!Array.isArray(flags) || !flags.includes("case_lost")) continue;
    const ending = loadCase(caseId)?.solution.endings?.find((e) => e.id === save?.state?.ending);
    out[caseId] = {
      title: ending?.title ?? "Case failed",
      reason: ending?.lossReason ?? "The investigation ended without the case being closed.",
    };
  }
  return out;
}
