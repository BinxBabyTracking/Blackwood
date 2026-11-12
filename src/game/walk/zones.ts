/*
 * Walkable zones built straight from a case's room records (`rooms` in art/manifest.json, see art/WALKABLE.md) and
 * whatever art is live on Admin. One zone per room: an interior (floor, tiled walls with pieces and openings, trim,
 * ceiling and lamps, furniture models) or an exterior (ground, path decals, the surroundings painted on all four
 * sides, buildings and props as models). Doors join the zones: a wall piece or a model with `to` takes you to that
 * place, arriving at its door back.
 *
 * Metres, floor at y 0, each zone centred on x/z 0 with its front wall toward -z (as the C001 house).
 */

export type ZonePiece = { tex: string | null; x: number; y: number; w: number; h: number; opening: boolean; outside: string | null; label: string; to: string | null; fixed: boolean };
export type ZoneWall = { tex: string | null; tile: number; lower: { tex: string | null; tile: number; to: number } | null; pieces: ZonePiece[]; backdrop: string | null };
export type ZoneModel = { id: string; file: string | null; label: string; pos: number[]; elev: number; rotY: number; rotX: number; size: number[]; solid: boolean; light: boolean; scatter?: boolean; block?: number; level?: number; lights?: boolean; face?: string; turn?: number; door?: { to: string; through: boolean; dir?: number } };

/** A room as Ian arranged it in Edit mode: replaces the generated layout. Model heights are above the ground. */
export type SavedLayout = {
  v: 1;
  size: number[];
  models: ZoneModel[];
  pieces: Record<string, { x: number; y: number; w: number; h: number }[]>;
  fixtures?: Zone["fixtures"];
  decals?: Zone["decals"];
  /** Where each person stands (or sits), by id. */
  people?: { id: string; pos: number[]; rotY: number; elev?: number; sit?: boolean }[];
};
/** Rolling ground for an outdoor place (metres, zone-centred): flat pads blended into hills, and paths. */
export type Terrain = {
  floor: string | null;
  path: string | null;
  pads: { rect: number[]; h: number; fall: number }[];
  hills: number[][];
  paths: { pts: number[][]; w: number }[];
  /** The walkable size (width, depth); past it the ground rises into wooded hills that fade into the snow. */
  rim?: number[];
};
export type ZoneDoor = { to: string; label: string; at: number[]; span: number; normal: number[]; kind: "wall" | "model" | "pass"; mi?: number; y?: number };
/** A flight of stairs (height running along an axis) or a landing (flat), in zone metres. */
export type Stair = { rect: number[]; h0: number; h1: number; axis?: "x" | "z"; from?: number; to?: number };
export type ZonePerson = { id: string; name: string; file: string | null; height: number; pos: number[]; rotY: number; elev?: number; sit?: boolean };
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
  terrain?: Terrain;
  stairs?: Stair[];
};
export type Side = "front" | "back" | "left" | "right";
export type World = { caseId: string; name: string; start: string; zones: Zone[]; missing: string[] };

