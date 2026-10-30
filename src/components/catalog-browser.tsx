"use client";

import { useEffect, useMemo, useState } from "react";
import type { CatalogCase } from "@/lib/types";
import { DIFFICULTY_LABELS, STATUS_LABELS } from "@/lib/format";
import { CaseCard, FeaturedCaseCard } from "./case-card";

type Sort = "newest" | "shortest" | "longest" | "difficulty";

const DURATIONS = {
  any: { label: "Any length", test: () => true },
  short: { label: "Up to about an hour", test: (c: CatalogCase) => c.est_minutes <= 75 },
  evening: { label: "2 to 3 hours", test: (c: CatalogCase) => c.est_minutes > 75 && c.est_minutes <= 180 },
  extended: { label: "4 to 12 hours", test: (c: CatalogCase) => c.est_minutes > 180 && c.est_minutes <= 720 },
  long: { label: "20 hours or more", test: (c: CatalogCase) => c.est_minutes > 720 },
} as const;

interface Filters {
  difficulty: string;
  duration: keyof typeof DURATIONS;
  price: "any" | "free" | "paid";
  mode: "any" | "solo" | "collaborative";
  status: "any" | CatalogCase["status"] | "preview";
}

const initial: Filters = { difficulty: "any", duration: "any", price: "any", mode: "any", status: "any" };

function matches(c: CatalogCase, f: Filters) {
  if (f.difficulty !== "any") {
    if (f.difficulty === "unrated" ? c.difficulty != null : c.difficulty !== Number(f.difficulty)) return false;
  }
  if (!DURATIONS[f.duration].test(c)) return false;
  if (f.price === "free" && c.tier.price_cents !== 0) return false;
  if (f.price === "paid" && c.tier.price_cents === 0) return false;
  if (f.mode === "solo" && c.min_investigators > 1) return false;
  if (f.mode === "collaborative" && c.max_investigators < 2) return false;
  if (f.status === "preview" && !c.is_preview) return false;
  if (f.status !== "any" && f.status !== "preview" && (c.is_preview || c.status !== f.status)) return false;
  return true;
}

/** Where a case sits in the list, before any sort. */
function shelf(c: CatalogCase) {
  if (c.is_preview || c.status === "in_development") return 4;
  if (c.status === "available") return (c.tier?.price_cents ?? 0) === 0 ? 0 : 2;
  if (c.status === "coming_soon") return c.early_access_open ? 1 : 3;
  return 5;
}

const sorters: Record<Sort, (a: CatalogCase, b: CatalogCase) => number> = {
  newest: (a, b) =>
    (b.released_at ?? "").localeCompare(a.released_at ?? "") ||
    Number(a.is_preview) - Number(b.is_preview) ||
    b.created_at.localeCompare(a.created_at) ||
    a.catalog_order - b.catalog_order,
  shortest: (a, b) => a.est_minutes - b.est_minutes,
  longest: (a, b) => b.est_minutes - a.est_minutes,
  difficulty: (a, b) => (a.difficulty ?? 99) - (b.difficulty ?? 99) || a.est_minutes - b.est_minutes,
};

function Select<T extends string>({ label, value, onChange, options }: { label: string; value: T; onChange: (v: T) => void; options: [T, string][] }) {
  return (
    <label className="block text-xs text-smoke">
      {label}
      <select
        className="field mt-1.5 appearance-none bg-[length:10px] bg-[right_0.8rem_center] bg-no-repeat pr-8 text-sm"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23A9AFB7' fill='none'/%3E%3C/svg%3E\")",
        }}
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
      >
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </label>
  );
}

