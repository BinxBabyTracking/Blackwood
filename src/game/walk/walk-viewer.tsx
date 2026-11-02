"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { WalkHotspot, WalkHouse, WalkRoomDef, WalkWall } from "./c001-house";

/*
 * A walkable house: every room is loaded up front, so you walk from one into the next with no loading.
 * Computer: click to look around with the mouse, WASD to walk, the arrow keys turn, Shift to hurry.
 * Phone: the stick at the bottom left walks, dragging anywhere else looks. Walls are solid slabs, so arches
 * and windows have real depth. Lighting is live: soft room light, the sun (or the streetlight at night)
 * through the windows with shadows, and each room's ceiling light from its switch.
 */

const RADIUS = 0.28; // how close you can get to walls and furniture
const SPEED = 1.4;
const NEAR = 2.6; // markers show within this distance

type Side = "front" | "back" | "left" | "right";
const SUN = { day: { az: 15, el: 48, color: 0xfff0d8, power: 5 }, night: { az: 22, el: 8, color: 0xffcf8a, power: 0.55 } };
const SKY = { day: { sky: 0xfff4e6, ground: 0x8a6a50, power: 3.3 }, night: { sky: 0x5a6a99, ground: 0x2a2018, power: 0.8 } };

/** Where a wall sits and which way it faces, for a room. */
function wallFrame(r: WalkRoomDef, side: Side) {
  const [cx, cz] = r.center;
  const [w, d] = r.size;
  if (side === "front") return { pos: [cx, cz - d / 2], rot: 0, width: w, normal: [0, 1] };
  if (side === "back") return { pos: [cx, cz + d / 2], rot: Math.PI, width: w, normal: [0, -1] };
  if (side === "left") return { pos: [cx - w / 2, cz], rot: Math.PI / 2, width: d, normal: [1, 0] };
  return { pos: [cx + w / 2, cz], rot: -Math.PI / 2, width: d, normal: [-1, 0] };
}