const FT = 0.3048;
const SIDES: Side[] = ["front", "back", "left", "right"];
/** Turn (degrees) that points a model's front at that wall. Meshy isn't consistent, so a model can carry its own extra turn (art_turns). */
const ROT: Record<string, number> = { back: 0, front: 180, left: -90, right: 90 };
const norm = (deg: number) => ((((deg + 180) % 360) + 360) % 360) - 180;
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
  /** A room's layout as arranged in Edit mode, if it has one. */
  saved?: (room: string) => SavedLayout | null;
  /** Extra turn (degrees) for a model Meshy built facing the wrong way. */
  turn?: (id: string) => number;
  /** Scale indoor floor plans (not heights) by this; 1 keeps the records' sizes. */
  shrink?: number;
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
    if (r.reuse || r.mergedInto || !r.sizeFt) continue;
    const outdoor = r.type === "exterior";
    const [wf, df, hf] = r.sizeFt;
    const w = wf * FT, d = df * FT, H = (hf ?? (outdoor ? 30 : 10)) * FT;
    const wallRec = (r.wall ?? {}) as { image?: string; tileFt?: number; lower?: string; lowerTo?: number };
    const railAt = ((r.trim as Record<string, { atIn?: number }> | undefined)?.rail?.atIn ?? 34) / 12;
    const walls = {} as Record<Side, ZoneWall>;
    for (const side of SIDES) {
      const list = ((r.walls as Record<string, Img[]> | undefined)?.[side] ?? []) as Img[];
      const backdrop = list.find((p) => p.outside && !p.image);
      const pieces: ZonePiece[] = [];
      for (const p of list) {
        if (!p.image) continue;
        const x = Number(p.fromLeftFt ?? 0) * FT, y = Number(p.bottomFt ?? 0) * FT, pw = Number(p.widthFt ?? 3) * FT, ph = Number(p.heightFt ?? 7) * FT;
        const fixedSize = !!p.opening || !!p.to || /door|window|arch|hatch/.test(String(p.image));
        pieces.push({ tex: pic(p.image), x, y, w: pw, h: ph, opening: !!p.opening, outside: p.opening ? pic(p.outside) : null, label: nice(p.image), to: typeof p.to === "string" ? p.to : null, fixed: fixedSize });
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
          rotY: norm((ROT[(m.facing as string) ?? "back"] ?? 0) + (opts.turn?.(id) ?? 0)),
          face: (m.facing as string) ?? "back",
          turn: opts.turn?.(id) ?? 0,
          rotX: Number(m.rotX ?? 0),
          size: s,
          solid: m.solid !== false,
          light: /lamp|lantern|candle|fireplace|stove|kiln|forge/.test(id),
          level: m.levelFt != null ? Number(m.levelFt) * FT : undefined,
        };
      });

    // Doors through a model: a building's front, an arch, a hatch or a ladder.
    for (const dd of ((r.doors as Img[] | undefined) ?? []) as Img[]) {
      if (typeof dd.model !== "string" || typeof dd.to !== "string") continue;
      const at = dd.atFt as number[] | undefined;
      const cands = models.filter((m) => m.id === dd.model);
      const m = at ? cands.sort((a, b) => Math.hypot(a.pos[0] - (at[0] * FT - w / 2), a.pos[1] - (at[1] * FT - d / 2)) - Math.hypot(b.pos[0] - (at[0] * FT - w / 2), b.pos[1] - (at[1] * FT - d / 2)))[0] : cands[0];
      if (!m) continue;
      const through = /arch|gate|ladder|hatch|trapdoor|well/.test(m.id);
      m.door = { to: dd.to, through };
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
      doors: [],
      people: [],
    });
  }

  // Places folded into another (the outdoor areas of one village) lead there instead.
  const alias = new Map<string, string>();
  for (const r of opts.records) {
    const into = opts.records.find((q) => q.id === r.mergedInto);
    if (into && r.location) alias.set(r.location, into.location ?? into.id);
  }
  for (const z of zones) for (const side of SIDES) for (const p of z.walls[side].pieces) if (p.to && alias.has(p.to)) p.to = alias.get(p.to)!;
  for (const z of zones) for (const m of z.models) if (m.door && alias.has(m.door.to)) m.door.to = alias.get(m.door.to)!;
  for (const p of opts.people) if (p.locationId && alias.has(p.locationId)) p.locationId = alias.get(p.locationId)!;

  // Smaller floor plans indoors (the records were drawn half as big again for multiplayer), then the doors.
  for (const z of zones) {
    const rec = opts.records.find((r) => r.id === z.room);
    const saved = opts.saved?.(z.room);
    // Stairs built in code (they replace any Meshy stair and landing in the room).
    const stairRec = rec?.stairs as { rectFt: number[]; hFt?: number; axis?: "x" | "z"; fromFt?: number; toFt?: number; h0Ft?: number; h1Ft?: number }[] | undefined;
    if (stairRec) {
      const [W0, D0] = z.size;
      z.stairs = stairRec.map((st) => {
        const r4 = [st.rectFt[0] * FT - W0 / 2, st.rectFt[1] * FT - D0 / 2, st.rectFt[2] * FT - W0 / 2, st.rectFt[3] * FT - D0 / 2];
        const off = st.axis === "x" ? W0 / 2 : D0 / 2;
        return st.axis
          ? { rect: r4, axis: st.axis, from: st.fromFt! * FT - off, to: st.toFt! * FT - off, h0: st.h0Ft! * FT, h1: st.h1Ft! * FT }
          : { rect: r4, h0: st.hFt! * FT, h1: st.hFt! * FT };
      });
      z.models = z.models.filter((mm) => !/_model_(stair|landing)$/.test(mm.id));
    }
    if (saved) {
      applySaved(z, saved, opts.model);
      if (z.stairs) z.models = z.models.filter((mm) => !/_model_(stair|landing)$/.test(mm.id));
      if (z.outdoor && rec?.terrain) dressLand(z, rec.terrain as LandRec, opts.model, pic, true);
      z.doors = doorsOf(z);
      continue;
    }
    if (!z.outdoor) {
      // Shrink as far as the room allows while you can still walk between all its doors.
      const small = z.size[0] * z.size[1] < 250 * FT * FT || !!z.stairs;
      const orig = structuredClone(z);
      let k = !small && (opts.shrink ?? 1) < 1 ? fitShrink(z, opts.shrink!) : 1;
      for (;;) {
        const t = structuredClone(orig);
        if (k < 1) shrinkZone(t, k);
        if ((opts.shrink ?? 1) < 1 && !t.stairs) fillRoom(t);
        clearWalls(t);
        lowerCeiling(t);
        t.doors = doorsOf(t);
        if (k >= 1 || walkable(t)) {
          Object.assign(z, t);
          break;
        }
        k = Math.min(1, k + 0.05);
      }
    } else z.doors = doorsOf(z);
    if (z.outdoor && rec?.terrain) dressLand(z, rec.terrain as LandRec, opts.model, pic);
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
      const rec = opts.records.find((r) => r.id === z.room);
      const put = opts.saved?.(z.room)?.people?.find((q) => q.id === id);
      if (put) {
        z.people.push({ id, name: p.name, file, height: p.height ?? 1.05, pos: [...put.pos], rotY: put.rotY, elev: put.elev, sit: put.sit });
        continue;
      }
      // A usual spot, in feet from the left and front walls of the room as planned (scaled to the room as built).
      const want = ((rec?.spotsFt as Record<string, number[]> | undefined) ?? {})[id];
      const plan = (rec?.sizeFt as number[] | undefined) ?? [z.size[0] / FT, z.size[1] / FT];
      const goal = want ? [(want[0] / plan[0] - 0.5) * z.size[0], (want[1] / plan[1] - 0.5) * z.size[1]] : undefined;
      z.people.push({ id, name: p.name, file, height: p.height ?? 1.05, pos: spot(z, goal), rotY: 0 });
    }
  }
  const start = opts.start && zones.some((z) => z.id === opts.start) ? opts.start : zones[0]?.id ?? "";
  return { caseId: opts.caseId, name: opts.name, start, zones, missing: [...missing].sort() };
}

/** A clear spot to stand: near the middle, a little toward the front, away from furniture, doors and other people. */
function spot(z: Zone, goalAt?: number[]) {
  const [w, d] = z.size;
  const clear = (x: number, y: number) =>
    z.models.every((m) => {
      if (!m.solid || m.elev > 0.05) return true;
      const [fw, fd] = floorSize(m);
      const hw = fw / 2 + 0.6, hd = fd / 2 + 0.6;
      return Math.abs(x - m.pos[0]) > hw || Math.abs(y - m.pos[1]) > hd;
    }) &&
    z.doors.every((dr) => Math.hypot(x - dr.at[0], y - dr.at[1]) > 2.8) &&
    z.people.every((p) => Math.hypot(x - p.pos[0], y - p.pos[1]) > 1.3);
  const goal = goalAt ?? [0, -d * 0.1];
  let best: number[] | null = null;
  // Search outward from the goal; big outdoor places only near it.
  const reach = goalAt || z.outdoor ? 12 : Math.max(w, d);
  for (let gx = Math.max(-w / 2 + 0.8, goal[0] - reach); gx <= Math.min(w / 2 - 0.8, goal[0] + reach); gx += 0.4)
    for (let gz = Math.max(-d / 2 + 0.8, goal[1] - reach); gz <= Math.min(d / 2 - 0.8, goal[1] + reach); gz += 0.4)
      if (clear(gx, gz) && (!best || Math.hypot(gx - goal[0], gz - goal[1]) < Math.hypot(best[0] - goal[0], best[1] - goal[1]))) best = [gx, gz];
  return best ?? goal;
}

