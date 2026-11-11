/*
 * Skinning a person: projects their front, side and back views (Admin's `<case>_turn_<person>_*` pictures) onto a
 * rigged base character (public/models/base/*.glb), and writes a new GLB with the painted textures.
 *
 * The base's kit (public/models/base/*.kit, made by scripts/characters/make_kit.py) holds each paintable piece
 * (Body, Outfit, Shoes, Hair) posed like the views (arms hanging a little away from the sides), with how much
 * each vertex faces the front, the back and the sides (zero where something else hides it), and the model's
 * silhouette per view. For every texel of a piece, the texel's 3D point is found in the pose, placed in each view
 * by matching the model's silhouette to the person's (row by row, with the neck and the top of the head as
 * anchors), sampled from the picture, and blended by how squarely that view sees it.
 *
 * Plain functions on buffers, so it runs on the server and in scripts alike.
 */
import sharp from "sharp";

export type Raw = { data: Uint8Array; width: number; height: number };

type Piece = { name: string; material: string; size: number; count: number; tris: number; pos: Float32Array; uv: Float32Array; vis: Uint8Array; ind: Uint32Array };
type ViewRows = { left: number[]; right: number[] };
type Kit = { height: number; min: number[]; max: number[]; rows: number; neckRow: number; views: Record<"front" | "back" | "left" | "right", ViewRows>; pieces: Piece[] };

export function parseKit(buf: Uint8Array): Kit {
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  if (new TextDecoder().decode(buf.subarray(0, 6)) !== "BWKIT1") throw new Error("Not a skinning kit.");
  const hl = dv.getUint32(8, true);
  const h = JSON.parse(new TextDecoder().decode(buf.subarray(12, 12 + hl)));
  const base = 12 + hl;
  const at = (o: number) => buf.byteOffset + base + o;
  const pieces: Piece[] = h.pieces.map((p: Record<string, number | string>) => ({
    name: p.name,
    material: p.material,
    size: p.size,
    count: p.count,
    tris: p.tris,
    pos: new Float32Array(buf.buffer.slice(at(p.pos as number), at(p.pos as number) + (p.count as number) * 12)),
    uv: new Float32Array(buf.buffer.slice(at(p.uv as number), at(p.uv as number) + (p.count as number) * 8)),
    vis: new Uint8Array(buf.buffer.slice(at(p.vis as number), at(p.vis as number) + (p.count as number) * 3)),
    ind: new Uint32Array(buf.buffer.slice(at(p.ind as number), at(p.ind as number) + (p.tris as number) * 12)),
  }));
  return { ...h, pieces };
}

/* ------------------------------------------------------------------ the person in a picture */

type Figure = {
  img: Raw;
  bg: [number, number, number];
  mask: Uint8Array;
  left: Int32Array;
  right: Int32Array;
  top: number;
  bottom: number;
  neck: number;
  headTop: number;
};

const isSkin = (r: number, g: number, b: number) => r > 95 && g > 40 && b > 20 && r > g && r > b && r - Math.min(g, b) > 15 && r - g > 12;

