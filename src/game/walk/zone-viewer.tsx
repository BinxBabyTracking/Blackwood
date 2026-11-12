"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader, type GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";
import { trimRuns, wallRects } from "./walk-viewer";
import { doorsOf, floorSize, groundAt, heightAt, layoutOf } from "./zones";
import { holdNpc, makeNpc, resetNpc, rigOf, stepNpc } from "./npc";
import type { Npc } from "./npc";
import { clearRoomLayout, saveRoomLayout } from "@/app/actions/art";
import type { Side, World, Zone, ZoneModel, ZonePerson, ZoneWall } from "./zones";

/*
 * A case's walkable world from its room records: one place at a time, and walking into a door, a building's front
 * or an arch takes you to the next place, arriving at its door back. Computer: click to look with the mouse, WASD
 * to walk, Shift to hurry. Phone: the stick at the bottom left walks, dragging anywhere else looks.
 * The Places list jumps anywhere (for testing).
 */

const RADIUS = 0.28;
const SPEED = 1.5;
const WALL = 0.15;
const PULL = 0.6; // how close to a door takes you through it

function wallFrame(z: Zone, side: Side) {
  const [w, d] = z.size;
  if (side === "front") return { pos: [0, -d / 2], rot: 0, width: w };
  if (side === "back") return { pos: [0, d / 2], rot: Math.PI, width: w };
  if (side === "left") return { pos: [-w / 2, 0], rot: Math.PI / 2, width: d };
  return { pos: [w / 2, 0], rot: -Math.PI / 2, width: d };
}


/* ---------- Cobbles: a detailed cobblestone surface (colour + relief) drawn once, and stone kerbs ---------- */

/** Metres of path one cobble tile covers. */
const COBBLE_M = 1.6;
let cobbleTex: { map: THREE.CanvasTexture; normal: THREE.CanvasTexture } | null = null;

/** Rows of rounded, tightly packed stones with thin dark grout; tiles seamlessly both ways. */
function cobbleTextures() {
  if (cobbleTex) return cobbleTex;
  const S = 1024;
  let seed = 4242;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const hc = document.createElement("canvas");
  hc.width = hc.height = S;
  const h = hc.getContext("2d")!;
  const cc = document.createElement("canvas");
  cc.width = cc.height = S;
  const c = cc.getContext("2d")!;
  h.fillStyle = "#000";
  h.fillRect(0, 0, S, S);
  c.fillStyle = "#16171b";
  c.fillRect(0, 0, S, S);
  const rows = 11;
  const rh = S / rows;
  const gap = 5;
  const stone = (x: number, y: number, w: number, hh: number, tone: number) => {
    for (const dx of [-S, 0, S]) {
      const X = x + dx;
      if (X + w < 0 || X > S) continue;
      const r = Math.min(w, hh) * 0.42;
      // Height: a soft dome, highest in the middle.
      const g = h.createRadialGradient(X + w * 0.5, y + hh * 0.45, 2, X + w * 0.5, y + hh * 0.5, Math.max(w, hh) * 0.62);
      g.addColorStop(0, "#fff");
      g.addColorStop(0.55, "#c8c8c8");
      g.addColorStop(1, "#3a3a3a");
      h.fillStyle = g;
      h.beginPath();
      h.roundRect(X, y, w, hh, r);
      h.fill();
      // Colour: dark charcoal stone, a little lighter on top, worn speckles.
      const t = Math.round(tone);
      const cg = c.createLinearGradient(X, y, X, y + hh);
      cg.addColorStop(0, `rgb(${t + 26},${t + 28},${t + 34})`);
      cg.addColorStop(0.5, `rgb(${t + 8},${t + 9},${t + 14})`);
      cg.addColorStop(1, `rgb(${t - 10},${t - 10},${t - 6})`);
      c.fillStyle = cg;
      c.beginPath();
      c.roundRect(X, y, w, hh, r);
      c.fill();
      for (let k = 0; k < 6; k++) {
        c.fillStyle = `rgba(${200 + rnd() * 40},${200 + rnd() * 40},${210 + rnd() * 40},${0.05 + rnd() * 0.06})`;
        c.beginPath();
        c.ellipse(X + w * (0.2 + rnd() * 0.6), y + hh * (0.2 + rnd() * 0.5), 2 + rnd() * 6, 1 + rnd() * 3, rnd() * 3, 0, Math.PI * 2);
        c.fill();
      }
    }
  };
  for (let r = 0; r < rows; r++) {
    let x = rnd() * 40;
    const start = x;
    while (x < start + S - 30) {
      const w = 62 + rnd() * 46;
      const ww = Math.min(w, start + S - x - gap);
      if (ww < 30) break;
      stone(x + gap / 2, r * rh + gap / 2 + (rnd() - 0.5) * 4, ww - gap, rh - gap - rnd() * 6, 34 + rnd() * 30);
      x += w;
    }
  }
  // Normals from the height map; grout and stone edges darkened (shade in the cracks).
  const hd = h.getImageData(0, 0, S, S).data;
  const cd = c.getImageData(0, 0, S, S);
  const nd = new ImageData(S, S);
  const H = (x: number, y: number) => hd[(((y + S) % S) * S + ((x + S) % S)) * 4] / 255;
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++) {
      const dx = (H(x + 1, y) - H(x - 1, y)) * 3.2;
      const dy = (H(x, y + 1) - H(x, y - 1)) * 3.2;
      const l = Math.hypot(dx, dy, 1);
      const i = (y * S + x) * 4;
      nd.data[i] = ((-dx / l) * 0.5 + 0.5) * 255;
      nd.data[i + 1] = ((dy / l) * 0.5 + 0.5) * 255;
      nd.data[i + 2] = ((1 / l) * 0.5 + 0.5) * 255;
      nd.data[i + 3] = 255;
      const ao = 0.45 + 0.55 * Math.min(1, H(x, y) * 1.4);
      cd.data[i] *= ao;
      cd.data[i + 1] *= ao;
      cd.data[i + 2] *= ao;
    }
  c.putImageData(cd, 0, 0);
  const nc = document.createElement("canvas");
  nc.width = nc.height = S;
  nc.getContext("2d")!.putImageData(nd, 0, 0);
  const map = new THREE.CanvasTexture(cc);
  map.colorSpace = THREE.SRGBColorSpace;
  const normal = new THREE.CanvasTexture(nc);
  for (const t of [map, normal]) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = 8;
  }
  cobbleTex = { map, normal };
  return cobbleTex;
}

function cobbleMaterial(repeat?: [number, number]) {
  const { map, normal } = cobbleTextures();
  const m = repeat ? map.clone() : map, n = repeat ? normal.clone() : normal;
  if (repeat) {
    m.repeat.set(...repeat);
    n.repeat.set(...repeat);
    m.needsUpdate = n.needsUpdate = true;
  }
  return new THREE.MeshStandardMaterial({ map: m, normalMap: n, normalScale: new THREE.Vector2(1.4, 1.4), roughness: 0.62, metalness: 0.05, polygonOffset: true, polygonOffsetFactor: -2 });
}

/** Smooth stone kerbs down both sides of a path, with snow along the top. */
function layKerbs(root: THREE.Object3D, T: NonNullable<Zone["terrain"]>, pts: number[][], w: number, paved: (x: number, z: number) => boolean = () => false) {
  const KW = 0.2, KH = 0.13;
  for (const side of [-1, 1]) {
    const pos: number[] = [], uv: number[] = [], idx: number[] = [];
    const snow: number[] = [], sidx: number[] = [];
    const open: boolean[] = [];
    let along = 0;
    pts.forEach((q, i) => {
      const prev = pts[Math.max(0, i - 1)], next = pts[Math.min(pts.length - 1, i + 1)];
      let dx = next[0] - prev[0], dz = next[1] - prev[1];
      const len = Math.hypot(dx, dz) || 1;
      dx /= len;
      dz /= len;
      if (i > 0) along += Math.hypot(q[0] - pts[i - 1][0], q[1] - pts[i - 1][1]);
      const nx = -dz * side, nz = dx * side;
      const o0 = w / 2, o1 = w / 2 + KW;
      const x0 = q[0] + nx * o0, z0 = q[1] + nz * o0, x1 = q[0] + nx * o1, z1 = q[1] + nz * o1;
      const g0 = heightAt(T, x0, z0), g1 = heightAt(T, x1, z1);
      const top = Math.max(g0, g1) + KH;
      // inner bottom, inner top, outer top, outer bottom
      pos.push(x0, g0 - 0.05, z0, x0, top, z0, x1, top, z1, x1, g1 - 0.05, z1);
      uv.push(along, 0, along, 0.4, along, 0.6, along, 1);
      const sm = 0.02;
      snow.push(x0 + nx * sm, top + 0.035, z0 + nz * sm, x1 - nx * sm, top + 0.035, z1 - nz * sm);
      // No kerb across another path or the square: the cobbles run straight on where paths meet.
      open.push(!paved((x0 + x1) / 2, (z0 + z1) / 2));
      if (i > 0 && open[i] && open[i - 1]) {
        const o = i * 4, p = o - 4;
        for (const [a, b] of [[0, 1], [1, 2], [2, 3]]) idx.push(p + a, p + b, o + a, p + b, o + b, o + a);
        const so = i * 2, sp = so - 2;
        sidx.push(sp, sp + 1, so, sp + 1, so + 1, so);
      }
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    root.add(new THREE.Mesh(g, KERB_MAT));
    const sg = new THREE.BufferGeometry();
    sg.setAttribute("position", new THREE.Float32BufferAttribute(snow, 3));
    sg.setIndex(sidx);
    sg.computeVertexNormals();
    root.add(new THREE.Mesh(sg, SNOW_MAT));
  }
}
const KERB_MAT = (() => {
  if (typeof document === "undefined") return new THREE.MeshStandardMaterial({ color: 0x6a6d74 });
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 32;
  const g = c.getContext("2d")!;
  g.fillStyle = "#7a7d84";
  g.fillRect(0, 0, 256, 32);
  for (let x = 0; x < 256; x += 64) {
    g.fillStyle = `rgb(${110 + (x % 3) * 8},${112 + (x % 3) * 8},${120 + (x % 3) * 8})`;
    g.fillRect(x + 2, 0, 60, 32);
    g.fillStyle = "#3b3d42";
    g.fillRect(x, 0, 2, 32);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(1 / 2.4, 1);
  return new THREE.MeshStandardMaterial({ map: t, roughness: 0.85, side: THREE.DoubleSide });
})();
const SNOW_MAT = new THREE.MeshStandardMaterial({ color: 0xf3f6ff, roughness: 0.9, side: THREE.DoubleSide });


/* ---------- Stairs built in code: wooden flights and landings you can walk up ---------- */
const STEP_MAT = new THREE.MeshStandardMaterial({ color: 0x9a6436, roughness: 0.8 });
const BOARD_MAT = new THREE.MeshStandardMaterial({ color: 0x6b4226, roughness: 0.85 });
const RAIL_MAT = new THREE.MeshStandardMaterial({ color: 0x5a3420, roughness: 0.7 });

function buildStairs(z: Zone, root: THREE.Object3D) {
  const [W, D] = z.size;
  const nearWall = (v: number, half: number) => Math.abs(Math.abs(v) - half) < 0.15;
  for (const st of z.stairs ?? []) {
    const [ax0, az0, ax1, az1] = st.rect;
    const x0 = Math.min(ax0, ax1), x1 = Math.max(ax0, ax1), z0 = Math.min(az0, az1), z1 = Math.max(az0, az1);
    if (!st.axis) {
      // Landing: a thick floor on posts.
      const slab = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, 0.2, z1 - z0), STEP_MAT);
      slab.position.set((x0 + x1) / 2, st.h0 - 0.1, (z0 + z1) / 2);
      root.add(slab);
      for (const [px, pz] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]]) {
        if (nearWall(px, W / 2) || nearWall(pz, D / 2)) continue;
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.14, st.h0, 0.14), BOARD_MAT);
        post.position.set(px + (px === x0 ? 0.07 : -0.07), st.h0 / 2, pz + (pz === z0 ? 0.07 : -0.07));
        root.add(post);
      }
      continue;
    }
    const alongX = st.axis === "x";
    const from = st.from!, to = st.to!;
    const L = Math.abs(to - from), dh = st.h1 - st.h0;
    const n = Math.max(2, Math.round(Math.abs(dh) / 0.18));
    const across = alongX ? z1 - z0 : x1 - x0;
    const mid = alongX ? (z0 + z1) / 2 : (x0 + x1) / 2;
    const at = (t: number) => from + (to - from) * t;
    const hAt = (t: number) => st.h0 + dh * t;
    for (let i = 0; i < n; i++) {
      const top = Math.max(hAt(i / n), hAt((i + 1) / n));
      const c = at((i + 0.5) / n);
      const tall = Math.abs(dh) / n + 0.06;
      const box = new THREE.Mesh(alongX ? new THREE.BoxGeometry(L / n + 0.01, tall, across) : new THREE.BoxGeometry(across, tall, L / n + 0.01), STEP_MAT);
      box.position.set(alongX ? c : mid, top - tall / 2, alongX ? mid : c);
      root.add(box);
    }
    // The board under the flight, and a handrail on the open side.
    const ang = Math.atan2(dh, to - from);
    const len = Math.hypot(L, dh);
    const cx = alongX ? (from + to) / 2 : mid, cz = alongX ? mid : (from + to) / 2;
    const under = new THREE.Mesh(alongX ? new THREE.BoxGeometry(len, 0.12, across) : new THREE.BoxGeometry(across, 0.12, len), BOARD_MAT);
    under.position.set(cx, (st.h0 + st.h1) / 2 - 0.22, cz);
    if (alongX) under.rotation.z = ang;
    else under.rotation.x = -ang;
    root.add(under);
    const open = alongX ? (nearWall(z0, D / 2) ? z1 : z0) : nearWall(x0, W / 2) ? x1 : x0;
    const inset = alongX ? (open === z1 ? -0.05 : 0.05) : open === x1 ? -0.05 : 0.05;
    const rail = new THREE.Mesh(alongX ? new THREE.BoxGeometry(len, 0.07, 0.07) : new THREE.BoxGeometry(0.07, 0.07, len), RAIL_MAT);
    rail.position.set(alongX ? cx : open + inset, (st.h0 + st.h1) / 2 + 0.85, alongX ? open + inset : cz);
    if (alongX) rail.rotation.z = ang;
    else rail.rotation.x = -ang;
    root.add(rail);
    const posts = Math.max(2, Math.round(L / 0.5));
    for (let k = 0; k <= posts; k++) {
      const t = k / posts;
      const p = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.85, 0.05), RAIL_MAT);
      const a = at(t);
      p.position.set(alongX ? a : open + inset, hAt(t) + 0.43, alongX ? open + inset : a);
      root.add(p);
    }
  }
}


