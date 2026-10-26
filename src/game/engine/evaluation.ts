import type { CaseDefinition, ChoiceSet, InvestigationState, SolutionDef, Theory } from "./types";

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

/** Checks a report is complete and cites only evidence collected in this investigation. Returns a problem, or null. */
export function reportProblem(def: CaseDefinition, s: InvestigationState, t: Theory): string | null {
  const std = def.solution.standard;
  for (const c of def.conclusionChoices) {
    const v = t?.[c.id];
    const clean = cleanAnswer(c, v);
    if (clean === undefined || (c.multi && answerList(v).length !== answerList(clean).length)) return `Complete section ${c.section} before submitting.`;
  }
  if (!Array.isArray(t.evidence)) return "Attach the evidence that supports your conclusions.";
  const ev = [...new Set(t.evidence)];
  if (ev.length !== t.evidence.length) return "Each piece of evidence can be attached once.";
  if (ev.some((id) => typeof id !== "string" || !(s.evidence.includes(id) || (s.photos ?? []).some((p) => p.id === id)))) return "You can only attach evidence collected in this investigation.";
  if (ev.length < std.minItems || ev.length > std.maxItems) return `Attach between ${std.minItems} and ${std.maxItems} pieces of evidence.`;
  return null;
}

/** Whether a given answer matches the solution's: the same option, or for a multi-select the same set of options. */
function sameAnswer(given: unknown, right: string | string[]) {
  const a = [...new Set(answerList(given))].sort();
  const b = [...new Set(answerList(right))].sort();
  return a.length === b.length && a.every((x, i) => x === b[i]);
}

export function evaluateReport(def: CaseDefinition, t: Theory): Review {
  const sol = def.solution;
  const std = sol.standard;
  const answers = solutionAnswers(sol);
  const covered = std.lines.filter((l) => l.anyOf.some((id) => t.evidence.includes(id))).map((l) => l.id);
  const keyIds = new Set(std.lines.flatMap((l) => l.anyOf));
  const key = t.evidence.filter((id) => keyIds.has(id)).length;
  const related = new Set([...keyIds, ...std.supporting]);
  const unrelated = t.evidence.filter((id) => !related.has(id)).length;
  const linked = std.linkToSuspect.some((id) => t.evidence.includes(id));
  const decided = !def.conclusionChoices.some((c) => answerList(t[c.id]).some((v) => std.undecided.includes(v)));
  const core = Object.entries(answers).every(([k, right]) => sameAnswer(t[k], right));

  // The first reason that applies is the one the reviewer writes down. None depends on the correct answers.
  let note = "";
  if (!decided) note = "The report leaves at least one question open. The agency cannot act on findings that do not commit to a conclusion.";
  else if (std.minKey && key < std.minKey)
    note = `Too few of the attached items bear directly on the conclusions. The agency looks for at least ${std.minKey} pieces of key evidence; the rest of a report may be supporting material.`;
  else if (covered.length < std.minLines) note = "The attached evidence rests on too few independent lines of inquiry. The agency looks for corroboration from more than one direction.";
  else if (unrelated > std.maxUnrelated) note = "Some of the attached evidence has no clear bearing on the conclusions presented.";
  else if (!linked) note = std.linkNote ?? "Nothing attached connects the person named to the events of that night.";
  else if (!core) note = "The evidence attached is substantial, but the conclusions drawn from it do not hold together.";

  return { accepted: !note, note, linesCovered: covered };
}
