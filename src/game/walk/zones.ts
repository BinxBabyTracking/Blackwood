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
  const pendingDoors = new Map<Zone, { m: ZoneModel; to: string; through: boolean }[]>();

  for (const r of opts.records) {
    if (r.reuse || !r.sizeFt) continue;
    const outdoor = r.type === "exterior";
    const [wf, df, hf] = r.sizeFt;
    const w = wf * FT, d = df * FT, H = (hf ?? (outdoor ? 30 : 10)) * FT;
    const wallRec = (r.wall ?? {}) as { image?: string; tileFt?: number; lower?: string; lowerTo?: number };
    const railAt = ((r.trim as Record<string, { atIn?: number }> | undefined)?.rail?.atIn ?? 34) / 12;
    const walls = {} as Record<Side, ZoneWall>;
    const pending: { m: ZoneModel; to: string; through: boolean }[] = [];
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
      const through = /arch|gate|ladder|hatch|trapdoor/.test(m.id);
      pending.push({ m, to: dd.to, through });
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
    pendingDoors.set(zones[zones.length - 1], pending);
  }

  // Smaller floor plans indoors (the records were drawn half as big again for multiplayer), then the doors.
  for (const z of zones) {
    const small = z.size[0] * z.size[1] < 250 * FT * FT;
    if (!z.outdoor && !small && (opts.shrink ?? 1) < 1) shrinkZone(z, fitShrink(z, opts.shrink!));
    if (!z.outdoor && (opts.shrink ?? 1) < 1) fillRoom(z);
    if (!z.outdoor) clearWalls(z);
    if (!z.outdoor) lowerCeiling(z);
    z.doors = doorsOf(z, pendingDoors.get(z) ?? []);
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

/** Every way out of a zone: wall pieces that lead somewhere, and buildings, arches, ladders and hatches. */
function doorsOf(z: Zone, pending: { m: ZoneModel; to: string; through: boolean }[]): ZoneDoor[] {
  const [w, d] = z.size;
  const out: ZoneDoor[] = [];
  for (const side of SIDES)
    for (const p of z.walls[side].pieces)
      if (p.to) {
        const wp = wallPoint(side, w, d, p.x + p.w / 2);
        out.push({ to: p.to, label: p.label, at: wp.at, span: p.w / 2, normal: wp.normal, kind: "wall" });
      }
  for (const { m, to, through } of pending) {
    const facing = Object.entries(ROT).find(([, v]) => v === m.rotY)?.[0] ?? "back";
    const n = NORMAL[facing];
    const [mw, md] = m.size;
    // Walk-through things (arches, ladders, hatches) are entered at their middle; buildings at their front face.
    const reach = through ? 0 : md / 2 + 0.3;
    const at = [m.pos[0] + n[0] * reach, m.pos[1] + n[1] * reach];
    // Keep the trigger where you can stand (a building on the edge of the square).
    const at2 = [Math.max(-w / 2 + 0.35, Math.min(w / 2 - 0.35, at[0])), Math.max(-d / 2 + 0.35, Math.min(d / 2 - 0.35, at[1]))];
    out.push({ to, label: m.label, at: at2, span: through ? Math.max(0.6, mw / 2 - 0.3) : Math.max(0.9, Math.min(mw / 3, 3)), normal: n, kind: through ? "pass" : "model" });
    if (through) m.solid = false;
  }
  return out;
}

const footprint = (m: ZoneModel) => {
  const turned = Math.abs(m.rotY) === 90;
  const fw = turned ? m.size[1] : m.size[0], fd = turned ? m.size[0] : m.size[1];
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
  let k = Math.sqrt(floorArea(z) / (0.25 * W * D));
  k = Math.min(max, Math.max(0.55, k));
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

/** Plain furniture that can stand in a room more than once. */
const COPYABLE = /gears|weights|bench|shel(f|ves)|stool|crate|sack|table|chair|cabinet|rack|barrel|files|bookcase|apparatus|haybale|dresser|lectern|counter|stall|coalbin|tack|cart|toyshelf|workbench|marver|pipes/;

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
        const copy: ZoneModel = { ...src, pos: sp.pos, rotY: sp.rotY, rotX: 0, elev: lv };
        if (!fits(copy)) continue;
        z.models.push(copy);
        if (!lv) area += sw * sd;
        added++;
        if (!lv || levels.length < 2) break;
      }
    }
}