/** Every way out of a zone: wall pieces that lead somewhere, and buildings, arches, ladders and hatches. */
export function doorsOf(z: Zone): ZoneDoor[] {
  const [w, d] = z.size;
  const out: ZoneDoor[] = [];
  for (const side of SIDES)
    for (const p of z.walls[side].pieces)
      if (p.to) {
        const wp = wallPoint(side, w, d, p.x + p.w / 2);
        out.push({ to: p.to, label: p.label, at: wp.at, span: p.w / 2, normal: wp.normal, kind: "wall", y: p.y });
      }
  for (const m of z.models) {
    if (!m.door) continue;
    const { to, through } = m.door;
    // The way in faces the side set in Edit mode (degrees, world), or the side the record names.
    const n = m.door.dir != null ? [Math.round(Math.sin((m.door.dir * Math.PI) / 180)), Math.round(Math.cos((m.door.dir * Math.PI) / 180))] : NORMAL[m.face ?? "back"];
    const [mw, md] = Math.abs(n[0]) > 0.5 ? [floorSize(m)[1], floorSize(m)[0]] : floorSize(m);
    // Walk-through things (arches, ladders, hatches) are entered at their middle; buildings at their front face.
    const reach = through ? 0 : md / 2 + 0.3;
    const at = [m.pos[0] + n[0] * reach, m.pos[1] + n[1] * reach];
    // Keep the trigger where you can stand (a building on the edge of the square).
    const at2 = [Math.max(-w / 2 + 0.35, Math.min(w / 2 - 0.35, at[0])), Math.max(-d / 2 + 0.35, Math.min(d / 2 - 0.35, at[1]))];
    out.push({ to, label: m.label, at: at2, span: through ? Math.max(0.6, mw / 2 - 0.3) : Math.max(0.9, Math.min(mw / 3, 3)), normal: n, kind: through ? "pass" : "model", mi: z.models.indexOf(m) });
    if (through) m.solid = false;
  }
  return out;
}

/** Width and depth a model takes on the floor, turned as it stands. */
export function floorSize(m: ZoneModel) {
  const a = (m.rotY * Math.PI) / 180, c = Math.abs(Math.cos(a)), s = Math.abs(Math.sin(a));
  return [m.size[0] * c + m.size[1] * s, m.size[0] * s + m.size[1] * c];
}
const footprint = (m: ZoneModel) => {
  const [fw, fd] = floorSize(m);
  return { x0: m.pos[0] - fw / 2, x1: m.pos[0] + fw / 2, z0: m.pos[1] - fd / 2, z1: m.pos[1] + fd / 2 };
};

/**
 * Shrinks a room's floor plan by k, keeping heights and the sizes of furniture, doors and windows. Furniture that
 * stands together (a table and its chairs) moves as one; anything against a wall stays against it. Pictures on the
 * walls (boards, maps) shrink with the wall.
 */
function shrinkZone(z: Zone, k: number) {
  const [W, D] = z.size;
  const Wn = W * k, Dn = D * k;
  const NEAR = 1.0;
  // Furniture groups: footprints within half a metre of each other.
  const ms = z.models;
  const parent = ms.map((_, i) => i);
  const find = (i: number): number => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  const fp = ms.map(footprint);
  for (let i = 0; i < ms.length; i++)
    for (let j = i + 1; j < ms.length; j++) {
      const a = fp[i], b = fp[j];
      if (a.x0 < b.x1 + 0.5 && b.x0 < a.x1 + 0.5 && a.z0 < b.z1 + 0.5 && b.z0 < a.z1 + 0.5) parent[find(i)] = find(j);
    }
  const groups = new Map<number, number[]>();
  ms.forEach((_, i) => groups.set(find(i), [...(groups.get(find(i)) ?? []), i]));
  const axis = (lo: number, hi: number, half: number, halfN: number) => {
    const gapLo = lo + half, gapHi = half - hi;
    if (gapLo < NEAR && gapLo <= gapHi) return -halfN + gapLo - lo;
    if (gapHi < NEAR) return halfN - gapHi - hi;
    const c = (lo + hi) / 2;
    return c * k - c;
  };
  for (const idx of groups.values()) {
    const x0 = Math.min(...idx.map((i) => fp[i].x0)), x1 = Math.max(...idx.map((i) => fp[i].x1));
    const z0 = Math.min(...idx.map((i) => fp[i].z0)), z1 = Math.max(...idx.map((i) => fp[i].z1));
    const dx = axis(x0, x1, W / 2, Wn / 2), dz = axis(z0, z1, D / 2, Dn / 2);
    for (const i of idx) ms[i].pos = [ms[i].pos[0] + dx, ms[i].pos[1] + dz];
  }
  // Wall pieces: pictures shrink with the wall; doors and windows keep their size and their place near a corner.
  for (const side of SIDES) {
    const L = side === "front" || side === "back" ? W : D;
    const Ln = L * k;
    const list = z.walls[side].pieces;
    for (const p of list) {
      if (!p.fixed) {
        const c = p.x + p.w / 2;
        p.w *= k;
        p.h *= k;
        p.x = c * k - p.w / 2;
      } else {
        const gapL = p.x, gapR = L - p.x - p.w;
        if (gapL < NEAR && gapL <= gapR) p.x = gapL;
        else if (gapR < NEAR) p.x = Ln - gapR - p.w;
        else p.x = (p.x + p.w / 2) * k - p.w / 2;
      }
    }
    // Nothing overlapping on the same wall: push apart, then pull back inside the wall.
    const sorted = [...list].sort((a, b) => a.x - b.x);
    for (let i = 1; i < sorted.length; i++) {
      const a = sorted[i - 1], b = sorted[i];
      if (a.y < b.y + b.h && b.y < a.y + a.h && b.x < a.x + a.w + 0.15) b.x = a.x + a.w + 0.15;
    }
    for (let i = sorted.length - 1; i >= 0; i--) {
      const b = sorted[i];
      const limit = i === sorted.length - 1 ? Ln - 0.1 : sorted[i + 1].x - 0.15;
      if (b.x + b.w > limit) b.x = Math.max(0.1, limit - b.w);
    }
  }
  z.fixtures = z.fixtures.map((f) => ({ ...f, pos: [f.pos[0] * k, f.pos[1] * k] }));
  z.decals = z.decals.map((dc) => ({ ...dc, pos: [dc.pos[0] * k, dc.pos[1] * k], size: [dc.size[0] * k, dc.size[1] * k] }));
  z.size = [Wn, Dn, z.size[2]];
}

