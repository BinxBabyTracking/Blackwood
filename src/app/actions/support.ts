"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { hasAdminAccess } from "@/lib/admin-gate";
import { requireInvestigator } from "@/lib/investigator";
import { createClient } from "@/lib/supabase/server";
import { CATEGORIES, createTicket, playerClose, playerReply, setStatus, staffReply, type Category, type TicketStatus } from "@/lib/support";
import type { ActionResult } from "@/lib/types";

const text = (v: FormDataEntryValue | null, n: number) => (typeof v === "string" ? v.trim().slice(0, n) : "");
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** At most a few tickets and replies an hour from one address, so a stuck button or a bot can't flood the desk. */
const recent = new Map<string, number[]>();
function tooMany(key: string, limit: number) {
  const t = Date.now();
  const hits = (recent.get(key) ?? []).filter((x) => t - x < 3600_000);
  hits.push(t);
  recent.set(key, hits);
  return hits.length > limit;
}
async function ip() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

async function signedIn() {
  const supabase = await createClient();
  const { data } = (await supabase?.auth.getUser()) ?? { data: { user: null } };
  return data.user ? { id: data.user.id, email: data.user.email ?? null } : null;
}

/** Open a ticket. On success, goes to the ticket's own page. */
export async function openTicket(_: ActionResult, fd: FormData): Promise<ActionResult> {
  // A field people never see: anything in it came from a bot.
  if (text(fd.get("website"), 200)) return { status: "success", message: "Thanks. We have your message." };
  const me = await signedIn();
  const email = (me?.email ?? text(fd.get("email"), 200)).toLowerCase();
  const name = text(fd.get("name"), 80) || null;
  const category = (CATEGORIES.some((c) => c.id === fd.get("category")) ? fd.get("category") : "other") as Category;
  const caseId = text(fd.get("case"), 20).toUpperCase() || null;
  const subject = text(fd.get("subject"), 140);
  const body = text(fd.get("message"), 6000);
  const fieldErrors: Record<string, string> = {};
  if (!EMAIL.test(email)) fieldErrors.email = "Enter an email address we can reach you at.";
  if (subject.length < 3) fieldErrors.subject = "Give your ticket a short subject.";
  if (body.length < 10) fieldErrors.message = "Tell us a little more, so we can help.";
  if (Object.keys(fieldErrors).length) return { status: "error", message: "Check the highlighted fields.", fieldErrors };
  if (tooMany(`t:${me?.id ?? (await ip())}`, 5)) return { status: "error", message: "You've opened several tickets in the last hour. Add to one of those instead, or try again later." };
  let token: string;
  try {
    token = await createTicket({ userId: me?.id ?? null, email, name, category, caseId, subject, body });
  } catch (e) {
    console.error("openTicket", e);
    return { status: "error", message: "We couldn't send that just now. Please try again in a moment." };
  }
  redirect(`/support/${token}?new=1`);
}

/** The player adds to their ticket. */
export async function replyToTicket(_: ActionResult, fd: FormData): Promise<ActionResult> {
  const token = text(fd.get("token"), 64);
  const body = text(fd.get("message"), 6000);
  if (body.length < 2) return { status: "error", message: "Write your reply first." };
  if (tooMany(`r:${token}:${await ip()}`, 30)) return { status: "error", message: "That's a lot of replies in an hour. Please wait for us to answer." };
  const ok = await playerReply(token, body).catch(() => false);
  if (!ok) return { status: "error", message: "We couldn't find that ticket." };
  revalidatePath(`/support/${token}`);
  return { status: "success", message: "Sent. We'll answer here." };
}

export async function closeTicket(fd: FormData) {
  const token = text(fd.get("token"), 64);
  await playerClose(token).catch(() => false);
  revalidatePath(`/support/${token}`);
}

// ---------------------------------------------------------------------------
// Admin

async function admin() {
  const me = await requireInvestigator();
  return hasAdminAccess(me.id);
}

export async function adminReply(_: ActionResult, fd: FormData): Promise<ActionResult> {
  if (!(await admin())) return { status: "error", message: "Unlock Admin first." };
  const id = Number(fd.get("id"));
  const body = text(fd.get("message"), 8000);
  if (!Number.isInteger(id) || body.length < 2) return { status: "error", message: "Write a reply first." };
  try {
    await staffReply(id, body, fd.get("close") === "1");
  } catch (e) {
    console.error("adminReply", e);
    return { status: "error", message: "The reply was not saved." };
  }
  revalidatePath("/agency/admin");
  return { status: "success", message: "Reply sent." };
}

export async function adminSetStatus(fd: FormData) {
  if (!(await admin())) return;
  const id = Number(fd.get("id"));
  const status = String(fd.get("status")) as TicketStatus;
  if (!Number.isInteger(id) || !["open", "answered", "closed"].includes(status)) return;
  await setStatus(id, status);
  revalidatePath("/agency/admin");
}