/** Fieldstone for building foundations on slopes. */
let foundationMat: THREE.Material | null = null;
function FOUNDATION_MAT() {
  if (foundationMat) return foundationMat;
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = "#3a3c42";
  g.fillRect(0, 0, 256, 256);
  let seed = 7;
  const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let y = 0; y < 256; y += 32)
    for (let x = -(y % 64) / 2; x < 256; x += 48 + r() * 16) {
      const v = 95 + r() * 40;
      g.fillStyle = `rgb(${v},${v + 2},${v + 8})`;
      g.beginPath();
      g.roundRect(x + 2, y + 2, 44 + r() * 10, 28, 8);
      g.fill();
    }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(6, 1);
  foundationMat = new THREE.MeshStandardMaterial({ map: t, roughness: 0.9 });
  return foundationMat;
}

/** A label floating over something not made yet. */
function labelSprite(text: string) {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 96;
  const g = c.getContext("2d")!;
  g.fillStyle = "rgba(20,20,30,0.75)";
  g.fillRect(0, 0, 512, 96);
  g.fillStyle = "#ffd98a";
  g.font = "bold 34px sans-serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(text.slice(0, 28), 256, 48);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), depthTest: false }));
  s.scale.set(1.6, 0.3, 1);
  return s;
}

/** A round, layered Christmas tree with ornaments, little lights and a star. */
function christmasTree(h: number, w: number, pos: number[], elev: number, decorated = true) {
  const g = new THREE.Group();
  const trunkH = h * 0.08;
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(w * 0.05, w * 0.06, trunkH, 12), new THREE.MeshLambertMaterial({ color: 0x5a3a22 }));
  trunk.position.y = trunkH / 2;
  g.add(trunk);
  const green = new THREE.MeshLambertMaterial({ color: 0x1f6b3a, flatShading: true });
  const snow = new THREE.MeshLambertMaterial({ color: 0xf2f6ff, flatShading: true });
  const tiers = decorated ? 6 : 5;
  const colors = [0xd8282f, 0xf2c230, 0x2f6fd8, 0xe8e8f0, 0xb03ad0, 0x2fb04a];
  let seed = 7;
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  for (let i = 0; i < tiers; i++) {
    const t = i / tiers;
    const r = (w / 2) * (1 - t * 0.78);
    const th = (h - trunkH) * 0.3;
    const y = trunkH + (h - trunkH) * t * 0.82;
    const cone = new THREE.Mesh(new THREE.ConeGeometry(r, th, 14, 1), green);
    cone.position.y = y + th / 2;
    g.add(cone);
    // A dusting of snow on each layer's tips.
    const cap = new THREE.Mesh(new THREE.ConeGeometry(r * 0.55, th * 0.3, 14, 1), snow);
    cap.position.y = y + th * 0.82;
    g.add(cap);
    const n = decorated ? Math.round(10 * (1 - t) + 4) : 0;
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2 + rnd();
      const rr = r * (0.55 + rnd() * 0.3);
      const yy = y + th * (0.15 + rnd() * 0.35);
      const ball = new THREE.Mesh(
        new THREE.SphereGeometry(w * 0.02, 10, 8),
        new THREE.MeshLambertMaterial({ color: colors[k % colors.length], emissive: colors[k % colors.length], emissiveIntensity: k % 3 === 0 ? 0.6 : 0.1 }),
      );
      ball.position.set(Math.cos(a) * rr, yy, Math.sin(a) * rr);
      g.add(ball);
    }
  }
  g.position.set(pos[0], elev, pos[1]);
  if (!decorated) return g;
  const star = new THREE.Mesh(new THREE.OctahedronGeometry(w * 0.05), new THREE.MeshLambertMaterial({ color: 0xfff2b0, emissive: 0xffe08a, emissiveIntensity: 1 }));
  star.position.y = h + w * 0.02;
  g.add(star);
  const glow = new THREE.PointLight(0xffd59a, 12, h * 0.9, 1.4);
  glow.position.y = h * 0.5;
  g.add(glow);
  return g;
}

/** Strings of little coloured lights wound round a tree standing in the box b. */
function stringLights(b: THREE.Box3) {
  const h = b.max.y - b.min.y, r = Math.max(b.max.x - b.min.x, b.max.z - b.min.z) / 2;
  const cx = (b.min.x + b.max.x) / 2, cz = (b.min.z + b.max.z) / 2;
  const n = Math.round(60 + h * 12);
  const geo = new THREE.SphereGeometry(Math.max(0.035, r * 0.025), 6, 4);
  const mesh = new THREE.InstancedMesh(geo, new THREE.MeshBasicMaterial({ toneMapped: false }), n);
  const cols = [0xff3b3b, 0xffd23b, 0x3bff6a, 0x3b9bff, 0xff7be0, 0xfff4d0].map((c) => new THREE.Color(c));
  const m4 = new THREE.Matrix4();
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const y = b.min.y + h * (0.12 + t * 0.8);
    const rr = r * (1 - (y - b.min.y) / h) * 0.95 + 0.05;
    const a = t * Math.PI * 2 * 6;
    m4.makeTranslation(cx + Math.cos(a) * rr, y, cz + Math.sin(a) * rr);
    mesh.setMatrixAt(i, m4);
    mesh.setColorAt(i, cols[i % cols.length]);
  }
  return mesh;
}

type Person = {
  grp: THREE.Object3D;
  head: THREE.Bone | null;
  headRest: THREE.Quaternion;
  faces: { mesh: THREE.Mesh; i: number }[];
  next: number;
  at: number;
  phase: number;
  P: ZonePerson;
  /** Their day: walking, sitting, working. */
  npc: Npc;
  held: boolean;
};

