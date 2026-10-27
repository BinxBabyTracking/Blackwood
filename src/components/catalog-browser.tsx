"use client";

import { useMemo, useState } from "react";
import type { CatalogCase } from "@/lib/types";
import { DIFFICULTY_LABELS, STATUS_LABELS } from "@/lib/format";
import { CaseCard } from "./case-card";

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

function Select<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: [T, string][];
}) {
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
export function CatalogBrowser({ cases, hrefBase, leaderboards = false }: { cases: CatalogCase[]; hrefBase: string; leaderboards?: boolean }) {
  const [filters, setFilters] = useState<Filters>(initial);
  const [sort, setSort] = useState<Sort>("newest");
  const set = <K extends keyof Filters>(k: K) => (v: Filters[K]) => setFilters((f) => ({ ...f, [k]: v }));

  // The introductory case (The Whitmore File) always leads the list, whatever the sort.
  const visible = useMemo(
    () => cases.filter((c) => matches(c, filters)).sort((a, b) => Number(b.is_introductory) - Number(a.is_introductory) || sorters[sort](a, b)),
    [cases, filters, sort],
  );
  const filtered = JSON.stringify(filters) !== JSON.stringify(initial);

  return (
    <div>
      <form
        className="grid grid-cols-2 gap-4 border-y border-rule py-5 sm:grid-cols-3 lg:grid-cols-6"
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
            <CaseCard key={c.id} c={c} href={`${hrefBase}/${c.id}`} leaderboard={leaderboards && !c.is_preview && c.status === "available"} />
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-[var(--radius-file)] border border-dashed border-rule p-10 text-center">
          <p className="font-serif text-lg">No files match these filters.</p>
          <button
            type="button"
            className="mt-3 text-sm text-brass underline-offset-4 hover:underline"
            onClick={() => setFilters(initial)}
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
