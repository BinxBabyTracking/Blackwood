import "server-only";

/*
 * Server-only series rules: which cases make up a series, the series
 * deductions the rolling board can confirm, and the series notebook entries
 * written as each case closes. Never sent to the browser except a deduction's
 * title and text once it has been made, and the notebook entries the player
 * has earned.
 *
 * Item ids on the rolling board are canonical across the series:
 *   evidence    S001-C01-E011   (case S001C01, evidence E011)
 *   person      S001-P-holt     (one card per person, whichever case they were met in)
 *   deduction   S001-D004       (a series deduction once made, pinned as a card)
 *
 * Design: the project doc "S001 Series Bible - The Judas Principle", section 6.
 */

export interface SeriesDeductionDef {
  id: string;
  title: string;
  text: string;
  /** Any one of these pairs, strung on the rolling board, confirms it... */
  connections: [string, string][];
  /** ...as long as every one of these is also pinned on the board (items or made deductions). */
  pinned?: string[];
  /** For "any one of" groups: at least one id from each list must be pinned. */
  pinnedAny?: string[][];
  /** Series deductions that must already be made. */
  made?: string[];
}

export interface SeriesDef {
  id: string;
  title: string;
  /** Registered case ids, in playing order. Cases not built yet are listed so the order is fixed. */
  cases: string[];
  deductions: SeriesDeductionDef[];
  /** Written to the series notebook when each case's report is accepted. */
  notebook: Record<string, { title: string; text: string }>;
}

const e = (c: string, id: string) => `S001-${c}-${id}`;

