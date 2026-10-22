import generated from "@/art/generated.json";

/** The URL of a generated painting (see scripts/generate-art.mjs), or null until it has been generated. */
export function paintedArt(id: string): string | null {
  return (generated as { images: Record<string, { url: string }> }).images[id]?.url ?? null;
}
