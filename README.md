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
