import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { requireInvestigator } from "@/lib/investigator";
import { isOwner } from "@/lib/test-reset";
import { loadCase } from "@/game/registry";
import { roomSpecs } from "@/lib/art-studio";
import { createAdminClient } from "@/lib/supabase/admin";
import { liveArtUrl, liveModelUrl } from "@/art/painted";
import { buildWorld, type SavedLayout } from "@/game/walk/zones";
import { ZoneViewer } from "@/game/walk/zone-viewer";
import { CHR001_WALK } from "@/cases/CHR001/walk";
import type { StoryData } from "@/game/walk/story";

export const metadata: Metadata = { title: "Testing Zone" };

/** How tall people stand (metres): elves are small, gnome-like folk; Santa and Mrs. Claus are full-sized. */
const HEIGHTS: Record<string, Record<string, number>> = {
  CHR001: { santa: 1.9, mrsclaus: 1.68, aldric: 0.95, juniper: 1.08, vell: 1.1, guard: 1.12 },
};
const DEFAULT_HEIGHT: Record<string, number> = { CHR001: 1.05 };
const DEFAULT_EYE: Record<string, number> = { CHR001: 0.95 };
/** The most an indoor floor plan keeps (each room shrinks further to fit what is in it; heights stay). */
const DEFAULT_SHRINK: Record<string, number> = { CHR001: 0.75 };

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

  // Models Meshy built facing the wrong way, turned in Edit mode.
  const turns = new Map<string, number>();
  if (db) {
    const { data } = await db.from("art_turns").select("image_id, turn").like("image_id", `${prefix}\\_%`);
    for (const r of (data ?? []) as { image_id: string; turn: number }[]) turns.set(r.image_id, r.turn);
  }
  // Rooms arranged in Edit mode.
  const layouts = new Map<string, SavedLayout>();
  if (db) {
    const { data } = await db.from("world_layouts").select("room_id, layout").like("room_id", `${prefix}\\_%`);
    for (const r of (data ?? []) as { room_id: string; layout: SavedLayout }[]) if (r.layout?.v === 1) layouts.set(r.room_id, r.layout);
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
    turn: (id) => turns.get(id) ?? 0,
    saved: (room) => layouts.get(room) ?? null,
    start: one(q.at) ?? def.startLocation,
    shrink: Number.isFinite(Number(one(q.shrink))) && Number(one(q.shrink)) > 0 ? Number(one(q.shrink)) : (DEFAULT_SHRINK[caseId] ?? 1),
  });
  const eye = Number(one(q.eye));
  // The story (clock, loop, evidence) runs unless &story=0 (for arranging rooms without it).
  const base: StoryData | null = caseId === "CHR001" && one(q.story) !== "0" ? CHR001_WALK : null;
  const story: StoryData | undefined = base
    ? { ...base, pictures: Object.fromEntries(base.evidence.map((e) => [`ev.${e.id}`, pics.get(`${prefix}_ev_${e.id.toLowerCase()}`) ?? ""]).filter(([, u]) => u)) }
    : undefined;
  return (
    <ZoneViewer
      world={world}
      title={`${def.title} (testing)`}
      eye={Number.isFinite(eye) && eye > 0.3 ? eye : (DEFAULT_EYE[caseId] ?? 1.6)}
      story={story}
      storyKey={`walkstory:${caseId}:${me.id}`}
    />
  );
}
