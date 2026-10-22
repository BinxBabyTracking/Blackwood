"use server";

import { redirect } from "next/navigation";
import { GameError, normalizeState, reduce, respond } from "@/game/engine/engine";
import type { ActionResponse, GameAction } from "@/game/engine/types";
import { findInvestigation, investigatorName, PersistenceError, recordClosedCase, restartInvestigation, saveState, startInvestigation } from "@/game/persistence";
import { loadCase } from "@/game/registry";
import { interpretQuestion } from "@/lib/interview/understand";
import { createClient } from "@/lib/supabase/server";

async function currentUserId() {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

/** Form action behind "Accept Assignment". */
/** Interview questions per investigator per minute. Each may call the interview model, so this caps cost as well as abuse. */
const ASK_LIMIT = 30;
const asks = new Map<string, number[]>();
function askedTooFast(userId: string) {
  const now = Date.now();
  const recent = (asks.get(userId) ?? []).filter((t) => now - t < 60000);
  recent.push(now);
  asks.set(userId, recent);
  return recent.length > ASK_LIMIT;
}

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
  // Interviews are asked in the player's own words ("askFree"); authored question ids are never accepted from the browser.
  "dismissIntro", "travel", "hotspot", "collect", "readDocument", "talk", "askFree", "present", "answerCall", "placeCall",
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
      const current = normalizeState(def, loaded.state);
      // Which authored answer a free-form question asks for is decided here, on the server.
      // Anything the browser put in match or composed is discarded and decided here.
      let step: GameAction = act;
      if (act.type === "askFree") {
        if (askedTooFast(userId)) return { error: "Slow down a little. Give them a moment to answer.", saved: true };
        const text = String(act.text ?? "").slice(0, 300);
        const r = await interpretQuestion(def, current, String(act.characterId ?? ""), text);
        step = { type: "askFree", characterId: String(act.characterId ?? ""), text, match: r.match, composed: r.composed, facts: r.facts };
      }
      const { state, outcome } = reduce(def, current, step);
      const saved = await saveState(def, loaded, state);
      if (!saved) continue; // another tab saved first; reload and apply again
      if (outcome.kind === "verdict" && outcome.correct) {
        // The case is closed and saved either way. If the service record can't be written right now,
        // the closing still plays, and the record is completed the next time the case is opened.
        const record = await recordClosedCase(userId, def, loaded, state).catch((e) => {
          console.error("recordClosedCase", e);
          return null;
        });
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
