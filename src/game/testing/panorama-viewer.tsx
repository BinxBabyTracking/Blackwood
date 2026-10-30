"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { TestHotspot, TestProp, TestRoom } from "./asylum";

/*
 * A small WebGL viewer for equirectangular panoramas. Every pixel casts a ray
 * from the camera and reads the panorama at that direction, so looking
 * straight up or down is as correct as looking ahead. Drag (or tilt the phone)
 * to look, wheel or pinch to zoom, click a hotspot to walk or inspect.
 */

const VERT = `#version 300 es
in vec2 p; out vec2 v; void main(){ v=p; gl_Position=vec4(p,0.,1.); }`;

const FRAG = `#version 300 es
precision highp float;
in vec2 v; out vec4 o;
uniform sampler2D t; uniform float yaw, pitch, tanHalf, aspect, fade;
const float PI = 3.14159265359;
void main(){
  vec3 d = normalize(vec3(v.x*tanHalf*aspect, v.y*tanHalf, -1.));
  float cp = cos(pitch), sp = sin(pitch);
  vec3 a = vec3(d.x, d.y*cp - d.z*sp, d.y*sp + d.z*cp);
  float cy = cos(yaw), sy = sin(yaw);
  vec3 w = vec3(a.x*cy - a.z*sy, a.y, a.x*sy + a.z*cy);
  float u = 0.5 + atan(w.x, -w.z)/(2.*PI);
  float vv = 0.5 - asin(clamp(w.y,-1.,1.))/PI;
  o = vec4(texture(t, vec2(u, vv)).rgb * fade, 1.);
}`;

// Cutouts and their floor shadows: flat quads placed in the room, projected with the same camera.
const SPRITE_VERT = `#version 300 es
in vec3 pos; in vec2 uv; out vec2 vuv;
uniform float yaw, pitch, tanHalf, aspect;
void main(){
  vuv = uv;
  float cy = cos(yaw), sy = sin(yaw), cp = cos(pitch), sp = sin(pitch);
  float x1 = pos.x*cy + pos.z*sy, z1 = -pos.x*sy + pos.z*cy;
  float y2 = pos.y*cp + z1*sp, z2 = -pos.y*sp + z1*cp;
  gl_Position = vec4(x1/(tanHalf*aspect), y2/tanHalf, 0., -z2);
}`;

const SPRITE_FRAG = `#version 300 es
precision highp float;
in vec2 vuv; out vec4 o;
uniform sampler2D t; uniform float fade, shadow;
void main(){
  if (shadow > 0.) {
    vec2 q = (vuv - 0.5) * 2.;
    float a = smoothstep(1., 0.15, length(q)) * shadow;
    o = vec4(0., 0., 0., a * fade);
  } else {
    vec4 c = texture(t, vuv);
    o = vec4(c.rgb * fade, c.a);
  }
}`;

type LoadedProp = { prop: TestProp; tex: WebGLTexture };

const RAD = Math.PI / 180;
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const wrap = (deg: number) => ((((deg + 180) % 360) + 360) % 360) - 180;

type View = { yaw: number; pitch: number; fov: number; fade: number };

