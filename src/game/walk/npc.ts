import * as THREE from "three";
import { heightAt } from "./zones";
import type { Zone, ZoneModel, ZonePerson } from "./zones";

/** People go about their day: wander, sit in chairs, work at benches and desks, and stop to face you when you come close. */

export type Block = { x0: number; x1: number; z0: number; z1: number };
type Joint = { bone: THREE.Bone; rest: THREE.Quaternion };
// Parents before children, so each bend lands on top of the one above it.
const JOINTS = ["spine_03", "thigh_l", "calf_l", "thigh_r", "calf_r", "upperarm_l", "lowerarm_l", "upperarm_r", "lowerarm_r"] as const;
type JointName = (typeof JOINTS)[number];
export type Rig = Partial<Record<JointName, Joint>>;
/** Bends in degrees about the person's own side-to-side axis. Legs and arms: minus swings forward. Spine: plus leans forward. Calves and forearms: relative to the bone above. */
type Pose = Partial<Record<JointName, number>>;

export function rigOf(bones: Map<string, THREE.Bone>): Rig {
  const rig: Rig = {};
  for (const n of JOINTS) {
    const b = bones.get(n);
    if (b) rig[n] = { bone: b, rest: b.quaternion.clone() };
  }
  return rig;
}

const SIDE = new THREE.Vector3();
const PQ = new THREE.Quaternion();
const WQ = new THREE.Quaternion();
const GQ = new THREE.Quaternion();
function applyPose(rig: Rig, grp: THREE.Object3D, pose: Pose, onTop = false) {
  if (!onTop) for (const n of JOINTS) rig[n]?.bone.quaternion.copy(rig[n]!.rest);
  grp.updateMatrixWorld(true);
  SIDE.set(1, 0, 0).applyQuaternion(grp.getWorldQuaternion(GQ)).normalize();
  for (const n of JOINTS) {
    const j = rig[n];
    const a = pose[n];
    if (!j || !a) continue;
    j.bone.parent!.getWorldQuaternion(PQ);
    WQ.setFromAxisAngle(SIDE, (a * Math.PI) / 180);
    j.bone.quaternion.premultiply(PQ.clone().invert().multiply(WQ).multiply(PQ));
    j.bone.updateMatrixWorld(true);
  }
}

type Act = { kind: "sit" | "work"; at: number[]; rot: number; from: number[]; elev: number; desk: boolean; model: ZoneModel };
type Mode = "idle" | "walk" | "sitdown" | "sit" | "standup" | "work";
export type Npc = {
  P: ZonePerson;
  grp: THREE.Object3D;
  rig: Rig;
  hip: number;
  speed: number;
  x: number;
  z: number;
  rot: number;
  elev: number;
  mode: Mode;
  until: number;
  goal: number[] | null;
  act: Act | null;
  sitK: number;
  workK: number;
  phase: number;
  talking: boolean;
  t0: number;
  /** Real animation clips from the character file (walk and sit, and agree if there is one), used instead of the made-up poses. */
  anim: Anim | null;
};

type Anim = {
  mixer: THREE.AnimationMixer;
  stand: THREE.AnimationAction;
  sit: THREE.AnimationAction;
  walk: THREE.AnimationAction;
  agree: THREE.AnimationAction | null;
  /** World meters per second the walk clip covers at normal speed. */
  stride: number;
  /** How far the hips drop between standing and the sit clip (world meters). */
  drop: number;
  ew: number;
  ea: number;
  wasTalking: boolean;
};

