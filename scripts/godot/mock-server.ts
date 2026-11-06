/*
 * A local stand-in for the website's desktop-client API, for testing the Godot client offline.
 * Runs the real case engine in memory (no database, no interview AI: questions are matched to
 * authored answers only, as the site does without a key). Voices and art are not served.
 *
 *   npx tsx --conditions=react-server scripts/godot/mock-server.ts [port]
 *   then start the game with:  -- --server=http://127.0.0.1:8787
 *
 * POST /__debug/state with a JSON body merges it into the saved state (for jumping ahead in tests).
 */
import { createServer } from "node:http";
import { acceptedOffer, interviewCandidates, newState, normalizeState, reduce, respond } from "@/game/engine/engine";
import { bestMatch } from "@/game/engine/matcher";
import type { GameAction, InvestigationState } from "@/game/engine/types";
import { loadCase } from "@/game/registry";

const port = Number(process.argv[2] ?? 8787);
const saves = new Map<string, InvestigationState>();

function stateFor(caseId: string) {
  const def = loadCase(caseId)!;
  if (!saves.has(def.id)) saves.set(def.id, newState(def));
  return normalizeState(def, saves.get(def.id)!);
}

function json(res: import("node:http").ServerResponse, code: number, body: unknown) {
  res.writeHead(code, { "content-type": "application/json" });
  res.end(JSON.stringify(body));
}

createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", "http://x");
  let body = "";
  for await (const c of req) body += c;
  const data = body ? JSON.parse(body) : {};
  try {
    if (url.pathname === "/api/client/login" || url.pathname === "/api/client/refresh")
      return json(res, 200, { accessToken: "local", refreshToken: "local", expiresAt: null, email: data.email || "local@test" });
    if (url.pathname === "/api/client/view") {
      const def = loadCase(url.searchParams.get("caseId") ?? "");
      if (!def) return json(res, 404, { error: "This case is not playable." });
      return json(res, 200, { stamp: String(Date.now()), response: respond(def, stateFor(def.id)) });
    }
    if (url.pathname === "/__debug/state") {
      const def = loadCase(url.searchParams.get("caseId") ?? "C001")!;
      saves.set(def.id, { ...stateFor(def.id), ...data });
      return json(res, 200, { ok: true });
    }
    if (url.pathname === "/api/client/play") {
      const def = loadCase(String(data.caseId ?? ""));
      if (!def) return json(res, 200, { error: "This case is not playable.", saved: true });
      const s = stateFor(def.id);
      let act = data.action as GameAction;
      if (act.type === "askFree") {
        const text = String(act.text ?? "");
        const offered = acceptedOffer(def, s, act.characterId, text);
        const all = interviewCandidates(def, s, act.characterId);
        const match = offered ?? (all.length ? bestMatch(text, all) : null);
        act = { type: "askFree", characterId: act.characterId, text, match, composed: null };
      }
      try {
        const { state, outcome } = reduce(def, s, act, Date.now(), { seat: "host" });
        saves.set(def.id, state);
        return json(res, 200, respond(def, state, outcome, { seat: "host" }));
      } catch (e) {
        return json(res, 200, { error: e instanceof Error ? e.message : String(e), saved: true });
      }
    }
    if (url.pathname === "/api/voice") return json(res, 404, { error: "No voices offline." });
    json(res, 404, { error: "Not here." });
  } catch (e) {
    console.error(e);
    json(res, 500, { error: String(e) });
  }
}).listen(port, "127.0.0.1", () => console.log(`mock Blackwood on http://127.0.0.1:${port}`));
