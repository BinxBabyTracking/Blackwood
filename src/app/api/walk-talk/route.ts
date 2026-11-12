import type { NextRequest } from "next/server";
import { loadCase } from "@/game/registry";
import { requireInvestigator } from "@/lib/investigator";
import { isOwner } from "@/lib/test-reset";
import { recordUsage } from "@/lib/usage";
import { MINDS, WORLD_TEXT, type Known } from "@/cases/CHR001/talk";

/*
 * Talking to someone in the walkable world: POST /api/walk-talk with who, what you said, the time and how the day
 * has gone this loop, and anything you're showing them. They answer in their own words from what they know by now
 * (and may hand over a statement or a find). Owner only while the case is in testing.
 */

const API_KEY = process.env.ANTHROPIC_API_KEY ?? "";
const MODEL = process.env.INTERVIEW_MODEL ?? "claude-haiku-5-5";
const API_BASE = (process.env.ANTHROPIC_API_BASE ?? "https://api.anthropic.com").replace(/\/$/, "");
const WORKSPACE = (process.env.ANTHROPIC_WORKSPACE_ID ?? "").trim();

const mins = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};
const clock = (t: number) => {
  const m = Math.floor(t) % 1440, h = Math.floor(m / 60);
  return `${((h + 11) % 12) + 1}:${String(m % 60).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};

type Body = {
  caseId: string;
  person: string;
  text: string;
  history?: { you: boolean; text: string }[];
  day: { t: number; loop: number; dead: boolean; stolen: boolean; saved: boolean };
  show?: { title: string; text: string; kept?: number | null }[];
  given?: string[];
};

export async function POST(request: NextRequest) {
  const fail = (error: string, status: number) => Response.json({ error }, { status });
  const me = await requireInvestigator(true).catch(() => null);
  if (!me || !isOwner(me.email)) return fail("Not available.", 403);
  const b = (await request.json().catch(() => null)) as Body | null;
  if (!b || b.caseId !== "CHR001") return fail("Unknown case.", 400);
  const def = loadCase(b.caseId);
  const who = def?.characters.find((c) => c.id === b.person);
  const mind = MINDS.find((m) => m.id === b.person);
  if (!def || !who || !mind) return fail("Nobody to talk to.", 400);
  if (!API_KEY) return fail("Talking needs the interview AI key on the server.", 503);
  const text = String(b.text ?? "").slice(0, 400).trim();
  if (!text && !b.show?.length) return fail("Say something.", 400);

  const d = b.day;
  const holds = (k: { from?: string; dead?: boolean; stolen?: boolean; saved?: boolean; first?: boolean }) =>
    (!k.from || d.t >= mins(k.from)) && (k.dead == null || d.dead === k.dead) && (k.stolen == null || d.stolen === k.stolen) && (k.saved == null || d.saved === k.saved) && (k.first == null || (d.loop === 1) === k.first);
  const known = mind.knows.filter((k: Known) => holds(k)).map((k) => `- ${k.text}`);
  const gives = (mind.gives ?? []).filter((g) => holds(g) && !(b.given ?? []).includes(g.evidence));
  const day = [
    `It is ${clock(d.t)} on Christmas Eve.`,
    d.dead ? "Aldric, the Keeper of Time, has been found dead in his workshop at the foot of the clock tower (news spreads fast; react as someone who has heard, unless your knowledge says more). The Chronometer is missing." : "Nothing terrible has happened today, as far as you know. Aldric is alive and at work.",
  ].join(" ");

  const system = [
    WORLD_TEXT,
    `You are ${who.name}, ${who.role}. ${who.persona ?? ""} How you speak: ${mind.voice}`,
    day,
    `WHAT YOU KNOW (nothing else; never invent facts, places, times or people beyond these):\n${known.join("\n")}`,
    gives.length
      ? `THINGS YOU CAN HAND OVER, each only when its condition is met in this conversation:\n${gives.map((g) => `- ${g.evidence}: when ${g.when}`).join("\n")}`
      : "",
    [
      "RULES:",
      "- Answer as yourself, aloud, in 1 to 4 short spoken sentences. Plain warm storybook tone. American spelling. Never use em dashes.",
      "- If you don't know, say so naturally, or name who might know. Never name anyone as a killer. Never guess at what you weren't there for.",
      "- You remember only today, this once. If the investigator talks about an earlier version of today, other loops, or things that haven't happened yet, you are puzzled, curious or alarmed, as a real person would be.",
      "- When shown something, react to what it is. If it is marked as from another loop, you don't recognize it as such; it's simply puzzling if it shouldn't exist yet.",
      "- Keep secrets marked SECRET or PRIVATE unless the condition written with them is met.",
      '- Reply with JSON only: {"reply": "what you say", "gives": ["CE0xx", ...]} where gives lists only items from THINGS YOU CAN HAND OVER whose condition is met now (usually none).',
    ].join("\n"),
  ]
    .filter(Boolean)
    .join("\n\n");

  const recent = (b.history ?? []).slice(-12).map((l) => `${l.you ? "INVESTIGATOR" : who.name.toUpperCase()}: ${l.text.slice(0, 400)}`).join("\n");
  const shown = (b.show ?? []).map((s) => `The investigator shows you: ${s.title}. ${s.text}${s.kept ? ` (Kept by Santa's Time Bag from loop ${s.kept}.)` : ""}`).join("\n");
  const user = [recent ? `CONVERSATION SO FAR:\n${recent}` : "", shown, text ? `INVESTIGATOR SAYS: ${text}` : ""].filter(Boolean).join("\n\n");

  try {
    const res = await fetch(`${API_BASE}/v1/messages`, {
      method: "POST",
      headers: { "x-api-key": API_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json", ...(WORKSPACE ? { "anthropic-workspace-id": WORKSPACE } : {}) },
      body: JSON.stringify({ model: MODEL, max_tokens: 400, system, messages: [{ role: "user", content: user }] }),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      const detail = (await res.text().catch(() => "")).replace(/sk-ant-[A-Za-z0-9_-]+/g, "[key]").slice(0, 200);
      console.error("walk-talk", res.status, detail);
      return fail("They don't seem to hear you. Try again in a moment.", 502);
    }
    const out = (await res.json()) as { content?: { type: string; text?: string }[]; usage?: { input_tokens?: number; output_tokens?: number }; model?: string };
    recordUsage({ userId: me.id, sessionId: `walk-test-${me.id}`, caseId: def.id, characterId: who.id, service: "claude", purpose: "interview", model: out.model ?? MODEL, inputTokens: out.usage?.input_tokens, outputTokens: out.usage?.output_tokens });
    const raw = (out.content?.find((c) => c.type === "text")?.text ?? "").trim();
    let reply = raw, give: string[] = [];
    const json = /\{[\s\S]*\}/.exec(raw);
    if (json) {
      try {
        const p = JSON.parse(json[0]) as { reply?: string; gives?: string[] };
        reply = String(p.reply ?? "").trim();
        give = (p.gives ?? []).filter((g) => gives.some((x) => x.evidence === g));
      } catch {
        reply = raw.replace(/^[^"]*"reply"\s*:\s*"/, "").replace(/"[\s\S]*$/, "");
      }
    }
    reply = reply.replace(/—/g, ", ").trim();
    if (!reply) return fail("They don't seem to hear you. Try again in a moment.", 502);
    return Response.json({ reply, gives: give });
  } catch (e) {
    console.error("walk-talk", e);
    return fail("They don't seem to hear you. Try again in a moment.", 503);
  }
}