export function figure(img: Raw, front: boolean): Figure {
  const { data, width: W, height: H } = img;
  // Background: the median of the picture's border.
  const border: number[][] = [];
  for (let x = 0; x < W; x += 4) for (const y of [0, 1, H - 2, H - 1]) border.push([data[(y * W + x) * 4], data[(y * W + x) * 4 + 1], data[(y * W + x) * 4 + 2]]);
  for (let y = 0; y < H; y += 4) for (const x of [0, 1, W - 2, W - 1]) border.push([data[(y * W + x) * 4], data[(y * W + x) * 4 + 1], data[(y * W + x) * 4 + 2]]);
  const med = (k: number) => border.map((c) => c[k]).sort((a, b) => a - b)[border.length >> 1];
  const bg: [number, number, number] = [med(0), med(1), med(2)];
  const mask = new Uint8Array(W * H);
  // A cut-out picture (see-through background): the alpha is the person.
  const cut = data[3] < 16 && data[(W - 1) * 4 + 3] < 16 && data[((H - 1) * W) * 4 + 3] < 16;
  for (let i = 0; i < W * H; i++) {
    const d = Math.abs(data[i * 4] - bg[0]) + Math.abs(data[i * 4 + 1] - bg[1]) + Math.abs(data[i * 4 + 2] - bg[2]);
    mask[i] = cut ? (data[i * 4 + 3] > 128 ? 1 : 0) : d > 36 ? 1 : 0;
  }
  // Clean single-pixel noise: a row's extents ignore runs shorter than 3 pixels.
  const left = new Int32Array(H).fill(-1);
  const right = new Int32Array(H).fill(-1);
  let top = -1;
  let bottom = -1;
  for (let y = 0; y < H; y++) {
    let l = -1;
    let r = -1;
    for (let x = 0; x < W - 2; x++) if (mask[y * W + x] && mask[y * W + x + 1] && mask[y * W + x + 2]) { l = x; break; }
    for (let x = W - 1; x > 1; x--) if (mask[y * W + x] && mask[y * W + x - 1] && mask[y * W + x - 2]) { r = x; break; }
    if (l >= 0 && r > l) {
      left[y] = l;
      right[y] = r;
      if (top < 0) top = y;
      bottom = y;
    }
  }
  if (top < 0) throw new Error("Couldn't find the person in a picture (is the background plain?).");
  const h = bottom - top;
  // Neck: the narrowest row from 6% to 40% down the figure, ignoring the very top (a hat's point).
  let neck = top + Math.round(h * 0.18);
  let best = Infinity;
  for (let y = top + Math.round(h * 0.06); y < top + Math.round(h * 0.4); y++) {
    const w = right[y] - left[y];
    if (left[y] >= 0 && w < best) { best = w; neck = y; }
  }
  // The top of the head under any hat or big hair: from where the face's skin starts (front view only).
  let headTop = top;
  if (front) {
    let faceTop = -1;
    for (let y = top; y < neck; y++) {
      if (left[y] < 0) continue;
      let skin = 0;
      for (let x = left[y]; x <= right[y]; x++) {
        const i = (y * W + x) * 4;
        if (isSkin(data[i], data[i + 1], data[i + 2])) skin++;
      }
      if (skin > (right[y] - left[y] + 1) * 0.25 && skin > 6) { faceTop = y; break; }
    }
    if (faceTop > top) headTop = Math.max(top, Math.round(faceTop - 0.3 * (neck - faceTop)));
  }
  return { img, bg, mask, left, right, top, bottom, neck, headTop };
}

/* ------------------------------------------------------------------ model point -> picture pixel */

type ViewName = "front" | "back" | "side";

function mapper(kit: Kit, view: ViewName, fig: Figure) {
  const rows = kit.rows;
  const px = kit.height / rows;
  const [lo, hi] = [kit.min, kit.max];
  const vr = kit.views[view === "side" ? "left" : view];
  const mx = (p: [number, number, number]) => (view === "front" ? p[0] - lo[0] : view === "back" ? hi[0] - p[0] : hi[2] - p[2]);
  const nm = kit.neckRow;
  return (p: [number, number, number]): [number, number] | null => {
    const r = (hi[1] - p[1]) / px; // model row, 0 = top of head
    // Picture row: the head (top to neck) and the body (neck to feet) each mapped onto the person's own.
    const y = r <= nm ? fig.headTop + (r / nm) * (fig.neck - fig.headTop) : fig.neck + ((r - nm) / (rows - nm)) * (fig.bottom - fig.neck);
    const ri = Math.max(0, Math.min(rows - 1, Math.round(r)));
    const yi = Math.max(0, Math.min(fig.img.height - 1, Math.round(y)));
    const ml = vr.left[ri];
    const mr = vr.right[ri];
    let il = fig.left[yi];
    let ir = fig.right[yi];
    if (il < 0) {
      // A row with nothing in it (between the legs, say): use the nearest row that has the person.
      for (let d = 1; d < 40 && il < 0; d++) for (const yy of [yi - d, yi + d]) if (yy >= 0 && yy < fig.img.height && fig.left[yy] >= 0 && il < 0) { il = fig.left[yy]; ir = fig.right[yy]; }
    }
    if (ml < 0 || il < 0 || mr <= ml) return null;
    const x = il + ((mx(p) - ml) / (mr - ml)) * (ir - il);
    return [x, y];
  };
}

