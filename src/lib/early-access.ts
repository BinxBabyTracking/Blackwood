import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

/*
 * Early access to Coming Soon cases. Once the agency's owner has solved a
 * Coming Soon case (a database trigger sets cases.early_access_open), players
 * can request early access. Admin approves, which grants the case (an
 * early-access entitlement, so it can be played now), or denies, and the
 * player waits for the case's release and buys it then.
 */

export type RequestStatus = "pending" | "approved" | "denied";

function db() {
  const a = createAdminClient();
  if (!a) throw new Error("The server is not configured.");
  return a;
}

export async function requestStatus(userId: string, caseId: string): Promise<RequestStatus | null> {
  const { data } = await db().from("early_access_requests").select("status").eq("user_id", userId).eq("case_id", caseId).maybeSingle();
  return ((data as { status: RequestStatus } | null)?.status as RequestStatus) ?? null;
}

/** Files a request (once per player and case). */
export async function requestAccess(userId: string, caseId: string): Promise<{ status: RequestStatus } | { error: string }> {
  const { data: c } = await db().from("cases").select("status, early_access_open").eq("id", caseId).maybeSingle();
  const row = c as { status: string; early_access_open: boolean } | null;
  if (!row || row.status !== "coming_soon" || !row.early_access_open) return { error: "Early access isn't open for this case." };
  const existing = await requestStatus(userId, caseId);
  if (existing) return { status: existing };
  const { error } = await db().from("early_access_requests").insert({ user_id: userId, case_id: caseId });
  if (error) {
    console.error("early access request", error);
    return { error: "Your request could not be sent. Try again." };
  }
  return { status: "pending" };
}

export interface AccessRequest {
  id: number;
  caseId: string;
  userId: string;
  name: string | null;
  email: string | null;
  status: RequestStatus;
  createdAt: string;
  decidedAt: string | null;
}

/** Every request, pending first, then the most recent decisions. */
export async function allRequests(): Promise<AccessRequest[]> {
  const { data } = await db().from("early_access_requests").select("id, case_id, user_id, status, created_at, decided_at").order("created_at", { ascending: false }).limit(300);
  const rows = (data ?? []) as { id: number; case_id: string; user_id: string; status: RequestStatus; created_at: string; decided_at: string | null }[];
  const ids = [...new Set(rows.map((r) => r.user_id))];
  const { data: profiles } = ids.length ? await db().from("detective_profiles").select("id, display_name").in("id", ids) : { data: [] };
  const names = new Map(((profiles ?? []) as { id: string; display_name: string | null }[]).map((p) => [p.id, p.display_name]));
  const emails = new Map<string, string | null>();
  await Promise.all(
    ids.map(async (id) => {
      const { data: u } = await db().auth.admin.getUserById(id).catch(() => ({ data: null }));
      emails.set(id, u?.user?.email ?? null);
    }),
  );
  const order = { pending: 0, approved: 1, denied: 1 } as const;
  return rows
    .map((r) => ({ id: r.id, caseId: r.case_id, userId: r.user_id, name: names.get(r.user_id) ?? null, email: emails.get(r.user_id) ?? null, status: r.status, createdAt: r.created_at, decidedAt: r.decided_at }))
    .sort((a, b) => order[a.status] - order[b.status]);
}

/** Approve: the player gets the case now. Deny: they wait for release. */
export async function decide(id: number, approve: boolean) {
  const { data } = await db().from("early_access_requests").select("case_id, user_id").eq("id", id).maybeSingle();
  const r = data as { case_id: string; user_id: string } | null;
  if (!r) return;
  if (approve) {
    await db().from("case_entitlements").upsert({ user_id: r.user_id, case_id: r.case_id, source: "grant" }, { onConflict: "user_id,case_id" });
  } else {
    // Taking back an approval removes the early-access grant (never a purchase).
    await db().from("case_entitlements").delete().eq("user_id", r.user_id).eq("case_id", r.case_id).eq("source", "grant");
  }
  await db().from("early_access_requests").update({ status: approve ? "approved" : "denied", decided_at: new Date().toISOString() }).eq("id", id);
}
