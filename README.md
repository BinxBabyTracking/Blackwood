# Blackwood Investigations

The agency website, detective portal and investigation engine for Blackwood Investigations, a fictional private investigation agency. Phase 1 built the public site, authentication, onboarding, Agency Headquarters, the case catalog and account management. Phase 2 adds the investigation engine and the first playable case, C001 The Whitmore File.

Built with Next.js 16 (App Router, Cache Components), Tailwind CSS 4 and Supabase.

## Setup

1. **Install**

   ```bash
   npm install
   ```

2. **Environment.** Copy `.env.example` to `.env.local` and add your Supabase project URL, publishable key and **secret key** (`SUPABASE_SECRET_KEY`, from Project Settings > API Keys). The secret key is used only on the server, to save investigations and update service records; never expose it to the browser.

3. **Database.** Run both files in `supabase/migrations`, in order, in the Supabase SQL editor (or `supabase db push` if the project is linked):

   - `20261020000000_agency_platform.sql`: tables, RLS policies, triggers, joint investigation functions and the `avatars` storage bucket
   - `20261020000100_seed_catalog.sql`: pricing tiers, ranks, Case 001, sealed preview files, commendations and agency notices
   - `20261020000200_open_case_c001.sql`: renames C001 to The Whitmore File, opens it for play and sets the first rank promotion
   - later files in the folder add hardening, the narration cache and case resolution (`20261021000000_case_resolution.sql`); run them all, in order

4. **Auth settings** (Supabase dashboard, Authentication):

   - URL Configuration: set **Site URL** to your app URL and add `http://localhost:3000/auth/confirm` (plus your production `/auth/confirm`) to **Redirect URLs**.
   - Email confirmation can stay on (users confirm, then land on onboarding) or off (users go straight to onboarding after sign-up).

5. **Run**

   ```bash
   npm run dev
   ```

Without the environment variables the site still runs; pages that need data show a "Backend setup required" notice instead of pretending to work.

## Routes

| Public | Portal (signed in) |
| --- | --- |
| `/` Home | `/agency` Agency Headquarters |
| `/about` | `/agency/assignments` Available Assignments (+ `/agency/assignments/:caseId`) |
| `/how-it-works` | `/agency/cases` My Case Files |
| `/investigations`, `/investigations/:caseId` | `/agency/joint-investigations` |
| `/join`, `/login`, `/forgot-password`, `/reset-password` | `/agency/service-record` |
| `/contact`, `/privacy`, `/terms` | `/agency/personnel`, `/agency/settings` |
| | `/agency/onboarding` (first sign-in) |
| | `/play/:caseId` placeholder for Phase 2 |

`src/proxy.ts` refreshes the Supabase session and sends signed-out visitors from `/agency` and `/play` to sign in.

## Where things live

- `src/lib/catalog.ts`: cached, cookie-free reads of public catalog data (cases, tiers, ranks, commendations, notices)
- `src/lib/investigator.ts`: per-request data access for the signed-in investigator
- `src/lib/assignment.ts`: the rule that decides which case action to show (Coming Soon, Accept, Resume, Purchase)
- `src/app/actions/*`: server actions for auth, profile, settings and joint investigations
- `src/components/case-cover.tsx`: drawn placeholder case art; set `cases.cover_image_url` to replace it

## Data and security

All catalog content is data. Change prices in `pricing_tiers`, open a case by setting `cases.status = 'available'`, post notices in `agency_notices`, and set rank criteria in `agency_ranks`.

Row Level Security is enabled on every table:

- Catalog tables are public-read; only the service role writes them.
- Players read only their own profile, service record, settings, entitlements, saves and commendations. They can update their profile (not rank) and settings.
- Service records, entitlements, saves and commendations have no client write policies. Phase 2 writes them server-side with the service role.
- Joint investigation membership changes only through `open_joint_investigation`, `join_joint_investigation`, `set_investigator_ready` and `leave_joint_investigation`, which check case status, entitlement and the six-seat limit.

## Investigation engine (Phase 2)

The game runs at `/play/:caseId` as a full-screen interface outside the portal layout.

