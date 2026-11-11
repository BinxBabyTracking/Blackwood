import sys, numpy as np, pygltflib as G, trimesh
from PIL import Image
import io
src, out = sys.argv[1], sys.argv[2]
g = G.GLTF2().load_binary(src); blob = g.binary_blob()
def arr(i):
    a = g.accessors[i]; bv = g.bufferViews[a.bufferView]
    dt = {5126: np.float32, 5123: np.uint16, 5125: np.uint32}[a.componentType]
    n = {"SCALAR": 1, "VEC2": 2, "VEC3": 3, "VEC4": 4, "MAT4": 16}[a.type]
    return np.frombuffer(blob, dtype=dt, count=a.count * n, offset=bv.byteOffset + (a.byteOffset or 0)).reshape(a.count, n)
def q2m(q):
    x, y, z, w = q
    return np.array([[1-2*(y*y+z*z), 2*(x*y-z*w), 2*(x*z+y*w)], [2*(x*y+z*w), 1-2*(x*x+z*z), 2*(y*z-x*w)], [2*(x*z-y*w), 2*(y*z+x*w), 1-2*(x*x+y*y)]])
def axis_angle(ax, deg):
    ax = np.array(ax, float); ax /= np.linalg.norm(ax); a = np.radians(deg) / 2
    return np.array([*(ax * np.sin(a)), np.cos(a)])
def qmul(a, b):
    x1, y1, z1, w1 = a; x2, y2, z2, w2 = b
    return np.array([w1*x2+x1*w2+y1*z2-z1*y2, w1*y2-x1*z2+y1*w2+z1*x2, w1*z2+x1*y2-y1*x2+z1*w2, w1*w2-x1*x2-y1*y2-z1*z2])
# pose: local rotations (bone local frame: +Y along the bone)
POSE = {"upperarm01.L": ("z", -55), "upperarm01.R": ("z", 55), "lowerarm01.L": ("x", 60), "upperleg01.R": ("x", -35), "lowerleg01.R": ("x", 60), "head": ("x", 15), "spine02": ("y", 20)}
names = {i: n.name for i, n in enumerate(g.nodes)}
local = {}
for i, n in enumerate(g.nodes):
    q = np.array(n.rotation or [0, 0, 0, 1], float)
    if n.name in POSE:
        ax, d = POSE[n.name]; q = qmul(q, axis_angle({"x": [1, 0, 0], "y": [0, 1, 0], "z": [0, 0, 1]}[ax], d))
    M = np.eye(4); M[:3, :3] = q2m(q); M[:3, 3] = n.translation or [0, 0, 0]; local[i] = M
parent = {}
for i, n in enumerate(g.nodes):
    for c in n.children or []: parent[c] = i
world = {}
def W(i):
    if i not in world: world[i] = (W(parent[i]) if i in parent else np.eye(4)) @ local[i]
    return world[i]
skin = g.skins[0]; ibm = arr(skin.inverseBindMatrices).reshape(-1, 4, 4).transpose(0, 2, 1)
J = np.array([W(j) @ ibm[k] for k, j in enumerate(skin.joints)])
sc = trimesh.Scene()
for node in g.nodes:
    if node.mesh is None: continue
    prim = g.meshes[node.mesh].primitives[0]
    P = arr(prim.attributes.POSITION).astype(float); jn = arr(prim.attributes.JOINTS_0); wt = arr(prim.attributes.WEIGHTS_0)
    Ph = np.c_[P, np.ones(len(P))]
    out_p = np.zeros_like(P)
    for k in range(4):
        out_p += wt[:, k:k+1] * np.einsum("nij,nj->ni", J[jn[:, k]], Ph)[:, :3]
    F = arr(prim.indices).reshape(-1, 3)
    mat = g.materials[prim.material]
    col = [200, 200, 200, 255]
    sc.add_geometry(trimesh.Trimesh(out_p, F, process=False, face_colors=None), node_name=node.name)
sc.export(out)
