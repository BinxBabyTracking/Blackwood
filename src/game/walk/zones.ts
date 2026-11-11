/*
 * Walkable zones built straight from a case's room records (`rooms` in art/manifest.json, see art/WALKABLE.md) and
 * whatever art is live on Admin. One zone per room: an interior (floor, tiled walls with pieces and openings, trim,
 * ceiling and lamps, furniture models) or an exterior (ground, path decals, the surroundings painted on all four
 * sides, buildings and props as models). Doors join the zones: a wall piece or a model with `to` takes you to that
 * place, arriving at its door back.
 *
 * Metres, floor at y 0, each zone centred on x/z 0 with its front wall toward -z (as the C001 house).
 */

export type ZonePiece = { tex: string | null; x: number; y: number; w: number; h: number; opening: boolean; outside: string | null; label: string };
export type ZoneWall = { tex: string | null; tile: number; lower: { tex: string | null; tile: number; to: number } | null; pieces: ZonePiece[]; backdrop: string | null };
export type ZoneModel = { id: string; file: string | null; label: string; pos: number[]; elev: number; rotY: number; rotX: number; size: number[]; solid: boolean; light: boolean };
export type ZoneDoor = { to: string; label: string; at: number[]; span: number; normal: number[]; kind: "wall" | "model" | "pass" };
export type ZonePerson = { id: string; name: string; file: string | null; height: number; pos: number[]; rotY: number };
export type Zone = {
  id: string;
  room: string;
  name: string;
  note: string;
  outdoor: boolean;
  size: number[];
  floor: { tex: string | null; tile: number };
  ceiling: { tex: string | null; tile: number } | null;
  trim: { base?: { tex: string | null; h: number }; rail?: { tex: string | null; h: number; at: number }; crown?: { tex: string | null; h: number } };
  fixtures: { tex: string | null; pos: number[]; size: number[]; light: boolean }[];
  walls: Record<Side, ZoneWall>;
  models: ZoneModel[];
  decals: { tex: string | null; pos: number[]; size: number[]; tile: number; rotY: number }[];
  doors: ZoneDoor[];
  people: ZonePerson[];
};
export type Side = "front" | "back" | "left" | "right";
export type World = { caseId: string; name: string; start: string; zones: Zone[]; missing: string[] };

const FT = 0.3048;
const SIDES: Side[] = ["front", "back", "left", "right"];
const ROT: Record<string, number> = { back: 0, front: 180, left: -90, right: 90 };
const NORMAL: Record<string, number[]> = { back: [0, 1], front: [0, -1], left: [-1, 0], right: [1, 0] };

type Rec = Record<string, unknown> & { id: string; location?: string; name: string; type?: string; sizeFt?: number[]; note?: string };
type Img = { image?: string; [k: string]: unknown };
type Person = { id: string; name: string; height?: number; locationId?: string | null; victim?: boolean };

/** The point on a wall `u` metres from its left end (seen from inside), and the way into the room. */
function wallPoint(side: Side, w: number, d: number, u: number) {
  if (side === "front") return { at: [-w / 2 + u, -d / 2], normal: [0, 1] };
  if (side === "back") return { at: [w / 2 - u, d / 2], normal: [0, -1] };
  if (side === "left") return { at: [-w / 2, d / 2 - u], normal: [1, 0] };
  return { at: [w / 2, -d / 2 + u], normal: [-1, 0] };
}

const nice = (id: string) =>
  id
    .replace(/^[a-z0-9]+_/, "")
    .replace(/_(model|piece|outside|fixture)_/, " ")
    .replace(/_/g, " ");

/**
 * Builds a case's zones. `art` gives the live picture for an image id and `model` the live GLB, each null when not
 * made yet (the viewer draws a stand-in and lists it). People are placed in the rooms that name them, and anyone
 * else at their usual location.
 */