- `src/game/engine/`: the engine. `types.ts` defines every game entity; `rules.ts` evaluates conditions and applies effects; `engine.ts` reduces player actions into new state and projects the view the browser is allowed to see.
- `src/cases/C001/`: the case, as configuration only. `characters.ts` (people and dialogue), `locations.ts` (scenes and hotspots), `evidence.ts` (E01 to E15), `story.ts` (case file, police statements, calls, deliveries, reactive events, objectives), `solution.ts` (deduction rules and the solution, server-only) and `assets.ts` (the asset manifest).
- `src/game/registry.ts`: loads cases by id. A new case is a new folder plus one line here.
- `src/game/persistence.ts`: saves, entitlements, sessions and service records via the server-side secret key.
- `src/app/actions/game.ts`: the single server action every gameplay click goes through.
- `src/game/ui/`: the player-facing components, all driven by case data:
  - `investigation-shell.tsx` (InvestigationShell): the full-screen frame, save status, HUD and layer routing
  - `exploration-scene.tsx` (ExplorationScene, SceneHotspot): the 16:9 scene and its hotspots
  - `evidence-inspection.tsx` (EvidenceInspection): close-up view with zoom, collect and pin
  - `evidence-inventory.tsx` (EvidenceInventory): collected evidence with location and status
  - `detective-notebook.tsx` (DetectiveNotebook), `travel-map.tsx` (TravelMap), `board.tsx` (MurderBoard), and `panels.tsx` for the dossier, telephone, interviews, conclusion and closure

To add evidence to a scene: define it in `evidence.ts`, add an `inspect` hotspot with `evidence: "E.."` to the location in `locations.ts`, and add its image to `assets.ts`. Nothing in the components refers to a specific evidence item. Each collected item records where, in which scene state, and how it was found (`discoveries` in the save).

**Restricted content stays on the server.** Case files import `server-only`, and the browser receives only a projection: no solution, no deduction rules, no unrevealed dialogue or character details. Connections on the murder board are judged on the server; a wrong one is simply left as string.

**Assets.** Every image and sound is referenced through `src/cases/C001/assets.ts` and lives in `public/cases/C001/{locations,characters,evidence,audio}`. To install final art, replace a file with the same name, or point the manifest key at a new file, then adjust hotspot rectangles in `locations.ts` to match. Audio entries are `null` until recordings exist; the game shows transcripts and no play control until then. `npm run assets:placeholders` regenerates the placeholder set.

**Evidence narration (ElevenLabs).** Every evidence view has a Read aloud control when narration is switched on (game Menu). Audio is generated only when the player presses Play, by `src/app/api/narration/route.ts` on the server, using `ELEVENLABS_API_KEY` (and optionally `ELEVENLABS_VOICE_ID`) from `.env.local`. The key never reaches the browser. The route only narrates evidence the player has found, caches each recording in the private Supabase Storage bucket `narration` (migration `20261020000400`), and plays one narration at a time at the player's master and dialogue volume. Without a key, or if generation fails, the player sees a short message and everything else keeps working.

**Interviews (Step 6).** Every person is interviewed in a full-screen interview room (`src/game/ui/interview-screen.tsx`): portrait, name, location or telephone line, manner, subtitles, voice playback, questions grouped by topic, the full transcript, Present Evidence and End Interview. Det. Bennett is interviewed by telephone from the office phone.

- *Dialogue entries* (`characters.ts`, type `DialogueQuestion`) carry an id, character, topic, the question, the reply, optional `requiresEvidence`, `requiresDeductions`, `requiresFlags` or a general `requires` condition, `unlocks` (follow-up questions that stay hidden until this one is asked), `reveals` (the important statement recorded in the notebook), `variants` (deterministic alternative answers), an optional voice override and `repeatable`. Asked entries are the completed state.
- *Manner* (`demeanor` on a character) changes deterministically with progress, for example Daniel goes from Composed to Guarded, Defensive and finally Declining to answer. Each change writes a stage note into the transcript once.
- *Contradictions* (`contradictions` in `characters.ts`) are recorded only when the evidence that supports them has been found, and are worded neutrally. Nobody is called a liar.
- The browser only ever receives the questions that are open right now. Requirements, follow-up links, variants and character knowledge stay on the server.
- *Notebook.* The Interviews tab lists each person with status, manner, inconsistencies established, important statements and the full transcript.
- *Saved* in the investigation state: asked questions, unlocked follow-ups, transcripts, presented evidence, contradictions, each character's manner and the voices setting. Older saves load unchanged.
- *Future free-form questions.* Each character has a `knowledge` list of canonical facts. A future AI fallback should be given only that list, the character's transcript so far and the currently open topics (all available server-side in `engine.ts`), and must answer only from them.

