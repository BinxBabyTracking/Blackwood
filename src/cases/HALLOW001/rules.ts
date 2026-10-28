import type { Condition } from "@/game/engine/types";

/*
 * Conditions shared across HALLOW001's files, so every file asks the same
 * question the same way.
 */

export const craneFree: Condition = { not: { any: [{ flag: "crane_arrested" }, { flag: "crane_escaped" }] } };
export const craneAt = (loc: string): Condition => ({ env: "crane", is: loc });
/** Crane is among the guests on the main floor, where he can see and hear what goes on. */
export const craneDownstairs: Condition = { any: [craneAt("dining_room"), craneAt("library"), craneAt("conservatory"), craneAt("entrance_hall")] };

export const dead = (who: string): Condition => ({ flag: `dead_${who}` });
export const alive = (who: string): Condition => ({ not: dead(who) });
export const guarded = (who: string): Condition => ({ flag: `guard_${who}` });

/** The witnesses Crane may come to see as a threat, and where each of them spends the night. */
export const WITNESSES: { id: string; name: string; at: string }[] = [
  { id: "josie", name: "Josie Lisle", at: "morning_room" },
  { id: "harriet", name: "Harriet Lowell", at: "library" },
  { id: "amos", name: "Amos Duffy", at: "entrance_hall" },
  { id: "bridget", name: "Bridget Duffy", at: "dining_room" },
];

/** Crane believes he is close to being found out. */
export const craneInDanger: Condition = {
  any: [
    { flag: "crane_knows_chamber" },
    { all: [{ flag: "crane_knows_passage" }, { any: [{ flag: "crane_fears_harriet" }, { flag: "crane_fears_amos" }, { flag: "crane_fears_josie" }, { flag: "crane_fears_bridget" }] }] },
  ],
};

export const josieFound: Condition = { flag: "josie_found" };
