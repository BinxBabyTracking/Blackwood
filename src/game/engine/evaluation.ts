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
  if (std.claims?.length) {
    const seen = new Set<string>();
    for (const c of std.claims) {
      const filed = answerList(t[claimKey(c.id)]);
      if (!filed.length) return "File at least one piece of evidence under every point the report must show.";
      for (const id of filed) {
        if (!ev.includes(id)) return "Evidence filed under a point must be attached to the report.";
        if (seen.has(id)) return "Each piece of evidence can be filed under one point only.";
        seen.add(id);
      }
    }
  }
  return null;
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
 * Reviews a filed report. With the investigation's state the reviewer can also
 * say whether missing proof is already in the player's evidence or still out
 * there to be found, without ever naming an item or an answer.
 */
export function evaluateReport(def: CaseDefinition, t: Theory, s?: InvestigationState, returned = 0): Review {
  const sol = def.solution;
  const std = sol.standard;
  const answers = solutionAnswers(sol);
  const covered = std.lines.filter((l) => l.anyOf.some((id) => t.evidence.includes(id))).map((l) => l.id);
  const keyIds = new Set(std.lines.flatMap((l) => l.anyOf));
  const related = new Set([...keyIds, ...(std.claims ?? []).flatMap((c) => c.anyOf), ...std.supporting]);
  const unrelated = t.evidence.filter((id) => !related.has(id)).length;
  const linked = std.linkToSuspect.some((id) => t.evidence.includes(id));
  const decided = !def.conclusionChoices.some((c) => answerList(t[c.id]).some((v) => std.undecided.includes(v)));
  const core = Object.entries(answers).every(([k, right]) => sameAnswer(t[k], right));

  // Points of the report: what's filed under each, and whether the proof for an unproven point is misfiled, unattached, or not found yet.
  const claims = std.claims ?? [];
  const has = (id: string) => (s ? s.evidence.includes(id) || (s.photos ?? []).some((p) => p.id === id) : false);
  const unproven = claims
    .filter((c) => !answerList(t[claimKey(c.id)]).some((id) => c.anyOf.includes(id)))
    .map((c) => ({
      c,
      misfiled: c.anyOf.some((id) => t.evidence.includes(id)),
      inHand: c.anyOf.some((id) => has(id)),
    }));
  const keyIds2 = new Set([...keyIds, ...claims.flatMap((c) => c.anyOf)]);
  const keyAll = t.evidence.filter((id) => keyIds2.has(id)).length;
  const keyInHand = s ? [...keyIds2].filter((id) => has(id)).length : Infinity;

  // The first reason that applies is the one the reviewer writes down. None names an answer or an item.
  let note = "";
  const first = unproven[0];
  if (!decided) note = "The report leaves at least one question open. The agency cannot act on findings that do not commit to a conclusion.";
  else if (first && first.misfiled)
    note = `Nothing filed under "${first.c.label}" proves it, though something you attached elsewhere might. Check where each item is filed.`;
  else if (first && first.inHand)
    note = `Nothing filed under "${first.c.label}" proves it. The proof is already among the evidence you've collected: look again at what you have.`;
  else if (first)
    note = `Nothing you've found so far proves "${first.c.label}". Key evidence is still out there; keep investigating before you file again.${returned >= 1 && first.c.hint ? ` ${first.c.hint}` : ""}`;
  else if (std.minKey && keyAll < std.minKey)
    note =
      keyInHand >= std.minKey
        ? `Too few of the attached items bear directly on the conclusions. The agency looks for at least ${std.minKey} pieces of key evidence, and you have enough of it in hand: look again at what you've collected.`
        : `Too few of the attached items bear directly on the conclusions. The agency looks for at least ${std.minKey} pieces of key evidence, and some of it is still out there to be found.`;
  else if (covered.length < std.minLines) note = "The attached evidence rests on too few independent lines of inquiry. The agency looks for corroboration from more than one direction.";
  else if (unrelated > std.maxUnrelated) note = "Some of the attached evidence has no clear bearing on the conclusions presented.";
  else if (!linked) note = std.linkNote ?? "Nothing attached connects the person named to the events of that night.";
  else if (!core) note = "The evidence attached is substantial, but the conclusions drawn from it do not hold together.";

  return { accepted: !note, note, linesCovered: covered };
}
