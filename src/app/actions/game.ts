"use server";

import { redirect } from "next/navigation";
import { GameError, normalizeState, reduce, respond } from "@/game/engine/engine";
import type { ActionResponse, GameAction } from "@/game/engine/types";
import { findInvestigation, investigatorName, PersistenceError, recordClosedCase, restartInvestigation, saveState, startInvestigation } from "@/game/persistence";
import { loadCase } from "@/game/registry";
import { createClient } from "@/lib/supabase/server";

async function currentUserId() {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

/** Form action behind "Accept Assignment". */
export async function acceptAssignment(fd: FormData) {
  const caseId = String(fd.get("caseId") ?? "");
  const def = loadCase(caseId);
  const userId = await currentUserId();
  if (!userId) redirect(`/login?next=/agency/assignments/${caseId}`);
  if (!def) redirect(`/agency/assignments/${caseId}?error=not_playable`);
  try {
    await startInvestigation(userId, def);
  } catch (e) {
    const reason = e instanceof PersistenceError ? "accept_failed" : "error";
    console.error("acceptAssignment", e);
    redirect(`/agency/assignments/${caseId}?error=${reason}`);
  }
  redirect(`/play/${def.id}`);
}

export async function restartCase(caseId: string): Promise<ActionResponse | { error: string }> {
  const def = loadCase(caseId);
  const userId = await currentUserId();
  if (!def || !userId) return { error: "Sign in again to continue." };
  try {
    const loaded = await restartInvestigation(userId, def);
    return respond(def, normalizeState(def, loaded.state));
  } catch (e) {
    return { error: e instanceof PersistenceError ? e.message : "The investigation could not be restarted." };
  }
}

const ACTIONS = new Set<GameAction["type"]>([
  "dismissIntro", "travel", "hotspot", "collect", "readDocument", "talk", "ask", "present", "answerCall", "placeCall",
  "openDelivery", "boardAdd", "boardMove", "boardRemove", "connect", "disconnect", "saveNotes", "saveEvidenceNote", "setNarration", "setVoices",
  "dismissMessages", "saveReport", "submitConclusion",
]);

/** `saved: false` means progress may not have been written; a rule refusal changes nothing and keeps `saved: true`. */
export type PlayResult = ActionResponse | { error: string; saved: boolean };

/**
 * The single entry point for gameplay. The server loads the saved state,
 * applies the action with the case rules, saves, and returns only what the
 * player is allowed to see.
 */
export async function playAction(caseId: string, action: GameAction): Promise<PlayResult> {
  if (!action || typeof action !== "object" || !ACTIONS.has(action.type)) return { error: "Unknown action.", saved: true };
  const def = loadCase(caseId);
  const userId = await currentUserId();
  if (!def) return { error: "This case is not playable.", saved: true };
  if (!userId) return { error: "Your session has ended. Sign in again to continue.", saved: false };

  try {
    // The investigator's name on a filed report comes from their profile, never from the browser.
    const act: GameAction = action.type === "submitConclusion" ? { ...action, investigator: await investigatorName(userId) } : action;
    for (let attempt = 0; attempt < 2; attempt++) {
      const loaded = await findInvestigation(userId, def.id);
      if (!loaded) return { error: "Accept the assignment before starting the investigation.", saved: true };
      const { state, outcome } = reduce(def, normalizeState(def, loaded.state), act);
      const saved = await saveState(def, loaded, state);
      if (!saved) continue; // another tab saved first; reload and apply again
      if (outcome.kind === "verdict" && outcome.correct) {
        const record = await recordClosedCase(userId, def, loaded, state);
        if (record) outcome.record = { first: record.first, awarded: record.awarded, rank: record.rank };
      }
      return respond(def, state, outcome);
    }
    return { error: "Your investigation was updated in another window. Reload to continue.", saved: false };
  } catch (e) {
    if (e instanceof GameError) return { error: e.message, saved: true };
    if (e instanceof PersistenceError) return { error: e.message, saved: false };
    console.error("playAction", e);
    return { error: "Something went wrong saving your investigation. Try again.", saved: false };
  }
}
