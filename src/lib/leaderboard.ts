import "server-only";
import { normalizeState } from "@/game/engine/engine";
import { findInvestigation } from "@/game/persistence";
import type { CaseDefinition, InvestigationState } from "@/game/engine/types";
import { createAdminClient } from "@/lib/supabase/admin";
import { screenName } from "@/lib/moderation";

/*
 * Case leaderboards. Only a player's first solve of a case can go on the
 * board, solo or as a named group. Every run gets an Investigator Score out
 * of 1,000: points come off for time spent, questions asked and reports sent
 * back. Asking fewer, sharper questions is the detective skill being rewarded.
 *
 * Time and questions are measured against the case's own length (its
 * estimated minutes on the `cases` row), so a long case scores on the same
 * scale as a short one. Par for a case is its estimated minutes and half that
 * many questions. Each of time and questions can cost up to 400 points,
 * reached at three times par; each report sent back costs 50, up to 200.
 */

export const SCORE = { start: 1000, timeMax: 400, questionsMax: 400, parQuestionsPerMinute: 0.5, overPar: 3, perReturn: 50, returnsMax: 200 };

export type Mode = "solo" | "group";
export type Board = "score" | "fastest" | "questions" | "firsttry";

export interface Stats {
  seconds: number;
  questions: number;
  returned: number;
  score: number;
}

export interface Run extends Stats {
  /** What each part cost, for the closing screen. */
  cost: { time: number; questions: number; returned: number };
}

export interface Entry extends Stats {
  id: number;
  name: string;
  mode: Mode;
  groupSize: number;
  createdAt: string;
  mine: boolean;
}

function db() {
  const a = createAdminClient();
  if (!a) throw new Error("The server is not configured for the leaderboard.");
  return a;
}

/** Questions put to anyone in an interview or on the phone, by everyone at the table. */
export function questionsAsked(s: InvestigationState) {
  return Object.values(s.conversations).reduce((n, lines) => n + lines.filter((l) => l.speaker === "you" && l.kind === "question").length, 0);
}

/** The case's par: its estimated minutes, and half that many questions. */
export async function parOf(caseId: string) {
  const { data } = await db().from("cases").select("est_minutes").eq("id", caseId).maybeSingle();
  const minutes = Math.max(15, Number((data as { est_minutes: number } | null)?.est_minutes) || 60);
  return { minutes, questions: Math.max(10, Math.round(minutes * SCORE.parQuestionsPerMinute)) };
}

export function scoreOf(seconds: number, questions: number, returned: number, par: { minutes: number; questions: number }) {
  const cost = {
    time: Math.round(SCORE.timeMax * Math.min(1, seconds / 60 / (par.minutes * SCORE.overPar))),
    questions: Math.round(SCORE.questionsMax * Math.min(1, questions / (par.questions * SCORE.overPar))),
    returned: Math.min(SCORE.returnsMax, returned * SCORE.perReturn),
  };
  return { cost, score: Math.max(0, SCORE.start - cost.time - cost.questions - cost.returned) };
}

export function runOf(s: InvestigationState, par: { minutes: number; questions: number }): Run {
  const seconds = Math.max(0, Math.round(s.activeSeconds));
  const questions = questionsAsked(s);
  const returned = s.report.submissions.filter((x) => !x.accepted).length;
  return { seconds, questions, returned, ...scoreOf(seconds, questions, returned, par) };
}


