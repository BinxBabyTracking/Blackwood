import type { Metadata } from "next";
import { Suspense } from "react";
import { PageIntro } from "@/components/page-intro";
import { SetupNotice } from "@/components/setup-notice";
import { Steps } from "@/components/steps";
import { ButtonLink, Skeleton } from "@/components/ui";
import { getPricingTiers } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "How It Works" };

const DETAILS = [
  {
    title: "Your personnel file",
    body: "Joining creates a detective profile with a display name, an optional photo and your preferred way of working. Every recruit starts as a Probationary Investigator.",
  },
  {
    title: "Solo or joint",
    body: "Most assignments can be worked alone. Many also support joint investigations of up to six investigators, coordinated with an invitation code.",
  },
  {
    title: "Your service record",
    body: "Closed cases, hours on the job and the quality of your findings build your service record. Rank and commendations follow from what you actually achieve.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <PageIntro title="How It Works" kicker="Briefing for new recruits">
        Blackwood cases are self-contained investigations. You review the file, work the evidence and submit a finding.
      </PageIntro>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-8">
        <Steps />
        <div className="mt-16 grid gap-10 md:grid-cols-3">
          {DETAILS.map((d) => (
            <div key={d.title}>
              <h2 className="font-serif text-xl">{d.title}</h2>
              <p className="mt-2 text-smoke">{d.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-rule bg-ink-2" aria-labelledby="tiers">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-8">
          <h2 id="tiers" className="font-display text-4xl">
            Case lengths and pricing
          </h2>
          <p className="mt-3 max-w-[60ch] text-smoke">
            Cases are grouped by how long they take to investigate. The introductory case is free. Pricing is preliminary
            and purchasing is not open yet.
          </p>
          <Suspense fallback={<Skeleton className="mt-8 h-72" />}>
            <TierTable />
          </Suspense>
          <div className="mt-12">
            <ButtonLink href="/join">Join the Agency</ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}

async function TierTable() {
  const tiers = await getPricingTiers();
  if (!tiers.ok) return <div className="mt-8"><SetupNotice reason={tiers.reason} message={tiers.message} /></div>;
  return (
    <div className="mt-8 overflow-x-auto">
      <table className="w-full min-w-[28rem] border-collapse text-left">
        <caption className="sr-only">Case tiers by length and price</caption>
        <thead>
          <tr className="border-b border-rule text-sm text-smoke">
            <th scope="col" className="py-3 pr-6 font-normal">Tier</th>
            <th scope="col" className="py-3 pr-6 font-normal">Length</th>
            <th scope="col" className="py-3 text-right font-normal">Price</th>
          </tr>
        </thead>
        <tbody>
          {tiers.data.map((t) => (
            <tr key={t.id} className="border-b border-rule/70">
              <th scope="row" className="py-4 pr-6 font-serif text-lg font-normal text-paper">{t.label}</th>
              <td className="py-4 pr-6 text-smoke">{t.duration_label}</td>
              <td className="py-4 text-right font-mono text-paper">{formatPrice(t)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
