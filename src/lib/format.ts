import type { CaseStatus, CatalogCase, PricingTier } from "./types";

export function formatPrice(tier: Pick<PricingTier, "price_cents" | "currency">) {
  if (tier.price_cents === 0) return "Free";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: tier.currency }).format(tier.price_cents / 100);
}

export function formatMinutes(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const hours = minutes / 60;
  return Number.isInteger(hours) ? `${hours} hr` : `${hours.toFixed(1)} hr`;
}

/** "20 minutes", "1 hour", "1.5 hours", in words for public labels. */
function minutesInWords(minutes: number) {
  if (minutes < 60) return `${minutes} minutes`;
  const hours = minutes / 60;
  const h = Number.isInteger(hours) ? String(hours) : hours.toFixed(1);
  return `${h} hour${hours === 1 ? "" : "s"}`;
}

/**
 * How long a case takes. A case timed both ways reads "About 1 hour solo,
 * 20 minutes with friends"; otherwise the tier's wording ("Approximately 2 to 3 hours").
 */
export function durationLabel(c: CatalogCase) {
  if (c.est_minutes_group && c.est_minutes_group !== c.est_minutes) {
    return `About ${minutesInWords(c.est_minutes)} solo, ${minutesInWords(c.est_minutes_group)} with friends`;
  }
  return c.tier?.duration_label ?? `Approximately ${formatMinutes(c.est_minutes)}`;
}

export function investigatorLabel(c: Pick<CatalogCase, "min_investigators" | "max_investigators">) {
  if (c.min_investigators === c.max_investigators) {
    return c.max_investigators === 1 ? "1 investigator" : `${c.max_investigators} investigators`;
  }
  return `${c.min_investigators}–${c.max_investigators} investigators`;
}

export const DIFFICULTY_LABELS: Record<number, string> = {
  1: "Introductory",
  2: "Moderate",
  3: "Demanding",
  4: "Severe",
  5: "Expert",
};

export function difficultyLabel(d: number | null) {
  return d == null ? "Not yet rated" : DIFFICULTY_LABELS[d] ?? `Level ${d}`;
}

export const STATUS_LABELS: Record<CaseStatus, string> = {
  in_development: "In preparation",
  coming_soon: "Coming soon",
  available: "Open",
  retired: "Archived",
};

export function locationYear(c: Pick<CatalogCase, "location" | "year">) {
  if (!c.location && !c.year) return "Details withheld";
  return [c.location, c.year].filter(Boolean).join(", ");
}

export function caseLabel(c: Pick<CatalogCase, "case_number">) {
  return `Case ${c.case_number}`;
}

export function formatDate(iso: string | null | undefined, opts: Intl.DateTimeFormatOptions = { dateStyle: "medium" }) {
  if (!iso) return "None";
  return new Intl.DateTimeFormat("en-US", opts).format(new Date(iso));
}

export function formatHours(seconds: number) {
  const hours = seconds / 3600;
  if (hours === 0) return "0";
  return hours < 10 ? hours.toFixed(1) : Math.round(hours).toString();
}
