import "server-only";
import { randomBytes } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

/*
 * Support tickets. A player opens one on /support (signed in or not); the
 * agency answers on Admin > Support. Every ticket has a secret token, and its
 * page /support/<token> is how the player gets back to it. Server only.
 */

export const CATEGORIES = [
  { id: "account", label: "My account or sign-in" },
  { id: "billing", label: "A purchase or refund" },
  { id: "bug", label: "Something is broken" },
  { id: "case", label: "Help with a case" },
  { id: "other", label: "Something else" },
] as const;
export type Category = (typeof CATEGORIES)[number]["id"];
export type TicketStatus = "open" | "answered" | "closed";

export type Ticket = {
  id: number;
  token: string;
  user_id: string | null;
  email: string;
  name: string | null;
  category: Category;
  case_id: string | null;
  subject: string;
  status: TicketStatus;
  created_at: string;
  updated_at: string;
  player_seen_at: string;
  staff_seen_at: string | null;
};
export type TicketMessage = { id: number; ticket_id: number; author: "player" | "staff"; body: string; created_at: string };

export const categoryLabel = (c: string) => CATEGORIES.find((x) => x.id === c)?.label ?? "Something else";

function db() {
  const a = createAdminClient();
  if (!a) throw new Error("The server is not configured for support tickets.");
  return a;
}

const now = () => new Date().toISOString();

export async function createTicket(t: { userId: string | null; email: string; name: string | null; category: Category; caseId: string | null; subject: string; body: string }) {
  const token = randomBytes(18).toString("base64url");
  const { data, error } = await db()
    .from("support_tickets")
    .insert({ token, user_id: t.userId, email: t.email, name: t.name, category: t.category, case_id: t.caseId, subject: t.subject })
    .select("id, token")
    .single();
  if (error) throw new Error(error.message);
  const { error: e2 } = await db().from("support_messages").insert({ ticket_id: data.id, author: "player", body: t.body });
  if (e2) throw new Error(e2.message);
  return data.token as string;
}

export async function ticketByToken(token: string): Promise<{ ticket: Ticket; messages: TicketMessage[] } | null> {
  if (!/^[A-Za-z0-9_-]{16,64}$/.test(token)) return null;
  const { data } = await db().from("support_tickets").select("*").eq("token", token).maybeSingle();
  if (!data) return null;
  return { ticket: data as Ticket, messages: await messagesFor(data.id) };
}

async function messagesFor(ticketId: number) {
  const { data } = await db().from("support_messages").select("*").eq("ticket_id", ticketId).order("created_at");
  return (data ?? []) as TicketMessage[];
}

/** The player has read the ticket up to now. */
export async function markPlayerSeen(id: number) {
  await db().from("support_tickets").update({ player_seen_at: now() }).eq("id", id);
}

/** A reply from the player: the ticket goes back to the agency, reopened if it was closed. */
export async function playerReply(token: string, body: string) {
  const found = await ticketByToken(token);
  if (!found) return false;
  await db().from("support_messages").insert({ ticket_id: found.ticket.id, author: "player", body });
  await db().from("support_tickets").update({ status: "open", updated_at: now(), player_seen_at: now() }).eq("id", found.ticket.id);
  return true;
}

export async function playerClose(token: string) {
  const found = await ticketByToken(token);
  if (!found) return false;
  await db().from("support_tickets").update({ status: "closed", updated_at: now() }).eq("id", found.ticket.id);
  return true;
}

/** A signed-in player's tickets, newest activity first, with whether the agency has answered since they last looked. */
export async function ticketsForUser(userId: string) {
  const { data } = await db().from("support_tickets").select("*").eq("user_id", userId).order("updated_at", { ascending: false }).limit(50);
  const rows = (data ?? []) as Ticket[];
  if (!rows.length) return [];
  const { data: staff } = await db()
    .from("support_messages")
    .select("ticket_id, created_at")
    .eq("author", "staff")
    .in(
      "ticket_id",
      rows.map((r) => r.id),
    );
  const last = new Map<number, string>();
  for (const m of (staff ?? []) as { ticket_id: number; created_at: string }[]) if ((last.get(m.ticket_id) ?? "") < m.created_at) last.set(m.ticket_id, m.created_at);
  return rows.map((t) => ({ ...t, unread: (last.get(t.id) ?? "") > t.player_seen_at }));
}

/** How many tickets have an answer from the agency the player has not read yet. */
export async function unreadForUser(userId: string) {
  return (await ticketsForUser(userId).catch(() => [])).filter((t) => t.unread).length;
}

// ---------------------------------------------------------------------------
// Admin

export async function adminTickets(status: TicketStatus | "all") {
  let q = db().from("support_tickets").select("*").order("updated_at", { ascending: false }).limit(200);
  if (status !== "all") q = q.eq("status", status);
  const { data } = await q;
  const rows = (data ?? []) as Ticket[];
  const { data: counts } = await db().from("support_tickets").select("status");
  const tally = { open: 0, answered: 0, closed: 0 } as Record<TicketStatus, number>;
  for (const r of (counts ?? []) as { status: TicketStatus }[]) tally[r.status]++;
  const ids = rows.map((r) => r.id);
  const { data: msgs } = ids.length ? await db().from("support_messages").select("*").in("ticket_id", ids).order("created_at") : { data: [] };
  const byTicket = new Map<number, TicketMessage[]>();
  for (const m of (msgs ?? []) as TicketMessage[]) byTicket.set(m.ticket_id, [...(byTicket.get(m.ticket_id) ?? []), m]);
  const userIds = [...new Set(rows.map((r) => r.user_id).filter(Boolean))] as string[];
  const { data: profiles } = userIds.length ? await db().from("detective_profiles").select("id, display_name").in("id", userIds) : { data: [] };
  const names = new Map(((profiles ?? []) as { id: string; display_name: string | null }[]).map((p) => [p.id, p.display_name?.trim() || null]));
  return {
    tally,
    tickets: rows.map((t) => ({ ...t, displayName: t.user_id ? names.get(t.user_id) ?? null : null, messages: byTicket.get(t.id) ?? [] })),
  };
}

export async function staffReply(id: number, body: string, close: boolean) {
  await db().from("support_messages").insert({ ticket_id: id, author: "staff", body });
  await db()
    .from("support_tickets")
    .update({ status: close ? "closed" : "answered", updated_at: now(), staff_seen_at: now() })
    .eq("id", id);
}

export async function setStatus(id: number, status: TicketStatus) {
  await db().from("support_tickets").update({ status, updated_at: now() }).eq("id", id);
}

/** Tickets waiting on the agency, for the Admin tab label. */
export async function openCount() {
  const { count } = await db().from("support_tickets").select("id", { count: "exact", head: true }).eq("status", "open");
  return count ?? 0;
}