/** Moves furniture standing against a wall out from in front of the pictures, doors and windows on that wall. */
function clearWalls(z: Zone) {
  const [W, D] = z.size;
  for (const m of z.models) {
    const f = footprint(m);
    const walls: { side: Side; along: [number, number]; L: number; set: (u0: number) => void }[] = [];
    // Positions along each wall measured from its left end (seen from inside), as the pieces are.
    if (f.z0 + D / 2 < 0.6) walls.push({ side: "front", along: [f.x0 + W / 2, f.x1 + W / 2], L: W, set: (u0) => (m.pos = [u0 - W / 2 + (f.x1 - f.x0) / 2, m.pos[1]]) });
    if (D / 2 - f.z1 < 0.6) walls.push({ side: "back", along: [W / 2 - f.x1, W / 2 - f.x0], L: W, set: (u0) => (m.pos = [W / 2 - u0 - (f.x1 - f.x0) / 2, m.pos[1]]) });
    if (f.x0 + W / 2 < 0.6) walls.push({ side: "left", along: [D / 2 - f.z1, D / 2 - f.z0], L: D, set: (u0) => (m.pos = [m.pos[0], D / 2 - u0 - (f.z1 - f.z0) / 2]) });
    if (W / 2 - f.x1 < 0.6) walls.push({ side: "right", along: [f.z0 + D / 2, f.z1 + D / 2], L: D, set: (u0) => (m.pos = [m.pos[0], u0 - D / 2 + (f.z1 - f.z0) / 2]) });
    for (const wl of walls) {
      const len = wl.along[1] - wl.along[0];
      const blocks = z.walls[wl.side].pieces.filter((p) => p.y < m.elev + m.size[2] && m.elev < p.y + p.h).map((p) => [p.x - 0.1, p.x + p.w + 0.1]);
      const hits = (u0: number) => blocks.some(([a, b]) => u0 < b && a < u0 + len);
      if (!hits(wl.along[0])) continue;
      // The nearest clear stretch, either way along the wall.
      let best: number | null = null;
      for (let step = 0.1; step < wl.L; step += 0.1) {
        for (const u0 of [wl.along[0] - step, wl.along[0] + step])
          if (u0 >= 0.05 && u0 + len <= wl.L - 0.05 && !hits(u0)) {
            best = u0;
            break;
          }
        if (best != null) break;
      }
      if (best != null) wl.set(best);
    }
  }
}

/**
 * Indoor ceilings no taller than the room needs: a foot above its tallest door, or the top of its tallest furniture
 * when that is higher (a tall room for a reason). Pictures and windows hung higher than that slide down (and shrink if they must) to fit.
 */
function lowerCeiling(z: Zone) {
  const H = z.size[2];
  const isDoor = (p: ZonePiece) => !!p.to || /door/.test(p.label);
  let door = 0;
  for (const side of SIDES) for (const p of z.walls[side].pieces) if (isDoor(p)) door = Math.max(door, p.y + p.h);
  let need = door ? door + 1 * FT : 8 * FT;
  for (const st of z.stairs ?? []) need = Math.max(need, Math.max(st.h0, st.h1) + 8 * FT);
  for (const m of z.models) need = Math.max(need, m.elev + m.size[2] + 0.25 * FT);
  const Hn = Math.min(H, need);
  for (const side of SIDES)
    for (const p of z.walls[side].pieces) {
      if (isDoor(p)) continue;
      const room = Hn - 0.4 * FT;
      if (p.y + p.h <= room) continue;
      if (p.h > room - 1 * FT) {
        const k = (room - 1 * FT) / p.h;
        p.x += (p.w * (1 - k)) / 2;
        p.w *= k;
        p.h *= k;
      }
      p.y = Math.max(1 * FT, room - p.h);
    }
  z.size = [z.size[0], z.size[1], Hn];
}

const floorArea = (z: Zone) =>
  z.models.filter((m) => m.solid && m.elev < 0.05).reduce((a, m) => a + m.size[0] * m.size[1], 0) + z.people.length * 0.6;

/**
 * How far to shrink a room's floor plan: enough that its furniture covers about a quarter of the floor, between
 * 55% and `max`, and never so far that a furniture group or a wall's doors and windows no longer fit.
 */
function fitShrink(z: Zone, max: number) {
  const [W, D] = z.size;
  let k = Math.sqrt(floorArea(z) / (0.18 * W * D));
  k = Math.min(max, Math.max(0.65, k));
  let kmin = 0;
  for (const m of z.models) {
    const f = footprint(m);
    kmin = Math.max(kmin, (f.x1 - f.x0 + 0.4) / W, (f.z1 - f.z0 + 0.4) / D);
  }
  for (const side of SIDES) {
    const L = side === "front" || side === "back" ? W : D;
    const fixed = z.walls[side].pieces.filter((p) => p.fixed).reduce((a, p) => a + p.w + 0.3, 0.3);
    kmin = Math.max(kmin, fixed / L);
  }
  return Math.min(1, Math.max(k, kmin));
}

/** Plain furniture that can stand in a room more than once (never chairs, stools or tables: those belong together). */
const COPYABLE = /gears|weights|workbench|shel(f|ves)|crate|sack|cabinet|rack|barrel|files|bookcase|apparatus|haybale|dresser|lectern|counter|stall|coalbin|tack|cart|toyshelf|workbench|marver|pipes/;

/**
 * Fills a sparse room with second copies of its plain furniture, standing against the walls clear of doors,
 * windows, pictures and everything else, until the furniture covers about a third of the floor.
 */
function fillRoom(z: Zone) {
  const [W, D] = z.size;
  const target = 0.32 * W * D;
  const cands = z.models.filter((m) => COPYABLE.test(m.id) && m.elev < 0.05 && m.solid).sort((a, b) => b.size[0] * b.size[1] - a.size[0] * a.size[1]);
  if (!cands.length) return;
  const seen = new Set<string>();
  const kinds = cands.filter((m) => !seen.has(m.id) && seen.add(m.id));
  const doorPts = SIDES.flatMap((side) => z.walls[side].pieces.filter((p) => p.to || /door/.test(p.label)).map((p) => wallPoint(side, W, D, p.x + p.w / 2).at));
  const fits = (m: ZoneModel) => {
    const f = footprint(m);
    if (f.x0 < -W / 2 + 0.03 || f.x1 > W / 2 - 0.03 || f.z0 < -D / 2 + 0.03 || f.z1 > D / 2 - 0.03) return false;
    for (const o of z.models) {
      if (o.elev >= m.elev + m.size[2] || m.elev >= o.elev + o.size[2]) continue;
      const g = footprint(o);
      if (f.x0 < g.x1 + 0.5 && g.x0 < f.x1 + 0.5 && f.z0 < g.z1 + 0.5 && g.z0 < f.z1 + 0.5) return false;
    }
    if (m.elev < 2.6) for (const [x, y] of doorPts) if (x > f.x0 - 1.6 && x < f.x1 + 1.6 && y > f.z0 - 1.6 && y < f.z1 + 1.6) return false;
    // Not in front of anything on the walls it stands against.
    const top = m.elev + m.size[2];
    const against: [Side, number, number][] = [];
    if (f.z0 + D / 2 < 0.4) against.push(["front", f.x0 + W / 2, f.x1 + W / 2]);
    if (D / 2 - f.z1 < 0.4) against.push(["back", W / 2 - f.x1, W / 2 - f.x0]);
    if (f.x0 + W / 2 < 0.4) against.push(["left", D / 2 - f.z1, D / 2 - f.z0]);
    if (W / 2 - f.x1 < 0.4) against.push(["right", f.z0 + D / 2, f.z1 + D / 2]);
    for (const [side, u0, u1] of against) for (const p of z.walls[side].pieces) if (p.y < top && p.y + p.h > m.elev && u0 < p.x + p.w + 0.1 && p.x - 0.1 < u1) return false;
    return true;
  };
  let area = floorArea(z);
  let added = 0;
  for (let round = 0; round < 3 && area < target && added < 10; round++)
    for (const src of kinds) {
      if (area >= target || added >= 10) break;
      const [sw, sd] = src.size;
      // Back against a wall, facing into the room.
      const spots: { pos: number[]; rotY: number }[] = [];
      for (let u = -W / 2 + sw / 2 + 0.05; u <= W / 2 - sw / 2 - 0.05; u += 0.3) {
        spots.push({ pos: [u, -D / 2 + sd / 2 + 0.05], rotY: ROT.back });
        spots.push({ pos: [u, D / 2 - sd / 2 - 0.05], rotY: ROT.front });
      }
      for (let u = -D / 2 + sw / 2 + 0.05; u <= D / 2 - sw / 2 - 0.05; u += 0.3) {
        spots.push({ pos: [-W / 2 + sd / 2 + 0.05, u], rotY: ROT.right });
        spots.push({ pos: [W / 2 - sd / 2 - 0.05, u], rotY: ROT.left });
      }
      // Furthest from what's already there first, so copies spread out.
      const dist = (p: number[]) => Math.min(...z.models.map((o) => Math.hypot(o.pos[0] - p[0], o.pos[1] - p[1])));
      spots.sort((a, b) => dist(b.pos) - dist(a.pos));
      // In a tall room (a clock tower), machinery also goes up the walls.
      const levels = [0];
      if (/gear/.test(src.id)) for (let e = src.size[2] * 0.9; e + src.size[2] < z.size[2] - 0.3; e += src.size[2] * 0.9) levels.push(e);
      for (const lv of levels) for (const sp of spots) {
        const copy: ZoneModel = { ...src, pos: sp.pos, rotY: sp.rotY, rotX: 0, elev: lv, door: undefined };
        if (!fits(copy)) continue;
        z.models.push(copy);
        if (!lv) area += sw * sd;
        added++;
        if (!lv || levels.length < 2) break;
      }
    }
}

