"use server";

import { loadCase } from "@/game/registry";
import { hasAdminAccess } from "@/lib/admin-gate";
import { requireInvestigator } from "@/lib/investigator";
import { generateTrack } from "@/lib/soundtrack";

/** Admin: makes one music or room-sound track with ElevenLabs and stores it. */
export async function makeTrack(caseId: string, key: string): Promise<{ ok: true; bytes: number } | { error: string }> {
  const me = await requireInvestigator();
  if (!(await hasAdminAccess(me.id))) return { error: "Not allowed." };
  const def = loadCase(caseId);
  const track = def?.soundtrack?.find((t) => t.key === key);
  if (!def || !track) return { error: "Unknown track." };
  try {
    return { ok: true, bytes: await generateTrack(def.id, track) };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "The track could not be made." };
  }
}
