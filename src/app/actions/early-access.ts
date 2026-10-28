"use server";

import { revalidatePath } from "next/cache";
import { hasAdminAccess } from "@/lib/admin-gate";
import { decide, requestAccess } from "@/lib/early-access";
import { requireInvestigator } from "@/lib/investigator";

/** A player asks for early access to a Coming Soon case. */
export async function requestEarlyAccess(caseId: string) {
  const me = await requireInvestigator();
  return requestAccess(me.id, String(caseId).toUpperCase());
}

/** Admin: approve or deny a request. */
export async function adminDecideEarlyAccess(fd: FormData) {
  const me = await requireInvestigator();
  if (!(await hasAdminAccess(me.id))) return;
  const id = Number(fd.get("id"));
  if (!Number.isInteger(id)) return;
  await decide(id, fd.get("approve") === "1");
  revalidatePath("/agency/admin");
}
