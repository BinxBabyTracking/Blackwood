import { clockLabel } from "./clock";
import { apply, check } from "./rules";
import type { AdversaryState, CaseDefinition, EndingDef, InvestigationState, SolutionDef } from "./types";

/*
 * The case clock and the adversary (added for HALLOW001). Both are opt-in:
 * a case without `clock` or `adversary` never touches any of this, so older
 * cases and saves behave exactly as before.
 */

// ---------------------------------------------------------------------------
// The adversary
// ---------------------------------------------------------------------------

/** A short random seed for a new playthrough. */
export function newSeed() {
  return Math.random().toString(36).slice(2, 10);
}

export function newAdversary(s: Pick<InvestigationState, "clock">): AdversaryState {
  return { tick: 0, lastClock: s.clock ?? 0, learned: [], done: [], rest: 0, log: [] };
}

/** 0 to 99, the same for the same seed, tick and id. */
function roll(s: InvestigationState, id: string) {
  const text = `${s.seed ?? ""}:${s.adversary?.tick ?? 0}:${id}`;
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619) >>> 0;
  return h % 100;
}

/**
 * One tick, after an action that moved the clock on: notice what can be
 * noticed, then make at most one move. Returns whether anything changed.
 */
export function runAdversary(s: InvestigationState, def: CaseDefinition): boolean {
  const a = def.adversary;
  if (!a || s.status === "closed") return false;
  const st = (s.adversary ??= newAdversary(s));
  const now = s.clock ?? 0;
  if (now <= st.lastClock) return false;
  st.lastClock = now;
  st.tick += 1;
  if (check(a.stopped, s)) return false;
  const log = (kind: "learned" | "move", id: string, note: string) => st.log.push({ tick: st.tick, clock: clockLabel(now), kind, id, note });
  let changed = false;

  for (const l of a.learns) {
    if (st.learned.includes(l.id) || !check(l.when, s) || roll(s, l.id) >= (l.chance ?? 100)) continue;
    st.learned.push(l.id);
    apply(l.effects, s, def);
    log("learned", l.id, l.note);
    changed = true;
  }
  if (check(a.stopped, s)) return changed;

  if (st.rest > 0) {
    st.rest -= 1;
    return changed;
  }
  const open = a.moves
    .filter((m) => (m.repeatable || !st.done.includes(m.id)) && check(m.when, s))
    .sort((x, y) => (y.priority ?? 0) - (x.priority ?? 0));
  for (const m of open) {
    if (roll(s, m.id) >= (m.chance ?? 100)) continue;
    if (!st.done.includes(m.id)) st.done.push(m.id);
    if (m.goTo) s.env[a.env] = m.goTo;
    apply(m.effects, s, def);
    st.rest = m.rest ?? 0;
    log("move", m.id, m.note);
    return true;
  }
  return changed;
}

/** Where the adversary is now. */
export function adversaryAt(def: CaseDefinition, s: InvestigationState) {
  return def.adversary ? s.env[def.adversary.env] ?? def.adversary.start : null;
}

// ---------------------------------------------------------------------------
// Endings
// ---------------------------------------------------------------------------

/** The first ending whose condition holds now. */
export function pickEnding(def: CaseDefinition, s: InvestigationState): EndingDef | null {
  return def.solution.endings?.find((e) => check(e.when, s)) ?? null;
}

/** The closing as this investigation ended: the resolution, with its ending's own lines. */
export function resolutionFor(def: CaseDefinition, s: InvestigationState): SolutionDef["resolution"] & { ending?: string } {
  const r = def.solution.resolution;
  const e = s.ending ? def.solution.endings?.find((x) => x.id === s.ending) : undefined;
  if (!e) return r;
  return {
    ...r,
    accepted: e.accepted ?? r.accepted,
    reconstruction: [...r.reconstruction, ...(e.reconstruction ?? [])],
    bennett: e.bennett ?? r.bennett,
    ending: e.title,
  };
}