export function ZoneViewer({ world, title, eye: eyeIn }: { world: World; title: string; eye?: number }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const stickRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const goRef = useRef<(to: string, from?: string) => void>(() => {});
  const [zoneId, setZoneId] = useState(world.start);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [menu, setMenu] = useState(false);
  const [edit, setEdit] = useState(false);
  const editRef = useRef(false);
  const [picked, setPicked] = useState<{ label: string; size: string; door?: boolean; person?: boolean; sit?: boolean } | null>(null);
  const [saving, setSaving] = useState("");
  const [fine, setFine] = useState(false);
  const [roomSize, setRoomSize] = useState("");
  const api = useRef<Record<string, (...a: number[]) => void>>({});
  const fineRef = useRef(false);
  const [showMissing, setShowMissing] = useState(false);
  const [near, setNear] = useState<string | null>(null);
  const [touch, setTouch] = useState(false);
  const [fade, setFade] = useState(false);
  const zone = world.zones.find((z) => z.id === zoneId) ?? world.zones[0];
  const EYE = eyeIn ?? 0.95;

  useEffect(() => {
    const mount = mountRef.current!;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, mount.clientWidth / mount.clientHeight, 0.05, 400);
    const pos = new THREE.Vector3(0, EYE, 0);
    const look = { yaw: 0, pitch: 0 };
    const texLoader = new THREE.TextureLoader();
    const texCache = new Map<string, THREE.Texture>();
    const gltfCache = new Map<string, Promise<GLTF>>();
    const gl = new GLTFLoader();
    const loadGltf = (url: string) => {
      if (!gltfCache.has(url)) gltfCache.set(url, gl.loadAsync(url));
      return gltfCache.get(url)!;
    };
    // Stars over the North Pole, always night.
    const starGeo = new THREE.BufferGeometry();
    const sp: number[] = [];
    for (let i = 0; i < 1500; i++) {
      const u = Math.random() * Math.PI * 2, v = Math.acos(Math.random() * 0.95);
      sp.push(Math.sin(v) * Math.cos(u) * 300, Math.cos(v) * 300, Math.sin(v) * Math.sin(u) * 300);
    }
    starGeo.setAttribute("position", new THREE.Float32BufferAttribute(sp, 3));
    const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 1.2, sizeAttenuation: false, fog: false }));

    let root: THREE.Group | null = null;
    let current: Zone | null = null;
    let blockers: { x0: number; x1: number; z0: number; z1: number }[] = [];
    const haloMatShared = (() => {
      const c = document.createElement("canvas");
      c.width = c.height = 64;
      const g = c.getContext("2d")!;
      const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      gr.addColorStop(0, "rgba(255,214,140,0.9)");
      gr.addColorStop(0.3, "rgba(255,190,110,0.35)");
      gr.addColorStop(1, "rgba(255,170,90,0)");
      g.fillStyle = gr;
      g.fillRect(0, 0, 64, 64);
      return new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true });
    })();
    let standY = 0;
    let arrival: import("./zones").ZoneDoor | null = null;
    const placed = new Map<ZoneModel, { shadow: THREE.Mesh; grp?: THREE.Object3D; box?: THREE.Box3; extra?: THREE.Object3D[] }>();
    let sel: ZoneModel | null = null;
    let selP: ZonePerson | null = null;
    let pickBox: THREE.Box3Helper | null = null;
    const showBox = (o: THREE.Object3D) => {
      pickBox?.removeFromParent();
      o.updateMatrixWorld(true);
      pickBox = new THREE.Box3Helper(new THREE.Box3().setFromObject(o), 0xffd23b);
      root?.add(pickBox);
    };
    /** What goes with a model once it stands: a lamp's glow in its glass, a stove's pipe up to the ceiling. */
    const dressModel = (M: ZoneModel, grp: THREE.Object3D, parent: THREE.Object3D) => {
      const z = current!;
      const H = z.size[2];
      const out: THREE.Object3D[] = [];
      grp.updateMatrixWorld(true);
      if (M.light && z.outdoor) {
        const wb = new THREE.Box3().setFromObject(grp);
        const h = wb.max.y - wb.min.y;
        const halo = new THREE.Sprite(haloMatShared);
        // The glass: a lantern hangs near the top of its post; a lamp post's lantern is its top fifth.
        halo.position.set((wb.min.x + wb.max.x) / 2, wb.min.y + h * (/lantern/.test(M.id) ? 0.7 : 0.83), (wb.min.z + wb.max.z) / 2);
        halo.scale.setScalar(Math.max(0.9, h * 0.35));
        parent.add(halo);
        out.push(halo);
      }
            // A stove gets its pipe run up to the ceiling, from wherever its own stub of pipe ends.
      if (!z.outdoor && /stove/.test(M.id)) {
        grp.updateMatrixWorld(true);
        const wb = new THREE.Box3().setFromObject(grp);
        const cut = wb.max.y - (wb.max.y - wb.min.y) * 0.06;
        const top = new THREE.Box3();
        const v = new THREE.Vector3();
        grp.traverse((o) => {
          const mesh = o as THREE.Mesh;
          if (!mesh.isMesh) return;
          const pa = mesh.geometry.getAttribute("position");
          for (let i = 0; i < pa.count; i += 3) {
            v.fromBufferAttribute(pa, i).applyMatrix4(mesh.matrixWorld);
            if (v.y >= cut) top.expandByPoint(v);
          }
        });
        if (!top.isEmpty() && H - wb.max.y > 0.05) {
          const r = THREE.MathUtils.clamp(Math.min(top.max.x - top.min.x, top.max.z - top.min.z) / 2, 0.04, 0.12);
          const len = H - wb.max.y + 0.02;
          const pipe = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 16, 1, true), new THREE.MeshLambertMaterial({ color: 0x2b2522, side: THREE.DoubleSide }));
          pipe.position.set((top.min.x + top.max.x) / 2, wb.max.y - 0.01 + len / 2, (top.min.z + top.max.z) / 2);
          const collar = new THREE.Mesh(new THREE.CylinderGeometry(r * 1.6, r * 1.6, 0.03, 16), new THREE.MeshLambertMaterial({ color: 0x1c1816 }));
          collar.position.set(pipe.position.x, H - 0.015, pipe.position.z);
          parent.add(pipe, collar);
          out.push(pipe, collar);
        }
      }
      return out;
    };
    const reblock = () => {
      const z = current;
      if (!z) return;
      blockers = [];
      for (const M of z.models) {
        const [fw, fd] = floorSize(M);
        const onGround = M.elev - heightAt(z.terrain, M.pos[0], M.pos[1]) < 0.05;
        const b = placed.get(M)?.box;
        if (M.block != null) blockers.push({ x0: M.pos[0] - M.block, x1: M.pos[0] + M.block, z0: M.pos[1] - M.block, z1: M.pos[1] + M.block });
        else if (M.solid && onGround && M.size[2] > 0.25) {
          // The model's real footprint once it has loaded (a model can come out smaller or larger than planned).
          if (b) blockers.push({ x0: b.min.x + 0.05, x1: b.max.x - 0.05, z0: b.min.z + 0.05, z1: b.max.z - 0.05 });
          else blockers.push({ x0: M.pos[0] - fw / 2, x1: M.pos[0] + fw / 2, z0: M.pos[1] - fd / 2, z1: M.pos[1] + fd / 2 });
        }
      }
      // Doors into buildings: at the real front of the building.
      z.doors.forEach((d) => {
        if (d.kind !== "model" || d.mi == null) return;
        const M = z.models[d.mi];
        const b = M && placed.get(M)?.box;
        if (!b) return;
        const c = b.getCenter(new THREE.Vector3()), sz = b.getSize(new THREE.Vector3());
        const half = Math.abs(d.normal[0]) > 0.5 ? sz.x / 2 : sz.z / 2;
        const across = Math.abs(d.normal[0]) > 0.5 ? sz.z : sz.x;
        const [W, D] = z.size;
        d.at = [Math.max(-W / 2 + 0.35, Math.min(W / 2 - 0.35, c.x + d.normal[0] * (half + 0.3))), Math.max(-D / 2 + 0.35, Math.min(D / 2 - 0.35, c.z + d.normal[1] * (half + 0.3)))];
        d.span = Math.max(0.9, Math.min(across / 3, 3));
      });
    };
    let people: Person[] = [];
    let tNow = 0;
    /** Holds a person where the layout puts them (Edit mode). */
    const placePerson = (pp: Person) => {
      if (current) holdNpc(pp.npc, current);
      pp.held = true;
    };
    /** The seat height of a chair and the way to face when sitting in it (toward the nearest desk or table). */
    const seatFor = (P: ZonePerson) => {
      const z = current;
      if (!z) return null;
      const near = (re: RegExp, max: number, from: number[]) =>
        z.models
          .filter((m) => re.test(m.id) && Math.hypot(m.pos[0] - from[0], m.pos[1] - from[1]) < max)
          .sort((a, b) => Math.hypot(a.pos[0] - from[0], a.pos[1] - from[1]) - Math.hypot(b.pos[0] - from[0], b.pos[1] - from[1]))[0];
      const chair = near(/chair|stool|(?<!work)bench|seat|sofa|settee|couch/, 3, P.pos);
      if (!chair) return null;
      const box = placed.get(chair)?.box;
      const ground = heightAt(z.terrain, chair.pos[0], chair.pos[1]);
      const bottom = box ? box.min.y : chair.elev;
      const tall = box ? box.max.y - box.min.y : chair.size[2];
      // A high-backed chair's seat is about a third of the way up; a stool's or bench's is at the top.
      const seat = /stool|bench/.test(chair.id) ? bottom + tall : bottom + Math.min(tall * 0.38, 0.5);
      const c = box ? [(box.min.x + box.max.x) / 2, (box.min.z + box.max.z) / 2] : chair.pos;
      const desk = near(/desk|table|counter|workbench/, 3.5, c);
      const rotY = desk ? Math.atan2(desk.pos[0] - c[0], desk.pos[1] - c[1]) : ((chair.rotY + 180) * Math.PI) / 180;
      return { pos: c, seat: seat - ground, rotY };
    };
    let snow: THREE.Points | null = null;
    let token = 0;
    let cooldown = 0;

    const tex = (url: string | null, onReady?: (t: THREE.Texture) => void) => {
      if (!url) return null;
      let t = texCache.get(url);
      if (!t) {
        t = texLoader.load(url, (tt) => onReady?.(tt));
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
        texCache.set(url, t);
      } else onReady?.(t);
      return t;
    };
    // A window or door picture often has see-through margins round its frame; crop them so the frame fills the hole.
    const bounds = new Map<string, Promise<number[] | null>>();
    const opaqueBounds = (url: string, img: HTMLImageElement) => {
      if (!bounds.has(url))
        bounds.set(
          url,
          Promise.resolve().then(() => {
            const S = 160;
            const c = document.createElement("canvas");
            c.width = c.height = S;
            const g = c.getContext("2d", { willReadFrequently: true });
            if (!g) return null;
            g.drawImage(img, 0, 0, S, S);
            const a = g.getImageData(0, 0, S, S).data;
            let x0 = S, x1 = -1, y0 = S, y1 = -1;
            for (let y = 0; y < S; y++)
              for (let x = 0; x < S; x++)
                if (a[(y * S + x) * 4 + 3] > 128) {
                  if (x < x0) x0 = x;
                  if (x > x1) x1 = x;
                  if (y < y0) y0 = y;
                  if (y > y1) y1 = y;
                }
            if (x1 < 0) return null;
            // Is the middle solid (a clock face, a picture) rather than glass you see through?
            let solid = 0, n = 0;
            for (let y = Math.round(y0 + (y1 - y0) * 0.35); y < y0 + (y1 - y0) * 0.65; y++)
              for (let x = Math.round(x0 + (x1 - x0) * 0.35); x < x0 + (x1 - x0) * 0.65; x++, n++) if (a[(y * S + x) * 4 + 3] > 128) solid++;
            return [x0 / S, (x1 + 1) / S, y0 / S, (y1 + 1) / S, n ? solid / n : 0];
          }),
        );
      return bounds.get(url)!;
    };
    const cropToFrame = (url: string, t: THREE.Texture, mat: THREE.MeshLambertMaterial, onSolid?: () => void) => {
      const apply = (img: HTMLImageElement) =>
        opaqueBounds(url, img).then((b) => {
          if (!b) return;
          if (b[4] > 0.8) onSolid?.();
          if (b[0] < 0.01 && b[1] > 0.99 && b[2] < 0.01 && b[3] > 0.99) return;
          const c = t.clone();
          c.repeat.set(b[1] - b[0], b[3] - b[2]);
          c.offset.set(b[0], 1 - b[3]);
          c.needsUpdate = true;
          mat.map = c;
          mat.needsUpdate = true;
        });
      const img = t.image as HTMLImageElement | undefined;
      if (img && img.complete && img.naturalWidth) apply(img);
      else tex(url, (tt) => apply(tt.image as HTMLImageElement));
    };
    const tiled = (url: string | null) => {
      const t = tex(url);
      if (!t) return null;
      const c = t.clone();
      c.wrapS = c.wrapT = THREE.RepeatWrapping;
      c.needsUpdate = true;
      return c;
    };
    const tiledPlane = (w: number, h: number, u0: number, v0: number, tile: number) => {
      const g = new THREE.PlaneGeometry(w, h);
      const uv = g.attributes.uv as THREE.BufferAttribute;
      for (let i = 0; i < uv.count; i++) uv.setXY(i, (u0 + uv.getX(i) * w) / tile, (v0 + uv.getY(i) * h) / tile);
      return g;
    };
    const plain = (color: number) => new THREE.MeshLambertMaterial({ color, side: THREE.DoubleSide });

    const buildWall = (z: Zone, side: Side, def: ZoneWall, g: THREE.Group) => {
      const f = wallFrame(z, side);
      const H = z.size[2];
      const W = f.width;
      const wg = new THREE.Group();
      wg.position.set(f.pos[0], 0, f.pos[1]);
      wg.rotation.y = f.rot;
      const holes = def.pieces.filter((p) => p.opening).map((p) => ({ x0: p.x - W / 2, x1: p.x + p.w - W / 2, y0: p.y, y1: p.y + p.h }));
      const surface = (url: string | null, tile: number, y0: number, y1: number) => {
        const t = tiled(url);
        const mat = t ? new THREE.MeshLambertMaterial({ map: t }) : plain(0xb8a890);
        for (const q of wallRects(-W / 2, W / 2, y0, y1, holes)) {
          // One tile runs floor to ceiling (or the height of its band) and repeats left to right, square.
          const band = Math.max(0.3, y1 - y0);
          void tile;
          const m = new THREE.Mesh(tiledPlane(q.x1 - q.x0, q.y1 - q.y0, q.x0 + W / 2, q.y0 - y0, band), mat);
          m.position.set((q.x0 + q.x1) / 2, (q.y0 + q.y1) / 2, 0);
          wg.add(m);
        }
      };
      const split = def.lower ? Math.min(H, def.lower.to) : 0;
      surface(def.tex, def.tile, split, H);
      if (def.lower) surface(def.lower.tex, def.lower.tile, 0, split);
      // The thickness of each opening, and darkness beyond a doorway with no view.
      const edge = plain(0x6b4a30);
      for (const h of holes) {
        const parts: [number, number, number, number, number][] = [
          [h.x0, (h.y0 + h.y1) / 2, 0, h.y1 - h.y0, Math.PI / 2],
          [h.x1, (h.y0 + h.y1) / 2, 0, h.y1 - h.y0, Math.PI / 2],
        ];
        for (const [x, y, , len, ry] of parts) {
          const m = new THREE.Mesh(new THREE.PlaneGeometry(WALL, len), edge);
          m.position.set(x, y, -WALL / 2);
          m.rotation.y = ry;
          wg.add(m);
        }
        const top = new THREE.Mesh(new THREE.PlaneGeometry(h.x1 - h.x0, WALL), edge);
        top.rotation.x = Math.PI / 2;
        top.position.set((h.x0 + h.x1) / 2, h.y1, -WALL / 2);
        wg.add(top);
      }
      for (const p of def.pieces) {
        const t = tex(p.tex);
        const mat = t ? new THREE.MeshLambertMaterial({ map: t, alphaTest: 0.5, side: THREE.DoubleSide }) : new THREE.MeshLambertMaterial({ color: 0x8a5a3a, transparent: true, opacity: 0.6 });
        if (t && p.opening)
          cropToFrame(p.tex!, t, mat, () => {
            // A solid round thing (a clock face) in a square hole: close the hole behind it with wall.
            const wt = tiled(def.tex);
            const patch = new THREE.Mesh(
              tiledPlane(p.w, p.h, p.x, p.y, Math.max(0.3, H)),
              wt ? new THREE.MeshLambertMaterial({ map: wt }) : plain(0xb8a890),
            );
            patch.position.set(p.x + p.w / 2 - W / 2, p.y + p.h / 2, -0.004);
            wg.add(patch);
          });
        const m = new THREE.Mesh(new THREE.PlaneGeometry(p.w, p.h), mat);
        m.position.set(p.x + p.w / 2 - W / 2, p.y + p.h / 2, 0.01);
        wg.add(m);
        if (!t) {
          const s = labelSprite(p.label);
          s.position.set(p.x + p.w / 2 - W / 2, p.y + p.h + 0.25, 0.05);
          wg.add(s);
        }
        if (p.opening) {
          // What's seen through it: the view outside, or a warm dark doorway.
          const view = tex(p.outside);
          const back = new THREE.Mesh(
            new THREE.PlaneGeometry(Math.max(p.w * 6, 8), Math.max(p.h * 4, 6)),
            view ? new THREE.MeshBasicMaterial({ map: view, fog: false }) : new THREE.MeshBasicMaterial({ color: 0x1a0f08 }),
          );
          back.position.set(p.x + p.w / 2 - W / 2, p.y + p.h / 2, view ? -1.4 : -WALL - 0.02);
          if (!view) back.scale.set(p.w / back.geometry.parameters.width, p.h / back.geometry.parameters.height, 1);
          wg.add(back);
        }
      }
      const runTrim = (tr: { tex: string | null; h: number } | undefined, yMid: number) => {
        if (!tr) return;
        const t = tiled(tr.tex);
        const mat = t ? new THREE.MeshLambertMaterial({ map: t }) : plain(0x5a3a22);
        const depth = 0.025;
        const repeatM = tr.h * 1.5;
        for (const [a, b] of trimRuns(W, yMid - tr.h / 2, yMid + tr.h / 2, holes.map((h) => ({ ...h, x0: h.x0 + W / 2, x1: h.x1 + W / 2 })))) {
          const s0 = a < 1e-3 ? a - depth : a, s1 = b > W - 1e-3 ? b + depth : b;
          const geo = new THREE.BoxGeometry(s1 - s0, tr.h, depth);
          const uv = geo.attributes.uv as THREE.BufferAttribute;
          for (let i = 0; i < uv.count; i++) uv.setX(i, (uv.getX(i) * (s1 - s0) + s0) / repeatM);
          const m = new THREE.Mesh(geo, mat);
          m.position.set((s0 + s1) / 2 - W / 2, yMid, depth / 2 + 0.002);
          wg.add(m);
        }
      };
      runTrim(z.trim.base, (z.trim.base?.h ?? 0) / 2);
      if (z.trim.rail) runTrim(z.trim.rail, z.trim.rail.at);
      runTrim(z.trim.crown, H - (z.trim.crown?.h ?? 0) / 2);
      g.add(wg);
    };

    /** The surroundings of an outdoor place: a tall painted band just past each edge. */
    const buildBackdrop = (z: Zone, side: Side, url: string | null, g: THREE.Group) => {
      const f = wallFrame(z, side);
      const H = Math.max(z.size[2], 9) + (z.terrain ? 8 : 0);
      const W = f.width + 40;
      const t = tex(url);
      let mat: THREE.Material;
      if (t) {
        const c = t.clone();
        c.wrapS = THREE.MirroredRepeatWrapping;
        c.repeat.set(W / (H * 1.5), 1);
        c.needsUpdate = true;
        mat = new THREE.MeshBasicMaterial({ map: c, fog: false, color: 0xd8dcf0 });
      } else mat = new THREE.MeshBasicMaterial({ color: 0x223050, fog: false });
      const m = new THREE.Mesh(new THREE.PlaneGeometry(W, H), mat);
      const wg = new THREE.Group();
      wg.position.set(f.pos[0], 0, f.pos[1]);
      wg.rotation.y = f.rot;
      const low = z.terrain ? Math.min(...z.terrain.pads.map((p) => p.h)) - 2 : -0.5;
      m.position.set(0, H / 2 + low, -14);
      wg.add(m);
      g.add(wg);
    };

    const build = (z: Zone, arriveFrom?: string, keep?: { x: number; z: number; yaw: number; pitch: number }) => {
      const my = ++token;
      if (root) {
        scene.remove(root);
        root.traverse((o) => {
          const m = o as THREE.Mesh;
          if (m.isMesh || (o as THREE.Points).isPoints) {
            m.geometry?.dispose();
          }
        });
      }
      root = new THREE.Group();
      scene.add(root);
      current = z;
      blockers = [];
      placed.clear();
      pickBox = null;
      people = [];
      snow = null;
      const [w, d, H] = z.size;
      setReady(false);
      setProgress(0);
      let want = 0, got = 0;
      const tick = () => {
        got++;
        if (my === token) setProgress(want ? got / want : 1);
        if (my === token && got >= want) setReady(true);
      };

      // Light and sky.
      if (z.outdoor) {
        scene.background = new THREE.Color(0x0b1430);
        scene.fog = new THREE.FogExp2(0x101c3c, 0.012);
        root.add(stars);
        root.add(new THREE.HemisphereLight(0x9fb4e8, 0x2a2e48, 1.5));
        const moon = new THREE.DirectionalLight(0xc8d6ff, 0.9);
        moon.position.set(-30, 60, 20);
        root.add(moon);
        // Falling snow around you.
        const n = 1200, sp2: number[] = [];
        for (let i = 0; i < n; i++) sp2.push((Math.random() - 0.5) * 40, Math.random() * 16, (Math.random() - 0.5) * 40);
        const sg = new THREE.BufferGeometry();
        sg.setAttribute("position", new THREE.Float32BufferAttribute(sp2, 3));
        snow = new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xffffff, size: 2.5, sizeAttenuation: false, transparent: true, opacity: 0.8 }));
        root.add(snow);
      } else {
        scene.background = new THREE.Color(0x000000);
        scene.fog = null;
        root.add(new THREE.HemisphereLight(0xfff0dc, 0x5a4636, 1.25));
        root.add(new THREE.AmbientLight(0xffe8cc, 0.35));
      }

      // Ground, ceiling, decals.
      const T = z.terrain;
      const ft = tiled(T?.floor ?? z.floor.tex);
      const floorW = z.outdoor ? w + 60 : w, floorD = z.outdoor ? d + 60 : d;
      if (T) {
        // Rolling snowy ground, a vertex every metre and a half.
        const nx = Math.ceil(floorW / 1.5), nz = Math.ceil(floorD / 1.5);
        const g = new THREE.PlaneGeometry(floorW, floorD, nx, nz);
        g.rotateX(-Math.PI / 2);
        const pa = g.attributes.position as THREE.BufferAttribute, uv = g.attributes.uv as THREE.BufferAttribute;
        for (let i = 0; i < pa.count; i++) {
          const x = pa.getX(i), zz = pa.getZ(i);
          pa.setY(i, heightAt(T, x, zz));
          uv.setXY(i, x / z.floor.tile, -zz / z.floor.tile);
        }
        g.computeVertexNormals();
        root.add(new THREE.Mesh(g, ft ? new THREE.MeshLambertMaterial({ map: ft }) : plain(0xe8eef8)));
        // Cobbled paths laid over it.
        const pmat = cobbleMaterial();
        const segD = (x: number, y: number, a: number[], b: number[]) => {
          const dx = b[0] - a[0], dy = b[1] - a[1];
          const k = Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / (dx * dx + dy * dy || 1)));
          return Math.hypot(x - a[0] - dx * k, y - a[1] - dy * k);
        };
        const squares = z.decals.filter((dc) => dc.tex === T.path);
        const pavedBy = (self: unknown) => (x: number, y: number) =>
          squares.some((dc) => Math.abs(x - dc.pos[0]) < dc.size[0] / 2 && Math.abs(y - dc.pos[1]) < dc.size[1] / 2) ||
          T.paths.some((p) => p !== self && p.pts.slice(1).some((b, i) => segD(x, y, p.pts[i], b) < p.w / 2));
        for (const path of T.paths) {
          const pts: number[][] = [];
          for (let i = 1; i < path.pts.length; i++) {
            const a = path.pts[i - 1], b = path.pts[i];
            const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
            const n = Math.max(1, Math.ceil(L / 0.75));
            for (let k = i === 1 ? 0 : 1; k <= n; k++) pts.push([a[0] + ((b[0] - a[0]) * k) / n, a[1] + ((b[1] - a[1]) * k) / n]);
          }
          const pos2: number[] = [], uvs: number[] = [], idx: number[] = [];
          let along = 0;
          pts.forEach((q, i) => {
            const prev = pts[Math.max(0, i - 1)], next = pts[Math.min(pts.length - 1, i + 1)];
            let dx = next[0] - prev[0], dz = next[1] - prev[1];
            const len = Math.hypot(dx, dz) || 1;
            dx /= len;
            dz /= len;
            if (i > 0) along += Math.hypot(q[0] - pts[i - 1][0], q[1] - pts[i - 1][1]);
            for (const side of [-1, 1]) {
              const x = q[0] - dz * side * (path.w / 2), zz = q[1] + dx * side * (path.w / 2);
              pos2.push(x, heightAt(T, x, zz) + 0.04, zz);
              uvs.push(((side + 1) / 2) * (path.w / COBBLE_M), along / COBBLE_M);
            }
            if (i > 0) {
              const o = i * 2;
              idx.push(o - 2, o - 1, o, o - 1, o + 1, o);
            }
          });
          const pg = new THREE.BufferGeometry();
          pg.setAttribute("position", new THREE.Float32BufferAttribute(pos2, 3));
          pg.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
          pg.setIndex(idx);
          pg.computeVertexNormals();
          const mesh = new THREE.Mesh(pg, pmat);
          mesh.material.side = THREE.DoubleSide;
          root.add(mesh);
          layKerbs(root, T, pts, path.w, pavedBy(path));
          // Round ends, so a path meeting another at an angle leaves no gap of snow.
          for (const e of [path.pts[0], path.pts[path.pts.length - 1]]) {
            const cg = new THREE.CircleGeometry(path.w / 2, 20);
            cg.rotateX(-Math.PI / 2);
            const ca = cg.attributes.position as THREE.BufferAttribute;
            const cu = cg.attributes.uv as THREE.BufferAttribute;
            for (let i = 0; i < ca.count; i++) {
              const x = ca.getX(i) + e[0], zz = ca.getZ(i) + e[1];
              ca.setXYZ(i, x, heightAt(T, x, zz) + 0.038, zz);
              cu.setXY(i, x / COBBLE_M, zz / COBBLE_M);
            }
            cg.computeVertexNormals();
            const cm = new THREE.Mesh(cg, pmat);
            root.add(cm);
          }
        }
      } else {
        const floor = new THREE.Mesh(tiledPlane(floorW, floorD, 0, 0, z.floor.tile), ft ? new THREE.MeshLambertMaterial({ map: ft }) : plain(z.outdoor ? 0xe8eef8 : 0x8a6a4a));
        floor.rotation.x = -Math.PI / 2;
        root.add(floor);
      }
      if (z.ceiling) {
        const ct = tiled(z.ceiling.tex);
        const ceil = new THREE.Mesh(tiledPlane(w, d, 0, 0, z.ceiling.tile), ct ? new THREE.MeshLambertMaterial({ map: ct }) : plain(0xd8cbb0));
        ceil.rotation.x = Math.PI / 2;
        ceil.position.y = H;
        root.add(ceil);
      }
      for (const dc of z.decals) {
        if (T && dc.tex && dc.tex === T.path) {
          // A cobbled area (the square).
          const g = new THREE.Mesh(new THREE.PlaneGeometry(dc.size[0], dc.size[1]), cobbleMaterial([dc.size[0] / COBBLE_M, dc.size[1] / COBBLE_M]));
          g.rotation.x = -Math.PI / 2;
          g.position.set(dc.pos[0], heightAt(T, dc.pos[0], dc.pos[1]) + 0.03, dc.pos[1]);
          root.add(g);
          continue;
        }
        const t = dc.tile ? tiled(dc.tex) : tex(dc.tex);
        if (!t) continue;
        const geo = dc.tile ? tiledPlane(dc.size[0], dc.size[1], 0, 0, dc.tile) : new THREE.PlaneGeometry(dc.size[0], dc.size[1]);
        const m = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ map: t, alphaTest: 0.3, transparent: true }));
        m.rotation.set(-Math.PI / 2, 0, (dc.rotY * Math.PI) / 180);
        m.position.set(dc.pos[0], 0.01, dc.pos[1]);
        root.add(m);
      }
      let lamps = 0;
      for (const fx of z.fixtures) {
        const t = tex(fx.tex);
        const m = new THREE.Mesh(new THREE.PlaneGeometry(fx.size[0], fx.size[1]), t ? new THREE.MeshLambertMaterial({ map: t, alphaTest: 0.5, emissive: 0xffd9a0, emissiveMap: fx.light ? t : null, emissiveIntensity: 0.9 }) : plain(0xffe0a0));
        m.rotation.x = Math.PI / 2;
        m.position.set(fx.pos[0], H - 0.02, fx.pos[1]);
        root.add(m);
        if (fx.light && lamps < 6) {
          lamps++;
          const pl = new THREE.PointLight(0xffd29a, 6, 0, 1.6);
          pl.position.set(fx.pos[0], H - 0.4, fx.pos[1]);
          root.add(pl);
        }
      }
      if (!z.outdoor && lamps === 0) {
        const pl = new THREE.PointLight(0xffd29a, 8, 0, 1.4);
        pl.position.set(0, H - 0.4, 0);
        root.add(pl);
      }
      for (const side of ["front", "back", "left", "right"] as Side[]) {
        if (z.outdoor) buildBackdrop(z, side, z.walls[side].backdrop, root);
        else buildWall(z, side, z.walls[side], root);
      }

      // Furniture, buildings and props.
      const contact = (() => {
        const c = document.createElement("canvas");
        c.width = c.height = 64;
        const g = c.getContext("2d")!;
        const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
        gr.addColorStop(0, "rgba(0,0,0,0.45)");
        gr.addColorStop(1, "rgba(0,0,0,0)");
        g.fillStyle = gr;
        g.fillRect(0, 0, 64, 64);
        return new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false });
      })();
      for (const M of z.models) {
        const [fw, fd] = floorSize(M);
        const ground = heightAt(z.terrain, M.pos[0], M.pos[1]);
        const onGround = M.elev - ground < 0.05;
        const sh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), contact);
        sh.rotation.x = -Math.PI / 2;
        sh.scale.set(fw * 1.2, fd * 1.2, 1);
        sh.position.set(M.pos[0], M.elev + 0.006, M.pos[1]);
        if (onGround && !M.scatter) root.add(sh);
        placed.set(M, { shadow: sh });
        if (M.light && lamps < 10 && !M.scatter) {
          lamps++;
          const pl = new THREE.PointLight(0xffc77a, z.outdoor ? 10 : 4, z.outdoor ? 14 : 8, 1.6);
          pl.position.set(M.pos[0], M.elev + M.size[2] * 0.9, M.pos[1]);
          root.add(pl);
        }
        if (!M.file && M.scatter) {
          if (/pine/.test(M.id)) {
            const tr = christmasTree(M.size[2], M.size[0], M.pos, M.elev, false);
            root.add(tr);
            if (M.lights) root.add(stringLights(new THREE.Box3().setFromObject(tr)));
          }
          continue;
        }
        if (!M.file) {
          const box = new THREE.Mesh(new THREE.BoxGeometry(M.size[0], M.size[2], M.size[1]), new THREE.MeshLambertMaterial({ color: 0x9a7ad0, transparent: true, opacity: 0.35 }));
          box.position.set(M.pos[0], M.elev + M.size[2] / 2, M.pos[1]);
          box.rotation.y = (M.rotY * Math.PI) / 180;
          box.userData.zm = M;
          box.userData.label = M.label;
          root.add(box);
          const s = labelSprite(M.label);
          s.position.set(M.pos[0], M.elev + M.size[2] + 0.3, M.pos[1]);
          root.add(s);
          continue;
        }
        want++;
        const parent = root;
        loadGltf(M.file)
          .then((g) => {
            if (my !== token) return;
            const obj = g.scene.clone(true);
            obj.traverse((o) => {
              const mesh = o as THREE.Mesh;
              if (!mesh.isMesh) return;
              const old = mesh.material as THREE.MeshStandardMaterial;
              mesh.material = new THREE.MeshLambertMaterial({ map: old.map ?? null, color: old.map ? 0xffffff : old.color, vertexColors: !!mesh.geometry.getAttribute("color"), side: THREE.DoubleSide, emissive: M.light ? 0x3a2410 : 0x000000 });
            });
            const inner = new THREE.Group();
            inner.add(obj);
            inner.rotation.x = (M.rotX * Math.PI) / 180;
            inner.updateMatrixWorld(true);
            const box = new THREE.Box3().setFromObject(inner);
            const s = box.getSize(new THREE.Vector3());
            const c = box.getCenter(new THREE.Vector3());
            const off = new THREE.Group();
            off.add(inner);
            off.position.set(-c.x, -box.min.y, -c.z);
            // An even scale: the middle of the three fits (width, height, depth), so one odd proportion can't blow it up.
            // A Christmas tree that came out flat (a cutout) is drawn as a round one instead.
            if (/tree/.test(M.id) && Math.min(s.x, s.z) < Math.max(s.x, s.z) * 0.35) {
              parent.add(christmasTree(M.size[2], Math.max(M.size[0], M.size[1]), M.pos, M.elev));
              return;
            }
            const ks = [M.size[0] / s.x, M.size[2] / s.y, M.size[1] / s.z].filter((k) => Number.isFinite(k) && k > 0).sort((a, b) => a - b);
            const k = ks[Math.floor(ks.length / 2)] ?? 1;
            const grp = new THREE.Group();
            grp.add(off);
            grp.scale.setScalar(k);
            grp.rotation.y = (M.rotY * Math.PI) / 180;
            grp.position.set(M.pos[0], M.elev, M.pos[1]);
            grp.userData.zm = M;
            grp.userData.label = M.label;
            grp.userData.k0 = k / (M.size[0] / (grp.userData.w0 = M.size[0]));
            parent.add(grp);
            const pl2 = placed.get(M);
            grp.updateMatrixWorld(true);
            if (pl2) {
              pl2.grp = grp;
              pl2.box = new THREE.Box3().setFromObject(grp);
            }
            // A building standing on a slope: a stone foundation down to the lowest ground under it.
            if (z.terrain && M.level != null && pl2?.box) {
              const b = pl2.box;
              const pts = [[b.min.x, b.min.z], [b.max.x, b.min.z], [b.min.x, b.max.z], [b.max.x, b.max.z], [(b.min.x + b.max.x) / 2, b.min.z], [(b.min.x + b.max.x) / 2, b.max.z], [b.min.x, (b.min.z + b.max.z) / 2], [b.max.x, (b.min.z + b.max.z) / 2]];
              const low = Math.min(...pts.map(([x, zz]) => heightAt(z.terrain, x, zz)));
              if (M.elev - low > 0.1) {
                const fh = M.elev - low + 0.3;
                const f = new THREE.Mesh(new THREE.BoxGeometry(b.max.x - b.min.x - 0.1, fh, b.max.z - b.min.z - 0.1), FOUNDATION_MAT());
                f.position.set((b.min.x + b.max.x) / 2, low - 0.3 + fh / 2, (b.min.z + b.max.z) / 2);
                parent.add(f);
                pl2.extra = [...(pl2.extra ?? []), f];
              }
            }
            reblock();
            // Just came out of this building: stand at its real way in (known now it has loaded).
            if (arrival && arrival.mi === z.models.indexOf(M)) {
              const d = arrival;
              arrival = null;
              pos.x = d.at[0] + d.normal[0] * 1.2;
              pos.z = d.at[1] + d.normal[1] * 1.2;
              look.yaw = Math.atan2(-d.normal[0], -d.normal[1]);
            }
            snapOut();
            const ex = dressModel(M, grp, parent);
            if (pl2) pl2.extra = [...(pl2.extra ?? []), ...ex];
            if (M === sel) showBox(grp);
            if (M.lights) {
              grp.updateMatrixWorld(true);
              parent.add(stringLights(new THREE.Box3().setFromObject(grp)));
            }
          })
          .catch(() => {
            const s = labelSprite("couldn't load " + M.label);
            s.position.set(M.pos[0], M.elev + M.size[2] + 0.3, M.pos[1]);
            parent.add(s);
          })
          .finally(tick);
      }

      // People.
      for (const P of z.people) {
        if (!P.file) {
          const s = labelSprite(P.name + " (no 3D yet)");
          s.position.set(P.pos[0], 1.3, P.pos[1]);
          root.add(s);
          continue;
        }
        want++;
        const parent = root;
        loadGltf(P.file)
          .then((g) => {
            if (my !== token) return;
            const obj = cloneSkinned(g.scene);
            const faces: Person["faces"] = [];
            let head: THREE.Bone | null = null;
            const bones = new Map<string, THREE.Bone>();
            obj.traverse((o) => {
              const mesh = o as THREE.Mesh;
              if (mesh.isMesh) {
                mesh.frustumCulled = false;
                const old = mesh.material as THREE.MeshStandardMaterial;
                mesh.material = new THREE.MeshLambertMaterial({ map: old.map ?? null, vertexColors: !!mesh.geometry.getAttribute("color"), color: old.map ? 0xffffff : old.color });
                const bi = mesh.morphTargetDictionary?.blink;
                if (bi !== undefined) faces.push({ mesh, i: bi });
              }
              const b = o as THREE.Bone;
              if (b.isBone && b.name === "head") head = b;
              if (b.isBone) bones.set(b.name.toLowerCase(), b);
            });
            const rig = rigOf(bones);
            const box = new THREE.Box3().setFromObject(obj);
            const k = P.height / Math.max(0.01, box.max.y - box.min.y);
            const grp = new THREE.Group();
            obj.position.y = -box.min.y;
            grp.add(obj);
            grp.scale.setScalar(k);
            grp.userData.zp = P;
            parent.add(grp);
            const hb = head as THREE.Bone | null;
            grp.position.set(P.pos[0], heightAt(z.terrain, P.pos[0], P.pos[1]), P.pos[1]);
            const npc = makeNpc(P, grp, rig, tNow);
            const pp: Person = { grp, head: hb, headRest: hb ? hb.quaternion.clone() : new THREE.Quaternion(), faces, next: 1 + Math.random() * 3, at: -1, phase: Math.random() * 10, P, npc, held: false };
            if (P.sit) {
              // Seated where Edit mode put them: the seat height is already in the layout.
              npc.elev = P.elev ?? 0;
            }
            if (editRef.current) placePerson(pp);
            people.push(pp);
            if (P === selP) showBox(grp);
          })
          .catch(() => {})
          .finally(tick);
      }
      if (!want) setReady(true);

      if (z.stairs) buildStairs(z, root);
      reblock();
      // Where you arrive: at the door back to where you came from, a step inside, facing in.
      const back = arriveFrom ? z.doors.find((dr) => dr.to === arriveFrom) : null;
      if (back) {
        const step = back.kind === "wall" ? ((back.y ?? 0) > 0.3 ? 0.6 : 1.1) : 1.7;
        pos.set(back.at[0] + back.normal[0] * step, EYE, back.at[1] + back.normal[1] * step);
        standY = back.y ?? 0;
        arrival = back.kind === "model" ? back : null;
        look.yaw = Math.atan2(-back.normal[0], -back.normal[1]);
      } else {
        const entry = z.doors.find((dr) => dr.kind === "wall" && dr.normal[1] < 0) ?? z.doors[0];
        if (entry) {
          pos.set(entry.at[0] + entry.normal[0] * 1.3, EYE, entry.at[1] + entry.normal[1] * 1.3);
          look.yaw = Math.atan2(-entry.normal[0], -entry.normal[1]);
        } else {
          pos.set(0, EYE, d / 4);
          look.yaw = 0;
        }
      }
      look.pitch = 0;
      if (!back) standY = z.stairs ? 0 : heightAt(z.terrain, pos.x, pos.z);
      if (keep) {
        pos.set(keep.x, EYE, keep.z);
        look.yaw = keep.yaw;
        look.pitch = keep.pitch;
      }
      // Never start inside something: the nearest clear floor, spiralling out.
      if (!free(pos.x, pos.z)) {
        let found = false;
        for (let r = 0.2; r < 8 && !found; r += 0.2)
          for (let a = 0; a < Math.PI * 2; a += Math.PI / 12) {
            const x = pos.x + Math.cos(a) * r, zz = pos.z + Math.sin(a) * r;
            if (free(x, zz)) {
              pos.x = x;
              pos.z = zz;
              found = true;
              break;
            }
          }
      }
      cooldown = 1;
    };
    goRef.current = (to: string, from?: string) => {
      const z = world.zones.find((q) => q.id === to);
      if (!z) return;
      setFade(true);
      setTimeout(() => {
        build(z, from);
        setZoneId(z.id);
        setTimeout(() => setFade(false), 120);
      }, 220);
    };
    build(zone);
    // Edit mode: arrange one piece at a time (move, raise, turn, scale, copy, remove) and the room's size; saved per room.
    const ray = new THREE.Raycaster();
    const ft = (v: number) => `${(v / 0.3048).toFixed(1)} ft`;
    const describe = () => {
      if (current) setRoomSize(`${ft(current.size[0])} wide, ${ft(current.size[1])} deep, ${ft(current.size[2])} high`);
      setPicked(
        selP
          ? { label: selP.name, size: selP.sit ? "sitting" : "standing", person: true, sit: !!selP.sit }
          : sel
            ? { label: sel.label, size: `${ft(sel.size[0])} x ${ft(sel.size[1])} x ${ft(sel.size[2])}`, door: !!sel.door }
            : null,
      );
    };
    let saveTimer: ReturnType<typeof setTimeout> | null = null;
    const save = () => {
      if (saveTimer) clearTimeout(saveTimer);
      setSaving("Saving…");
      saveTimer = setTimeout(async () => {
        const z = current;
        if (!z) return;
        const res = await saveRoomLayout(z.room, JSON.parse(JSON.stringify(layoutOf(z)))).catch(() => ({ error: "The connection dropped." }));
        setSaving("error" in res ? res.error : "Saved");
      }, 700);
    };
    const settle = () => {
      const z = current!;
      z.doors = doorsOf(z);
      reblock();
      describe();
      save();
    };
    const refresh = (M: ZoneModel) => {
      const pl = placed.get(M);
      const z = current!;
      if (pl?.grp) {
        const g = pl.grp;
        g.position.set(M.pos[0], M.elev, M.pos[1]);
        g.rotation.y = (M.rotY * Math.PI) / 180;
        if (g.userData.k0) g.scale.setScalar(g.userData.k0 * (M.size[0] / g.userData.w0));
        else g.scale.set(M.size[0] / (g.userData.w0 ?? M.size[0]), 1, 1);
        g.updateMatrixWorld(true);
        pl.box = new THREE.Box3().setFromObject(g);
        for (const o of pl.extra ?? []) o.removeFromParent();
        pl.extra = g.parent ? dressModel(M, g, g.parent) : [];
        showBox(g);
      }
      if (pl?.shadow) {
        const [fw, fd] = floorSize(M);
        pl.shadow.position.set(M.pos[0], M.elev + 0.006, M.pos[1]);
        pl.shadow.scale.set(fw * 1.2, fd * 1.2, 1);
        pl.shadow.visible = M.elev - heightAt(z.terrain, M.pos[0], M.pos[1]) < 0.05;
      }
    };
    const rebuild = () => {
      if (current) build(current, undefined, { x: pos.x, z: pos.z, yaw: look.yaw, pitch: look.pitch });
    };
    const personOf = (P: ZonePerson) => people.find((p) => p.P === P);
    /** After a person is moved, turned or seated: pose them, mark them, save. */
    const settleP = () => {
      const pp = selP && personOf(selP);
      if (pp) {
        placePerson(pp);
        showBox(pp.grp);
      }
      reblock();
      describe();
      save();
    };
    api.current = {
      sit: () => {
        const P = selP;
        const pp = P && personOf(P);
        if (!P || !pp) return;
        if (P.sit) {
          P.sit = false;
          P.elev = 0;
          // Step out in front of the chair.
          P.pos = [P.pos[0] + Math.sin(P.rotY) * 0.6, P.pos[1] + Math.cos(P.rotY) * 0.6];
        } else {
          const st = seatFor(P);
          if (!st) {
            setSaving("No chair close enough. Move them next to one first.");
            return;
          }
          P.sit = true;
          P.pos = st.pos;
          P.rotY = st.rotY;
          // Hips (the top of the thighs) a little above the seat.
          P.elev = st.seat - pp.npc.hip + P.height * 0.07;
        }
        settleP();
      },
      move: (f: number, r: number) => {
        if (selP) {
          const step = fineRef.current ? 0.05 : 0.25;
          const fx = -Math.sin(look.yaw), fz = -Math.cos(look.yaw), rx = Math.cos(look.yaw), rz = -Math.sin(look.yaw);
          let dx = fx * f + rx * r, dz = fz * f + rz * r;
          if (Math.abs(dx) > Math.abs(dz)) dz = 0;
          else dx = 0;
          selP.pos = [selP.pos[0] + Math.sign(dx) * step, selP.pos[1] + Math.sign(dz) * step];
          settleP();
          return;
        }
        if (!sel || !current) return;
        const step = fineRef.current ? 0.05 : 0.25;
        const fx = -Math.sin(look.yaw), fz = -Math.cos(look.yaw), rx = Math.cos(look.yaw), rz = -Math.sin(look.yaw);
        // Snap the push to the room's axes, whichever is nearest the way you're looking.
        let dx = (fx * f + rx * r) * step, dz = (fz * f + rz * r) * step;
        if (Math.abs(dx) > Math.abs(dz)) dz = 0;
        else dx = 0;
        const before = heightAt(current.terrain, sel.pos[0], sel.pos[1]);
        sel.pos = [sel.pos[0] + Math.sign(dx) * step * (dx ? 1 : 0), sel.pos[1] + Math.sign(dz) * step * (dz ? 1 : 0)];
        sel.elev += heightAt(current.terrain, sel.pos[0], sel.pos[1]) - before;
        refresh(sel);
        settle();
      },
      lift: (d: number) => {
        if (selP) {
          selP.elev = (selP.elev ?? 0) + d * (fineRef.current ? 0.02 : 0.1);
          if (!selP.sit) selP.elev = Math.max(0, selP.elev);
          settleP();
          return;
        }
        if (!sel) return;
        sel.elev = Math.max(heightAt(current?.terrain, sel.pos[0], sel.pos[1]), sel.elev + d * (fineRef.current ? 0.02 : 0.1));
        refresh(sel);
        settle();
      },
      turn: (deg: number) => {
        if (selP) {
          selP.rotY += (deg * Math.PI) / 180;
          settleP();
          return;
        }
        if (!sel) return;
        sel.rotY = ((((sel.rotY + deg + 180) % 360) + 360) % 360) - 180;
        if (sel.door?.dir != null) sel.door.dir = (sel.door.dir + deg + 360) % 360;
        refresh(sel);
        settle();
      },
      scale: (k: number) => {
        if (selP || !sel) return;
        sel.size = sel.size.map((v) => v * k);
        refresh(sel);
        settle();
      },
      copy: () => {
        if (selP || !sel || !current) return;
        const [fw] = floorSize(sel);
        const rx = Math.cos(look.yaw), rz = -Math.sin(look.yaw);
        const c: ZoneModel = { ...sel, pos: [sel.pos[0] + rx * (fw + 0.15), sel.pos[1] + rz * (fw + 0.15)], size: [...sel.size], door: undefined };
        current.models.push(c);
        sel = c;
        rebuild();
        settle();
      },
      remove: () => {
        if (selP || !sel || !current) return;
        current.models = current.models.filter((m) => m !== sel);
        sel = null;
        rebuild();
        settle();
      },
      room: (dw: number, dd: number, dh: number) => {
        const z = current;
        if (!z) return;
        const step = fineRef.current ? 0.1 : 0.3;
        z.size = [Math.max(2, z.size[0] + dw * step), Math.max(2, z.size[1] + dd * step), Math.max(2, z.size[2] + dh * step)];
        for (const side of ["front", "back", "left", "right"] as Side[]) {
          const L = side === "front" || side === "back" ? z.size[0] : z.size[1];
          for (const p of z.walls[side].pieces) p.x = Math.max(0.05, Math.min(p.x, L - p.w - 0.05));
        }
        rebuild();
        settle();
      },
      wayIn: () => {
        if (!sel?.door || !current) return;
        // The side of the building facing you, to the nearest quarter turn.
        const a = (Math.atan2(pos.x - sel.pos[0], pos.z - sel.pos[1]) * 180) / Math.PI;
        sel.door.dir = (((Math.round(a / 90) * 90) % 360) + 360) % 360;
        settle();
        reblock();
      },
      deselect: () => {
        sel = null;
        selP = null;
        pickBox?.removeFromParent();
        describe();
      },
      reset: async () => {
        const z = current;
        if (!z) return;
        setSaving("Resetting…");
        const res = await clearRoomLayout(z.room).catch(() => ({ error: "The connection dropped." }));
        if ("error" in res) setSaving(res.error);
        else window.location.reload();
      },
    } as unknown as Record<string, (...a: number[]) => void>;
    const pick = (cx: number, cy: number) => {
      const r = canvas.getBoundingClientRect();
      ray.setFromCamera(new THREE.Vector2(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1), camera);
      const hits = root ? ray.intersectObject(root, true) : [];
      for (const h of hits) {
        let o: THREE.Object3D | null = h.object;
        while (o && !o.userData.zm && !o.userData.zp) o = o.parent;
        if (!o) continue;
        sel = (o.userData.zm as ZoneModel) ?? null;
        selP = (o.userData.zp as ZonePerson) ?? null;
        showBox(o);
        describe();
        return;
      }
      api.current.deselect();
    };

    // Moving and bumping.
    function free(x: number, zz: number) {
      const z = current!;
      const [w, d] = z.size;
      if (x < -w / 2 + RADIUS || x > w / 2 - RADIUS || zz < -d / 2 + RADIUS || zz > d / 2 - RADIUS) return false;
      if (blockers.some((b) => x > b.x0 - RADIUS && x < b.x1 + RADIUS && zz > b.z0 - RADIUS && zz < b.z1 + RADIUS)) return false;
      // People: you can't walk through them, but you can always step away.
      return !people.some((p) => {
        const d = Math.hypot(x - p.npc.x, zz - p.npc.z);
        return d < RADIUS + 0.25 && d < Math.hypot(pos.x - p.npc.x, pos.z - p.npc.z);
      });
    }
    /** Puts you on the nearest open ground if you're standing inside something. */
    function snapOut() {
      if (!current || free(pos.x, pos.z)) return;
      for (let r = 0.15; r < 30; r += 0.15)
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 16) {
          const x = pos.x + Math.cos(a) * r, zz = pos.z + Math.sin(a) * r;
          if (free(x, zz)) {
            pos.x = x;
            pos.z = zz;
            return;
          }
        }
    }
    /** Steps to (x, z) if there's room and ground within a step of where you stand (stairs, landings, floor). */
    const tryTo = (x: number, zz: number) => {
      const z = current!;
      if (!free(x, zz)) return false;
      const g = z.stairs ? groundAt(z, x, zz, standY) : heightAt(z.terrain, x, zz);
      if (g == null) return false;
      standY = g;
      pos.x = x;
      pos.z = zz;
      return true;
    };
    const move = (dx: number, dz: number) => {
      // Inside something (a model loaded bigger than planned): step out to the nearest open ground first.
      if (!free(pos.x, pos.z)) snapOut();
      if (!tryTo(pos.x + dx, pos.z + dz)) if (!tryTo(pos.x + dx, pos.z)) tryTo(pos.x, pos.z + dz);
    };

    const keys = new Set<string>();
    const onKey = (down: boolean) => (e: KeyboardEvent) => {
      const tg = e.target as HTMLElement | null;
      if (tg && (tg.tagName === "INPUT" || tg.tagName === "SELECT" || tg.tagName === "TEXTAREA")) return;
      const k = e.key.toLowerCase();
      if (!["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright", "shift"].includes(k)) return;
      if (down) keys.add(k);
      else keys.delete(k);
      e.preventDefault();
    };
    const kd = onKey(true), ku = onKey(false);
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);
    const canvas = renderer.domElement;
    const onClick = (e: MouseEvent) => {
      if (editRef.current) return pick(e.clientX, e.clientY);
      if (!("ontouchstart" in window)) canvas.requestPointerLock?.();
    };
    const onMouse = (e: MouseEvent) => {
      if (document.pointerLockElement !== canvas) return;
      look.yaw -= e.movementX * 0.0025;
      look.pitch = Math.max(-1.2, Math.min(1.2, look.pitch - e.movementY * 0.0025));
    };
    canvas.addEventListener("click", onClick);
    document.addEventListener("mousemove", onMouse);
    // Touch: a stick at the bottom left, and dragging elsewhere looks.
    const stick = { x: 0, y: 0, id: -1, cx: 0, cy: 0 };
    let lookId = -1, lx = 0, ly = 0;
    const onTouchStart = (e: TouchEvent) => {
      setTouch(true);
      for (const t of Array.from(e.changedTouches)) {
        const sr = stickRef.current?.getBoundingClientRect();
        if (sr && stick.id < 0 && t.clientX < sr.right + 40 && t.clientY > sr.top - 40) {
          stick.id = t.identifier;
          stick.cx = sr.left + sr.width / 2;
          stick.cy = sr.top + sr.height / 2;
        } else if (lookId < 0) {
          lookId = t.identifier;
          lx = t.clientX;
          ly = t.clientY;
        }
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      for (const t of Array.from(e.changedTouches)) {
        if (t.identifier === stick.id) {
          const dx = t.clientX - stick.cx, dy = t.clientY - stick.cy;
          const r = Math.min(1, Math.hypot(dx, dy) / 50);
          const a = Math.atan2(dy, dx);
          stick.x = Math.cos(a) * r;
          stick.y = Math.sin(a) * r;
          if (knobRef.current) knobRef.current.style.transform = `translate(${stick.x * 34}px, ${stick.y * 34}px)`;
        } else if (t.identifier === lookId) {
          look.yaw -= (t.clientX - lx) * 0.006;
          look.pitch = Math.max(-1.2, Math.min(1.2, look.pitch - (t.clientY - ly) * 0.006));
          lx = t.clientX;
          ly = t.clientY;
        }
      }
      e.preventDefault();
    };
    const onTouchEnd = (e: TouchEvent) => {
      for (const t of Array.from(e.changedTouches)) {
        if (t.identifier === stick.id) {
          stick.id = -1;
          stick.x = stick.y = 0;
          if (knobRef.current) knobRef.current.style.transform = "";
        }
        if (t.identifier === lookId) lookId = -1;
      }
    };
    canvas.addEventListener("touchstart", onTouchStart, { passive: true });
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchend", onTouchEnd);
    const st = stickRef.current;
    st?.addEventListener("touchstart", onTouchStart, { passive: true });
    st?.addEventListener("touchmove", onTouchMove, { passive: false });
    st?.addEventListener("touchend", onTouchEnd);
    const onResize = () => {
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    const clock = new THREE.Clock();
    let last = 0;
    let nearShown: string | null = null;
    let busy = false;
    const tmp = new THREE.Vector3();
    let frame = 0;
    const loop = () => {
      frame = requestAnimationFrame(loop);
      const t = clock.getElapsedTime();
      const dt = Math.min(0.05, t - last);
      last = t;
      const z = current;
      if (!z) return;
      if (keys.has("arrowleft")) look.yaw += dt * 1.8;
      if (keys.has("arrowright")) look.yaw -= dt * 1.8;
      let f = (keys.has("w") || keys.has("arrowup") ? 1 : 0) - (keys.has("s") || keys.has("arrowdown") ? 1 : 0) - stick.y;
      let s = (keys.has("d") ? 1 : 0) - (keys.has("a") ? 1 : 0) + stick.x;
      const len = Math.hypot(f, s);
      if (len > 1) {
        f /= len;
        s /= len;
      }
      const sp = SPEED * (keys.has("shift") ? 2 : 1) * (z.outdoor ? 1.6 : 1) * dt;
      const fx = -Math.sin(look.yaw), fz = -Math.cos(look.yaw);
      const rx = Math.cos(look.yaw), rz = -Math.sin(look.yaw);
      if (len > 0.01) move((fx * f + rx * s) * sp, (fz * f + rz * s) * sp);
      if (!z.stairs) standY = heightAt(z.terrain, pos.x, pos.z);
      pos.y = EYE + standY;
      camera.position.copy(pos);
      camera.rotation.set(look.pitch, look.yaw, 0, "YXZ");

      // Doors: close enough and pressing toward one takes you through.
      cooldown = Math.max(0, cooldown - dt);
      let hit: string | null = null;
      for (const dr of z.doors) {
        const dx = pos.x - dr.at[0], dz = pos.z - dr.at[1];
        // Along the door's face and how far in front of it.
        const out = dx * dr.normal[0] + dz * dr.normal[1];
        const along = Math.abs(dx * dr.normal[1] - dz * dr.normal[0]);
        if (dr.y != null && Math.abs(standY - dr.y) > 0.6) continue;
        const pass = dr.kind === "pass";
        if (along < dr.span + 0.2 && (pass ? Math.abs(out) < 1.2 : out < (dr.kind === "model" ? 1.4 : 0.9) && out > -1.5)) {
          hit = dr.to;
          const pushing = !pass && len > 0.01 && (fx * f + rx * s) * -dr.normal[0] + (fz * f + rz * s) * -dr.normal[1] > 0.2;
          // Through an arch or down a hatch: when you step onto it. A door: when you walk into it.
          const onIt = pass ? Math.abs(out) < 0.35 && along < dr.span : out < PULL * (dr.kind === "model" ? 1.6 : 0.75);
          if (!busy && cooldown === 0 && (pushing || onIt)) {
            busy = true;
            const from = z.id;
            goRef.current(dr.to, from);
            setTimeout(() => (busy = false), 600);
          }
          break;
        }
      }
      if (hit !== nearShown) {
        nearShown = hit;
        setNear(hit);
      }

      // People breathe, blink and look at you when you're near.
      tNow = t;
      const life = { zone: z, blockers, boxOf: (m: ZoneModel) => placed.get(m)?.box, others: people.map((p) => p.npc), player: { x: pos.x, z: pos.z } };
      for (const p of people) {
        if (editRef.current) {
          if (!p.held) placePerson(p);
        } else {
          if (p.held) {
            resetNpc(p.npc, t);
            p.held = false;
          }
          stepNpc(p.npc, life, t, dt);
        }
        const T = t + p.phase;
        p.grp.scale.y = p.grp.scale.x * (1 + Math.sin(T * 1.6) * 0.004);
        if (t > p.next) {
          p.at = t;
          p.next = t + 2 + Math.random() * 3.5;
        }
        const b = p.at < 0 ? 0 : (t - p.at) / 0.16;
        const blink = b > 0 && b < 1 ? Math.sin(b * Math.PI) : 0;
        for (const fc of p.faces) if (fc.mesh.morphTargetInfluences) fc.mesh.morphTargetInfluences[fc.i] = blink;
        if (p.head) {
          p.head.quaternion.copy(p.headRest);
          p.head.parent?.updateWorldMatrix(true, false);
          const hp = p.head.getWorldPosition(new THREE.Vector3());
          tmp.copy(camera.position).sub(hp);
          const dist = Math.hypot(tmp.x, tmp.z);
          const turn = dist < 6 ? 1 : 0;
          const yaw = THREE.MathUtils.clamp(Math.atan2(tmp.x, tmp.z) - p.grp.rotation.y, -0.9, 0.9) * turn;
          const pitch = THREE.MathUtils.clamp(-Math.atan2(tmp.y, dist), -0.4, 0.4) * turn;
          const want = new THREE.Quaternion().setFromEuler(new THREE.Euler(pitch * 0.6, yaw * 0.7, 0, "YXZ"));
          const pq = p.head.parent!.getWorldQuaternion(new THREE.Quaternion());
          const pg = p.grp.getWorldQuaternion(new THREE.Quaternion());
          const wq = pg.clone().multiply(want).multiply(pg.clone().invert());
          p.head.quaternion.premultiply(pq.clone().invert().multiply(wq).multiply(pq));
        }
      }
      if (snow) {
        const a = snow.geometry.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < a.count; i++) {
          let y = a.getY(i) - dt * 0.8;
          if (y < 0) y += 16;
          a.setY(i, y);
        }
        a.needsUpdate = true;
        snow.position.set(pos.x, pos.y - EYE, pos.z);
      }
      stars.position.set(pos.x, 0, pos.z);
      renderer.render(scene, camera);
    };
    loop();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("mousemove", onMouse);
      canvas.removeEventListener("click", onClick);
      renderer.dispose();
      mount.removeChild(canvas);
    };
    // The world is built once; moving between places is handled inside.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nearZone = near ? world.zones.find((z) => z.id === near) : null;
  return (
    <main className="fixed inset-0 select-none overflow-hidden bg-black text-paper">
      <div ref={mountRef} className="absolute inset-0 touch-none" />
      <div className={`pointer-events-none absolute inset-0 bg-black transition-opacity duration-200 ${fade ? "opacity-100" : "opacity-0"}`} />
      <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 bg-gradient-to-b from-black/70 to-transparent p-3 text-sm">
        <div>
          <p className="font-semibold">{zone.name}</p>
          <p className="text-xs text-smoke">{title}</p>
          {!ready ? <p className="text-xs text-smoke">Loading {Math.round(progress * 100)}%</p> : null}
          {nearZone ? <p className="mt-1 text-xs text-brass">To {nearZone.name}: keep walking</p> : null}
        </div>
        <div className="flex shrink-0 gap-3">
          <button
            type="button"
            className={`underline-offset-4 hover:underline ${edit ? "text-paper" : "text-brass"}`}
            onClick={() => {
              const v = !edit;
              setEdit(v);
              editRef.current = v;
              api.current.deselect?.();
              if (v) document.exitPointerLock?.();
            }}
          >
            {edit ? "Done" : "Edit"}
          </button>
          <button type="button" className="text-brass underline-offset-4 hover:underline" onClick={() => setMenu((m) => !m)}>
            Places
          </button>
          <Link href="/agency/admin" className="text-smoke underline-offset-4 hover:underline">
            Admin
          </Link>
        </div>
      </div>
      {menu ? (
        <div className="absolute right-2 top-12 max-h-[70vh] w-72 overflow-y-auto rounded-[2px] border border-rule bg-black/90 p-2 text-sm">
          {world.zones.map((z) => (
            <button
              key={z.id}
              type="button"
              className={`block w-full px-2 py-1.5 text-left hover:bg-white/10 ${z.id === zone.id ? "text-brass" : ""}`}
              onClick={() => {
                setMenu(false);
                goRef.current(z.id);
              }}
            >
              {z.name}
              <span className="ml-2 text-xs text-smoke">{z.outdoor ? "outdoors" : ""}{z.people.length ? ` · ${z.people.map((p) => p.name.split(" ")[0]).join(", ")}` : ""}</span>
            </button>
          ))}
          {world.missing.length ? (
            <button type="button" className="mt-2 block w-full px-2 py-1 text-left text-xs text-[#e2a7a2]" onClick={() => setShowMissing((v) => !v)}>
              {world.missing.length} pictures or models not made yet {showMissing ? "▴" : "▾"}
            </button>
          ) : null}
          {showMissing ? <p className="px-2 text-[0.65rem] leading-relaxed text-smoke">{world.missing.join(", ")}</p> : null}
        </div>
      ) : null}
      {edit ? (
        <div className="absolute inset-x-2 bottom-40 mx-auto max-w-md rounded-[2px] border border-rule bg-black/85 p-3 text-sm">
          <div className="flex items-baseline justify-between gap-2">
            <p className="font-semibold">{picked ? picked.label : zone.name}</p>
            <label className="flex items-center gap-1 text-xs text-smoke">
              <input
                type="checkbox"
                checked={fine}
                onChange={(e) => {
                  setFine(e.target.checked);
                  fineRef.current = e.target.checked;
                }}
              />
              Small steps
            </label>
          </div>
          {picked ? (
            <>
              <p className="text-xs text-smoke">{picked.size}. Arrows move it the way you are looking.</p>
              <div className="mt-2 grid grid-cols-4 gap-1.5">
                {(
                  [
                    ["◀", () => api.current.move(0, -1)],
                    ["▲", () => api.current.move(1, 0)],
                    ["▼", () => api.current.move(-1, 0)],
                    ["▶", () => api.current.move(0, 1)],
                    ["Up", () => api.current.lift(1)],
                    ["Down", () => api.current.lift(-1)],
                    ["↺ 15°", () => api.current.turn(15)],
                    ["↻ 15°", () => api.current.turn(-15)],
                    ["↺ 90°", () => api.current.turn(90)],
                    ["↻ 90°", () => api.current.turn(-90)],
                    ...((picked.person
                      ? [[picked.sit ? "Stand up" : "Sit in chair", () => api.current.sit()]]
                      : [
                          ["Smaller", () => api.current.scale(fine ? 0.98 : 0.92)],
                          ["Bigger", () => api.current.scale(fine ? 1.02 : 1.08)],
                          ["Copy", () => api.current.copy()],
                          ["Remove", () => api.current.remove()],
                        ]) as [string, () => void][]),
                    ["Let go", () => api.current.deselect()],
                    ...(picked.door ? ([["Way in: this side", () => api.current.wayIn()]] as [string, () => void][]) : []),
                  ] as [string, () => void][]
                ).map(([label, fn]) => (
                  <button key={label} type="button" className={`rounded-[2px] px-1 py-2 font-semibold ${label === "Remove" ? "bg-[#7a2f2a] text-paper" : "bg-brass text-ink"}`} onClick={fn}>
                    {label}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <p className="text-xs text-smoke">Tap something to arrange it. {roomSize ? `The room: ${roomSize}.` : ""}</p>
              {!zone.outdoor ? (
                <div className="mt-2 grid grid-cols-3 gap-1.5">
                  {(
                    [
                      ["Narrower", () => api.current.room(-1, 0, 0)],
                      ["Shallower", () => api.current.room(0, -1, 0)],
                      ["Lower", () => api.current.room(0, 0, -1)],
                      ["Wider", () => api.current.room(1, 0, 0)],
                      ["Deeper", () => api.current.room(0, 1, 0)],
                      ["Higher", () => api.current.room(0, 0, 1)],
                    ] as [string, () => void][]
                  ).map(([label, fn]) => (
                    <button key={label} type="button" className="rounded-[2px] bg-brass px-1 py-2 font-semibold text-ink" onClick={fn}>
                      {label}
                    </button>
                  ))}
                </div>
              ) : null}
              <button
                type="button"
                className="mt-2 text-xs text-[#e2a7a2] underline-offset-4 hover:underline"
                onClick={() => {
                  if (window.confirm("Put this room back to how it was generated? Your arrangement here is lost.")) api.current.reset();
                }}
              >
                Reset this room
              </button>
            </>
          )}
          {saving ? <p className="mt-1 text-xs text-smoke">{saving}</p> : null}
        </div>
      ) : null}
      <div ref={stickRef} className={`absolute bottom-8 left-8 h-28 w-28 rounded-full border border-white/30 bg-white/10 ${touch ? "" : "hidden"}`}>
        <div ref={knobRef} className="absolute left-1/2 top-1/2 -ml-6 -mt-6 h-12 w-12 rounded-full bg-white/40" />
      </div>
      {!touch ? <p className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-xs text-smoke">Click to look around · WASD to walk · Shift to hurry · Esc to free the mouse</p> : null}
    </main>
  );
}
