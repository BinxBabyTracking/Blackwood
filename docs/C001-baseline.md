# C001 Baseline: How a Blackwood Case Is Built

Oct 22, 2026 · Ian. Live, editable version: https://claude.ai/artifact/AJo9xAJ6NXH32fsxx7GAXK (this file is a copy kept with the project so every new chat can read it).

## Purpose

C001 (The Whitmore File) is the reference case: every new case copies its structure, rules and checklist. This document records what C001 contains, how each system works, and what a new case must supply to plug into it.

The game engine is generic and shared. A case is a folder of data (`src/cases/CXXX/`) plus its art and audio. Nothing case-specific lives in the engine, so most of the work for C002 onward is writing content, not code.

Live site: [blackwoodinvestigation.com](https://www.blackwoodinvestigation.com). Code: GitHub `BinxBabyTracking/Blackwood`, deployed by Vercel on every push. Database: Supabase.

## C001 is the smallest case

C001 is the Introductory tier and free: about 1 hour solo, about 20 minutes with friends (timed with real players). It is the floor, not the template for size: later cases can run from an hour to weeks of play, and everything here scales up from it.

| Tier | Length | Price | Cases set up so far |
| --- | --- | --- | --- |
| Introductory | about 1 hour solo, 20 minutes with friends | Free | C001 |
| Tier 1 | about 1 hour | $2.99 | none yet |
| Tier 2 | 2 to 3 hours | $4.99 | C002, C003, C004, C005 |
| Tier 3 | 4 to 6 hours | $8.99 | none yet |
| Tier 4 | 8 to 12 hours | $12.99 | none yet |
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
| `soundtrack.ts` | Music and room-sound prompts for ElevenLabs | 3 themes + 7 room sounds |

All player-facing text uses American spelling (check, color, neighbor, jewelry, gray, curb). The interview AI is told to answer the same way.

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

Players pin evidence, photos and people on the board, then connect two items with string. A connection that matches a deduction reveals it; wrong connections do nothing and cost nothing. On phones the tray of items sits along the bottom with a Back button. The board is a large cork panel (twice the old width and height): zoom with the - / + buttons, a pinch or Ctrl and the wheel, and drag empty cork to move around, so big cases have room. String runs over the cards, pin to pin.

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

A report is accepted when every answer is right and the attached evidence proves each point the agency needs. The reviewer's note never says which answer is wrong and never names an item. The full rules, and how each case sets its numbers, are in **Final Report Standard** (`docs/report-standard.md`, and the project doc of the same name).

The report form (BI-7) asks who, why, how and where, each with an "Unknown" option. Its evidence section opens with **What the agency needs**: the points the report must show, the key evidence required, the most it can carry, and how much of the case's evidence the player has found ("13 of 16"). The player files each piece of evidence under the point they think it proves; a point shows as filled, never as right or wrong. Anything else goes under Supporting. Drafts save as the player goes; in joint play everyone edits the draft and only the host files it.

**C001's points** (`claims` in `solution.ts`):

| Point the report must show | Evidence that proves it |
| --- | --- |
| Places the person you name at the scene, or ties them to that night | E02, E05, E11, E14, E16 |
| Shows why they did it | E03, E08, E09, E15 |
| Shows how it was done or how it was covered up | E01, E05, E06, E07, E10 |
| Tests the story they told: an alibi, a timeline or a statement | E04, E12, E13 |

At least 4 key items, at most 6 attached. At least one item must also tie the suspect to the night (E04, E13, E14, E05 or E16).

**What a returned report says**, in the order the reviewer checks:

1. An answer left as Unknown.
2. A point with no proof filed under it, in one of three ways: the proof is attached but filed under another point; the proof is among the evidence already collected; or nothing found so far proves it, so key evidence is still out there. From the second return on, that last note adds the point's hint, which says where to look without naming anything.
3. Too few key items, saying whether enough is already in hand or still to be found.
4. Too few independent lines of inquiry, too much unrelated evidence, or nothing tying the suspect to the night.
5. The answers themselves don't hold together.

Each returned report costs 50 points on the leaderboard, so the hints are never free.

When accepted, the case-solved sequence plays: the agency's acceptance, a reconstruction of the night in stages, Bennett's closing call, and the service record (case closed, rank, awards). A replay starts a clean file and keeps the credit.

## Art pipeline and scene hotspots


**Making art from Admin.** Every image in `art/manifest.json` has a row in its case's "Artwork" section on the Admin page: the picture players see, its prompt (editable; the edit is saved in Supabase, the manifest is untouched), **Generate** (OpenAI's image model at the chosen quality: Draft, Standard or Best; see the Artwork Studio doc), **Upload my own**, and every version made. A new version waits for review until you choose it ("Use v3"); "Use original" goes back to the committed painting. "Generate all missing" works through a case one image at a time and can make missing images live straight away. People and objects are cut out of their backdrop and every kind is sized for the game, as `scripts/import-art.mjs` does. Versions are kept in the private "art" bucket, served at `/art/gen/<id>-<version>.webp`, and a live version replaces the committed painting for every player within about 20 seconds (`refreshArt` in `src/game/registry.ts` rebuilds each case's assets; a new case must add its `buildAssets` there). Case covers load through `/art/live/<id>` and update the same way. Other site and travel pictures are read from the committed list, so an Admin-made version shows only once it is committed to `public/art`. The OpenAI key is the `OPENAI_API_KEY` server setting; until that is set, a temporary key saved in site settings is used.
All art is painted noir: gouache and oil, 1980s paperback-cover feel, warm lamplight on blue-black shadow. When text matters to the picture (a headline, a sign, a label, a name on a door), the prompt spells out the exact words, quoted and line by line, and says they must be printed exactly as written; the generator gets short text right, and a retry fixes the odd misspelling. Everything else (body copy, ledgers, letters) stays soft and unreadable, and the real words live in the evidence text. The shared style line and every subject live in `art/manifest.json`; each prompt is style + kind + subject.

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
| Case file narration | Text to speech, narrator voice, page by page | Reads itself the first time the file opens (voices on), then on request. Each page has a `spoken` version written for the ear: times, dates and case numbers in words |
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

- **Joint investigations.** The signed-in host chooses "Investigate as a Team" beside Accept Assignment (or Resume Investigation) on the case page, which opens a lobby at `/agency/joint-investigations` showing a QR code (choosing it again returns to the open lobby instead of replacing it; there is no sidebar entry); up to 5 others scan it, type a name (no account) and wait. Start takes everyone into the host's game on their own device, and every screen picks up the others' progress within seconds. Question limits are shared. Everyone can edit the report; only the host files it. Built for the same room, so no voice chat. Every case is listed for 1 to 6 investigators (`min_investigators` 1, `max_investigators` 6 on its `cases` row). A strictly multiplayer case, when one is built, will be 4 to 10, which also means raising `MAX_PARTY` in `src/lib/party.ts`.
- **Spending ledger.** Every paid call (Claude tokens, voice characters, transcription seconds) is recorded against the case, playthrough and person, including what reuse saved. Admin shows totals, cost per playthrough, cost per completed case, and a suggested price at a 70% margin. Rates are editable.
- **Admin page.** The Admin link sits at the bottom of the navigation (desktop and phone menu), behind a password stored only as a hash, open for 12 hours per device.
- **Accounts.** Sign-up is open to everyone. Each player has a service record, rank and awards.
- **Site wording.** The agency is fictional. Cases are drawn from real investigations with names, places, dates and details changed; no character is a real person; solutions to unsolved cases are dramatized reconstructions.
- **Controls.** No bottom bar: painted Map, Notebook and Evidence buttons sit in the bottom-left corner of each scene (in the office only Evidence, since the map and notebook are in the room), the murder board is on the office wall, and Menu (with volume sliders) is in the top bar.
- **Player feedback.** When a case closes, the closing screen asks for a review: 1 to 5 stars, difficulty (Too easy, About right, Too hard), where they got stuck and anything else, or Skip. Anyone who skipped can leave one later from Leave a review on the closed case in My Case Files. Send feedback in the game Menu takes a note at any time and attaches the location, what was open, evidence count and the last few lines of the most recent interview. Admin shows each case's average rating and difficulty split, then every review and report, newest first, with that context. Feedback is private and never shown publicly. Use it to tune difficulty and time estimates for each new case.
- **Leaderboards.** Each case has its own boards, Solo and With friends, opened from the case card in Available Assignments and from closed cases in My Case Files. Only a player's first solve of a case counts. The Investigator Score starts at 1,000 and is measured against the case's own length, so long cases score on the same scale as short ones: par is the case's estimated minutes (`est_minutes` on its `cases` row) and half that many questions. Time and questions (any interview or call, the whole table's for a group) each cost up to 400 points, reached at three times par; each report sent back costs 50, up to 200. Boards: Top score, Fastest solve, Sharpest interviewer (fewest questions), First try. The closing screen shows the score, what it cost and where it places, then asks to add a name (or the group's name, set by the host in the lobby). The notebook shows a running count of questions asked. Players can remove their own name; Admin can remove any entry. Scoring weights live in `src/lib/leaderboard.ts`.
- **Name screening.** Every name other players can see (display names, guest names, group names, leaderboard names) is checked when entered: a word check that sees through look-alike characters, spacing, repeated letters and sound-alike spellings, then a quick Claude check for names that are only rude read aloud (Mike Hunt, Ben Dover). Refused names get "That name isn't allowed." Lists live in `src/lib/moderation.ts`; `npx tsx --conditions=react-server scripts/name-eval.ts` runs the test names. Admin has a Test a name box.
- **Phone play.** The first time a case opens on a phone held upright, a card with a swiping hand says to swipe left and right to look around and tap anything that glows; the first swipe dismisses it (remembered per case). On touch screens every tappable object glows softly along its outline (other spots get a soft ring), fainter once examined. Swipe to look around wide scenes, the board tray at the bottom, interviews full screen. Clicking or tapping off a window closes it (phone interviews use End Interview).

## Testing and deployment

A case is not done until the automated checks pass and someone has played it start to finish on the live site.

1. **Case checker:** `npm run check:case -- CXXX`. The general rules (references, assets, voices, house style, random play orders, photos, the board hint) run for every case. Each case also has its own reference playthrough: C001's is in `scripts/check-case.ts`, C002's in `scripts/check-case-C002.ts`; a new case adds its own file. Together they verify, among other things: every evidence item has exactly one way to be found, events resolve in the right order with the same facts, nothing secret reaches the browser, question limits hold, and accepted and returned reports behave.
2. **Question matching:** `npx tsx --conditions=react-server scripts/match-eval.ts` (C001: 51 of 51 phrasings matched).
3. **Browser checks** against a stand-in for Supabase, Claude and ElevenLabs, at desktop and phone sizes, with screenshots.
4. **Deploy:** push to `main` on GitHub; Vercel builds and publishes blackwoodinvestigation.com automatically. Ian's local folder is kept in step after each push.
5. **Database changes** are SQL migrations in `supabase/migrations/`, applied to Supabase before the code that needs them.
6. **Play it live,** ideally with someone new. C001's real players found the unreadable documents, the stuck windows, the strict report and the unused board.

## Optional case settings

Added for C002. Each is off unless a case uses it, so older cases behave exactly as before.

| Setting | Where | What it does |
| --- | --- | --- |
| `known` | a person | When they appear in the case file, people list and board (default: once the case file is read). Keeps a culprit found mid-case, or a later victim, unnamed until then. |
| `moves` | a person | Later places they can be interviewed (a suspect taken into custody). |
| `secret` | a location | Keeps it off the map, and out of the browser, until it can be visited. |
| `requires` | a report option | Keeps a choice off the report form until it holds (a suspect not found yet). |
| `mapTitle` | the case | Title of the travel map. |
| `reportHeader` | the case | The lines under the report heading (Classification, Location, Victim or Subject). |
| `phone: "mobile"` | the case | Added for C003. The investigator carries a phone: calls ring anywhere, telephone contacts and lab reports are reachable from anywhere, and a Phone button sits in the corner. |
| `phone`, `contact` | a person | In a mobile case, the person can also be called from anywhere while the condition holds; `contact` is the line under their name in the phone. |
| `texts` and the `text` effect | the case | Text messages that arrive on the phone, kept in its Messages list and the notebook. |
| `deceased` | a person | Once it holds, the person can no longer be interviewed and is listed as deceased; earlier interviews stay. |
| `status` | the case | A status line in the top bar that events can change (Active homicide, Active multiple homicide). |
| `boardSections` | the case | Labeled sections of the murder board, opened by a condition. Cards and string can cross them. |
| `multi` on a report question, `solution.answers` | the case | Any number of report questions, keyed by id; a question can take several answers. Older cases keep culprit, motive, weapon and location. |
| `reportDate`, `resolution.caller`, `standard.linkNote` | the case | The date by the report signature, who makes the closing call, and the reviewer's note when nothing ties the suspect in. |
| `theme: "medieval"`, `words` | the case | Added for C005. The case's look (an illuminated manuscript: oak, vellum, gold, Gothic headings) and its words for things: Journal, Deduction table, Sketch instead of Photo, letters and messengers instead of the telephone, who reviews the report. Defaults live in `src/game/words.ts`. |
| `speech` | the case | The interview AI's setting and speech rules (for C005: 1327, no modern words, no clock times). |
| `sequences` | the case | A timeline the player lays cards on (C005's bell timeline). Testing shows only contradictions among correctly placed cards (findings), never where a card belongs; findings can carry effects. |
| `comparisons` | the case | Two documents side by side (C005's lectern). The player picks a passage and says what differs; true finds go in the journal; completing it can give evidence or deductions. |
| the `deduce` effect | anywhere effects go | Establishes a deduction, with its journal entry and effects, from a timeline finding, a comparison or an event. |
| `chapters`, the `chapter` and `chapterDone` conditions | the case | Added for C006. A long case told in chapters. Each chapter has a title, an intro card, primary and optional objectives (shown under it in the notebook, later chapters hidden), and a checkpoint screen when its objectives are done: time, evidence, deductions and places it added, a spoiler-safe summary, the next chapter's title, Continue Investigation or Save and Exit. The checkpoint is written in the same save as the action that finished the chapter, so it can't be shown unsaved or counted twice. Each screen at the table moves on from it separately. Returning players get a Continue Investigation screen (chapter, last location, time, last played). Nothing resets between chapters. The last chapter ends with the accepted report. |

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
