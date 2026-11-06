import type { NextRequest } from "next/server";
import { syncView } from "@/app/actions/game";
import { PersistenceError, startInvestigation } from "@/game/persistence";
import { loadCase } from "@/game/registry";
import { bearerUserId } from "@/lib/party";

/**
 * Desktop game client: GET /api/client/view?caseId=C001 → { response: ActionResponse } for the signed-in investigator.
 * With &start=1, accepts the assignment first when there is no open investigation (same rules as the website).
 */
export async function GET(request: NextRequest) {
  const p = request.nextUrl.searchParams;
  const caseId = p.get("caseId") ?? "";
  const userId = await bearerUserId();
  if (!userId) return Response.json({ error: "Sign in again." }, { status: 401 });
  const def = loadCase(caseId);
  if (!def) return Response.json({ error: "This case is not playable." }, { status: 404 });
  if (p.get("start") === "1") {
    try {
      await startInvestigation(userId, def);
    } catch (e) {
      return Response.json({ error: e instanceof PersistenceError ? e.message : "The assignment could not be accepted." }, { status: 403 });
    }
  }
  const r = await syncView(caseId, "");
  if ("error" in r) return Response.json({ error: r.error }, { status: 404 });
  if (!r.changed) return Response.json({ error: "Nothing to show." }, { status: 500 });
  return Response.json({ stamp: r.stamp, response: r.response });
}
