import type { EvidenceDef } from "@/game/engine/types";
import { groupA } from "./a-emily";
import { groupB } from "./b-gallery";
import { groupC } from "./c-glenn";
import { groupD } from "./d-len";
import { groupE } from "./e-final";

/**
 * All 100 evidence items for C006, E001 to E100. The design facts for each
 * (chapter, how it is reached, what it proves, its limits, its picture) are in
 * ../manifest.ts; scripts/check-case-C006.ts checks the two agree.
 */
export const evidence: EvidenceDef[] = [...groupA, ...groupB, ...groupC, ...groupD, ...groupE];