/** Wires up the walk, sit and agree clips when a character file has them. The sit clip is a seated loop; standing still is the first frame of agree (or walk). */
function makeAnim(root: THREE.Object3D, grp: THREE.Object3D, rig: Rig, clips: THREE.AnimationClip[]): Anim | null {
  const find = (re: RegExp) => clips.find((c) => re.test(c.name.toLowerCase()));
  const walkC = find(/walk/), sitC = find(/sit/), agreeC = find(/agree|nod|talk/);
  if (!walkC || !sitC) return null;
  // The walk clip moves the hips forward as it goes; take that out so the game does the moving.
  const walk = walkC.clone();
  let drift = 0;
  for (const tr of walk.tracks) {
    if (!/(^|\/|\b)pelvis\.position$/i.test(tr.name)) continue;
    const v = tr.values, T = tr.times, n = T.length, dur = T[n - 1] - T[0] || 1;
    const d = [v[(n - 1) * 3] - v[0], v[(n - 1) * 3 + 1] - v[1], v[(n - 1) * 3 + 2] - v[2]];
    drift = Math.hypot(...d);
    for (let i = 0; i < n; i++) {
      const f = (T[i] - T[0]) / dur;
      for (let a = 0; a < 3; a++) v[i * 3 + a] -= d[a] * f;
    }
  }
  const mixer = new THREE.AnimationMixer(root);
  const standC = (agreeC ?? walkC).clone();
  standC.name = "stand";
  const stand = mixer.clipAction(standC);
  stand.play();
  stand.paused = true;
  stand.time = 0;
  const sit = mixer.clipAction(sitC);
  sit.play();
  sit.weight = 0;
  const wa = mixer.clipAction(walk);
  wa.play();
  wa.weight = 0;
  const agree = agreeC ? mixer.clipAction(agreeC) : null;
  if (agree) {
    agree.setLoop(THREE.LoopOnce, 1);
    agree.weight = 0;
  }
  // Measure the drop of the hips in world meters (the character is already scaled).
  const hipY = () => {
    mixer.update(0);
    grp.updateMatrixWorld(true);
    return rig.thigh_l?.bone.getWorldPosition(new THREE.Vector3()).y ?? 0;
  };
  const up = hipY();
  stand.weight = 0;
  sit.weight = 1;
  const down = hipY();
  sit.weight = 0;
  stand.weight = 1;
  hipY();
  const scale = grp.getWorldScale(new THREE.Vector3()).x;
  // The pelvis track is in the model's own units, before scaling.
  const stride = drift > 0 ? (drift * scale) / walk.duration : 0.5;
  return { mixer, stand, sit, walk: wa, agree, stride, drop: Math.max(0, up - down), ew: 0, ea: 0, wasTalking: false };
}

const SEAT = /chair|stool|(?<!work)bench|sofa|settee|couch|armchair|seat/;
const WORK = /table|counter|workbench|anvil|stall|cart|loom|lathe|kiln|furnace|forge|easel|press|shelf|shelves|bookcase|cabinet|crate|barrel|cauldron|stove|oven|sink|vise|bench_work|machine|gears|clock/;
const NOT_WORK = /door|window|arch|house|hall|tower|building|hangar|stable|shop|tree|lamp|fence|well|wall|rug|carpet|light|sign/;

export function makeNpc(P: ZonePerson, grp: THREE.Object3D, rig: Rig, t: number, clips: THREE.AnimationClip[] = [], root?: THREE.Object3D): Npc {
  // How high the hips sit above the feet, standing.
  grp.updateMatrixWorld(true);
  const th = rig.thigh_l?.bone.getWorldPosition(new THREE.Vector3());
  const hip = th ? th.y - grp.position.y : P.height * 0.45;
  return {
    P,
    grp,
    rig,
    hip,
    speed: 0.5 + 0.22 * Math.max(0, Math.min(1, (P.height - 1) / 0.9)),
    x: P.pos[0],
    z: P.pos[1],
    rot: P.rotY,
    elev: P.elev ?? 0,
    mode: P.sit ? "sit" : "idle",
    until: t + (P.sit ? 8 + Math.random() * 15 : 1 + Math.random() * 4),
    goal: null,
    act: null,
    sitK: P.sit ? 1 : 0,
    workK: 0,
    phase: Math.random() * 6,
    talking: false,
    t0: Math.random() * 10,
    anim: clips.length && root ? makeAnim(root, grp, rig, clips) : null,
  };
}

