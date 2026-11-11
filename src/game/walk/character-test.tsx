"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

/** The face shapes a character can have (the base characters' names, plus jawOpen for the walk viewer). */
const SHAPES = ["mouth_slight", "mouth_ah", "mouth_ee", "mouth_oh", "mouth_oo", "mouth_f", "mouth_closed", "smile", "blink"] as const;
type Shape = (typeof SHAPES)[number];

/** Which mouth shape a spoken letter calls for. */
function viseme(ch: string): Shape | null {
  const c = ch.toLowerCase();
  if ("a".includes(c)) return "mouth_ah";
  if ("ei".includes(c) || c === "y") return "mouth_ee";
  if (c === "o") return "mouth_oh";
  if ("uwq".includes(c)) return "mouth_oo";
  if ("fv".includes(c)) return "mouth_f";
  if ("mbp".includes(c)) return "mouth_closed";
  if (/[a-z]/.test(c)) return "mouth_slight";
  return null;
}

type Timing = { characters: string[]; starts: number[]; ends: number[] };

const SAMPLES = [
  "Hello there. Mind the gears, they bite.",
  "Every clock in this tower keeps Christmas time, and I keep the clocks.",
  "Oh, you want to know about the Chronometer? Sit, sit. It is a long story, and I am very old.",
  "Who goes there? Speak up, my ears are older than the mountains.",
];

/**
 * A Testing Zone stage for one 3D character: drag to look around, and they speak lines in their own voice with the
 * mouth following the words, blink on their own, breathe, and turn their head toward you. Sliders try each face
 * shape by hand.
 */
