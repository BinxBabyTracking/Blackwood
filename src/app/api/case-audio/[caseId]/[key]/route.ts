import type { NextRequest } from "next/server";
import { loadCase } from "@/game/registry";
import { readTrack } from "@/lib/soundtrack";

/**
 * Case music and room sound: GET /api/case-audio/C001/amb.diner
 * Serves a track made on the Admin page, with byte ranges so every browser
 * (Safari in particular) can play and loop it. 404 until the track exists.
 */
export async function GET(request: NextRequest, ctx: RouteContext<"/api/case-audio/[caseId]/[key]">) {
  const { caseId, key } = await ctx.params;
  const def = loadCase(caseId);
  if (!def?.soundtrack?.some((t) => t.key === key)) return new Response("Unknown track.", { status: 404 });
  const audio = await readTrack(def.id, key).catch(() => null);
  if (!audio) return new Response("Not made yet.", { status: 404, headers: { "Cache-Control": "no-store" } });

  const total = audio.byteLength;
  const headers: Record<string, string> = {
    "Content-Type": "audio/mpeg",
    "Accept-Ranges": "bytes",
    // Short browser cache, longer at the edge; regenerating a track shows up within the hour.
    "Cache-Control": "public, max-age=3600, s-maxage=3600",
  };
  const range = /^bytes=(\d*)-(\d*)$/.exec(request.headers.get("range") ?? "");
  if (range && (range[1] || range[2])) {
    let start = range[1] ? Number(range[1]) : total - Number(range[2]);
    let end = range[1] && range[2] ? Number(range[2]) : total - 1;
    start = Math.max(0, start);
    end = Math.min(total - 1, end);
    if (start > end) return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${total}` } });
    return new Response(audio.slice(start, end + 1), {
      status: 206,
      headers: { ...headers, "Content-Range": `bytes ${start}-${end}/${total}`, "Content-Length": String(end - start + 1) },
    });
  }
  return new Response(audio, { headers: { ...headers, "Content-Length": String(total) } });
}
