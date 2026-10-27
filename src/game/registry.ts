import "server-only";
import { painted, liveArtUrl } from "@/art/painted";
import { C001 } from "@/cases/C001";
import { buildAssets as C001Assets } from "@/cases/C001/assets";
import { C002 } from "@/cases/C002";
import { buildAssets as C002Assets } from "@/cases/C002/assets";
import { C003 } from "@/cases/C003";
import { buildAssets as C003Assets } from "@/cases/C003/assets";
import { createAdminClient } from "@/lib/supabase/admin";
import { C004 } from "@/cases/C004";
import { buildAssets as C004Assets } from "@/cases/C004/assets";
import { C005 } from "@/cases/C005";
import { buildAssets as C005Assets } from "@/cases/C005/assets";
import type { CaseDefinition } from "./engine/types";

/** Every playable case, keyed by stable case id. Add new cases here. */
const CASES: Record<string, CaseDefinition> = { C001, C002, C003, C004, C005 };

/** Every registered case id, in order. */
export function caseIds() {
  return Object.keys(CASES);
}

export function loadCase(caseId: string): CaseDefinition | null {
  return CASES[caseId.toUpperCase()] ?? null;
}

const BUILD: Record<string, () => CaseDefinition["assets"]> = { C001: C001Assets, C002: C002Assets, C003: C003Assets, C004: C004Assets, C005: C005Assets };
const committed = { ...painted };
let artCheckedAt = 0;
let artSignature = "";

/**
 * Paintings made live on the Admin page replace the committed ones. Checked at
 * most every 20 seconds; when something changed, every case's assets are rebuilt.
 * Call before building a view. Never throws: the committed art is always there.
 */
export async function refreshArt(force = false) {
  if (!force && Date.now() - artCheckedAt < 20000) return;
  artCheckedAt = Date.now();
  const db = createAdminClient();
  if (!db) return;
  const { data, error } = await db.from("art_images").select("id, live_version").not("live_version", "is", null);
  if (error) return;
  const rows = (data ?? []) as { id: string; live_version: number }[];
  const sig = rows.map((r) => `${r.id}:${r.live_version}`).sort().join("|");
  if (sig === artSignature) return;
  artSignature = sig;
  for (const k of Object.keys(painted)) if (!(k in committed)) delete painted[k];
  Object.assign(painted, committed);
  for (const r of rows) painted[r.id] = { url: liveArtUrl(r.id, r.live_version) };
  for (const [id, build] of Object.entries(BUILD)) CASES[id].assets = build();
}

export function isPlayable(caseId: string) {
  return Boolean(loadCase(caseId));
}
