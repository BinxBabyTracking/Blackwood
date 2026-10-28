import type { CaseDefinition, GameAction, InvestigationState } from "./types";

/*
 * The case clock (added for HALLOW001): it runs on what the investigators do,
 * not on real time. Opt-in with `clock` on the case.
 */


/**
 * "HH:MM" as minutes on one night's clock: from noon on is that evening,
 * before noon is after midnight. "22:32" is 1352, "00:10" is 1450.
 */
export function clockMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map((x) => Number.parseInt(x, 10));
  const mins = (h % 24) * 60 + (m || 0);
  return h < 12 ? mins + 1440 : mins;
}

/** Minutes as "10:32 PM". */
export function clockLabel(mins: number) {
  const d = ((Math.floor(mins) % 1440) + 1440) % 1440;
  const h = Math.floor(d / 60);
  const m = d % 60;
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

/** How long an action took on the case clock. `prev` is the state before it, `s` after. */
export function clockCost(def: CaseDefinition, prev: InvestigationState, s: InvestigationState, action: GameAction) {
  const c = def.clock?.costs;
  if (!c || prev.status === "closed") return 0;
  switch (action.type) {
    case "travel":
      return s.location !== prev.location ? c.travel : 0;
    case "hotspot":
      // Looking at something new takes time; a second look, a panel or a door is free (travel is charged by the move itself).
      return s.inspected.length > prev.inspected.length && s.location === prev.location ? c.inspect : 0;
    case "ask":
    case "askFree":
    case "present":
      return c.question;
    case "answerCall":
    case "placeCall":
      return c.call;
    default:
      return 0;
  }
}

