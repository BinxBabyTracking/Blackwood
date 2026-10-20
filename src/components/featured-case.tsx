import Link from "next/link";
import type { CatalogCase } from "@/lib/types";
import { caseLabel, locationYear } from "@/lib/format";
import { CaseCover } from "./case-cover";
import { CaseFacts, StatusTag } from "./case-card";
import { buttonClass } from "./ui";

/** A large case file presentation used on the homepage and at headquarters. */
export function FeaturedCase({
  c,
  href,
  cta,
  headingLevel = "h2",
}: {
  c: CatalogCase;
  href: string;
  cta: string;
  headingLevel?: "h2" | "h3";
}) {
  const H = headingLevel;
  return (
    <article className="grid overflow-hidden rounded-[var(--radius-file)] border border-rule bg-card lg:grid-cols-[1.25fr_1fr]">
      <div className="relative min-h-64 lg:min-h-[26rem]">
        <CaseCover c={c} variant="hero" />
        <div className="absolute bottom-5 left-6 right-6 flex flex-wrap items-end justify-between gap-3">
          <span className="font-mono text-sm tracking-[0.14em] text-brass">
            {c.id} / {caseLabel(c).toUpperCase()}
          </span>
          {c.is_introductory ? (
            <span className="rounded-[2px] bg-ink/80 px-2 py-1 text-xs text-paper">Introductory Investigation</span>
          ) : null}
        </div>
      </div>
      <div className="flex flex-col p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <p className="text-sm text-smoke">{locationYear(c)}</p>
          <StatusTag c={c} />
        </div>
        <H className="mt-3 font-display text-4xl leading-[1.05] text-paper sm:text-5xl">{c.title}</H>
        <p className="mt-4 max-w-[52ch] leading-relaxed text-smoke">{c.synopsis}</p>
        <CaseFacts c={c} className="mt-8 border-t border-rule pt-5" />
        <div className="mt-8 lg:mt-auto lg:pt-8">
          <Link href={href} className={buttonClass("primary")}>
            {cta}
          </Link>
        </div>
      </div>
    </article>
  );
}