/** `leaderboards` adds a Leaderboard button to every open case (signed-in pages only). */
export function CatalogBrowser({
  cases,
  hrefBase,
  leaderboards = false,
  mine,
  failed,
  featured = [],
}: {
  cases: CatalogCase[];
  hrefBase: string;
  leaderboards?: boolean;
  /** How each case stands for the signed-in investigator (see viewer-cases.ts). */
  mine?: Record<string, "available" | "open" | "solved">;
  /** Cases whose last attempt ended in a losing ending. */
  failed?: Record<string, { title: string; reason: string }>;
  /** Seasonal cases in their month, chosen on the server: shown full width above the list, whatever the filters. */
  featured?: string[];
}) {
  const [filters, setFilters] = useState<Filters>(initial);
  const [sort, setSort] = useState<Sort>("newest");
  // The filters fold away; whether they are open is remembered on this device.
  const [open, setOpen] = useState(false);
  useEffect(() => {
    let saved = false;
    try {
      saved = localStorage.getItem("bw-filters-open") === "1";
    } catch {
      /* storage blocked */
    }
    if (!saved) return;
    const f = requestAnimationFrame(() => setOpen(true));
    return () => cancelAnimationFrame(f);
  }, []);
  const toggle = () =>
    setOpen((o) => {
      try {
        localStorage.setItem("bw-filters-open", o ? "0" : "1");
      } catch {
        /* fine */
      }
      return !o;
    });
  const set =
    <K extends keyof Filters>(k: K) =>
    (v: Filters[K]) =>
      setFilters((f) => ({ ...f, [k]: v }));

  // Shelves come first, whatever the sort: free cases (the introductory one leading), then cases open for
  // early access, then cases on sale, then Coming Soon, then anything still in preparation. The sort applies within each.
  const visible = useMemo(
    () =>
      cases
        .filter((c) => !featured.includes(c.id) && matches(c, filters))
        .sort((a, b) => shelf(a) - shelf(b) || Number(b.is_introductory) - Number(a.is_introductory) || sorters[sort](a, b)),
    [cases, filters, sort, featured],
  );
  const lead = cases.filter((c) => featured.includes(c.id));
  const filtered = JSON.stringify(filters) !== JSON.stringify(initial);
  const active = (Object.keys(initial) as (keyof Filters)[]).filter((k) => filters[k] !== initial[k]).length + (sort !== "newest" ? 1 : 0);

  return (
    <div>
      {lead.map((c) => (
        <div key={c.id} className="mb-8">
          <FeaturedCaseCard
            c={c}
            href={`${hrefBase}/${c.id}`}
            leaderboard={leaderboards && !c.is_preview && (c.status === "available" || Boolean(c.early_access_open))}
            mine={mine?.[c.id]}
              failure={failed?.[c.id]}
          />
        </div>
      ))}
      <div className="border-y border-rule">
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-controls="catalog-filters"
          className="flex w-full items-center justify-between gap-3 py-3 text-left text-sm text-paper hover:text-brass"
        >
          <span className="inline-flex items-center gap-2">
            <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M4 6h16M7 12h10M10 18h4" />
            </svg>
            Filter and sort
            {active ? <span className="rounded-full bg-brass px-1.5 font-mono text-[0.65rem] leading-4 text-ink">{active}</span> : null}
          </span>
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
        <form
          id="catalog-filters"
          hidden={!open}
          className="grid grid-cols-2 gap-4 pb-5 pt-1 sm:grid-cols-3 lg:grid-cols-6"
          onSubmit={(e) => e.preventDefault()}
          aria-label="Filter and sort assignments"
        >
          <Select
            label="Difficulty"
            value={filters.difficulty}
            onChange={set("difficulty")}
            options={[
              ["any", "Any difficulty"],
              ...Object.entries(DIFFICULTY_LABELS).map(([k, v]) => [k, v] as [string, string]),
              ["unrated", "Not yet rated"],
            ]}
          />
          <Select
            label="Duration"
            value={filters.duration}
            onChange={set("duration")}
            options={Object.entries(DURATIONS).map(([k, v]) => [k as keyof typeof DURATIONS, v.label])}
          />
          <Select
            label="Price"
            value={filters.price}
            onChange={set("price")}
            options={[
              ["any", "Any price"],
              ["free", "Free"],
              ["paid", "Paid"],
            ]}
          />
          <Select
            label="Investigators"
            value={filters.mode}
            onChange={set("mode")}
            options={[
              ["any", "Solo or joint"],
              ["solo", "Can be worked solo"],
              ["collaborative", "Supports joint work"],
            ]}
          />
          <Select
            label="Case status"
            value={filters.status}
            onChange={set("status")}
            options={[
              ["any", "Any status"],
              ["available", STATUS_LABELS.available],
              ["coming_soon", STATUS_LABELS.coming_soon],
              ["preview", "Previews"],
            ]}
          />
          <Select
            label="Sort by"
            value={sort}
            onChange={setSort}
            options={[
              ["newest", "Newest"],
              ["shortest", "Shortest"],
              ["longest", "Longest"],
              ["difficulty", "Difficulty"],
            ]}
          />
        </form>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-smoke" aria-live="polite">
        <span>
          {visible.length} of {cases.length} {cases.length === 1 ? "file" : "files"}
        </span>
        {filtered ? (
          <button type="button" className="text-brass underline-offset-4 hover:underline" onClick={() => setFilters(initial)}>
            Clear filters
          </button>
        ) : null}
      </div>

      {visible.length ? (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((c) => (
            <CaseCard
              key={c.id}
              c={c}
              href={`${hrefBase}/${c.id}`}
              leaderboard={leaderboards && !c.is_preview && (c.status === "available" || Boolean(c.early_access_open))}
              mine={mine?.[c.id]}
              failure={failed?.[c.id]}
            />
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-[var(--radius-file)] border border-dashed border-rule p-10 text-center">
          <p className="font-serif text-lg">No files match these filters.</p>
          <button type="button" className="mt-3 text-sm text-brass underline-offset-4 hover:underline" onClick={() => setFilters(initial)}>
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
