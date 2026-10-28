import { Suspense } from "react";
import type { CatalogCase } from "@/lib/types";
import { STATUS_LABELS, caseLabel, difficultyLabel, durationLabel, formatPrice, investigatorLabel } from "@/lib/format";
import { AssignmentActions } from "./assignment-actions";
import { LeaderboardButton } from "./leaderboard";
import { CaseCover } from "./case-cover";
import { StatusTag } from "./case-card";
import { ViewerAvailability, ViewerStatusTag } from "./viewer-status";
import { Skeleton } from "./ui";

/** Reusable case file template: the dedicated details page for any case. */
export function CaseFile({ c, topPadding = true }: { c: CatalogCase; topPadding?: boolean }) {
  const rows: [string, React.ReactNode][] = [
    ["Case number", c.id],
    ["Classification", c.classification],
    ["Location", c.location ?? "Withheld"],
    ["Year", c.year ? String(c.year) : "Withheld"],
    ["Estimated duration", durationLabel(c)],
    ["Difficulty", difficultyLabel(c.difficulty)],
    ["Investigators", investigatorLabel(c)],
    ["Price", c.is_preview ? `${formatPrice(c.tier)} (${c.tier.label}, preliminary)` : formatPrice(c.tier)],
    [
      "Availability",
      <Suspense key="availability" fallback={c.is_preview ? "Preview only" : STATUS_LABELS[c.status]}>
        <ViewerAvailability c={c} />
      </Suspense>,
    ],
  ];

  return (
    <article>
      <header className={`relative isolate overflow-hidden border-b border-rule ${topPadding ? "pt-28" : ""}`}>
        <div className="absolute inset-0 -z-10">
          <CaseCover c={c} variant="hero" priority />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(18,23,29,0.95)_0%,rgba(18,23,29,0.7)_50%,rgba(18,23,29,0.35)_100%)]" />
          {topPadding ? <div className="absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,rgba(18,23,29,0.92),transparent)]" /> : null}
        </div>
        <div className="mx-auto max-w-7xl px-4 pb-14 pt-16 sm:px-8 sm:pt-24">
          <p className="font-mono text-sm tracking-[0.14em] text-brass">
            {c.id} / {caseLabel(c).toUpperCase()} / {c.classification.toUpperCase()}
          </p>
          <h1 className="mt-4 max-w-[16ch] font-display text-5xl leading-[1] sm:text-7xl">{c.title}</h1>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Suspense fallback={<StatusTag c={c} />}>
              <ViewerStatusTag c={c} />
            </Suspense>
            {c.is_introductory ? <span className="text-sm text-smoke">Introductory Investigation</span> : null}
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-14 px-4 py-16 sm:px-8 lg:grid-cols-[1.5fr_1fr]">
        <section aria-labelledby="summary">
          <h2 id="summary" className="font-serif text-xl text-smoke">
            Case summary
          </h2>
          <p className="mt-4 max-w-[62ch] font-serif text-xl leading-[1.7] text-paper/90">{c.summary}</p>
        </section>

        <aside className="lg:sticky lg:top-8 lg:self-start">
          <div className="rounded-[var(--radius-file)] border border-rule bg-ink-2">
            <dl className="divide-y divide-rule">
              {rows.map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between gap-6 px-5 py-3 text-sm">
                  <dt className="text-smoke">{k}</dt>
                  <dd className={`text-right ${k === "Case number" ? "font-mono text-brass" : "text-paper"}`}>{v}</dd>
                </div>
              ))}
            </dl>
            <div className="border-t border-rule p-5">
              <Suspense fallback={<Skeleton className="h-11 w-48" />}>
                <AssignmentActions c={c} />
              </Suspense>
            </div>
            {!c.is_preview && (c.status === "available" || c.early_access_open) ? (
              <div className="border-t border-rule px-5 py-4">
                <LeaderboardButton caseId={c.id} title={c.title} />
                <p className="mt-1 text-xs text-smoke">Top investigators and groups for this case.</p>
              </div>
            ) : null}
          </div>
        </aside>
      </div>
    </article>
  );
}
