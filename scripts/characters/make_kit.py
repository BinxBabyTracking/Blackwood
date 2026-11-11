#!/usr/bin/env python3
"""
Makes the skinning kit for a base character GLB: the paintable pieces (Body, Outfit, Shoes, Hair) posed like the
character views on Admin (standing, arms hanging a little away from the sides), with per-vertex visibility from
the front, the back and the sides, and the model's silhouette per view. The server projects a person's front,
side and back pictures through it onto each piece's texture (src/lib/skinning.ts).

Usage: make_kit.py base.glb out.kit
Kit layout: "BWKIT1", uint32 header length, JSON header, then per piece: positions float32[n*3] (meters, turn pose),
uvs float32[n*2], visibility uint8[n*3] (front, back, side), indices uint32[t*3]; each block 4-byte aligned.
"""
import json, struct, sys
import numpy as np
import pygltflib as G

SRC, OUT = sys.argv[1], sys.argv[2]
g = G.GLTF2().load_binary(SRC); blob = g.binary_blob()

def arr(i):
    a = g.accessors[i]; bv = g.bufferViews[a.bufferView]
    dt = {5126: np.float32, 5123: np.uint16, 5125: np.uint32}[a.componentType]
    n = {"SCALAR": 1, "VEC2": 2, "VEC3": 3, "VEC4": 4, "MAT4": 16}[a.type]
    return np.frombuffer(blob, dtype=dt, count=a.count * n, offset=bv.byteOffset + (a.byteOffset or 0)).reshape(a.count, n)

def q2m(q):
    x, y, z, w = q
    return np.array([[1-2*(y*y+z*z), 2*(x*y-z*w), 2*(x*z+y*w)], [2*(x*y+z*w), 1-2*(x*x+z*z), 2*(y*z-x*w)], [2*(x*z-y*w), 2*(y*z+x*w), 1-2*(x*x+y*y)]])
def aa(ax, deg):
    ax = np.array(ax, float); a = np.radians(deg) / 2; return np.array([*(ax * np.sin(a)), np.cos(a)])
def qmul(a, b):
    x1, y1, z1, w1 = a; x2, y2, z2, w2 = b
    return np.array([w1*x2+x1*w2+y1*z2-z1*y2, w1*y2-x1*z2+y1*w2+z1*x2, w1*z2+x1*y2-y1*x2+z1*w2, w1*w2-x1*x2-y1*y2-z1*z2])

# The views' pose: arms lowered from the A-pose to hang a little away from the sides.
POSE = {"upperarm01.L": ([0, 0, 1], -38), "upperarm01.R": ([0, 0, 1], 38)}
local = {}
for i, n in enumerate(g.nodes):
    q = np.array(n.rotation or [0, 0, 0, 1], float)
    if n.name in POSE: q = qmul(q, aa(*POSE[n.name]))
    M = np.eye(4); M[:3, :3] = q2m(q); M[:3, 3] = n.translation or [0, 0, 0]; local[i] = M
parent = {c: i for i, n in enumerate(g.nodes) for c in (n.children or [])}
world = {}
def W(i):
    if i not in world: world[i] = (W(parent[i]) if i in parent else np.eye(4)) @ local[i]
    return world[i]
skin = g.skins[0]
ibm = arr(skin.inverseBindMatrices).reshape(-1, 4, 4).transpose(0, 2, 1)
J = np.array([W(j) @ ibm[k] for k, j in enumerate(skin.joints)])

meshes = {}
for node in g.nodes:
    if node.mesh is None: continue
    prim = g.meshes[node.mesh].primitives[0]
    P = arr(prim.attributes.POSITION).astype(float); jn = arr(prim.attributes.JOINTS_0); wt = arr(prim.attributes.WEIGHTS_0)
    Ph = np.c_[P, np.ones(len(P))]; out = np.zeros_like(P)
    for k in range(4): out += wt[:, k:k+1] * np.einsum("nij,nj->ni", J[jn[:, k]], Ph)[:, :3]
    meshes[node.name] = dict(pos=out, uv=arr(prim.attributes.TEXCOORD_0).astype(np.float32), ind=arr(prim.indices).reshape(-1, 3).astype(np.uint32),
                             mat=g.materials[prim.material].name)
allpos = np.concatenate([m["pos"] for m in meshes.values()])
lo, hi = allpos.min(0), allpos.max(0)
H = hi[1] - lo[1]
RES = 900  # depth buffer rows over the model's height
px = H / RES

# Views: name -> (axis used for image x, its sign so that image x grows to the right, depth axis, depth sign toward camera)
VIEWS = {
    "front": (0, +1, 2, +1),   # camera at +Z: image right = +X
    "back": (0, -1, 2, -1),    # camera at -Z: image right = -X
    "left": (2, -1, 0, +1),    # camera at +X (the character's left side): image right = -Z, the face points left
    "right": (2, +1, 0, -1),   # camera at -X: image right = +Z
}

