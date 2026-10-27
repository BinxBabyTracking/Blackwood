import generated from "@/art/generated.json";

/**
 * Every painting the game can show, by image id: the ones committed in
 * public/art (src/art/generated.json), with any version made live on the Admin
 * page laid over them at run time (see refreshArt in the registry). Shared by
 * every case's asset manifest, so a case rebuilt after a refresh picks up the change.
 */
export const committedArt: Record<string, { url: string }> = (generated as { images: Record<string, { url: string }> }).images;
export const painted: Record<string, { url: string }> = { ...committedArt };

/** Where a live Admin-made version is served from. */
export const liveArtUrl = (id: string, version: number) => `/art/gen/${id}-${version}.webp`;
