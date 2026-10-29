import type { Metadata } from "next";
import { Suspense } from "react";
import { FeaturedCase } from "@/components/featured-case";
import { ActiveInvestigations } from "@/components/portal/active-list";
import { Greeting } from "@/components/portal/greeting";
import { Ledger } from "@/components/portal/heading";
import { SetupNotice } from "@/components/setup-notice";
import { ButtonLink, EmptyFile, Skeleton } from "@/components/ui";
import { getCatalog, getFeaturedCase, getNotices, getRanks } from "@/lib/catalog";
import { FeaturedRotator } from "@/components/portal/featured-rotator";
import { viewerCaseStates, type ViewerCaseState } from "@/lib/viewer-cases";
import { formatDate, formatHours } from "@/lib/format";
import { getCaseFiles, getServiceRecord, requireInvestigator } from "@/lib/investigator";

export const metadata: Metadata = { title: "Agency Headquarters" };

export default function HeadquartersPage() {
  return (
    <div className="space-y-16">
      <Suspense
        fallback={
          <div className="space-y-3">
            <Skeleton className="h-12 w-96 max-w-full" />
            <Skeleton className="h-5 w-64" />
          </div>
        }
      >
        <Welcome />
      </Suspense>

      <section aria-labelledby="featured-heading">
        <h2 id="featured-heading" className="mb-5 font-serif text-xl text-smoke">
          Featured Assignment
        </h2>
        <Suspense fallback={<Skeleton className="h-[26rem]" />}>
          <Featured />
        </Suspense>
      </section>

      <Suspense fallback={<Skeleton className="h-64" />}>
        <RecordAndActive />
      </Suspense>

      <section aria-labelledby="notices-heading">
        <h2 id="notices-heading" className="mb-5 font-serif text-xl text-smoke">
          Agency Notices
        </h2>
        <Suspense fallback={<Skeleton className="h-40" />}>
          <Notices />
        </Suspense>
      </section>
    </div>
  );
}

async function Welcome() {
  const me = await requireInvestigator();
  return (
    <div>
      <Greeting name={me.profile.display_name} />
      <p className="mt-2 text-lg text-smoke">Your next assignment is waiting.</p>
    </div>
  );
}

/**
 * The featured assignment: the investigation the player is furthest along in,
 * if any is under way. Otherwise it cycles through what they can start: cases
 * they own (free, bought or early access) and haven't started, then cases on
 * sale. Falls back to the introductory case.
 */
async function Featured() {
  const me = await requireInvestigator();
  const [catalog, mine, files] = await Promise.all([
    getCatalog(),
    viewerCaseStates().catch(() => ({}) as Record<string, ViewerCaseState>),
    getCaseFiles(me.id).catch(() => []),
  ]);
  if (!catalog.ok) return <SetupNotice reason={catalog.reason} message={catalog.message} />;
  const byId = new Map(catalog.data.map((c) => [c.id, c]));

  const underWay = files
    .filter((f) => (f.status === "active" || f.status === "forming") && f.mode === "solo" && byId.has(f.case_id))
    .sort((a, b) => (b.progress ?? 0) - (a.progress ?? 0))[0];
  if (underWay) {
    const c = byId.get(underWay.case_id)!;
    return <FeaturedCase c={c} href={`/play/${c.id}`} cta="Resume Investigation" headingLevel="h3" mine="open" progress={underWay.progress ?? 0} />;
  }

  const open = catalog.data.filter((c) => !c.is_preview && !c.series_id && (!mine[c.id] || mine[c.id] === "available"));
  const owned = open.filter((c) => mine[c.id] === "available" || (c.status === "available" && (c.tier?.price_cents ?? 0) === 0));
  const onSale = open.filter((c) => c.status === "available" && !owned.includes(c));
  const slides = [...owned, ...onSale];
  if (!slides.length) {
    const result = await getFeaturedCase();
    if (!result.ok) return <SetupNotice reason={result.reason} message={result.message} />;
    if (!result.data) return <EmptyFile title="No assignment is being featured.">Check Available Assignments for open files.</EmptyFile>;
    return <FeaturedCase c={result.data} href={`/agency/assignments/${result.data.id}`} cta="Review Assignment" headingLevel="h3" mine={mine[result.data.id]} />;
  }
  return (
    <FeaturedRotator labels={slides.map((c) => c.title)}>
      {slides.map((c) => (
        <FeaturedCase
          key={c.id}
          c={c}
          href={`/agency/assignments/${c.id}`}
          cta={owned.includes(c) ? "Review Assignment" : "View Case File"}
          headingLevel="h3"
          mine={mine[c.id] ?? (owned.includes(c) ? "available" : undefined)}
        />
      ))}
    </FeaturedRotator>
  );
}

async function RecordAndActive() {
  const me = await requireInvestigator();
  const [record, files, ranks] = await Promise.all([getServiceRecord(me.id), getCaseFiles(me.id), getRanks()]);
  const active = files.filter((f) => f.status === "forming" || f.status === "active");
  const rank = ranks.ok ? ranks.data.find((r) => r.level === me.profile.rank_level)?.title : null;

  return (
    <>
      <section aria-labelledby="active-heading">
        <div className="mb-5 flex items-baseline justify-between">
          <h2 id="active-heading" className="font-serif text-xl text-smoke">
            Active Investigations
          </h2>
        </div>
        {active.length ? (
          <ActiveInvestigations files={active} />
        ) : (
          <EmptyFile
            title="No open investigations."
            action={<ButtonLink href="/agency/assignments" variant="secondary">Browse Available Assignments</ButtonLink>}
          >
            When you accept an assignment it will be filed here so you can pick it up where you left off.
          </EmptyFile>
        )}
      </section>

      <section aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="mb-5 font-serif text-xl text-smoke">
          Agency Statistics
        </h2>
        <Ledger
          items={[
            { label: "Cases Closed", value: record.cases_closed },
            { label: "Active Investigations", value: active.length },
            { label: "Current Rank", value: rank ?? `Level ${me.profile.rank_level}` },
            { label: "Total Investigation Hours", value: formatHours(record.total_investigation_seconds) },
          ]}
        />
      </section>
    </>
  );
}

async function Notices() {
  const notices = await getNotices();
  if (!notices.ok) return <SetupNotice reason={notices.reason} message={notices.message} compact />;
  if (!notices.data.length) return <p className="text-smoke">No notices have been posted.</p>;
  return (
    <ul className="grid gap-px overflow-hidden rounded-[var(--radius-file)] border border-rule bg-rule md:grid-cols-3">
      {notices.data.slice(0, 3).map((n) => (
        <li key={n.id} className="bg-ink-2 p-5">
          <p className="font-mono text-xs text-brass">{formatDate(n.published_at)}</p>
          <p className="mt-2 font-serif text-lg leading-snug">{n.title}</p>
          <p className="mt-2 text-sm leading-relaxed text-smoke">{n.body}</p>
        </li>
      ))}
    </ul>
  );
}
