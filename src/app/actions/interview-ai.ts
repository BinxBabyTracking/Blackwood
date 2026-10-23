"use server";

import { hasAdminAccess } from "@/lib/admin-gate";
import { requireInvestigator } from "@/lib/investigator";
import { testInterviewModel } from "@/lib/interview/understand";

/** Admin: checks the interview AI can be reached with the server's key. */
export async function checkInterviewAI() {
  const me = await requireInvestigator();
  if (!(await hasAdminAccess(me.id))) return { ok: false, model: "", keyType: "", status: null, message: "Not allowed." };
  return testInterviewModel();
}
