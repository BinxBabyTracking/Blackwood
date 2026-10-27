import type { NextRequest } from "next/server";
import { readArtFile } from "@/lib/art-studio";

/**
 * A painting made on the Admin page: GET /art/gen/<image id>-<version>.webp.
 * Every version has its own name, so it can be cached for good.
 */
export async function GET(_request: NextRequest, ctx: RouteContext<"/art/gen/[file]">) {
  const { file } = await ctx.params;
  if (!/^[a-z0-9_]{2,80}-\d{1,5}\.webp$/.test(file)) return new Response("Not found.", { status: 404 });
  const data = await readArtFile(file).catch(() => null);
  if (!data) return new Response("Not found.", { status: 404 });
  return new Response(data, { headers: { "Content-Type": "image/webp", "Cache-Control": "public, max-age=31536000, immutable" } });
}
