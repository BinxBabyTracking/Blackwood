# Rendering a 3D model into a 360° room (Testing Zone)

1. Shrink the model for the web (from a folder with `npm i @gltf-transform/cli three@0.170`):
   `npx gltf-transform weld in.glb a.glb && npx gltf-transform simplify a.glb b.glb --ratio 0.05 --error 0.002 && npx gltf-transform resize b.glb c.glb --width 1024 --height 1024 && npx gltf-transform webp c.glb out.glb --quality 85`
2. Serve this folder (with node_modules/three beside render.html) on port 8799 and run
   `node render.js '{"file":"out.glb","yaw":..,"pitch":..,"fovv":62,"length":..,"rotY":..,"pos":[x,-eye,z]}' out.png`
   yaw/pitch: the camera from the player's eye toward the piece; length: its real length in room units (1 unit = 9 ft);
   rotY: degrees to turn the model (its front faces +z as made; 90 turns it to face +x); pos: the middle of its base.
3. Place the picture as a `view` prop (see src/game/rooms/c001-living-room.ts, the sideboard).