/** Tidies a name for the board, or says why it can't be used. Screening for offensive names is in `moderation.ts`. */
export function cleanName(raw: unknown): { name: string } | { error: string } {
  const name = String(raw ?? "").replace(/\s+/g, " ").trim();
  if (name.length < 2 || name.length > 30) return { error: "Use 2 to 30 characters." };
  if (!/^[\p{L}\p{N} .,'&!?()-]+$/u.test(name)) return { error: "Use letters, numbers and simple punctuation only." };
  return { name };
}


type Row = { id: number; name: string; mode: Mode; group_size: number; active_seconds: number; questions: number; returned: number; score: number; created_at: string; user_id: string };
const toEntry = (r: Row, me: string | null): Entry => ({
  id: r.id,
  name: r.name,
  mode: r.mode,
  groupSize: r.group_size,
  seconds: r.active_seconds,
  questions: r.questions,
  returned: r.returned,
  score: r.score,
  createdAt: r.created_at,
  mine: r.user_id === me,
});

/** The better of two runs on a board (true when `a` places above `b`). */
function better(board: Board, a: Stats, b: Stats) {
  const k = board === "fastest" ? (["seconds", "score"] as const) : board === "questions" ? (["questions", "score"] as const) : (["score", "seconds"] as const);
  for (const key of k) {
    if (a[key] === b[key]) continue;
    return key === "score" ? a[key] > b[key] : a[key] < b[key];
  }
  return false;
}

/** Top ten of every board for a case, both modes, plus the viewer's own entries. */
export async function boards(caseId: string, me: string | null) {
  const { data } = await db()
    .from("leaderboard_entries")
    .select("id, name, mode, group_size, active_seconds, questions, returned, score, created_at, user_id")
    .eq("case_id", caseId)
    .eq("hidden", false)
    .limit(2000);
  const rows = ((data ?? []) as Row[]).map((r) => toEntry(r, me));
  const out = {} as Record<Mode, Record<Board, Entry[]> & { mine: { board: Board; place: number; entry: Entry }[]; total: number }>;
  for (const mode of ["solo", "group"] as const) {
    const all = rows.filter((r) => r.mode === mode);
    const lists = {} as Record<Board, Entry[]>;
    const mine: { board: Board; place: number; entry: Entry }[] = [];
    for (const board of ["score", "fastest", "questions", "firsttry"] as const) {
      const pool = board === "firsttry" ? all.filter((r) => r.returned === 0) : all;
      const sorted = [...pool].sort((a, b) => (better(board, a, b) ? -1 : better(board, b, a) ? 1 : a.createdAt.localeCompare(b.createdAt)));
      lists[board] = sorted.slice(0, 10);
      sorted.forEach((e, i) => e.mine && mine.push({ board, place: i + 1, entry: e }));
    }
    out[mode] = { ...lists, mine, total: all.length };
  }
  return out;
}

/** Where a run would place on each board of its mode, counting only the entries already there. */
async function placesFor(caseId: string, mode: Mode, run: Stats, excludeSession?: string) {
  let q = db().from("leaderboard_entries").select("active_seconds, questions, returned, score, session_id").eq("case_id", caseId).eq("mode", mode).eq("hidden", false).limit(5000);
  if (excludeSession) q = q.neq("session_id", excludeSession);
  const { data } = await q;
  const others = ((data ?? []) as { active_seconds: number; questions: number; returned: number; score: number }[]).map((r) => ({ seconds: r.active_seconds, questions: r.questions, returned: r.returned, score: r.score }));
  const place = (board: Board, pool: Stats[]) => pool.filter((o) => better(board, o, run)).length + 1;
  return {
    score: place("score", others),
    fastest: place("fastest", others),
    questions: place("questions", others),
    firsttry: run.returned === 0 ? place("firsttry", others.filter((o) => o.returned === 0)) : null,
    of: others.length + 1,
  };
}

/** The group a joint investigation was played as: its name and the largest table it had. */
async function groupOf(sessionId: string) {
  const { data } = await db().from("party_lobbies").select("group_name, max_size, started_at, created_at").eq("session_id", sessionId).not("started_at", "is", null).order("created_at", { ascending: false });
  const rows = (data ?? []) as { group_name: string | null; max_size: number }[];
  const size = rows.reduce((m, r) => Math.max(m, r.max_size ?? 1), 1);
  if (size < 2) return null;
  return { size: Math.min(6, size), name: rows.find((r) => r.group_name)?.group_name ?? null };
}

export interface MyResult {
  /** Not a first solve, not closed, or a replay: shown no score and no prompt. */
  eligible: boolean;
  mode: Mode;
  groupSize: number;
  run: Run;
  places: Awaited<ReturnType<typeof placesFor>>;
  /** Already on the board (and whether it was later hidden). */
  entry: { name: string; hidden: boolean } | null;
  suggestedName: string;
}

/** The investigator's first solve of a case, its score and where it would place. */
export async function myResult(def: CaseDefinition, userId: string, displayName: string | null): Promise<MyResult | null> {
  const { data: done } = await db().from("case_completions").select("first_session_id").eq("user_id", userId).eq("case_id", def.id).maybeSingle();
  const sessionId = (done as { first_session_id: string } | null)?.first_session_id;
  if (!sessionId) return null;
  // Only for the investigation the player is looking at: a replay's closing screen shows no score.
  const current = await findInvestigation(userId, def.id).catch(() => null);
  if (current && current.sessionId !== sessionId) return null;
  const { data: save } = await db().from("save_games").select("state").eq("session_id", sessionId).eq("user_id", userId).order("updated_at", { ascending: false }).limit(1).maybeSingle();
  if (!save) return null;
  const s = normalizeState(def, (save as { state: InvestigationState }).state);
  if (s.status !== "closed") return null;
  const run = runOf(s, await parOf(def.id));
  const group = await groupOf(sessionId);
  const mode: Mode = group ? "group" : "solo";
  const { data: existing } = await db().from("leaderboard_entries").select("name, hidden").eq("session_id", sessionId).maybeSingle();
  return {
    eligible: true,
    mode,
    groupSize: group?.size ?? 1,
    run,
    places: await placesFor(def.id, mode, run, sessionId),
    entry: (existing as { name: string; hidden: boolean } | null) ?? null,
    suggestedName: (group ? group.name : displayName)?.trim().slice(0, 30) || "",
  };
}

/** Puts the first solve on the board under a name (or renames and shows it again). */
export async function submit(def: CaseDefinition, userId: string, rawName: string) {
  const clean = cleanName(rawName);
  if ("error" in clean) return clean;
  const screened = await screenName(clean.name);
  if (!screened.ok) return { error: screened.error };
  const { data: done } = await db().from("case_completions").select("first_session_id").eq("user_id", userId).eq("case_id", def.id).maybeSingle();
  const sessionId = (done as { first_session_id: string } | null)?.first_session_id;
  if (!sessionId) return { error: "Only your first solve of a case can go on the board." };
  const { data: save } = await db().from("save_games").select("state").eq("session_id", sessionId).eq("user_id", userId).order("updated_at", { ascending: false }).limit(1).maybeSingle();
  if (!save) return { error: "That investigation could not be found." };
  const s = normalizeState(def, (save as { state: InvestigationState }).state);
  if (s.status !== "closed") return { error: "Close the case first." };
  const run = runOf(s, await parOf(def.id));
  const group = await groupOf(sessionId);
  const row = {
    case_id: def.id,
    session_id: sessionId,
    user_id: userId,
    mode: group ? "group" : "solo",
    name: clean.name,
    group_size: group?.size ?? 1,
    active_seconds: run.seconds,
    questions: run.questions,
    returned: run.returned,
    score: run.score,
    hidden: false,
  };
  const { error } = await db().from("leaderboard_entries").upsert(row, { onConflict: "session_id" });
  if (error) {
    console.error("leaderboard submit", error);
    return { error: "Your entry could not be saved. Try again." };
  }
  return { ok: true as const, name: clean.name };
}

/** Takes the investigator's own entry for a case off the board (it can be put back). */
export async function hideMine(caseId: string, userId: string, hidden: boolean) {
  await db().from("leaderboard_entries").update({ hidden }).eq("case_id", caseId).eq("user_id", userId);
}

/** Admin: every entry, newest first. */
export async function allEntries() {
  const { data } = await db().from("leaderboard_entries").select("id, case_id, name, mode, group_size, score, active_seconds, questions, returned, hidden, created_at").order("created_at", { ascending: false }).limit(200);
  return (data ?? []) as { id: number; case_id: string; name: string; mode: Mode; group_size: number; score: number; active_seconds: number; questions: number; returned: number; hidden: boolean; created_at: string }[];
}

export async function removeEntry(id: number) {
  await db().from("leaderboard_entries").delete().eq("id", id);
}
