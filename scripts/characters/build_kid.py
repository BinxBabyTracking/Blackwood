#!/usr/bin/env python3
"""
Builds a rigged, skinned GLB base character (a boy or a girl) from MakeHuman's CC0 assets
(base mesh, morph targets, default skeleton and weights, proxies), as packaged in the
makehuman-data npm package. Elf-shaped: child proportions, slightly larger round head,
pointed ears, a rounder nose and cheeks.

Usage: build_kid.py boy|girl OUT.glb
"""
import glob, io, json, os, sys
import numpy as np
from PIL import Image
import pygltflib as G

MH = os.environ.get("MAKEHUMAN_DATA", "/tmp/makehuman-data/package")  # npm pack makehuman-data@0.0.2, then untar
D = f"{MH}/public/data"
SRC = f"{MH}/src/json"
SCALE = 0.1  # MakeHuman decimeters -> meters

KIND = sys.argv[1]
OUT = sys.argv[2]
SEX = "male" if KIND == "boy" else "female"

# ---------------------------------------------------------------- three.js v3 JSON
def parse_three(d):
    v = np.array(d["vertices"], dtype=np.float64).reshape(-1, 3)
    uvl = d["uvs"][0] if d.get("uvs") and d["uvs"][0] else []
    uv = np.array(uvl, dtype=np.float64).reshape(-1, 2) if uvl else np.zeros((0, 2))
    f = d["faces"]
    nuv = len(d["uvs"]) if d.get("uvs") else 0
    faces = []
    i = 0
    while i < len(f):
        t = f[i]; i += 1
        quad = t & 1; n = 4 if quad else 3
        idx = f[i:i + n]; i += n
        mat = 0
        if t & 2:
            mat = f[i]; i += 1
        fuv = None
        if t & 4:
            i += nuv
        if t & 8:
            fuv = []
            for _ in range(nuv):
                fuv = f[i:i + n]; i += n
        if t & 16:
            i += 1
        if t & 32:
            i += n
        if t & 64:
            i += 1
        if t & 128:
            i += n
        faces.append((idx, mat, fuv))
    return v, uv, faces

base = json.load(open(f"{D}/models/human_full_size.json"))
V0, UV0, F0 = parse_three(base)
NV = len(V0)
matnames = [m["DbgName"] for m in base["materials"]]

# ---------------------------------------------------------------- morph
tlist = sorted(json.load(open(f"{SRC}/targets/target-list.json"))["targets"])
tindex = {p.split("/targets/", 1)[1].replace(".target", ""): k for k, p in enumerate(tlist)}
TB = np.memmap(f"{D}/targets/targets.bin", dtype=np.int16, mode="r", shape=(len(tlist), NV * 3))

def T(name, w):
    return (name, w)

g = SEX
targets = [
    # macro: child, average muscle, a little round, a little short
    T(f"macrodetails/universal-{g}-child-averagemuscle-averageweight", 0.65),
    T(f"macrodetails/universal-{g}-child-averagemuscle-maxweight", 0.35),
    T(f"macrodetails/caucasian-{g}-child", 1 / 3),
    T(f"macrodetails/african-{g}-child", 1 / 3),
    T(f"macrodetails/asian-{g}-child", 1 / 3),
    T(f"macrodetails/height/{g}-child-averagemuscle-averageweight-minheight", 0.5),
    # elf features
    T("head/head-scale-vert-more", 0.35), T("head/head-scale-horiz-more", 0.35), T("head/head-scale-depth-more", 0.25),
    T("head/head-round", 0.6),
    T("ears/l-ear-shape1-pointed", 1.0), T("ears/r-ear-shape1-pointed", 1.0),
    T("ears/l-ear-size-big", 0.7), T("ears/r-ear-size-big", 0.7),
    T("ears/l-ear-height-max", 0.6), T("ears/r-ear-height-max", 0.6),
    T("ears/l-ear-rot-backward", 0.4), T("ears/r-ear-rot-backward", 0.4),
    T("nose/nose-volume-potato", 0.5), T("nose/nose-point-up", 0.3), T("nose/nose-scale-horiz-incr", 0.2),
    T("cheek/l-cheek-volume-inflate", 0.5), T("cheek/r-cheek-volume-inflate", 0.5),
    T("eyes/l-eye-size-big", 0.4), T("eyes/r-eye-size-big", 0.4),
]
delta = np.zeros(NV * 3, dtype=np.float64)
for name, w in targets:
    if name not in tindex:
        print("missing target", name); continue
    delta += np.asarray(TB[tindex[name]], dtype=np.float64) * w
