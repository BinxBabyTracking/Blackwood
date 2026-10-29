"use server";

import { LEGAL_VERSION, MIN_AGE } from "@/lib/legal";
import { createClient } from "@/lib/supabase/server";

/** Records that the signed-in investigator accepted the current terms (and confirmed their age) on their account. */
export async function acceptTerms(): Promise<{ ok: true } | { error: string }> {
  const supabase = await createClient();
  if (!supabase) return { error: "The server is not configured." };
  const { error } = await supabase.auth.updateUser({ data: { terms_version: LEGAL_VERSION, terms_accepted_at: new Date().toISOString(), age_confirmed: MIN_AGE } });
  if (error) return { error: "That didn't save. Try again." };
  return { ok: true };
}
