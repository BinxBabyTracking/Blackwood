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
import { C006 } from "@/cases/C006";
import { buildAssets as C006Assets } from "@/cases/C006/assets";
import { S001C01 } from "@/cases/S001C01";
import { buildAssets as S001C01Assets } from "@/cases/S001C01/assets";
import { S001C02 } from "@/cases/S001C02";
import { buildAssets as S001C02Assets } from "@/cases/S001C02/assets";
import { S001C03 } from "@/cases/S001C03";
import { buildAssets as S001C03Assets } from "@/cases/S001C03/assets";
import { S001C04 } from "@/cases/S001C04";
import { buildAssets as S001C04Assets } from "@/cases/S001C04/assets";
import { S001C05 } from "@/cases/S001C05";
import { buildAssets as S001C05Assets } from "@/cases/S001C05/assets";
import { S001C06 } from "@/cases/S001C06";
import { buildAssets as S001C06Assets } from "@/cases/S001C06/assets";
import type { CaseDefinition } from "./engine/types";

/** Every playable case, keyed by stable case id. Add new cases here. */
const CASES: Record<string, CaseDefinition> = { C001, C002, C003, C004, C005, C006, S001C01, S001C02, S001C03, S001C04, S001C05, S001C06 };

/** Every registered case id, in order. */
export function caseIds() {
  return Object.keys(CASES);
}

export function loadCase(caseId: string): CaseDefinition | null {
  return CASES[caseId.toUpperCase()] ?? null;
}

/**
 * A case's own travel paintings (<case>_travel_*, e.g. c002_travel_drive_far_tamarack),
 * live Admin versions included, handed to the travel scene as ui.travel_*. Any
 * case gets them by adding the images to art/manifest.json; nothing else to wire.
 */
function withTravel(caseId: string, build: () => CaseDefinition["assets"]) {
  return () => {
    const assets = build();
    const prefix = `${caseId.toLowerCase()}_travel_`;
    for (const [id, v] of Object.entries(painted)) if (id.startsWith(prefix)) assets.images[`ui.${id.slice(prefix.length - "travel_".length)}`] = v.url;
    return assets;
  };
}

const BUILD: Record<string, () => CaseDefinition["assets"]> = Object.fromEntries(
  Object.entries({ C001: C001Assets, C002: C002Assets, C003: C003Assets, C004: C004Assets, C005: C005Assets, C006: C006Assets, S001C01: S001C01Assets, S001C02: S001C02Assets, S001C03: S001C03Assets, S001C04: S001C04Assets, S001C05: S001C05Assets, S001C06: S001C06Assets }).map(([id, b]) => [id, withTravel(id, b)]),
);
for (const [id, build] of Object.entries(BUILD)) CASES[id].assets = build();
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
