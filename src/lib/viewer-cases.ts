import "server-only";
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