export function PanoramaViewer({ rooms, start, title }: { rooms: TestRoom[]; start: string; title: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spotRefs = useRef(new Map<string, HTMLButtonElement>());
  const view = useRef<View>({ yaw: 0, pitch: 0, fov: 80, fade: 0 });
  const glRef = useRef<{ gl: WebGL2RenderingContext; tex: WebGLTexture; u: Record<string, WebGLUniformLocation | null> } | null>(null);
  const propsRef = useRef<{ eye: number; list: LoadedProp[]; token: object }>({ eye: 0.5, list: [], token: {} });
  const gyro = useRef<{ on: boolean; heading0: number | null; yaw0: number }>({ on: false, heading0: null, yaw0: 0 });
  const busy = useRef(false);
  const readoutRef = useRef<HTMLSpanElement>(null);

  const [roomId, setRoomId] = useState(start);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inspect, setInspect] = useState<Extract<TestHotspot, { kind: "inspect" }> | null>(null);
  const [gyroOn, setGyroOn] = useState(false);
  const [showPos, setShowPos] = useState(false);
  const [webglFailed, setWebglFailed] = useState(false);

  const room = rooms.find((r) => r.id === roomId) ?? rooms[0];

  // WebGL setup, once.
  useEffect(() => {
    const canvas = canvasRef.current!;
    const gl = canvas.getContext("webgl2", { antialias: false });
    if (!gl) {
      queueMicrotask(() => setWebglFailed(true));
      return;
    }
    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 1, 1, 0, gl.RGB, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0]));
    const u = Object.fromEntries(["t", "yaw", "pitch", "tanHalf", "aspect", "fade"].map((n) => [n, gl.getUniformLocation(prog, n)]));
    glRef.current = { gl, tex, u };

    const sprog = gl.createProgram()!;
    gl.attachShader(sprog, sh(gl.VERTEX_SHADER, SPRITE_VERT));
    gl.attachShader(sprog, sh(gl.FRAGMENT_SHADER, SPRITE_FRAG));
    gl.linkProgram(sprog);
    const su = Object.fromEntries(["t", "yaw", "pitch", "tanHalf", "aspect", "fade", "shadow"].map((n) => [n, gl.getUniformLocation(sprog, n)]));
    const sbuf = gl.createBuffer();
    const sPos = gl.getAttribLocation(sprog, "pos");
    const sUv = gl.getAttribLocation(sprog, "uv");
    const svao = gl.createVertexArray();
    gl.bindVertexArray(svao);
    gl.bindBuffer(gl.ARRAY_BUFFER, sbuf);
    gl.enableVertexAttribArray(sPos);
    gl.vertexAttribPointer(sPos, 3, gl.FLOAT, false, 20, 0);
    gl.enableVertexAttribArray(sUv);
    gl.vertexAttribPointer(sUv, 2, gl.FLOAT, false, 20, 12);
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Four corners (bottom-left, bottom-right, top-left, top-right) with their texture coordinates.
    const quad = (c: number[][]) =>
      new Float32Array([...c[0], 0, 1, ...c[1], 1, 1, ...c[2], 0, 0, ...c[3], 1, 0]);
    const drawProps = (v: View, tanHalf: number, aspect: number) => {
      const { eye, list } = propsRef.current;
      if (!list.length) return;
      gl.useProgram(sprog);
      gl.bindVertexArray(svao);
      gl.bindBuffer(gl.ARRAY_BUFFER, sbuf);
      gl.enable(gl.BLEND);
      gl.uniform1f(su.yaw, v.yaw * RAD);
      gl.uniform1f(su.pitch, v.pitch * RAD);
      gl.uniform1f(su.tanHalf, tanHalf);
      gl.uniform1f(su.aspect, aspect);
      gl.uniform1f(su.fade, v.fade);
      const floor = -eye;
      // Farthest first, so nearer pieces cover farther ones.
      const sorted = [...list].sort((a, b) => Math.hypot(b.prop.x, b.prop.z) - Math.hypot(a.prop.x, a.prop.z));
      for (const { prop: p, tex: t } of sorted) {
        const d = Math.hypot(p.x, p.z) || 1;
        const fx = p.x / d, fz = p.z / d; // away from the viewer
        const rx = -fz, rz = fx; // the viewer's right, looking at it
        if (p.shadow) {
          const cx = p.x + fx * p.shadow.back, cz = p.z + fz * p.shadow.back;
          const hw = p.shadow.width / 2, hd = p.shadow.depth / 2;
          const y = floor + 0.001;
          gl.bufferData(gl.ARRAY_BUFFER, quad([
            [cx - rx * hw - fx * hd, y, cz - rz * hw - fz * hd],
            [cx + rx * hw - fx * hd, y, cz + rz * hw - fz * hd],
            [cx - rx * hw + fx * hd, y, cz - rz * hw + fz * hd],
            [cx + rx * hw + fx * hd, y, cz + rz * hw + fz * hd],
          ]), gl.DYNAMIC_DRAW);
          gl.uniform1f(su.shadow, p.shadow.strength ?? 0.75);
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        }
        const hw = p.width / 2;
        const base = floor - (p.sink ?? 0);
        gl.bufferData(gl.ARRAY_BUFFER, quad([
          [p.x - rx * hw, base, p.z - rz * hw],
          [p.x + rx * hw, base, p.z + rz * hw],
          [p.x - rx * hw, base + p.height, p.z - rz * hw],
          [p.x + rx * hw, base + p.height, p.z + rz * hw],
        ]), gl.DYNAMIC_DRAW);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, t);
        gl.uniform1i(su.t, 0);
        gl.uniform1f(su.shadow, 0);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
      gl.disable(gl.BLEND);
      gl.bindVertexArray(null);
      gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bindTexture(gl.TEXTURE_2D, glRef.current!.tex);
    };

    let raf = 0;
    const frame = () => {
      raf = requestAnimationFrame(frame);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.round(canvas.clientWidth * dpr);
      const h = Math.round(canvas.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      const v = view.current;
      const aspect = w / Math.max(h, 1);
      const tanHalf = Math.tan((v.fov * RAD) / 2);
      gl.viewport(0, 0, w, h);
      gl.uniform1f(u.yaw, v.yaw * RAD);
      gl.uniform1f(u.pitch, v.pitch * RAD);
      gl.uniform1f(u.tanHalf, tanHalf);
      gl.uniform1f(u.aspect, aspect);
      gl.uniform1f(u.fade, v.fade);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      drawProps(v, tanHalf, aspect);

      // Place hotspots: world direction into camera space, then onto the screen.
      const cy = Math.cos(v.yaw * RAD), sy = Math.sin(v.yaw * RAD);
      const cp = Math.cos(v.pitch * RAD), sp = Math.sin(v.pitch * RAD);
      for (const [key, el] of spotRefs.current) {
        const yaw = Number(el.dataset.yaw) * RAD, pitch = Number(el.dataset.pitch) * RAD;
        const x = Math.sin(yaw) * Math.cos(pitch), y = Math.sin(pitch), z = -Math.cos(yaw) * Math.cos(pitch);
        const x1 = x * cy + z * sy, z1 = -x * sy + z * cy;
        const y2 = y * cp + z1 * sp, z2 = -y * sp + z1 * cp;
        if (z2 >= -0.05 || v.fade < 0.6) {
          el.style.display = "none";
          continue;
        }
        const sx = x1 / -z2 / (tanHalf * aspect), sy2 = y2 / -z2 / tanHalf;
        if (Math.abs(sx) > 1.3 || Math.abs(sy2) > 1.3) {
          el.style.display = "none";
          continue;
        }
        el.style.display = "";
        el.style.left = `${(sx * 0.5 + 0.5) * 100}%`;
        el.style.top = `${(-sy2 * 0.5 + 0.5) * 100}%`;
        void key;
      }
      if (readoutRef.current) readoutRef.current.textContent = `yaw ${Math.round(wrap(v.yaw))}°  pitch ${Math.round(v.pitch)}°`;
    };
    frame();
    return () => cancelAnimationFrame(raf);
  }, []);

  // Load the room's panorama whenever the room changes.
  useEffect(() => {
    const g = glRef.current;
    const r = rooms.find((x) => x.id === roomId);
    if (!g || !r) return;
    view.current.yaw = r.startYaw;
    view.current.pitch = r.startPitch ?? 0;
    view.current.fov = 80;
    gyro.current.heading0 = null;
    let cancelled = false;
    const token = {};
    propsRef.current = { eye: r.eye ?? 0.5, list: [], token };
    for (const prop of r.props ?? []) {
      const pimg = new Image();
      pimg.onload = () => {
        // Only the latest room load may add pieces (a room can load twice, and an old load must not add a copy).
        if (cancelled || propsRef.current.token !== token || propsRef.current.list.some((l) => l.prop.id === prop.id)) return;
        const { gl } = g;
        const t = gl.createTexture()!;
        gl.bindTexture(gl.TEXTURE_2D, t);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, pimg);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, g.tex);
        propsRef.current.list.push({ prop, tex: t });
      };
      pimg.src = prop.image;
    }
    if (!r.image) {
      queueMicrotask(() => {
        setLoading(false);
        setError(null);
      });
      view.current.fade = 0;
      return () => {
        cancelled = true;
      };
    }
    queueMicrotask(() => setLoading(true));
    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      const { gl, tex } = g;
      const max = gl.getParameter(gl.MAX_TEXTURE_SIZE) as number;
      let source: TexImageSource = img;
      if (img.naturalWidth > max) {
        const c = document.createElement("canvas");
        c.width = max;
        c.height = max / 2;
        c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
        source = c;
      }
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, source);
      setLoading(false);
      setError(null);
      animate({ fade: 1 }, 450);
    };
    img.onerror = () => {
      if (!cancelled) {
        setLoading(false);
        setError("The panorama for this room did not load.");
      }
    };
    img.src = r.image;
    return () => {
      cancelled = true;
    };
  }, [roomId, rooms]);

  // Drag, wheel and pinch to look and zoom.
  useEffect(() => {
    const canvas = canvasRef.current!;
    const pointers = new Map<number, { x: number; y: number }>();
    let pinch = 0;
    const down = (e: PointerEvent) => {
      canvas.setPointerCapture(e.pointerId);
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    };
    const move = (e: PointerEvent) => {
      const prev = pointers.get(e.pointerId);
      if (!prev) return;
      const v = view.current;
      if (pointers.size === 1 && !busy.current) {
        const degPerPx = v.fov / canvas.clientHeight;
        if (gyro.current.on) gyro.current.yaw0 -= (e.clientX - prev.x) * degPerPx;
        else {
          v.yaw = wrap(v.yaw - (e.clientX - prev.x) * degPerPx);
          v.pitch = clamp(v.pitch + (e.clientY - prev.y) * degPerPx, -89, 89);
        }
      }
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (pinch) v.fov = clamp(v.fov * (pinch / d), 35, 100);
        pinch = d;
      }
    };
    const up = (e: PointerEvent) => {
      pointers.delete(e.pointerId);
      if (pointers.size < 2) pinch = 0;
    };
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      view.current.fov = clamp(view.current.fov + e.deltaY * 0.05, 35, 100);
    };
    const key = (e: KeyboardEvent) => {
      const v = view.current;
      if (e.key === "ArrowLeft") v.yaw = wrap(v.yaw - 5);
      if (e.key === "ArrowRight") v.yaw = wrap(v.yaw + 5);
      if (e.key === "ArrowUp") v.pitch = clamp(v.pitch + 5, -89, 89);
      if (e.key === "ArrowDown") v.pitch = clamp(v.pitch - 5, -89, 89);
    };
    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);
    canvas.addEventListener("wheel", wheel, { passive: false });
    window.addEventListener("keydown", key);
    return () => {
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", up);
      canvas.removeEventListener("wheel", wheel);
      window.removeEventListener("keydown", key);
    };
  }, []);

  // Tilt to look: the phone's facing direction becomes the view direction.
  useEffect(() => {
    const onOrient = (e: DeviceOrientationEvent) => {
      const g = gyro.current;
      if (!g.on || busy.current || e.alpha == null || e.beta == null || e.gamma == null) return;
      const a = e.alpha * RAD, b = e.beta * RAD, c = e.gamma * RAD;
      // Direction out of the back of the phone, in east / north / up.
      const fE = -(Math.cos(a) * Math.sin(c) + Math.sin(a) * Math.sin(b) * Math.cos(c));
      const fN = -(Math.sin(a) * Math.sin(c) - Math.cos(a) * Math.sin(b) * Math.cos(c));
      const fU = -Math.cos(b) * Math.cos(c);
      const heading = Math.atan2(fE, fN) / RAD;
      if (g.heading0 == null) {
        g.heading0 = heading;
        g.yaw0 = view.current.yaw;
      }
      view.current.yaw = wrap(g.yaw0 + heading - g.heading0);
      view.current.pitch = clamp(Math.asin(clamp(fU, -1, 1)) / RAD, -89, 89);
    };
    window.addEventListener("deviceorientation", onOrient);
    return () => window.removeEventListener("deviceorientation", onOrient);
  }, []);

  const toggleGyro = useCallback(async () => {
    const g = gyro.current;
    if (g.on) {
      g.on = false;
      setGyroOn(false);
      return;
    }
    const D = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> };
    if (typeof D?.requestPermission === "function") {
      const res = await D.requestPermission().catch(() => "denied");
      if (res !== "granted") return;
    }
    g.on = true;
    g.heading0 = null;
    setGyroOn(true);
  }, []);

  const go = useCallback(
    (spot: TestHotspot) => {
      if (busy.current) return;
      if (spot.kind === "inspect") {
        setInspect(spot);
        return;
      }
      busy.current = true;
      const turn = wrap(spot.yaw - view.current.yaw);
      animate({ yaw: view.current.yaw + turn, pitch: spot.pitch, fov: 45, fade: 0 }, 650).then(() => {
        busy.current = false;
        setRoomId(spot.to);
      });
    },
    [],
  );

  return (
    <div className="fixed inset-0 select-none overflow-hidden bg-black text-paper">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full cursor-grab touch-none active:cursor-grabbing" />

      {!room.image || error ? (
        <div className="absolute inset-0 grid place-items-center p-6 text-center">
          <div>
            <p className="font-display text-2xl">{room.name}</p>
            <p className="mt-2 text-smoke">{error ?? "No panorama for this room yet."}</p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {room.hotspots.filter((h) => h.kind === "exit").map((h) => (
                <button key={h.id} onClick={() => setRoomId((h as Extract<TestHotspot, { kind: "exit" }>).to)} className="border border-brass/60 px-4 py-2 text-brass hover:bg-brass/10">
                  Back to {h.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {room.image && !error
        ? room.hotspots.map((h) => (
            <button
              key={`${room.id}-${h.id}`}
              ref={(el) => {
                if (el) spotRefs.current.set(h.id, el);
                else spotRefs.current.delete(h.id);
              }}
              data-yaw={h.yaw}
              data-pitch={h.pitch}
              onClick={() => go(h)}
              style={{ display: "none" }}
              className="group absolute -translate-x-1/2 -translate-y-1/2"
            >
              <span className={`block h-9 w-9 rounded-full border-2 ${h.kind === "exit" ? "border-paper/80" : "border-brass/80"} bg-black/30 shadow-[0_0_18px_rgba(0,0,0,0.8)] backdrop-blur-[1px] transition group-hover:scale-110`}>
                <span className="grid h-full w-full place-items-center text-sm">{h.kind === "exit" ? "➜" : "?"}</span>
              </span>
              <span className="absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-[2px] bg-black/70 px-2 py-0.5 text-xs">{h.label}</span>
            </button>
          ))
        : null}

      {loading ? <p className="absolute inset-x-0 top-1/2 text-center font-mono text-sm text-smoke">Loading room...</p> : null}
      {webglFailed ? <p className="absolute inset-x-0 top-1/2 px-6 text-center text-smoke">This browser can&apos;t show 360° rooms (WebGL 2 is off).</p> : null}

      {showPos ? (
        <>
          <span className="pointer-events-none absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border border-fault" />
          <span ref={readoutRef} className="pointer-events-none absolute left-1/2 top-[calc(50%+1.25rem)] -translate-x-1/2 rounded-[2px] bg-black/70 px-2 py-0.5 font-mono text-xs" />
        </>
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
        <button onClick={toggleGyro} className={`border px-3 py-1.5 ${gyroOn ? "border-brass text-brass" : "border-rule bg-black/50"}`}>
          {gyroOn ? "Tilt to look: on" : "Tilt to look"}
        </button>
        <button onClick={() => setShowPos((s) => !s)} className={`border px-3 py-1.5 ${showPos ? "border-fault text-paper" : "border-rule bg-black/50"}`}>
          {showPos ? "Hide position" : "Show position"}
        </button>
        <span className="hidden text-smoke sm:inline">Drag to look · scroll to zoom</span>
      </div>

      {inspect ? (
        <div className="absolute inset-0 grid place-items-center bg-black/70 p-6" onClick={() => setInspect(null)}>
          <div className="max-w-md border border-rule bg-ink p-5" onClick={(e) => e.stopPropagation()}>
            <p className="font-display text-xl">{inspect.label}</p>
            {inspect.image ? <img src={inspect.image} alt={inspect.label} className="mt-3 w-full" /> : null}
            <p className="mt-3 text-smoke">{inspect.text}</p>
            <button onClick={() => setInspect(null)} className="mt-4 border border-rule px-3 py-1.5 text-sm hover:border-paper">
              Close
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );

  function animate(to: Partial<View>, ms: number) {
    const from = { ...view.current };
    const t0 = performance.now();
    return new Promise<void>((resolve) => {
      const step = (now: number) => {
        const k = clamp((now - t0) / ms, 0, 1);
        const e = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
        for (const key of Object.keys(to) as (keyof View)[]) view.current[key] = from[key] + ((to[key] as number) - from[key]) * e;
        if (k < 1) requestAnimationFrame(step);
        else resolve();
      };
      requestAnimationFrame(step);
    });
  }
}
