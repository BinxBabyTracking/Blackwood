"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader, type GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { trimRuns, wallRects } from "./walk-viewer";
import { doorsOf, floorSize, groundAt, heightAt, layoutOf, roomLayoutOf } from "./zones";
import { makeAurora } from "./aurora";
import { holdNpc, makeNpc, resetNpc, rigOf, stepNpc } from "./npc";
import type { Npc } from "./npc";
import { clearRoomLayout, saveRoomLayout } from "@/app/actions/art";
import { StoryRun, type StoryData } from "./story";
import { StoryOverlay } from "./story-overlay";
import { roomToWorld } from "./zones";
import type { Building, KitDoor, Side, World, Zone, ZoneModel, ZonePerson, ZoneWall } from "./zones";

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
/**
 * Fades whatever stands past the edge of open land into the haze by how far past the edge it is (not how far from
 * you), so the hills and woods melt into the sky instead of showing as a lit slope.
 */
function edgeFog<M extends THREE.Material>(mat: M, rim: number[]): M {
  // Materials shared between visits get it once.
  if (mat.userData.edgeFog) return mat;
  mat.userData.edgeFog = true;
  const prev = mat.onBeforeCompile;
  mat.onBeforeCompile = (sh, r) => {
    prev?.call(mat, sh, r);
    sh.uniforms.uRim = { value: new THREE.Vector2(rim[0] / 2, rim[1] / 2) };
    sh.vertexShader = "varying vec2 vEdgeW;\n" + sh.vertexShader.replace(
      "#include <fog_vertex>",
      `#include <fog_vertex>
      vec4 edgeW = vec4(transformed, 1.0);
      #ifdef USE_INSTANCING
        edgeW = instanceMatrix * edgeW;
      #endif
      vEdgeW = (modelMatrix * edgeW).xz;`,
    );
    sh.fragmentShader = "varying vec2 vEdgeW;\nuniform vec2 uRim;\n" + sh.fragmentShader.replace(
      "#include <fog_fragment>",
      `#include <fog_fragment>
      #ifdef USE_FOG
        float edgeO = max(abs(vEdgeW.x) - uRim.x, abs(vEdgeW.y) - uRim.y);
        gl_FragColor.rgb = mix(gl_FragColor.rgb, fogColor, smoothstep(8.0, 110.0, edgeO));
      #endif`,
    );
  };
  mat.customProgramCacheKey = () => "edgefog";
  mat.needsUpdate = true;
  return mat;
}

/* ---------- Building kit: walls, roofs and doors put together in code ---------- */

let kitTex: { plaster: THREE.CanvasTexture; shingle: THREE.CanvasTexture; stone: THREE.CanvasTexture } | null = null;
/** Painted plaster between dark timbers, red clay shingles, and a fieldstone plinth: drawn once, tiling. */
function kitTextures() {
  if (kitTex) return kitTex;
  let seed = 99;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const make = (w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) => {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    draw(c.getContext("2d")!);
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  };
  // 2 m square: cream plaster, a timber frame round it and a brace.
  const plaster = make(512, 512, (g) => {
    g.fillStyle = "#efe2c4";
    g.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 2600; i++) {
      g.fillStyle = `rgba(${150 + rnd() * 60},${130 + rnd() * 50},${100 + rnd() * 40},${0.05 + rnd() * 0.07})`;
      g.fillRect(rnd() * 512, rnd() * 512, 2 + rnd() * 9, 2 + rnd() * 9);
    }
    g.fillStyle = "#4a2e1d";
    g.fillRect(0, 0, 26, 512);
    g.fillRect(0, 0, 512, 22);
    g.fillRect(0, 250, 512, 18);
    g.save();
    g.translate(26, 268);
    g.rotate(-Math.atan2(240, 486));
    g.fillRect(0, 0, Math.hypot(486, 240), 16);
    g.restore();
    g.strokeStyle = "rgba(0,0,0,0.25)";
    for (let i = 0; i < 40; i++) {
      g.beginPath();
      const y = rnd() * 512;
      g.moveTo(0, y);
      g.lineTo(26, y + rnd() * 6);
      g.stroke();
    }
  });
  // 1 m square: rows of rounded shingles, staggered.
  const shingle = make(256, 256, (g) => {
    g.fillStyle = "#5a1712";
    g.fillRect(0, 0, 256, 256);
    for (let row = 0; row < 8; row++)
      for (let k = -1; k < 9; k++) {
        const x = k * 32 + (row % 2) * 16, y = row * 32;
        const v = 0.75 + rnd() * 0.35;
        g.fillStyle = `rgb(${Math.round(160 * v)},${Math.round(42 * v)},${Math.round(34 * v)})`;
        g.beginPath();
        g.moveTo(x + 1, y);
        g.lineTo(x + 31, y);
        g.lineTo(x + 31, y + 22);
        g.quadraticCurveTo(x + 16, y + 34, x + 1, y + 22);
        g.closePath();
        g.fill();
        g.fillStyle = "rgba(0,0,0,0.25)";
        g.fillRect(x + 1, y, 30, 3);
      }
  });
  // 1 m square: grey fieldstones in mortar.
  const stone = make(256, 256, (g) => {
    g.fillStyle = "#59575a";
    g.fillRect(0, 0, 256, 256);
    for (let row = 0; row < 5; row++)
      for (let k = -1; k < 6; k++) {
        const x = k * 52 + (row % 2) * 26 + rnd() * 6, y = row * 52 + rnd() * 4;
        const v = 0.7 + rnd() * 0.4;
        g.fillStyle = `rgb(${Math.round(150 * v)},${Math.round(146 * v)},${Math.round(150 * v)})`;
        g.beginPath();
        g.ellipse(x + 25, y + 24, 23, 21, rnd() * 0.5, 0, Math.PI * 2);
        g.fill();
      }
  });
  return (kitTex = { plaster, shingle, stone });
}
/** A box whose texture repeats every `tile` metres along its faces. */
function kitBox(w: number, h: number, d: number, mat: THREE.Material, tile = 0) {
  const g = new THREE.BoxGeometry(w, h, d);
  if (tile) {
    const uv = g.attributes.uv as THREE.BufferAttribute, n = g.attributes.normal as THREE.BufferAttribute;
    for (let i = 0; i < uv.count; i++) {
      const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i));
      const [a, b] = ax > 0.5 ? [d, h] : ay > 0.5 ? [w, d] : [w, h];
      uv.setXY(i, (uv.getX(i) * a) / tile, (uv.getY(i) * b) / tile);
    }
  }
  return new THREE.Mesh(g, mat);
}

