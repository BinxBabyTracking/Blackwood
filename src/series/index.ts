// Connected case series. A series is a run of cases played in order, with its
// own rolling cork board (built with S01 C01). Until a series case is built and
// has its own `cases` row, it is listed here as Coming Soon.
//
// Player-facing text only. The series bible lives in the project docs and must
// never be copied here: nothing below may hint at a later case's solution.

export interface SeriesCase {
  /** Internal id, e.g. "S001-C01". */
  id: string;
  /** Player-facing label, e.g. "S01 C01". */
  label: string;
  title: string;
  /** One spoiler-safe line for the Coming Soon card. */
  teaser: string;
  /** Art manifest id; served through /art/live so Admin versions show at once. */
  cover: string;
}

export interface Series {
  id: string;
  label: string;
  title: string;
  tagline: string;
  cover: string;
  status: "coming_soon" | "available";
  cases: SeriesCase[];
}

export const SERIES: Series[] = [
  {
    id: "S001",
    label: "Series S001",
    title: "The Judas Principle",
    tagline:
      "Six investigations, each a complete case of its own. Behind them, one hidden network. After the first case, a cork board on wheels joins your office and carries the evidence you choose to keep from case to case. Only you decide what connects.",
    cover: "s001_cover",
    status: "coming_soon",
    cases: [
      {
        id: "S001-C01",
        label: "S01 C01",
        title: "The Ledger",
        teaser: "A Pennsylvania accountant is murdered after finding payments at a charitable foundation that don't add up.",
        cover: "s001_c01_cover",
      },
      {
        id: "S001-C02",
        label: "S01 C02",
        title: "Room 614",
        teaser: "A government contractor vanishes from a Washington hotel the night before he is due to testify.",
        cover: "s001_c02_cover",
      },
      {
        id: "S001-C03",
        label: "S01 C03",
        title: "Dead Freight",
        teaser: "A Baltimore dockworker is killed after flagging cargo that doesn't match its paperwork.",
        cover: "s001_c03_cover",
      },
      {
        id: "S001-C04",
        label: "S01 C04",
        title: "The Informant",
        teaser: "A former insider offers to explain everything. She never arrives.",
        cover: "s001_c04_cover",
      },
      {
        id: "S001-C05",
        label: "S01 C05",
        title: "The Benefactor",
        teaser: "A financial adviser is found dead during an exclusive New York charity gala.",
        cover: "s001_c05_cover",
      },
      {
        id: "S001-C06",
        label: "S01 C06",
        title: "The Architect",
        teaser: "Witnesses are disappearing and the last records are burning. Prove who built it.",
        cover: "s001_c06_cover",
      },
    ],
  },
];