V = V0 + delta.reshape(-1, 3) * 1e-3

# ---------------------------------------------------------------- skeleton
rig = json.load(open(f"{SRC}/rigs/default.json"))
jpi = base["metadata"]["joint_pos_idxs"]
def joint(name):
    return V[jpi[name]].mean(axis=0)
bones = rig["bones"]
order = []
def visit(b):
    order.append(b)
    for c, bd in bones.items():
        if bd["parent"] == b:
            visit(c)
roots = [b for b, bd in bones.items() if not bd["parent"]]
for r in roots:
    visit(r)
bidx = {b: k for k, b in enumerate(order)}
head = {b: joint(bones[b]["head"]) * SCALE for b in order}
tail = {b: joint(bones[b]["tail"]) * SCALE for b in order}

def quat_from_to(a, b):
    a = a / np.linalg.norm(a); b = b / np.linalg.norm(b)
    c = np.cross(a, b); d = float(np.dot(a, b))
    if d < -0.999999:
        axis = np.cross([1, 0, 0], a)
        if np.linalg.norm(axis) < 1e-6: axis = np.cross([0, 0, 1], a)
        axis /= np.linalg.norm(axis)
        return np.array([axis[0], axis[1], axis[2], 0.0])
    q = np.array([c[0], c[1], c[2], 1 + d]); return q / np.linalg.norm(q)

def qmat(q):
    x, y, z, w = q
    return np.array([[1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w)],
                     [2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w)],
                     [2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y)]])

def mat2q(m):
    t = m.trace()
    if t > 0:
        s = np.sqrt(t + 1) * 2; w = 0.25 * s
        x = (m[2, 1] - m[1, 2]) / s; y = (m[0, 2] - m[2, 0]) / s; z = (m[1, 0] - m[0, 1]) / s
    elif m[0, 0] > m[1, 1] and m[0, 0] > m[2, 2]:
        s = np.sqrt(1 + m[0, 0] - m[1, 1] - m[2, 2]) * 2; w = (m[2, 1] - m[1, 2]) / s; x = 0.25 * s
        y = (m[0, 1] + m[1, 0]) / s; z = (m[0, 2] + m[2, 0]) / s
    elif m[1, 1] > m[2, 2]:
        s = np.sqrt(1 + m[1, 1] - m[0, 0] - m[2, 2]) * 2; w = (m[0, 2] - m[2, 0]) / s
        x = (m[0, 1] + m[1, 0]) / s; y = 0.25 * s; z = (m[1, 2] + m[2, 1]) / s
    else:
        s = np.sqrt(1 + m[2, 2] - m[0, 0] - m[1, 1]) * 2; w = (m[1, 0] - m[0, 1]) / s
        x = (m[0, 2] + m[2, 0]) / s; y = (m[1, 2] + m[2, 1]) / s; z = 0.25 * s
    q = np.array([x, y, z, w]); return q / np.linalg.norm(q)

# World rotation of each bone: +Y along the bone (Blender's convention), roll from its parent.
WR = {}
for b in order:
    d = tail[b] - head[b]
    if np.linalg.norm(d) < 1e-6: d = np.array([0, 1e-3, 0])
    p = bones[b]["parent"]
    if p:
        py = WR[p][:, 1]
        r = qmat(quat_from_to(py, d)) @ WR[p]
    else:
        r = qmat(quat_from_to(np.array([0.0, 1, 0]), d))
    WR[b] = r

