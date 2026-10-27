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
 * The Final Report Standard checks every converted case must pass, on a copy of a
 * state that holds all the evidence. `right` is the correct theory without
 * evidence; `good` is a set of evidence that proves every point.
 */
export function reportStandardProblems(
  def: CaseDefinition,
  s: InvestigationState,
  right: Omit<Theory, "evidence">,
  good: string[],
): string[] {
  const problems: string[] = [];
  const claims = def.solution.standard.claims ?? [];
  if (!claims.length) return ["the case has no report points (claims)"];
  const submit = (st: InvestigationState, t: Theory) => reduce(def, st, { type: "submitConclusion", theory: t, investigator: "Test" }, 2);
  const theory = (ev: string[], over: Partial<Theory> = {}): Theory => ({ ...right, evidence: ev, ...fileUnder(def, ev), ...over }) as Theory;
  const note = (r: ReturnType<typeof submit>) => (r.outcome.kind === "verdict" ? r.outcome.note : "");

  const ok = submit(s, theory(good));
  if (!(ok.outcome.kind === "verdict" && ok.outcome.correct)) problems.push(`report standard: a fully supported report was returned: "${note(ok)}"`);

  // An empty point can't be filed.
  try {
    submit(s, theory(good, { [`claim:${claims[0].id}`]: [] }));
    problems.push("report standard: a point with nothing filed was accepted for review");
  } catch {}

  // For each point: proof filed elsewhere is pointed out; proof never found is "still out there", with the hint from the second return.
  for (const c of claims) {
    const filed = fileUnder(def, good);
    const mine = filed[`claim:${c.id}`].filter((id) => c.anyOf.includes(id));
    const other = claims.find((x) => x.id !== c.id);
    if (mine.length && other) {
      // Swap this point's proof with another point's items so nothing filed here proves it.
      const others = filed[`claim:${other.id}`].filter((id) => !c.anyOf.includes(id));
      if (others.length) {
        const swapped = { ...filed, [`claim:${c.id}`]: others, [`claim:${other.id}`]: [...filed[`claim:${other.id}`].filter((id) => !others.includes(id)), ...mine] };
        const r = submit(s, { ...right, evidence: good, ...swapped } as Theory);
        if (!/attached elsewhere/.test(note(r)) && !(r.outcome.kind === "verdict" && r.outcome.correct === false && /proves it/.test(note(r))))
          problems.push(`report standard: misfiled proof for "${c.id}" not pointed out: "${note(r)}"`);
      }
    }
    // Remove every item that proves this point from the investigation, then file what's left.
    const lacking: InvestigationState = { ...s, evidence: s.evidence.filter((e) => !c.anyOf.includes(e)) };
    const ev = good.filter((id) => !c.anyOf.includes(id));
    const spares = lacking.evidence.filter((e) => !ev.includes(e));
    while (ev.length < def.solution.standard.minItems && spares.length) ev.push(spares.shift()!);
    let t: Theory;
    try {
      t = theory(ev);
      const r1 = submit(lacking, t);
      if (!/still out there/.test(note(r1))) {
        problems.push(`report standard: missing proof for "${c.id}" not reported as still out there: "${note(r1)}"`);
        continue;
      }
      const r2 = submit(r1.state, t);
      if (c.hint && !note(r2).includes(c.hint)) problems.push(`report standard: second return for "${c.id}" lacks its hint: "${note(r2)}"`);
      if (!c.hint) problems.push(`report standard: point "${c.id}" has no hint`);
    } catch (e) {
      problems.push(`report standard: could not file a report without "${c.id}": ${(e as Error).message}`);
    }
  }
  return problems;
}
