# Base characters and 3D character skinning

`public/models/base/` holds the rigged base bodies every person is made from: `elf_boy`, `elf_girl` (the North
Pole's small, gnome-like elves), `man` and `woman` (everyone full-sized). Built from MakeHuman's assets, which
are CC0 ("Targets, proxies and the base mesh are considered graphical assets, covered by CC0", MakeHuman's 2020
license change): free to use, change and sell, no credit needed.

- **Body:** MakeHuman's base mesh shaped with its own targets. Elves: child age, a little round and short, a
  bigger round head, long pointed ears, a rounder nose, fuller cheeks, bigger eyes (about 1.2 m and 1.1 m).
  Adults: about forty, average build (1.74 m and 1.60 m). Meters, Y up, facing +Z, A-pose.
- **Skeleton:** MakeHuman's default skeleton, 163 bones (body, fingers, toes, face: jaw, lips, cheeks, eyelids)
  with its own skin weights; bones point along +Y as Blender does. One skeleton for everyone.
- **Face shapes** (morph targets on the body, eyebrows, teeth and tongue, from MakeHuman's expression units),
  named like the talking-portrait mouth shapes: `mouth_slight`, `mouth_ah`, `mouth_ee`, `mouth_oh`, `mouth_oo`,
  `mouth_f`, `mouth_closed`, `smile`, `blink`. Talking = these shapes from the voice timing, plus the jaw bone.
- **Separate pieces on the same skeleton:** eyes, eyebrows, teeth, tongue, hair, outfit, shoes. Body under the
  outfit is removed so nothing pokes through.
- **`*.kit`:** the skinning kit for each base (`make_kit.py`): the paintable pieces posed like the character
  views (arms hanging a little away from the sides), how squarely each vertex faces the front, back and sides
  (zero where hidden), and the silhouette per view.

**Skinning** (`src/lib/skinning.ts`, Admin's 3D prompts tab, "3D characters"): for every texel of the body,
outfit, shoes and hair, its 3D point in the pose is placed in the person's front, side and back views by
matching silhouettes row by row (with the neck and the top of the head as anchors; under a hat, the head's top
is found from the face), sampled, and blended by how squarely each view sees it. Unseen texels are filled from
their neighbors. The result is stored as `<case>_char_<person>` model versions (art_models, source "skin").

Rebuild the bases and kits:

```
cd /tmp && npm pack makehuman-data@0.0.2 && mkdir makehuman-data && tar -xzf makehuman-data-0.0.2.tgz -C makehuman-data
pip install numpy pillow pygltflib
for k in boy girl; do python3 scripts/characters/build_kid.py $k public/models/base/elf_$k.glb; python3 scripts/characters/make_kit.py public/models/base/elf_$k.glb public/models/base/elf_$k.kit; done
for k in man woman; do python3 scripts/characters/build_kid.py $k public/models/base/$k.glb; python3 scripts/characters/make_kit.py public/models/base/$k.glb public/models/base/$k.kit; done
python3 scripts/characters/pose_test.py public/models/base/elf_boy.glb /tmp/posed.glb   # bends arms, a leg, head and spine
npx tsx scripts/characters/skin-test.ts base.glb base.kit front.png side.png back.png out.glb   # skinning on local files
```