# ---------------------------------------------------------------- weights (base mesh)
bn = [x["name"] for x in base["bones"]]
def bone_of(i):
    n = bn[i]
    return n[:-len("____head")] if n.endswith("____head") else n
ipv = base["influencesPerVertex"]
SI = np.array(base["skinIndices"]).reshape(-1, ipv)
SW = np.array(base["skinWeights"], dtype=np.float64).reshape(-1, ipv)
WB = [dict() for _ in range(NV)]  # vertex -> {bone index in order: weight}
for vtx in range(NV):
    for k in range(ipv):
        w = SW[vtx, k]
        if w > 0:
            name = bone_of(SI[vtx, k])
            if name in bidx:
                WB[vtx][bidx[name]] = WB[vtx].get(bidx[name], 0) + w

def top4(dct):
    it = sorted(dct.items(), key=lambda x: -x[1])[:4]
    s = sum(w for _, w in it) or 1
    j = [b for b, _ in it] + [0] * (4 - len(it)); w = [w / s for _, w in it] + [0.0] * (4 - len(it))
    return j, w

# ---------------------------------------------------------------- meshes
MESHES = []  # (name, positions, normals?, uvs, indices, joints, weights, material)

def add_mesh(name, verts, uvs, faces, weights, material, keep=None):
    """faces: list of (vidx tuple, uvidx tuple). Splits vertices per unique (v, uv)."""
    key = {}; pos = []; tex = []; jnt = []; wts = []; ind = []
    for vidx, uvidx in faces:
        if keep is not None and not all(keep[v] for v in vidx):
            continue
        loc = []
        for c, v in enumerate(vidx):
            u = uvidx[c] if uvidx is not None else 0
            k = (v, u)
            if k not in key:
                key[k] = len(pos)
                pos.append(verts[v] * SCALE)
                tex.append(uvs[u] if len(uvs) else (0, 0))
                j, w = top4(weights[v]); jnt.append(j); wts.append(w)
            loc.append(key[k])
        if len(loc) == 4:
            ind += [loc[0], loc[1], loc[2], loc[0], loc[2], loc[3]]
        else:
            ind += loc
    pos = np.array(pos, dtype=np.float32); tex = np.array(tex, dtype=np.float32); tex[:, 1] = 1 - tex[:, 1]
    MESHES.append((name, pos, tex, np.array(ind, dtype=np.uint32), np.array(jnt, dtype=np.uint16), np.array(wts, dtype=np.float32), material))

def fit_proxy(path):
    p = json.load(open(path))
    pv, puv, pf = parse_three(p)
    ref = np.array(p["ref_vIdxs"]); w = np.array(p["weights"], dtype=np.float64); off = np.array(p["offsets"], dtype=np.float64)
    body = V[:13380]; body0 = V0[:13380]
    s = (body.max(0) - body.min(0)) / (body0.max(0) - body0.min(0))
    verts = (V[ref] * w[:, :, None]).sum(1) + off * s
    weights = []
    for k in range(len(verts)):
        dct = {}
        for r, ww in zip(ref[k], w[k]):
            for b, bw in WB[r].items():
                dct[b] = dct.get(b, 0) + bw * ww
        dct = {b: x for b, x in dct.items() if x > 1e-4}
        weights.append(dct or {bidx["head"]: 1.0})
    delete = p["metadata"].get("deleteVerts")
    if isinstance(delete, str):
        delete = json.loads(delete)
    return verts, puv, [(f[0], f[2]) for f in pf], weights, p, delete

def tex(path, size=1024, keep_alpha=False):
    im = Image.open(path)
    im = im.convert("RGBA" if keep_alpha else "RGB")
    if max(im.size) > size:
        im.thumbnail((size, size))
    buf = io.BytesIO()
    if keep_alpha:
        im.save(buf, "PNG", optimize=True); return buf.getvalue(), "image/png"
    im.save(buf, "JPEG", quality=88); return buf.getvalue(), "image/jpeg"

