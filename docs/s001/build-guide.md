# S001 case build guide (S01 C02 to S01 C06)

How each remaining case of The Judas Principle goes from brief to playable case.
S01 C01 (`src/cases/S001C01/`, design `docs/S001C01-timeline.md`) is the
reference for everything here: copy its shape, not its story.

## Inputs, in order of authority

1. `docs/s001/bible.md`, the series bible. **Where it and a brief disagree, the bible wins.** Apply its renames (section 2) everywhere, its custody table and master timeline (section 3), the leak channel (section 4), the series deductions (section 6), the finale recovery routes (section 7) and the fixes for your case (section 8).
2. `docs/s001/brief-c0N.md`, the case's own brief (still uses the old names: rename as you read).
3. `docs/S001C01-timeline.md`, the finished C01 design: the format, the level of detail, and the "Build contract" section every case doc must end with.
4. `docs/report-standard.md` (Final Report Standard) and `docs/C001-baseline.md` (how a Blackwood case is built).
5. The engine: `src/game/engine/types.ts` (what a case can express), and the C01 case files in `src/cases/S001C01/` as a working example of every feature (handovers as knowledge effects, gated hotspots, calls, texts, labs, deliveries, reactive events, re-interview grants, report claims).

## House rules

- Never use em dashes or en dashes, anywhere: prose, dialogue, evidence text, comments. Use commas, colons, periods, parentheses or "to".
- American spelling.
- No surname reused anywhere in the catalog (C001 to C006 and the other S001 cases), and no first name repeated inside the series. The bible's rename table is the source; if you find a new clash, rename and say so in your summary.
- Each case is a complete investigation of its own: a player who never pins anything on the rolling board must still be able to solve it. Earlier cases' evidence is never handed to the player inside a later case, except the C06 recovery routes (bible section 7).
- Never connect evidence automatically, and never pin anything on the rolling board for the player.
- Every piece of evidence is reachable exactly one way (a scene hotspot, a handover through a knowledge fact, or a delivery).
- Evidence ids are three digits, matching the brief and the bible's canonical ids (`S001-C02-E034` is evidence `E034` in case `S001C02`). The ids the bible's series deductions and recovery routes name must exist in your case with that number and that content.
- Length is an estimate (2 to 4 hours, C06 up to about 6). Don't pad or cut to hit it.
- Nothing a character says before the closing may state the solution outright.
- The player never splits up: in joint play the whole table moves together.

## Ids for each case

| Case | Folder and export | `case_number` | Image id prefix | Characters that already exist |
| --- | --- | --- | --- | --- |
| S01 C02 Room 614 | `src/cases/S001C02/`, `S001C02` | S01-C02 | `s001c02_` | `bennett` (reuse C003's Bennett art, as C01 does) |
| S01 C03 Dead Freight | `src/cases/S001C03/`, `S001C03` | S01-C03 | `s001c03_` | same |
| S01 C04 The Informant | `src/cases/S001C04/`, `S001C04` | S01-C04 | `s001c04_` | same |
| S01 C05 The Benefactor | `src/cases/S001C05/`, `S001C05` | S01-C05 | `s001c05_` | same |
| S01 C06 The Architect | `src/cases/S001C06/`, `S001C06` | S01-C06 | `s001c06_` | same |

Recurring people keep one character id across cases (`holt`, `rourke`, `lockhart`, `quinlan`, `ames`, `sayer`, `donovan`, `kane`, `marchetti` and so on: use the surname from the bible, lowercase), so the rolling board treats them as one person (`S001-P-holt`).

## Step 1: the design doc

Write `docs/S001C0N-timeline.md` with the same sections as the C01 doc: at a glance, the truth in brief, names and places, the money or mechanism, the leak (if any), canonical timeline (checked against a real calendar), contradictions found and fixed, cast and what each person says, locations, evidence with full inspection texts, deductions as pairs with requirements, reactive events, labs, re-interview grants, final report (questions, options, answers, claims, evidence standard), series board handoff, and the build contract (shared ids for characters, locations, areas, flags, events, calls, deliveries, handovers with their gates, and scene items), so two people can build the case files in parallel without talking.

Also give the case's series notebook entry (title and text for after the report is accepted), spoiler-safe for later cases.

## Step 2: the case files

Two builders, splitting files the way C01 did:

- World and story: `evidence.ts`, `locations.ts`, `story.ts`, `solution.ts`, `assets.ts`, `soundtrack.ts`, `desk.ts`, `index.ts`.
- People: `characters.ts`, `knowledge.ts`, `interviews.ts`.

Art manifest entries go in `art/pending/S001C0N.json` (an array of the same image objects `art/manifest.json` uses, plus any `people` descriptions under a `people` key), never straight into `art/manifest.json`: several cases are built at once and the main session merges them.

Do not edit `src/game/registry.ts`, `scripts/check-case.ts`, the engine, or any other case. The main session registers the case, writes its reference playthrough and runs the checks.