/** Back to where the room's layout puts them (used in Edit mode and when leaving it). */
export function resetNpc(n: Npc, t: number) {
  Object.assign(n, { x: n.P.pos[0], z: n.P.pos[1], rot: n.P.rotY, elev: n.P.elev ?? 0, mode: n.P.sit ? "sit" : "idle", until: t + 4 + Math.random() * 6, goal: null, act: null, sitK: n.P.sit ? 1 : 0, workK: 0, talking: false });
}

type World = { zone: Zone; blockers: Block[]; boxOf: (m: ZoneModel) => THREE.Box3 | undefined; others: Npc[]; player: { x: number; z: number } };

const R = 0.24;
function clearAt(w: World, x: number, z: number, pad = R) {
  const [W, D] = w.zone.size;
  if (x < -W / 2 + pad + 0.1 || x > W / 2 - pad - 0.1 || z < -D / 2 + pad + 0.1 || z > D / 2 - pad - 0.1) return false;
  return !w.blockers.some((b) => x > b.x0 - pad && x < b.x1 + pad && z > b.z0 - pad && z < b.z1 + pad);
}
/** A straight walk with nothing in the way (the first steps may brush whatever they're standing beside). */
function lineClear(w: World, a: number[], b: number[]) {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  for (let s = 0.3; s <= len; s += 0.15) {
    const k = s / len;
    if (!clearAt(w, a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k)) return false;
  }
  return clearAt(w, b[0], b[1]);
}
const ang = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));
const taken = (w: World, n: Npc, m: ZoneModel) => w.others.some((o) => o !== n && o.act?.model === m);

/** Where to stand to use a model: the open side nearest you, facing it. */
function workSpot(w: World, n: Npc, m: ZoneModel): Act | null {
  const b = w.boxOf(m);
  if (!b) return null;
  const cx = (b.min.x + b.max.x) / 2, cz = (b.min.z + b.max.z) / 2;
  const sides = [
    [cx, b.max.z + 0.42],
    [cx, b.min.z - 0.42],
    [b.max.x + 0.42, cz],
    [b.min.x - 0.42, cz],
  ].sort((p, q) => Math.hypot(p[0] - n.x, p[1] - n.z) - Math.hypot(q[0] - n.x, q[1] - n.z));
  for (const s of sides)
    if (lineClear(w, [n.x, n.z], s)) {
      const rot = Math.atan2(cx - s[0], cz - s[1]);
      return { kind: "work", at: s, from: s, rot, elev: 0, desk: false, model: m };
    }
  return null;
}

/** A chair to sit in: walk up beside it, then settle in facing the nearest desk or table. */
function seatSpot(w: World, n: Npc, m: ZoneModel): Act | null {
  const b = w.boxOf(m);
  if (!b) return null;
  const z = w.zone;
  const c = [(b.min.x + b.max.x) / 2, (b.min.z + b.max.z) / 2];
  const tall = b.max.y - b.min.y;
  const ground = heightAt(z.terrain, c[0], c[1]) + (n.P.floor ?? 0);
  const seatY = /stool|bench/.test(m.id) ? b.max.y : b.min.y + Math.min(tall * 0.38, 0.5);
  const desk = z.models
    .filter((d) => /desk|table|counter|workbench/.test(d.id) && Math.hypot(d.pos[0] - c[0], d.pos[1] - c[1]) < 2.5)
    .sort((p, q) => Math.hypot(p.pos[0] - c[0], p.pos[1] - c[1]) - Math.hypot(q.pos[0] - c[0], q.pos[1] - c[1]))[0];
  const rot = desk ? Math.atan2(desk.pos[0] - c[0], desk.pos[1] - c[1]) : Math.atan2(-c[0], -c[1]);
  const half = Math.max(b.max.x - b.min.x, b.max.z - b.min.z) / 2 + 0.3;
  // Step in from the front, then either side, then behind.
  for (const off of [0, Math.PI / 2, -Math.PI / 2, Math.PI]) {
    const a = rot + off;
    const from = [c[0] + Math.sin(a) * half, c[1] + Math.cos(a) * half];
    if (lineClear(w, [n.x, n.z], from)) return { kind: "sit", at: c, from, rot, elev: seatY - ground - n.hip + n.P.height * 0.07, desk: !!desk, model: m };
  }
  return null;
}

