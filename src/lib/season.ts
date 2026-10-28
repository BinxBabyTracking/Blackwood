import type { CaseRecord } from "./types";

/**
 * Seasonal cases (the HALLOW cases) can only be started during their month,
 * counted in Eastern time. Outside it the card stays in the list as
 * "Returns October 1"; investigations already open can still be finished.
 */
const TZ = "America/New_York";

/** The agency's own test accounts play seasonal cases all year. */
export const SEASON_TESTERS = ["imbush89@gmail.com", "bundleofbushes@gmail.com"];

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

type Seasonal = Pick<CaseRecord, "available_month">;

export function easternMonth(now = new Date()) {
  return Number(new Intl.DateTimeFormat("en-US", { timeZone: TZ, month: "numeric" }).format(now));
}

/** True for any non-seasonal case, and for a seasonal case during its month. */
export function inSeason(c: Seasonal, now = new Date()) {
  return !c.available_month || easternMonth(now) === c.available_month;
}

export function isSeasonTester(email: string | null | undefined) {
  return Boolean(email && SEASON_TESTERS.includes(email.toLowerCase()));
}

/** Seasonal and closed for this viewer right now. */
export function offSeasonFor(c: Seasonal, email: string | null | undefined, now = new Date()) {
  return !inSeason(c, now) && !isSeasonTester(email);
}

export function monthName(m: number) {
  return MONTHS[m - 1] ?? "";
}

/** "October only" */
export function seasonLabel(c: Seasonal) {
  return c.available_month ? `${monthName(c.available_month)} only` : null;
}

/** "Returns October 1" */
export function returnsLabel(c: Seasonal) {
  return c.available_month ? `Returns ${monthName(c.available_month)} 1` : "";
}

/** "October 31" */
export function lastDayLabel(c: Seasonal, now = new Date()) {
  if (!c.available_month) return "";
  const year = Number(new Intl.DateTimeFormat("en-US", { timeZone: TZ, year: "numeric" }).format(now));
  return `${monthName(c.available_month)} ${new Date(year, c.available_month, 0).getDate()}`;
}