export const SERIES_DEFS: Record<string, SeriesDef> = {
  S001: {
    id: "S001",
    title: "The Judas Principle",
    cases: ["S001C01", "S001C02", "S001C03", "S001C04", "S001C05", "S001C06"],
    notebook: {
      S001C01: {
        title: "The Judas Principle",
        text: "The Keller investigation is closed, but the financial records point beyond Carroway. Meridian Advisory Group appears again and again in transactions nobody has explained.\n\nThe murder has been solved. The larger investigation has not.",
      },
      S001C02: {
        title: "The Judas Principle",
        text: "The money trail from Carroway has led to something more troubling.\n\nMeridian Advisory Group is not simply moving funds. Someone is collecting secrets.\n\nAnd someone above the people we've identified is giving instructions.",
      },
      S001C03: {
        title: "The Judas Principle",
        text: "Three investigations. Three different crimes. Stolen money in Carroway. Blackmail and a kidnapping in Washington. A dead checker on the Baltimore docks.\n\nThe names change. The businesses change. But the same connections keep appearing: the same consulting firm, the same Pittsburgh suite, the same files on the same kind of people.\n\nThe men we have put away gave the orders we could see. Each of them answered to a channel, and the channel answered to someone none of them was allowed to name.\n\nFor the first time, we have a word for whoever is directing them. The Architect.",
      },
      S001C05: {
        title: "The Judas Principle",
        text: "We followed the money. We found the people collecting secrets. We found the people willing to kill to protect the operation. Then we found out that someone had been feeding us the evidence.\n\nNow we know who stood to benefit. Dr. Evelyn Lockhart. The woman who sent us our first lead. The woman who stood beside us while we exposed everyone around her.\n\nWe can see the structure. We can see her hand on it. But influence isn't proof of murder, and a name in a lawyer's index isn't an order.\n\nIf we're going to bring her down, we need more than a theory.",
      },
    },
    deductions: [
      {
        id: "S001-D001",
        title: "The Financial and Intelligence Operations Are Connected",
        text: "Companies paid from the foundation's money in Carroway also appear among Meridian's intelligence clients in Washington. The two operations share the same money.",
        connections: [[e("C01", "E029"), e("C02", "E034")]],
      },
      {
        id: "S001-D002",
        title: "The Financial Network Supports Freight Operations",
        text: "The intermediary payments traced in Carroway also fund the freight operation in Baltimore.",
        connections: [[e("C01", "E029"), e("C03", "E038")]],
      },
      {
        id: "S001-D003",
        title: "Meridian Operates Across Multiple Crimes",
        text: "Meridian's collection of compromising information was used to keep the freight operation running.",
        connections: [[e("C02", "E035"), e("C03", "E033")]],
        pinned: [e("C03", "E037")],
      },
      {
        id: "S001-D004",
        title: "The Earlier Leads Shared a Common Source",
        text: "The leads that reached Blackwood in Carroway, Washington and Baltimore went out through the same courier account and were copied from the same archive.",
        connections: [[e("C04", "E018"), e("C04", "E038")]],
        pinnedAny: [[e("C01", "E030"), e("C02", "E033"), e("C03", "E022")]],
      },
      {
        id: "S001-D005",
        title: "The Evidence Was Deliberately Selected",
        text: "The records released to Blackwood were chosen to expose particular people at Meridian, and only them.",
        connections: [[e("C04", "E017"), e("C04", "E022")]],
        pinned: [e("C04", "E039")],
      },
      {
        id: "S001-D006",
        title: "Someone Is Using Blackwood",
        text: "Someone above the people exposed has been feeding Blackwood genuine evidence to bring down chosen targets.",
        connections: [["S001-D004", "S001-D005"]],
        pinned: [e("C04", "E040")],
        made: ["S001-D004", "S001-D005"],
      },
      {
        id: "S001-D007",
        title: "The Foundation and Meridian Are Financially Connected",
        text: "The Lockhart Foundation's investments reach Meridian through intermediary companies.",
        connections: [[e("C05", "E033"), e("C05", "E034")]],
        pinned: [e("C05", "E041")],
      },
      {
        id: "S001-D008",
        title: "Evelyn Lockhart Exercises Concealed Influence",
        text: "Dr. Lockhart holds real, hidden influence over companies tied to Meridian.",
        connections: [[e("C05", "E035"), e("C05", "E039")]],
        pinned: [e("C05", "E040")],
      },
      {
        id: "S001-D009",
        title: "The Exposure Campaign Benefited Evelyn Lockhart",
        text: "Exposing those particular Meridian executives took risk away from an organization Dr. Lockhart influences. This is motive and benefit, not proof she directed it.",
        connections: [["S001-D005", e("C05", "E043")]],
        pinned: [e("C05", "E044")],
        made: ["S001-D005"],
      },
      {
        id: "S001-D010",
        title: "Evelyn Lockhart May Be the Architect (working theory)",
        text: "Everything so far points to Dr. Lockhart as the authority behind Meridian. It is a working theory, not an accusation anyone could prove yet.",
        connections: [["S001-D006", "S001-D008"]],
        pinned: ["S001-D007", "S001-D009", e("C05", "E046")],
        made: ["S001-D006", "S001-D007", "S001-D008", "S001-D009"],
      },
      {
        id: "S001-D011",
        title: "The Network Had a Common Command Structure",
        text: "The financial, intelligence and freight operations answered to one executive command structure.",
        connections: [["S001-D002", e("C06", "E031")]],
        pinned: ["S001-D003", e("C06", "E039")],
        made: ["S001-D002", "S001-D003"],
      },
      {
        id: "S001-D012",
        title: "Evelyn Lockhart Was the Architect",
        text: "The authority known as A and as the Architect was Dr. Evelyn Lockhart.",
        connections: [["S001-D008", e("C06", "E050")]],
        pinned: [e("C06", "E038"), e("C06", "E049")],
        made: ["S001-D008"],
      },
      {
        id: "S001-D013",
        title: "Evelyn Lockhart Authorized Criminal Operations",
        text: "Authenticated records show Dr. Lockhart approved specific unlawful operations.",
        connections: [[e("C06", "E057"), e("C06", "E041")]],
        pinned: [e("C06", "E034"), e("C06", "E035")],
      },
      {
        id: "S001-D014",
        title: "Evelyn Lockhart Manipulated Blackwood",
        text: "Dr. Lockhart chose what Blackwood was given and watched what it did with it.",
        connections: [["S001-D006", e("C06", "E052")]],
        pinned: ["S001-D009", e("C06", "E055")],
        made: ["S001-D006", "S001-D009"],
      },
      {
        id: "S001-D015",
        title: "Evelyn Lockhart Attempted to Destroy the Evidence",
        text: "Once the organization was exposed, Dr. Lockhart directed the destruction of its records.",
        connections: [[e("C06", "E020"), e("C06", "E059")]],
      },
      {
        id: "S001-D016",
        title: "The Judas Principle",
        text: "Evelyn Lockhart built and directed the organization, then used Blackwood's honest investigations to remove the associates who had become a danger to her, while hiding her own part.",
        connections: [["S001-D012", "S001-D013"]],
        pinned: ["S001-D011", "S001-D014", "S001-D015"],
        made: ["S001-D011", "S001-D012", "S001-D013", "S001-D014", "S001-D015"],
      },
    ],
  },
};

/** The series a case belongs to, with its position (1-based). */
export function seriesOf(caseId: string): { def: SeriesDef; position: number } | null {
  for (const def of Object.values(SERIES_DEFS)) {
    const i = def.cases.indexOf(caseId.toUpperCase());
    if (i >= 0) return { def, position: i + 1 };
  }
  return null;
}

/** "S001C01" + "E011" → "S001-C01-E011". */
export function canonicalEvidence(caseId: string, evidenceId: string) {
  const m = /^(S\d{3})(C\d{2})$/.exec(caseId.toUpperCase());
  return m ? `${m[1]}-${m[2]}-${evidenceId}` : `${caseId}-${evidenceId}`;
}

export function canonicalPerson(seriesId: string, characterId: string) {
  return `${seriesId}-P-${characterId}`;
}