type LandRec = {
  floorImage?: string;
  pathImage?: string;
  pads?: { rectFt: number[]; heightFt: number; fallFt: number }[];
  hills?: number[][];
  paths?: { pointsFt: number[][]; widthFt: number }[];
  lampEveryFt?: number;
  buildingFallFt?: number;
  buildingMarginFt?: number;
  ring?: { centerFt: number[]; radiusFt: number[]; count: number; images: string[]; lights?: boolean };
  scatter?: { images: string[]; count: number; clearFt: number }[];
};

const smooth = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));

/** Ground height (metres) at a point of an outdoor place: hills everywhere, flattened to each pad's level. */
export function heightAt(t: Terrain | undefined, x: number, z: number) {
  if (!t) return 0;
  let h = 0;
  for (const [hx, hz, hh, hr] of t.hills) h += hh * Math.exp(-((x - hx) ** 2 + (z - hz) ** 2) / (hr * hr));
  for (const p of t.pads) {
    const dx = Math.max(p.rect[0] - x, 0, x - p.rect[2]);
    const dz = Math.max(p.rect[1] - z, 0, z - p.rect[3]);
    const w = 1 - smooth(Math.hypot(dx, dz) / p.fall);
    h = h + (p.h - h) * w;
  }
  if (t.rim) {
    // Beyond the edge you can walk to: the land climbs gently into rolling hills.
    const o = Math.max(Math.abs(x) - t.rim[0] / 2, Math.abs(z) - t.rim[1] / 2, 0);
    if (o > 0) {
      const k = smooth(Math.min(1, o / 30));
      h += o * 0.1 + k * (5 + 3 * Math.sin(x * 0.045 + z * 0.02) + 2.5 * Math.sin(z * 0.06 - x * 0.03 + 2) + 1.5 * Math.sin((x - z) * 0.11));
      // Far off, mountains.
      const m = smooth((o - 90) / 140);
      if (m > 0) h += m * (35 + 22 * Math.sin(x * 0.013 + 1.3) * Math.sin(z * 0.017 + 0.4) + 14 * Math.sin((x + z) * 0.021));
    }
  }
  return h;
}

const segDist = (x: number, z: number, a: number[], b: number[]) => {
  const ux = b[0] - a[0], uz = b[1] - a[1];
  const t = Math.max(0, Math.min(1, ((x - a[0]) * ux + (z - a[1]) * uz) / (ux * ux + uz * uz || 1)));
  return Math.hypot(x - a[0] - ux * t, z - a[1] - uz * t);
};
const padWeight = (t: Terrain, x: number, z: number) =>
  Math.max(0, ...t.pads.map((p) => 1 - smooth(Math.hypot(Math.max(p.rect[0] - x, 0, x - p.rect[2]), Math.max(p.rect[1] - z, 0, z - p.rect[3])) / p.fall)));

/**
 * A path from the front of every building to the square, or to a path that gets there: straight out from the
 * door, then round anything in the way, joining the nearest part of the network. Nearest buildings go first so the
 * far ones can join their paths.
 */
