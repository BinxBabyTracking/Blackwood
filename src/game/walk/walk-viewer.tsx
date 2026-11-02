"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { WalkHotspot, WalkRoom } from "./c001-house";

/*
 * A walkable room. Computer: click to look around with the mouse, WASD or the arrow keys to walk, Shift to hurry.
 * Phone: the stick at the bottom left walks, dragging anywhere else looks. Walls are solid slabs with real thickness,
 * so the arch and the window have depth. Lighting is live: soft room light, the sun (or the streetlight at night)
 * through the window with shadows, and the ceiling light from the switch.
 */

const WALL = 0.13; // wall thickness in metres (about 5 inches)
const RADIUS = 0.28; // how close you can get to walls and furniture
const SPEED = 1.4;
const NEAR = 2.6; // markers show within this distance

type Look = { yaw: number; pitch: number };

const SUN = { day: { az: 15, el: 48, color: 0xfff0d8, power: 5 }, night: { az: 22, el: 8, color: 0xffcf8a, power: 0.55 } };
const SKY = { day: { sky: 0xfff4e6, ground: 0x8a6a50, power: 3.3 }, night: { sky: 0x5a6a99, ground: 0x2a2018, power: 0.8 } };

export function WalkViewer({ room, title }: { room: WalkRoom; title: string }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const markerRefs = useRef(new Map<string, HTMLButtonElement>());
  const stickRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const api = useRef<{ setNight: (n: boolean) => void; setLight: (on: boolean) => void; release: () => void } | null>(null);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [night, setNight] = useState(false);
  const [lightOn, setLightOn] = useState(false);
  const [inspect, setInspect] = useState<WalkHotspot | null>(null);
  const [locked, setLocked] = useState(false);
  const [touch, setTouch] = useState(false);

  useEffect(() => {
    const mount = mountRef.current!;
    const [W, D, H] = room.size;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    const camera = new THREE.PerspectiveCamera(70, mount.clientWidth / mount.clientHeight, 0.05, 60);
    const look: Look = { yaw: 0, pitch: -0.05 };
    const pos = new THREE.Vector3(0, room.eye, 0.4);
    // For testing: #x,z,yaw (metres, degrees) in the address starts you at that spot facing that way.
    const start = location.hash.slice(1).split(",").map(Number);
    if (start.length >= 3 && start.every((n) => Number.isFinite(n))) {
      pos.set(start[0], room.eye, start[1]);
      look.yaw = (start[2] * Math.PI) / 180;
      if (start.length > 3) look.pitch = (start[3] * Math.PI) / 180;
    }

    const manager = new THREE.LoadingManager();
    manager.onProgress = (_u, loaded, total) => setProgress(loaded / total);
    const tex = new THREE.TextureLoader(manager);
    const loadTex = (url: string) => {
      const t = tex.load(url);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = renderer.capabilities.getMaxAnisotropy();
      return t;
    };

    // Plaster for the inside of openings, and a dark stand-in for the kitchen beyond the arch until it is built.
    const plaster = new THREE.MeshLambertMaterial({ color: 0xd8bf98, side: THREE.DoubleSide });
    const trim = new THREE.MeshLambertMaterial({ color: 0x4a2c1a, side: THREE.DoubleSide });
    const wallMat = (url: string, cutout: boolean) =>
      new THREE.MeshLambertMaterial({ map: loadTex(url), alphaTest: cutout ? 0.5 : 0, transparent: false, side: THREE.FrontSide });
    const shadowCaster = (m: THREE.Mesh) => {
      m.castShadow = true;
      m.receiveShadow = true;
      return m;
    };

    // Walls: the inner face carries the picture (with its openings cut out), plus a back face so it blocks light.
    const addWall = (url: string, cutout: boolean, w: number, place: (m: THREE.Object3D) => void) => {
      const g = new THREE.Group();
      const face = shadowCaster(new THREE.Mesh(new THREE.PlaneGeometry(w, H), wallMat(url, cutout)));
      (face.material as THREE.Material).shadowSide = THREE.DoubleSide;
      face.position.y = H / 2;
      g.add(face);
      place(g);
      scene.add(g);
      return g;
    };
    const front = addWall(room.textures.front, true, W, (g) => g.position.set(0, 0, -D / 2));
    const back = addWall(room.textures.back, true, W, (g) => {
      g.position.set(0, 0, D / 2);
      g.rotation.y = Math.PI;
    });
    addWall(room.textures.left, false, D, (g) => {
      g.position.set(-W / 2, 0, 0);
      g.rotation.y = Math.PI / 2;
    });
    addWall(room.textures.right, false, D, (g) => {
      g.position.set(W / 2, 0, 0);
      g.rotation.y = -Math.PI / 2;
    });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, D), new THREE.MeshLambertMaterial({ map: loadTex(room.textures.floor) }));
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);
    const ceil = shadowCaster(new THREE.Mesh(new THREE.PlaneGeometry(W, D), new THREE.MeshLambertMaterial({ map: loadTex(room.textures.ceil) })));
    ceil.rotation.x = Math.PI / 2;
    ceil.position.y = H;
    scene.add(ceil);

    // The depth of an opening: strips from the wall's inner face back through its thickness.
    const strip = (parent: THREE.Object3D, a: THREE.Vector2, b: THREE.Vector2, mat: THREE.Material) => {
      const len = a.distanceTo(b);
      if (len < 1e-4) return;
      const m = shadowCaster(new THREE.Mesh(new THREE.PlaneGeometry(len, WALL), mat));
      m.position.set((a.x + b.x) / 2, (a.y + b.y) / 2, -WALL / 2);
      m.rotation.set(0, 0, Math.atan2(b.y - a.y, b.x - a.x));
      m.rotateX(Math.PI / 2);
      parent.add(m);
    };
    const wallPoint = (w: number, u: number, v: number) => new THREE.Vector2((u - 0.5) * w, (1 - v) * H);
    // The arch, traced from its picture: up the left side, over the curve, down the right side.
    const arch = room.arch.map(([u, v]) => wallPoint(W, u, v));
    const archLine = [new THREE.Vector2(arch[0].x, 0), ...arch, new THREE.Vector2(arch[arch.length - 1].x, 0)];
    for (let i = 0; i < archLine.length - 1; i++) strip(back, archLine[i], archLine[i + 1], plaster);
    // The window's sill, sides and head.
    const [wu0, wu1, wv0, wv1] = room.window;
    const wc = [wallPoint(W, wu0, wv1), wallPoint(W, wu1, wv1), wallPoint(W, wu1, wv0), wallPoint(W, wu0, wv0)];
    for (let i = 0; i < 4; i++) strip(front, wc[i], wc[(i + 1) % 4], i === 0 ? trim : plaster);
    // Back of the window and arch openings: the far side of the wall, so light only gets in through the holes.
    const backing = (parent: THREE.Object3D, url: string, w: number) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, H), new THREE.MeshLambertMaterial({ map: loadTex(url), alphaTest: 0.5, colorWrite: false, depthWrite: false }));
      m.position.set(0, H / 2, -WALL);
      m.castShadow = true;
      parent.add(m);
    };
    backing(front, room.textures.front, W);
    backing(back, room.textures.back, W);

    // Beyond the arch: a dim passage until the kitchen is built.
    const passage = new THREE.Mesh(new THREE.BoxGeometry(arch[arch.length - 1].x - arch[0].x + 0.4, H, 2.2), new THREE.MeshLambertMaterial({ color: 0x3a2a1e, side: THREE.BackSide }));
    passage.position.set(0, H / 2, D / 2 + WALL + 1.1);
    scene.add(passage);

    // The view out of the window.
    const outsideMat = new THREE.MeshBasicMaterial({ map: loadTex(room.outside.day) });
    const outsideTex = { day: outsideMat.map!, night: loadTex(room.outside.night) };
    const ow = room.outside.width;
    const outside = new THREE.Mesh(new THREE.PlaneGeometry(ow, (ow * 864) / 1536), outsideMat);
    outside.position.set(room.outside.center[0], room.outside.center[1], -D / 2 - room.outside.distance);
    scene.add(outside);

    // Lights.
    const hemi = new THREE.HemisphereLight(SKY.day.sky, SKY.day.ground, SKY.day.power);
    scene.add(hemi);
    const sun = new THREE.DirectionalLight(SUN.day.color, SUN.day.power);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 0.5, far: 20 });
    sun.shadow.bias = -0.0004;
    sun.shadow.normalBias = 0.02;
    scene.add(sun, sun.target);
    const setSun = (n: boolean) => {
      const s = n ? SUN.night : SUN.day;
      const a = (s.az * Math.PI) / 180, e = (s.el * Math.PI) / 180;
      sun.position.set(Math.sin(a) * Math.cos(e) * 8, Math.sin(e) * 8 + room.eye, -Math.cos(a) * Math.cos(e) * 8);
      sun.target.position.set(0, room.eye, 0);
      sun.color.set(s.color);
      sun.intensity = s.power;
      const k = n ? SKY.night : SKY.day;
      hemi.color.set(k.sky);
      hemi.groundColor.set(k.ground);
      hemi.intensity = k.power;
      outsideMat.map = n ? outsideTex.night : outsideTex.day;
      outsideMat.color.setScalar(n ? 0.9 : 1);
      outsideMat.needsUpdate = true;
    };
    setSun(false);
    const bulb = new THREE.PointLight(0xffd29a, 0, 0, 2);
    bulb.position.set(0, H - 0.45, 0);
    scene.add(bulb);
    const glow = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffe2b0 }));
    glow.position.copy(bulb.position);
    glow.visible = false;
    scene.add(glow);

    // Furniture.
    const blockers: { x0: number; x1: number; z0: number; z1: number }[] = [];
    const gl = new GLTFLoader(manager);
    for (const M of room.models) {
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

    manager.onLoad = () => setReady(true);

    // Controls.
    const keys = new Set<string>();
    const stick = { x: 0, y: 0, id: -1, cx: 0, cy: 0 };
    let lookId = -1, lastX = 0, lastY = 0;
    const onKey = (down: boolean) => (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright", "shift"].includes(k)) {
        if (down) keys.add(k);
        else keys.delete(k);
        e.preventDefault();
      }
    };
    const kd = onKey(true), ku = onKey(false);
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);
    const canvas = renderer.domElement;
    const onMouse = (e: MouseEvent) => {
      if (document.pointerLockElement !== canvas) return;
      look.yaw += e.movementX * 0.0024;
      look.pitch = Math.max(-1.45, Math.min(1.45, look.pitch - e.movementY * 0.0024));
    };
    const onClick = () => {
      if (window.matchMedia("(pointer: coarse)").matches) return;
      if (document.pointerLockElement !== canvas) canvas.requestPointerLock?.();
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
    stickRef.current?.addEventListener("touchstart", onTouchStart as EventListener, { passive: true });
    stickRef.current?.addEventListener("touchmove", onTouchMove as EventListener, { passive: false });
    stickRef.current?.addEventListener("touchend", onTouchEnd as EventListener);

    // Keep inside the walls and out of the furniture.
    const testing = start.length >= 3;
    const collide = (x: number, z: number) => {
      if (testing && start.length > 4) return [x, z];
      x = Math.max(-W / 2 + RADIUS, Math.min(W / 2 - RADIUS, x));
      z = Math.max(-D / 2 + RADIUS, Math.min(D / 2 - RADIUS, z));
      for (const b of blockers) {
        const nx = Math.max(b.x0, Math.min(b.x1, x)), nz = Math.max(b.z0, Math.min(b.z1, z));
        const dx = x - nx, dz = z - nz, d = Math.hypot(dx, dz);
        if (d < RADIUS) {
          if (d > 1e-5) {
            x = nx + (dx / d) * RADIUS;
            z = nz + (dz / d) * RADIUS;
          } else {
            const pushX = Math.min(x - b.x0, b.x1 - x), pushZ = Math.min(z - b.z0, b.z1 - z);
            if (pushX < pushZ) x = x - b.x0 < b.x1 - x ? b.x0 - RADIUS : b.x1 + RADIUS;
            else z = z - b.z0 < b.z1 - z ? b.z0 - RADIUS : b.z1 + RADIUS;
          }
        }
      }
      return [x, z];
    };

    let raf = 0, last = performance.now();
    const v = new THREE.Vector3();
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      let f = 0, s = 0;
      if (keys.has("w") || keys.has("arrowup")) f += 1;
      if (keys.has("s") || keys.has("arrowdown")) f -= 1;
      if (keys.has("d")) s += 1;
      if (keys.has("a")) s -= 1;
      // The arrow keys turn, for anyone not using a mouse.
      if (keys.has("arrowright")) look.yaw += 1.9 * dt;
      if (keys.has("arrowleft")) look.yaw -= 1.9 * dt;
      f -= stick.y;
      s += stick.x;
      const m = Math.hypot(f, s);
      if (m > 0.01) {
        const sp = (SPEED * (keys.has("shift") ? 1.7 : 1) * Math.min(1, m)) / m;
        const sy = Math.sin(look.yaw), cy = Math.cos(look.yaw);
        const [nx, nz] = collide(pos.x + (sy * f + cy * s) * sp * dt, pos.z + (-cy * f + sy * s) * sp * dt);
        pos.x = nx;
        pos.z = nz;
      }
      camera.position.copy(pos);
      camera.lookAt(pos.x + Math.sin(look.yaw) * Math.cos(look.pitch), pos.y + Math.sin(look.pitch), pos.z - Math.cos(look.yaw) * Math.cos(look.pitch));
      renderer.render(scene, camera);
      const w = mount.clientWidth, h = mount.clientHeight;
      for (const hs of room.hotspots) {
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
      setLight: (on) => {
        bulb.intensity = on ? 9 : 0;
        glow.visible = on;
      },
      release: () => document.exitPointerLock?.(),
    };
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("mousemove", onMouse);
      document.removeEventListener("pointerlockchange", onLock);
      renderer.dispose();
      mount.removeChild(canvas);
    };
  }, [room]);

  const press = (hs: WalkHotspot) => {
    if (hs.kind === "switch") {
      const on = !lightOn;
      setLightOn(on);
      api.current?.setLight(on);
      return;
    }
    api.current?.release();
    setInspect(hs);
  };

  return (
    <div className="fixed inset-0 select-none overflow-hidden bg-black text-paper">
      <div ref={mountRef} className="absolute inset-0 touch-none" />

      {room.hotspots.map((hs) => (
        <button
          key={hs.id}
          ref={(el) => {
            if (el) markerRefs.current.set(hs.id, el);
            else markerRefs.current.delete(hs.id);
          }}
          onClick={() => press(hs)}
          style={{ display: "none" }}
          className="group absolute -translate-x-1/2 -translate-y-1/2"
        >
          <span className={`block h-9 w-9 rounded-full border-2 ${hs.kind === "switch" ? "border-paper/80" : "border-brass/80"} bg-black/30 shadow-[0_0_18px_rgba(0,0,0,0.8)]`}>
            <span className="grid h-full w-full place-items-center text-sm">{hs.kind === "switch" ? (lightOn ? "●" : "○") : "?"}</span>
          </span>
          <span className="absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-[2px] bg-black/70 px-2 py-0.5 text-xs">{hs.label}</span>
        </button>
      ))}

      {!locked && !touch && ready ? (
        <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[2px] bg-black/60 px-3 py-2 text-sm">
          Click to look around · WASD to walk · arrows turn · Esc to use the markers
        </span>
      ) : null}
      {locked ? <span className="pointer-events-none absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-paper/70" /> : null}

      <div ref={stickRef} className="absolute bottom-20 left-6 h-28 w-28 rounded-full border border-paper/30 bg-black/30 sm:hidden">
        <div ref={knobRef} className="absolute left-1/2 top-1/2 -ml-6 -mt-6 h-12 w-12 rounded-full bg-paper/40" />
      </div>

      {!ready ? (
        <div className="absolute inset-0 grid place-items-center bg-black">
          <div className="w-64 text-center">
            <p className="font-display text-xl">{room.name}</p>
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
          <p className="truncate font-display text-lg">{room.name}</p>
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
