"use server";

import type { InvestigationState } from "@/game/engine/types";
import { loadCase } from "@/game/registry";
import { requireInvestigator } from "@/lib/investigator";
import { isOwner } from "@/lib/test-reset";
import { sandboxAsk } from "@/lib/walk-test/sandbox";

/** Testing Zone: ask someone in a walkable room a question. Owner only, and never touches a real save. */
export async function walkAsk(caseId: string, characterId: string, text: string, prev: InvestigationState | null) {
  const me = await requireInvestigator(true);
  if (!isOwner(me.email)) return { error: "Not available." as const };
  const def = loadCase(caseId);
  if (!def || !def.characters.some((c) => c.id === characterId)) return { error: "Unknown person." as const };
  const q = String(text ?? "").replace(/\s+/g, " ").trim().slice(0, 300);
  if (!q) return { error: "Ask a question first." as const };
  try {
    const r = await sandboxAsk(def, characterId, q, prev, { userId: me.id, sessionId: `walk-test-${me.id}` });
    return { state: r.state, lines: r.lines };
  } catch (e) {
    console.error("walkAsk", e);
    return { error: e instanceof Error ? e.message : "Something went wrong." };
  }
}
