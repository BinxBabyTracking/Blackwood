import "server-only";
import { C001 } from "@/cases/C001";
import { C002 } from "@/cases/C002";
import { C003 } from "@/cases/C003";
import { C004 } from "@/cases/C004";
import type { CaseDefinition } from "./engine/types";

/** Every playable case, keyed by stable case id. Add new cases here. */
const CASES: Record<string, CaseDefinition> = { C001, C002, C003, C004 };

/** Every registered case id, in order. */
export function caseIds() {
  return Object.keys(CASES);
}

export function loadCase(caseId: string): CaseDefinition | null {
  return CASES[caseId.toUpperCase()] ?? null;
}

export function isPlayable(caseId: string) {
  return Boolean(loadCase(caseId));
}
