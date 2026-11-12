import * as THREE from "three";

/**
 * Northern lights: tall curtains of light hanging in the night sky. Each is a ribbon whose fragment shader draws
 * the fine vertical rays, the bright green lower hem, the fade up through teal to faint violet, and slow surges of
 * brightness; the vertex shader folds the curtain and lets it drift. Additive, unfogged, and they follow you so
 * they stay in the sky.
 */

const VERT = /* glsl */ `
uniform float uTime;
uniform float uSeed;
attribute vec3 aFold;
varying vec2 vUv;
void main() {
  vUv = uv;
  float t = uTime * 0.06 + uSeed;
  // Folds that travel along the curtain, swinging more at the top than the hem.
  float fold = sin(uv.x * 9.0 + t * 2.1) * 34.0 + sin(uv.x * 23.0 - t * 3.3) * 12.0 + sin(uv.x * 51.0 + t * 5.0) * 3.0;
  fold *= 0.75 + uv.y * 0.6;
  vec3 p = position + aFold * fold;
  p.y += sin(uv.x * 4.0 + t * 1.3) * 10.0;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`;

const FRAG = /* glsl */ `
uniform float uTime;
uniform float uSeed;
uniform float uBright;
varying vec2 vUv;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
float fbm(vec2 p) {
  float s = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { s += a * noise(p); p *= 2.07; a *= 0.5; }
  return s;
}
void main() {
  float t = uTime + uSeed * 40.0;
  float u = vUv.x, v = vUv.y;
  // Fine rays: long streaks running up the curtain, shimmering sideways.
  float rays = fbm(vec2(u * 140.0 + t * 0.35, v * 1.2 - t * 0.25));
  rays = pow(rays, 2.2) * 2.4;
  float coarse = fbm(vec2(u * 18.0 - t * 0.08, t * 0.05));
  // Slow surges of brightness rolling along it.
  float surge = smoothstep(0.25, 0.85, fbm(vec2(u * 3.0 - t * 0.04, t * 0.02 + uSeed)));
  // A rippling, sharp lower hem, brightest just above it, fading upward.
  float hem = v - 0.05 * fbm(vec2(u * 30.0 + t * 0.2, t * 0.1));
  float base = smoothstep(0.0, 0.035, hem);
  float rise = exp(-max(hem, 0.0) * 3.2);
  float e = (hem - 0.03) / 0.035;
  float edge = exp(-e * e) * 0.9;
  float ends = smoothstep(0.0, 0.12, u) * smoothstep(1.0, 0.88, u);
  float a = base * (rise * (0.25 + rays * 0.9 + coarse * 0.5) + edge * (0.5 + rays)) * ends * (0.25 + surge * 1.1) * uBright;
  vec3 green = vec3(0.22, 1.0, 0.52), teal = vec3(0.15, 0.85, 0.75), violet = vec3(0.62, 0.25, 0.85);
  vec3 col = mix(green, teal, smoothstep(0.15, 0.45, v));
  col = mix(col, violet, smoothstep(0.4, 0.95, v) * 0.85);
  gl_FragColor = vec4(col * a, 1.0);
}`;

type Curtain = { mat: THREE.ShaderMaterial };

function curtain(points: number[][], base: number, height: number, seed: number, bright: number) {
  const N = points.length;
  const ROWS = 8;
  const pos: number[] = [], uv: number[] = [], fold: number[] = [], idx: number[] = [];
  for (let i = 0; i < N; i++) {
    const p = points[i], q = points[Math.min(N - 1, i + 1)], o = points[Math.max(0, i - 1)];
    // Fold sideways, across the line of the curtain.
    let dx = q[0] - o[0], dz = q[1] - o[1];
    const L = Math.hypot(dx, dz) || 1;
    dx /= L;
    dz /= L;
    for (let r = 0; r <= ROWS; r++) {
      const v = r / ROWS;
      pos.push(p[0], base + v * height, p[1]);
      uv.push(i / (N - 1), v);
      fold.push(-dz, 0, dx);
    }
    if (i > 0)
      for (let r = 0; r < ROWS; r++) {
        const a = (i - 1) * (ROWS + 1) + r, b = i * (ROWS + 1) + r;
        idx.push(a, b, a + 1, b, b + 1, a + 1);
      }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setAttribute("aFold", new THREE.Float32BufferAttribute(fold, 3));
  g.setIndex(idx);
  const mat = new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    uniforms: { uTime: { value: 0 }, uSeed: { value: seed }, uBright: { value: bright } },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    fog: false,
  });
  const mesh = new THREE.Mesh(g, mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = 1;
  return { mesh, c: { mat } as Curtain };
}

/** A curve through the sky: an arc round you, wandering in and out. */
function arc(r: number, from: number, to: number, wander: number, seed: number, n = 220) {
  const out: number[][] = [];
  for (let i = 0; i < n; i++) {
    const u = i / (n - 1);
    const a = ((from + (to - from) * u) * Math.PI) / 180;
    const rr = r + Math.sin(u * 5.0 + seed) * wander + Math.sin(u * 13.0 + seed * 2) * wander * 0.3;
    out.push([Math.sin(a) * rr, -Math.cos(a) * rr]);
  }
  return out;
}

export function makeAurora() {
  const group = new THREE.Group();
  const parts = [
    // A great curtain across the northern sky.
    curtain(arc(430, -75, 70, 60, 1.1), 95, 230, 0.3, 1.0),
    // A second, higher and nearer, sweeping overhead.
    curtain(arc(260, -40, 110, 90, 2.7), 190, 170, 1.7, 0.7),
    // A faint far one low in the east.
    curtain(arc(620, 30, 150, 80, 4.2), 60, 180, 3.1, 0.55),
  ];
  for (const p of parts) group.add(p.mesh);
  // The sky's light on the snow: a faint green glow that swells with the curtains.
  const glow = new THREE.HemisphereLight(0x3dffa0, 0x000000, 0.12);
  group.add(glow);
  return {
    group,
    update(t: number, at: THREE.Vector3) {
      group.position.set(at.x, 0, at.z);
      for (const p of parts) p.c.mat.uniforms.uTime.value = t;
      glow.intensity = 0.1 + 0.06 * Math.sin(t * 0.13) + 0.04 * Math.sin(t * 0.31 + 1);
    },
  };
}
