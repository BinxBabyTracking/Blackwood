import type { CatalogCase } from "./types";

export type AssignmentAction =
  | { kind: "in_preparation" }
  | { kind: "coming_soon" }
  | { kind: "retired" }
  | { kind: "sign_in" }
  | { kind: "resume" }
  | { kind: "review_closed" }
  | { kind: "accept" }
  | { kind: "purchase" };

/**
 * Decides which assignment action a case offers. Pure, so the rules can be
 * tested. Entitlement and status are checked again on the server when the
 * player actually accepts; this only drives the UI.
 */
export function resolveAssignmentAction(
  c: Pick<CatalogCase, "status" | "is_preview" | "tier">,
  viewer: { signedIn: boolean; entitled: boolean; playable: boolean; session: "active" | "closed" | null },
): AssignmentAction {
  if (c.is_preview || c.status === "in_development") return { kind: "in_preparation" };
  if (c.status === "coming_soon" || (c.status === "available" && !viewer.playable)) return { kind: "coming_soon" };
  if (c.status === "retired") return { kind: "retired" };
  if (!viewer.signedIn) return { kind: "sign_in" };
  if (viewer.session === "active") return { kind: "resume" };
  if (viewer.session === "closed") return { kind: "review_closed" };
  if (viewer.entitled || c.tier.price_cents === 0) return { kind: "accept" };
  return { kind: "purchase" };
}