# Outfit and hair per kid
if KIND == "boy":
    HAIR, OUTFIT, EYE = "hair/short02/short02.json", "clothes/male_worksuit01/male_worksuit01.json", "brownlight_eye.png"
else:
    HAIR, OUTFIT, EYE = "hair/ponytail01/ponytail01.json", "clothes/male_casualsuit03/male_casualsuit03.json", "bluegreen_eye.png"
SHOES = "clothes/shoes01/shoes01.json"

hidden = np.zeros(NV, dtype=bool)
proxies = []
for nm, rel, mat in [("Outfit", OUTFIT, "outfit"), ("Shoes", SHOES, "shoes"), ("Hair", HAIR, "hair"),
                     ("Eyes", "eyes/Low-Poly/Low-Poly.json", "eyes"), ("Eyebrows", "eyebrows/eyebrow001/eyebrow001.json", "brows")]:
    verts, puv, pf, weights, p, delete = fit_proxy(f"{D}/proxies/{rel}")
    if delete and nm in ("Outfit", "Shoes"):
        hidden |= np.array(delete[:NV], dtype=bool)
    proxies.append((nm, verts, puv, pf, weights, mat, os.path.dirname(f"{D}/proxies/{rel}"), p))

body_faces = [(f[0], f[2]) for f in F0 if matnames[f[1]] == "body"]
add_mesh("Body", V, UV0, body_faces, WB, "skin", keep=~hidden)
for nm, verts, puv, pf, weights, mat, folder, p in proxies:
    add_mesh(nm, verts, puv, pf, weights, mat)

# ---------------------------------------------------------------- materials
skin_dir = glob.glob(f"{D}/skins/young_caucasian_{SEX}/textures/young_lightskinned_{SEX}_diffuse.png")
skin_png = skin_dir[0] if skin_dir else glob.glob(f"{D}/skins/young_caucasian_*/textures/*diffuse.png")[0]
def first(folder, pat):
    g = sorted(glob.glob(os.path.join(folder, "textures", pat)))
    return g[0] if g else None
pfold = {nm: folder for nm, _, _, _, _, _, folder, _ in proxies}
MATS = {
    "skin": (skin_png, False, None),
    "outfit": (first(pfold["Outfit"], "*diffuse.png"), False, None),
    "shoes": (first(pfold["Shoes"], "*diffuse.png"), False, None),
    "hair": (first(pfold["Hair"], "*diffuse.png"), True, "MASK"),
    "eyes": (first(pfold["Eyes"], EYE), False, None),
    "brows": (first(pfold["Eyebrows"], "*.png"), True, "BLEND"),
}

# ---------------------------------------------------------------- glTF
gl = G.GLTF2(asset=G.Asset(generator="Blackwood MakeHuman kid builder (CC0 MakeHuman assets)", version="2.0"))
blob = bytearray()
def view(data, target=None):
    while len(blob) % 4: blob.append(0)
    off = len(blob); blob.extend(data)
    gl.bufferViews.append(G.BufferView(buffer=0, byteOffset=off, byteLength=len(data), target=target)); return len(gl.bufferViews) - 1
def acc(arr, ctype, typ, target=None, minmax=False):
    bv = view(arr.tobytes(), target)
    a = G.Accessor(bufferView=bv, componentType=ctype, count=len(arr), type=typ)
    if minmax: a.min = arr.min(0).tolist(); a.max = arr.max(0).tolist()
    gl.accessors.append(a); return len(gl.accessors) - 1