def raster_depth(view):
    xa, xs, da, ds = VIEWS[view]
    W_ = int(np.ceil((hi[xa] - lo[xa]) / px)) + 2
    depth = np.full((RES + 2, W_), -np.inf)
    for m in meshes.values():
        p = m["pos"]
        X = (p[:, xa] * xs - (lo[xa] if xs > 0 else -hi[xa])) / px
        Y = (hi[1] - p[:, 1]) / px
        Z = p[:, da] * ds
        for a, b, c in m["ind"]:
            xs_ = (X[a], X[b], X[c]); ys_ = (Y[a], Y[b], Y[c])
            x0, x1 = int(max(min(xs_), 0)), int(min(max(xs_), W_ - 1)) + 1
            y0, y1 = int(max(min(ys_), 0)), int(min(max(ys_), RES + 1)) + 1
            if x1 <= x0 or y1 <= y0: continue
            gx, gy = np.meshgrid(np.arange(x0, x1) + 0.5, np.arange(y0, y1) + 0.5)
            d = (ys_[1] - ys_[2]) * (xs_[0] - xs_[2]) + (xs_[2] - xs_[1]) * (ys_[0] - ys_[2])
            if abs(d) < 1e-12: continue
            l0 = ((ys_[1] - ys_[2]) * (gx - xs_[2]) + (xs_[2] - xs_[1]) * (gy - ys_[2])) / d
            l1 = ((ys_[2] - ys_[0]) * (gx - xs_[2]) + (xs_[0] - xs_[2]) * (gy - ys_[2])) / d
            l2 = 1 - l0 - l1
            inside = (l0 >= -1e-6) & (l1 >= -1e-6) & (l2 >= -1e-6)
            if not inside.any(): continue
            z = l0 * Z[a] + l1 * Z[b] + l2 * Z[c]
            sub = depth[y0:y1, x0:x1]
            np.maximum(sub, np.where(inside, z, -np.inf), out=sub)
    return depth

def normals(m):
    p, ind = m["pos"], m["ind"].astype(np.int64)
    n = np.zeros_like(p); fn = np.cross(p[ind[:, 1]] - p[ind[:, 0]], p[ind[:, 2]] - p[ind[:, 0]])
    for c in range(3): np.add.at(n, ind[:, c], fn)
    return n / np.maximum(np.linalg.norm(n, axis=1, keepdims=True), 1e-12)

header = {"base": SRC.split("/")[-1], "height": float(H), "min": lo.tolist(), "max": hi.tolist(), "rows": RES, "views": {}, "pieces": []}
vis = {}
for view in VIEWS:
    xa, xs, da, ds = VIEWS[view]
    depth = raster_depth(view)
    cover = np.isfinite(depth)
    left = np.full(RES, -1.0); right = np.full(RES, -1.0)
    for r in range(RES):
        cols = np.nonzero(cover[r])[0]
        if len(cols): left[r] = cols[0] * px; right[r] = (cols[-1] + 1) * px
    header["views"][view] = {"left": [round(x, 5) for x in left], "right": [round(x, 5) for x in right]}
    vis[view] = {}
    dirv = np.zeros(3); dirv[da] = ds
    for name, m in meshes.items():
        p = m["pos"]; n = normals(m)
        X = ((p[:, xa] * xs - (lo[xa] if xs > 0 else -hi[xa])) / px).astype(int).clip(0, depth.shape[1] - 1)
        Y = ((hi[1] - p[:, 1]) / px).astype(int).clip(0, RES + 1)
        z = p[:, da] * ds
        seen = z >= depth[Y, X] - 0.012
        facing = np.clip(n @ dirv, 0, 1)
        vis[view][name] = np.where(seen, facing ** 1.5, 0.0)
    print(view, "done")

# Neck: the narrowest row between the top 8% and 35% of the height, front view (where the neck is in the views too).
fl, fr = np.array(header["views"]["front"]["left"]), np.array(header["views"]["front"]["right"])
w = np.where(fl >= 0, fr - fl, 1e9)
r0, r1 = int(RES * 0.08), int(RES * 0.35)
header["neckRow"] = int(r0 + np.argmin(w[r0:r1]))

chunks = []
off = 0
def put(b):
    global off
    pad = (-len(b)) % 4
    chunks.append(b + b"\0" * pad); o = off; off += len(b) + pad; return o
for name in ["Body", "Outfit", "Shoes", "Hair"]:
    if name not in meshes: continue
    m = meshes[name]
    v = np.stack([vis["front"][name], vis["back"][name], np.maximum(vis["left"][name], vis["right"][name])], 1)
    piece = {"name": name, "material": m["mat"], "size": 1024 if name in ("Body", "Outfit") else 512, "count": int(len(m["pos"])), "tris": int(len(m["ind"]))}
    piece["pos"] = put(m["pos"].astype(np.float32).tobytes())
    piece["uv"] = put(m["uv"].astype(np.float32).tobytes())
    piece["vis"] = put((v * 255).round().astype(np.uint8).tobytes())
    piece["ind"] = put(m["ind"].astype(np.uint32).tobytes())
    header["pieces"].append(piece)
hj = json.dumps(header, separators=(",", ":")).encode()
hj += b" " * ((-len(hj)) % 4)
with open(OUT, "wb") as f:
    f.write(b"BWKIT1\0\0" + struct.pack("<I", len(hj)) + hj + b"".join(chunks))
print(OUT, sum(len(c) for c in chunks) // 1024, "KB; neck row", header["neckRow"])
