import { painted } from "@/art/painted";

/** The URL of a painting (see scripts/generate-art.mjs and the Admin artwork section), or null until one exists. */
export function paintedArt(id: string): string | null {
  return painted[id]?.url ?? null;
}
