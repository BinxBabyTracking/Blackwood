"use server";

import { refresh } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/types";

/** Maps the exceptions raised by the SQL functions to investigator-facing copy. */
const ERRORS: Record<string, string> = {
  not_authenticated: "Your session has ended. Sign in again.",
  case_not_found: "That case is not in the archive.",
  case_not_open: "That case is not open for joint investigation yet.",
  case_solo_only: "That case can only be worked solo.",
  not_entitled: "You need access to that case before you can open a joint investigation.",
  session_not_found: "No open joint investigation matches that code. Check it with the host.",
  session_full: "That joint investigation already has its full roster of six investigators.",
  not_a_member: "You are not on that investigation's roster.",
};

function explain(message: string) {
  const key = Object.keys(ERRORS).find((k) => message.includes(k));
  return key ? ERRORS[key] : `The agency system rejected the request: ${message}`;
}

async function client() {
  const supabase = await createClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  return supabase;
}

export async function openJointInvestigation(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const caseId = String(fd.get("caseId") ?? "");
  if (!caseId) return { status: "error", message: "Choose a case to investigate." };
  const supabase = await client();
  const { error } = await supabase.rpc("open_joint_investigation", { p_case_id: caseId });
  if (error) return { status: "error", message: explain(error.message) };
  refresh();
  return { status: "success", message: "Joint investigation opened. Share the invitation code with your team." };
}

export async function joinJointInvestigation(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const code = String(fd.get("code") ?? "")
    .trim()
    .toUpperCase();
  if (!/^[A-HJ-NP-Z2-9]{6}$/.test(code)) {
    return { status: "error", message: "Invitation codes are six characters.", fieldErrors: { code: "Enter the six-character code." } };
  }
  const supabase = await client();
  const { error } = await supabase.rpc("join_joint_investigation", { p_code: code });
  if (error) return { status: "error", message: explain(error.message) };
  refresh();
  return { status: "success", message: "You have joined the investigation roster." };
}

export async function setReady(fd: FormData) {
  const supabase = await client();
  const { error } = await supabase.rpc("set_investigator_ready", {
    p_session: String(fd.get("sessionId")),
    p_ready: fd.get("ready") === "true",
  });
  if (error) throw new Error(explain(error.message));
  refresh();
}

export async function leaveJointInvestigation(fd: FormData) {
  const supabase = await client();
  const { error } = await supabase.rpc("leave_joint_investigation", { p_session: String(fd.get("sessionId")) });
  if (error) throw new Error(explain(error.message));
  refresh();
}
