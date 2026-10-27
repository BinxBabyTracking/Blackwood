/**
 * Checks the series rules without a database: the series definitions are
 * well formed, and the rolling board's moves behave.
 *
 *   npx tsx --conditions=react-server scripts/check-series.ts
 */
import { loadCase } from "@/game/registry";
import { reduceSeries, SeriesRuleError, type SeriesProgress } from "@/series/board";
import { canonicalEvidence, SERIES_DEFS } from "@/series/defs";
import { SERIES } from "@/series";

const problems: string[] = [];
const ok = (cond: unknown, msg: string) => {
  if (!cond) problems.push(msg);
};

// --- Definitions ------------------------------------------------------------
for (const def of Object.values(SERIES_DEFS)) {
  const listed = SERIES.find((s) => s.id === def.id);
  ok(listed, `${def.id}: missing from src/series/index.ts`);
  ok(listed && listed.cases.map((c) => c.caseId).join() === def.cases.join(), `${def.id}: case order differs between index.ts and defs.ts`);
  const ids = new Set(def.deductions.map((d) => d.id));
  ok(ids.size === def.deductions.length, `${def.id}: duplicate deduction ids`);
  def.deductions.forEach((d, i) => {
    for (const m of d.made ?? []) {
      ok(ids.has(m), `${d.id}: needs unknown deduction ${m}`);
      ok(def.deductions.findIndex((x) => x.id === m) < i, `${d.id}: needs ${m}, which comes after it`);
    }
    const all = [...d.connections.flat(), ...(d.pinned ?? []), ...(d.pinnedAny ?? []).flat()];
    for (const id of all) {
      const ev = /^S(\d{3})-C(\d{2})-(E\d{3})$/.exec(id);
      if (ev) {
        const caseId = `S${ev[1]}C${ev[2]}`;
        const c = loadCase(caseId);
        // Cases not built yet are skipped; built ones must have the evidence.
        if (c) ok(c.evidence.some((e) => e.id === ev[3]), `${d.id}: ${id} is not evidence in ${caseId}`);
      } else ok(ids.has(id), `${d.id}: unknown item ${id}`);
    }
    for (const [a, b] of d.connections) ok(a !== b, `${d.id}: a connection ties an item to itself`);
  });
  for (const c of Object.keys(def.notebook)) ok(def.cases.includes(c), `${def.id}: notebook entry for ${c}, not in the series`);
  // Every built case closes with its own notebook entry, word for word, and points at this series.
  for (const caseId of def.cases) {
    const c = loadCase(caseId);
    if (!c) continue;
    const s = c.solution.resolution.series;
    ok(s?.seriesId === def.id, `${caseId}: resolution.series missing or not ${def.id}`);
    const entry = def.notebook[caseId];
    ok(entry, `${caseId}: no notebook entry in defs.ts`);
    if (s && entry) ok(s.title === entry.title && s.text === entry.text, `${caseId}: closing notebook text differs from defs.ts`);
    ok(caseId === def.cases[def.cases.length - 1] ? s?.finale === true : !s?.finale, `${caseId}: only the last case is the finale`);
    // The rolling board stands in the office from the second case on.
    const office = c.locations.find((l) => l.id === "office");
    if (caseId !== def.cases[0]) ok(office?.hotspots.some((h) => h.interaction.type === "panel" && h.interaction.panel === "rolling"), `${caseId}: no rolling board in the office`);
  }
}
ok(canonicalEvidence("S001C01", "E011") === "S001-C01-E011", "canonicalEvidence");

// --- Moves ------------------------------------------------------------------
const def = SERIES_DEFS.S001;
const empty: SeriesProgress = { board: { items: [], connections: [] }, deductions: [] };
const allowed = new Set(["S001-C01-E029", "S001-C02-E034", "S001-C01-E030", "S001-P-holt"]);

let p = empty;
const step = (a: Parameters<typeof reduceSeries>[3]) => {
  const r = reduceSeries(def, p, allowed, a);
  p = r.progress;
  return r.made;
};
const throws = (fn: () => unknown, msg: string) => {
  try {
    fn();
    problems.push(msg);
  } catch (e) {
    if (!(e instanceof SeriesRuleError)) problems.push(`${msg} (wrong error: ${String(e)})`);
  }
};

throws(() => reduceSeries(def, empty, allowed, { type: "boardAdd", itemId: "S001-C02-E033", x: 1, y: 1 }), "pinned an item the player has not found");
step({ type: "boardAdd", itemId: "S001-C01-E029", x: 10, y: 10 });
step({ type: "boardAdd", itemId: "S001-C01-E029", x: 50, y: 50 });
ok(p.board.items.length === 1, "pinning twice made two cards");
throws(() => reduceSeries(def, p, allowed, { type: "connect", a: "S001-C01-E029", b: "S001-C02-E034" }), "strung to an item that is not pinned");
step({ type: "boardAdd", itemId: "S001-C02-E034", x: 400, y: -5 });
ok(p.board.items[1].x === 196 && p.board.items[1].y === 0, "positions are not clamped");
const made = step({ type: "connect", a: "S001-C02-E034", b: "S001-C01-E029" });
ok(made === "S001-D001", "the matching string did not make S001-D001");
ok(p.deductions.includes("S001-D001"), "S001-D001 not recorded");
ok(step({ type: "connect", a: "S001-C01-E029", b: "S001-C02-E034" }) === null, "a deduction was made twice");
ok(p.board.connections.length === 1, "the same string was added twice");
step({ type: "boardAdd", itemId: "S001-D001", x: 30, y: 30 });
ok(p.board.items.some((i) => i.id === "S001-D001"), "a made deduction could not be pinned");
step({ type: "boardAdd", itemId: "S001-P-holt", x: 60, y: 60 });
step({ type: "connect", a: "S001-P-holt", b: "S001-C01-E029" });
ok(p.deductions.length === 1, "a wrong string made a deduction");
step({ type: "boardRemove", itemId: "S001-C01-E029" });
ok(!p.board.connections.some(([a, b]) => a === "S001-C01-E029" || b === "S001-C01-E029"), "unpinning left its strings");
ok(p.deductions.includes("S001-D001"), "unpinning undid a deduction");
step({ type: "disconnect", a: "S001-C01-E029", b: "S001-P-holt" });

// S001-D004 needs one of the earlier delivered items pinned besides the pair.
{
  let q: SeriesProgress = empty;
  const al = new Set(["S001-C04-E018", "S001-C04-E038", "S001-C02-E033"]);
  const go = (a: Parameters<typeof reduceSeries>[3]) => {
    const r = reduceSeries(def, q, al, a);
    q = r.progress;
    return r.made;
  };
  go({ type: "boardAdd", itemId: "S001-C04-E018", x: 1, y: 1 });
  go({ type: "boardAdd", itemId: "S001-C04-E038", x: 20, y: 1 });
  ok(go({ type: "connect", a: "S001-C04-E018", b: "S001-C04-E038" }) === null, "S001-D004 made without an earlier delivered item pinned");
  go({ type: "disconnect", a: "S001-C04-E018", b: "S001-C04-E038" });
  go({ type: "boardAdd", itemId: "S001-C02-E033", x: 40, y: 1 });
  ok(go({ type: "connect", a: "S001-C04-E018", b: "S001-C04-E038" }) === "S001-D004", "S001-D004 not made with C02-E033 pinned");
}

if (problems.length) {
  console.error(`Series checks: ${problems.length} problem(s)`);
  for (const p of problems) console.error(" -", p);
  process.exit(1);
}
console.log("Series checks passed.");
