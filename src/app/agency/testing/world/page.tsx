import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { requireInvestigator } from "@/lib/investigator";
import { isOwner } from "@/lib/test-reset";
import { loadCase } from "@/game/registry";
import { roomSpecs } from "@/lib/art-studio";
import { createAdminClient } from "@/lib/supabase/admin";
import { liveArtUrl, liveModelUrl } from "@/art/painted";
import { buildWorld } from "@/game/walk/zones";
import { ZoneViewer } from "@/game/walk/zone-viewer";

export const metadata: Metadata = { title: "Testing Zone" };

/** How tall people stand (metres): elves are small, gnome-like folk; Santa and Mrs. Claus are full-sized. */
const HEIGHTS: Record<string, Record<string, number>> = {
  CHR001: { santa: 1.9, mrsclaus: 1.68, aldric: 0.95, juniper: 1.08, vell: 1.1, guard: 1.12 },
};
const DEFAULT_HEIGHT: Record<string, number> = { CHR001: 1.05 };
const DEFAULT_EYE: Record<string, number> = { CHR001: 0.95 };
/** Indoor floor plans are drawn half as big again for multiplayer; this brings them back down (heights stay). */
const DEFAULT_SHRINK: Record<string, number> = { CHR001: 0.7 };

/**
 * A case's whole walkable world from its room records and the art live on Admin:
 * /agency/testing/world?case=CHR001 (and &at=<place> to start somewhere, &eye=<metres> for your eye height, &shrink=<0..1> for indoor floor size).
 * Owner only.
 */
export default function WorldPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return (
    <Suspense fallback={<main className="fixed inset-0 bg-black" />}>
      <World searchParams={searchParams} />
    </Suspense>
  );
}

async function World({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const me = await requireInvestigator();
  if (!isOwner(me.email)) notFound();
  const q = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const caseId = (one(q.case) ?? "CHR001").toUpperCase();
  const def = loadCase(caseId);
  const prefix = caseId.toLowerCase();
  const records = roomSpecs().filter((r) => r.case === caseId);
  if (!def || !records.length) notFound();

  // Everything live for this case, a page at a time.
  const pics = new Map<string, string>();
  const models = new Map<string, string>();
  const db = createAdminClient();
  if (db) {
    for (let from = 0; ; from += 1000) {
      const { data, error } = await db
        .from("art_images")
        .select("id, live_version, live_model")
        .like("id", `${prefix}\\_%`)
        .order("id")
        .range(from, from + 999);
      if (error) break;
      for (const r of (data ?? []) as { id: string; live_version: number | null; live_model: number | null }[]) {
        if (r.live_version != null) pics.set(r.id, liveArtUrl(r.id, r.live_version));
        if (r.live_model != null) models.set(r.id, liveModelUrl(r.id, r.live_model));
      }
      if (!data || data.length < 1000) break;
    }
  }

  const heights = HEIGHTS[caseId] ?? {};
  const world = buildWorld({
    caseId,
    name: def.title,
    records: records as never,
    art: (id) => pics.get(id) ?? null,
    model: (id) => models.get(id) ?? null,
    people: def.characters.map((c) => ({
      id: c.id,
      name: c.name,
      height: heights[c.id] ?? DEFAULT_HEIGHT[caseId] ?? 1.7,
      locationId: c.locationId ?? null,
      victim: /\bvictim\b/i.test(c.role ?? ""),
    })),
    character: (id) => models.get(`${prefix}_char_${id}`) ?? null,
    start: one(q.at) ?? def.startLocation,
    shrink: Number.isFinite(Number(one(q.shrink))) && Number(one(q.shrink)) > 0 ? Number(one(q.shrink)) : (DEFAULT_SHRINK[caseId] ?? 1),
  });
  const eye = Number(one(q.eye));
  return <ZoneViewer world={world} title={`${def.title} (testing)`} eye={Number.isFinite(eye) && eye > 0.3 ? eye : (DEFAULT_EYE[caseId] ?? 1.6)} />;
}