export function buildWorld(opts: {
  caseId: string;
  name: string;
  records: Rec[];
  art: (id: string) => string | null;
  model: (id: string) => string | null;
  people: Person[];
  character: (id: string) => string | null;
  start?: string;
}): World {
  const missing = new Set<string>();
  const pic = (id?: unknown) => {
    if (typeof id !== "string" || !id) return null;
    const u = opts.art(id);
    if (!u) missing.add(id);
    return u;
  };
  const zones: Zone[] = [];

  for (const r of opts.records) {
    if (r.reuse || !r.sizeFt) continue;
    const outdoor = r.type === "exterior";
    const [wf, df, hf] = r.sizeFt;
    const w = wf * FT, d = df * FT, H = (hf ?? (outdoor ? 30 : 10)) * FT;
    const wallRec = (r.wall ?? {}) as { image?: string; tileFt?: number; lower?: string; lowerTo?: number };
    const railAt = ((r.trim as Record<string, { atIn?: number }> | undefined)?.rail?.atIn ?? 34) / 12;
    const walls = {} as Record<Side, ZoneWall>;
    const doors: ZoneDoor[] = [];
    for (const side of SIDES) {
      const list = ((r.walls as Record<string, Img[]> | undefined)?.[side] ?? []) as Img[];
      const backdrop = list.find((p) => p.outside && !p.image);
      const pieces: ZonePiece[] = [];
      for (const p of list) {
        if (!p.image) continue;
        const x = Number(p.fromLeftFt ?? 0) * FT, y = Number(p.bottomFt ?? 0) * FT, pw = Number(p.widthFt ?? 3) * FT, ph = Number(p.heightFt ?? 7) * FT;
        pieces.push({ tex: pic(p.image), x, y, w: pw, h: ph, opening: !!p.opening, outside: p.opening ? pic(p.outside) : null, label: nice(p.image) });
        if (p.to && typeof p.to === "string") {
          const wp = wallPoint(side, w, d, x + pw / 2);
          doors.push({ to: p.to, label: nice(p.image), at: wp.at, span: pw / 2, normal: wp.normal, kind: "wall" });
        }
      }
      walls[side] = {
        tex: outdoor ? null : pic(wallRec.image),
        tile: (wallRec.tileFt ?? 4) * FT,
        lower: !outdoor && wallRec.lower ? { tex: pic(wallRec.lower), tile: (wallRec.tileFt ?? 4) * FT, to: (wallRec.lowerTo ?? railAt) * FT } : null,
        pieces,
        backdrop: backdrop ? pic(backdrop.outside) : null,
      };
    }

    const recModels = ((r.models as Img[] | undefined) ?? []) as Img[];
    const heightOf = (id: string) => Number((recModels.find((m) => m.image === id)?.sizeFt as number[] | undefined)?.[2] ?? 0) * FT;
    const models: ZoneModel[] = recModels
      .filter((m) => m.image)
      .map((m) => {
        const [mx, mz] = (m.atFt as number[]) ?? [wf / 2, df / 2];
        const s = ((m.sizeFt as number[]) ?? [3, 3, 3]).map((v) => v * FT);
        const elev = m.elevFt != null ? Number(m.elevFt) * FT : typeof m.on === "string" ? heightOf(m.on) : 0;
        const id = m.image as string;
        const file = opts.model(id);
        if (!file) missing.add(id);
        return {
          id,
          file,
          label: nice(id),
          pos: [mx * FT - w / 2, mz * FT - d / 2],
          elev,
          rotY: ROT[(m.facing as string) ?? "back"] ?? 0,
          rotX: Number(m.rotX ?? 0),
          size: s,
          solid: m.solid !== false,
          light: /lamp|lantern|candle|fireplace|stove|kiln|forge/.test(id),
        };
      });

    // Doors through a model: a building's front, an arch, a hatch or a ladder.
    for (const dd of ((r.doors as Img[] | undefined) ?? []) as Img[]) {
      if (typeof dd.model !== "string" || typeof dd.to !== "string") continue;
      const at = dd.atFt as number[] | undefined;
      const cands = models.filter((m) => m.id === dd.model);
      const m = at ? cands.sort((a, b) => Math.hypot(a.pos[0] - (at[0] * FT - w / 2), a.pos[1] - (at[1] * FT - d / 2)) - Math.hypot(b.pos[0] - (at[0] * FT - w / 2), b.pos[1] - (at[1] * FT - d / 2)))[0] : cands[0];
      if (!m) continue;
      const facing = Object.entries(ROT).find(([, v]) => v === m.rotY)?.[0] ?? "back";
      const n = NORMAL[facing];
      const [mw, md] = m.size;
      // Walk-through things (arches, ladders, hatches) are entered at their middle; buildings at their front face.
      const through = /arch|gate|ladder|hatch|trapdoor/.test(m.id);
      const reach = through ? 0 : md / 2 + 0.3;
      let at2 = [m.pos[0] + n[0] * reach, m.pos[1] + n[1] * reach];
      // Keep the trigger where you can stand (a building on the edge of the square).
      at2 = [Math.max(-w / 2 + 0.35, Math.min(w / 2 - 0.35, at2[0])), Math.max(-d / 2 + 0.35, Math.min(d / 2 - 0.35, at2[1]))];
      doors.push({ to: dd.to, label: nice(m.id), at: at2, span: through ? Math.max(0.6, mw / 2 - 0.3) : Math.max(0.9, Math.min(mw / 3, 3)), normal: n, kind: through ? "pass" : "model" });
      if (through) m.solid = false;
    }

    const trimRec = (r.trim ?? {}) as Record<string, { image?: string; heightIn?: number; atIn?: number }>;
    const trim: Zone["trim"] = {};
    if (!outdoor) {
      if (trimRec.base) trim.base = { tex: pic(trimRec.base.image), h: ((trimRec.base.heightIn ?? 6) / 12) * FT };
      if (trimRec.rail) trim.rail = { tex: pic(trimRec.rail.image), h: ((trimRec.rail.heightIn ?? 3) / 12) * FT, at: ((trimRec.rail.atIn ?? 34) / 12) * FT };
      if (trimRec.crown) trim.crown = { tex: pic(trimRec.crown.image), h: ((trimRec.crown.heightIn ?? 4) / 12) * FT };
    }
    const fl = (r.floor ?? {}) as { image?: string; tileFt?: number };
    const ce = (r.ceiling ?? {}) as { image?: string; tileFt?: number };
    zones.push({
      id: r.location ?? r.id,
      room: r.id,
      name: r.name,
      note: r.note ?? "",
      outdoor,
      size: [w, d, H],
      floor: { tex: pic(fl.image), tile: (fl.tileFt ?? 4) * FT },
      ceiling: outdoor ? null : { tex: pic(ce.image), tile: (ce.tileFt ?? 4) * FT },
      trim,
      fixtures: (((r.fixtures as Img[] | undefined) ?? []) as Img[]).map((f) => ({
        tex: pic(f.image),
        pos: [((f.atFt as number[])?.[0] ?? wf / 2) * FT - w / 2, ((f.atFt as number[])?.[1] ?? df / 2) * FT - d / 2],
        size: ((f.sizeFt as number[]) ?? [2, 2]).map((v) => v * FT),
        light: !!f.light,
      })),
      walls,
      models,
      decals: (((r.decals as Img[] | undefined) ?? []) as Img[]).map((dc) => ({
        tex: pic(dc.image),
        pos: [((dc.atFt as number[])?.[0] ?? 0) * FT - w / 2, ((dc.atFt as number[])?.[1] ?? 0) * FT - d / 2],
        size: ((dc.sizeFt as number[]) ?? [4, 4]).map((v) => v * FT),
        tile: dc.tileFt ? Number(dc.tileFt) * FT : 0,
        rotY: Number(dc.rotY ?? 0),
      })),
      doors,
      people: [],
    });
  }

  // A way back through every door: a hatch you climb down has its ladder, so the ladder's room gets the hatch.
  for (const z of zones)
    for (const dr of z.doors) {
      const t = zones.find((q) => q.id === dr.to);
      if (!t || t.doors.some((b) => b.to === z.id)) continue;
      const m = t.models.find((mm) => /hatch|trapdoor|ladder|stair/.test(mm.id));
      if (!m) continue;
      m.solid = false;
      t.doors.push({ to: z.id, label: nice(m.id), at: [m.pos[0], m.pos[1]], span: Math.max(0.6, Math.min(m.size[0], m.size[1]) / 2), normal: [0, 1], kind: "pass" });
    }

  // People: each once, at their usual place when a room there names them, otherwise the first room that does.
  const byId = new Map(opts.people.map((p) => [p.id, p]));
  const home = new Map<string, string>();
  for (const p of opts.people) {
    const rooms = zones.filter((z) => ((opts.records.find((r) => r.id === z.room)?.people as string[] | undefined) ?? []).includes(p.id));
    const at = rooms.find((z) => z.id === p.locationId) ?? rooms[0] ?? (p.locationId && !p.victim ? zones.find((z) => z.id === p.locationId) : undefined);
    if (at) home.set(p.id, at.id);
  }
  for (const z of zones) {
    const ids = opts.people.filter((p) => home.get(p.id) === z.id).map((p) => p.id);
    for (const id of ids) {
      const p = byId.get(id);
      if (!p) continue;
      const file = opts.character(id);
      if (!file) missing.add(`${id} (3D character)`);
      z.people.push({ id, name: p.name, file, height: p.height ?? 1.05, pos: spot(z), rotY: 0 });
    }
  }
  const start = opts.start && zones.some((z) => z.id === opts.start) ? opts.start : zones[0]?.id ?? "";
  return { caseId: opts.caseId, name: opts.name, start, zones, missing: [...missing].sort() };
}

