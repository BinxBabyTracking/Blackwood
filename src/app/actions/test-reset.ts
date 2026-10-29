"use server";

import { revalidatePath } from "next/cache";
import { requireInvestigator } from "@/lib/investigator";
import { isOwner, resetCaseForTesting } from "@/lib/test-reset";

/** The owner's account only: wipe a case to test it again from Accept Assignment. */
export async function resetCaseForOwner(caseId: string): Promise<{ ok: true } | { error: string }> {
  const me = await requireInvestigator();
  if (!isOwner(me.email)) return { error: "Only the agency's owner can reset a case." };
  try {
    await resetCaseForTesting(me.id, String(caseId).toUpperCase());
  } catch (e) {
    console.error("resetCaseForOwner", e);
    return { error: "The case could not be reset. Try again." };
  }
  revalidatePath("/agency/cases");
  revalidatePath("/agency");
  return { ok: true };
}
