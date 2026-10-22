"use server";

import { revalidatePath } from "next/cache";
import { grantAdmin, noteFailedAttempt, passwordMatches, revokeAdmin, tooManyAttempts } from "@/lib/admin-gate";
import { requireInvestigator } from "@/lib/investigator";

export type UnlockState = { error: string | null };

/** Checks the Admin page password and, if it is right, opens the page for 12 hours. */
export async function unlockAdmin(_prev: UnlockState, fd: FormData): Promise<UnlockState> {
  const me = await requireInvestigator();
  if (tooManyAttempts(me.id)) return { error: "Too many attempts. Wait ten minutes and try again." };
  const password = String(fd.get("password") ?? "");
  if (!(await passwordMatches(password))) {
    noteFailedAttempt(me.id);
    return { error: "That password is not right." };
  }
  await grantAdmin(me.id);
  revalidatePath("/agency/admin");
  return { error: null };
}

export async function lockAdmin() {
  await requireInvestigator();
  await revokeAdmin();
  revalidatePath("/agency/admin");
}
