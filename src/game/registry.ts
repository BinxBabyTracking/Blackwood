import "server-only";
import { C001 } from "@/cases/C001";
import type { CaseDefinition } from "./engine/types";

/** Every playable case, keyed by stable case id. Add new cases here. */
const CASES: Record<string, CaseDefinition> = { C001 };

export function loadCase(caseId: string): CaseDefinition | null {
  return CASES[caseId.toUpperCase()] ?? null;
}

export function isPlayable(caseId: string) {
  return Boolean(loadCase(caseId));
}
