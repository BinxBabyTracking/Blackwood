import Link from "next/link";
import { Suspense } from "react";
import { HeroOffice } from "@/components/hero-office";
import { FeaturedCase } from "@/components/featured-case";
import { SetupNotice } from "@/components/setup-notice";
import { Steps } from "@/components/steps";
import { ButtonLink, SectionHeading, Skeleton } from "@/components/ui";
import { getFeaturedCase } from "@/lib/catalog";

export default function HomePage() {
  return (
    <>
      <section className="relative flex min-h-[100svh] items-end overflow-hidden pb-20 pt-32 sm:items-center sm:pb-0">
        <HeroOffice />
        <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-8">
          <div className="max-w-[40rem]">
            <p className="font-serif italic text-brass">Blackwood Investigations, est. 1978</p>
            <h1 className="mt-5 font-display text-[clamp(3rem,8vw,6.25rem)] leading-[0.95] tracking-[-0.01em] text-paper">
              The Truth Doesn&rsquo;t Find Itself.
            </h1>
            <p className="mt-7 max-w-[34rem] text-lg leading-relaxed text-paper/80">
              Every investigation begins with a question. Join Blackwood Investigations, examine the evidence, interview
              witnesses, and uncover the truth behind cases that remain unsolved.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <ButtonLink href="/join">Join the Agency</ButtonLink>
              <ButtonLink href="/investigations" variant="secondary">
                View Available Cases
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-8" aria-labelledby="how">
        <div className="rule-lead mb-10" />
        <div className="grid gap-12 lg:grid-cols-[1fr_2.2fr]">
          <div>
            <h2 id="how" className="font-display text-4xl leading-tight">
              How It Works
            </h2>
            <p className="mt-3 max-w-[32ch] text-smoke">From recruit to closed case in three steps.</p>
            <Link href="/how-it-works" className="mt-6 inline-block text-sm text-brass underline-offset-4 hover:underline">
              Read the full briefing
            </Link>
          </div>
          <Steps />
        </div>
      </section>

      <section className="bg-ink-2 py-24" aria-label="Featured Investigation">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <SectionHeading
            title="Featured Investigation"
            intro="The agency's introductory file. Every new investigator starts here."
            className="mb-10"
          />
          <Suspense fallback={<Skeleton className="h-[26rem]" />}>
            <Featured />
          </Suspense>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-8" aria-labelledby="agency">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-end">
          <div>
            <h2 id="agency" className="font-display text-4xl leading-tight sm:text-5xl">
              Forty-eight years of open questions.
            </h2>
          </div>
          <div className="space-y-4 text-smoke">
            <p>
              Blackwood Investigations opened its doors in 1978 and has kept every file it ever took on. Some were
              closed. Many were not. The archive now passes to a new generation of investigators.
            </p>
            <p>
              Blackwood is a fictional agency and every case in its archive is a work of interactive fiction, written to
              be solved.
            </p>
            <Link href="/about" className="inline-block text-sm text-brass underline-offset-4 hover:underline">
              About the agency
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

async function Featured() {
  const result = await getFeaturedCase();
  if (!result.ok) return <SetupNotice reason={result.reason} message={result.message} />;
  if (!result.data) return <p className="text-smoke">No investigation is being featured right now.</p>;
  return <FeaturedCase c={result.data} href={`/investigations/${result.data.id}`} cta="View Case File" />;
}