/** A window screen with an L-shaped cut, the edges bent away from the room. */
function screenTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const g = c.getContext("2d")!;
  g.clearRect(0, 0, 512, 512);
  g.strokeStyle = "rgba(70,74,78,0.55)";
  g.lineWidth = 1;
  for (let i = 0; i < 512; i += 4) {
    g.beginPath();
    g.moveTo(i + 0.5, 0);
    g.lineTo(i + 0.5, 512);
    g.stroke();
    g.beginPath();
    g.moveTo(0, i + 0.5);
    g.lineTo(512, i + 0.5);
    g.stroke();
  }
  // The cut: down from near the top left, then across the bottom.
  g.globalCompositeOperation = "destination-out";
  g.lineWidth = 9;
  g.beginPath();
  g.moveTo(150, 90);
  g.lineTo(150, 360);
  g.lineTo(390, 360);
  g.stroke();
  g.globalCompositeOperation = "source-over";
  g.strokeStyle = "rgba(40,42,45,0.9)";
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(144, 90);
  g.lineTo(144, 366);
  g.lineTo(390, 366);
  g.stroke();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function WalkViewer({ house, title }: { house: WalkHouse; title: string }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const markerRefs = useRef(new Map<string, HTMLButtonElement>());
  const stickRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const api = useRef<{ setNight: (n: boolean) => void; setLight: (id: string, on: boolean) => void; release: () => void } | null>(null);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [night, setNight] = useState(false);
  const [lights, setLights] = useState<Record<string, boolean>>({});
  const [inspect, setInspect] = useState<WalkHotspot | null>(null);
  const [locked, setLocked] = useState(false);
  const [touch, setTouch] = useState(false);
  const [roomName, setRoomName] = useState(house.rooms[0].name);
  const [focus, setFocus] = useState<WalkHotspot | null>(null);
  const pressRef = useRef<(hs: WalkHotspot) => void>(() => {});

  useEffect(() => {
    const mount = mountRef.current!;
    const WALL = house.wall;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    const camera = new THREE.PerspectiveCamera(70, mount.clientWidth / mount.clientHeight, 0.05, 80);
    const look = { yaw: 0, pitch: -0.05 };
    const pos = new THREE.Vector3(0, house.eye, 0.4);
    // For testing: #x,z,yaw[,pitch[,noclip]] (metres, degrees) in the address starts you at that spot facing that way.
    const start = location.hash.slice(1).split(",").map(Number);
    const testing = start.length >= 3 && start.every((n) => Number.isFinite(n));
    if (testing) {
      pos.set(start[0], house.eye, start[1]);
      look.yaw = (start[2] * Math.PI) / 180;
      if (start.length > 3) look.pitch = (start[3] * Math.PI) / 180;
    }

    const manager = new THREE.LoadingManager();
    manager.onProgress = (_u, loaded, total) => setProgress(loaded / total);
    const tex = new THREE.TextureLoader(manager);
    const loadTex = (url: string, repeat = 1) => {
      const t = tex.load(url);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = renderer.capabilities.getMaxAnisotropy();
      if (repeat !== 1) {
        t.wrapS = t.wrapT = THREE.RepeatWrapping;
        t.repeat.set(repeat, repeat);
      }
      return t;
    };
    const cast = (m: THREE.Mesh) => {
      m.castShadow = true;
      m.receiveShadow = true;
      return m;
    };
    const plaster = new THREE.MeshLambertMaterial({ color: 0xd8bf98, side: THREE.DoubleSide });
    const trim = new THREE.MeshLambertMaterial({ color: 0x4a2c1a, side: THREE.DoubleSide });
    const outsides: { mat: THREE.MeshBasicMaterial; day: THREE.Texture; night: THREE.Texture }[] = [];
    const roomLights = new Map<string, { light: THREE.PointLight; glow: THREE.Mesh; power: number }>();

    // The depth of an opening: strips from the wall's face back through its thickness.
    const strip = (parent: THREE.Object3D, a: THREE.Vector2, b: THREE.Vector2, mat: THREE.Material) => {
      const len = a.distanceTo(b);
      if (len < 1e-4) return;
      const m = cast(new THREE.Mesh(new THREE.PlaneGeometry(len, WALL), mat));
      m.position.set((a.x + b.x) / 2, (a.y + b.y) / 2, -WALL / 2);
      m.rotation.set(0, 0, Math.atan2(b.y - a.y, b.x - a.x));
      m.rotateX(Math.PI / 2);
      parent.add(m);
    };

    const buildWall = (r: WalkRoomDef, side: Side, def: WalkWall) => {
      const H = r.size[2];
      const f = wallFrame(r, side);
      const g = new THREE.Group();
      g.position.set(f.pos[0], 0, f.pos[1]);
      g.rotation.y = f.rot;
      const pt = (u: number, v: number) => new THREE.Vector2((u - 0.5) * f.width, (1 - v) * H);
      const face = cast(new THREE.Mesh(new THREE.PlaneGeometry(f.width, H), new THREE.MeshLambertMaterial({ map: loadTex(def.tex), alphaTest: def.cutout ? 0.5 : 0, side: def.cutout ? THREE.DoubleSide : THREE.FrontSide })));
      (face.material as THREE.Material).shadowSide = THREE.DoubleSide;
      face.position.y = H / 2;
      g.add(face);
      if (def.cutout) {
        // The far side of the wall: blocks light except through the holes, never drawn.
        const back = new THREE.Mesh(new THREE.PlaneGeometry(f.width, H), new THREE.MeshLambertMaterial({ map: loadTex(def.tex), alphaTest: 0.5, colorWrite: false, depthWrite: false }));
        back.position.set(0, H / 2, -WALL);
        back.castShadow = true;
        g.add(back);
      }
      for (const rv of def.reveals ?? []) {
        if ("arch" in rv) {
          const a = rv.arch.map(([u, v]) => pt(u, v));
          const line = [new THREE.Vector2(a[0].x, 0), ...a, new THREE.Vector2(a[a.length - 1].x, 0)];
          for (let i = 0; i < line.length - 1; i++) strip(g, line[i], line[i + 1], plaster);
        } else {
          const [u0, u1, v0, v1] = rv.rect;
          const c = [pt(u0, v1), pt(u1, v1), pt(u1, v0), pt(u0, v0)];
          for (let i = 0; i < 4; i++) strip(g, c[i], c[(i + 1) % 4], i === 0 && rv.sill ? trim : plaster);
        }
      }
      if (def.screen) {
        const [u0, u1, v0, v1] = def.screen;
        const a = pt(u0, v1), b = pt(u1, v0);
        const s = new THREE.Mesh(new THREE.PlaneGeometry(b.x - a.x, b.y - a.y), new THREE.MeshLambertMaterial({ map: screenTexture(), transparent: true, side: THREE.DoubleSide, depthWrite: false }));
        s.position.set((a.x + b.x) / 2, (a.y + b.y) / 2, -WALL * 0.8);
        g.add(s);
      }
      if (def.outside) {
        const o = def.outside;
        const mat = new THREE.MeshBasicMaterial({ map: loadTex(o.day) });
        outsides.push({ mat, day: mat.map!, night: o.night === o.day ? mat.map! : loadTex(o.night) });
        const m = new THREE.Mesh(new THREE.PlaneGeometry(o.width, (o.width * 864) / 1536), mat);
        m.position.set((o.u - 0.5) * f.width, o.y, -WALL - o.distance);
        g.add(m);
      }
      scene.add(g);
    };

    for (const r of house.rooms) {
      const [cx, cz] = r.center;
      const [w, d, H] = r.size;
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshLambertMaterial({ map: loadTex(r.floor.tex, r.floor.repeat ?? 1) }));
      floor.rotation.x = -Math.PI / 2;
      floor.position.set(cx, 0, cz);
      floor.receiveShadow = true;
      scene.add(floor);
      const ceil = cast(new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshLambertMaterial({ map: loadTex(r.ceil.tex) })));
      ceil.rotation.x = Math.PI / 2;
      ceil.position.set(cx, H, cz);
      scene.add(ceil);
      for (const side of ["front", "back", "left", "right"] as Side[]) {
        const def = r.walls[side];
        if (def) buildWall(r, side, def);
      }
      const light = new THREE.PointLight(0xffd29a, 0, 0, 2);
      light.position.set(r.light.at[0], r.light.at[1], r.light.at[2]);
      scene.add(light);
      const glow = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffe2b0 }));
      glow.position.copy(light.position);
      glow.visible = false;
      scene.add(glow);
      roomLights.set(r.light.id, { light, glow, power: r.light.power });
    }

    // The floor under each doorway, through the thickness of the wall.
    for (const ps of house.passages) {
      // Only the part of the passage no room's floor covers: the gap between the two wall faces.
      const mz = (ps.z[0] + ps.z[1]) / 2;
      const z0 = Math.max(ps.z[0], ...house.rooms.map((r) => r.center[1] + r.size[1] / 2).filter((z) => z <= mz + WALL));
      const z1 = Math.min(ps.z[1], ...house.rooms.map((r) => r.center[1] - r.size[1] / 2).filter((z) => z >= mz - WALL));
      if (z1 - z0 <= 0.001) continue;
      const th = new THREE.Mesh(new THREE.PlaneGeometry(ps.x[1] - ps.x[0], z1 - z0), trim);
      th.rotation.x = -Math.PI / 2;
      th.position.set((ps.x[0] + ps.x[1]) / 2, 0, (z0 + z1) / 2);
      th.receiveShadow = true;
      scene.add(th);
    }

    // Lights shared by the whole house.
    const hemi = new THREE.HemisphereLight(SKY.day.sky, SKY.day.ground, SKY.day.power);
    scene.add(hemi);
    const sun = new THREE.DirectionalLight(SUN.day.color, SUN.day.power);
    sun.castShadow = true;
    sun.shadow.mapSize.set(4096, 4096);
    Object.assign(sun.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7, near: 0.5, far: 30 });
    sun.shadow.bias = -0.0004;
    sun.shadow.normalBias = 0.02;
    scene.add(sun, sun.target);
    const mid = new THREE.Vector3(0, house.eye, (Math.min(...house.rooms.map((r) => r.center[1] - r.size[1] / 2)) + Math.max(...house.rooms.map((r) => r.center[1] + r.size[1] / 2))) / 2);
    const setSun = (n: boolean) => {
      const s = n ? SUN.night : SUN.day;
      const a = (s.az * Math.PI) / 180, e = (s.el * Math.PI) / 180;
      sun.position.set(mid.x + Math.sin(a) * Math.cos(e) * 12, mid.y + Math.sin(e) * 12, mid.z - Math.cos(a) * Math.cos(e) * 12);
      sun.target.position.copy(mid);
      sun.color.set(s.color);
      sun.intensity = s.power;
      const k = n ? SKY.night : SKY.day;
      hemi.color.set(k.sky);
      hemi.groundColor.set(k.ground);
      hemi.intensity = k.power;
      for (const o of outsides) {
        o.mat.map = n ? o.night : o.day;
        o.mat.color.setScalar(n ? (o.night === o.day ? 0.3 : 0.9) : 1);
        o.mat.needsUpdate = true;
      }
    };
    setSun(false);

    // Furniture.
    const blockers: { x0: number; x1: number; z0: number; z1: number }[] = [];
    const sc = document.createElement("canvas");
    sc.width = sc.height = 128;
    const g2 = sc.getContext("2d")!;
    const gr = g2.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, "rgba(0,0,0,0.55)");
    gr.addColorStop(0.6, "rgba(0,0,0,0.3)");
    gr.addColorStop(1, "rgba(0,0,0,0)");
    g2.fillStyle = gr;
    g2.fillRect(0, 0, 128, 128);
    const contactMat = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, depthWrite: false });
    const gl = new GLTFLoader(manager);
    for (const M of house.models) {
      gl.load(M.file, (g) => {
        const op = M.opacity ?? 1;
        g.scene.traverse((o) => {
          const mesh = o as THREE.Mesh;
          if (!mesh.isMesh) return;
          const old = mesh.material as THREE.MeshStandardMaterial;
          mesh.material = new THREE.MeshLambertMaterial({ map: old.map, side: THREE.DoubleSide, transparent: op < 1, opacity: op, depthWrite: op >= 1 });
          mesh.castShadow = op >= 1;
          mesh.receiveShadow = true;
        });
        const inner = new THREE.Group();
        inner.add(g.scene);
        inner.rotation.set(((M.rotX ?? 0) * Math.PI) / 180, 0, 0);
        inner.updateMatrixWorld(true);
        const box = new THREE.Box3().setFromObject(inner);
        const size = box.getSize(new THREE.Vector3());
        const c = box.getCenter(new THREE.Vector3());
        const off = new THREE.Group();
        off.add(inner);
        off.position.set(-c.x, -box.min.y, -c.z);
        const grp = new THREE.Group();
        grp.add(off);
        grp.scale.setScalar(M.size / (M.fit === "y" ? size.y : size.x));
        grp.rotation.y = ((M.rotY ?? 0) * Math.PI) / 180;
        grp.position.set(M.pos[0], M.pos[1], M.pos[2]);
        scene.add(grp);
        grp.updateMatrixWorld(true);
        const wb = new THREE.Box3().setFromObject(grp);
        // Pieces you would bump into (not things sitting on top of others, or flat on the floor).
        if (M.pos[1] < 0.05 && wb.max.y > 0.25) blockers.push({ x0: wb.min.x, x1: wb.max.x, z0: wb.min.z, z1: wb.max.z });
        if (M.shadow) {
          const pl = new THREE.Mesh(new THREE.PlaneGeometry(M.shadow[0], M.shadow[1]), contactMat);
          pl.rotation.set(-Math.PI / 2, 0, ((M.rotY ?? 0) * Math.PI) / 180);
          pl.position.set(M.pos[0], 0.004, M.pos[2]);
          scene.add(pl);
        }
      });
    }
    manager.onLoad = () => setReady(true);

    // Where you can stand: inside a room or in a passage between rooms, clear of the furniture.
    const areas = [
      ...house.rooms.map((r) => ({ x0: r.center[0] - r.size[0] / 2 + RADIUS, x1: r.center[0] + r.size[0] / 2 - RADIUS, z0: r.center[1] - r.size[1] / 2 + RADIUS, z1: r.center[1] + r.size[1] / 2 - RADIUS })),
      ...house.passages.map((p) => ({ x0: p.x[0] + RADIUS, x1: p.x[1] - RADIUS, z0: p.z[0], z1: p.z[1] })),
    ];
    const free = (x: number, z: number) => {
      if (!areas.some((a) => x >= a.x0 && x <= a.x1 && z >= a.z0 && z <= a.z1)) return false;
      return !blockers.some((b) => x > b.x0 - RADIUS && x < b.x1 + RADIUS && z > b.z0 - RADIUS && z < b.z1 + RADIUS && Math.hypot(x - Math.max(b.x0, Math.min(b.x1, x)), z - Math.max(b.z0, Math.min(b.z1, z))) < RADIUS);
    };
    const noclip = testing && start.length > 4;
    const move = (dx: number, dz: number) => {
      if (noclip || free(pos.x + dx, pos.z + dz)) {
        pos.x += dx;
        pos.z += dz;
      } else if (free(pos.x + dx, pos.z)) pos.x += dx;
      else if (free(pos.x, pos.z + dz)) pos.z += dz;
    };
    const roomAt = (x: number, z: number) => house.rooms.find((r) => Math.abs(x - r.center[0]) <= r.size[0] / 2 && Math.abs(z - r.center[1]) <= r.size[1] / 2);
    let lastRoom = "";

    // Controls.
    const keys = new Set<string>();
    const stick = { x: 0, y: 0, id: -1, cx: 0, cy: 0 };
    let lookId = -1, lastX = 0, lastY = 0;
    const CODES: Record<string, string> = {
      KeyW: "w", KeyA: "a", KeyS: "s", KeyD: "d", ArrowUp: "arrowup", ArrowDown: "arrowdown", ArrowLeft: "arrowleft",
      ArrowRight: "arrowright", ShiftLeft: "shift", ShiftRight: "shift",
    };
    const onKey = (down: boolean) => (e: KeyboardEvent) => {
      const k = CODES[e.code] ?? e.key.toLowerCase();
      if (!["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright", "shift"].includes(k)) return;
      if (down) keys.add(k);
      else keys.delete(k);
      e.preventDefault();
    };
    const kd = onKey(true), ku = onKey(false);
    const clearKeys = () => keys.clear();
    document.addEventListener("keydown", kd, true);
    document.addEventListener("keyup", ku, true);
    window.addEventListener("blur", clearKeys);
    const canvas = renderer.domElement;
    canvas.tabIndex = 0;
    const onMouse = (e: MouseEvent) => {
      if (document.pointerLockElement !== canvas) return;
      look.yaw += e.movementX * 0.0024;
      look.pitch = Math.max(-1.45, Math.min(1.45, look.pitch - e.movementY * 0.0024));
    };
    let focused: WalkHotspot | null = null;
    const use = () => {
      if (focused) pressRef.current(focused);
    };
    const onUseKey = (e: KeyboardEvent) => {
      if ((e.code === "KeyE" || e.code === "Enter") && document.pointerLockElement === canvas && focused) {
        e.preventDefault();
        use();
      }
    };
    document.addEventListener("keydown", onUseKey, true);
    const onClick = () => {
      canvas.focus();
      if (document.pointerLockElement === canvas) {
        use();
        return;
      }
      if (window.matchMedia("(pointer: coarse)").matches) return;
      if (document.pointerLockElement !== canvas) (canvas.requestPointerLock?.() as Promise<void> | undefined)?.catch?.(() => {});
    };
    const onLock = () => setLocked(document.pointerLockElement === canvas);
    document.addEventListener("mousemove", onMouse);
    document.addEventListener("pointerlockchange", onLock);
    canvas.addEventListener("click", onClick);
    const onTouchStart = (e: TouchEvent) => {
      setTouch(true);
      for (const t of Array.from(e.changedTouches)) {
        const r = stickRef.current?.getBoundingClientRect();
        if (r && stick.id < 0 && t.clientX < r.right + 40 && t.clientY > r.top - 40) {
          stick.id = t.identifier;
          stick.cx = r.left + r.width / 2;
          stick.cy = r.top + r.height / 2;
        } else if (lookId < 0) {
          lookId = t.identifier;
          lastX = t.clientX;
          lastY = t.clientY;
        }
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      for (const t of Array.from(e.changedTouches)) {
        if (t.identifier === stick.id) {
          const dx = t.clientX - stick.cx, dy = t.clientY - stick.cy, m = Math.hypot(dx, dy) || 1, r = Math.min(m, 50);
          stick.x = (dx / m) * (r / 50);
          stick.y = (dy / m) * (r / 50);
          if (knobRef.current) knobRef.current.style.transform = `translate(${stick.x * 34}px, ${stick.y * 34}px)`;
        } else if (t.identifier === lookId) {
          look.yaw += (t.clientX - lastX) * 0.005;
          look.pitch = Math.max(-1.45, Math.min(1.45, look.pitch - (t.clientY - lastY) * 0.005));
          lastX = t.clientX;
          lastY = t.clientY;
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
    canvas.addEventListener("touchcancel", onTouchEnd);
    const stickEl = stickRef.current;
    stickEl?.addEventListener("touchstart", onTouchStart as EventListener, { passive: true });
    stickEl?.addEventListener("touchmove", onTouchMove as EventListener, { passive: false });
    stickEl?.addEventListener("touchend", onTouchEnd as EventListener);

    let raf = 0, last = performance.now();
    const v = new THREE.Vector3();
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.12, (now - last) / 1000);
      last = now;
      let f = 0, s = 0;
      if (keys.has("w") || keys.has("arrowup")) f += 1;
      if (keys.has("s") || keys.has("arrowdown")) f -= 1;
      if (keys.has("d")) s += 1;
      if (keys.has("a")) s -= 1;
      if (keys.has("arrowright")) look.yaw += 1.9 * dt;
      if (keys.has("arrowleft")) look.yaw -= 1.9 * dt;
      f -= stick.y;
      s += stick.x;
      const m = Math.hypot(f, s);
      if (m > 0.01) {
        const sp = (SPEED * (keys.has("shift") ? 1.7 : 1) * Math.min(1, m)) / m;
        const sy = Math.sin(look.yaw), cy = Math.cos(look.yaw);
        move((sy * f + cy * s) * sp * dt, (-cy * f + sy * s) * sp * dt);
      }
      const here = roomAt(pos.x, pos.z);
      if (here && here.id !== lastRoom) {
        lastRoom = here.id;
        setRoomName(here.name);
      }
      camera.position.copy(pos);
      camera.lookAt(pos.x + Math.sin(look.yaw) * Math.cos(look.pitch), pos.y + Math.sin(look.pitch), pos.z - Math.cos(look.yaw) * Math.cos(look.pitch));
      renderer.render(scene, camera);
      const w = mount.clientWidth, h = mount.clientHeight;
      let best: WalkHotspot | null = null, bestD = 0.11;
      for (const hs of house.hotspots) {
        const el = markerRefs.current.get(hs.id);
        if (!el) continue;
        v.set(hs.at[0], hs.at[1], hs.at[2]);
        const dist = v.distanceTo(pos);
        v.project(camera);
        if (dist > NEAR || v.z > 1 || Math.abs(v.x) > 1.1 || Math.abs(v.y) > 1.1) {
          el.style.display = "none";
          continue;
        }
        el.style.display = "";
        el.style.left = `${((v.x + 1) / 2) * w}px`;
        el.style.top = `${((1 - v.y) / 2) * h}px`;
        el.style.opacity = String(Math.min(1, (NEAR - dist) / 0.6));
        // The marker nearest the center dot (and close to it) is the one a click uses.
        const c = Math.hypot(v.x * (w / h), v.y);
        if (c < bestD) {
          bestD = c;
          best = hs;
        }
      }
      for (const hs of house.hotspots) markerRefs.current.get(hs.id)?.toggleAttribute("data-focus", hs === best);
      if (best !== focused) {
        focused = best;
        setFocus(best);
      }
    };
    raf = requestAnimationFrame(frame);
    const onResize = () => {
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    api.current = {
      setNight: (n) => setSun(n),
      setLight: (id, on) => {
        const l = roomLights.get(id);
        if (!l) return;
        l.light.intensity = on ? l.power : 0;
        l.glow.visible = on;
      },
      release: () => document.exitPointerLock?.(),
    };
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", kd, true);
      document.removeEventListener("keyup", ku, true);
      document.removeEventListener("keydown", onUseKey, true);
      window.removeEventListener("blur", clearKeys);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("mousemove", onMouse);
      document.removeEventListener("pointerlockchange", onLock);
      renderer.dispose();
      mount.removeChild(canvas);
    };
  }, [house]);

  const press = (hs: WalkHotspot) => {
    if (hs.kind === "switch" && hs.light) {
      const on = !lights[hs.light];
      setLights((l) => ({ ...l, [hs.light!]: on }));
      api.current?.setLight(hs.light, on);
      return;
    }
    api.current?.release();
    setInspect(hs);
  };
  pressRef.current = press;

  return (
    <div className="fixed inset-0 select-none overflow-hidden bg-black text-paper">
      <div ref={mountRef} className="absolute inset-0 touch-none" />

      {house.hotspots.map((hs) => (
        <button
          key={hs.id}
          ref={(el) => {
            if (el) markerRefs.current.set(hs.id, el);
            else markerRefs.current.delete(hs.id);
          }}
          onClick={() => press(hs)}
          style={{ display: "none" }}
          className="group absolute -translate-x-1/2 -translate-y-1/2 transition-transform data-[focus]:scale-125"
        >
          <span className={`block h-9 w-9 rounded-full border-2 ${hs.kind === "switch" ? "border-paper/80" : "border-brass/80"} bg-black/30 group-data-[focus]:border-paper group-data-[focus]:bg-black/60 shadow-[0_0_18px_rgba(0,0,0,0.8)]`}>
            <span className="grid h-full w-full place-items-center text-sm">{hs.kind === "switch" ? (hs.light && lights[hs.light] ? "●" : "○") : "?"}</span>
          </span>
          <span className="absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-[2px] bg-black/70 px-2 py-0.5 text-xs">{hs.label}</span>
        </button>
      ))}

      {!locked && !touch && ready ? (
        <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[2px] bg-black/60 px-3 py-2 text-sm">
          Click to look around · WASD to walk · aim the dot at a marker and click
        </span>
      ) : null}
      {locked ? <span className="pointer-events-none absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-paper/70" /> : null}
      {locked && focus ? (
        <span className="pointer-events-none absolute left-1/2 top-1/2 mt-6 -translate-x-1/2 rounded-[2px] bg-black/70 px-2 py-1 text-xs">
          Click or E: {focus.kind === "switch" ? "flip the switch" : `look at the ${focus.label.toLowerCase()}`}
        </span>
      ) : null}

      <div ref={stickRef} className="absolute bottom-20 left-6 h-28 w-28 rounded-full border border-paper/30 bg-black/30 sm:hidden">
        <div ref={knobRef} className="absolute left-1/2 top-1/2 -ml-6 -mt-6 h-12 w-12 rounded-full bg-paper/40" />
      </div>

      {!ready ? (
        <div className="absolute inset-0 grid place-items-center bg-black">
          <div className="w-64 text-center">
            <p className="font-display text-xl">{house.name}</p>
            <div className="mt-4 h-1 w-full bg-rule">
              <div className="h-1 bg-brass" style={{ width: `${Math.round(progress * 100)}%` }} />
            </div>
            <p className="mt-2 font-mono text-xs text-smoke">Loading the house... {Math.round(progress * 100)}%</p>
          </div>
        </div>
      ) : null}

      <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-3 bg-gradient-to-b from-black/80 to-transparent p-3 sm:p-4">
        <div className="min-w-0">
          <p className="truncate font-mono text-[0.7rem] uppercase tracking-[0.2em] text-brass">Testing Zone · {title}</p>
          <p className="truncate font-display text-lg">{roomName}</p>
        </div>
        <Link href="/agency/assignments" className="shrink-0 border border-rule bg-black/50 px-3 py-1.5 text-sm hover:border-paper">
          Exit
        </Link>
      </div>

      <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-center gap-2 bg-gradient-to-t from-black/80 to-transparent p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] text-sm">
        <button
          onClick={() => {
            const n = !night;
            setNight(n);
            api.current?.setNight(n);
          }}
          className="border border-brass px-3 py-1.5 text-brass"
        >
          Time: {night ? "night" : "day"}
        </button>
      </div>

      {inspect ? (
        <div className="absolute inset-0 grid place-items-center bg-black/70 p-6" onClick={() => setInspect(null)}>
          <div className="max-w-md border border-rule bg-ink p-5" onClick={(e) => e.stopPropagation()}>
            <p className="font-display text-xl">{inspect.label}</p>
            <p className="mt-3 text-smoke">{inspect.text}</p>
            <button onClick={() => setInspect(null)} className="mt-4 border border-rule px-3 py-1.5 text-sm hover:border-paper">
              Close
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