function choose(w: World, n: Npc, t: number) {
  const z = w.zone;
  const home = n.P.pos;
  const reach = z.outdoor ? 8 : 99;
  // Inside a building: keep to your own room.
  const A = n.P.area;
  const within = (x: number, y: number) => !A || (x > A[0] + 0.3 && x < A[2] - 0.3 && y > A[1] + 0.3 && y < A[3] - 0.3);
  const near = (m: ZoneModel) => (A ? within(m.pos[0], m.pos[1]) : Math.hypot(m.pos[0] - home[0], m.pos[1] - home[1]) < reach) && !taken(w, n, m);
  const seats = z.models.filter((m) => SEAT.test(m.id) && near(m));
  const works = z.models.filter((m) => m.solid && WORK.test(m.id) && !NOT_WORK.test(m.id) && !SEAT.test(m.id) && near(m));
  for (let tries = 0; tries < 6; tries++) {
    const r = Math.random();
    let act: Act | null = null;
    if (r < 0.42 && works.length) act = workSpot(w, n, works[Math.floor(Math.random() * works.length)]);
    else if (r < 0.7 && seats.length) act = seatSpot(w, n, seats[Math.floor(Math.random() * seats.length)]);
    else {
      const rr = z.outdoor ? 6 : Math.max(z.size[0], z.size[1]) / 2;
      const g = A ? [A[0] + Math.random() * (A[2] - A[0]), A[1] + Math.random() * (A[3] - A[1])] : [home[0] + (Math.random() * 2 - 1) * rr, home[1] + (Math.random() * 2 - 1) * rr];
      if (within(g[0], g[1]) && Math.hypot(g[0] - n.x, g[1] - n.z) > 0.8 && clearAt(w, g[0], g[1], 0.4) && lineClear(w, [n.x, n.z], g)) {
        n.goal = g;
        n.act = null;
        n.mode = "walk";
        return;
      }
    }
    if (act) {
      n.act = act;
      n.goal = act.from;
      n.mode = "walk";
      return;
    }
  }
  n.mode = "idle";
  n.until = t + 2 + Math.random() * 3;
}