function sample(fig: Figure, x: number, y: number): [number, number, number] | null {
  const { data, width: W, height: H } = fig.img;
  const xi = Math.round(x);
  const yi = Math.round(y);
  if (xi < 0 || yi < 0 || xi >= W || yi >= H || !fig.mask[yi * W + xi]) return null;
  const x0 = Math.max(0, Math.min(W - 2, Math.floor(x)));
  const y0 = Math.max(0, Math.min(H - 2, Math.floor(y)));
  const fx = Math.min(1, Math.max(0, x - x0));
  const fy = Math.min(1, Math.max(0, y - y0));
  const out: [number, number, number] = [0, 0, 0];
  for (let k = 0; k < 3; k++) {
    const a = data[(y0 * W + x0) * 4 + k];
    const b = data[(y0 * W + x0 + 1) * 4 + k];
    const c = data[((y0 + 1) * W + x0) * 4 + k];
    const d = data[((y0 + 1) * W + x0 + 1) * 4 + k];
    out[k] = (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy;
  }
  return out;
}

/* ------------------------------------------------------------------ painting one piece */

function paint(kit: Kit, piece: Piece, figs: Record<ViewName, Figure>) {
  const S = piece.size;
  const col = new Float32Array(S * S * 3);
  const wsum = new Float32Array(S * S);
  const covered = new Uint8Array(S * S);
  const maps = { front: mapper(kit, "front", figs.front), back: mapper(kit, "back", figs.back), side: mapper(kit, "side", figs.side) };
  const { pos, uv, vis, ind } = piece;
  const p: [number, number, number] = [0, 0, 0];
  for (let t = 0; t < piece.tris; t++) {
    const a = ind[t * 3];
    const b = ind[t * 3 + 1];
    const c = ind[t * 3 + 2];
    const ax = uv[a * 2] * S, ay = uv[a * 2 + 1] * S;
    const bx = uv[b * 2] * S, by = uv[b * 2 + 1] * S;
    const cx = uv[c * 2] * S, cy = uv[c * 2 + 1] * S;
    const d = (by - cy) * (ax - cx) + (cx - bx) * (ay - cy);
    if (Math.abs(d) < 1e-9) continue;
    const x0 = Math.max(0, Math.floor(Math.min(ax, bx, cx)));
    const x1 = Math.min(S - 1, Math.ceil(Math.max(ax, bx, cx)));
    const y0 = Math.max(0, Math.floor(Math.min(ay, by, cy)));
    const y1 = Math.min(S - 1, Math.ceil(Math.max(ay, by, cy)));
    for (let y = y0; y <= y1; y++)
      for (let x = x0; x <= x1; x++) {
        const gx = x + 0.5;
        const gy = y + 0.5;
        const l0 = ((by - cy) * (gx - cx) + (cx - bx) * (gy - cy)) / d;
        const l1 = ((cy - ay) * (gx - cx) + (ax - cx) * (gy - cy)) / d;
        const l2 = 1 - l0 - l1;
        if (l0 < -0.01 || l1 < -0.01 || l2 < -0.01) continue;
        const i = y * S + x;
        if (covered[i]) continue;
        covered[i] = 1;
        for (let k = 0; k < 3; k++) p[k] = l0 * pos[a * 3 + k] + l1 * pos[b * 3 + k] + l2 * pos[c * 3 + k];
        const views: ViewName[] = ["front", "back", "side"];
        for (let v = 0; v < 3; v++) {
          const w = (l0 * vis[a * 3 + v] + l1 * vis[b * 3 + v] + l2 * vis[c * 3 + v]) / 255;
          if (w < 0.02) continue;
          const at = maps[views[v]](p);
          if (!at) continue;
          const s = sample(figs[views[v]], at[0], at[1]);
          if (!s) continue;
          const ww = w * w;
          col[i * 3] += s[0] * ww;
          col[i * 3 + 1] += s[1] * ww;
          col[i * 3 + 2] += s[2] * ww;
          wsum[i] += ww;
        }
      }
  }
  // Texels no view saw (under the arms, the soles): grow the painted color into them, then into the margins
  // around every UV island so seams don't show.
  const out = new Uint8Array(S * S * 4);
  const done = new Uint8Array(S * S);
  let sr = 0, sg = 0, sb = 0, sn = 0;
  for (let i = 0; i < S * S; i++)
    if (wsum[i] > 0.001) {
      out[i * 4] = col[i * 3] / wsum[i];
      out[i * 4 + 1] = col[i * 3 + 1] / wsum[i];
      out[i * 4 + 2] = col[i * 3 + 2] / wsum[i];
      out[i * 4 + 3] = 255;
      done[i] = 1;
      sr += out[i * 4]; sg += out[i * 4 + 1]; sb += out[i * 4 + 2]; sn++;
    }
  const grow = (limit: number, onlyCovered: boolean) => {
    for (let pass = 0; pass < limit; pass++) {
      const add: number[] = [];
      for (let y = 0; y < S; y++)
        for (let x = 0; x < S; x++) {
          const i = y * S + x;
          if (done[i] || (onlyCovered && !covered[i])) continue;
          let r = 0, g = 0, b = 0, n = 0;
          for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const xx = x + dx, yy = y + dy;
            if (xx < 0 || yy < 0 || xx >= S || yy >= S) continue;
            const j = yy * S + xx;
            if (done[j]) { r += out[j * 4]; g += out[j * 4 + 1]; b += out[j * 4 + 2]; n++; }
          }
          if (n) add.push(i, r / n, g / n, b / n);
        }
      if (!add.length) break;
      for (let k = 0; k < add.length; k += 4) {
        const i = add[k];
        out[i * 4] = add[k + 1]; out[i * 4 + 1] = add[k + 2]; out[i * 4 + 2] = add[k + 3]; out[i * 4 + 3] = 255;
        done[i] = 1;
      }
    }
  };
  grow(64, true);
  const avg = sn ? [sr / sn, sg / sn, sb / sn] : [128, 128, 128];
  for (let i = 0; i < S * S; i++)
    if (covered[i] && !done[i]) { out[i * 4] = avg[0]; out[i * 4 + 1] = avg[1]; out[i * 4 + 2] = avg[2]; out[i * 4 + 3] = 255; done[i] = 1; }
  grow(6, false);
  for (let i = 0; i < S * S; i++) if (!done[i]) { out[i * 4] = avg[0]; out[i * 4 + 1] = avg[1]; out[i * 4 + 2] = avg[2]; out[i * 4 + 3] = 255; }
  return { rgba: out, size: S, seen: sn / Math.max(1, covered.reduce((a, b) => a + b, 0)) };
}

