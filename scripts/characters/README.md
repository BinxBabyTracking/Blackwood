# Base characters (elf boy and elf girl)

`public/models/base/elf_boy.glb` and `elf_girl.glb` are the rigged base bodies every person is skinned from
(case characters and players' detectives). Built from MakeHuman's assets, which are CC0 ("Targets, proxies and
the base mesh are considered graphical assets, covered by CC0", MakeHuman's 2020 license change): free to use,
change and sell, no credit needed.

- **Body:** MakeHuman's base mesh, shaped with its own morph targets: child age, a little round and short, then
  elf features (bigger round head, long pointed ears, a rounder nose, fuller cheeks, bigger eyes).
- **Skeleton:** MakeHuman's default skeleton, 163 bones (body, fingers, toes, face), its own skin weights.
  Bones follow Blender's convention (+Y along the bone). One skeleton for everyone, so animations are shared.
- **Fitted on top:** eyes, eyebrows, hair (boy: short02; girl: ponytail01), outfit (boy: overalls and tee;
  girl: striped shirt and jeans) and shoes, all MakeHuman proxies fitted to the shaped body and weighted to the
  same skeleton. Each is its own mesh, so it can be hidden or swapped.
- **Size:** about 1.2 m (boy) and 1.1 m (girl), meters, Y up, facing +Z, A-pose.

Rebuild:

```
cd /tmp && npm pack makehuman-data@0.0.2 && mkdir makehuman-data && tar -xzf makehuman-data-0.0.2.tgz -C makehuman-data
pip install numpy pillow pygltflib
python3 scripts/characters/build_kid.py boy public/models/base/elf_boy.glb
python3 scripts/characters/build_kid.py girl public/models/base/elf_girl.glb
python3 scripts/characters/pose_test.py public/models/base/elf_boy.glb /tmp/posed.glb   # bends arms, a leg, head and spine to test the weights
```
