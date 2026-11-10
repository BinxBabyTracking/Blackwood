"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

/**
 * A small 3D viewer for one GLB on Admin: drag to turn it, pinch or scroll to zoom. It turns slowly on its own
 * until touched. The model is framed to fit, on a soft gray backdrop with even light, as Meshy shows it.
 */
export function ModelPreview({ url, className = "" }: { url: string; className?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [info, setInfo] = useState("");

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const w = el.clientWidth || 320;
    const h = el.clientHeight || 320;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    el.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#3a3f45");
    scene.add(new THREE.HemisphereLight(0xffffff, 0x666666, 2.2));
    const sun = new THREE.DirectionalLight(0xffffff, 1.6);
    sun.position.set(3, 5, 4);
    scene.add(sun);
    const camera = new THREE.PerspectiveCamera(35, w / h, 0.01, 1000);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.5;
    controls.addEventListener("start", () => (controls.autoRotate = false));
    let frame = 0;
    let alive = true;
    const loop = () => {
      if (!alive) return;
      controls.update();
      renderer.render(scene, camera);
      frame = requestAnimationFrame(loop);
    };
    new GLTFLoader().load(
      url,
      (gltf) => {
        if (!alive) return;
        const root = gltf.scene;
        const b = new THREE.Box3().setFromObject(root);
        const size = b.getSize(new THREE.Vector3());
        const center = b.getCenter(new THREE.Vector3());
        root.position.sub(center);
        scene.add(root);
        const r = Math.max(size.x, size.y, size.z) || 1;
        camera.position.set(r * 1.2, r * 0.7, r * 1.6);
        camera.near = r / 100;
        camera.far = r * 100;
        camera.updateProjectionMatrix();
        controls.target.set(0, 0, 0);
        let tris = 0;
        root.traverse((o) => {
          const m = o as THREE.Mesh;
          if (m.isMesh && m.geometry) tris += (m.geometry.index ? m.geometry.index.count : m.geometry.attributes.position.count) / 3;
        });
        setInfo(`${Math.round(tris).toLocaleString("en-US")} triangles`);
        setState("ready");
        loop();
      },
      undefined,
      () => alive && setState("error"),
    );
    return () => {
      alive = false;
      cancelAnimationFrame(frame);
      controls.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [url]);

  return (
    <div className={`relative overflow-hidden rounded-[2px] ${className}`}>
      <div ref={box} className="h-full w-full touch-none" />
      {state !== "ready" ? (
        <p className="absolute inset-0 flex items-center justify-center text-xs text-smoke">{state === "loading" ? "Loading the model…" : "Couldn't load this model."}</p>
      ) : (
        <p className="pointer-events-none absolute bottom-1 left-2 text-[0.65rem] text-paper/70">{info} · drag to turn</p>
      )}
    </div>
  );
}
