import "server-only";
import { normalizeState, project } from "@/game/engine/engine";
import type { InvestigationState } from "@/game/engine/types";
import { loadCase } from "@/game/registry";
import { createAdminClient } from "@/lib/supabase/admin";
import { reduceSeries, SeriesRuleError, type SeriesAction, type SeriesProgress } from "./board";
import { canonicalEvidence, canonicalPerson, SERIES_DEFS, type SeriesDef } from "./defs";

/*
 * The rolling board on the server: what the player may pin (everything they
 * have found in any case of the series, in any playthrough), the board itself
 * (series_progress), and the moves. Like a case's save, it is written with a
 * compare-and-swap on updated_at and retried on a conflict.
 */

type Admin = NonNullable<ReturnType<typeof createAdminClient>>;

export class SeriesError extends Error {}

function admin(): Admin {
  const a = createAdminClient();
  if (!a) throw new SeriesError("SUPABASE_SECRET_KEY is not set, so the series board cannot be saved.");
  return a;
}

/** One card the player can pin: evidence, a person, or a series deduction they have made. */
export interface SeriesItem {
  id: string;
  kind: "evidence" | "person" | "deduction";
  /** The case it came from, e.g. "S01 C01", or "Series" for a deduction. */
  from: string;
  /** Shown on the card, e.g. "C01 · E011". */
  tag: string;
  title: string;
  /** One line under the title. */
  description: string;
  /** The full text, for reading the card. */
  text: string;
  image: string;
}

export interface SeriesView {
  seriesId: string;
  title: string;
  /** The board is in the office once the series' first case has been solved. */
  open: boolean;
  board: SeriesProgress["board"];
  items: SeriesItem[];
  deductions: { id: string; title: string; text: string }[];
  /** Series notebook entries, one per case solved, in order. */
  notebook: { caseLabel: string; title: string; text: string }[];
  cases: { id: string; label: string; solved: boolean }[];
}

const label = (caseId: string) => caseId.replace(/^S\d(\d\d)C(\d\d)$/, "S$1 C$2");
const short = (caseId: string) => caseId.replace(/^S\d{3}/, "");

/** Every save the player has for the series' cases, newest first per case. */
async function seriesSaves(db: Admin, userId: string, def: SeriesDef) {
  const ids = def.cases.filter((c) => loadCase(c));
  if (!ids.length) return [] as { caseId: string; state: InvestigationState }[];
  const { data: sessions, error } = await db
    .from("investigation_sessions")
    .select("id, case_id, last_activity_at")
    .eq("host_user_id", userId)
    .in("case_id", ids)
    .order("last_activity_at", { ascending: false });
  if (error) throw new SeriesError(error.message);
  if (!sessions?.length) return [];
  const { data: saves, error: sErr } = await db.from("save_games").select("session_id, state, updated_at").in("session_id", sessions.map((s) => s.id));
  if (sErr) throw new SeriesError(sErr.message);
  const caseOf = new Map(sessions.map((s) => [s.id, s.case_id as string]));
  const order = new Map(sessions.map((s, i) => [s.id, i]));
  return (saves ?? [])
    .sort((a, b) => (order.get(a.session_id) ?? 0) - (order.get(b.session_id) ?? 0))
    .map((s) => ({ caseId: caseOf.get(s.session_id)!, state: s.state as InvestigationState }));
}

/** What the player may pin, built from every playthrough of every case in the series. Newest playthrough wins for a card's wording. */
function pinnable(def: SeriesDef, saves: { caseId: string; state: InvestigationState }[]): Map<string, SeriesItem> {
  const items = new Map<string, SeriesItem>();
  for (const { caseId, state } of saves) {
    const c = loadCase(caseId);
    if (!c) continue;
    const s = normalizeState(c, state);
    const view = project(c, s);
    for (const ev of view.evidence) {
      if (ev.photo) continue;
      const id = canonicalEvidence(caseId, ev.id);
      if (items.has(id)) continue;
      items.set(id, {
        id,
        kind: "evidence",
        from: label(caseId),
        tag: `${short(caseId)} · ${ev.label}`,
        title: ev.title,
        description: ev.description,
        text: ev.inspection,
        image: ev.image,
      });
    }
    for (const ch of view.characters) {
      if (!ch.onBoard) continue;
      const id = canonicalPerson(def.id, ch.id);
      if (items.has(id)) continue;
      items.set(id, { id, kind: "person", from: label(caseId), tag: ch.role, title: ch.name, description: ch.role, text: ch.bio.join("\n\n"), image: ch.portrait });
    }
  }
  return items;
}