/** A clear spot to stand: near the middle, a little toward the front, away from furniture, doors and other people. */
function spot(z: Zone) {
  const [w, d] = z.size;
  const clear = (x: number, y: number) =>
    z.models.every((m) => {
      if (!m.solid || m.elev > 0.05) return true;
      const turned = Math.abs(m.rotY) === 90;
      const hw = (turned ? m.size[1] : m.size[0]) / 2 + 0.6, hd = (turned ? m.size[0] : m.size[1]) / 2 + 0.6;
      return Math.abs(x - m.pos[0]) > hw || Math.abs(y - m.pos[1]) > hd;
    }) &&
    z.doors.every((dr) => Math.hypot(x - dr.at[0], y - dr.at[1]) > 2) &&
    z.people.every((p) => Math.hypot(x - p.pos[0], y - p.pos[1]) > 1.3);
  const goal = [0, -d * 0.1];
  let best: number[] | null = null;
  for (let gx = -w / 2 + 0.8; gx <= w / 2 - 0.8; gx += 0.4)
    for (let gz = -d / 2 + 0.8; gz <= d / 2 - 0.8; gz += 0.4)
      if (clear(gx, gz) && (!best || Math.hypot(gx - goal[0], gz - goal[1]) < Math.hypot(best[0] - goal[0], best[1] - goal[1]))) best = [gx, gz];
  return best ?? goal;
}
