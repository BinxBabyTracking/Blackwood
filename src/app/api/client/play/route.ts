import { playAction } from "@/app/actions/game";
import type { GameAction } from "@/game/engine/types";
import { bearerUserId } from "@/lib/party";

/**
 * Desktop game client: POST /api/client/play { caseId, action } runs one game action through the
 * same engine, rules and interview model as the website, and returns the same result.
 */
export async function POST(request: Request) {
  if (!(await bearerUserId())) return Response.json({ error: "Sign in again.", saved: true }, { status: 401 });
  const body = await request.json().catch(() => null);
  const caseId = String(body?.caseId ?? "");
  const action = body?.action as GameAction | undefined;
  if (!action || typeof action !== "object") return Response.json({ error: "Unknown action.", saved: true }, { status: 400 });
  const r = await playAction(caseId, action);
  return Response.json(r);
}