export function linkBuildings(z: Zone, t: Terrain) {
  const [W, D] = z.size;
  const cob = z.decals.filter((dc) => dc.tex === t.path).sort((a, b) => b.size[0] * b.size[1] - a.size[0] * a.size[1])[0];
  const square = cob ? [cob.pos[0] - cob.size[0] / 2, cob.pos[1] - cob.size[1] / 2, cob.pos[0] + cob.size[0] / 2, cob.pos[1] + cob.size[1] / 2] : t.pads[t.pads.length - 1]?.rect;
  if (!square) return;
  const sq = { x0: Math.min(square[0], square[2]), x1: Math.max(square[0], square[2]), z0: Math.min(square[1], square[3]), z1: Math.max(square[1], square[3]) };
  const inSquare = (x: number, y: number, pad = 0) => x > sq.x0 + pad && x < sq.x1 - pad && y > sq.z0 + pad && y < sq.z1 - pad;
  const buildings = z.models.filter((m) => !m.scatter && (m.level != null || m.door) && !inSquare(m.pos[0], m.pos[1]));
  // Paths drawn by hand that run through a building are dropped; the generated ones replace them.
  const hits = (pts: number[][], pad: number) =>
    buildings.some((m) => {
      const f = footprint(m);
      return pts.slice(1).some((b, i) => {
        const a = pts[i];
        for (let k = 0; k <= 20; k++) {
          const x = a[0] + ((b[0] - a[0]) * k) / 20, y = a[1] + ((b[1] - a[1]) * k) / 20;
          if (x > f.x0 - pad && x < f.x1 + pad && y > f.z0 - pad && y < f.z1 + pad) return true;
        }
        return false;
      });
    });
  // Roads out of the village (hand-drawn paths reaching the edge) keep their way out; the rest is routed fresh.
  const edgeOf = (p: number[]) => Math.abs(p[0]) > W / 2 - 4 || Math.abs(p[1]) > D / 2 - 4;
  const gates: { edge: number[]; out: number[]; w: number }[] = [];
  for (const p of t.paths) {
    if (!hits(p.pts, 0.3)) continue;
    for (const e of [p.pts[0], p.pts[p.pts.length - 1]])
      if (edgeOf(e)) {
        const n = Math.abs(e[0]) > W / 2 - 4 ? [-Math.sign(e[0]), 0] : [0, -Math.sign(e[1])];
        // On past the edge into the woods, until the snow hides it.
        const edge = [n[0] ? -n[0] * (W / 2 + 70) : e[0], n[1] ? -n[1] * (D / 2 + 70) : e[1]];
        gates.push({ edge, out: [edge[0] + n[0] * 74, edge[1] + n[1] * 74], w: p.w });
      }
  }
  t.paths = t.paths.filter((p) => !hits(p.pts, 0.3));

  const C = 1.5;
  const nx = Math.ceil(W / C), nz = Math.ceil(D / C);
  const cx = (i: number) => -W / 2 + (i + 0.5) * C, cz = (j: number) => -D / 2 + (j + 0.5) * C;
  const blocked = new Uint8Array(nx * nz);
  for (const m of z.models) {
    if (m.scatter && !m.light) continue;
    const f = footprint(m);
    const big = buildings.includes(m);
    // Under it: no way through. Close beside a building: possible, but only where there's no better way.
    for (const [pad, v] of (big ? [[3, 1], [1, 2]] : [[0.6, 2]]) as [number, number][])
      for (let i = Math.max(0, Math.floor((f.x0 - pad + W / 2) / C)); i <= Math.min(nx - 1, Math.floor((f.x1 + pad + W / 2) / C)); i++)
        for (let j = Math.max(0, Math.floor((f.z0 - pad + D / 2) / C)); j <= Math.min(nz - 1, Math.floor((f.z1 + pad + D / 2) / C)); j++) blocked[j * nx + i] = Math.max(blocked[j * nx + i], v);
  }
  const cellOf = (x: number, y: number) => [Math.max(0, Math.min(nx - 1, Math.floor((x + W / 2) / C))), Math.max(0, Math.min(nz - 1, Math.floor((y + D / 2) / C)))];
  const onNet = (x: number, y: number) => inSquare(x, y, 1) || t.paths.some((p) => p.pts.slice(1).some((b, i) => segDist(x, y, p.pts[i], b) < p.w / 2 - 0.2));
  const sight = (a: number[], b: number[]) => {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    for (let s = 0; s <= L; s += C / 2) {
      const [i, j] = cellOf(a[0] + ((b[0] - a[0]) * s) / L, a[1] + ((b[1] - a[1]) * s) / L);
      if (blocked[j * nx + i] === 2) return false;
    }
    return true;
  };

  const order = buildings
    .map((m) => ({ m, d: Math.hypot(m.pos[0] - (sq.x0 + sq.x1) / 2, m.pos[1] - (sq.z0 + sq.z1) / 2) }))
    .sort((a, b) => a.d - b.d)
    .map((o) => o.m);
  const starts = order.map((m) => {
    const f = footprint(m);
    const n = m.door?.dir != null ? [Math.round(Math.sin((m.door.dir * Math.PI) / 180)), Math.round(Math.cos((m.door.dir * Math.PI) / 180))] : NORMAL[m.face ?? "back"];
    const half = n[0] ? (f.x1 - f.x0) / 2 : (f.z1 - f.z0) / 2;
    const c = [(f.x0 + f.x1) / 2, (f.z0 + f.z1) / 2];
    return { edge: [c[0] + n[0] * (half - 0.3), c[1] + n[1] * (half - 0.3)], out: [c[0] + n[0] * (half + 4), c[1] + n[1] * (half + 4)], w: m.door ? 2.6 : 1.9 };
  });
  for (const { edge, out, w } of [...starts, ...gates]) {
    if (onNet(out[0], out[1])) {
      t.paths.push({ pts: [edge, out], w });
      continue;
    }
    // Cheapest way to the network: short, avoiding steep ground.
    const start = cellOf(out[0], out[1]);
    const cost = new Float64Array(nx * nz).fill(Infinity);
    const from = new Int32Array(nx * nz).fill(-1);
    const heap: [number, number][] = [];
    const push = (k: number, c2: number) => {
      heap.push([c2, k]);
      let i = heap.length - 1;
      while (i > 0) {
        const p = (i - 1) >> 1;
        if (heap[p][0] <= heap[i][0]) break;
        [heap[p], heap[i]] = [heap[i], heap[p]];
        i = p;
      }
    };
    const pop = () => {
      const top = heap[0];
      const last = heap.pop()!;
      if (heap.length) {
        heap[0] = last;
        let i = 0;
        for (;;) {
          const l = 2 * i + 1, r = l + 1;
          let s = i;
          if (l < heap.length && heap[l][0] < heap[s][0]) s = l;
          if (r < heap.length && heap[r][0] < heap[s][0]) s = r;
          if (s === i) break;
          [heap[s], heap[i]] = [heap[i], heap[s]];
          i = s;
        }
      }
      return top;
    };
    const k0 = start[1] * nx + start[0];
    cost[k0] = 0;
    push(k0, 0);
    let goal = -1;
    while (heap.length) {
      const [c0, k] = pop();
      if (c0 > cost[k]) continue;
      const i = k % nx, j = (k - i) / nx;
      if (k !== k0 && onNet(cx(i), cz(j))) {
        goal = k;
        break;
      }
      const h0 = heightAt(t, cx(i), cz(j));
      for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
        const a = i + di, b = j + dj;
        if (a < 0 || b < 0 || a >= nx || b >= nz) continue;
        const kk = b * nx + a;
        if (blocked[kk] === 2) continue;
        const run = Math.hypot(di, dj) * C;
        const rise = Math.abs(heightAt(t, cx(a), cz(b)) - h0);
        const c2 = c0 + run * (blocked[kk] ? 6 : 1) + rise * 6;
        if (c2 < cost[kk]) {
          cost[kk] = c2;
          from[kk] = k;
          push(kk, c2);
        }
      }
    }
    if (goal < 0) {
      t.paths.push({ pts: [edge, out], w });
      continue;
    }
    const cells: number[][] = [];
    for (let k = goal; k >= 0 && k !== k0; k = from[k]) cells.push([cx(k % nx), cz(Math.floor(k / nx))]);
    cells.reverse();
    // Straighten: keep only the turns needed to get round things.
    const pts = [out];
    let i = 0;
    while (i < cells.length) {
      let j = cells.length - 1;
      while (j > i && !sight(pts[pts.length - 1], cells[j])) j--;
      pts.push(cells[j]);
      i = j + 1;
    }
    // Run a little into whatever it joins, so the cobbles meet.
    const end = pts[pts.length - 1], prev = pts[pts.length - 2];
    const L = Math.hypot(end[0] - prev[0], end[1] - prev[1]) || 1;
    pts[pts.length - 1] = [end[0] + ((end[0] - prev[0]) / L) * 1.2, end[1] + ((end[1] - prev[1]) / L) * 1.2];
    // Round the corners.
    let line = [edge, ...pts];
    for (let r = 0; r < 3; r++) {
      const nxt = [line[0]];
      for (let q = 0; q < line.length - 1; q++) {
        const a = line[q], b = line[q + 1];
        if (q > 0) nxt.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25]);
        if (q < line.length - 2) nxt.push([a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75]);
      }
      nxt.push(line[line.length - 1]);
      line = nxt;
    }
    t.paths.push({ pts: line, w });
  }
}

