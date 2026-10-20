# Blackwood Investigations: Phase 1

The agency website and detective portal for Blackwood Investigations, a fictional private investigation agency. Phase 1 covers the public site, Supabase authentication, onboarding, Agency Headquarters, the case catalog and account management. Investigation gameplay is Phase 2.

Built with Next.js 16 (App Router, Cache Components), Tailwind CSS 4 and Supabase.

## Setup

1. **Install**

   ```bash
   npm install
   ```

2. **Environment.** Copy `.env.example` to `.env.local` and add your Supabase project URL and publishable (or anon) key.

3. **Database.** Run both files in `supabase/migrations`, in order, in the Supabase SQL editor (or `supabase db push` if the project is linked):

   - `20261020000000_agency_platform.sql`: tables, RLS policies, triggers, joint investigation functions and the `avatars` storage bucket
   - `20261020000100_seed_catalog.sql`: pricing tiers, ranks, Case 001, sealed preview files, commendations and agency notices

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

## Phase 1 boundaries

What still needs backend work, and what the UI does meanwhile:

- **Gameplay:** Case 001 is Coming Soon. `/play/:caseId` explains that the investigation desk is not open.
- **Payments:** paid cases would show a disabled Purchase button. No payment code exists yet; entitlements must be granted server-side.
- **Joint investigations:** opening, joining by code, ready status and leaving work against the database. No case is eligible until one is available. Rosters do not update live.
- **Notification emails:** preferences are saved, but nothing sends email yet.
- **Audio settings:** saved now, used by the Phase 2 engine.
- **Legal pages:** marked as drafts that need legal review.