/** One frame of someone's day. */
export function stepNpc(n: Npc, w: World, t: number, dt: number) {
  const px = w.player.x - n.x, pz = w.player.z - n.z;
  const pd = Math.hypot(px, pz);
  // Someone walks up: stop and face them (seated people stay put and just look).
  if (pd < 2.3 && n.mode !== "sitdown" && n.mode !== "standup") n.talking = true;
  else if (pd > 3.2) n.talking = false;
  const turnTo = (a: number, rate = 4) => {
    const d = ang(a - n.rot);
    n.rot += Math.sign(d) * Math.min(Math.abs(d), rate * dt);
  };
  let moving = false;

  if (n.talking && n.mode !== "sit") {
    turnTo(Math.atan2(px, pz), 3);
    n.workK = Math.max(0, n.workK - dt * 3);
    if (n.mode === "work") n.until += dt;
  } else
    switch (n.mode) {
      case "idle":
        if (t > n.until) choose(w, n, t);
        break;
      case "walk": {
        const g = n.goal!;
        const dx = g[0] - n.x, dz = g[1] - n.z;
        const d = Math.hypot(dx, dz);
        const want = Math.atan2(dx, dz);
        turnTo(want, 5);
        // Don't walk into you.
        const ahead = pd < 0.9 && Math.cos(Math.atan2(px, pz) - n.rot) > 0.3;
        if (d < 0.06) {
          if (n.act?.kind === "sit") {
            n.mode = "sitdown";
            n.until = t + sitTime(n);
          } else if (n.act?.kind === "work") {
            n.mode = "work";
            n.until = t + 10 + Math.random() * 15;
          } else {
            n.mode = "idle";
            n.until = t + 2 + Math.random() * 5;
          }
        } else if (!ahead && Math.abs(ang(want - n.rot)) < 1.2) {
          const s = Math.min(d, n.speed * dt);
          const nx = n.x + (dx / d) * s, nz = n.z + (dz / d) * s;
          if (clearAt(w, nx, nz, 0.15) || !clearAt(w, n.x, n.z, 0.15)) {
            n.x = nx;
            n.z = nz;
            moving = true;
          } else {
            n.mode = "idle";
            n.until = t + 1;
          }
        }
        break;
      }
      case "sitdown": {
        const a = n.act!;
        const k = Math.min(1, 1 - (n.until - t) / sitTime(n));
        turnTo(a.rot, 6);
        n.x = a.from[0] + (a.at[0] - a.from[0]) * k;
        n.z = a.from[1] + (a.at[1] - a.from[1]) * k;
        n.sitK = k;
        n.elev = a.elev * k;
        if (k >= 1) {
          n.mode = "sit";
          n.until = t + 12 + Math.random() * 20;
        }
        break;
      }
      case "sit":
        if (t > n.until && !n.talking) {
          if (!n.act) {
            // Seated from the start (placed in Edit mode): find the way out.
            const f = [n.x + Math.sin(n.rot) * 0.7, n.z + Math.cos(n.rot) * 0.7];
            const sides = [f, [n.x + Math.cos(n.rot) * 0.7, n.z - Math.sin(n.rot) * 0.7], [n.x - Math.cos(n.rot) * 0.7, n.z + Math.sin(n.rot) * 0.7]];
            const out = sides.find((s) => clearAt(w, s[0], s[1])) ?? f;
            n.act = { kind: "sit", at: [n.x, n.z], from: out, rot: n.rot, elev: n.elev, desk: true, model: null as unknown as ZoneModel };
          }
          n.mode = "standup";
          n.until = t + sitTime(n);
        }
        break;
      case "standup": {
        const a = n.act!;
        const k = Math.max(0, (n.until - t) / sitTime(n));
        n.x = a.from[0] + (a.at[0] - a.from[0]) * k;
        n.z = a.from[1] + (a.at[1] - a.from[1]) * k;
        n.sitK = k;
        n.elev = a.elev * k;
        if (k <= 0) {
          n.act = null;
          n.mode = "idle";
          n.until = t + 1 + Math.random() * 3;
        }
        break;
      }
      case "work":
        turnTo(n.act!.rot, 4);
        n.workK = Math.min(1, n.workK + dt * 2);
        if (t > n.until) {
          n.act = null;
          n.mode = "idle";
          n.until = t + 1 + Math.random() * 3;
        }
        break;
    }
  if (n.mode !== "work") n.workK = Math.max(0, n.workK - dt * 2);

  if (n.anim) return animate(n, w, t, dt, moving);

  // Pose.
  const T = t + n.t0;
  const s = n.sitK, wk = n.workK;
  const pose: Pose = {};
  if (moving) n.phase += dt * (n.speed / (n.P.height * 0.42)) * Math.PI;
  const wa = moving ? 1 : 0;
  const ph = n.phase;
  pose.thigh_l = -88 * s + wa * -24 * Math.sin(ph);
  pose.thigh_r = -88 * s + wa * 24 * Math.sin(ph);
  pose.calf_l = 88 * s + wa * (6 + 26 * Math.max(0, -Math.cos(ph)));
  pose.calf_r = 88 * s + wa * (6 + 26 * Math.max(0, Math.cos(ph)));
  // Seated at a desk: writing. Seated elsewhere: hands in the lap.
  const desk = n.act?.desk ?? !!n.P.sit;
  const write = s * (desk ? 1 : 0);
  pose.upperarm_l = wa * 18 * Math.sin(ph) - 22 * s - 48 * wk - 12 * write;
  pose.upperarm_r = wa * -18 * Math.sin(ph) - 22 * s - 48 * wk - 12 * write;
  pose.lowerarm_l = -10 * wa - 40 * s - 50 * wk + wk * 14 * Math.sin(T * 5) + write * 5 * Math.sin(T * 2.3);
  pose.lowerarm_r = -10 * wa - 40 * s - 50 * wk + wk * 14 * Math.sin(T * 5 + 2.2) + write * 7 * Math.sin(T * 3.1 + 1);
  pose.spine_03 = 9 * wk + 6 * write + (n.talking ? 0 : 0);

  const ground = heightAt(w.zone.terrain, n.x, n.z) + (n.P.floor ?? 0);
  const bob = moving ? Math.abs(Math.sin(ph)) * n.P.height * 0.012 : 0;
  n.grp.position.set(n.x, ground + n.elev + bob, n.z);
  n.grp.rotation.y = n.rot;
  applyPose(n.rig, n.grp, pose);
}

