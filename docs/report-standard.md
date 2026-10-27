# Final Report Standard

How every Blackwood case judges a final report. Written Oct 27, 2026 after the first C002 test run, where a correct theory was returned for missing key evidence and nothing told the player the proof hadn't been found yet. The engine supports all of this for every case; each case supplies its own points and numbers in `solution.ts`.

## What the player sees

The evidence section of the report opens with **What the agency needs**:

- The points the report must show, one row each.
- "At least N pieces of key evidence in all. Attach up to M."
- "Evidence found so far: X of Y", a quiet sign that there is more to find.

The player files each piece of evidence under the point they think it proves. A row shows a check when something is filed under it, never whether it is right. Anything else goes under **Supporting material (optional)**. The report can't be reviewed until every point has something filed under it.

## The standard points

Every case uses neutral wording that says what kind of proof is needed and never what it is. Start from these four:

1. **Places the person you name at the scene, or ties them to that night**
2. **Shows why they did it**
3. **Shows how it was done or how it was covered up**
4. **Tests the story they told: an alibi, a timeline or a statement**

A case may swap one for a point of its own when the story needs it (for example "Shows where the victim was held"). A label must never name a person, an object, a place or a theory: "Staged entry" or "Financial motive" would give the answer away.

## Numbers that scale with the case

- **Key evidence required:** about one for every 5 to 6 pieces of evidence in the case, never fewer than 4. At least one key item per point, so key ≥ number of points.
- **Most a report can carry:** key + 2 to 4, so there is room for supporting material.

| Case | Evidence | Key required (`minKey`) | Most attached (`maxItems`) |
| --- | --- | --- | --- |
| C001 | 16 | 4 | 6 |
| C002 | 23 | 4 | 8 |
| C003 | 32 | 6 | 10 |
| Long-form, 50+ | 50+ | 8 to 9 | 12 to 14 |

## In `solution.ts`

```ts
standard: {
  minItems: 4,          // usually equal to minKey
  maxItems: 8,
  minKey: 4,
  claims: [
    { id: "tie", label: "Places the person you name at the scene, or ties them to that night", anyOf: ["E05", "E14"], hint: "Where to look, never what to find." },
    { id: "why", label: "Shows why they did it", anyOf: ["E03", "E15"], hint: "..." },
    { id: "how", label: "Shows how it was done or how it was covered up", anyOf: ["E01", "E10"], hint: "..." },
    { id: "story", label: "Tests the story they told: an alibi, a timeline or a statement", anyOf: ["E04", "E13"], hint: "..." },
  ],
  lines: [...],          // kept: lines of inquiry and minLines still apply
  linkToSuspect: [...],  // kept
  supporting: [...],
  maxUnrelated: 2,
  undecided: ["unknown"],
}
```

- `anyOf`: every piece of evidence that proves the point. An item may prove more than one point (a bloodied jacket ties the suspect to the night and shows a cover-up); the player files it under one.
- `hint`: added to a returned report from the second return on, when nothing the player has found proves that point yet. It points at a place or a person ("Eleanor kept careful records; look again at her desk"), never an item.
- Cases without `claims` keep the older checks and the plain attach list, so nothing breaks while a case is being converted.

## What a returned report says

In the order the reviewer checks:

1. An answer left as Unknown.
2. A point with no proof filed under it:
   - proof is attached but filed elsewhere: "something you attached elsewhere might";
   - proof is among the evidence already collected: "look again at what you have";
   - nothing found proves it: "key evidence is still out there", plus the point's hint from the second return on.
3. Too few key items, saying whether enough is in hand or still to be found.
4. Too few lines of inquiry, too much unrelated evidence, or nothing tying the suspect to the night.
5. The answers themselves don't hold together.

Each returned report costs 50 points on the leaderboard.

## Testing

`npm run check:case -- CXXX` must cover: a fully supported report accepted; an empty point refused; proof filed under the wrong point pointed out; proof not yet found reported as still out there, with the hint on the second return. All of that is one call: `reportStandardProblems(def, state, rightAnswers, goodEvidence)` in `scripts/report-helpers.ts`, run on every point of the case. `fileUnder(def, evidence)` from the same file files evidence as a player would, for any other report a case's checks submit.

## Status

All three cases are converted (Oct 27, 2026):

| Case | Points | Key | Attach up to |
| --- | --- | --- | --- |
| C001 | Ties them to that night; why; how it was done or covered up; tests their story | 4 | 6 |
| C002 | Ties the person to the crime; why; how it was done; where she was held | 4 | 8 |
| C003 | Places the people at the first shooting; why the first victims; who was behind it; ties the person to the second deaths; why the second victims; tests their story | 6 | 10 |

A new case adds its `claims` (with hints) from the start and calls `reportStandardProblems` in its checks.