/** Snowy night haze: what the distance fades into. */
const HAZE = 0x1a2648;
/** The night sky: deep blue overhead, easing into the haze at the horizon so far hills melt away. */
function skyDome() {
  const R = 900;
  const g = new THREE.SphereGeometry(R, 48, 24);
  const col: number[] = [];
  const top = new THREE.Color(0x040817), low = new THREE.Color(HAZE), c = new THREE.Color();
  const pa = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pa.count; i++) {
    // Haze right up past the far hills, then night sky.
    const t = Math.max(0, Math.min(1, (pa.getY(i) / R - 0.11) / 0.5));
    c.copy(low).lerp(top, Math.pow(t, 0.6));
    col.push(c.r, c.g, c.b);
  }
  g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false }));
  m.renderOrder = -1;
  m.frustumCulled = false;
  return m;
}
/** A low snowy pine, one unit tall, for the far woods (the fog keeps it from needing detail). */
let pineGeo: THREE.BufferGeometry | null = null;
function lowPine() {
  if (pineGeo) return pineGeo;
  const parts: THREE.BufferGeometry[] = [];
  const paint = (g: THREE.BufferGeometry, hex: number) => {
    const c = new THREE.Color(hex), n = g.attributes.position.count, a: number[] = [];
    for (let i = 0; i < n; i++) a.push(c.r, c.g, c.b);
    g.setAttribute("color", new THREE.Float32BufferAttribute(a, 3));
    g.deleteAttribute("uv");
    return g.index ? g.toNonIndexed() : g;
  };
  const trunk = new THREE.CylinderGeometry(0.03, 0.045, 0.2, 6);
  trunk.translate(0, 0.1, 0);
  parts.push(paint(trunk, 0x4a3426));
  const tiers = [[0.15, 0.36, 0.42], [0.37, 0.29, 0.36], [0.57, 0.21, 0.3], [0.75, 0.13, 0.25]];
  for (const [y, r, h] of tiers) {
    const cone = new THREE.ConeGeometry(r, h, 7);
    cone.translate(0, y + h / 2, 0);
    parts.push(paint(cone, 0x23402f));
    const cap = new THREE.ConeGeometry(r * 0.72, h * 0.55, 7);
    cap.translate(0, y + h * 0.45 + (h * 0.55) / 2 + 0.012, 0);
    parts.push(paint(cap, 0xe9eff9));
  }
  pineGeo = mergeGeometries(parts)!;
  pineGeo.computeVertexNormals();
  return pineGeo;
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

export function ZoneViewer({ world, title, eye: eyeIn, story, storyKey }: { world: World; title: string; eye?: number; story?: StoryData; storyKey?: string }) {
  // The story running in this world (the clock, the loop, evidence), when there is one.
  const [run] = useState(() => (story ? new StoryRun(story, storyKey ?? `walkstory:${world.caseId}`) : null));
  const mountRef = useRef<HTMLDivElement>(null);
  const stickRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const goRef = useRef<(to: string, from?: string) => void>(() => {});
  const [zoneId, setZoneId] = useState(() => {
    const want = run ? (run.s.where ?? (run.s.loop === 1 ? run.d.firstStart.zone : run.d.dayStart.zone)) : world.start;
    return world.zones.some((z) => z.id === want) ? want : world.start;
  });
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
  const [hint, setHint] = useState<string | null>(null);
  const [placeName, setPlaceName] = useState<string | null>(null);
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
    // Film-like colour, and a soft glow round anything bright (lamps, lanterns, fire).
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    const lowPower = "ontouchstart" in window;
    /** Shadows from a few nearby lights (point lights cost six renders each, so only a handful). */
    let casters = 0;
    const castFrom = (pl: THREE.PointLight) => {
      if (casters >= (lowPower ? 2 : 4)) return;
      casters++;
      pl.castShadow = true;
      pl.shadow.mapSize.set(lowPower ? 256 : 512, lowPower ? 256 : 512);
      pl.shadow.camera.near = 0.1;
      pl.shadow.camera.far = pl.distance || 12;
      pl.shadow.bias = -0.003;
      pl.shadow.normalBias = 0.03;
      pl.shadow.radius = 3;
      pointCasters.push(pl);
    };
    let pointCasters: THREE.PointLight[] = [];
    /** Everything solid casts and catches shadows (not the sky, glows, glass, or the far woods). */
    const shadowify = (o: THREE.Object3D) =>
      o.traverse((c) => {
        const mesh = c as THREE.Mesh;
        if (!mesh.isMesh || (c as THREE.InstancedMesh).isInstancedMesh || c.userData.noShadow) return;
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        if (mats.some((m) => m.transparent || (m as THREE.MeshBasicMaterial).isMeshBasicMaterial || m.type === "ShaderMaterial")) return;
        mesh.receiveShadow = true;
        mesh.castShadow = !c.userData.noCast;
      });
    mount.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, mount.clientWidth / mount.clientHeight, 0.05, 1200);
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const small = "ontouchstart" in window;
    composer.addPass(new UnrealBloomPass(new THREE.Vector2(mount.clientWidth / (small ? 3 : 2), mount.clientHeight / (small ? 3 : 2)), 0.5, 0.55, 0.9));
    composer.addPass(new OutputPass());
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
    // top: how high it stands (so you can walk over it on a stair or landing above); none means all the way up.
    let blockers: { x0: number; x1: number; z0: number; z1: number; top?: number }[] = [];
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
      for (const b of z.buildings ?? []) blockers.push(...b.walls);
      for (const M of z.models) {
        const [fw, fd] = floorSize(M);
        const onGround = M.elev - heightAt(z.terrain, M.pos[0], M.pos[1]) < 0.05;
        const b = placed.get(M)?.box;
        if (M.block != null) blockers.push({ x0: M.pos[0] - M.block, x1: M.pos[0] + M.block, z0: M.pos[1] - M.block, z1: M.pos[1] + M.block });
        else if (M.solid && onGround && M.size[2] > 0.25) {
          // The model's real footprint once it has loaded (a model can come out smaller or larger than planned).
          if (b) blockers.push({ x0: b.min.x + 0.05, x1: b.max.x - 0.05, z0: b.min.z + 0.05, z1: b.max.z - 0.05, top: b.max.y });
          else blockers.push({ x0: M.pos[0] - fw / 2, x1: M.pos[0] + fw / 2, z0: M.pos[1] - fd / 2, z1: M.pos[1] + fd / 2, top: M.elev + M.size[2] });
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
      return { pos: c, seat: seat - ground - (P.floor ?? 0), rotY };
    };
    let snow: THREE.Points | null = null;
    let aurora: ReturnType<typeof makeAurora> | null = null;
    /** Doors in buildings: closed or open, and how far round they've swung (0 shut, 1 open). */
    /** Lights that flicker: fires, stoves and lanterns. */
    let flames: { light: THREE.PointLight; base: number; phase: number; amount: number }[] = [];
    /** Strings of fairy lights that twinkle. */
    let twinkles: { mesh: THREE.InstancedMesh; phase: number; last?: number }[] = [];
    /** Lights in buildings: every lamp, lantern and fire, lit for real only when among the nearest few (a fixed pool). */
    type KitLight = { at: THREE.Vector3; color: number; intensity: number; distance: number; decay: number; flicker: number; phase: number };
    let kitLights: KitLight[] = [];
    let lightPool: { light: THREE.PointLight; def: KitLight | null }[] = [];
    let poolAt = 0;
    const addKitLight = (o: THREE.Object3D, x: number, y: number, z: number, color: number, intensity: number, distance: number, decay: number, flicker = 0) => {
      o.updateWorldMatrix(true, false);
      kitLights.push({ at: o.localToWorld(new THREE.Vector3(x, y, z)), color, intensity, distance, decay, flicker, phase: Math.random() * 10 });
    };
    let kitDoors: { d: KitDoor; pivot: THREE.Group; slab: THREE.Mesh; base: number; swing: number; open: boolean; k: number }[] = [];
    /** Inside a building (0 out, 1 in), eased, and the room you're in. */
    let indoors = 0;
    let roomHere: string | null = null;
    let kitRooms: { x0: number; x1: number; z0: number; z1: number; name: string; y: number; zone?: string; building?: string }[] = [];
    /** Building insides, for the render distance. */
    let insides: { group: THREE.Object3D; rect: { x0: number; x1: number; z0: number; z1: number }; building: string }[] = [];
    let farAt = -1;
    /** How far you can see inside buildings, and (on phones) things outdoors. */
    const INSIDE_M = "ontouchstart" in window ? 16 : 32;
    const OUTDOOR_M = "ontouchstart" in window ? 75 : Infinity;
    let outerLights: { hemi: THREE.HemisphereLight; moon: THREE.DirectionalLight; warm: THREE.AmbientLight } | null = null;
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

    const buildWall = (z: Zone, side: Side, def: ZoneWall, g: THREE.Group, kit = false, doorway: (to: string) => boolean = () => true) => {
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
        // In a building, a doorway holds a real door, and a window looks out on the real world.
        if (kit && p.to && doorway(p.to)) continue;
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
        if (p.opening && !kit) {
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

    /**
     * Woods past the edge of open land: thick near the edge (the village's own pines, many at once) and thinning,
     * lower-detail, into the snowy haze. Kept off the roads that run out into them.
     */
    /**
     * A building put together from its rooms: each room's inside from its own data (floor, ceiling, walls, trim,
     * lamps), and outside a kit of pieces: thick plastered timber-frame walls with corner posts on a stone plinth,
     * framed windows, a steep shingled roof with snow on it and deep eaves, and a real door in every doorway.
     */
    const drawBuilding = (b: Building, parent: THREE.Group) => {
      const K = kitTextures();
      const timber = new THREE.MeshLambertMaterial({ color: 0x4a2e1d });
      // The building's own painted outside (Admin, Artwork tab), or the plain kit look until it's made.
      const L = b.look;
      const stoneM = new THREE.MeshLambertMaterial({ map: tiled(L?.base ?? null) ?? K.stone });
      const shingleM = new THREE.MeshLambertMaterial({ map: tiled(L?.roof ?? null) ?? K.shingle });
      const roofTile = L?.roof ? 1.2 : 1;
      const doorOut = L?.door ? new THREE.MeshLambertMaterial({ map: tex(L.door) }) : null;
      const winOut = L?.window ? new THREE.MeshLambertMaterial({ map: tex(L.window), alphaTest: 0.5, side: THREE.DoubleSide }) : null;
      const snowM = new THREE.MeshLambertMaterial({ color: 0xf2f6ff });
      const plasterM = new THREE.MeshLambertMaterial({ map: tiled(L?.wall ?? null) ?? K.plaster, side: THREE.DoubleSide });
      const beamM = new THREE.MeshLambertMaterial({ color: 0x7a4a2a });
      const brassM = new THREE.MeshStandardMaterial({ color: 0xb8893a, metalness: 0.6, roughness: 0.35, side: THREE.DoubleSide });
      const ironM = new THREE.MeshLambertMaterial({ color: 0x2a2420 });
      const bulbM = new THREE.MeshStandardMaterial({ color: 0xfff1d6, emissive: 0xffc070, emissiveIntensity: 4 });
      const glassM = new THREE.MeshStandardMaterial({ color: 0xffe2a8, emissive: 0xffa94d, emissiveIntensity: 2.6, transparent: true, opacity: 0.92 });
      const pineM = new THREE.MeshLambertMaterial({ color: 0x1f4a2c, flatShading: true });
      const pine2M = new THREE.MeshLambertMaterial({ color: 0x2f6a3a, flatShading: true });
      const berryM = new THREE.MeshLambertMaterial({ color: 0xb01818 });
      const bulbGeo = new THREE.SphereGeometry(0.028, 8, 6);
      const berryGeo = new THREE.SphereGeometry(0.03, 6, 5);
      const BULBS = [new THREE.Color(3.2, 0.35, 0.3), new THREE.Color(0.4, 2.8, 0.6), new THREE.Color(0.5, 0.9, 3.4), new THREE.Color(3.2, 2.1, 0.5), new THREE.Color(2.8, 2.6, 2.4)];
      /** Garland swagged between two points (dipping in scallops about a metre long), with berries and fairy lights. */
      const festoon = (parent: THREE.Object3D, ends: THREE.Vector3[], sag: number) => {
        const [a, b2] = ends;
        const L = a.distanceTo(b2);
        const swags = Math.max(1, Math.round(L / 0.9));
        const pts: THREE.Vector3[] = [];
        const N = swags * 12;
        for (let i = 0; i <= N; i++) {
          const t2 = i / N;
          const p = a.clone().lerp(b2, t2);
          p.y -= sag * Math.sin(((t2 * swags) % 1) * Math.PI);
          pts.push(p);
        }
        const curve = new THREE.CatmullRomCurve3(pts);
        // Two twisted strands make it full.
        const g1 = new THREE.Mesh(new THREE.TubeGeometry(curve, N * 2, 0.06, 6), pineM);
        const twist = new THREE.CatmullRomCurve3(pts.map((p, i) => p.clone().add(new THREE.Vector3(0, Math.sin(i * 1.7) * 0.03, Math.cos(i * 1.7) * 0.03))));
        const g2 = new THREE.Mesh(new THREE.TubeGeometry(twist, N * 2, 0.045, 5), pine2M);
        parent.add(g1, g2);
        const count = Math.max(2, Math.round(curve.getLength() / 0.2));
        const lights = new THREE.InstancedMesh(bulbGeo, new THREE.MeshBasicMaterial({ color: 0xffffff }), count);
        const berries = new THREE.InstancedMesh(berryGeo, berryM, Math.ceil(count / 2));
        const m = new THREE.Matrix4();
        for (let i = 0; i < count; i++) {
          const p = curve.getPointAt((i + 0.5) / count);
          m.makeTranslation(p.x + (i % 2 ? 0.05 : -0.05), p.y - 0.05, p.z + (i % 2 ? 0.03 : -0.03));
          lights.setMatrixAt(i, m);
          lights.setColorAt(i, BULBS[i % BULBS.length]);
          if (i % 2 === 0) {
            m.makeTranslation(p.x - 0.03, p.y + 0.04, p.z + 0.05);
            berries.setMatrixAt(i / 2, m);
          }
        }
        lights.userData.noShadow = true;
        parent.add(lights, berries);
        twinkles.push({ mesh: lights, phase: Math.random() * 10 });
      };
      // A real doorway (opened through the wall, with a door): to outside, or between this building's rooms.
      const own = new Set(b.rooms.map((r) => r.zone));
      const doorway = (to: string) => to === current?.id || own.has(to);
      for (const kr of b.rooms) {
        const rz = world.zones.find((q) => q.id === kr.zone);
        if (!rz) continue;
        const [w, d, H] = rz.size;
        {
          const half = kr.rot % 180 === 0 ? [w / 2, d / 2] : [d / 2, w / 2];
          kitRooms.push({ x0: kr.pos[0] - half[0], x1: kr.pos[0] + half[0], z0: kr.pos[1] - half[1], z1: kr.pos[1] + half[1], name: rz.name, y: kr.y, zone: kr.zone, building: b.id });
        }
        const g = new THREE.Group();
        g.position.set(kr.pos[0], kr.y, kr.pos[1]);
        g.rotation.y = (kr.rot * Math.PI) / 180;
        parent.add(g);
        // The inside, drawn only near you (render distance); the outside always.
        const ig = new THREE.Group();
        g.add(ig);
        insides.push({ group: ig, rect: kitRooms[kitRooms.length - 1], building: b.id });
        // Inside.
        const ftx = tiled(rz.floor.tex);
        const floor = new THREE.Mesh(tiledPlane(w, d, 0, 0, rz.floor.tile), ftx ? new THREE.MeshLambertMaterial({ map: ftx }) : plain(0x8a6a4a));
        floor.rotation.x = -Math.PI / 2;
        ig.add(floor);
        for (const dc of rz.decals) {
          const t = dc.tile ? tiled(dc.tex) : tex(dc.tex);
          if (!t) continue;
          const geo = dc.tile ? tiledPlane(dc.size[0], dc.size[1], 0, 0, dc.tile) : new THREE.PlaneGeometry(dc.size[0], dc.size[1]);
          const m = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ map: t, alphaTest: 0.3, transparent: true }));
          m.rotation.set(-Math.PI / 2, 0, (dc.rotY * Math.PI) / 180);
          m.position.set(dc.pos[0], 0.01, dc.pos[1]);
          ig.add(m);
        }
        // The roof over this room: ridge along the longer side, steep, deep eaves. The room is open up into it.
        const along = w >= d;
        const ih = (along ? d : w) / 2, il = (along ? w : d) / 2;
        const sh = ih + WALL + 0.45;
        const rise = sh * Math.tan((42 * Math.PI) / 180);
        const pitch = Math.atan2(rise, sh);
        const y0 = H + 0.05;
        /** The ceiling's height above a point of the floor (room metres). */
        const ceilAt = (x: number, z0: number) => y0 + rise * (1 - Math.abs(along ? z0 : x) / sh) - 0.14;
        // Hanging lamps where the room's ceiling lights are.
        let lit = 0;
        for (const fx of rz.fixtures) {
          const top0 = ceilAt(fx.pos[0], fx.pos[1]);
          const bulbY = Math.min(H - 0.22, top0 - 0.5);
          const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, top0 - bulbY, 6), brassM);
          chain.position.set(fx.pos[0], (top0 + bulbY) / 2, fx.pos[1]);
          const shade = new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.2, 20, 1, true), brassM);
          shade.position.set(fx.pos[0], bulbY + 0.06, fx.pos[1]);
          const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.075, 14, 10), bulbM);
          bulb.position.set(fx.pos[0], bulbY - 0.02, fx.pos[1]);
          ig.add(chain, shade, bulb);
          if (fx.light && lit < 2) {
            lit++;
            addKitLight(g, fx.pos[0], bulbY - 0.1, fx.pos[1], 0xffc98a, 2.2, 10, 1.6);
          }
        }
        if (!lit) {
          addKitLight(g, 0, H - 0.4, 0, 0xffc98a, 3, 12, 1.4);
        }
        for (const side of ["front", "back", "left", "right"] as Side[]) buildWall(rz, side, rz.walls[side], ig, true, doorway);
        // Lanterns on the walls, where nothing hangs: one lit for real, the others glowing.
        {
          const ly = Math.min(1.75, H * 0.62);
          let hung = 0;
          for (const side of (along ? ["front", "back", "left", "right"] : ["left", "right", "front", "back"]) as Side[]) {
            if (hung >= 2) break;
            const f = wallFrame(rz, side);
            const W = f.width;
            const clear = (u: number) => rz.walls[side].pieces.every((p) => u < p.x - 0.35 || u > p.x + p.w + 0.35 || ly + 0.3 < p.y || ly - 0.3 > p.y + p.h);
            const u = [W / 2, W / 3, (2 * W) / 3, W / 4, (3 * W) / 4].find(clear);
            if (u == null) continue;
            const wg = new THREE.Group();
            wg.position.set(f.pos[0], 0, f.pos[1]);
            wg.rotation.y = f.rot;
            ig.add(wg);
            const x = u - W / 2;
            const plate = kitBox(0.12, 0.26, 0.03, ironM);
            plate.position.set(x, ly + 0.05, 0.015);
            const arm = kitBox(0.03, 0.03, 0.2, ironM);
            arm.position.set(x, ly + 0.14, 0.11);
            const cap = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.09, 4), ironM);
            cap.rotation.y = Math.PI / 4;
            cap.position.set(x, ly + 0.17, 0.22);
            const glass = kitBox(0.11, 0.17, 0.11, glassM);
            glass.position.set(x, ly + 0.04, 0.22);
            const base = kitBox(0.13, 0.025, 0.13, ironM);
            base.position.set(x, ly - 0.055, 0.22);
            wg.add(plate, arm, cap, glass, base);
            if (hung === 0) {
              addKitLight(wg, x, ly + 0.04, 0.32, 0xffa860, 2.6, 6, 1.8, 0.08);
            }
            hung++;
          }
        }

        // Outside: plastered walls with the openings cut through, framed.
        const top = y0, foot = -0.7;
        for (const side of ["front", "back", "left", "right"] as Side[]) {
          const f = wallFrame(rz, side);
          const W = f.width;
          const wg = new THREE.Group();
          wg.position.set(f.pos[0], 0, f.pos[1]);
          wg.rotation.y = f.rot;
          g.add(wg);
          const holes = rz.walls[side].pieces.filter((p) => p.opening && (!p.to || doorway(p.to))).map((p) => ({ x0: p.x - W / 2, x1: p.x + p.w - W / 2, y0: p.y, y1: p.y + p.h }));
          for (const q of wallRects(-W / 2 - WALL, W / 2 + WALL, foot, top, holes)) {
            const m = new THREE.Mesh(tiledPlane(q.x1 - q.x0, q.y1 - q.y0, -q.x1, q.y0, 2), plasterM);
            m.rotation.y = Math.PI;
            m.position.set((q.x0 + q.x1) / 2, (q.y0 + q.y1) / 2, -WALL);
            wg.add(m);
          }
          // The stone foundation along the foot of the wall, up to the floor, open at doorways.
          {
            const gaps = rz.walls[side].pieces.filter((p) => p.to && doorway(p.to)).map((p) => [p.x - W / 2, p.x + p.w - W / 2]).sort((a, b2) => a[0] - b2[0]);
            let u = -W / 2 - WALL - 0.08;
            const runs: number[][] = [];
            for (const [a0, a1] of gaps) {
              if (a0 > u) runs.push([u, a0]);
              u = Math.max(u, a1);
            }
            if (u < W / 2 + WALL + 0.08) runs.push([u, W / 2 + WALL + 0.08]);
            for (const [a0, a1] of runs) {
              const pl = kitBox(a1 - a0, -foot + 0.02, 0.1, stoneM, 1);
              pl.position.set((a0 + a1) / 2, (foot + 0.02) / 2, -WALL - 0.05);
              wg.add(pl);
            }
          }
          for (const p of rz.walls[side].pieces) {
            if (!p.opening || (p.to && !doorway(p.to))) continue;
            const cx = p.x + p.w / 2 - W / 2;
            const fw = 0.11, out = -WALL - 0.035;
            const jambs: [number, number, number, number][] = [
              [cx - p.w / 2 - fw / 2, p.y + p.h / 2, fw, p.h + fw],
              [cx + p.w / 2 + fw / 2, p.y + p.h / 2, fw, p.h + fw],
              [cx, p.y + p.h + fw / 2, p.w + 2 * fw, fw],
            ];
            if (!p.to) jambs.push([cx, p.y - fw / 2, p.w + 2 * fw + 0.1, fw]);
            for (const [x, y, bw, bh] of jambs) {
              const m = kitBox(bw, bh, 0.08, timber);
              m.position.set(x, y, out);
              wg.add(m);
            }
            if (!p.to && winOut) {
              // The window as seen from outside: its frame, shutters and window box, over the hole.
              const wm = new THREE.Mesh(new THREE.PlaneGeometry(p.w * 1.9, p.h * 1.35), winOut);
              wm.rotation.y = Math.PI;
              wm.position.set(cx, p.y + p.h / 2 - p.h * 0.1, -WALL - 0.13);
              wm.userData.noShadow = true;
              wg.add(wm);
            } else if (!p.to) {
              // A sill with snow on it.
              const sill = kitBox(p.w + 0.36, 0.06, 0.2, timber);
              sill.position.set(cx, p.y - fw - 0.03, -WALL - 0.1);
              const sn = kitBox(p.w + 0.3, 0.04, 0.16, snowM);
              sn.position.set(cx, p.y - fw + 0.02, -WALL - 0.11);
              wg.add(sill, sn);
            }
          }
        }
        // Corner posts.
        for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
          const post = kitBox(WALL + 0.1, top - foot, WALL + 0.1, timber);
          post.position.set(sx * (w / 2 + WALL / 2), (top + foot) / 2, sz * (d / 2 + WALL / 2));
          g.add(post);
        }
        // The roof, the ceiling under it and the timbers holding it up, built in the roof's frame: ridge along x,
        // slopes falling to either side in z.
        const len = 2 * (il + WALL) + 0.16;
        const oh = ih + WALL;
        const roof = new THREE.Group();
        roof.position.y = y0;
        if (!along) roof.rotation.y = Math.PI / 2;
        g.add(roof);
        const roofIn = new THREE.Group();
        roof.add(roofIn);
        insides.push({ group: roofIn, rect: kitRooms[kitRooms.length - 1], building: b.id });
        // Each slope runs down to its eave; an eave backing onto another room of the building stops at the wall.
        const nbr = (s2: number) => {
          const ln = along ? [0, s2] : [s2, 0];
          const wn = [ln[0] * Math.cos((kr.rot * Math.PI) / 180) + ln[1] * Math.sin((kr.rot * Math.PI) / 180), -ln[0] * Math.sin((kr.rot * Math.PI) / 180) + ln[1] * Math.cos((kr.rot * Math.PI) / 180)];
          const px = kr.pos[0] + wn[0] * (ih + WALL + 0.35), pz = kr.pos[1] + wn[1] * (ih + WALL + 0.35);
          return b.rooms.some((o) => {
            if (o === kr) return false;
            const oz = world.zones.find((q) => q.id === o.zone);
            if (!oz) return false;
            const hw = (o.rot % 180 === 0 ? oz.size[0] : oz.size[1]) / 2 + WALL, hd = (o.rot % 180 === 0 ? oz.size[1] : oz.size[0]) / 2 + WALL;
            return Math.abs(px - o.pos[0]) < hw && Math.abs(pz - o.pos[1]) < hd;
          });
        };
        for (const s2 of [-1, 1]) {
          const reach = nbr(s2) ? oh + 0.02 : sh;
          const lenS = reach / Math.cos(pitch) + 0.1;
          const zc2 = reach / 2, yc2 = rise * (1 - zc2 / sh);
          const sl = kitBox(len, 0.16, lenS, shingleM, roofTile);
          sl.position.set(0, yc2, s2 * zc2);
          sl.rotation.x = s2 * pitch;
          roof.add(sl);
          const sn = kitBox(len - 0.12, 0.12, lenS - 0.25, snowM);
          sn.position.set(0, yc2 + Math.cos(pitch) * 0.13, s2 * zc2 + s2 * Math.sin(pitch) * 0.13);
          sn.rotation.x = s2 * pitch;
          roof.add(sn);
        }
        const tilePlane = (shape: THREE.Shape, mat: THREE.Material, tile: number) => {
          const geo = new THREE.ShapeGeometry(shape);
          const uv = geo.attributes.uv as THREE.BufferAttribute, pa = geo.attributes.position as THREE.BufferAttribute;
          for (let i = 0; i < uv.count; i++) uv.setXY(i, pa.getX(i) / tile, pa.getY(i) / tile);
          return new THREE.Mesh(geo, mat);
        };
        const V = (a: number, b2: number) => new THREE.Vector2(a, b2);
        // Outside: plaster up under the eaves, and the gable ends.
        const hO = rise * (1 - oh / sh) - 0.08;
        for (const s2 of [-1, 1]) {
          const band = kitBox(2 * (il + WALL), hO, 0.04, plasterM, 2);
          band.position.set(0, hO / 2, s2 * (oh - 0.02));
          roof.add(band);
          const gable = tilePlane(new THREE.Shape([V(-oh, 0), V(oh, 0), V(oh, hO), V(0, rise - 0.08), V(-oh, hO)]), plasterM, 2);
          gable.rotation.y = Math.PI / 2;
          gable.position.set(s2 * (il + WALL - 0.02), 0, 0);
          roof.add(gable);
        }
        // Inside: the ceiling follows the roof up to the ridge; short walls rise to meet it.
        const ct = rz.ceiling ? tiled(rz.ceiling.tex) : null;
        const ceilM = ct ? new THREE.MeshLambertMaterial({ map: ct, side: THREE.DoubleSide }) : new THREE.MeshLambertMaterial({ color: 0x9a6a40, side: THREE.DoubleSide });
        const wt = tiled(rz.walls.front.tex);
        const kneeM = wt ? new THREE.MeshLambertMaterial({ map: wt, side: THREE.DoubleSide }) : plain(0xb8a890);
        const hk = rise * (1 - ih / sh) - 0.14;
        const peak = rise - 0.14;
        const cl = Math.hypot(ih, peak - hk);
        const cp = Math.atan2(peak - hk, ih);
        for (const s2 of [-1, 1]) {
          const c = kitBox(2 * il, 0.02, cl, ceilM, rz.ceiling?.tile ?? 1.2);
          c.position.set(0, (hk + peak) / 2, (s2 * ih) / 2);
          c.rotation.x = s2 * cp;
          roofIn.add(c);
          const knee = kitBox(2 * il, hk + 0.06, 0.02, kneeM, Math.max(0.3, H));
          knee.position.set(0, (hk - 0.06) / 2, s2 * (ih - 0.012));
          roofIn.add(knee);
          const end = tilePlane(new THREE.Shape([V(-ih, -0.06), V(ih, -0.06), V(ih, hk), V(0, peak), V(-ih, hk)]), kneeM, Math.max(0.3, H));
          end.rotation.y = Math.PI / 2;
          end.position.set(s2 * (il - 0.012), 0, 0);
          roofIn.add(end);
        }
        // Timbers: a ridge beam, and trusses across the room (tie beam, king post, rafters and curved braces).
        const ridge = kitBox(2 * il, 0.16, 0.16, beamM);
        ridge.position.set(0, peak - 0.1, 0);
        roofIn.add(ridge);
        festoon(roofIn, [new THREE.Vector3(-il + 0.1, peak - 0.2, 0.09), new THREE.Vector3(il - 0.1, peak - 0.2, 0.09)], 0.22);
        const n = Math.max(1, Math.round((2 * il) / 1.8));
        for (let i = 0; i < n; i++) {
          const x = -il + ((i + 0.5) * 2 * il) / n;
          const tie = kitBox(0.14, 0.18, 2 * ih, beamM);
          tie.position.set(x, 0.05, 0);
          roofIn.add(tie);
          const king = kitBox(0.13, peak - 0.15, 0.13, beamM);
          king.position.set(x, (peak + 0.05) / 2, 0);
          roofIn.add(king);
          // Garland swagged along the tie beam, with lights.
          festoon(roofIn, [new THREE.Vector3(x + 0.09, -0.02, -ih + 0.1), new THREE.Vector3(x + 0.09, -0.02, ih - 0.1)], 0.16);
          for (const s2 of [-1, 1]) {
            const raf = kitBox(0.12, 0.14, cl, beamM);
            raf.position.set(x, (hk + peak) / 2 - 0.09, (s2 * ih) / 2);
            raf.rotation.x = s2 * cp;
            roofIn.add(raf);
            // A post down the wall, and an arched brace sweeping up from it to the king post.
            // A short post at the top of the wall (clear of anything hung lower), and an arched brace from it.
            const post = kitBox(0.13, 0.42, 0.13, beamM);
            post.position.set(x, -0.16, s2 * (ih - 0.07));
            roofIn.add(post);
            const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(x, -0.37, s2 * (ih - 0.07)), new THREE.Vector3(x, 0.15, s2 * ih * 0.25), new THREE.Vector3(x, peak * 0.6, s2 * 0.06));
            const brace = new THREE.Mesh(new THREE.TubeGeometry(curve, 16, 0.055, 6), beamM);
            roofIn.add(brace);
          }
        }
      }
      // Doors.
      let signed = false;
      for (const dr of b.doors) {
        const t = tex(dr.tex);
        const face = t ? new THREE.MeshLambertMaterial({ map: t, alphaTest: 0.5 }) : new THREE.MeshLambertMaterial({ color: 0x7a4a2a });
        const edge = new THREE.MeshLambertMaterial({ color: 0x5a3820 });
        // A front door shows its painted outside face to the street (the slab's +z or -z side, whichever faces out).
        const base0 = Math.atan2(-dr.across[1], dr.across[0]);
        const zOut = Math.sin(base0) * -dr.into[0] + Math.cos(base0) * -dr.into[1] > 0;
        const outF = dr.outer && doorOut ? doorOut : face;
        const slab = new THREE.Mesh(new THREE.BoxGeometry(dr.w - 0.04, dr.h - 0.03, 0.06), [edge, edge, edge, edge, zOut ? outF : face, zOut ? face : outF]);
        slab.position.set((dr.w - 0.04) / 2 + 0.02, (dr.h - 0.03) / 2, 0);
        const pivot = new THREE.Group();
        pivot.position.set(dr.at[0] - (dr.across[0] * dr.w) / 2, dr.y, dr.at[1] - (dr.across[1] * dr.w) / 2);
        const base = Math.atan2(-dr.across[1], dr.across[0]);
        pivot.rotation.y = base;
        pivot.add(slab);
        parent.add(pivot);
        slab.userData.door = dr.id;
        // Which way round opens it into the room.
        const swing = Math.cos(base + 1) * dr.into[0] - Math.sin(base + 1) * dr.into[1] > 0 ? 1 : -1;
        kitDoors.push({ d: dr, pivot, slab, base, swing, open: false, k: 0 });
        // A solid threshold across the doorway.
        const sill = kitBox(dr.w, 0.5, dr.depth + 0.02, new THREE.MeshLambertMaterial({ color: 0x6a4a30 }));
        sill.position.set(dr.at[0], dr.y - 0.25, dr.at[1]);
        sill.rotation.y = base;
        parent.add(sill);
        if (dr.outer && L?.sign && !signed) {
          // The hanging sign, on a bracket beside the front door, sticking out from the wall (two faces, so it reads
          // the right way round from either side).
          signed = true;
          const st = tex(L.sign);
          const sm = new THREE.MeshLambertMaterial({ map: st, alphaTest: 0.5 });
          const S = 0.95;
          const out = [-dr.into[0], -dr.into[1]];
          const cx = dr.at[0] + dr.across[0] * (dr.w / 2 + 0.55) + out[0] * (dr.depth / 2 + S / 2);
          const cz = dr.at[1] + dr.across[1] * (dr.w / 2 + 0.55) + out[1] * (dr.depth / 2 + S / 2);
          // Faces along the wall: the picture's left edge (the bracket) at the wall.
          const yaw = Math.atan2(out[0], out[1]) - Math.PI / 2;
          for (const k of [1, -1]) {
            const pl = new THREE.Mesh(new THREE.PlaneGeometry(S, S), sm);
            pl.position.set(cx, dr.y + dr.h + 0.35, cz);
            pl.rotation.y = yaw + (k < 0 ? Math.PI : 0);
            if (k < 0) pl.scale.x = -1;
            pl.userData.noShadow = true;
            parent.add(pl);
          }
        }
        if (dr.outer) {
          // A stone step up to it from outside.
          const step = kitBox(dr.w + 0.5, 0.6, 0.5, stoneM, 1);
          step.position.set(dr.at[0] - dr.into[0] * (dr.depth / 2 + 0.25), dr.y - 0.2 - 0.3, dr.at[1] - dr.into[1] * (dr.depth / 2 + 0.25));
          step.rotation.y = base;
          parent.add(step);
        }
      }
    };

    const plantWoods = (z: Zone, T: NonNullable<Zone["terrain"]>) => {
      const parent = root!;
      const my = token;
      const [W, D] = T.rim!;
      let seed = 4242;
      const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
      const segD = (x: number, y: number, a: number[], b: number[]) => {
        const dx = b[0] - a[0], dy = b[1] - a[1];
        const k = Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / (dx * dx + dy * dy || 1)));
        return Math.hypot(x - a[0] - dx * k, y - a[1] - dy * k);
      };
      const near: number[][] = [], far: number[][] = [];
      for (let i = 0; i < 16000 && near.length + far.length < 4200; i++) {
        const x = (rnd() - 0.5) * (W + 300), y = (rnd() - 0.5) * (D + 300);
        const o = Math.max(Math.abs(x) - W / 2, Math.abs(y) - D / 2);
        if (o < 2.5) continue;
        // Thick at the edge, thinner further out.
        if (rnd() < 1.2 - o / 140) {
          if (T.paths.some((p) => p.pts.slice(1).some((b, k) => segD(x, y, p.pts[k], b) < p.w / 2 + 2.2))) continue;
          (o < 32 ? near : far).push([x, y, o]);
        }
      }
      const put = (list: number[][], geo: THREE.BufferGeometry, mat: THREE.Material | THREE.Material[], base: THREE.Matrix4, tall: [number, number], from: number, count: number) => {
        const fade = (mm: THREE.Material) => edgeFog(mm, T.rim!);
        const im = new THREE.InstancedMesh(geo, Array.isArray(mat) ? mat.map(fade) : fade(mat), count);
        const m = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0);
        for (let i = 0; i < count; i++) {
          const [x, y] = list[from + i];
          const h = tall[0] + rnd() * (tall[1] - tall[0]);
          q.setFromAxisAngle(up, rnd() * Math.PI * 2);
          m.compose(new THREE.Vector3(x, heightAt(T, x, y) - 0.15, y), q, new THREE.Vector3(h * (0.85 + rnd() * 0.3), h, h * (0.85 + rnd() * 0.3)));
          im.setMatrixAt(i, m.multiply(base));
        }
        im.frustumCulled = false;
        parent.add(im);
      };
      // Far woods: simple pines.
      put(far, lowPine(), new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true }), new THREE.Matrix4(), [7, 15], 0, far.length);
      // Near woods: the village's own pine models, as many as the phone can comfortably draw.
      const files = [...new Set(z.models.filter((m) => /pine/.test(m.id) && m.file).map((m) => m.file!))];
      if (!files.length) {
        put(near, lowPine(), new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true }), new THREE.Matrix4(), [6, 12], 0, near.length);
        return;
      }
      Promise.all(files.map((f) => loadGltf(f).catch(() => null))).then((gs) => {
        if (my !== token) return;
        const kinds = gs.filter((g): g is GLTF => !!g).map((g) => {
          g.scene.updateMatrixWorld(true);
          const box = new THREE.Box3().setFromObject(g.scene);
          const k = 1 / Math.max(0.01, box.max.y - box.min.y);
          const norm = new THREE.Matrix4().makeScale(k, k, k).multiply(new THREE.Matrix4().makeTranslation(-(box.min.x + box.max.x) / 2, -box.min.y, -(box.min.z + box.max.z) / 2));
          const meshes: { geo: THREE.BufferGeometry; mat: THREE.Material | THREE.Material[]; base: THREE.Matrix4 }[] = [];
          let tris = 0;
          g.scene.traverse((o) => {
            const mesh = o as THREE.Mesh;
            if (!mesh.isMesh) return;
            tris += (mesh.geometry.index?.count ?? mesh.geometry.attributes.position.count) / 3;
            meshes.push({ geo: mesh.geometry, mat: mesh.material, base: norm.clone().multiply(mesh.matrixWorld) });
          });
          return { meshes, tris };
        });
        if (!kinds.length) {
          put(near, lowPine(), new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true }), new THREE.Matrix4(), [6, 12], 0, near.length);
          return;
        }
        // About a million triangles for the near woods; any trees beyond that are the simple kind.
        const each = Math.floor(near.length / kinds.length);
        let at = 0;
        for (const kd of kinds) {
          const n = Math.min(each, Math.floor(1_000_000 / kinds.length / Math.max(1, kd.tris)));
          for (const ms of kd.meshes) {
            seed = 777 + at;
            put(near, ms.geo, ms.mat, ms.base, [6, 11], at, n);
          }
          at += n;
        }
        if (at < near.length) put(near, lowPine(), new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true }), new THREE.Matrix4(), [6, 12], at, near.length - at);
      });
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
      aurora = null;
      kitDoors = [];
      kitRooms = [];
      insides = [];
      farAt = -1;
      flames = [];
      twinkles = [];
      kitLights = [];
      lightPool = [];
      poolAt = -1;
      casters = 0;
      pointCasters = [];
      outerLights = null;
      roomHere = null;
      const [w, d, H] = z.size;
      setReady(false);
      setProgress(0);
      let want = 0, got = 0;
      const tick = () => {
        if (my === token && root) shadowify(root);
        got++;
        if (my === token) setProgress(want ? got / want : 1);
        if (my === token && got >= want) setReady(true);
      };

      // Light and sky.
      if (z.outdoor) {
        scene.background = new THREE.Color(0x0b1430);
        scene.fog = new THREE.FogExp2(HAZE, z.terrain?.rim ? 0.0115 : 0.012);
        if (z.terrain?.rim) {
          const dome = skyDome();
          dome.userData.noShadow = true;
          root.add(dome);
          aurora = makeAurora();
          root.add(aurora.group);
        }
        root.add(stars);
        const hemi = new THREE.HemisphereLight(0x9fb4e8, 0x2a2e48, 1.5);
        root.add(hemi);
        const moon = new THREE.DirectionalLight(0xc8d6ff, 0.9);
        moon.position.set(-30, 60, 20);
        root.add(moon, moon.target);
        // Moon shadows round wherever you are.
        moon.castShadow = true;
        moon.shadow.mapSize.set(lowPower ? 1024 : 2048, lowPower ? 1024 : 2048);
        const sc = moon.shadow.camera as THREE.OrthographicCamera;
        sc.left = sc.bottom = -28;
        sc.right = sc.top = 28;
        sc.near = 1;
        sc.far = 160;
        moon.shadow.bias = -0.0008;
        moon.shadow.normalBias = 0.04;
        // Warm light that comes up when you step inside a building.
        const warm = new THREE.AmbientLight(0xffe2c0, 0);
        root.add(warm);
        outerLights = { hemi, moon, warm };
        // Falling snow around you.
        const n = 2200, sp2: number[] = [];
        for (let i = 0; i < n; i++) sp2.push((Math.random() - 0.5) * 56, Math.random() * 16, (Math.random() - 0.5) * 56);
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
      const beyond = T?.rim ? 200 : 60;
      const floorW = z.outdoor ? w + beyond : w, floorD = z.outdoor ? d + beyond : d;
      if (T) {
        // Rolling snowy ground: a vertex every metre and a half where you walk, coarser further out, running on
        // into the hills far enough that its end is lost in the haze.
        const axis = (half: number, reach: number) => {
          const out: number[] = [];
          for (let v = -half - reach; v <= half + reach + 0.01; ) {
            out.push(v);
            const o = Math.abs(v) - half;
            v += o < 35 ? 1.5 : o < 120 ? 4 : 10;
          }
          return out;
        };
        const reach = T.rim ? 320 : 30;
        const xs = axis(w / 2, reach), zs = axis(d / 2, reach);
        const gp: number[] = [], guv: number[] = [], gi: number[] = [];
        for (const zz of zs)
          for (const x of xs) {
            gp.push(x, heightAt(T, x, zz), zz);
            guv.push(x / z.floor.tile, -zz / z.floor.tile);
          }
        for (let j = 0; j < zs.length - 1; j++)
          for (let i = 0; i < xs.length - 1; i++) {
            const a = j * xs.length + i, b = a + 1, c = a + xs.length, e = c + 1;
            gi.push(a, c, b, b, c, e);
          }
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.Float32BufferAttribute(gp, 3));
        g.setAttribute("uv", new THREE.Float32BufferAttribute(guv, 2));
        g.setIndex(gi);
        g.computeVertexNormals();
        const groundMat = ft ? new THREE.MeshLambertMaterial({ map: ft }) : plain(0xe8eef8);
        const groundMesh = new THREE.Mesh(g, T.rim ? edgeFog(groundMat, T.rim) : groundMat);
        groundMesh.userData.noCast = true;
        root.add(groundMesh);
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
            // Several points across, so the cobbles follow a hump in the ground rather than cutting under it.
            const ACROSS = 6;
            for (let k = 0; k <= ACROSS; k++) {
              const side = (k / ACROSS) * 2 - 1;
              const x = q[0] - dz * side * (path.w / 2), zz = q[1] + dx * side * (path.w / 2);
              pos2.push(x, heightAt(T, x, zz) + 0.07, zz);
              uvs.push(((side + 1) / 2) * (path.w / COBBLE_M), along / COBBLE_M);
            }
            if (i > 0) {
              const o = i * (ACROSS + 1), p0 = o - (ACROSS + 1);
              for (let k = 0; k < ACROSS; k++) idx.push(p0 + k, p0 + k + 1, o + k, p0 + k + 1, o + k + 1, o + k);
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
              ca.setXYZ(i, x, heightAt(T, x, zz) + 0.068, zz);
              cu.setXY(i, x / COBBLE_M, zz / COBBLE_M);
            }
            cg.computeVertexNormals();
            const cm = new THREE.Mesh(cg, pmat);
            root.add(cm);
          }
        }
        if (T.rim) plantWoods(z, T);
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
        // Open land has woods and hills past its edge instead of a painted backdrop.
        if (z.terrain?.rim) continue;
        if (z.outdoor) buildBackdrop(z, side, z.walls[side].backdrop, root);
        else buildWall(z, side, z.walls[side], root);
      }
      for (const b of z.buildings ?? []) drawBuilding(b, root);

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
        if (M.kit) continue;
        const [fw, fd] = floorSize(M);
        const ground = heightAt(z.terrain, M.pos[0], M.pos[1]);
        const onGround = M.elev - ground < 0.05;
        const sh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), contact);
        sh.rotation.x = -Math.PI / 2;
        sh.scale.set(fw * 1.2, fd * 1.2, 1);
        sh.position.set(M.pos[0], M.elev + 0.006, M.pos[1]);
        if (onGround && !M.scatter) root.add(sh);
        placed.set(M, { shadow: sh });
        if (M.light && !M.scatter && (lamps < 10 || M.room)) {
          if (!M.room) lamps++;
          const fire = /stove|fire|hearth|furnace|forge|oven|kiln/.test(M.id);
          const inside = !z.outdoor || !!M.room;
          const pl = new THREE.PointLight(fire ? 0xff8236 : 0xffc77a, fire && inside ? 9 : inside ? 4 : 10, fire && inside ? 11 : inside ? 8 : 14, fire ? 1.5 : 1.6);
          // A fire's light comes out into the room (from just in front of it), and throws shadows.
          let lx = M.pos[0], lz = M.pos[1];
          if (fire && inside) {
            const kr = M.room ? kitRooms.find((r) => M.pos[0] > r.x0 && M.pos[0] < r.x1 && M.pos[1] > r.z0 && M.pos[1] < r.z1) : null;
            const c = kr ? [(kr.x0 + kr.x1) / 2, (kr.z0 + kr.z1) / 2] : [0, 0];
            const dx = c[0] - lx, dz = c[1] - lz, dl = Math.hypot(dx, dz) || 1;
            const out = Math.max(M.size[0], M.size[1]) / 2 + 0.35;
            lx += (dx / dl) * Math.min(out, dl * 0.5);
            lz += (dz / dl) * Math.min(out, dl * 0.5);
          }
          pl.position.set(lx, M.elev + M.size[2] * (fire ? 0.3 : 0.9), lz);
          if (M.room) {
            // In a building: one of its pooled lights.
            kitLights.push({ at: pl.position.clone(), color: pl.color.getHex(), intensity: pl.intensity, distance: pl.distance, decay: pl.decay, flicker: fire ? 0.3 : 0, phase: Math.random() * 10 });
            pl.dispose();
          } else {
            root.add(pl);
            if (fire) flames.push({ light: pl, base: pl.intensity, phase: Math.random() * 10, amount: 0.3 });
            if (fire && inside) castFrom(pl);
          }
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
            // Measure with the bones in place (a skeleton under a turned root reads wrong otherwise).
            obj.updateMatrixWorld(true);
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
            const npc = makeNpc(P, grp, rig, tNow, g.animations ?? [], obj);
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
      if (kitLights.length) {
        for (let i = 0; i < Math.min(kitLights.length, lowPower ? 5 : 8); i++) {
          const light = new THREE.PointLight(0xffc98a, 0, 10, 1.6);
          root.add(light);
          // The nearest two or three throw shadows (the room you're in, mostly).
          if (i < (lowPower ? 1 : 3)) castFrom(light);
          lightPool.push({ light, def: null });
        }
      }
      shadowify(root);
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
    /** Into a place: a room inside a building is entered where it stands in the open land. */
    const enter = (z: Zone, from?: string) => {
      const host = z.host ? world.zones.find((q) => q.id === z.host!.zone) : null;
      if (host && z.host) {
        build(host, undefined, { x: z.host.at[0], z: z.host.at[1], yaw: z.host.yaw, pitch: 0 });
        setZoneId(host.id);
      } else {
        build(z, from);
        setZoneId(z.id);
      }
    };
    goRef.current = (to: string, from?: string) => {
      const z = world.zones.find((q) => q.id === to);
      if (!z) return;
      setFade(true);
      setTimeout(() => {
        enter(z, from);
        setTimeout(() => setFade(false), 120);
      }, 220);
    };
    enter(zone);
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
        // Rooms inside buildings keep their own arrangements.
        let err = "error" in res ? res.error : "";
        for (const b of z.buildings ?? [])
          for (const kr of b.rooms) {
            const rz = world.zones.find((q) => q.id === kr.zone);
            if (!rz) continue;
            const r2 = await saveRoomLayout(rz.room, JSON.parse(JSON.stringify(roomLayoutOf(z, rz, kr)))).catch(() => ({ error: "The connection dropped." }));
            if ("error" in r2) err = r2.error;
          }
        setSaving(err || "Saved");
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
        if (z.buildings?.length) {
          setSaving("Room sizes inside buildings can't be changed here yet.");
          return;
        }
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
      // Something you're standing above (on a stair or landing over it) doesn't get in the way.
      if (blockers.some((b) => (b.top == null || b.top > standY + 0.3) && x > b.x0 - RADIUS && x < b.x1 + RADIUS && zz > b.z0 - RADIUS && zz < b.z1 + RADIUS)) return false;
      // A door that isn't open (or is still swinging) fills its doorway.
      for (const kd of kitDoors) {
        if (kd.k > 0.8) continue;
        const { at, across, w: dw } = kd.d;
        const ax = at[0] - (across[0] * dw) / 2, az = at[1] - (across[1] * dw) / 2;
        const t = Math.max(0, Math.min(dw, (x - ax) * across[0] + (zz - az) * across[1]));
        if (Math.hypot(x - ax - across[0] * t, zz - az - across[1] * t) < RADIUS + 0.04) return false;
      }
      // People: you can't walk through them, but you can always step away.
      return !people.some((p) => {
        if (!p.grp.visible) return false;
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
      // On stairs the step sets your height; elsewhere the frame loop does (it knows building floors).
      if (z.stairs) standY = g;
      pos.x = x;
      pos.z = zz;
      return true;
    };
    const move = (dx: number, dz: number) => {
      // Inside something (a model loaded bigger than planned): step out to the nearest open ground first.
      if (!free(pos.x, pos.z)) snapOut();
      if (!tryTo(pos.x + dx, pos.z + dz)) if (!tryTo(pos.x + dx, pos.z)) tryTo(pos.x, pos.z + dz);
    };

    // The story's spots: a soft glow over everything you can look at closely, and which one you're facing.
    const markers = new Map<string, { sprite: THREE.Sprite; pos: THREE.Vector3; phase: number; zone: string }>();
    let glowTex: THREE.Texture | null = null;
    const glow = () => {
      if (glowTex) return glowTex;
      const c = document.createElement("canvas");
      c.width = c.height = 64;
      const g = c.getContext("2d")!;
      const r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      r.addColorStop(0, "rgba(255,240,200,1)");
      r.addColorStop(0.25, "rgba(255,210,120,0.8)");
      r.addColorStop(1, "rgba(255,190,80,0)");
      g.fillStyle = r;
      g.fillRect(0, 0, 64, 64);
      return (glowTex = new THREE.CanvasTexture(c));
    };
    /** Where a spot's anchor is in the world: on top of its model, or in front of its wall piece. */
    const anchorAt = (z: Zone, sp: { zone: string; anchor: string; lift?: number }) => {
      for (const M of z.models) {
        if (M.id !== sp.anchor || (M.room ?? z.id) !== sp.zone) continue;
        const b = placed.get(M)?.box;
        if (b && !b.isEmpty()) {
          const c = b.getCenter(new THREE.Vector3());
          return new THREE.Vector3(c.x, Math.min(b.max.y + 0.15, b.min.y + 1.6) + (sp.lift ?? 0), c.z);
        }
        return new THREE.Vector3(M.pos[0], M.elev + Math.min(M.size[2], 1.4) + 0.15 + (sp.lift ?? 0), M.pos[1]);
      }
      const label = sp.anchor.replace(/^[a-z0-9]+_/, "").replace(/_(model|piece|outside|fixture)_/, " ").replace(/_/g, " ");
      const rz = sp.zone === z.id ? z : world.zones.find((q) => q.id === sp.zone);
      const kr = sp.zone === z.id ? null : z.buildings?.flatMap((b) => b.rooms).find((r) => r.zone === sp.zone);
      if (!rz || (sp.zone !== z.id && !kr)) return null;
      for (const side of ["front", "back", "left", "right"] as Side[]) {
        const p = rz.walls[side].pieces.find((q) => q.label === label);
        if (!p) continue;
        const f = wallFrame(rz, side);
        const lx = p.x + p.w / 2 - f.width / 2;
        const x = f.pos[0] + lx * Math.cos(f.rot) + 0.25 * Math.sin(f.rot), zz = f.pos[1] - lx * Math.sin(f.rot) + 0.25 * Math.cos(f.rot);
        const y = p.y + p.h / 2 + (sp.lift ?? 0);
        if (!kr) return new THREE.Vector3(x, y, zz);
        const w = roomToWorld(kr, [x, zz]);
        return new THREE.Vector3(w[0], kr.y + y, w[1]);
      }
      return null;
    };
    let spotsKey = "";
    const refreshSpots = (z: Zone) => {
      if (!run || !root) return;
      const zones = [z.id, ...(z.buildings ?? []).flatMap((b) => b.rooms.map((r) => r.zone))];
      const list = run.spotsIn(zones);
      const key = z.id + "|" + list.map((x) => x.id).join(",");
      if (key === spotsKey && [...markers.values()].every((m) => m.sprite.parent === root)) return;
      spotsKey = key;
      for (const m of markers.values()) m.sprite.removeFromParent();
      markers.clear();
      for (const sp of list) {
        const p = anchorAt(z, sp);
        if (!p) continue;
        const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow(), color: 0xffd890, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
        sprite.scale.setScalar(0.32);
        sprite.position.copy(p);
        sprite.userData.spot = sp.id;
        sprite.userData.noShadow = true;
        root.add(sprite);
        markers.set(sp.id, { sprite, pos: p, phase: Math.random() * 6, zone: sp.zone });
      }
    };
    /** The spot you're closest to and facing, within reach. */
    const nearSpot = () => {
      if (!run) return;
      const fx = -Math.sin(look.yaw), fz = -Math.cos(look.yaw);
      let best: string | null = null, bd = 2.3;
      for (const [id, m] of markers) {
        if (!m.sprite.visible) continue;
        const dx = m.pos.x - pos.x, dz = m.pos.z - pos.z, dy = m.pos.y - pos.y;
        const d = Math.hypot(dx, dz);
        if (Math.abs(dy) > 2.2 || d > bd) continue;
        if (d > 0.9 && (dx * fx + dz * fz) / d < 0.45) continue;
        bd = d;
        best = id;
      }
      if (best !== run.ui.near) run.setUi({ near: best });
      // Or someone in front of you to talk to.
      let who: { id: string; name: string } | null = null, pd = 1.9;
      for (const p of people) {
        if (!p.grp.visible || p.held) continue;
        const dx = p.npc.x - pos.x, dz = p.npc.z - pos.z, d = Math.hypot(dx, dz);
        if (d > pd || (d > 0.8 && (dx * fx + dz * fz) / d < 0.5)) continue;
        pd = d;
        who = { id: p.P.id, name: p.P.name };
      }
      if (who?.id !== run.ui.person?.id) run.setUi({ person: who });
    };
    const spotTapped = (cx: number, cy: number) => {
      if (!markers.size) return null;
      const r = canvas.getBoundingClientRect();
      const locked = document.pointerLockElement === canvas;
      ray.setFromCamera(new THREE.Vector2(locked ? 0 : ((cx - r.left) / r.width) * 2 - 1, locked ? 0 : -((cy - r.top) / r.height) * 2 + 1), camera);
      const hit = ray.intersectObjects([...markers.values()].map((m) => m.sprite), false)[0];
      if (!hit || hit.distance > 4) return null;
      return (hit.object.userData.spot as string) ?? null;
    };

    const keys = new Set<string>();
    /** The door you're facing, close by. */
    const doorAhead = () => {
      const fx = -Math.sin(look.yaw), fz = -Math.cos(look.yaw);
      let best: (typeof kitDoors)[number] | null = null, bd = 2.4;
      for (const kd of kitDoors) {
        const dx = kd.d.at[0] - pos.x, dz = kd.d.at[1] - pos.z;
        const dist = Math.hypot(dx, dz);
        if (dist < bd && (dx * fx + dz * fz) / (dist || 1) > 0.35) {
          bd = dist;
          best = kd;
        }
      }
      return best;
    };
    /** The door under a tap or click (or the middle of the screen when the mouse is captured). */
    const doorTapped = (cx: number, cy: number) => {
      if (!kitDoors.length) return null;
      const r = canvas.getBoundingClientRect();
      const locked = document.pointerLockElement === canvas;
      ray.setFromCamera(new THREE.Vector2(locked ? 0 : ((cx - r.left) / r.width) * 2 - 1, locked ? 0 : -((cy - r.top) / r.height) * 2 + 1), camera);
      const hit = ray.intersectObjects(kitDoors.map((kd) => kd.slab), false)[0];
      if (!hit || hit.distance > 3.5) return null;
      return kitDoors.find((kd) => kd.slab === hit.object) ?? null;
    };
    const onKey = (down: boolean) => (e: KeyboardEvent) => {
      const tg = e.target as HTMLElement | null;
      if (tg && (tg.tagName === "INPUT" || tg.tagName === "SELECT" || tg.tagName === "TEXTAREA")) return;
      const k = e.key.toLowerCase();
      if (k === "e") {
        if (down && !e.repeat) {
          if (run?.ui.open || run?.ui.panel || run?.ui.talk) return;
          if (run?.ui.near) return run.setUi({ open: run.ui.near });
          if (run?.ui.person) return run.setUi({ talk: run.ui.person });
          const kd = doorAhead();
          if (kd) kd.open = !kd.open;
        }
        return;
      }
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
      const sp = spotTapped(e.clientX, e.clientY);
      if (sp && run) return run.setUi({ open: sp });
      const kd = doorTapped(e.clientX, e.clientY);
      if (kd) {
        kd.open = !kd.open;
        return;
      }
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
      composer.setSize(mount.clientWidth, mount.clientHeight);
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    const clock = new THREE.Clock();
    let last = 0;
    let nearShown: string | null = null;
    let hintShown: string | null = null;
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
      if (run && !editRef.current) {
        const inside = kitRooms.find((r) => pos.x > r.x0 && pos.x < r.x1 && pos.z > r.z0 && pos.z < r.z1)?.zone ?? z.id;
        for (const ev of run.tick(dt, inside)) if (ev.kind === "go") goRef.current(ev.zone);
        if (frame % 6 === 0) nearSpot();
        for (const mk of markers.values()) mk.sprite.material.opacity = 0.55 + 0.35 * Math.sin(t * 2.4 + mk.phase);
      }
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
      if (!z.stairs) {
        // Inside a building (or in one of its doorways) you stand on its floor; the step up is eased.
        let floorY: number | null = kitRooms.find((r) => pos.x > r.x0 - 0.05 && pos.x < r.x1 + 0.05 && pos.z > r.z0 - 0.05 && pos.z < r.z1 + 0.05)?.y ?? null;
        if (floorY == null)
          for (const kd of kitDoors) {
            const dx = pos.x - kd.d.at[0], dz = pos.z - kd.d.at[1];
            const along = dx * kd.d.across[0] + dz * kd.d.across[1], out = dx * kd.d.into[0] + dz * kd.d.into[1];
            if (Math.abs(along) < kd.d.w / 2 + 0.1 && out > -kd.d.depth / 2 - (kd.d.outer ? 0.55 : 0.05) && out < kd.d.depth / 2 + 0.05) floorY = kd.d.outer && out < -kd.d.depth / 2 ? kd.d.y - 0.2 : kd.d.y;
          }
        const want = floorY ?? heightAt(z.terrain, pos.x, pos.z);
        standY = Math.abs(want - standY) > 1 ? want : standY + (want - standY) * Math.min(1, dt * 12);
      }
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
      // Render distance: building insides (and what's in them) only near you or when you're in that building; on
      // phones, far-off things outdoors too. Checked a few times a second.
      if (t - farAt > 0.3 || farAt < 0) {
        farAt = t;
        const here = kitRooms.find((r) => pos.x > r.x0 && pos.x < r.x1 && pos.z > r.z0 && pos.z < r.z1)?.building ?? null;
        const gap = (r: { x0: number; x1: number; z0: number; z1: number }) => Math.hypot(Math.max(r.x0 - pos.x, 0, pos.x - r.x1), Math.max(r.z0 - pos.z, 0, pos.z - r.z1));
        const near = (room?: string) => {
          const r = kitRooms.find((q) => q.zone === room);
          return !r || r.building === here || gap(r) < INSIDE_M;
        };
        for (const ins of insides) ins.group.visible = ins.building === here || gap(ins.rect) < INSIDE_M;
        for (const [M, pl] of placed) {
          const g = (pl as { grp?: THREE.Object3D }).grp;
          if (!g) continue;
          g.visible = (M.room ? near(M.room) : OUTDOOR_M === Infinity || M.light || Math.hypot(M.pos[0] - pos.x, M.pos[1] - pos.z) < OUTDOOR_M) && (!run || run.modelShown(M.id, M.room ?? z.id));
        }
        for (const p of people) p.grp.visible = (p.P.room ? near(p.P.room) : OUTDOOR_M === Infinity || Math.hypot(p.npc.x - pos.x, p.npc.z - pos.z) < OUTDOOR_M) && (!run || run.personShown(p.P.id));
        if (run) {
          refreshSpots(z);
          // A building's glows only near it or inside it, like its rooms.
          for (const mk of markers.values()) mk.sprite.visible = mk.zone === z.id || near(mk.zone);
        }
      }
      for (const p of people) {
        if (!p.grp.visible) continue;
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
          // With real clips the mixer has just set the head; otherwise start from rest.
          if (!p.npc.anim || p.held) p.head.quaternion.copy(p.headRest);
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
      aurora?.update(t, pos);
      for (const tw of twinkles) {
        const k = Math.floor(t * 3 + tw.phase) % tw.mesh.count;
        if (k === tw.last) continue;
        tw.last = k;
        const c = new THREE.Color();
        tw.mesh.getColorAt(k, c);
        tw.mesh.setColorAt(k, c.multiplyScalar(c.r + c.g + c.b > 4 ? 0.35 : 1 / 0.35));
        if (tw.mesh.instanceColor) tw.mesh.instanceColor.needsUpdate = true;
      }
      if (outerLights) {
        const m = outerLights.moon;
        m.position.set(pos.x - 30, pos.y + 60, pos.z + 20);
        m.target.position.set(pos.x, pos.y, pos.z);
        m.shadow.autoUpdate = indoors < 0.85;
        for (const pl of pointCasters) pl.shadow.autoUpdate = indoors > 0.15;
      }
      if (lightPool.length) {
        if (t - poolAt > 0.25 || poolAt < 0) {
          poolAt = t;
          const near = [...kitLights].sort((a, b2) => a.at.distanceToSquared(pos) - b2.at.distanceToSquared(pos));
          lightPool.forEach((sl, i) => {
            const d = near[i] ?? null;
            sl.def = d;
            if (!d) return;
            sl.light.position.copy(d.at);
            sl.light.color.setHex(d.color);
            sl.light.distance = d.distance;
            sl.light.decay = d.decay;
          });
        }
        for (const sl of lightPool) {
          const d = sl.def;
          if (!d) {
            sl.light.intensity = 0;
            continue;
          }
          const q = t * 9 + d.phase;
          sl.light.intensity = d.intensity * (1 - d.flicker * (0.5 + 0.25 * Math.sin(q) + 0.15 * Math.sin(q * 2.7 + 1.3) + 0.1 * Math.sin(q * 6.1)));
        }
      }
      for (const f of flames) {
        const q = t * 9 + f.phase;
        f.light.intensity = f.base * (1 - f.amount * (0.5 + 0.25 * Math.sin(q) + 0.15 * Math.sin(q * 2.7 + 1.3) + 0.1 * Math.sin(q * 6.1)));
      }
      // Doors swing.
      for (const kd of kitDoors) {
        const want = kd.open ? 1 : 0;
        if (kd.k !== want) {
          kd.k = want > kd.k ? Math.min(1, kd.k + dt * 1.6) : Math.max(0, kd.k - dt * 1.6);
          const e = kd.k * kd.k * (3 - 2 * kd.k);
          kd.pivot.rotation.y = kd.base + kd.swing * e * 1.75;
        }
      }
      // Inside a building: lamplight instead of moonlight, no snow or haze.
      if (outerLights) {
        const inRoom = kitRooms.find((r) => pos.x > r.x0 && pos.x < r.x1 && pos.z > r.z0 && pos.z < r.z1) ?? null;
        indoors += ((inRoom ? 1 : 0) - indoors) * Math.min(1, dt * 3);
        outerLights.hemi.intensity = 1.5 * (1 - indoors * 0.8);
        outerLights.moon.intensity = 0.9 * (1 - indoors * 0.85);
        outerLights.warm.intensity = 0.28 * indoors;
        if (scene.fog instanceof THREE.FogExp2) scene.fog.density = 0.0115 * (1 - indoors * 0.85);
        if (snow) snow.visible = indoors < 0.5;
        const name = inRoom?.name ?? null;
        if (name !== roomHere) {
          roomHere = name;
          setPlaceName(name);
        }
      }
      if (kitDoors.length && frame % 6 === 0) {
        const kd = doorAhead();
        const h = kd ? `${kd.open ? "Close" : "Open"} the door: tap it or press E` : null;
        if (h !== hintShown) {
          hintShown = h;
          setHint(h);
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
      composer.render();
    };
    loop();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("mousemove", onMouse);
      canvas.removeEventListener("click", onClick);
      composer.dispose();
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
      {run && ready && !edit ? <StoryOverlay run={run} touch={touch} onLook={() => run.setUi({ open: run.ui.near })} onTalk={() => run.setUi({ talk: run.ui.person })} /> : null}
      <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 bg-gradient-to-b from-black/70 to-transparent p-3 text-sm">
        <div>
          <p className="font-semibold">{placeName ?? zone.name}</p>
          <p className="text-xs text-smoke">{title}</p>
          {!ready ? <p className="text-xs text-smoke">Loading {Math.round(progress * 100)}%</p> : null}
          {nearZone ? <p className="mt-1 text-xs text-brass">To {nearZone.name}: keep walking</p> : null}
          {hint ? <p className="mt-1 text-xs text-brass">{hint}</p> : null}
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
