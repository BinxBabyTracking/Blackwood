import type { CaseDefinition, InvestigationState, Theory } from "./types";

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

/** Checks a report is complete and cites only evidence collected in this investigation. Returns a problem, or null. */
export function reportProblem(def: CaseDefinition, s: InvestigationState, t: Theory): string | null {
  const std = def.solution.standard;
  for (const c of def.conclusionChoices) {
    const v = t?.[c.id];
    if (typeof v !== "string" || !c.options.some((o) => o.id === v)) return `Complete section ${c.section} before submitting.`;
  }
  if (!Array.isArray(t.evidence)) return "Attach the evidence that supports your conclusions.";
  const ev = [...new Set(t.evidence)];
  if (ev.length !== t.evidence.length) return "Each piece of evidence can be attached once.";
  if (ev.some((id) => typeof id !== "string" || !(s.evidence.includes(id) || (s.photos ?? []).some((p) => p.id === id)))) return "You can only attach evidence collected in this investigation.";
  if (ev.length < std.minItems || ev.length > std.maxItems) return `Attach between ${std.minItems} and ${std.maxItems} pieces of evidence.`;
  return null;
}

export function evaluateReport(def: CaseDefinition, t: Theory): Review {
  const sol = def.solution;
  const std = sol.standard;
  const covered = std.lines.filter((l) => l.anyOf.some((id) => t.evidence.includes(id))).map((l) => l.id);
  const keyIds = new Set(std.lines.flatMap((l) => l.anyOf));
  const key = t.evidence.filter((id) => keyIds.has(id)).length;
  const related = new Set([...keyIds, ...std.supporting]);
  const unrelated = t.evidence.filter((id) => !related.has(id)).length;
  const linked = std.linkToSuspect.some((id) => t.evidence.includes(id));
  const decided = ![t.culprit, t.motive, t.weapon, t.location].some((v) => std.undecided.includes(v));
  const core = t.culprit === sol.culprit && t.motive === sol.motive && t.weapon === sol.weapon && t.location === sol.location;

  // The first reason that applies is the one the reviewer writes down. None depends on the correct answers.
  let note = "";
  if (!decided) note = "The report leaves at least one question open. The agency cannot act on findings that do not commit to a conclusion.";
  else if (std.minKey && key < std.minKey)
    note = `Too few of the attached items bear directly on the conclusions. The agency looks for at least ${std.minKey} pieces of key evidence; the rest of a report may be supporting material.`;
  else if (covered.length < std.minLines) note = "The attached evidence rests on too few independent lines of inquiry. The agency looks for corroboration from more than one direction.";
  else if (unrelated > std.maxUnrelated) note = "Some of the attached evidence has no clear bearing on the conclusions presented.";
  else if (!linked) note = "Nothing attached connects the person named to the events of that night.";
  else if (!core) note = "The evidence attached is substantial, but the conclusions drawn from it do not hold together.";

  return { accepted: !note, note, linesCovered: covered };
}
