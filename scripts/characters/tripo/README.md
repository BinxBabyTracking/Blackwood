# Face pass for Tripo characters

Tripo's humanoid rig (UE5 Mannequin preset) gives a good body skeleton but no mouth. These scripts add one.

- `fix.py`: moves coat panels off the arm bones, splits the lip so the mouth opens, adds a dark inner mouth on the
  head bone, and adds face shapes named like the base characters: `mouth_slight`, `mouth_ah`, `mouth_ee`, `mouth_oh`,
  `mouth_oo`, `mouth_f`, `mouth_closed`, `smile`, `blink`, plus `jawOpen` (what the walk viewer reads).
- `prune.py`: drops the unused buffer data the edit leaves behind.
- `check.py face|coat`: renders the face shapes or stress poses to /tmp/aldric for a look.

The face landmarks (lip line `Y0`, lip depth `LIPZ`, eye centers `EYES`, jaw `pivot`) are measured for Aldric
(CHR001). For another character, measure them from a front and side render first.

```
SRC=in.glb python3 fix.py /tmp/out_raw.glb
python3 prune.py /tmp/out_raw.glb out.glb
SRC=out.glb PYOPENGL_PLATFORM=egl python3 check.py face
```
