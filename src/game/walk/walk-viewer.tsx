"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { InvestigationState } from "@/game/engine/types";
import { walkAsk } from "@/app/actions/walk-test";
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

/** A window screen of wm by hm metres with an L-shaped cut, left of the faucet so it can be seen over it. */
function screenTexture(wm: number, hm: number) {
  const W = 1024, H = Math.round((W * hm) / wm);
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d")!;
  g.strokeStyle = "rgba(55,58,62,0.7)";
  g.lineWidth = 1;
  const step = W / (wm * 160); // about 6 mm between wires
  for (let x = 0; x < W; x += step) {
    g.beginPath();
    g.moveTo(Math.round(x) + 0.5, 0);
    g.lineTo(Math.round(x) + 0.5, H);
    g.stroke();
  }
  for (let y = 0; y < H; y += step) {
    g.beginPath();
    g.moveTo(0, Math.round(y) + 0.5);
    g.lineTo(W, Math.round(y) + 0.5);
    g.stroke();
  }
  g.strokeStyle = "rgba(50,54,58,0.85)";
  g.lineWidth = 3;
  g.strokeRect(1.5, 1.5, W - 3, H - 3);
  // The cut: down from near the top, then across toward the middle. The flap curls out to the yard.
  const x0 = W * 0.2, y0 = H * 0.14, y1 = H * 0.78, x1 = W * 0.4;
  g.globalCompositeOperation = "destination-out";
  g.lineWidth = 18;
  g.beginPath();
  g.moveTo(x0, y0);
  g.lineTo(x0, y1);
  g.lineTo(x1, y1);
  g.stroke();
  g.globalCompositeOperation = "source-over";
  // Bent wire ends along both sides of the cut, catching the light.
  g.strokeStyle = "rgba(205,205,200,0.75)";
  g.lineWidth = 2;
  for (const d of [-10, 10]) {
    g.beginPath();
    g.moveTo(x0 + d, y0);
    g.lineTo(x0 + d, y1 + d);
    g.lineTo(x1, y1 + d);
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/** A rigged person: arms lowered from the rigging pose, then a slow idle (breathing, weight shift, glances). */
type Rig = { bones: Record<string, THREE.Bone>; base: Record<string, THREE.Quaternion>; phase: number; still?: boolean };
const RIG_BONES = ["Hips", "Spine", "Spine01", "Spine02", "neck", "Head", "LeftArm", "RightArm", "LeftForeArm", "RightForeArm", "LeftHand", "RightHand", "headfront"];

function poseRig(root: THREE.Object3D): Rig | null {
  const bones: Record<string, THREE.Bone> = {};
  root.traverse((o) => {
    const b = o as THREE.Bone;
    if (!b.isBone) return;
    const name = RIG_BONES.find((n) => b.name === n || b.name.endsWith(":" + n) || b.name.endsWith("_" + n));
    if (name && !bones[name]) bones[name] = b;
  });
  if (!bones.LeftArm || !bones.RightArm || !bones.Head) return null;
  root.updateMatrixWorld(true);
  const wp = (b: THREE.Object3D) => b.getWorldPosition(new THREE.Vector3());
  const fwd = bones.headfront ? wp(bones.headfront).sub(wp(bones.Head)).setY(0).normalize() : new THREE.Vector3(0, 0, 1);
  const down = new THREE.Vector3(0, -1, 0);
  // Turn a bone so the joint below it points along dir (in world space).
  const aim = (bone: THREE.Bone, child: THREE.Bone, dir: THREE.Vector3) => {
    bone.updateWorldMatrix(true, false);
    const cur = wp(child).sub(wp(bone)).normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(cur, dir.clone().normalize());
    const world = bone.getWorldQuaternion(new THREE.Quaternion());
    const parent = bone.parent!.getWorldQuaternion(new THREE.Quaternion());
    bone.quaternion.copy(parent.invert().multiply(q.multiply(world)));
    bone.updateWorldMatrix(false, true);
  };
  for (const side of ["Left", "Right"]) {
    const arm = bones[side + "Arm"], fore = bones[side + "ForeArm"], hand = bones[side + "Hand"];
    if (!fore || !hand) continue;
    const out = wp(arm).sub(wp(bones.Spine02 ?? bones.Hips)).setY(0).normalize();
    aim(arm, fore, down.clone().addScaledVector(out, 0.16).addScaledVector(fwd, 0.06));
    aim(fore, hand, down.clone().addScaledVector(out, 0.05).addScaledVector(fwd, 0.3));
  }
  const base: Record<string, THREE.Quaternion> = {};
  for (const [k, b] of Object.entries(bones)) base[k] = b.quaternion.clone();
  return { bones, base, phase: Math.random() * 100 };
}

const _q = new THREE.Quaternion();
const _e = new THREE.Euler();
function idleRig(r: Rig, t: number) {
  const T = t + r.phase;
  const set = (name: string, x: number, y: number, z: number) => {
    const b = r.bones[name];
    if (!b) return;
    b.quaternion.copy(r.base[name]).multiply(_q.setFromEuler(_e.set(x, y, z)));
  };
  const breath = Math.sin(T * 1.5);
  set("Spine01", breath * 0.012, 0, 0);
  set("Spine02", breath * 0.016, 0, 0);
  set("Hips", 0, Math.sin(T * 0.21) * 0.025, Math.sin(T * 0.37) * 0.012);
  // Glance around now and then: mostly still, with slow turns.
  // In an interview they look at you, not around the room.
  const glance = r.still ? 0 : Math.sin(T * 0.19) * 0.22 + Math.sin(T * 0.53) * 0.06;
  set("neck", Math.sin(T * 0.31) * 0.03, glance * 0.4, 0);
  set("Head", Math.sin(T * 0.43) * 0.04 - 0.02, glance * 0.6, Math.sin(T * 0.27) * 0.02);
  set("LeftArm", breath * 0.01, 0, Math.sin(T * 0.33) * 0.02);
  set("RightArm", breath * 0.01, 0, -Math.sin(T * 0.29) * 0.02);
}

/**
 * Playing the case in the room (rather than the Testing Zone): markers stand for the case's own hotspots and show
 * only while the case shows them; clicking one is handled by the game; walking through a doorway into a room that
 * is another location goes there.
 */
export type WalkGame = {
  /** The location the case is at. */
  here: string;
  /** Ids of the hotspots in the scene right now, and the ones the case is pointing at (with a callout). */
  visible: string[];
  attention: Record<string, string | null>;
  /** A panel, note or conversation is open over the room. */
  busy: boolean;
  /** Interviewing someone standing here: the camera turns to their face (on the left of the screen) and their mouth follows the line being spoken. */
  interview?: { characterId: string; line: { src: string; text: string } | null } | null;
  onHotspot: (id: string) => void;
};

export function WalkViewer({ house, title, game }: { house: WalkHouse; title: string; game?: WalkGame }) {
  const gameRef = useRef(game);
  gameRef.current = game;
  const mountRef = useRef<HTMLDivElement>(null);
  const markerRefs = useRef(new Map<string, HTMLButtonElement>());
  const stickRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const api = useRef<{ sit: (seat: number[]) => void; setNight: (n: boolean) => void; setLight: (id: string, on: boolean) => void; setVisit: (v: string) => void; release: () => void; relock: () => void } | null>(null);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [night, setNight] = useState(!!house.startNight);
  const [lights, setLights] = useState<Record<string, boolean>>(() => Object.fromEntries(house.rooms.filter((r) => r.light.startOn).map((r) => [r.light.id, true])));
  const [inspect, setInspect] = useState<WalkHotspot | null>(null);
  const [locked, setLocked] = useState(false);
  const [touch, setTouch] = useState(false);
  const [roomName, setRoomName] = useState(house.rooms[0].name);
  const [focus, setFocus] = useState<WalkHotspot | null>(null);
  const [visit, setVisit] = useState(house.visits?.[0]?.id ?? "");
  const visitRef = useRef(visit);
  visitRef.current = visit;
  const pressRef = useRef<(hs: WalkHotspot) => void>(() => {});
  const talkRef = useRef<{ id: string; text: string; start: number; timing?: { starts: number[]; ends: number[] } | null } | null>(null);
  const [chat, setChat] = useState<{ hs: WalkHotspot; lines: { you: boolean; text: string }[]; pending: boolean; state: InvestigationState | null; error?: string } | null>(null);
  const [draft, setDraft] = useState("");
  // Markers hide while a note or a conversation is open.
  const busyRef = useRef(false);
  busyRef.current = !!chat || !!inspect || !!game?.busy;
  // The "click to look around" hint goes once you have clicked into the room (and stays gone).
  const [hinted, setHinted] = useState(() => {
    try {
      return localStorage.getItem("walk-hinted") === "1";
    } catch {
      return false;
    }
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
    const arrive = (game && house.starts?.[game.here]) || house.start;
    const pos = new THREE.Vector3(arrive?.[0] ?? 0, house.eye, arrive?.[1] ?? 0.4);
    if (arrive) look.yaw = ((arrive[2] ?? 0) * Math.PI) / 180;
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
    const roomLights = new Map<string, { light: THREE.PointLight; ceil: THREE.MeshLambertMaterial; power: number }>();

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
      const tint = r.tint ?? 1;
      const face = cast(new THREE.Mesh(new THREE.PlaneGeometry(f.width, H), new THREE.MeshLambertMaterial({ map: loadTex(def.tex), color: new THREE.Color(tint, tint, tint), alphaTest: def.cutout ? 0.5 : 0, side: def.cutout ? THREE.DoubleSide : THREE.FrontSide })));
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
          for (let i = 0; i < 4; i++) strip(g, c[i], c[(i + 1) % 4], rv.wood || (i === 0 && rv.sill) ? trim : plaster);
        }
      }
      if (def.screen) {
        const [u0, u1, v0, v1] = def.screen;
        const a = pt(u0, v1), b = pt(u1, v0);
        const s = new THREE.Mesh(new THREE.PlaneGeometry(b.x - a.x, b.y - a.y), new THREE.MeshLambertMaterial({ map: screenTexture(b.x - a.x, b.y - a.y), transparent: true, side: THREE.DoubleSide, depthWrite: false }));
        s.position.set((a.x + b.x) / 2, (a.y + b.y) / 2, -WALL * 0.8);
        g.add(s);
      }
      if (def.outside) {
        const o = def.outside;
        // The view runs on past its edges as a mirror image, so close to the glass you never see where it stops.
        const P = 5;
        const wrap = (t: THREE.Texture) => {
          t.wrapS = t.wrapT = THREE.MirroredRepeatWrapping;
          t.repeat.set(P, P);
          t.offset.set(-(P - 1) / 2, -(P - 1) / 2);
          return t;
        };
        const dayT = wrap(loadTex(o.day));
        const mat = new THREE.MeshBasicMaterial({ map: dayT });
        outsides.push({ mat, day: dayT, night: o.night === o.day ? dayT : wrap(loadTex(o.night)) });
        const m = new THREE.Mesh(new THREE.PlaneGeometry(o.width * P, ((o.width * 864) / 1536) * P), mat);
        m.position.set((o.u - 0.5) * f.width, o.y, -WALL - o.distance);
        g.add(m);
      }
      scene.add(g);
    };

    for (const r of house.rooms) {
      const [cx, cz] = r.center;
      const [w, d, H] = r.size;
      const tc = new THREE.Color(r.tint ?? 1, r.tint ?? 1, r.tint ?? 1);
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshLambertMaterial({ map: loadTex(r.floor.tex, r.floor.repeat ?? 1), color: tc }));
      floor.rotation.x = -Math.PI / 2;
      floor.position.set(cx, 0, cz);
      floor.receiveShadow = true;
      scene.add(floor);
      const ceil = cast(new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshLambertMaterial({ map: loadTex(r.ceil.tex), color: tc, emissive: 0x000000, emissiveMap: r.light.glow ? loadTex(r.light.glow) : null })));
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
      roomLights.set(r.light.id, { light, ceil: ceil.material as THREE.MeshLambertMaterial, power: r.light.power });
    }

    // The floor under each doorway, through the thickness of the wall.
    for (const ps of house.passages) {
      if (ps.along === "x") continue; // side doorways get a wooden sill from their own reveal
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

    for (const dc of house.decals ?? []) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(dc.size[0], dc.size[1]), new THREE.MeshLambertMaterial({ map: loadTex(dc.tex), alphaTest: 0.5 }));
      m.rotation.set(-Math.PI / 2, 0, ((dc.rotY ?? 0) * Math.PI) / 180);
      m.position.set(dc.pos[0], 0.003, dc.pos[1]);
      m.receiveShadow = true;
      scene.add(m);
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
    setSun(!!house.startNight);

    // Furniture.
    const blockers: { x0: number; x1: number; z0: number; z1: number; visit?: string; obj?: THREE.Object3D }[] = [];
    const lightsOn = new Set<string>();
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
    const lampMats = new Map<string, THREE.MeshLambertMaterial[]>();
    const lampLights = new Map<string, { light: THREE.PointLight; power: number }[]>();
    const visitGroups: { visit: string; obj: THREE.Object3D }[] = [];
    const showGroups: { id: string; obj: THREE.Object3D }[] = [];
    const rigs: Rig[] = [];
    const people = new Map<string, { grp: THREE.Object3D; rig: Rig | null; rotY: number }>();
    // The interview camera: how far it has moved from your own view to the person's face (0 to 1).
    let iv = 0;
    const ivFrom = new THREE.Vector3(), ivAt = new THREE.Vector3(), camAt = new THREE.Vector3(), lookAt = new THREE.Vector3();
    let ivWho = "";
    // A soft light from beside the camera in an interview, so a face is never lost against a bright window.
    const ivLight = new THREE.PointLight(0xffeedd, 0, 4, 2);
    scene.add(ivLight);
    const jaws: { mesh: THREE.Mesh; i: number; hotspot: string }[] = [];
    let jawNow = 0;
    const jawU = { value: 0 };
    for (const M of house.models) {
      gl.load(M.file, (g) => {
        const op = M.opacity ?? 1;
        g.scene.traverse((o) => {
          const mesh = o as THREE.Mesh;
          if (!mesh.isMesh) return;
          const old = mesh.material as THREE.MeshStandardMaterial;
          const mat = new THREE.MeshLambertMaterial({ map: old.map, vertexColors: !!mesh.geometry.getAttribute("color"), side: THREE.DoubleSide, transparent: op < 1, opacity: op, depthWrite: op >= 1 });
          if (M.lamp && M.glow) {
            const gm = tex.load(M.glow);
            gm.flipY = false;
            gm.colorSpace = THREE.SRGBColorSpace;
            mat.emissiveMap = gm;
            mat.emissive.set(0x000000);
            lampMats.set(M.lamp, [...(lampMats.get(M.lamp) ?? []), mat]);
          }
          mesh.material = mat;
          const ji = mesh.morphTargetDictionary?.jawOpen;
          if (M.talk && ji !== undefined) jaws.push({ mesh, i: ji, hotspot: M.talk });
          if (M.talk && M.mouth && mat.map) {
            const mt = tex.load(M.mouth);
            mt.flipY = false;
            mt.colorSpace = THREE.SRGBColorSpace;
            mat.onBeforeCompile = (sh) => {
              sh.uniforms.mouthMap = { value: mt };
              sh.uniforms.uJaw = jawU;
              sh.fragmentShader = sh.fragmentShader
                .replace("#include <map_pars_fragment>", "#include <map_pars_fragment>\nuniform sampler2D mouthMap;\nuniform float uJaw;")
                .replace(
                  "#include <map_fragment>",
                  "#include <map_fragment>\n{ vec4 mo = texture2D(mouthMap, vMapUv); diffuseColor.rgb = mix(diffuseColor.rgb, mo.rgb, mo.a * smoothstep(0.08, 0.6, uJaw)); }",
                );
            };
            mat.customProgramCacheKey = () => "mouth";
            mat.needsUpdate = true;
          }
          mesh.castShadow = op >= 1;
          if ((mesh as THREE.SkinnedMesh).isSkinnedMesh) mesh.frustumCulled = false;
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
        const k = M.size / (M.fit === "y" ? size.y : size.x);
        grp.scale.set(k * (M.stretch?.[0] ?? 1), k * (M.stretch?.[1] ?? 1), k * (M.stretch?.[2] ?? 1));
        grp.rotation.y = ((M.rotY ?? 0) * Math.PI) / 180;
        grp.position.set(M.pos[0], M.pos[1], M.pos[2]);
        scene.add(grp);
        grp.updateMatrixWorld(true);
        const rig = poseRig(grp);
        if (rig) rigs.push(rig);
        if (M.talk) people.set(M.talk, { grp, rig, rotY: ((M.rotY ?? 0) * Math.PI) / 180 });
        if (game && M.showIf) {
          showGroups.push({ id: M.showIf, obj: grp });
          grp.visible = gameRef.current?.visible.includes(M.showIf) ?? false;
        } else if (M.visit && !game) {
          visitGroups.push({ visit: M.visit, obj: grp });
          grp.visible = M.visit === visitRef.current;
        }
        if (M.lamp && M.light) {
          const pl = new THREE.PointLight(0xffd29a, 0, 0, 2);
          pl.position.set(M.pos[0] + M.light.at[0], M.pos[1] + M.light.at[1], M.pos[2] + M.light.at[2]);
          scene.add(pl);
          lampLights.set(M.lamp, [...(lampLights.get(M.lamp) ?? []), { light: pl, power: M.light.power }]);
          if (lightsOn.has(M.lamp)) pl.intensity = M.light.power;
        }
        grp.updateMatrixWorld(true);
        const wb = new THREE.Box3().setFromObject(grp);
        // Pieces you would bump into (not things sitting on top of others, or flat on the floor).
        if (M.solid !== false && M.pos[1] < 0.05 && wb.max.y > 0.25) blockers.push({ x0: wb.min.x, x1: wb.max.x, z0: wb.min.z, z1: wb.max.z, visit: game ? undefined : M.visit, obj: grp });
        if (M.shadow) {
          const pl = new THREE.Mesh(new THREE.PlaneGeometry(M.shadow[0], M.shadow[1]), contactMat);
          pl.rotation.set(-Math.PI / 2, 0, ((M.rotY ?? 0) * Math.PI) / 180);
          pl.position.set(M.pos[0], 0.004, M.pos[2]);
          scene.add(pl);
        }
      });
    }
    manager.onLoad = () => {
      setReady(true);
      // Lights that are on when you arrive (a diner open all night).
      for (const r of house.rooms) if (r.light.startOn) api.current?.setLight(r.light.id, true);
    };

    // Where you can stand: inside a room or in a passage between rooms, clear of the furniture.
    const areas = [
      ...house.rooms.map((r) => ({ x0: r.center[0] - r.size[0] / 2 + RADIUS, x1: r.center[0] + r.size[0] / 2 - RADIUS, z0: r.center[1] - r.size[1] / 2 + RADIUS, z1: r.center[1] + r.size[1] / 2 - RADIUS })),
      ...house.passages.map((p) =>
        p.along === "x"
          ? { x0: p.x[0], x1: p.x[1], z0: p.z[0] + RADIUS, z1: p.z[1] - RADIUS }
          : { x0: p.x[0] + RADIUS, x1: p.x[1] - RADIUS, z0: p.z[0], z1: p.z[1] },
      ),
    ];
    const free = (x: number, z: number) => {
      if (!areas.some((a) => x >= a.x0 && x <= a.x1 && z >= a.z0 && z <= a.z1)) return false;
      return !blockers.some((b) => (!b.visit || b.visit === visitRef.current) && (b.obj?.visible ?? true) && x > b.x0 - RADIUS && x < b.x1 + RADIUS && z > b.z0 - RADIUS && z < b.z1 + RADIUS && Math.hypot(x - Math.max(b.x0, Math.min(b.x1, x)), z - Math.max(b.z0, Math.min(b.z1, z))) < RADIUS);
    };
    const noclip = testing && start.length > 4;
    // Sitting in a chair: lower and fixed in place until you step away, back where you stood.
    let seated: { from: THREE.Vector3 } | null = null;
    let eyeNow = house.eye;
    const move = (dx: number, dz: number) => {
      if (noclip || free(pos.x + dx, pos.z + dz)) {
        pos.x += dx;
        pos.z += dz;
      } else if (free(pos.x + dx, pos.z)) pos.x += dx;
      else if (free(pos.x, pos.z + dz)) pos.z += dz;
    };
    const roomAt = (x: number, z: number) => house.rooms.find((r) => Math.abs(x - r.center[0]) <= r.size[0] / 2 && Math.abs(z - r.center[1]) <= r.size[1] / 2);
    let lastRoom = "";
    let sentFor = "";
    let lastHere = game?.here ?? "";
    const hotRoom = new Map<string, string>();

    // Controls.
    const keys = new Set<string>();
    const stick = { x: 0, y: 0, id: -1, cx: 0, cy: 0 };
    let lookId = -1, lastX = 0, lastY = 0;
    const CODES: Record<string, string> = {
      KeyW: "w", KeyA: "a", KeyS: "s", KeyD: "d", ArrowUp: "arrowup", ArrowDown: "arrowdown", ArrowLeft: "arrowleft",
      ArrowRight: "arrowright", ShiftLeft: "shift", ShiftRight: "shift",
    };
    const onKey = (down: boolean) => (e: KeyboardEvent) => {
      const tg = e.target as HTMLElement | null;
      if (tg && (tg.tagName === "INPUT" || tg.tagName === "TEXTAREA" || tg.isContentEditable)) return;
      // A panel or conversation is open over the room: its keys are its own.
      if (gameRef.current?.busy) {
        keys.clear();
        return;
      }
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
    const onLock = () => {
      const on = document.pointerLockElement === canvas;
      setLocked(on);
      if (on) {
        setHinted(true);
        try {
          localStorage.setItem("walk-hinted", "1");
        } catch {}
      }
    };
    document.addEventListener("mousemove", onMouse);
    document.addEventListener("pointerlockchange", onLock);
    canvas.addEventListener("click", onClick);
    const onTouchStart = (e: TouchEvent) => {
      setTouch(true);
      for (const t of Array.from(e.changedTouches)) {
        const r = stickRef.current?.getBoundingClientRect();
        if (r && stick.id < 0 && t.clientX > r.left - 40 && t.clientX < r.right + 40 && t.clientY > r.top - 40 && t.clientY < r.bottom + 40) {
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
      if (m > 0.01 && seated && !(gameRef.current?.busy)) {
        pos.x = seated.from.x;
        pos.z = seated.from.z;
        seated = null;
      } else if (m > 0.01 && !(gameRef.current?.busy)) {
        const sp = (SPEED * (keys.has("shift") ? 1.7 : 1) * Math.min(1, m)) / m;
        const sy = Math.sin(look.yaw), cy = Math.cos(look.yaw);
        move((sy * f + cy * s) * sp * dt, (-cy * f + sy * s) * sp * dt);
      }
      const here = roomAt(pos.x, pos.z);
      if (here && here.id !== lastRoom) {
        for (const hs of house.hotspots) hotRoom.set(hs.id, roomAt(hs.at[0], hs.at[2])?.id ?? "");
        lastRoom = here.id;
        setRoomName(here.name);
      }
      const G = gameRef.current;
      if (G) {
        for (const sg of showGroups) sg.obj.visible = G.visible.includes(sg.id);
        // Walked through a doorway into a room that is another location: go there in the case.
        if (here?.location && here.location !== G.here && here.enter && sentFor !== here.location) {
          sentFor = here.location;
          G.onHotspot(here.enter);
        }
        if (here?.location === G.here) sentFor = "";
        // Came here some other way (the map): stand where you arrive.
        if (G.here !== lastHere) {
          const inside = house.rooms.find((r) => r.location === G.here);
          if (lastHere && inside && here?.location !== G.here) {
            const a = house.starts?.[G.here];
            if (a) {
              pos.set(a[0], house.eye, a[1]);
              look.yaw = (a[2] * Math.PI) / 180;
            }
          }
          lastHere = G.here;
        }
        if (G.busy && document.pointerLockElement === canvas) document.exitPointerLock?.();
      }
      for (const r of rigs) idleRig(r, now / 1000);
      const IV = gameRef.current?.interview;
      const hsFor = IV ? house.hotspots.find((h) => h.person === IV.characterId) : undefined;
      const who = hsFor ? people.get(hsFor.id) : undefined;
      // Talking: the mouth follows the letters of the line being read (vowels open, m, b, p and pauses close).
      const line = IV?.line ?? null;
      if (hsFor && line && talkRef.current?.text !== line.text) {
        const tkNew: { id: string; text: string; start: number; timing?: { starts: number[]; ends: number[] } | null } = { id: hsFor.id, text: line.text, start: performance.now(), timing: null };
        talkRef.current = tkNew;
        fetch(line.src + "&timing=1")
          .then((r) => (r.ok ? r.json() : null))
          .then((t) => {
            if (t && talkRef.current === tkNew) tkNew.timing = { starts: t.starts, ends: t.ends };
          })
          .catch(() => {});
      } else if (IV && !line && talkRef.current) talkRef.current = null;
      const tk = talkRef.current;
      let jawGoal = 0;
      if (tk) {
        const el = now - tk.start;
        let i = Math.floor(el / 62);
        if (tk.timing) {
          const sec = el / 1000;
          i = tk.timing.starts.findIndex((st, k) => sec >= st && sec < (tk.timing!.ends[k] ?? st));
          if (i < 0) i = sec > (tk.timing.ends[tk.timing.ends.length - 1] ?? 0) ? tk.text.length : -1;
        }
        const ch = (tk.text[i] ?? "").toLowerCase();
        jawGoal = i < 0 || i >= tk.text.length ? 0 : "ao".includes(ch) ? 1 : "ei".includes(ch) ? 0.65 : "uwy".includes(ch) ? 0.4 : /[a-z]/.test(ch) && !"mbp".includes(ch) ? 0.25 : 0;
      }
      const dbg = (window as unknown as { __jaw?: number }).__jaw;
      if (typeof dbg === "number") jawGoal = dbg;
      jawNow += (jawGoal - jawNow) * Math.min(1, dt * 18);
      jawU.value = jawNow;
      for (const j of jaws) if (j.mesh.morphTargetInfluences) j.mesh.morphTargetInfluences[j.i] = tk && tk.id !== j.hotspot && typeof dbg !== "number" ? 0 : jawNow;
      eyeNow += ((seated ? 1.15 : house.eye) - eyeNow) * Math.min(1, dt * 6);
      pos.y = eyeNow;
      camera.position.copy(pos);
      lookAt.set(pos.x + Math.sin(look.yaw) * Math.cos(look.pitch), pos.y + Math.sin(look.pitch), pos.z - Math.cos(look.yaw) * Math.cos(look.pitch));
      // Interviewing someone here: ease the camera round to their face.
      for (const r of rigs) r.still = !!who && r === who.rig;
      if (who) ivWho = hsFor!.id;
      iv = Math.max(0, Math.min(1, iv + (who ? dt : -dt) * 1.6));
      const P = people.get(ivWho);
      if (iv > 0 && P) {
        const head = P.rig?.bones.Head;
        const face = head ? head.getWorldPosition(ivAt) : P.grp.getWorldPosition(ivAt).setY(1.5);
        const fx = Math.sin(P.rotY), fz = Math.cos(P.rotY);
        face.y += 0.04;
        face.x += fx * 0.06;
        face.z += fz * 0.06;
        // Wide screens: the face on the left, where the interview leaves the room showing; narrow: near the top.
        const w = mount.clientWidth, h = mount.clientHeight, wide = w >= 768;
        const d = 0.8;
        camAt.set(face.x + fx * d, face.y + 0.02, face.z + fz * d);
        const tanV = Math.tan(((camera.fov / 2) * Math.PI) / 180), tanH = tanV * (w / h);
        // Aim to the side of the face (or below it) so it lands where the screen is open.
        const ndcX = wide ? -0.58 : 0, ndcY = wide ? 0.08 : 0.55;
        const rx = Math.cos(P.rotY), rz = -Math.sin(P.rotY); // the person's left, our right
        ivFrom.set(face.x - rx * ndcX * d * tanH, face.y - ndcY * d * tanV, face.z - rz * ndcX * d * tanH);
        const e = iv * iv * (3 - 2 * iv);
        camera.position.lerpVectors(pos, camAt, e);
        lookAt.lerp(ivFrom, e);
        ivLight.position.set(camAt.x + rx * 0.4, camAt.y + 0.35, camAt.z + rz * 0.4);
        ivLight.intensity = 1.6 * e;
      } else ivLight.intensity = 0;
      camera.lookAt(lookAt);
      renderer.render(scene, camera);
      const w = mount.clientWidth, h = mount.clientHeight;
      let best: WalkHotspot | null = null, bestD = 0.11;
      for (const hs of house.hotspots) {
        const el = markerRefs.current.get(hs.id);
        if (!el) continue;
        v.set(hs.at[0], hs.at[1], hs.at[2]);
        const dist = v.distanceTo(pos);
        v.project(camera);
        const Gm = gameRef.current;
        const shown = hs.kind === "switch" || hs.kind === "seat" || !Gm || Gm.visible.includes(hs.game ?? hs.id);
        if (busyRef.current || !shown || (seated && hs.kind === "seat") || hotRoom.get(hs.id) !== lastRoom || (!Gm && hs.visit && hs.visit !== visitRef.current) || dist > (Gm && (hs.game ?? hs.id) in Gm.attention ? 9 : NEAR) || v.z > 1 || Math.abs(v.x) > 1.1 || Math.abs(v.y) > 1.1) {
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
        if (on) lightsOn.add(id);
        else lightsOn.delete(id);
        for (const p of lampLights.get(id) ?? []) p.light.intensity = on ? p.power : 0;
        if (l.ceil.emissiveMap) l.ceil.emissive.setRGB(on ? 1.6 : 0, on ? 1.35 : 0, on ? 0.95 : 0);
        for (const m of lampMats.get(id) ?? []) m.emissive.setRGB(on ? 1.5 : 0, on ? 1.3 : 0, on ? 0.95 : 0);
      },
      setVisit: (v) => {
        for (const g of visitGroups) g.obj.visible = g.visit === v;
      },
      release: () => document.exitPointerLock?.(),
      sit: (st) => {
        seated = { from: pos.clone() };
        pos.x = st[0];
        pos.z = st[1];
        look.yaw = (st[2] * Math.PI) / 180;
        look.pitch = -0.25;
      },
      // Back to looking around after a close (the close click or key counts as the user's go-ahead).
      relock: () => {
        if (window.matchMedia("(pointer: coarse)").matches || document.pointerLockElement === canvas) return;
        canvas.focus();
        (canvas.requestPointerLock?.() as Promise<void> | undefined)?.catch?.(() => {});
      },
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

  /** Speak each line in turn in the person's voice, the mouth following the voice timing. */
  const speak = async (hs: WalkHotspot, lines: string[]) => {
    for (const text of lines) {
      const base = `/api/walk-voice?caseId=${encodeURIComponent(house.caseId ?? "")}&id=${encodeURIComponent(hs.person ?? "")}&text=${encodeURIComponent(text)}`;
      const a = new Audio(base);
      audioRef.current = a;
      const done = new Promise<void>((res) => {
        a.onended = () => res();
        a.onerror = () => res();
      });
      a.onplaying = async () => {
        talkRef.current = { id: hs.id, text, start: performance.now(), timing: null };
        const t = await fetch(base + "&timing=1").then((r) => (r.ok ? r.json() : null)).catch(() => null);
        if (t && talkRef.current?.text === text) talkRef.current.timing = { starts: t.starts, ends: t.ends };
      };
      await a.play().catch(() => {
        // No sound (blocked or failed): read the line with the mouth only.
        talkRef.current = { id: hs.id, text, start: performance.now(), timing: null };
      });
      await Promise.race([done, new Promise((r) => setTimeout(r, Math.max(2500, text.length * 75)))]);
      if (audioRef.current !== a) return;
    }
    talkRef.current = null;
  };

  const askPerson = async () => {
    if (!chat || chat.pending || !draft.trim()) return;
    const q = draft.trim();
    setDraft("");
    setChat({ ...chat, pending: true, error: undefined, lines: [...chat.lines, { you: true, text: q }] });
    const r = await walkAsk(house.caseId ?? "", chat.hs.person ?? "", q, chat.state);
    if ("error" in r && r.error) {
      setChat((c) => (c ? { ...c, pending: false, error: r.error } : c));
      return;
    }
    const got = r as { state: InvestigationState; lines: string[] };
    setChat((c) => (c ? { ...c, pending: false, state: got.state, lines: [...c.lines, ...got.lines.map((t) => ({ you: false, text: t }))] } : c));
    speak(chat.hs, got.lines);
  };

  const press = (hs: WalkHotspot) => {
    if (hs.kind === "seat" && hs.seat) {
      api.current?.sit(hs.seat);
      return;
    }
    if (game && hs.kind !== "switch") {
      api.current?.release();
      game.onHotspot(hs.game ?? hs.id);
      return;
    }
    if (hs.person && house.caseId) {
      api.current?.release();
      setChat((c) => (c && c.hs.id === hs.id ? c : { hs, lines: [], pending: false, state: null }));
      return;
    }
    if (hs.kind === "switch" && hs.light) {
      const on = !lights[hs.light];
      setLights((l) => ({ ...l, [hs.light!]: on }));
      api.current?.setLight(hs.light, on);
      return;
    }
    api.current?.release();
    setInspect(hs);
    // A person reads out the part of the note in quotes (or the whole note).
    const quoted = hs.text?.match(/"([^"]+)"/)?.[1];
    talkRef.current = { id: hs.id, text: quoted ?? hs.text?.split(": ").slice(1).join(": ") ?? "", start: performance.now() };
  };
  pressRef.current = press;
  const close = () => {
    talkRef.current = null;
    audioRef.current?.pause();
    audioRef.current = null;
    setChat(null);
    setInspect(null);
    api.current?.relock();
  };
  useEffect(() => {
    if (!inspect) return;
    const onKey = (e: KeyboardEvent) => {
      if (["KeyE", "Enter", "Escape", "Space"].includes(e.code)) {
        e.preventDefault();
        e.stopPropagation();
        close();
      }
    };
    // Wait a beat so the key that opened the note does not close it straight away.
    const t = setTimeout(() => document.addEventListener("keydown", onKey, true), 150);
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey, true);
    };
  });

  return (
    <div className={`${game ? "relative min-h-0 flex-1" : "fixed inset-0"} select-none overflow-hidden bg-black text-paper`}>
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
            <span className="grid h-full w-full place-items-center text-sm">{hs.kind === "switch" ? (hs.light && lights[hs.light] ? "●" : "○") : hs.kind === "seat" ? "↓" : "?"}</span>
          </span>
          {game && (hs.game ?? hs.id) in game.attention ? <span aria-hidden className="pointer-events-none absolute -inset-2 animate-ping rounded-full border-2 border-brass" /> : null}
          <span className="absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-[2px] bg-black/70 px-2 py-0.5 text-xs">{game?.attention[hs.game ?? hs.id] ?? hs.label}</span>
        </button>
      ))}

      {!locked && !touch && ready && !hinted && !game?.busy ? (
        <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[2px] bg-black/60 px-3 py-2 text-sm">
          Click to look around · WASD to walk · aim the dot at a marker and click
        </span>
      ) : null}
      {locked ? <span className="pointer-events-none absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-paper/70" /> : null}
      {locked && focus ? (
        <span className="pointer-events-none absolute left-1/2 top-1/2 mt-6 -translate-x-1/2 rounded-[2px] bg-black/70 px-2 py-1 text-xs">
          Click or E: {focus.kind === "switch" ? "flip the switch" : focus.kind === "seat" ? "sit down" : `look at the ${focus.label.toLowerCase()}`}
        </span>
      ) : null}

      <div ref={stickRef} className={`absolute ${game ? "bottom-24 right-6" : "bottom-20 left-6"} h-28 w-28 rounded-full border border-paper/30 bg-black/30 sm:hidden`}>
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

      <div data-game={game ? "" : undefined} className="absolute inset-x-0 top-0 flex items-center justify-between gap-3 bg-gradient-to-b data-[game]:hidden from-black/80 to-transparent p-3 sm:p-4">
        <div className="min-w-0">
          <p className="truncate font-mono text-[0.7rem] uppercase tracking-[0.2em] text-brass">Testing Zone · {title}</p>
          <p className="truncate font-display text-lg">{roomName}</p>
        </div>
        <Link href="/agency/assignments" className="shrink-0 border border-rule bg-black/50 px-3 py-1.5 text-sm hover:border-paper">
          Exit
        </Link>
      </div>

      <div data-game={game ? "" : undefined} className="absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-center gap-2 data-[game]:hidden bg-gradient-to-t from-black/80 to-transparent p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] text-sm">
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
        {house.visits ? (
          <button
            onClick={() => {
              const i = house.visits!.findIndex((v) => v.id === visit);
              const next = house.visits![(i + 1) % house.visits!.length].id;
              setVisit(next);
              api.current?.setVisit(next);
            }}
            className="border border-brass px-3 py-1.5 text-brass"
          >
            Visit: {house.visits.find((v) => v.id === visit)?.label}
          </button>
        ) : null}
      </div>

      {chat ? (
        <div className="absolute inset-x-0 bottom-14 flex justify-center p-4" onKeyDown={(e) => e.key === "Escape" && close()}>
          <div className="w-full max-w-xl border border-rule bg-ink/95 p-4">
            <div className="flex items-center justify-between">
              <p className="font-display text-lg">{chat.hs.label}</p>
              <button onClick={close} className="border border-rule px-2 py-1 text-xs hover:border-paper">
                Close
              </button>
            </div>
            <div className="mt-2 max-h-48 space-y-2 overflow-y-auto text-sm">
              {chat.lines.length ? null : <p className="text-smoke">Type a question. This is a test copy of the case: nothing here changes your investigation.</p>}
              {chat.lines.map((l, i) => (
                <p key={i} className={l.you ? "text-brass" : "text-paper"}>
                  {l.you ? "You: " : ""}
                  {l.text}
                </p>
              ))}
              {chat.pending ? <p className="text-smoke">...</p> : null}
              {chat.error ? <p className="text-[#e2a7a2]">{chat.error}</p> : null}
            </div>
            <form
              className="mt-3 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                askPerson();
              }}
            >
              <input
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                maxLength={300}
                placeholder={`Ask ${chat.hs.label.split(",")[0].split(" ")[0]} something...`}
                className="min-w-0 flex-1 border border-rule bg-black/60 px-3 py-2 text-sm outline-none focus:border-brass"
              />
              <button disabled={chat.pending || !draft.trim()} className="border border-brass px-3 py-2 text-sm text-brass disabled:opacity-40">
                Ask
              </button>
            </form>
          </div>
        </div>
      ) : null}

      {inspect ? (
        <div
          className={house.models.some((m) => m.talk === inspect.id) ? "absolute inset-x-0 bottom-16 grid place-items-center p-6" : "absolute inset-0 grid place-items-center bg-black/70 p-6"}
          onClick={close}
        >
          <div className="max-w-md border border-rule bg-ink p-5" onClick={(e) => e.stopPropagation()}>
            <p className="font-display text-xl">{inspect.label}</p>
            <p className="mt-3 text-smoke">{inspect.text}</p>
            <button onClick={close} className="mt-4 border border-rule px-3 py-1.5 text-sm hover:border-paper">
              Close
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
