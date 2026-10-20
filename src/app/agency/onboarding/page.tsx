import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { LoadingFile } from "@/components/ui";
import { Wordmark } from "@/components/wordmark";
import { getRanks } from "@/lib/catalog";
import { requireInvestigator } from "@/lib/investigator";
import { OnboardingForm } from "./onboarding-form";

export const metadata: Metadata = { title: "Agency Onboarding" };

export default function OnboardingPage() {
  return (
    <div className="min-h-dvh bg-[radial-gradient(80%_60%_at_80%_0%,#232d37_0%,#12171d_60%)]">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-4 py-6 sm:px-8">
        <Wordmark href="/" />
        <form action="/auth/signout" method="post">
          <button type="submit" className="text-sm text-smoke hover:text-paper">
            Sign Out
          </button>
        </form>
      </header>
      <main id="main" className="mx-auto max-w-3xl px-4 pb-20 pt-6 sm:px-8">
        <Suspense fallback={<LoadingFile label="Preparing your personnel file" />}>
          <Onboarding />
        </Suspense>
      </main>
    </div>
  );
}

async function Onboarding() {
  const me = await requireInvestigator(true);
  if (me.profile.onboarded_at) redirect("/agency");
  const ranks = await getRanks();
  const startingRank = ranks.ok ? ranks.data[0]?.title ?? "Probationary Investigator" : "Probationary Investigator";

  return (
    <>
      <p className="font-serif italic text-brass">New investigator intake</p>
      <h1 className="mt-3 font-display text-5xl leading-tight">Welcome to the agency.</h1>
      <p className="mt-4 max-w-[58ch] text-lg text-smoke">
        Before you report to headquarters, set up your personnel file. You can change any of this later.
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_15rem]">
        <OnboardingForm />
        <aside className="h-fit rounded-[var(--radius-file)] border border-rule bg-ink-2 p-5 text-sm">
          <p className="text-smoke">Assigned on intake</p>
          <dl className="mt-4 space-y-3">
            <div>
              <dt className="text-xs text-smoke">Rank</dt>
              <dd className="font-serif text-lg text-brass">{startingRank}</dd>
            </div>
            <div>
              <dt className="text-xs text-smoke">Cases Solved</dt>
              <dd>0</dd>
            </div>
            <div>
              <dt className="text-xs text-smoke">Active Investigations</dt>
              <dd>0</dd>
            </div>
            <div>
              <dt className="text-xs text-smoke">Service Record</dt>
              <dd>Empty</dd>
            </div>
          </dl>
        </aside>
      </div>
    </>
  );
}
