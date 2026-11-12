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

First done for Juniper (Nov 11, 2026). Don't name a script `inspect.py`: it shadows a module Blender imports.
