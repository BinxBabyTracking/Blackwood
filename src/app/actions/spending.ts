"use server";

import { revalidatePath } from "next/cache";
import { requireInvestigator } from "@/lib/investigator";
import { hasAdminAccess } from "@/lib/admin-gate";
import { saveRates, type Rates } from "@/lib/spending";

/** Saves the rates used to price the spending ledger. Admin only. */
export async function updateRates(fd: FormData) {
  const me = await requireInvestigator();
  if (!(await hasAdminAccess(me.id))) throw new Error("Not allowed.");
  const n = (k: string, max: number) => {
    const v = Number(fd.get(k));
    return Number.isFinite(v) ? Math.min(max, Math.max(0, v)) : 0;
  };
  const rates: Rates = {
    claude_input_per_mtok: n("claude_input_per_mtok", 1000),
    claude_output_per_mtok: n("claude_output_per_mtok", 1000),
    tts_per_1k_chars: n("tts_per_1k_chars", 100),
    stt_per_hour: n("stt_per_hour", 100),
    target_margin: n("target_margin", 95) / 100,
  };
  await saveRates(rates);
  revalidatePath("/agency/admin");
}
