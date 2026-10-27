import Link from "next/link";
import type { CatalogCase } from "@/lib/types";
import { SERIES, type Series } from "@/series";
import { Tag } from "./ui";

/** Every series, with the catalog rows of the series cases that exist so far (each square links to its case). */
export function SeriesShelf({ catalog = [], hrefBase = "/investigations", boardLink = false }: { catalog?: CatalogCase[]; hrefBase?: string; boardLink?: boolean }) {
  if (!SERIES.length) return null;
  return (
    <div className="mt-14 space-y-12">
      {SERIES.map((s) => (
        <SeriesBlock key={s.id} s={s} rows={catalog} hrefBase={hrefBase} boardLink={boardLink} />
      ))}
    </div>
  );
}

/** A series: its title image, then its cases as squares in a grid, in playing order. */
function SeriesBlock({ s, rows, hrefBase, boardLink }: { s: Series; rows: CatalogCase[]; hrefBase: string; boardLink: boolean }) {
  const row = (caseId: string) => rows.find((r) => r.id === caseId && !r.is_preview);
  // The series is open once its first case is, Coming Soon until then.
  const soon = row(s.cases[0].caseId)?.status !== "available";
  return (
    <section aria-labelledby={`series-${s.id}`} className="overflow-hidden rounded-[var(--radius-file)] border border-rule bg-card">
      <div className="relative aspect-[3/2] max-h-[440px] w-full sm:aspect-[21/9]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/art/live/${s.cover}`} alt="" className="absolute inset-0 h-full w-full object-cover object-[70%_center]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(14,19,24,0.92)_0%,rgba(14,19,24,0.7)_38%,transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgba(18,23,29,0.9))]" />
        <div className="relative flex h-full max-w-xl flex-col justify-end p-5 sm:justify-center sm:p-10">
          <p className="font-mono text-xs tracking-[0.16em] text-brass">{s.label.toUpperCase()}</p>
          <h2 id={`series-${s.id}`} className="mt-2 font-serif text-3xl leading-tight text-paper sm:text-5xl">
            {s.title}
          </h2>
          <p className="mt-3 hidden text-sm leading-relaxed text-smoke sm:block">{s.tagline}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {soon ? <Tag tone="brass">Coming soon</Tag> : null}
            <Tag tone="muted">{s.cases.length} connected cases</Tag>
          </div>
        </div>
      </div>
      <p className="px-5 pt-5 text-sm leading-relaxed text-smoke sm:hidden">{s.tagline}</p>
      <ol className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-3 sm:gap-4 sm:p-6 lg:grid-cols-6">
        {s.cases.map((c) => (
          <li key={c.id} className="group relative flex flex-col">
            <div className="relative aspect-square overflow-hidden rounded-[2px] border border-rule">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/art/live/${c.cover}`}
                alt=""
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover object-[62%_center] transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgba(14,19,24,0.85))]" />
              <span className="absolute bottom-2 left-2 font-mono text-[0.6875rem] tracking-[0.12em] text-brass">{c.label}</span>
            </div>
            <h3 className="mt-2.5 font-serif text-base leading-snug text-paper">
              {row(c.caseId) ? (
                <Link href={`${hrefBase}/${c.caseId}`} className="after:absolute after:inset-0 hover:text-brass focus-visible:outline-none">
                  {c.title}
                </Link>
              ) : (
                c.title
              )}
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-smoke">{c.teaser}</p>
          </li>
        ))}
      </ol>
      <p className="border-t border-rule px-5 py-3 text-xs text-smoke sm:px-6">
        Played in order: each case opens once the one before it is solved. Buy them one at a time or as a set.
        {boardLink ? (
          <>
            {" "}
            <Link href={`/agency/series/${s.id}`} className="text-brass underline-offset-4 hover:underline">
              Your rolling board
            </Link>
          </>
        ) : null}
      </p>
    </section>
  );
}