/* ------------------------------------------------------------------ GLB in and out */

function readGlb(buf: Uint8Array) {
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  if (dv.getUint32(0, true) !== 0x46546c67) throw new Error("Not a GLB.");
  let o = 12;
  let json: Record<string, unknown[]> & Record<string, unknown> = {} as never;
  let bin: Uint8Array = new Uint8Array(0);
  while (o < buf.byteLength) {
    const len = dv.getUint32(o, true);
    const type = dv.getUint32(o + 4, true);
    const chunk = buf.subarray(o + 8, o + 8 + len);
    if (type === 0x4e4f534a) json = JSON.parse(new TextDecoder().decode(chunk));
    else if (type === 0x004e4942) bin = chunk as Uint8Array;
    o += 8 + len;
  }
  return { json, bin };
}

function writeGlb(json: Record<string, unknown>, bin: Uint8Array): Uint8Array {
  const j = new TextEncoder().encode(JSON.stringify(json));
  const jp = (4 - (j.length % 4)) % 4;
  const bp = (4 - (bin.length % 4)) % 4;
  const total = 12 + 8 + j.length + jp + 8 + bin.length + bp;
  const out = new Uint8Array(total);
  const dv = new DataView(out.buffer);
  dv.setUint32(0, 0x46546c67, true);
  dv.setUint32(4, 2, true);
  dv.setUint32(8, total, true);
  dv.setUint32(12, j.length + jp, true);
  dv.setUint32(16, 0x4e4f534a, true);
  out.set(j, 20);
  out.fill(0x20, 20 + j.length, 20 + j.length + jp);
  const b0 = 20 + j.length + jp;
  dv.setUint32(b0, bin.length + bp, true);
  dv.setUint32(b0 + 4, 0x004e4942, true);
  out.set(bin, b0 + 8);
  return out;
}

type BufferView = { buffer: number; byteOffset?: number; byteLength: number; target?: number };

/** Replaces some images' bytes and rebuilds the binary chunk. */
function replaceImages(json: Record<string, unknown>, bin: Uint8Array, repl: Map<number, { bytes: Uint8Array; mime: string }>) {
  const views = json.bufferViews as BufferView[];
  const images = json.images as { bufferView: number; mimeType: string }[];
  const newBytes = new Map<number, Uint8Array>();
  for (const [img, r] of repl) {
    newBytes.set(images[img].bufferView, r.bytes);
    images[img].mimeType = r.mime;
  }
  const parts: Uint8Array[] = [];
  let off = 0;
  for (let k = 0; k < views.length; k++) {
    const v = views[k];
    const data = newBytes.get(k) ?? bin.subarray(v.byteOffset ?? 0, (v.byteOffset ?? 0) + v.byteLength);
    const pad = (4 - (off % 4)) % 4;
    if (pad) { parts.push(new Uint8Array(pad)); off += pad; }
    v.byteOffset = off;
    v.byteLength = data.length;
    parts.push(data);
    off += data.length;
  }
  const out = new Uint8Array(off);
  let o = 0;
  for (const p of parts) { out.set(p, o); o += p.length; }
  (json.buffers as { byteLength: number }[])[0].byteLength = off;
  return out;
}