**Character voices (ElevenLabs).** Each character has one fixed ElevenLabs library voice (Margaret: Matilda, Daniel: Eric, Robert: Bill, Patricia: Sarah, Bennett: Brian, Rosa: Jessica), set in `characters.ts` and overridable with `ELEVENLABS_VOICE_<ID>`. `src/app/api/voice/route.ts` speaks a line only if it is in the player's own transcript, an available police tape, or an answered call, and speaks exactly that text, so audio always matches the subtitle. Lines are generated on first play and cached in the `narration` bucket for every player; nothing is generated when the investigation loads. One voice plays at a time across narration, interviews, tapes and calls (`src/game/ui/audio-bus.ts`). Character voices can be switched off in the game Menu or inside an interview.

**Police statements.** Four recorded statements in the office (the tape recorder), each with name, date and time, interviewing officer, tape number, recording status and a transcript that highlights as the tape plays in the speakers' voices.

**Reactive events (Step 7).** Story events are case data (`events` in `src/cases/C001/story.ts`, type `ReactiveEventDef`) run by a deterministic engine in `src/game/engine/rules.ts`. Each event has an id, case id, title, character, a trigger condition (with `all`, `any` and `not`), required flags, evidence, deductions and interviews, an activation condition (where and when it is presented), a completion condition, effects for each stage, follow-up questions it unlocks, the evidence it makes available, and its notebook entry. The engine re-checks every event after every action (evidence collected, deductions, questions asked, visits, evidence shown, calls, deliveries) and moves each one at most one way: locked, available, active, completed. Nothing advances on a timer. State lives in the existing save (`eventStates`, plus `pendingCalls`, `answeredCalls`, `pendingDeliveries`, `openedDeliveries`, `env` and flags); older saves are upgraded on load.