const sitTime = (n: Npc) => (n.anim ? 1.3 : 0.9);
const near = (v: number, to: number, r: number) => v + Math.sign(to - v) * Math.min(Math.abs(to - v), r);

/** One frame of someone's day with real clips: standing, the seated loop, the walk and the nod, blended by what they're doing. */
function animate(n: Npc, w: World, t: number, dt: number, moving: boolean) {
  const A = n.anim!;
  const s = n.sitK;
  A.ew = near(A.ew, moving ? 1 : 0, dt * 5);
  A.walk.timeScale = Math.max(0.6, Math.min(1.6, n.speed / A.stride));
  // Nods along when someone comes up to talk (standing only).
  let ag = 0;
  if (A.agree) {
    if (n.talking && !A.wasTalking && s < 0.05) A.agree.reset().play();
    const on = A.agree.isRunning();
    const left = A.agree.getClip().duration - A.agree.time;
    A.ea = near(A.ea, on ? Math.min(1, left / 0.4) : 0, dt * 4);
    ag = A.ea * (1 - A.ew) * (1 - s);
    A.agree.weight = ag;
  }
  A.wasTalking = n.talking;
  // Ease in and out of the chair.
  const sk = s * s * (3 - 2 * s);
  A.walk.weight = A.ew;
  A.sit.weight = sk * (1 - A.ew);
  A.stand.weight = Math.max(0, 1 - A.ew - A.sit.weight - ag);
  const ground = heightAt(w.zone.terrain, n.x, n.z) + (n.P.floor ?? 0);
  n.grp.position.set(n.x, ground + n.elev + A.drop * sk, n.z);
  n.grp.rotation.y = n.rot;
  A.mixer.update(dt);
  // At a bench or desk: hands busy, on top of the clip.
  const wk = n.workK;
  if (wk > 0.01) {
    const T = t + n.t0;
    applyPose(n.rig, n.grp, {
      upperarm_l: -48 * wk,
      upperarm_r: -48 * wk,
      lowerarm_l: -50 * wk + wk * 14 * Math.sin(T * 5),
      lowerarm_r: -50 * wk + wk * 14 * Math.sin(T * 5 + 2.2),
      spine_03: 9 * wk,
    }, true);
  }
}

/** Holds someone still where the layout puts them, seated or standing (Edit mode). */
export function holdNpc(n: Npc, zone: Zone) {
  n.grp.position.set(n.P.pos[0], heightAt(zone.terrain, n.P.pos[0], n.P.pos[1]) + (n.P.floor ?? 0) + (n.P.elev ?? 0), n.P.pos[1]);
  n.grp.rotation.y = n.P.rotY;
  const s = n.P.sit ? 1 : 0;
  if (n.anim) {
    const A = n.anim;
    A.walk.weight = 0;
    if (A.agree) A.agree.weight = 0;
    A.sit.weight = s;
    A.stand.weight = 1 - s;
    n.grp.position.y += A.drop * s;
    A.mixer.update(0);
    return;
  }
  applyPose(n.rig, n.grp, { thigh_l: -88 * s, thigh_r: -88 * s, calf_l: 88 * s, calf_r: 88 * s, upperarm_l: -22 * s, upperarm_r: -22 * s, lowerarm_l: -40 * s, lowerarm_r: -40 * s });
}
