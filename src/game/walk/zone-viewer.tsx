"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader, type GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";
import { trimRuns, wallRects } from "./walk-viewer";
import type { Side, World, Zone, ZoneWall } from "./zones";

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

type Person = { grp: THREE.Object3D; head: THREE.Bone | null; headRest: THREE.Quaternion; faces: { mesh: THREE.Mesh; i: number }[]; next: number; at: number; phase: number };

export function ZoneViewer({ world, title, eye: eyeIn }: { world: World; title: string; eye?: number }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const stickRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const goRef = useRef<(to: string, from?: string) => void>(() => {});
  const [zoneId, setZoneId] = useState(world.start);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [menu, setMenu] = useState(false);
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
    let people: Person[] = [];
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
            return x1 < 0 ? null : [x0 / S, (x1 + 1) / S, y0 / S, (y1 + 1) / S];
          }),
        );
      return bounds.get(url)!;
    };
    const cropToFrame = (url: string, t: THREE.Texture, mat: THREE.MeshLambertMaterial) => {
      const apply = (img: HTMLImageElement) =>
        opaqueBounds(url, img).then((b) => {
          if (!b || (b[0] < 0.01 && b[1] > 0.99 && b[2] < 0.01 && b[3] > 0.99)) return;
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
        if (t && p.opening) cropToFrame(p.tex!, t, mat);
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
      const H = Math.max(z.size[2], 9);
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
      m.position.set(0, H / 2 - 0.5, -14);
      wg.add(m);
      g.add(wg);
    };

    const build = (z: Zone, arriveFrom?: string) => {
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
      const ft = tiled(z.floor.tex);
      const floorW = z.outdoor ? w + 60 : w, floorD = z.outdoor ? d + 60 : d;
      const floor = new THREE.Mesh(tiledPlane(floorW, floorD, 0, 0, z.floor.tile), ft ? new THREE.MeshLambertMaterial({ map: ft }) : plain(z.outdoor ? 0xe8eef8 : 0x8a6a4a));
      floor.rotation.x = -Math.PI / 2;
      root.add(floor);
      if (z.ceiling) {
        const ct = tiled(z.ceiling.tex);
        const ceil = new THREE.Mesh(tiledPlane(w, d, 0, 0, z.ceiling.tile), ct ? new THREE.MeshLambertMaterial({ map: ct }) : plain(0xd8cbb0));
        ceil.rotation.x = Math.PI / 2;
        ceil.position.y = H;
        root.add(ceil);
      }
      for (const dc of z.decals) {
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
        const turned = Math.abs(M.rotY) === 90;
        const fw = turned ? M.size[1] : M.size[0], fd = turned ? M.size[0] : M.size[1];
        if (M.solid && M.elev < 0.05 && M.size[2] > 0.25) blockers.push({ x0: M.pos[0] - fw / 2, x1: M.pos[0] + fw / 2, z0: M.pos[1] - fd / 2, z1: M.pos[1] + fd / 2 });
        const sh = new THREE.Mesh(new THREE.PlaneGeometry(fw * 1.2, fd * 1.2), contact);
        sh.rotation.x = -Math.PI / 2;
        sh.position.set(M.pos[0], M.elev + 0.006, M.pos[1]);
        if (M.elev < 0.05) root.add(sh);
        if (M.light && lamps < 10) {
          lamps++;
          const pl = new THREE.PointLight(0xffc77a, z.outdoor ? 10 : 4, z.outdoor ? 14 : 8, 1.6);
          pl.position.set(M.pos[0], M.elev + M.size[2] * 0.9, M.pos[1]);
          root.add(pl);
        }
        if (!M.file) {
          const box = new THREE.Mesh(new THREE.BoxGeometry(M.size[0], M.size[2], M.size[1]), new THREE.MeshLambertMaterial({ color: 0x9a7ad0, transparent: true, opacity: 0.35 }));
          box.position.set(M.pos[0], M.elev + M.size[2] / 2, M.pos[1]);
          box.rotation.y = (M.rotY * Math.PI) / 180;
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
            const ks = [M.size[0] / s.x, M.size[2] / s.y, M.size[1] / s.z].filter((k) => Number.isFinite(k) && k > 0).sort((a, b) => a - b);
            const k = ks[Math.floor(ks.length / 2)] ?? 1;
            const grp = new THREE.Group();
            grp.add(off);
            grp.scale.setScalar(k);
            grp.rotation.y = (M.rotY * Math.PI) / 180;
            grp.position.set(M.pos[0], M.elev, M.pos[1]);
            parent.add(grp);
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
              }
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
        blockers.push({ x0: P.pos[0] - 0.3, x1: P.pos[0] + 0.3, z0: P.pos[1] - 0.3, z1: P.pos[1] + 0.3 });
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
            });
            const box = new THREE.Box3().setFromObject(obj);
            const k = P.height / Math.max(0.01, box.max.y - box.min.y);
            const grp = new THREE.Group();
            obj.position.y = -box.min.y;
            grp.add(obj);
            grp.scale.setScalar(k);
            grp.position.set(P.pos[0], 0, P.pos[1]);
            grp.rotation.y = P.rotY;
            parent.add(grp);
            const hb = head as THREE.Bone | null;
            people.push({ grp, head: hb, headRest: hb ? hb.quaternion.clone() : new THREE.Quaternion(), faces, next: 1 + Math.random() * 3, at: -1, phase: Math.random() * 10 });
          })
          .catch(() => {})
          .finally(tick);
      }
      if (!want) setReady(true);

      // Where you arrive: at the door back to where you came from, a step inside, facing in.
      const back = arriveFrom ? z.doors.find((dr) => dr.to === arriveFrom) : null;
      if (back) {
        const step = back.kind === "wall" ? 1.1 : 1.7;
        pos.set(back.at[0] + back.normal[0] * step, EYE, back.at[1] + back.normal[1] * step);
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

    // Moving and bumping.
    function free(x: number, zz: number) {
      const z = current!;
      const [w, d] = z.size;
      if (x < -w / 2 + RADIUS || x > w / 2 - RADIUS || zz < -d / 2 + RADIUS || zz > d / 2 - RADIUS) return false;
      return !blockers.some((b) => x > b.x0 - RADIUS && x < b.x1 + RADIUS && zz > b.z0 - RADIUS && zz < b.z1 + RADIUS);
    }
    const move = (dx: number, dz: number) => {
      if (free(pos.x + dx, pos.z + dz)) {
        pos.x += dx;
        pos.z += dz;
      } else if (free(pos.x + dx, pos.z)) pos.x += dx;
      else if (free(pos.x, pos.z + dz)) pos.z += dz;
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
    const onClick = () => {
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
      for (const p of people) {
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
        snow.position.set(pos.x, 0, pos.z);
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
      <div ref={stickRef} className={`absolute bottom-8 left-8 h-28 w-28 rounded-full border border-white/30 bg-white/10 ${touch ? "" : "hidden"}`}>
        <div ref={knobRef} className="absolute left-1/2 top-1/2 -ml-6 -mt-6 h-12 w-12 rounded-full bg-white/40" />
      </div>
      {!touch ? <p className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-xs text-smoke">Click to look around · WASD to walk · Shift to hurry · Esc to free the mouse</p> : null}
    </main>
  );
}
