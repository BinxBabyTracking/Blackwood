import { reduce } from "../src/game/engine/engine";
import type { CaseDefinition, InvestigationState, Theory } from "../src/game/engine/types";

/**
 * Files report evidence under the points it proves, as a player would: each item
 * under a point it fits (spreading them out), anything else as supporting, and
 * any point still empty gets a spare item or one borrowed from the fullest point.
 */
export function fileUnder(def: CaseDefinition, evidence: string[]) {
  const claims = def.solution.standard.claims ?? [];
  const out: Record<string, string[]> = Object.fromEntries(claims.map((c) => [`claim:${c.id}`, [] as string[]]));
  const spare: string[] = [];
  for (const id of evidence) {
    const fits = claims.filter((c) => c.anyOf.includes(id)).sort((a, b) => out[`claim:${a.id}`].length - out[`claim:${b.id}`].length);
    if (fits.length) out[`claim:${fits[0].id}`].push(id);
    else spare.push(id);
  }
  for (const c of claims) {
    if (out[`claim:${c.id}`].length) continue;
    if (spare.length) out[`claim:${c.id}`].push(spare.shift()!);
    else {
      const donor = Object.values(out).sort((x, y) => y.length - x.length)[0];
      if (donor && donor.length > 1) out[`claim:${c.id}`].push(donor.pop()!);
    }
  }
  return out;
}

/**
 * The Final Report Standard checks every case must pass, on a copy of a state
 * that holds all the evidence. Every collected item goes with the report, so:
 * with all of it and the right answers the report is accepted; without any
 * proof for a point it comes back asking for more evidence and naming that
 * point (with the point's hint from the second return); with the wrong
 * answers it comes back saying the conclusions don't hold. `right` is the
 * correct theory without evidence. `good` is kept for older callers.
 */
export function reportStandardProblems(
  def: CaseDefinition,
  s: InvestigationState,
  right: Omit<Theory, "evidence">,
  _good: string[] = [],
): string[] {
  const problems: string[] = [];
  const claims = def.solution.standard.claims ?? [];
  if (!claims.length) return ["the case has no report points (claims)"];
  const submit = (st: InvestigationState, t: Theory) => reduce(def, st, { type: "submitConclusion", theory: t, investigator: "Test" }, 2);
  const theory = (over: Partial<Theory> = {}): Theory => ({ ...right, evidence: [], ...over }) as Theory;
  const note = (r: ReturnType<typeof submit>) => (r.outcome.kind === "verdict" ? r.outcome.note : "");
  const accepted = (r: ReturnType<typeof submit>) => r.outcome.kind === "verdict" && r.outcome.correct;

  const ok = submit(s, theory());
  if (!accepted(ok)) problems.push(`report standard: a report with all the evidence and the right answers was returned: "${note(ok)}"`);
  else if (!(ok.state.report.final?.theory.evidence.length === s.evidence.length)) problems.push("report standard: the filed report did not carry every piece of collected evidence");

  // Every point: without any of its proof, the report asks for more evidence and names the point; the hint comes on the second return.
  for (const c of claims) {
    const lacking: InvestigationState = { ...s, evidence: s.evidence.filter((e) => !c.anyOf.includes(e)) };
    try {
      const r1 = submit(lacking, theory());
      if (accepted(r1) || !/find more evidence/.test(note(r1)) || !note(r1).includes(c.label)) {
        problems.push(`report standard: missing proof for "${c.id}" not reported as needing more evidence: "${note(r1)}"`);
        continue;
      }
      const r2 = submit(r1.state, theory());
      if (c.hint && !note(r2).includes(c.hint)) problems.push(`report standard: second return for "${c.id}" lacks its hint: "${note(r2)}"`);
      if (!c.hint) problems.push(`report standard: point "${c.id}" has no hint`);
    } catch (e) {
      problems.push(`report standard: could not file a report without "${c.id}": ${(e as Error).message}`);
    }
  }

  // The wrong answer to the first question, with all the evidence: returned, and not for want of evidence.
  const q = def.conclusionChoices.find((c) => !c.multi);
  if (q) {
    const wrong = q.options.find((o) => o.id !== right[q.id] && !def.solution.standard.undecided.includes(o.id));
    if (wrong) {
      const r = submit(s, theory({ [q.id]: wrong.id }));
      if (accepted(r) || !/do not hold together/.test(note(r))) problems.push(`report standard: a wrong answer with all the evidence was not returned as such: "${note(r)}"`);
    }
  }
  return problems;
}
