import type { EvidenceDef } from "@/game/engine/types";

export const ev = (e: EvidenceDef) => e;
/** Paragraphs of a document, in order. */
export const P = (...paras: string[]) => paras.join("\n\n");