async function decode(bytes: Uint8Array): Promise<Raw> {
  const { data, info } = await sharp(bytes).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data: new Uint8Array(data.buffer, data.byteOffset, data.byteLength), width: info.width, height: info.height };
}

export type SkinResult = { glb: Uint8Array; report: string[]; textures: Record<string, Uint8Array> };

/**
 * Paints a base character from a person's three views. `name` becomes the scene's root node name. `hat`: the
 * person wears a hat or cap, so the top of the picture is not the top of the head.
 */
export async function skinCharacter(o: { kit: Uint8Array; base: Uint8Array; front: Uint8Array; side: Uint8Array; back: Uint8Array; name: string; hat?: boolean }): Promise<SkinResult> {
  const kit = parseKit(o.kit);
  const figs = { front: figure(await decode(o.front), Boolean(o.hat)), side: figure(await decode(o.side), false), back: figure(await decode(o.back), false) };
  // With a hat, the top of the head is under it: found from the face in the front view, and carried over to the
  // side and back views (which have no face to find) by the same proportion. Without one, the top of the figure is it.
  const fh = figs.front;
  const headFrac = (fh.neck - fh.headTop) / Math.max(1, fh.bottom - fh.headTop);
  for (const v of o.hat ? (["side", "back"] as const) : []) {
    const f = figs[v];
    const est = Math.round((f.neck - headFrac * f.bottom) / Math.max(0.05, 1 - headFrac));
    f.headTop = Math.min(f.neck - 4, Math.max(f.top, est));
  }
  const { json, bin } = readGlb(o.base);
  const mats = json.materials as { name: string; pbrMetallicRoughness?: { baseColorTexture?: { index: number } } }[];
  const texs = json.textures as { source: number }[];
  const images = json.images as { bufferView: number; mimeType: string }[];
  const views = json.bufferViews as BufferView[];
  const repl = new Map<number, { bytes: Uint8Array; mime: string }>();
  const report: string[] = [];
  const textures: Record<string, Uint8Array> = {};
  for (const piece of kit.pieces) {
    const mat = mats.find((m) => m.name === piece.material);
    const ti = mat?.pbrMetallicRoughness?.baseColorTexture?.index;
    if (ti == null) continue;
    const imgIdx = texs[ti].source;
    const painted = paint(kit, piece, figs);
    let bytes: Uint8Array;
    let mime: string;
    if (piece.name === "Hair") {
      // Keep the hair cards' see-through strands: the base texture's alpha, the person's colors.
      const v = views[images[imgIdx].bufferView];
      const old = bin.subarray(v.byteOffset ?? 0, (v.byteOffset ?? 0) + v.byteLength);
      const a = await sharp(old).ensureAlpha().resize(painted.size, painted.size, { fit: "fill" }).raw().toBuffer();
      for (let i = 0; i < painted.size * painted.size; i++) painted.rgba[i * 4 + 3] = a[i * 4 + 3];
      bytes = new Uint8Array(await sharp(painted.rgba, { raw: { width: painted.size, height: painted.size, channels: 4 } }).png({ compressionLevel: 9 }).toBuffer());
      mime = "image/png";
    } else {
      bytes = new Uint8Array(await sharp(painted.rgba, { raw: { width: painted.size, height: painted.size, channels: 4 } }).removeAlpha().jpeg({ quality: 88 }).toBuffer());
      mime = "image/jpeg";
    }
    repl.set(imgIdx, { bytes, mime });
    textures[piece.name] = bytes;
    report.push(`${piece.name}: ${Math.round(painted.seen * 100)}% painted from the views`);
  }
  const nodes = json.nodes as { name?: string; children?: number[] }[];
  const scene = (json.scenes as { nodes: number[] }[])[0];
  if (scene?.nodes?.[0] != null) nodes[scene.nodes[0]].name = o.name;
  const newBin = replaceImages(json, bin, repl);
  return { glb: writeGlb(json, newBin), report, textures };
}
