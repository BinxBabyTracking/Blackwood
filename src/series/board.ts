import type { SeriesDef } from "./defs";

/*
 * The rolling board's rules, pure so they can be checked without a database.
 * The same moves as a case's murder board: pin, move, unpin, string, cut.
 * A string that matches a series deduction (and has everything else that
 * deduction needs pinned) makes it. Nothing is ever pinned or strung for the
 * player.
 */

export interface SeriesBoard {
  items: { id: string; x: number; y: number }[];
  connections: [string, string][];
}

export interface SeriesProgress {
  board: SeriesBoard;
  deductions: string[];
}

export type SeriesAction =
  | { type: "boardAdd"; itemId: string; x: number; y: number }
  | { type: "boardMove"; itemId: string; x: number; y: number }
  | { type: "boardRemove"; itemId: string }
  | { type: "connect"; a: string; b: string }
  | { type: "disconnect"; a: string; b: string };

export class SeriesRuleError extends Error {}

const clamp = (v: number) => Math.max(0, Math.min(196, Number.isFinite(v) ? v : 0));
const same = (a: string, b: string, x: string, y: string) => (x === a && y === b) || (x === b && y === a);

/**
 * Applies one move. `allowed` is every item the player may pin: evidence and
 * people from any case of the series they have found, and the series
 * deductions they have made. Returns the new progress and, when a string made
 * a deduction, its id.
 */
export function reduceSeries(def: SeriesDef, p: SeriesProgress, allowed: Set<string>, action: SeriesAction): { progress: SeriesProgress; made: string | null } {
  const s: SeriesProgress = structuredClone(p);
  const on = (id: string) => s.board.items.some((i) => i.id === id);
  let made: string | null = null;
  switch (action.type) {
    case "boardAdd": {
      const pinnable = allowed.has(action.itemId) || s.deductions.includes(action.itemId);
      if (!pinnable) throw new SeriesRuleError("That item isn't in your files for this series.");
      if (on(action.itemId)) break;
      s.board.items.push({ id: action.itemId, x: clamp(action.x), y: clamp(action.y) });
      break;
    }
    case "boardMove": {
      const it = s.board.items.find((i) => i.id === action.itemId);
      if (it) {
        it.x = clamp(action.x);
        it.y = clamp(action.y);
      }
      break;
    }
    case "boardRemove":
      s.board.items = s.board.items.filter((i) => i.id !== action.itemId);
      s.board.connections = s.board.connections.filter(([a, b]) => a !== action.itemId && b !== action.itemId);
      break;
    case "connect": {
      const { a, b } = action;
      if (a === b || !on(a) || !on(b)) throw new SeriesRuleError("Pin both items to the board first.");
      if (!s.board.connections.some(([x, y]) => same(a, b, x, y))) s.board.connections.push([a, b]);
      for (const d of def.deductions) {
        if (s.deductions.includes(d.id)) continue;
        if (!d.connections.some(([x, y]) => same(a, b, x, y))) continue;
        if ((d.made ?? []).some((m) => !s.deductions.includes(m))) continue;
        if ((d.pinned ?? []).some((id) => !on(id))) continue;
        if ((d.pinnedAny ?? []).some((group) => !group.some(on))) continue;
        s.deductions.push(d.id);
        made = d.id;
        break;
      }
      break;
    }
    case "disconnect":
      s.board.connections = s.board.connections.filter(([x, y]) => !same(action.a, action.b, x, y));
      break;
  }
  return { progress: s, made };
}
