import Link from "next/link";
import { LeaderboardButton } from "./leaderboard";
import type { CatalogCase } from "@/lib/types";
import {
  STATUS_LABELS,
  caseLabel,
  difficultyLabel,
  durationLabel,
  formatPrice,
  investigatorLabel,
  locationYear,
} from "@/lib/format";
import { CaseCover } from "./case-cover";
import { FailedBadge, FailedRetry } from "./failed-badge";

/** The investigator's last attempt at a case ended in a losing ending. */
type CaseFailure = { title: string; reason: string };
import { Tag } from "./ui";
import { inSeason, returnsLabel, seasonLabel } from "@/lib/season";

/** `mine`: how the case stands for the signed-in investigator, which outranks the catalog status. */
export function StatusTag({ c, mine }: { c: Pick<CatalogCase, "status" | "is_preview" | "available_month">; mine?: "available" | "open" | "solved" }) {
  if (c.is_preview) return <Tag tone="muted">Preview, not yet available</Tag>;
  if (mine === "open") return <Tag tone="ok">Open</Tag>;
  if (mine === "solved") return <Tag tone="ok">Solved</Tag>;
  if (mine === "available") return <Tag tone="ok">Available</Tag>;
  if (c.status === "available" && !inSeason(c)) return <Tag tone="muted">{returnsLabel(c)}</Tag>;
  const tone = c.status === "available" ? "ok" : c.status === "coming_soon" ? "brass" : "muted";
  return <Tag tone={tone}>{STATUS_LABELS[c.status]}</Tag>;
}

/** Key facts as a definition list; the same fields everywhere a case appears. */
export function CaseFacts({ c, className = "" }: { c: CatalogCase; className?: string }) {
  const facts: [string, string][] = [
    ["Duration", durationLabel(c)],
    ["Difficulty", difficultyLabel(c.difficulty)],
    ["Investigators", investigatorLabel(c)],
    ...(seasonLabel(c) ? [["Season", seasonLabel(c) as string] as [string, string]] : []),
    ["Price", c.is_preview ? `${formatPrice(c.tier)} (${c.tier.label})` : formatPrice(c.tier)],
  ];
  return (
    <dl className={`grid grid-cols-2 gap-x-6 gap-y-3 text-sm ${className}`}>
      {facts.map(([k, v]) => (
        <div key={k}>
          <dt className="text-xs text-smoke">{k}</dt>
          <dd className="mt-0.5 text-paper">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

export function CaseCard({ c, href, leaderboard = false, mine, failure }: { c: CatalogCase; href: string; leaderboard?: boolean; mine?: "available" | "open" | "solved"; failure?: CaseFailure }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-[var(--radius-file)] border border-rule bg-card transition-colors duration-300 hover:border-brass/60">
      <div className="relative aspect-[5/3]">
        <CaseCover c={c} />
        <div className="absolute bottom-3 left-4">
          <span className="font-mono text-xs tracking-[0.12em] text-brass">{c.id}</span>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-serif text-xl leading-snug text-paper">
              <Link href={href} className="after:absolute after:inset-0 focus-visible:outline-none">
                {c.is_preview ? `${caseLabel(c)}: ${c.title}` : c.title}
              </Link>
            </h3>
            <p className="mt-1 text-sm text-smoke">{locationYear(c)}</p>
          </div>
          <StatusTag c={c} mine={mine} />
        </div>
        <p className="mb-5 mt-3 line-clamp-3 text-sm leading-relaxed text-smoke">{c.synopsis}</p>
        <CaseFacts c={c} className="mt-auto border-t border-rule pt-4" />
        {leaderboard || failure || (c.status === "coming_soon" && c.early_access_open && !mine) ? (
          <div className="relative z-10 mt-4 flex flex-wrap items-center gap-3 border-t border-rule pt-3">
            {leaderboard ? <LeaderboardButton caseId={c.id} title={c.title} /> : null}
            {/* Open for early access and not yet granted: the request is on the case page. */}
            {c.status === "coming_soon" && c.early_access_open && !mine ? (
              <Link href={href} className="inline-flex items-center rounded-[2px] bg-brass px-3 py-1.5 text-sm font-semibold text-ink hover:bg-[#d4b585]">
                Request Early Access
              </Link>
            ) : null}
            {/* The last attempt ended in a losing ending: Failed, with why and a fresh try. */}
            {failure ? (
              <div className="ml-auto">
                <FailedBadge />
              </div>
            ) : null}
            {failure ? <FailedRetry caseId={c.id} title={failure.title} reason={failure.reason} /> : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}

/**
 * A seasonal case in its month (HALLOW001 in October), shown full width at the
 * top of the case list: a large cover beside the details.
 */
export function FeaturedCaseCard({ c, href, leaderboard = false, mine, failure }: { c: CatalogCase; href: string; leaderboard?: boolean; mine?: "available" | "open" | "solved"; failure?: CaseFailure }) {
  return (
    <article className="group relative grid overflow-hidden rounded-[var(--radius-file)] border border-brass/50 bg-card transition-colors duration-300 hover:border-brass md:grid-cols-[3fr_2fr]">
      <div className="relative aspect-[3/2] md:aspect-auto md:min-h-[22rem]">
        {/* Anchored left so a painted title in the cover's top left corner stays in the frame. */}
        <CaseCover c={c} variant="hero" priority className="object-left md:absolute md:inset-0" />
        <div className="absolute bottom-3 left-4">
          <span className="font-mono text-xs tracking-[0.12em] text-brass">{c.id}</span>
        </div>
      </div>
      <div className="flex flex-col p-6 sm:p-8">
        <p className="mb-3 font-mono text-xs font-semibold tracking-[0.16em] text-brass">FEATURED · {(seasonLabel(c) ?? "").toUpperCase()}</p>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-serif text-2xl leading-snug text-paper sm:text-3xl">
              <Link href={href} className="after:absolute after:inset-0 focus-visible:outline-none">
                {c.title}
              </Link>
            </h3>
            <p className="mt-1 text-sm text-smoke">{locationYear(c)}</p>
          </div>
          <StatusTag c={c} mine={mine} />
        </div>
        <p className="mb-6 mt-4 text-base leading-relaxed text-paper/85">{c.synopsis}</p>
        <CaseFacts c={c} className="mt-auto border-t border-rule pt-4" />
        {leaderboard || failure || (c.status === "coming_soon" && c.early_access_open && !mine) ? (
          <div className="relative z-10 mt-4 flex flex-wrap items-center gap-3 border-t border-rule pt-3">
            {leaderboard ? <LeaderboardButton caseId={c.id} title={c.title} /> : null}
            {/* Open for early access and not yet granted: the request is on the case page. */}
            {c.status === "coming_soon" && c.early_access_open && !mine ? (
              <Link href={href} className="inline-flex items-center rounded-[2px] bg-brass px-3 py-1.5 text-sm font-semibold text-ink hover:bg-[#d4b585]">
                Request Early Access
              </Link>
            ) : null}
            {/* The last attempt ended in a losing ending: Failed, with why and a fresh try. */}
            {failure ? (
              <div className="ml-auto">
                <FailedBadge />
              </div>
            ) : null}
            {failure ? <FailedRetry caseId={c.id} title={failure.title} reason={failure.reason} /> : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}