/** Lays an outdoor place on its hills: ground, paths, lamps along them, and woods (trees, bushes, rocks) between. */
function dressLand(z: Zone, rec: LandRec, model: (id: string) => string | null, pic: (id?: unknown) => string | null, arranged = false) {
  const [W, D] = z.size;
  const at = (v: number[]) => [v[0] * FT - W / 2, v[1] * FT - D / 2];
  const t: Terrain = {
    floor: pic(rec.floorImage) ?? z.floor.tex,
    path: pic(rec.pathImage),
    pads: (rec.pads ?? []).map((p) => {
      const a = at([p.rectFt[0], p.rectFt[1]]), b = at([p.rectFt[2], p.rectFt[3]]);
      return { rect: [a[0], a[1], b[0], b[1]], h: p.heightFt * FT, fall: p.fallFt * FT };
    }),
    hills: (rec.hills ?? []).map(([x, y, h, r]) => [...at([x, y]), h * FT, r * FT]),
    paths: (rec.paths ?? []).map((p) => ({ pts: p.pointsFt.map(at), w: p.widthFt * FT })),
    rim: [W, D],
  };
  // Each building stands on its own level, the ground easing between them.
  const margin = (rec.buildingMarginFt ?? 6) * FT, fall = (rec.buildingFallFt ?? 25) * FT;
  for (const m of z.models) {
    if (m.level == null) continue;
    const f = footprint(m);
    t.pads.push({ rect: [f.x0 - margin, f.z0 - margin, f.x1 + margin, f.z1 + margin], h: m.level, fall });
  }
  // The square's own pad last, so it stays level.
  t.pads.push(...t.pads.splice(0, (rec.pads ?? []).length));
  z.terrain = t;
  for (const m of z.models) m.elev += heightAt(t, m.pos[0], m.pos[1]);
  linkBuildings(z, t);
  const nearPath = (x: number, y: number, pad: number) => t.paths.some((p) => p.pts.slice(1).some((b, i) => segDist(x, y, p.pts[i], b) < p.w / 2 + pad));
  // A room arranged in Edit mode keeps its trees and rocks, except any now standing on a path.
  if (arranged) z.models = z.models.filter((m) => !m.scatter || m.light || !nearPath(m.pos[0], m.pos[1], 0.3));
  const clear = (x: number, y: number, r: number) =>
    x > -W / 2 + r && x < W / 2 - r && y > -D / 2 + r && y < D / 2 - r &&
    z.models.every((m) => {
      const [fw2, fd2] = floorSize(m);
      const fw = fw2 / 2, fd = fd2 / 2;
      const rr = m.scatter ? (m.block ?? 0.5) + r * 0.6 : r;
      return Math.abs(x - m.pos[0]) > fw + rr || Math.abs(y - m.pos[1]) > fd + rr;
    }) &&
    z.doors.every((d) => Math.hypot(x - d.at[0], y - d.at[1]) > r + 2);
  // Lamps along the paths, alternating sides.
  const lampId = model("chr001_village_model_lantern") ? "chr001_village_model_lantern" : "chr001_village_square_model_lamppost";
  const lampSize = lampId.endsWith("lantern") ? [1, 1, 5].map((v) => v * FT) : [1.5, 1.5, 10].map((v) => v * FT);
  const every = (rec.lampEveryFt ?? 0) * FT;
  if (every > 0)
    for (const p of t.paths) {
      let carry = every / 2, side = 1;
      for (let i = 1; i < p.pts.length; i++) {
        const a = p.pts[i - 1], b = p.pts[i];
        const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
        for (let d = carry; d < L; d += every) {
          const ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
          const x = a[0] + ux * d - uz * side * (p.w / 2 + 0.8), y = a[1] + uz * d + ux * side * (p.w / 2 + 0.8);
          side = -side;
          if (!clear(x, y, 0.6) || nearPath(x, y, 0.3) || z.models.some((m) => m.light && m.scatter && Math.hypot(m.pos[0] - x, m.pos[1] - y) < every * 0.45)) continue;
          z.models.push({ id: lampId, file: model(lampId), label: "lamp", pos: [x, y], elev: heightAt(t, x, y), rotY: 0, rotX: 0, size: lampSize, solid: true, light: true, scatter: true, block: 0.25 });
        }
        carry = (carry - L) % every;
        if (carry < 0) carry += every;
      }
    }
  if (arranged) return;
  // A ring of trees round the square, strung with lights.
  if (rec.ring) {
    const [cx, cz] = at(rec.ring.centerFt);
    const [r0, r1] = rec.ring.radiusFt.map((v) => v * FT);
    let k = 0;
    for (let i = 0; i < rec.ring.count * 3 && k < rec.ring.count; i++) {
      const a = (i / (rec.ring.count * 3)) * Math.PI * 2 * 3 + (i % 3) * 0.7;
      const r = r0 + ((i * 0.37) % 1) * (r1 - r0);
      const x = cx + Math.cos(a) * r, y = cz + Math.sin(a) * r;
      const id = rec.ring.images[i % rec.ring.images.length];
      const size = sizeOf(id).map((v) => v * (0.8 + ((i * 0.53) % 1) * 0.3));
      if (nearPath(x, y, 1) || !clear(x, y, size[0] * 0.45)) continue;
      z.models.push({ id, file: model(id), label: nice(id), pos: [x, y], elev: heightAt(t, x, y) - 0.05, rotY: [0, 90, 180, -90][i % 4], rotX: 0, size, solid: true, light: false, scatter: true, block: 0.4, lights: !!rec.ring.lights });
      k++;
    }
  }
  // Woods: away from the village's flat ground, the paths and everything placed.
  let seed = 1234;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (const sc of rec.scatter ?? []) {
    let placed = 0;
    for (let tries = 0; tries < sc.count * 40 && placed < sc.count; tries++) {
      const x = (rnd() - 0.5) * W, y = (rnd() - 0.5) * D;
      const r = sc.clearFt * FT * 0.5;
      const pw = padWeight(t, x, y);
      if (pw > (sc.images.some((i) => /bush|rock/.test(i)) ? 0.9 : 0.75)) continue;
      if (nearPath(x, y, r + 0.5) || !clear(x, y, r)) continue;
      const id = sc.images[Math.floor(rnd() * sc.images.length)];
      const k = 0.75 + rnd() * 0.5;
      const size = sizeOf(id).map((v) => v * k);
      z.models.push({ id, file: model(id), label: nice(id), pos: [x, y], elev: heightAt(t, x, y) - 0.05, rotY: [0, 90, 180, -90][Math.floor(rnd() * 4)], rotX: 0, size, solid: true, light: false, scatter: true, block: /pine/.test(id) ? 0.4 : size[0] * 0.4 });
      placed++;
    }
  }
}