- *RE01 Margaret's telephone call.* Available once Margaret has described the evening and the departures and the investigator has the guests' timeline (Bennett's notes, the tapes, or the timeline deduction). The office telephone rings on the next visit, with a quiet cue and a synthesized bell (master and sound-effects volume). It never rings over an interview, a document or an inspection. "Let it ring" defers it until the next visit. Answering plays Margaret's call in her voice, completes the event, records her statement, adds the call to her transcript and unlocks her sedan questions.
- *RE02 Daniel's apartment changes.* Available once the investigator has interviewed Daniel at home and established an injury or timeline deduction; the apartment changes to state B while they are elsewhere. Only an investigator who looked at the coat rack earlier notices the jacket is gone (`saw_jacket`, `jacket_missing`). Det. Bennett will search the building's trash if asked, for either that reason or Margaret's description of the windbreaker. The jacket arrives as a sealed evidence bag on the office desk; opening it completes the event and makes E05 collectable.
- *RE03 Patricia's envelope.* Available once Patricia has been interviewed and asked about money and the investigator has the ledger or the financial deduction. A sealed manila envelope appears on the desk on the next visit. It can be left unopened. Opening it shows Patricia's note (which the narrator can read aloud) and E15; collecting E15 completes the event.
- The events are independent and can happen in any order; the office can show a ringing telephone, an envelope and an evidence bag at the same time. `npm run check:case` plays all three orders the brief lists and checks they end with the same facts.
- *World changes* are configured per hotspot: `visible` (objects appear and disappear), `sprite` (objects drawn over the scene, changing with state), `attention` (a subtle cue), `textAfter` (updated descriptions) and conditional effects (`{ when, then }`), plus location backgrounds that vary with environment state.
- *Notebook.* The Developments tab lists each event the player has encountered, with its status, the person involved, what has been learned, the evidence found, the call transcript or enclosed note, and a link to the interview transcript. Events the player has not encountered, and anything not yet learned, are not shown.

**Final report and case resolution (Step 8).** Once the investigation has substance (the case file read, six pieces of evidence, at least one guest interviewed; `reportAvailable` in `story.ts`), a final report folder appears on the office desk beside the typewriter.

- *The report* (`src/game/ui/final-report.tsx`) is a typed agency form: letterhead, case details, sections A to D (suspect, motive, weapon, location) and section E (three to six pieces of collected evidence, each of which can be examined from the report). Drafts save to the investigation, survive a refresh, and are saved automatically on leaving. A review page and a confirmation come before submission.
- *Evaluation* (`src/game/engine/evaluation.ts`) is deterministic and runs only on the server. It checks the report is complete and cites only evidence collected in this investigation, then judges the answers and the evidence against `solution.standard` in `solution.ts`: the attached items must cover at least `minLines` independent lines of inquiry (physical, timeline, financial, staged entry), include something that links the named person to the night, and leave no question open. Many different evidence sets pass; a right guess with unrelated evidence does not.
- *A returned report* gets the agency's standard response and a reviewer's note that never says which answer is wrong. The player keeps everything and can revise and resubmit any number of times; each submission is kept in the save.
- *An accepted report* closes the case and plays the conclusion (`case-resolution.tsx`): the acceptance memo, six reconstruction pages read by the narrator, Det. Bennett's response in his voice (he takes it to the District Attorney; no conviction is claimed), and the CASE CLOSED card. The reconstruction and Bennett's lines are only sent to the browser, or to ElevenLabs, after the server has closed the case.
- *Service record.* Closing runs one database transaction, `record_case_completion` (migration `20261021000000`). It closes the session, files the report on it, records the first completion of the case, updates Cases Closed, accuracy and hours, awards commendations and checks rank thresholds (now defined for every grade in `agency_ranks`). It is idempotent: repeating it changes nothing, and closing a replay adds time but never a second closed case or a duplicate commendation. If a report is accepted but the record could not be written, it is finished the next time the case is opened.
- *Afterwards* the player can reread the filed report, review the evidence, open the service record, or start a replay, which is a new investigation; the closed one stays on file under Closed Cases in My Case Files, with its report at `/agency/cases/<investigation id>`.

**Timeline.** The canonical C001 timeline, and the contradictions found and fixed in Step 6, are in `docs/C001-timeline.md`.

**Evidence locations.** Office: E11, E12 (case file). Living room: E02, E03, E07, E08, E09. Kitchen: E01, E06, E10. Diner: E04, E13. Daniel's apartment: E14. E05 arrives only after the apartment changes and Det. Bennett recovers the jacket (RE02); E15 only in Patricia's envelope (RE03). Document evidence (E03, E04, E09, E11, E12, E13, E15) uses placeholder layouts marked "Text pending" until canonical text is written.

**Checking a case.** `npm run check:case -- C001` validates every reference in the case (assets, evidence, questions, flags, deductions) and plays the case start to finish with the real engine, including the reactive events, the board deductions, and wrong and right conclusions.

**Draft content.** The C001 timeline, statements, dialogue and forensic details are a consistent working draft built around the solution in the brief. They are marked as draft in the game and should be reviewed before release.

## Current boundaries

What still needs work, and what the UI does meanwhile:

- **Payments:** paid cases would show a disabled Purchase button. No payment code exists yet; entitlements must be granted server-side. The free C001 entitlement is granted when the player accepts the assignment.
- **Joint investigations:** opening, joining by code, ready status and leaving work against the database, but play itself is solo. Rosters do not update live.
- **AI interviews:** not connected. Dialogue is authored and data-driven; a free-form fallback can be added behind the conversation engine later without changing case facts.
- **Notification emails:** preferences are saved, but nothing sends email yet.
- **Audio:** volume settings are applied to location ambience once recordings are added to the asset manifest.
- **Legal pages:** marked as drafts that need legal review.
