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

## All CHR001 characters (fix_char.py)

`fix_char.py OUT NAME` is the general version: it reads NAME's face measurements from `params.json` (`Y0` lip
line, `hw` mouth half width, `k` smile curve, `eyes` and `r` eye centers and radius, `beard`, `mustache`) and cuts
the mouth exactly along the painted mouth curve, so the lips part cleanly. Body weights are left as Tripo made them
(`"coat": true` turns the clothing reweight back on; it tears more than it helps on Tripo's fused meshes).

- `measure.py OUT.png`: front and side face renders with a ruler, for measuring a new character.
- `add_hands.py OUT.glb`: for a Tripo rig whose hand bones aren't in the skin (Corwin): skins them and moves the
  palm weights onto them so the wrists bend.
- `run.sh NAME`: fix, prune and render checks into /tmp/chars/NAME (expects /tmp/chars/NAME/a.glb).
