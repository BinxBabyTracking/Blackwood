# C001 Baseline: How a Blackwood Case Is Built

Oct 22, 2026 · Ian. Live, editable version: https://claude.ai/artifact/AJo9xAJ6NXH32fsxx7GAXK (this file is a copy kept with the project so every new chat can read it).

## Purpose

C001 (The Whitmore File) is the reference case: every new case copies its structure, rules and checklist. This document records what C001 contains, how each system works, and what a new case must supply to plug into it.

The game engine is generic and shared. A case is a folder of data (`src/cases/CXXX/`) plus its art and audio. Nothing case-specific lives in the engine, so most of the work for C002 onward is writing content, not code.

Live site: [blackwoodinvestigation.com](https://www.blackwoodinvestigation.com). Code: GitHub `BinxBabyTracking/Blackwood`, deployed by Vercel on every push. Database: Supabase.

## C001 is the smallest case

C001 is the Introductory tier, about 20 minutes and free. It is the floor, not the template for size: later cases can run from an hour to weeks of play, and everything here scales up from it.

| Tier | Length | Price | Cases set up so far |
| --- | --- | --- | --- |
| Introductory | about 20 minutes | Free | C001 |
| Tier 1 | about 1 hour | $2.99 | C002 |
| Tier 2 | 2 to 3 hours | $4.99 | C003 |
| Tier 3 | 4 to 6 hours | $8.99 | C004 |
| Tier 4 | 8 to 12 hours | $12.99 | C005 |
| Tier 5 | 20 to 30 hours | $17.99 | none yet |
| Tier 6 | 40 to 60 hours | $25.00 | none yet |

**What grows with a longer case:** locations, people, evidence, events and deductions; more lines of inquiry, with a higher key-evidence count in the report; larger question limits or more re-interview grants; more art, voices and room sounds. The spending ledger's cost per completed case should set each tier's price.

**What stays the same:** the loop below, the engine, the content rules, the art style, the checks, and the platform features.

**Open questions for the long tiers:**

- Should a weeks-long case unfold in chapters, each with its own interim report, before the final one?
- Should some events wait for real time to pass (a lab result back in 3 days)? Today every event fires from what the player has done, never from the clock.
- Should question limits reset per chapter rather than per case?

## How a case plays

Every case runs the same loop until the report is accepted:

1. Read the case file (intro, dossier, the people)
2. Explore scenes (evidence and photos)
3. Interview people (ask, present evidence)
4. The world reacts (calls and deliveries)
5. Murder board (connect clues, get deductions)
6. File the report (4 to 6 items, 4 answers)
7. Accepted: case solved (reconstruction and rank). Returned: keep investigating.

A returned report sends the player back into the field with a reviewer's note; nothing is lost. Exploring and interviewing happen in any order, and events fire from what the player has done, never from the clock.

## Case content checklist

A new case is ready when every file below exists and `npm run check:case -- CXXX` reports "All checks passed." C001's counts are the yardstick.

| File in `src/cases/CXXX/` | What it holds | C001 |
| --- | --- | --- |
| `index.ts` | Case id, title, year, start location, question limit, soundtrack, board hint, lab tests, re-interview grants | 20 questions per person; board hint at 4 evidence |
| `story.ts` | Intro cards, case file (dossier), documents, incoming calls, deliveries, reactive events, objectives, report availability, starting timeline | 1 intro, 2 calls, 4 deliveries, 3 events, 2 lab tests (3 minutes each) |
| `locations.ts` | Scenes, map pins, hotspots (people, objects, doors), ambience key, scene states | 8 locations |
| `characters.ts` | People, voices, demeanor stages, authored questions and answers, reactions to evidence, contradictions, match keywords | 7 people, 84 questions |
| `knowledge.ts` | Each person's persona and the facts they may say, each gated like the answer that reveals it | 6 people with knowledge |
| `interviews.ts` | Patience lines when questions run low, who is unlimited, re-interview grants | Bennett unlimited; 10 grants |
| `evidence.ts` | Every evidence item: title, image, inspection text (the full document text), discovery, related people | 16 items, E01 to E16 |
| `solution.ts` | Deductions (board connections), report choices, the solution, the evidence standard, the closing reconstruction | 8 deductions |
| `assets.ts` | Asset manifest: scene, portrait, evidence and object images; audio keys | 69 painted images |
| `soundtrack.ts` | Music and room-sound prompts for ElevenLabs | 1 theme + 7 room sounds |

Also required outside the case folder:

- A canonical timeline doc (`docs/CXXX-timeline.md`), written before any dialogue.
- Art in `art/inbox/`, imported with `node scripts/import-art.mjs`, and subjects listed in `art/manifest.json`.
- A `cases` row in Supabase (status `available`, `is_preview` false) and the case registered in `src/game/registry.ts`.
- Music and room sound made from Admin, Music and room sound, after the case is live.

## Story and canonical timeline

Write the timeline first; everything else must agree with it. C001's lives in `docs/C001-timeline.md`: a minute-by-minute table of the night, where the player learns each moment, and a validation table checking evidence against it.

- Cases are drawn from real investigations. Names, places, dates and identifying details are changed; no character represents a real person. For a recent case, also change professions.
- Unsolved real cases get a dramatized solution. The site says so.
- Check the calendar. C001's draft put the supper on a Saturday; August 16, 1985 was a Friday, and every document had to move a day.
- Every departure, sighting and receipt time must fit together (C001 had four timing contradictions fixed before launch). List them in the timeline doc under "Contradictions found".
- Some moments are known only to the closing reconstruction (the culprit's return, the struggle). Mark them "Closing report only" so no dialogue leaks them.
- The culprit's knowledge file is his account, including the lies. Nobody's knowledge confesses.
- C001 solution: Daniel Mercer, financial motive, the kitchen knife, in the living room. The break-in was staged.

## Evidence, documents and photos

Every evidence item is reached exactly one way: a scene hotspot, a document, a delivery, or a person handing it over in an interview. The checker enforces this.

- **Inspection text is the document.** Ledgers, tickets, diaries, lab reports and schedules must carry their full contents, with paragraph breaks. C001 shipped with seven placeholders; players could not use them. Never leave "to be supplied" text.
- **The painted image never has legible text.** The image is atmosphere; the inspection text carries the readable content.
- **Lab and forensic results must narrow, not name.** C001's typing: Eleanor Group A, the glass edge Group B (E11), then the guests O, A, B, B (E16). Typing leaves two suspects; the hand injury separates them.
- **Evidence from interviews.** A knowledge fact can carry the evidence it hands over, so asking in any words gets it (Rosa's ticket, the diner schedule). People also volunteer facts and make offers ("Let me get his ticket").
- **Collected stamp.** Any new item shows a COLLECTED EVIDENCE stamp for 2.6 seconds; photos show PHOTO FILED.
- **Photos.** Anything inspected that is not itself evidence (the jacket on the rack, the empty rack, the ashtray) can be photographed. The photo is cut from the scene as it looked at that moment, filed as P1, P2..., and can be noted, pinned and attached to the report. Photos are not shown to witnesses.
- **Lab tests take real time.** Nothing from the lab is on hand at the start. Once the player has the broken glass, they ask Bennett (in any words) to send it; he then offers to collect the guests' blood samples, so nobody has to think of that alone. Each test is a 3-minute countdown shown on the office desk and in the top bar, kept on the server so it runs even when the player is away. The results arrive as folders on the desk. The glass's own description and a notebook objective point the player at the lab.
- **Notes.** Players can write a note on any item; notes are saved with the game.

## Interviews

Players ask questions in their own words, typed or spoken; the server decides the answer. The browser never sees the case's answers, solution or knowledge.

1. **Authored answer first.** The question is matched against each authored question's keywords. A clear match plays the scripted answer and applies its effects (evidence, timeline, flags).
2. **AI answer otherwise.** Claude (Haiku) answers in character from that person's persona and the knowledge facts they have unlocked. If the answer used a fact tied to an authored entry, that entry counts as asked, so wording never blocks progress.
3. **Cache.** Unscripted answers are cached by question meaning plus unlocked knowledge, so the next player asking the same thing costs nothing.
4. **Outside the case.** People only know the case; anything else gets a short answer. The interview screen says so under the question box.

Rules that make it fair and affordable:

- **Question limit:** 20 per person, shared in joint play. Evidence and developments grant 5 extra questions with the right person (10 grants in C001). Every 3 new scripted answers earn $1 of expense money; $5 buys 5 more questions with one person.
- **Patience lines:** each person has lines for when questions run low and when they are done.
- **Demeanor:** people change manner as pressure builds (Daniel: Composed, Guarded, Defensive, Declining to answer).
- **Detective Bennett** is reached by telephone, has no limit, and only knows the police file.
- **Rate limit:** 30 questions a minute per player, checked before the AI is called.
- **Voices:** each person has a fixed ElevenLabs voice. Answers are spoken with subtitles; push-to-talk uses ElevenLabs Scribe.

## Events, calls and deliveries

The world reacts to what the player has done, never to the clock. Each reactive event has a trigger, an activation (often "when next in the office"), and a completion, and can resolve in any order with the same facts at the end.

| Event | Triggered by | What happens |
| --- | --- | --- |
| RE01 Margaret's call | Margaret interviewed about the night, and the guest timeline in hand | The office phone rings; she recalls a dark sedan at 12:10 AM |
| RE02 Daniel's apartment changes | Daniel interviewed and an injury, hand or alibi deduction made | While away, the jacket disappears from his rack; Bennett's search recovers it and it arrives as a sealed evidence bag |
| RE03 Patricia's envelope | The ledger collected or the money deduction made | A torn bank statement arrives at the office |

- **Calls ring only in the office.** Away from it, a notice says a call is waiting. Calls can be deferred and ring again next visit.
- **Deliveries** sit on the office desk, sealed until opened.
- **Notices** at the top of the screen clear themselves after 6 seconds and never block the scene.
- **Board hint:** once 4 pieces of evidence are collected with nothing connected on the board, Det. Bennett calls once to explain pinning evidence and running string between pieces. It is advice, not a case development, and is set per case in `index.ts` (`boardHint`).
- **Objectives** in the notebook give a light to-do list (read the file, examine the house, call Bennett).

## Murder board and deductions

Players pin evidence, photos and people on the board, then connect two items with string. A connection that matches a deduction reveals it; wrong connections do nothing and cost nothing. On phones the tray of items sits along the bottom with a Back button.

| Deduction | Any one of these connections |
| --- | --- |
| Possible Staged Entry | E01 screen + E10 back door |
| Signs of a Struggle | E06 knife + E07 chair, or E06 + E02 glass |
| An Injured Assailant | E02 glass + E11 blood report |
| Possible Injury Connection | E14 bandage + E16 guest comparison, E14 + E02, or Daniel + E16 |
| Financial Irregularities | any two of E03 ledger, E15 statement, E08 missing folder |
| Financial Motive | E09 diary + E03, E15 or E08 |
| Timeline Inconsistency | any two of E04 ticket, E13 shift sheet, E12 Bennett's notes |
| Recovered Physical Evidence | E05 jacket + E11, E14 or E16 |

Offer more than one pair per deduction, so players reasoning differently still get there. Some deductions require evidence the player may not have yet (D_HAND needs both E16 and E14). Deductions also unlock questions and events.

## Final report and the solution standard

A report is accepted when the four answers are right and 4 to 6 attached items meet the evidence standard. The reviewer's note never says which answer is wrong.

The report form (BI-7) asks who, why, how and where, each with an "Unknown" option, plus the attached evidence. Drafts save as the player goes; in joint play everyone edits the draft and only the host files it.

**The standard, in the order the reviewer checks it:**

1. No answer left as Unknown.
2. At least 4 key items: evidence on one of the lines of inquiry below. Up to 2 more may be anything, photos included.
3. The key items cover at least 2 lines of inquiry.
4. At least one item ties the suspect to the night (C001: E04, E13, E14, E05 or E16).
5. Culprit, motive, weapon and location all correct.

| Line of inquiry | C001 evidence |
| --- | --- |
| Physical and blood | E02, E05, E06, E11, E14, E16 |
| Timeline and movements | E04, E12, E13 |
| Financial motive | E03, E08, E09, E15 |
| Staged entry | E01, E10 |
| Supporting (not key, never held against the report) | E07 |

The first version needed 3 to 6 items with nothing off-topic and 3 lines covered. Players with the right answer kept being returned, so it was loosened to the rule above on Oct 22, 2026.

When accepted, the case-solved sequence plays: the agency's acceptance, a reconstruction of the night in stages, Bennett's closing call, and the service record (case closed, rank, awards). A replay starts a clean file and keeps the credit.

## Art pipeline and scene hotspots

All art is painted noir: gouache and oil, 1980s paperback-cover feel, warm lamplight on blue-black shadow, and no legible text anywhere. The shared style line and every subject live in `art/manifest.json`; each prompt is style + kind + subject.

| Kind | Size | Background | C001 examples |
| --- | --- | --- | --- |
| Scene (background) | 1536x1024, imported at 1920x1080 | Opaque, empty surfaces left clear | Office, living room, kitchen, diner, apartment |
| Portrait | 1024x1536 | Opaque | One per person |
| Figure | 1024x1536 | Transparent | Margaret, Daniel, Robert, Patricia, Rosa standing in scenes |
| Object (sprite) | 1024x1024 | Transparent | Chair, glass, ledger, coat rack with and without jacket |
| Evidence close-up | 1024x1024 | Opaque | E01 to E15 |
| Map | 1600x1200 | Opaque | Painted Los Angeles map with pins |
| Travel | strips and panoramas | Transparent car, opaque roads | Drive and walk scenes between locations |

**Workflow:** make the image (Perplexity), save it to `art/inbox/` with the exact id as its name, run `node scripts/import-art.mjs`. It cuts out transparent images, trims, converts to WebP and records it in `src/art/generated.json`. Anything not yet painted shows a placeholder.

**Hotspots** are rectangles in percent of the 16:9 scene. After a painting lands, fit every hotspot to it and check with outlines drawn over the scene. Objects that change (the jacket gone) are overlays with conditions, not separate paintings. On phones, wide scenes pan: players swipe to look around.

## Audio

All sound comes from ElevenLabs through the server; the key never reaches the browser. Every generated clip is stored and reused, so each line is paid for once.

| Sound | How it is made | Notes |
| --- | --- | --- |
| Character voices | Text to speech, one fixed voice per person | Interviews, police tapes, calls; subtitles always shown |
| Evidence narration | Text to speech, narrator voice | Plays only when the player presses Play |
| Push-to-talk | Speech to text (Scribe) | Hold the button or Space; the key needs the Speech to Text permission |
| Case music | Eleven Music, 2.5 minute noir theme | Made once from Admin; needs a paid plan and the Music permission |
| Room sound | Sound effects, 30 second seamless loops | One per scene type; Sound Effects permission |
| Travel, stamp, camera | Synthesized in the browser | No cost |

- Music and room sound are made from Admin, Music and room sound: press Make all missing. Prompts live in `soundtrack.ts`; edit one and press Make again to replace it.
- Room sound crossfades between scenes and goes quiet during travel.
- Music and room sound drop to half while anyone speaks: interviews, calls, tapes, narration, the ending.
- Volumes follow Agency Settings (Music, Sound effects, Dialogue). The game menu has a Music on/off switch.
- Browsers only allow sound after the first tap or click.

## Platform features every case gets

These are built once and work for any new case with no extra work.

- **Joint investigations.** The signed-in host opens a lobby and shows a QR code; up to 5 others scan it, type a name (no account) and wait. Start takes everyone into the host's game on their own device, and every screen picks up the others' progress within seconds. Question limits are shared. Everyone can edit the report; only the host files it. Built for the same room, so no voice chat.
- **Spending ledger.** Every paid call (Claude tokens, voice characters, transcription seconds) is recorded against the case, playthrough and person, including what reuse saved. Admin shows totals, cost per playthrough, cost per completed case, and a suggested price at a 70% margin. Rates are editable.
- **Admin page.** The Admin link sits at the bottom of the navigation (desktop and phone menu), behind a password stored only as a hash, open for 12 hours per device.
- **Accounts.** Sign-up is open to everyone. Each player has a service record, rank and awards.
- **Site wording.** The agency is fictional. Cases are drawn from real investigations with names, places, dates and details changed; no character is a real person; solutions to unsolved cases are dramatized reconstructions.
- **Controls.** No bottom bar: painted Map, Notebook and Evidence buttons sit in the bottom-left corner of every scene, the murder board is on the office wall, and Menu (with volume sliders) is in the top bar.
- **Phone play.** Swipe to look around wide scenes, the board tray at the bottom, interviews full screen. Clicking or tapping off a window closes it (phone interviews use End Interview).

## Testing and deployment

A case is not done until the automated checks pass and someone has played it start to finish on the live site.

1. **Case checker:** `npm run check:case -- CXXX`. It plays a full reference run to a closed case and verifies, among other things: every evidence item has exactly one way to be found, events resolve in any order with the same facts, nothing secret reaches the browser, question limits hold, and accepted and returned reports behave.
2. **Question matching:** `npx tsx --conditions=react-server scripts/match-eval.ts` (C001: 51 of 51 phrasings matched).
3. **Browser checks** against a stand-in for Supabase, Claude and ElevenLabs, at desktop and phone sizes, with screenshots.
4. **Deploy:** push to `main` on GitHub; Vercel builds and publishes blackwoodinvestigation.com automatically. Ian's local folder is kept in step after each push.
5. **Database changes** are SQL migrations in `supabase/migrations/`, applied to Supabase before the code that needs them.
6. **Play it live,** ideally with someone new. C001's real players found the unreadable documents, the stuck windows, the strict report and the unused board.

## Lessons from C001, and parked ideas

Do these from day one on the next case:

- [ ] Write every document's full text before testing. Placeholder text left players with nothing to reason from.
- [ ] Paint every scene before playtesting; a missing living room showed the plain stand-in drawing.
- [ ] Tie evidence handovers to knowledge facts, so any phrasing gets the item (Rosa's ticket was only reachable by one exact question at first).
- [ ] Give each deduction several connection pairs, and keep the report standard at 4 key + 2 supporting.
- [ ] Expect players to ignore the board; the board hint covers it, but early scenes can also point at the board.
- [ ] Mark the crime scene on the map (`mapTag: "CRIME SCENE"`); players skipped Eleanor's house without it.
- [ ] Make key forensic results something the player sends for (a lab test with a countdown), not a report waiting on the desk at the start.
- [ ] Keep lab results to narrowing a field, so the case needs more than one line of proof.
- [ ] Check the calendar and every time in the timeline before writing dialogue.

Parked for later:

- **Character animation:** painted poses that change with mood, plus mouth shapes and expressions while talking. Pilot on Daniel first. Full plan in the project doc "Character animation plan".
- **Paid cases and difficulty:** a hardcore mode with paid questions exists in the engine but is switched off.
- **Custom sign-up email** (Resend) so verification emails arrive faster.
- **Miss log:** record questions that got no good answer, to write new scripted answers.
