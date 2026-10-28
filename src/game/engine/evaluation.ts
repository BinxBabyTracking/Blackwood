import { claimKey, type CaseDefinition, type ChoiceSet, type InvestigationState, type SolutionDef, type Theory } from "./types";

/*
 * Case evaluation. Deterministic and server-only in practice: it reads the
 * solution, which is never sent to the browser. Kept apart from the reducer
 * and from any presentation so the rules can be tested and tuned on their own.
 */

export interface Review {
  accepted: boolean;
  /** The agency reviewer's note. Never names which answer is wrong. */
  note: string;
  /** Lines of inquiry the attached evidence covers (for commendations). */
  linesCovered: string[];
}

export const REVIEW_FEEDBACK =
  "Your findings have been reviewed. The available evidence does not sufficiently support the conclusions presented. Further investigation is recommended.";

/** The right answer to every report question, by choice id. Older cases keep the classic four fields. */
export function solutionAnswers(sol: SolutionDef): Record<string, string | string[]> {
  if (sol.answers) return sol.answers;
  const out: Record<string, string> = {};
  for (const k of ["culprit", "motive", "weapon", "location"] as const) if (sol[k] !== undefined) out[k] = sol[k]!;
  return out;
}

/** An answer as a list of option ids: one for a single choice, any number for a multi-select question. */
export function answerList(v: unknown): string[] {
  if (typeof v === "string") return [v];
  if (Array.isArray(v)) return v.filter((x): x is string => typeof x === "string");
  return [];
}

/** A cleaned answer to one report question, or undefined when it is not a valid answer. */
export function cleanAnswer(c: ChoiceSet, v: unknown): string | string[] | undefined {
  const valid = new Set(c.options.map((o) => o.id));
  if (c.multi) {
    const picked = [...new Set(answerList(v))].filter((id) => valid.has(id));
    return picked.length ? picked : undefined;
  }
  return typeof v === "string" && valid.has(v) ? v : undefined;
}

/**
 * Checks a report is complete: every question answered. The player no longer
 * picks evidence; everything collected goes with the report (see
 * `reportEvidence`). Returns a problem, or null.
 */
export function reportProblem(def: CaseDefinition, _s: InvestigationState, t: Theory): string | null {
  for (const c of def.conclusionChoices) {
    const v = t?.[c.id];
    const clean = cleanAnswer(c, v);
    if (clean === undefined || (c.multi && answerList(v).length !== answerList(clean).length)) return `Complete section ${c.section} before submitting.`;
  }
  return null;
}

/** Everything the investigation has collected, in the case's own order: the evidence a report carries. */
export function reportEvidence(def: CaseDefinition, s: InvestigationState) {
  return def.evidence.map((e) => e.id).filter((id) => s.evidence.includes(id));
}

/** The collected evidence sorted under the points it proves, for the filed report. Each item appears under one point at most. */
export function autoClaims(def: CaseDefinition, evidence: string[]) {
  const out: Record<string, string[]> = {};
  const seen = new Set<string>();
  for (const c of def.solution.standard.claims ?? []) {
    const ids = c.anyOf.filter((id) => evidence.includes(id) && !seen.has(id));
    ids.forEach((id) => seen.add(id));
    out[claimKey(c.id)] = ids;
  }
  return out;
}

/** The items a report filed under each point, cleaned: attached, collected, each under one point only. */
export function cleanClaims(def: CaseDefinition, evidence: string[], t: Record<string, unknown>) {
  const out: Record<string, string[]> = {};
  const seen = new Set<string>();
  for (const c of def.solution.standard.claims ?? []) {
    const ids = answerList(t[claimKey(c.id)]).filter((id) => evidence.includes(id) && !seen.has(id));
    ids.forEach((id) => seen.add(id));
    out[claimKey(c.id)] = ids;
  }
  return out;
}

/** Whether a given answer matches the solution's: the same option, or for a multi-select the same set of options. */
function sameAnswer(given: unknown, right: string | string[]) {
  const a = [...new Set(answerList(given))].sort();
  const b = [...new Set(answerList(right))].sort();
  return a.length === b.length && a.every((x, i) => x === b[i]);
}

/**
 * Reviews a filed report. The report carries every piece of evidence the
 * player has collected, so the review asks two things: is there at least one
 * piece of proof for every point the agency needs (else: find more evidence,
 * naming the points still unproven, never an item), and are the answers right.
 */
export function evaluateReport(def: CaseDefinition, t: Theory, _s?: InvestigationState, returned = 0): Review {
  const sol = def.solution;
  const std = sol.standard;
  const answers = solutionAnswers(sol);
  const covered = std.lines.filter((l) => l.anyOf.some((id) => t.evidence.includes(id))).map((l) => l.id);
  const decided = !def.conclusionChoices.some((c) => answerList(t[c.id]).some((v) => std.undecided.includes(v)));
  const core = Object.entries(answers).every(([k, right]) => sameAnswer(t[k], right));

  // The points the agency needs. A case without points falls back to its lines of inquiry.
  const points = std.claims?.length ? std.claims : std.lines.map((l) => ({ id: l.id, label: l.label, anyOf: l.anyOf, hint: undefined as string | undefined }));
  const missing = points.filter((c) => !c.anyOf.some((id) => t.evidence.includes(id)));

  // The first reason that applies is the one the reviewer writes down. None names an answer or an item.
  let note = "";
  if (!decided) note = "The report leaves at least one question open. The agency cannot act on findings that do not commit to a conclusion.";
  else if (missing.length) {
    const list = missing.map((c) => `"${c.label}"`).join("; ");
    const hint = returned >= 1 ? missing.map((c) => c.hint).find(Boolean) : undefined;
    note = `You need to find more evidence. Nothing you've collected yet proves ${missing.length === 1 ? "this point" : "these points"}: ${list}. Keep investigating, then file again.${hint ? ` ${hint}` : ""}`;
  } else if (!core) note = "You have the evidence the agency needs, but the conclusions drawn from it do not hold together. Look again at your answers.";

  return { accepted: !note, note, linesCovered: covered };
}
