import type { NextRequest } from "next/server";
import { committedArt, liveArtUrl } from "@/art/painted";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * The current picture for an image id: GET /art/live/<image id>.
 *
 * Pages built ahead of time (the catalog, case pages, Agency HQ) point their
 * case covers here instead of at a fixed file, so a version made live on the
 * Admin page shows up within about 20 seconds without a site update. Sends the
 * browser on to the live version, else the committed painting, else a plain
 * stand-in.
 */
export async function GET(_request: NextRequest, ctx: RouteContext<"/art/live/[id]">) {
  const { id } = await ctx.params;
  if (!/^[a-z0-9_]{2,80}$/.test(id)) return new Response("Not found.", { status: 404 });
  const live = await liveVersion(id);
  const target = live ? liveArtUrl(id, live) : committedArt[id]?.url;
  const headers = { "Cache-Control": "public, max-age=20, s-maxage=20" };
  if (target) return new Response(null, { status: 307, headers: { ...headers, Location: target } });
  return new Response(STAND_IN, { headers: { ...headers, "Content-Type": "image/svg+xml" } });
}

const cache = new Map<string, { at: number; v: number | null }>();
async function liveVersion(id: string) {
  const hit = cache.get(id);
  if (hit && Date.now() - hit.at < 20000) return hit.v;
  const db = createAdminClient();
  const { data } = db ? await db.from("art_images").select("live_version").eq("id", id).maybeSingle() : { data: null };
  const v = (data as { live_version: number | null } | null)?.live_version ?? null;
  cache.set(id, { at: Date.now(), v });
  return v;
}

const STAND_IN = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240"><defs><radialGradient id="g" cx="0.68" cy="0.38" r="0.6"><stop offset="0" stop-color="#c6a472" stop-opacity="0.45"/><stop offset="1" stop-color="#0e1318" stop-opacity="0"/></radialGradient></defs><rect width="400" height="240" fill="#0e1318"/><rect width="400" height="240" fill="url(#g)"/></svg>`;
