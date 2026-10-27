import { SERIES, type Series } from "@/series";
import { Tag } from "./ui";

/** Every series, above the case catalog. */
export function SeriesShelf() {
  if (!SERIES.length) return null;
  return (
    <div className="mt-14 space-y-12">
      {SERIES.map((s) => (
        <SeriesBlock key={s.id} s={s} />
      ))}
    </div>
  );
}

/** A series: its title image, then its cases as squares in a grid, in playing order. */
function SeriesBlock({ s }: { s: Series }) {
  const soon = s.status === "coming_soon";
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
          <li key={c.id} className="group flex flex-col">
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
            <h3 className="mt-2.5 font-serif text-base leading-snug text-paper">{c.title}</h3>
            <p className="mt-1 text-xs leading-relaxed text-smoke">{c.teaser}</p>
          </li>
        ))}
      </ol>
      <p className="border-t border-rule px-5 py-3 text-xs text-smoke sm:px-6">
        Played in order: each case opens once the one before it is solved. Buy them one at a time or as a set.
      </p>
    </section>
  );
}