/** Sizes of the village's scattered props (metres), from their Meshy prompts. */
function sizeOf(id: string) {
  const ft: Record<string, number[]> = {
    chr001_village_model_pine_a: [12, 12, 30],
    chr001_village_model_pine_b: [10, 10, 16],
    chr001_village_model_pine_c: [6, 6, 9],
    chr001_village_model_bush: [4, 4, 3],
    chr001_village_model_rock: [5, 4, 3],
  };
  return (ft[id] ?? [4, 4, 4]).map((v) => v * FT);
}

/** Whether every door of a room can be reached from every other, round the furniture. */
function walkable(z: Zone) {
  const [W, D] = z.size;
  const R = 0.3, C = 0.15;
  const nx = Math.floor(W / C), nz = Math.floor(D / C);
  const blocks = z.models.filter((m) => m.solid && m.elev < 0.05 && m.size[2] > 0.25).map(footprint);
  const free = (i: number, j: number) => {
    const x = -W / 2 + (i + 0.5) * C, y = -D / 2 + (j + 0.5) * C;
    if (x < -W / 2 + R || x > W / 2 - R || y < -D / 2 + R || y > D / 2 - R) return false;
    return !blocks.some((b) => x > b.x0 - R && x < b.x1 + R && y > b.z0 - R && y < b.z1 + R);
  };
  const ok = new Uint8Array(nx * nz);
  for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) ok[i * nz + j] = free(i, j) ? 1 : 0;
  const cellNear = (x: number, y: number) => {
    let best = -1, bd = 0.8;
    for (let i = 0; i < nx; i++)
      for (let j = 0; j < nz; j++) {
        if (!ok[i * nz + j]) continue;
        const d = Math.hypot(-W / 2 + (i + 0.5) * C - x, -D / 2 + (j + 0.5) * C - y);
        if (d < bd) {
          bd = d;
          best = i * nz + j;
        }
      }
    return best;
  };
  const goals = z.doors.map((d) => (d.kind === "pass" ? cellNear(d.at[0], d.at[1]) : cellNear(d.at[0] + d.normal[0] * 0.6, d.at[1] + d.normal[1] * 0.6)));
  if (goals.some((g) => g < 0)) return false;
  if (goals.length < 2) return true;
  const seen = new Uint8Array(nx * nz);
  const q = [goals[0]];
  seen[goals[0]] = 1;
  while (q.length) {
    const c = q.pop()!;
    const i = Math.floor(c / nz), j = c % nz;
    for (const [a, b] of [[i + 1, j], [i - 1, j], [i, j + 1], [i, j - 1]])
      if (a >= 0 && b >= 0 && a < nx && b < nz && ok[a * nz + b] && !seen[a * nz + b]) {
        seen[a * nz + b] = 1;
        q.push(a * nz + b);
      }
  }
  return goals.every((g) => seen[g]);
}

/** Puts a room back the way it was arranged in Edit mode. */
function applySaved(z: Zone, L: SavedLayout, model: (id: string) => string | null) {
  z.size = [...L.size];
  z.models = L.models.map((m) => ({ ...m, file: model(m.id), pos: [...m.pos], size: [...m.size] }));
  for (const side of SIDES) {
    const list = L.pieces[side] ?? [];
    z.walls[side].pieces.forEach((p, i) => {
      if (list[i]) Object.assign(p, list[i]);
    });
  }
  if (L.fixtures) z.fixtures = L.fixtures.map((f, i) => ({ ...f, tex: z.fixtures[i]?.tex ?? f.tex }));
  if (L.decals) z.decals = L.decals.map((d, i) => ({ ...d, tex: z.decals[i]?.tex ?? d.tex }));
}

/** A room's current arrangement, for saving (heights above the ground, no file addresses). */
export function layoutOf(z: Zone): SavedLayout {
  return {
    v: 1,
    size: [...z.size],
    models: z.models.map((m) => ({ ...m, file: null, elev: m.elev - heightAt(z.terrain, m.pos[0], m.pos[1]) })),
    pieces: Object.fromEntries(SIDES.map((s) => [s, z.walls[s].pieces.map((p) => ({ x: p.x, y: p.y, w: p.w, h: p.h }))])),
    fixtures: z.fixtures,
    decals: z.decals,
    people: z.people.map((p) => ({ id: p.id, pos: [...p.pos], rotY: p.rotY, elev: p.elev, sit: p.sit })),
  };
}

/** Heights of stairs and landings under a point (none if there are none there). */
export function stairHeights(z: Zone, x: number, y: number) {
  const out: number[] = [];
  for (const st of z.stairs ?? []) {
    const [x0, z0, x1, z1] = st.rect;
    if (x < Math.min(x0, x1) || x > Math.max(x0, x1) || y < Math.min(z0, z1) || y > Math.max(z0, z1)) continue;
    if (!st.axis) out.push(st.h0);
    else {
      const c = st.axis === "x" ? x : y;
      const t = Math.max(0, Math.min(1, (c - st.from!) / (st.to! - st.from!)));
      out.push(st.h0 + (st.h1 - st.h0) * t);
    }
  }
  return out;
}

/** Where you stand at a point, coming from height cur: the floor (if there's headroom) or a stair, within a step. */
export function groundAt(z: Zone, x: number, y: number, cur: number) {
  const base = heightAt(z.terrain, x, y);
  const hs = stairHeights(z, x, y);
  const cands = hs.length ? [...hs] : [base];
  if (hs.length && hs.every((h) => h - base > 1.9)) cands.push(base);
  let best: number | null = null;
  for (const c of cands) if (Math.abs(c - cur) <= 0.45 && (best == null || Math.abs(c - cur) < Math.abs(best - cur))) best = c;
  return best;
}
