# Final Report Standard

How every Blackwood case judges a final report. Rewritten Oct 28, 2026: players kept getting stuck at the end, sure they had the right evidence but filing it under the wrong point or picking the wrong few items. The player no longer picks evidence. They answer the questions, and **everything they have collected goes with the report**. The engine does this for every case; each case supplies its own points in `solution.ts`.

## What the player sees

The report asks the case's questions (who, why, how, where, and so on), each with an "Unknown" option. The evidence section is read only:

- **What the agency needs:** the points the evidence must prove, one per line. "If any is missing, the report comes back and you keep investigating."
- "Everything you've collected goes with the report: N pieces so far. Evidence found: X of Y."
- The collected evidence, each item with Examine.

Review report, then Submit Findings, files it.

## How a report is judged

A report is accepted when:

1. every question is answered, none with Unknown;
2. for every point, at least one piece of evidence the player has collected proves it (any item in that point's `anyOf`);
3. the answers are right.

What a returned report says, in that order:

1. An answer left as Unknown: "The report leaves at least one question open."
2. A point with no proof among the collected evidence: "You need to find more evidence. Nothing you've collected yet proves these points: ..." naming each such point by its neutral label. From the second return on, the first missing point's hint is added.
3. Wrong answers with all the proof in hand: "You have the evidence the agency needs, but the conclusions drawn from it do not hold together. Look again at your answers."

The note never names an item or an answer. Each returned report costs 50 points on the leaderboard (up to 200).

## The standard points

Every case uses neutral wording that says what kind of proof is needed and never what it is. Start from these four:

1. **Places the person you name at the scene, or ties them to that night**
2. **Shows why they did it**
3. **Shows how it was done or how it was covered up**
4. **Tests the story they told: an alibi, a timeline or a statement**

A case may swap one for a point of its own when the story needs it (for example "Shows where the victim was held"). A label must never name a person, an object, a place or a theory: "Staged entry" or "Financial motive" would give the answer away. Because the points are now the whole evidence test, make sure each one needs real investigating: its `anyOf` should not be items the player gets at the start.

## In `solution.ts`

```ts
standard: {
  claims: [
    { id: "tie", label: "Places the person you name at the scene, or ties them to that night", anyOf: ["E05", "E14"], hint: "Where to look, never what to find." },
    { id: "why", label: "Shows why they did it", anyOf: ["E03", "E15"], hint: "..." },
    { id: "how", label: "Shows how it was done or how it was covered up", anyOf: ["E01", "E10"], hint: "..." },
    { id: "story", label: "Tests the story they told: an alibi, a timeline or a statement", anyOf: ["E04", "E13"], hint: "..." },
  ],
  undecided: ["unknown"],
  // Still in the type and still set by every case, but no longer used to judge a report:
  // minItems, maxItems, minKey, lines, minLines, linkToSuspect, supporting, maxUnrelated.
}
```

- `anyOf`: every piece of evidence that proves the point. An item may prove more than one point.
- `hint`: added from the second return on, when nothing the player has found proves that point. It points at a place or a person ("Eleanor kept careful records; look again at her desk"), never an item.
- A case without `claims` falls back to its `lines` as the points.
- The filed report keeps every collected item, sorted under the points it proves (`autoClaims` in `src/game/engine/evaluation.ts`).

## Testing

`npm run check:case -- CXXX` runs `reportStandardProblems(def, state, rightAnswers)` from `scripts/report-helpers.ts`: the right answers with all the evidence are accepted and the filed report carries every item; for each point, an investigation without any of its proof is returned asking for more evidence and naming the point, with the hint on the second return; a wrong answer with all the evidence is returned as not holding together. To check that a particular set of findings is not enough, call `evaluateReport(def, { ...right, evidence: thoseItems }, state)` directly.

## C001's points

| Point | Evidence that proves it |
| --- | --- |
| Places the person you name at the scene, or ties them to that night | E02, E05, E11, E14, E16 |
| Shows why they did it | E03, E08, E09, E15 |
| Shows how it was done or how it was covered up | E01, E05, E06, E07, E10 |
| Tests the story they told | E04, E12, E13 |