export function CharacterTest({ caseId, id, name, url }: { caseId: string; id: string; name: string; url: string | null }) {
  const box = useRef<HTMLDivElement>(null);
  const faces = useRef<{ mesh: THREE.Mesh; dict: Record<string, number> }[]>([]);
  const manual = useRef<Record<string, number>>({});
  const talk = useRef<{ audio: HTMLAudioElement; timing: Timing | null } | null>(null);
  const [state, setState] = useState(url ? "Loading…" : "");
  const [shapes, setShapes] = useState<string[]>([]);
  const [values, setValues] = useState<Record<string, number>>({});
  const [text, setText] = useState(SAMPLES[0]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const el = box.current;
    if (!el || !url) return;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    el.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#1d2a3a");
    scene.fog = new THREE.Fog("#1d2a3a", 4, 12);
    scene.add(new THREE.HemisphereLight(0xdfe9ff, 0x3a2a20, 1.6));
    const key = new THREE.DirectionalLight(0xfff1dc, 2.2);
    key.position.set(1.5, 3, 2.5);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x9cc4ff, 1.0);
    rim.position.set(-2, 2, -2);
    scene.add(rim);
    const snow = new THREE.Mesh(new THREE.CircleGeometry(3, 48), new THREE.MeshStandardMaterial({ color: "#eef3f8", roughness: 0.95 }));
    snow.rotation.x = -Math.PI / 2;
    snow.receiveShadow = true;
    scene.add(snow);
    const camera = new THREE.PerspectiveCamera(35, 1, 0.01, 50);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.minDistance = 0.3;
    controls.maxDistance = 6;

    const fit = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    fit();
    window.addEventListener("resize", fit);

    let head: THREE.Bone | null = null;
    let chest: THREE.Bone | null = null;
    let headRest = new THREE.Quaternion();
    let chestRest = new THREE.Quaternion();
    let root: THREE.Object3D | null = null;
    let frame = 0;
    let dead = false;

    new GLTFLoader().load(
      url,
      (g) => {
        if (dead) return;
        root = g.scene;
        const names = new Set<string>();
        root.traverse((o) => {
          const m = o as THREE.Mesh;
          if (m.isMesh) {
            m.castShadow = true;
            m.frustumCulled = false;
            if (m.morphTargetDictionary) {
              faces.current.push({ mesh: m, dict: m.morphTargetDictionary });
              Object.keys(m.morphTargetDictionary).forEach((n) => names.add(n));
            }
          }
          const b = o as THREE.Bone;
          if (b.isBone && b.name === "head") head = b;
          if (b.isBone && b.name === "spine_03") chest = b;
        });
        if (head) headRest = (head as THREE.Bone).quaternion.clone();
        if (chest) chestRest = (chest as THREE.Bone).quaternion.clone();
        scene.add(root);
        const feet = new THREE.Box3().setFromObject(root);
        root.position.y -= feet.min.y;
        root.updateMatrixWorld(true);
        const box3 = new THREE.Box3().setFromObject(root);
        const size = box3.getSize(new THREE.Vector3());
        const c = box3.getCenter(new THREE.Vector3());
        controls.target.set(c.x, box3.min.y + size.y * 0.62, c.z);
        camera.position.set(c.x + size.y * 0.35, box3.min.y + size.y * 0.7, c.z + size.y * 1.9);
        controls.update();
        const list = SHAPES.filter((s) => names.has(s)) as string[];
        setShapes(list);
        setState(list.length ? "" : "This model has no face shapes, so the mouth won't move.");
      },
      undefined,
      () => setState("Couldn't load the model."),
    );

    const clock = new THREE.Clock();
    let last = 0;
    const weights: Record<string, number> = {};
    let nextBlink = 2;
    let blinkAt = -1;
    const look = new THREE.Quaternion();
    const tmp = new THREE.Vector3();

    const tick = () => {
      frame = requestAnimationFrame(tick);
      const t = clock.getElapsedTime();
      const dt = Math.min(Math.max(t - last, 0.001), 0.05);
      last = t;
      controls.update();

      // what the mouth should be doing now
      const target: Record<string, number> = {};
      const tk = talk.current;
      if (tk && !tk.audio.paused && tk.timing) {
        const now = tk.audio.currentTime;
        const ch = tk.timing.starts.findIndex((s, i) => now >= s && now < (tk.timing!.ends[i] ?? s + 0.08));
        const v = ch >= 0 ? viseme(tk.timing.characters[ch]) : null;
        if (v) target[v] = v === "mouth_closed" ? 1 : 0.9;
      } else if (tk && !tk.audio.paused) {
        target.mouth_ah = 0.35 + 0.35 * Math.abs(Math.sin(t * 14));
      }
      // blink every few seconds
      if (t > nextBlink) {
        blinkAt = t;
        nextBlink = t + 2 + Math.random() * 3.5;
      }
      const bk = blinkAt < 0 ? 0 : (t - blinkAt) / 0.16;
      const blink = bk > 0 && bk < 1 ? Math.sin(bk * Math.PI) : 0;

      for (const s of SHAPES) {
        const want = manual.current[s] ?? (s === "blink" ? blink : target[s] ?? 0);
        const speed = s === "blink" ? 1 : 1 - Math.exp(-dt * 28);
        weights[s] = s === "blink" && manual.current[s] == null ? want : (weights[s] ?? 0) + (want - (weights[s] ?? 0)) * speed;
      }
      for (const f of faces.current) {
        const inf = f.mesh.morphTargetInfluences;
        if (!inf) continue;
        for (const s of SHAPES) if (f.dict[s] !== undefined) inf[f.dict[s]] = weights[s];
        if (f.dict.jawOpen !== undefined) inf[f.dict.jawOpen] = 0;
      }

      // breathe, and turn the head toward the camera (within reason)
      if (chest) (chest as THREE.Bone).quaternion.copy(chestRest).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.sin(t * 1.6) * 0.012));
      if (head && root) {
        const h = head as THREE.Bone;
        h.quaternion.copy(headRest);
        h.updateWorldMatrix(true, false);
        const hp = h.getWorldPosition(new THREE.Vector3());
        tmp.copy(camera.position).sub(hp);
        const yaw = THREE.MathUtils.clamp(Math.atan2(tmp.x, tmp.z), -0.9, 0.9);
        const pitch = THREE.MathUtils.clamp(-Math.atan2(tmp.y, Math.hypot(tmp.x, tmp.z)), -0.35, 0.35);
        const want = new THREE.Quaternion().setFromEuler(new THREE.Euler(pitch * 0.6, yaw * 0.7, 0, "YXZ"));
        look.slerp(want, 1 - Math.exp(-dt * 5));
        // apply the world-space turn in the head's parent space
        const parentQ = h.parent!.getWorldQuaternion(new THREE.Quaternion());
        const local = parentQ.clone().invert().multiply(look).multiply(parentQ);
        h.quaternion.premultiply(local);
      }
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      dead = true;
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", fit);
      controls.dispose();
      renderer.dispose();
      el.removeChild(renderer.domElement);
      faces.current = [];
    };
  }, [url]);

  const speak = async (line: string) => {
    if (!line.trim() || busy) return;
    setBusy(true);
    setState("Getting the voice…");
    try {
      talk.current?.audio.pause();
      const base = `/api/walk-voice?caseId=${encodeURIComponent(caseId)}&id=${encodeURIComponent(id)}&text=${encodeURIComponent(line)}`;
      const res = await fetch(base);
      if (!res.ok) throw new Error(((await res.json().catch(() => null)) as { error?: string } | null)?.error ?? "The voice didn't come back.");
      const audio = new Audio(URL.createObjectURL(await res.blob()));
      const timing = (await fetch(base + "&timing=1").then((r) => (r.ok ? r.json() : null)).catch(() => null)) as Timing | null;
      talk.current = { audio, timing };
      audio.onended = () => setBusy(false);
      setState(timing ? "" : "No word timing came back, so the mouth is moving to a simple beat.");
      await audio.play();
    } catch (e) {
      setState(e instanceof Error ? e.message : "The voice didn't come back.");
      setBusy(false);
    }
  };

  const setShape = (s: string, v: number | null) => {
    if (v == null) delete manual.current[s];
    else manual.current[s] = v;
    setValues((x) => {
      const n = { ...x };
      if (v == null) delete n[s];
      else n[s] = v;
      return n;
    });
  };

  return (
    <main className="fixed inset-0 bg-black text-paper">
      <div ref={box} className="absolute inset-0" />
      {!url ? (
        <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
          <p>{name} has no 3D character in use yet. Upload one on Admin, in the 3D characters list.</p>
        </div>
      ) : null}
      <div className="absolute inset-x-0 bottom-0 max-h-[55vh] overflow-y-auto bg-gradient-to-t from-black/90 to-black/40 p-3 text-sm">
        <div className="flex items-baseline justify-between gap-3">
          <p className="font-semibold">{name}</p>
          {state ? <p className="text-xs text-smoke">{state}</p> : null}
        </div>
        <div className="mt-2 flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && speak(text)}
            className="min-w-0 flex-1 rounded-[2px] border border-rule bg-black/50 px-2 py-1.5"
            placeholder="Something for them to say"
          />
          <button type="button" disabled={busy || !url} onClick={() => speak(text)} className="rounded-[2px] bg-brass px-3 py-1.5 font-semibold text-ink disabled:opacity-50">
            {busy ? "Talking…" : "Say it"}
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs">
          {SAMPLES.map((s) => (
            <button key={s} type="button" disabled={busy || !url} className="text-brass underline-offset-4 hover:underline disabled:opacity-50" onClick={() => (setText(s), speak(s))}>
              {s.length > 34 ? s.slice(0, 32) + "…" : s}
            </button>
          ))}
        </div>
        {shapes.length ? (
          <details className="mt-2">
            <summary className="cursor-pointer text-xs text-smoke">Face shapes by hand</summary>
            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:grid-cols-3">
              {shapes.map((s) => (
                <label key={s} className="flex items-center gap-2">
                  <span className="w-24 shrink-0 font-mono">{s.replace("mouth_", "")}</span>
                  <input type="range" min={0} max={1} step={0.05} value={values[s] ?? 0} onChange={(e) => setShape(s, Number(e.target.value))} className="min-w-0 flex-1" />
                </label>
              ))}
              <button type="button" className="text-left text-brass" onClick={() => shapes.forEach((s) => setShape(s, null))}>
                Reset
              </button>
            </div>
          </details>
        ) : null}
      </div>
    </main>
  );
}