/** An index card for a series deduction, drawn as an image so the board shows it like any other card. */
function deductionCard(title: string) {
  const esc = title.replace(/[<>&"']/g, (ch) => `&#${ch.charCodeAt(0)};`);
  const words = esc.split(" ");
  const lines: string[] = [];
  for (const w of words) {
    const last = lines[lines.length - 1];
    if (last && (last + " " + w).length <= 22) lines[lines.length - 1] = `${last} ${w}`;
    else lines.push(w);
  }
  const text = lines.slice(0, 5).map((l, i) => `<text x="20" y="${70 + i * 26}" font-family="Georgia,serif" font-size="21" fill="#2a241c">${l}</text>`).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 225"><rect width="300" height="225" fill="#f6f1e3"/><line x1="0" y1="40" x2="300" y2="40" stroke="#c0392b" stroke-width="2"/>${[66, 92, 118, 144, 170, 196].map((y) => `<line x1="0" y1="${y + 6}" x2="300" y2="${y + 6}" stroke="#9fc3d9" stroke-width="1"/>`).join("")}<text x="20" y="28" font-family="ui-monospace,monospace" font-size="15" letter-spacing="2" fill="#7d3a33">SERIES DEDUCTION</text>${text}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

async function readProgress(db: Admin, userId: string, seriesId: string) {
  const { data, error } = await db.from("series_progress").select("board, deductions, updated_at").eq("user_id", userId).eq("series_id", seriesId).maybeSingle();
  if (error) throw new SeriesError(error.message);
  if (data) return { progress: { board: data.board as SeriesProgress["board"], deductions: (data.deductions as string[]) ?? [] }, updatedAt: data.updated_at as string };
  return { progress: { board: { items: [], connections: [] }, deductions: [] } as SeriesProgress, updatedAt: null };
}

async function solvedCases(db: Admin, userId: string, def: SeriesDef) {
  const { data, error } = await db.from("case_completions").select("case_id").eq("user_id", userId).in("case_id", def.cases);
  if (error) throw new SeriesError(error.message);
  return new Set((data ?? []).map((r) => r.case_id as string));
}

function viewOf(def: SeriesDef, progress: SeriesProgress, items: Map<string, SeriesItem>, solved: Set<string>): SeriesView {
  const made = def.deductions.filter((d) => progress.deductions.includes(d.id));
  const all = [...items.values()];
  for (const d of made) all.push({ id: d.id, kind: "deduction", from: "Series", tag: "Series deduction", title: d.title, description: d.text, text: d.text, image: deductionCard(d.title) });
  const known = new Set(all.map((i) => i.id));
  return {
    seriesId: def.id,
    title: def.title,
    open: solved.has(def.cases[0]),
    // A card whose case has since been replayed from scratch stays on the board: the player found it once.
    board: progress.board,
    items: all.filter((i) => known.has(i.id)),
    deductions: made.map((d) => ({ id: d.id, title: d.title, text: d.text })),
    notebook: def.cases.filter((c) => solved.has(c) && def.notebook[c]).map((c) => ({ caseLabel: label(c), ...def.notebook[c] })),
    cases: def.cases.map((c) => ({ id: c, label: label(c), solved: solved.has(c) })),
  };
}

/** The rolling board as this player sees it. */
export async function loadSeries(userId: string, seriesId: string): Promise<SeriesView | null> {
  const def = SERIES_DEFS[seriesId.toUpperCase()];
  if (!def) return null;
  const db = admin();
  const [saves, { progress }, solved] = await Promise.all([seriesSaves(db, userId, def), readProgress(db, userId, def.id), solvedCases(db, userId, def)]);
  return viewOf(def, progress, pinnable(def, saves), solved);
}

/** Applies one move to the rolling board, retrying if another screen saved first. */
export async function actOnSeries(userId: string, seriesId: string, action: SeriesAction): Promise<{ view: SeriesView; made: { id: string; title: string; text: string } | null }> {
  const def = SERIES_DEFS[seriesId.toUpperCase()];
  if (!def) throw new SeriesError("No such series.");
  const db = admin();
  const solved = await solvedCases(db, userId, def);
  if (!solved.has(def.cases[0])) throw new SeriesError("The rolling board arrives once the first case of the series is solved.");
  const saves = await seriesSaves(db, userId, def);
  const items = pinnable(def, saves);
  const allowed = new Set(items.keys());
  for (let attempt = 0; attempt < 4; attempt++) {
    const { progress, updatedAt } = await readProgress(db, userId, def.id);
    let next;
    try {
      next = reduceSeries(def, progress, allowed, action);
    } catch (e) {
      if (e instanceof SeriesRuleError) throw new SeriesError(e.message);
      throw e;
    }
    const now = new Date().toISOString();
    const row = { board: next.progress.board, deductions: next.progress.deductions, updated_at: now };
    let saved = false;
    if (updatedAt === null) {
      const { error } = await db.from("series_progress").insert({ user_id: userId, series_id: def.id, ...row });
      saved = !error;
    } else {
      const { data, error } = await db.from("series_progress").update(row).eq("user_id", userId).eq("series_id", def.id).eq("updated_at", updatedAt).select("user_id");
      if (error) throw new SeriesError(error.message);
      saved = Boolean(data?.length);
    }
    if (!saved) continue;
    const d = next.made ? def.deductions.find((x) => x.id === next.made) ?? null : null;
    return { view: viewOf(def, next.progress, items, solved), made: d ? { id: d.id, title: d.title, text: d.text } : null };
  }
  throw new SeriesError("The board was changed in another window. Try again.");
}

/**
 * Whether a series case may be started: the case before it in the series must
 * have been solved. Standalone cases always may.
 */
export async function seriesUnlocked(userId: string, caseId: string): Promise<{ ok: true } | { ok: false; previous: string }> {
  const def = Object.values(SERIES_DEFS).find((d) => d.cases.includes(caseId.toUpperCase()));
  if (!def) return { ok: true };
  const i = def.cases.indexOf(caseId.toUpperCase());
  if (i <= 0) return { ok: true };
  const previous = def.cases[i - 1];
  const solved = await solvedCases(admin(), userId, def);
  return solved.has(previous) ? { ok: true } : { ok: false, previous: label(previous) };
}
