/**
 * Chapters: a long case told in stages (added for C006). Optional; a case
 * without `chapters` behaves exactly as before.
 *
 * Chapters are milestones in one continuous investigation, not separate maps:
 * nothing is reset when a chapter ends. The engine opens chapter 1 with the
 * case, and after every action checks whether the open chapter is complete.
 * Completing one is part of the same save as the action that completed it, so
 * a checkpoint can never be shown without having been written, and two people
 * finishing it at once still complete it once (the second save is retried
 * against the first and finds it already done).
 *
 * Each screen at the table acknowledges the checkpoint screen on its own, so
 * one investigator pressing Continue never pulls the screen away from another.
 */
import { apply, check } from "./rules";
import type { CaseDefinition, ChapterDef, ChapterRecord, ClientChapter, InvestigationState } from "./types";

/** The chapter bookkeeping a fresh investigation starts with, or null for a case without chapters. */
export function newChapters(def: CaseDefinition, s: Pick<InvestigationState, "evidence" | "deductions" | "unlocked">): InvestigationState["chapters"] {
  if (!def.chapters?.length) return undefined;
  return { current: def.chapters[0].number, completed: [], seen: {}, start: snapshot(s) };
}

function snapshot(s: Pick<InvestigationState, "evidence" | "deductions" | "unlocked">) {
  return { evidence: [...s.evidence], deductions: [...s.deductions], unlocked: [...s.unlocked] };
}

export function chapterDef(def: CaseDefinition, n: number): ChapterDef | undefined {
  return def.chapters?.find((c) => c.number === n);
}

/** Whether a chapter's work is done: its own condition, or every primary objective. */
export function chapterComplete(def: CaseDefinition, s: InvestigationState, ch: ChapterDef) {
  if (ch.complete) return check(ch.complete, s);
  if (!ch.objectives.length) return false;
  return ch.objectives.every((id) => {
    const o = def.objectives.find((x) => x.id === id);
    return Boolean(o && check(o.done, s));
  });
}

/**
 * Closes the open chapter when its work is done, at most one per action so
 * every checkpoint screen is seen in turn. The last chapter is closed by the
 * accepted report, never here; when the case closes it is recorded quietly.
 */
export function runChapters(s: InvestigationState, def: CaseDefinition): boolean {
  if (!def.chapters?.length) return false;
  s.chapters ??= newChapters(def, s)!;
  const c = s.chapters;
  const ch = chapterDef(def, c.current);
  if (!ch || c.completed.some((r) => r.number === ch.number)) return false;
  const last = ch.number === def.chapters[def.chapters.length - 1].number;
  if (last) {
    if (s.status !== "closed") return false;
    c.completed.push(record(s, ch));
    return true;
  }
  if (s.status === "closed" || !chapterComplete(def, s, ch)) return false;
  c.completed.push(record(s, ch));
  const next = def.chapters.find((x) => x.number > ch.number);
  if (next) {
    c.current = next.number;
    c.start = snapshot(s);
  }
  if (!s.notebook.some((n) => n.id === `chapter:${ch.number}`)) {
    s.notebook.push({ id: `chapter:${ch.number}`, kind: "event", title: `Chapter ${ch.number} complete: ${ch.title}`, text: ch.summary, at: s.lastActionAt });
  }
  apply(ch.onComplete, s, def);
  return true;
}

function record(s: InvestigationState, ch: ChapterDef): ChapterRecord {
  const start = s.chapters!.start;
  return {
    number: ch.number,
    at: s.lastActionAt,
    activeSeconds: s.activeSeconds,
    evidence: s.evidence.filter((e) => !start.evidence.includes(e)),
    deductions: s.deductions.filter((d) => !start.deductions.includes(d)),
    unlocked: s.unlocked.filter((u) => !start.unlocked.includes(u)),
  };
}

/** A guest who joins a later sitting is not shown checkpoints that passed before they sat down. */
const GUEST_WINDOW_MS = 15 * 60 * 1000;

/**
 * The checkpoint screen this seat still has to see: the latest completed
 * chapter, unless this seat has acknowledged it. The host's screen keeps it
 * until acknowledged; a guest sees it only while it is recent.
 */
function unseen(s: InvestigationState, seat: string, now: number): ChapterRecord | null {
  const c = s.chapters;
  if (!c?.completed.length) return null;
  const r = [...c.completed].sort((a, b) => b.number - a.number)[0];
  if ((c.seen[seat] ?? 0) >= r.number) return null;
  if (seat !== "host" && now - r.at > GUEST_WINDOW_MS) return null;
  return r;
}

/** One screen moves on from the checkpoint screen it is showing. */
export function acknowledgeChapter(s: InvestigationState, seat: string, now: number): boolean {
  const r = unseen(s, seat, now);
  if (!r) return false;
  s.chapters!.seen[seat] = r.number;
  return true;
}

/**
 * What the browser may know about chapters: the open chapter, the ones behind
 * it, and the checkpoint screen this seat still has to see. Later chapters'
 * titles are never sent, except the next title on a checkpoint screen.
 */
export function chapterView(def: CaseDefinition, s: InvestigationState, seat: string, now: number): ClientChapter | null {
  if (!def.chapters?.length || !s.chapters) return null;
  const c = s.chapters;
  const ch = chapterDef(def, c.current) ?? def.chapters[0];
  const done = new Set(c.completed.map((r) => r.number));
  const r = s.status === "closed" ? null : unseen(s, seat, now);
  const finished = r ? chapterDef(def, r.number) : undefined;
  const next = r ? def.chapters.find((x) => x.number > r.number) : undefined;
  const locName = (id: string) => def.locations.find((l) => l.id === id)?.name ?? id;
  return {
    number: ch.number,
    title: ch.title,
    intro: ch.intro,
    total: def.chapters.length,
    done: done.has(ch.number),
    activeSeconds: s.activeSeconds,
    past: def.chapters.filter((x) => done.has(x.number)).map((x) => ({ number: x.number, title: x.title, summary: x.summary })),
    checkpoint:
      r && finished
        ? {
            number: r.number,
            title: finished.title,
            conclusion: finished.conclusion,
            summary: finished.summary,
            activeSeconds: r.activeSeconds,
            evidence: r.evidence.length,
            deductions: r.deductions.length,
            locations: r.unlocked.map(locName),
            next: next ? { number: next.number, title: next.title, intro: next.intro } : null,
          }
        : null,
  };
}

/** Which chapter an objective belongs to, if any. */
export function objectiveChapter(def: CaseDefinition, id: string): { chapter: number; optional: boolean } | null {
  for (const ch of def.chapters ?? []) {
    if (ch.objectives.includes(id)) return { chapter: ch.number, optional: false };
    if (ch.optional?.includes(id)) return { chapter: ch.number, optional: true };
  }
  return null;
}
