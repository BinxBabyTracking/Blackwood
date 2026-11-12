# Faces in Blender

Blender runs here as a Python module (`pip install --break-system-packages bpy`), headless.

- `face_build.py`: takes a character already through the face pass (`scripts/characters/tripo`, which cuts the lips
  and adds the inner mouth) and gives it a real `jaw` bone (child of `head`, weights from the old jaw shape, smoothed
  over the skin and kept off the collar and hair), upper and lower teeth, a tongue, eyelids that close over the eyes,
  mouth shapes rebuilt from the bone (`mouth_slight`, `mouth_ah`, `mouth_ee`, `mouth_oh`, `mouth_oo`, `mouth_f`,
  `mouth_closed`, `jawOpen`), `smile`, `blink`, `browUp` and `browDown`. Morph names match the website's, so the
  talking test and the walk use it as is. Settings at the top (lip line, mouth width, smile curve, eyes) come from
  `scripts/characters/tripo/params.json`. Writes a GLB and a .blend.
- `face_shots.py`: close-up renders of each shape (`python3 face_shots.py front -- Basis,mouth_ah,blink`, or `three`
  for a three-quarter view). EEVEE without a GPU, about a minute a shot.

- `add_clips.py`: copies Tripo's animation clips (walk, sit, idle, wait, agree, fold_arms...) onto a face-rigged or
  face-pass character (`python3 add_clips.py -- face.glb tripo_with_clips.glb out.glb`). In Tripo the animations must
  be selected in the export dialog, or the GLB comes out with none. The game uses `walk`, `sit` (a seated loop),
  `idle` (standing loop), `agree` (a nod when you walk up) and anything like `wait` or `fold_arms` now and then.

`face_build.py -- <name>` runs for any character in `tripo/params.json` (first done for Juniper, Nov 11, 2026).
Run them one or two at a time; four at once runs out of memory. As of Nov 12 the build is only tuned for Juniper: on
the others the teeth peek out at rest, and on beards and moustaches (Santa, Quill, Corwin, Bertram) opening the jaw
tears the hair. Those need per-character settings before they ship. Don't name a script `inspect.py`: it shadows a module Blender imports.
