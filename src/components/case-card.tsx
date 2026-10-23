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
import { Tag } from "./ui";

export function StatusTag({ c }: { c: Pick<CatalogCase, "status" | "is_preview"> }) {
  if (c.is_preview) return <Tag tone="muted">Preview, not yet available</Tag>;
  const tone = c.status === "available" ? "ok" : c.status === "coming_soon" ? "brass" : "muted";
  return <Tag tone={tone}>{STATUS_LABELS[c.status]}</Tag>;
}

/** Key facts as a definition list; the same fields everywhere a case appears. */
export function CaseFacts({ c, className = "" }: { c: CatalogCase; className?: string }) {
  const facts: [string, string][] = [
    ["Duration", durationLabel(c)],
    ["Difficulty", difficultyLabel(c.difficulty)],
    ["Investigators", investigatorLabel(c)],
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

export function CaseCard({ c, href, leaderboard = false }: { c: CatalogCase; href: string; leaderboard?: boolean }) {
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
          <StatusTag c={c} />
        </div>
        <p className="mb-5 mt-3 line-clamp-3 text-sm leading-relaxed text-smoke">{c.synopsis}</p>
        <CaseFacts c={c} className="mt-auto border-t border-rule pt-4" />
        {leaderboard ? (
          <div className="mt-4 border-t border-rule pt-3">
            <LeaderboardButton caseId={c.id} title={c.title} />
          </div>
        ) : null}
      </div>
    </article>
  );
}