matid = {}
for key, (png, alpha, mode) in MATS.items():
    if png:
        data, mime = tex(png, 1024 if key in ("skin", "outfit", "hair") else 512, keep_alpha=alpha)
        bv = view(data); gl.images.append(G.Image(bufferView=bv, mimeType=mime))
        gl.textures.append(G.Texture(source=len(gl.images) - 1, sampler=0))
        pbr = G.PbrMetallicRoughness(baseColorTexture=G.TextureInfo(index=len(gl.textures) - 1), metallicFactor=0.0, roughnessFactor=0.85)
    else:
        pbr = G.PbrMetallicRoughness(baseColorFactor=[0.5, 0.5, 0.5, 1], metallicFactor=0.0, roughnessFactor=0.85)
    m = G.Material(name=key, pbrMetallicRoughness=pbr, doubleSided=key in ("hair", "brows"))
    if mode: m.alphaMode = mode
    if mode == "MASK": m.alphaCutoff = 0.5
    gl.materials.append(m); matid[key] = len(gl.materials) - 1
gl.samplers.append(G.Sampler(magFilter=9729, minFilter=9987, wrapS=10497, wrapT=10497))

# skeleton nodes
first_bone = len(gl.nodes)
for b in order:
    p = bones[b]["parent"]
    if p:
        lr = WR[p].T @ WR[b]; lt = WR[p].T @ (head[b] - head[p])
    else:
        lr = WR[b]; lt = head[b]
    gl.nodes.append(G.Node(name=b, translation=[float(x) for x in lt], rotation=[float(x) for x in mat2q(lr)]))
for b in order:
    kids = [first_bone + bidx[c] for c in order if bones[c]["parent"] == b]
    if kids: gl.nodes[first_bone + bidx[b]].children = kids
ibm = []
for b in order:
    M = np.eye(4); M[:3, :3] = WR[b]; M[:3, 3] = head[b]
    ibm.append(np.linalg.inv(M).T.astype(np.float32).reshape(-1))  # column-major
ibm_acc = acc(np.array(ibm, dtype=np.float32), 5126, "MAT4")
gl.skins.append(G.Skin(name="Armature", joints=[first_bone + k for k in range(len(order))], inverseBindMatrices=ibm_acc,
                       skeleton=first_bone + bidx[roots[0]]))

mesh_nodes = []
for name, pos, tx, ind, jn, wt, mat in MESHES:
    # smooth normals
    nrm = np.zeros_like(pos); tri = ind.reshape(-1, 3)
    fn = np.cross(pos[tri[:, 1]] - pos[tri[:, 0]], pos[tri[:, 2]] - pos[tri[:, 0]])
    for c in range(3): np.add.at(nrm, tri[:, c], fn)
    nrm /= np.maximum(np.linalg.norm(nrm, axis=1, keepdims=True), 1e-12)
    attrs = G.Attributes(POSITION=acc(pos, 5126, "VEC3", 34962, True), NORMAL=acc(nrm.astype(np.float32), 5126, "VEC3", 34962),
                         TEXCOORD_0=acc(tx, 5126, "VEC2", 34962), JOINTS_0=acc(jn, 5123, "VEC4", 34962), WEIGHTS_0=acc(wt, 5126, "VEC4", 34962))
    prim = G.Primitive(attributes=attrs, indices=acc(ind, 5125, "SCALAR", 34963), material=matid[mat])
    gl.meshes.append(G.Mesh(name=name, primitives=[prim]))
    gl.nodes.append(G.Node(name=name, mesh=len(gl.meshes) - 1, skin=0)); mesh_nodes.append(len(gl.nodes) - 1)

top = G.Node(name="Boy" if KIND == "boy" else "Girl", children=[first_bone + bidx[r] for r in roots] + mesh_nodes)
gl.nodes.append(top)
gl.scenes.append(G.Scene(nodes=[len(gl.nodes) - 1])); gl.scene = 0
gl.buffers.append(G.Buffer(byteLength=len(blob)))
gl.set_binary_blob(bytes(blob))
gl.save_binary(OUT)
allpos = np.concatenate([m[1] for m in MESHES])
print(OUT, f"{os.path.getsize(OUT)/1048576:.1f} MB", "height %.2f m" % (allpos[:, 1].max() - allpos[:, 1].min()),
      "bones", len(order), "tris", sum(len(m[3]) // 3 for m in MESHES))
