import type { CatalogCase } from "./types";

export type AssignmentAction =
  | { kind: "in_preparation" }
  | { kind: "coming_soon" }
  | { kind: "retired" }
  | { kind: "sign_in" }
  | { kind: "resume"; sessionId: string }
  | { kind: "accept" }
  | { kind: "purchase" };

/**
 * Decides which assignment action a case offers. Pure, so the rules can be
 * tested and reused by the Phase 2 engine. Purchase and entitlement checks are
 * re-done server-side when those features exist; this only drives the UI.
 */
export function resolveAssignmentAction(
  c: Pick<CatalogCase, "status" | "is_preview" | "tier">,
  viewer: { signedIn: boolean; entitled: boolean; activeSessionId: string | null },
): AssignmentAction {
  if (c.is_preview || c.status === "in_development") return { kind: "in_preparation" };
  if (c.status === "coming_soon") return { kind: "coming_soon" };
  if (c.status === "retired") return { kind: "retired" };
  if (!viewer.signedIn) return { kind: "sign_in" };
  if (viewer.activeSessionId) return { kind: "resume", sessionId: viewer.activeSessionId };
  if (viewer.entitled || c.tier.price_cents === 0) return { kind: "accept" };
  return { kind: "purchase" };
}
