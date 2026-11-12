"""
Juniper's face, done properly in Blender:
  - a real jaw bone (child of the head) with weights taken from the old jaw shape and smoothed over the mesh,
  - teeth (upper on the head, lower on the jaw) and a tongue (on the jaw) inside the mouth,
  - mouth shapes rebuilt with the bone: jaw hinging open in an arc, plus distinct lip shapes,
  - brow raise and frown.
Morph names stay the same as before, so the website keeps working; the jaw bone is there for the game too.
Run: python3 build.py   (Blender as a Python module)
"""
import bpy, bmesh, numpy as np, mathutils, math, sys

SRC = "/tmp/chars/juniper/out.glb"
OUT = "/tmp/juniper/Juniper_face.glb"
Y0, HW, K = 0.645, 0.036, 1.5            # lip line height, half width, smile curve (from the face pass)
EYES = [(-0.054, 0.704), (0.05, 0.704)]   # (x, height)

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=SRC)
for o in list(bpy.data.objects):
    if o.name.startswith("Icosphere"):
        bpy.data.objects.remove(o)
face = bpy.data.objects["Juniper"]
cup = bpy.data.objects["MouthInside"]
arm = bpy.data.objects["root"]

def ss(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)

def keys_world(o):
    R = np.array(o.matrix_world)[:3, :3]
    t = np.array(o.matrix_world)[:3, 3]
    kb = o.data.shape_keys.key_blocks
    B = np.array([v.co for v in kb["Basis"].data])
    out = {k.name: (np.array([v.co for v in k.data]) - B) @ R.T for k in kb if k.name != "Basis"}
    return B @ R.T + t, out, R

FW, FK, R = keys_world(face)
CW, CK, _ = keys_world(cup)
x, y, z = FW[:, 0], FW[:, 1], FW[:, 2]
zc = Y0 + K * x ** 2
front = np.where((np.abs(x) < 0.008) & (np.abs(z - Y0) < 0.008))[0]
yf = float(y[front].min())  # front of the lips

# Head joint and the hinge (as the face pass used it).
hb = arm.data.bones["head"]
head_w = np.array(arm.matrix_world @ hb.head_local)
pivot = np.array([0.0, head_w[1], Y0 + 0.033])

# ---- 1. jaw weights from the old jaw shape (it was a 13 degree turn about the hinge)
def jaw_weight(P, D):
    r = np.hypot(P[:, 1] - pivot[1], P[:, 2] - pivot[2])
    return np.clip(np.linalg.norm(D, axis=1) / np.maximum(r * math.radians(13), 1e-6), 0, 1)

wf = jaw_weight(FW, FK["jawOpen"]) * (1 - 0.55 * ss(HW * 0.65, HW * 1.3, np.abs(FW[:, 0])))
wc = jaw_weight(CW, CK["jawOpen"])
print("jaw weights: face verts moving", int((wf > 0.01).sum()), "cup", int((wc > 0.01).sum()))

# ---- 2. the jaw bone
bpy.context.view_layer.objects.active = arm
arm.select_set(True)
bpy.ops.object.mode_set(mode="EDIT")
ai = np.array(arm.matrix_world.inverted())
toA = lambda p: mathutils.Vector((ai @ np.append(p, 1))[:3])
eb = arm.data.edit_bones.new("jaw")
eb.head = toA(pivot)
eb.tail = toA(pivot + np.array([0, -0.045, -0.03]))
eb.parent = arm.data.edit_bones["head"]
eb.use_deform = True
bpy.ops.object.mode_set(mode="OBJECT")

def set_jaw_group(o, w):
    g = o.vertex_groups.get("jaw") or o.vertex_groups.new(name="jaw")
    names = {vg.index: vg.name for vg in o.vertex_groups}
    for v in o.data.vertices:
        wj = float(w[v.index])
        if wj <= 1e-4:
            continue
        for ge in v.groups:
            if names[ge.group] != "jaw":
                ge.weight *= 1 - wj
        g.add([v.index], wj, "REPLACE")
    return g

set_jaw_group(face, wf)
set_jaw_group(cup, wc)
# Smooth the jaw's reach over the skin (not across the lip cut), keeping the lower lip fully on the jaw.
bpy.ops.object.select_all(action="DESELECT")
face.select_set(True)
bpy.context.view_layer.objects.active = face
face.vertex_groups.active_index = face.vertex_groups["jaw"].index
bpy.ops.object.mode_set(mode="WEIGHT_PAINT")
bpy.ops.object.vertex_group_smooth(group_select_mode="ACTIVE", factor=0.6, repeat=10)
bpy.ops.object.mode_set(mode="OBJECT")
gj = face.vertex_groups["jaw"].index
names = {vg.index: vg.name for vg in face.vertex_groups}
upper = (z > zc + 0.0005) & (np.abs(x) < HW + 0.01) & (wf < 0.02)
for v in face.data.vertices:
    i = v.index
    wj = next((ge.weight for ge in v.groups if ge.group == gj), 0.0)
    if wf[i] > 0.95:
        wj = max(wj, 0.97)
    # Only the chin and lower face: never the collar, neck or hair.
    if wf[i] < 0.001 and not (abs(x[i]) < 0.052 and zc[i] - 0.055 < z[i] < zc[i] and y[i] < yf + 0.05):
        wj = 0.0
    if upper[i]:
        wj = 0.0
    # The rest of the weights fill what the jaw leaves.
    others = [ge for ge in v.groups if ge.group != gj]
    tot = sum(ge.weight for ge in others)
    if tot > 0:
        for ge in others:
            ge.weight = ge.weight / tot * (1 - wj)
    if wj > 0:
        face.vertex_groups["jaw"].add([i], wj, "REPLACE")
    elif any(ge.group == gj for ge in v.groups):
        face.vertex_groups["jaw"].remove([i])

# ---- 3. teeth and tongue
print("lip front y", round(yf, 4))

def strip(name, x0, x1, top, bot, depth, n=18):
    bm = bmesh.new()
    rows = []
    for i in range(n + 1):
        xx = x0 + (x1 - x0) * i / n
        yt = yf + 0.0095 + 6.0 * xx * xx
        ring = [bm.verts.new((xx, yt, top(xx))), bm.verts.new((xx, yt, bot(xx))), bm.verts.new((xx, yt + depth, bot(xx))), bm.verts.new((xx, yt + depth, top(xx)))]
        rows.append(ring)
    for a, b in zip(rows, rows[1:]):
        for k in range(4):
            bm.faces.new((a[k], b[k], b[(k + 1) % 4], a[(k + 1) % 4]))
    bm.faces.new(rows[0][::-1])
    bm.faces.new(rows[-1])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    for p in me.polygons:
        p.use_smooth = True
    o = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(o)
    return o

def mat(name, rgb, rough):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*rgb, 1)
    bsdf.inputs["Roughness"].default_value = rough
    return m

teethM = mat("teeth", (0.92, 0.88, 0.80), 0.35)
tongueM = mat("tongue", (0.70, 0.26, 0.30), 0.55)
tw = HW * 0.7
up_t = strip("TeethUpper", -tw, tw, lambda xx: Y0 + K * xx * xx + 0.003, lambda xx: Y0 + K * xx * xx - 0.0032, 0.004)
lo_t = strip("TeethLower", -tw * 0.9, tw * 0.9, lambda xx: Y0 + K * xx * xx - 0.0038, lambda xx: Y0 + K * xx * xx - 0.0085, 0.004)
up_t.data.materials.append(teethM)
lo_t.data.materials.append(teethM)
bpy.ops.mesh.primitive_uv_sphere_add(segments=20, ring_count=10, radius=1, location=(0, yf + 0.02, Y0 - 0.0085))
tongue = bpy.context.active_object
tongue.name = "Tongue"
tongue.scale = (HW * 0.62, 0.02, 0.0055)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
tongue.data.materials.append(tongueM)
for p in tongue.data.polygons:
    p.use_smooth = True


# ---- 3b. eyelids: a lid in her skin tone for each eye, folded to a line at rest, closing over the eye to blink
img = next((n.image for m in face.data.materials for n in m.node_tree.nodes if n.type == "TEX_IMAGE" and n.image), None)
uvl = face.data.uv_layers.active.data
vert_uv = np.zeros((len(face.data.vertices), 2))
for li, l in enumerate(face.data.loops):
    vert_uv[l.vertex_index] = uvl[li].uv
px = np.array(img.pixels[:]).reshape(img.size[1], img.size[0], 4) if img else None
def skin_at(i):
    if px is None:
        return (0.78, 0.52, 0.40)
    u, v = vert_uv[i]
    c = px[int(np.clip(v, 0, 0.999) * img.size[1]), int(np.clip(u % 1, 0, 0.999) * img.size[0])]
    return tuple(c[:3])
ER = 0.03
lid_objs = []
for n_eye, (ex, ez) in enumerate(EYES):
    # Lid skin colour: just above the eye.
    cand = np.where((np.abs(x - ex) < 0.006) & (np.abs(z - (ez + ER * 0.95)) < 0.004) & (y < yf + 0.06))[0]
    col = np.mean([skin_at(i) for i in cand], axis=0) if len(cand) else np.array((0.78, 0.52, 0.4))
    def surf(px_, pz_):
        d = np.hypot(x - px_, z - pz_)
        near = np.where((d < 0.011) & (y < yf + 0.07))[0]
        return float(y[near].min()) if len(near) else None
    NU, NV = 14, 7
    rw, rh = ER * 0.95, ER * 0.85
    top = []
    grid = []
    for j in range(NV + 1):
        row = []
        for i in range(NU + 1):
            u = -1 + 2 * i / NU
            xx = ex + u * rw
            # The lid's edge runs from the top of the eye (v=0) to a little below its middle (v=1).
            zt = ez + rh * math.sqrt(max(0.0, 1 - u * u)) * 0.95
            zb = ez - rh * 0.92 * math.sqrt(max(0.0, 1 - u * u))
            zz = zt + (zb - zt) * (j / NV)
            sy = surf(xx, zz)
            vv = (zz - ez) / rh
            # Clear of the eye's bulge, across and down.
            row.append((xx, (sy if sy is not None else yf) - 0.0022 - 0.0025 * max(0.0, 1 - u * u - vv * vv * 0.6), zz))
        grid.append(row)
    bm = bmesh.new()
    cl = bm.loops.layers.color.new("Col")
    V = [[bm.verts.new(p) for p in row] for row in grid]
    for j in range(NV):
        for i in range(NU):
            f = bm.faces.new((V[j][i], V[j + 1][i], V[j + 1][i + 1], V[j][i + 1]))
            for lp in f.loops:
                jj = next(r for r in range(NV + 1) if lp.vert in V[r])
                dark = 0.12 if jj >= NV - 1 else 1.0
                lp[cl] = (col[0] * dark, col[1] * dark, col[2] * dark, 1)
    # Faces toward the front, where the light and the camera are.
    for f in bm.faces:
        f.normal_update()
        if f.normal.y > 0:
            f.normal_flip()
    me = bpy.data.meshes.new(f"Eyelid{n_eye}")
    bm.to_mesh(me)
    bm.free()
    for p_ in me.polygons:
        p_.use_smooth = True
    o = bpy.data.objects.new(f"Eyelid{n_eye}", me)
    bpy.context.scene.collection.objects.link(o)
    lm = bpy.data.materials.new(f"lid{n_eye}")
    lm.use_nodes = True
    nt = lm.node_tree
    at = nt.nodes.new("ShaderNodeVertexColor")
    at.layer_name = "Col"
    nt.links.new(at.outputs["Color"], nt.nodes["Principled BSDF"].inputs["Base Color"])
    nt.nodes["Principled BSDF"].inputs["Roughness"].default_value = 0.6
    me.materials.append(lm)
    # At rest every row folds up onto the top edge: a thin line along the lash line.
    full = np.array([v.co for v in me.vertices])
    rest = full.copy()
    for j in range(NV + 1):
        for i in range(NU + 1):
            rest[j * (NU + 1) + i] = full[i] + (full[j * (NU + 1) + i] - full[i]) * 0.0 + np.array([0, 0.0004 * j, 0])
    me.vertices.foreach_set("co", rest.astype(np.float32).ravel())
    o.shape_key_add(name="Basis", from_mix=False)
    kb = o.shape_key_add(name="blink", from_mix=False)
    kb.data.foreach_set("co", full.astype(np.float32).ravel())
    lid_objs.append(o)

# Bind them: upper teeth to the head, lower teeth and tongue to the jaw.
for o, bone in [(up_t, "head"), (lo_t, "jaw"), (tongue, "jaw")] + [(l, "head") for l in lid_objs]:
    mw = o.matrix_world.copy()
    o.parent = arm
    o.matrix_world = mw
    g = o.vertex_groups.new(name=bone)
    g.add([v.index for v in o.data.vertices], 1.0, "REPLACE")
    md = o.modifiers.new("Armature", "ARMATURE")
    md.object = arm

# ---- 4. shapes: the jaw turned by the bone, plus lip shapes
pb = arm.pose.bones["jaw"]
rest = arm.data.bones["jaw"].matrix_local.copy()
axis_a = (arm.matrix_world.inverted().to_3x3() @ mathutils.Vector((1, 0, 0))).normalized()
headA = arm.data.bones["jaw"].head_local.copy()
meshes = [face, cup, lo_t, tongue]

def jaw_deltas(deg):
    """Every mesh's vertices with the jaw turned, minus at rest (mesh-local)."""
    out = {}
    for o in meshes:
        if o.data.shape_keys:
            for k in o.data.shape_keys.key_blocks:
                k.value = 0
    pb.matrix_basis = mathutils.Matrix.Identity(4)
    bpy.context.view_layer.update()
    dg = bpy.context.evaluated_depsgraph_get()
    base = {o.name: np.array([v.co for v in o.evaluated_get(dg).data.vertices]) for o in meshes}
    q = mathutils.Matrix.Rotation(math.radians(deg), 4, axis_a)
    pb.matrix = mathutils.Matrix.Translation(headA) @ q @ mathutils.Matrix.Translation(-headA) @ rest
    bpy.context.view_layer.update()
    dg = bpy.context.evaluated_depsgraph_get()
    for o in meshes:
        out[o.name] = np.array([v.co for v in o.evaluated_get(dg).data.vertices]) - base[o.name]
    pb.matrix_basis = mathutils.Matrix.Identity(4)
    bpy.context.view_layer.update()
    return out

Rinv = R.T
toLocal = lambda Dw: Dw @ Rinv.T  # world delta -> face-mesh local delta

# Lip shapes from the old keys, with their old jaw part taken out.
old_deg = {"mouth_slight": 4, "mouth_ah": 13, "mouth_ee": 5, "mouth_oh": 10, "mouth_oo": 5, "mouth_f": 2, "mouth_closed": 0}
lip = {k: FK[k] - FK["jawOpen"] * (d / 13) for k, d in old_deg.items()}
# Lip bands (world): just above and just below the cut, at the mouth.
near_mouth = ss(HW + 0.02, HW + 0.004, np.abs(x)) * ss(yf + 0.02, yf + 0.008, y)
up_lip = near_mouth * ss(zc + 0.014, zc + 0.006, z) * ss(zc - 0.0005, zc + 0.0015, z)
lo_lip = near_mouth * ss(zc - 0.014, zc - 0.006, z) * ss(zc + 0.0005, zc - 0.0015, z)
def vec(D0=0, D1=0, D2=0, w=None):
    D = np.zeros_like(FW)
    D[:, 0], D[:, 1], D[:, 2] = D0 * w, D1 * w, D2 * w
    return D
# Brows: the skin just above each eye.
def brow_band(ex, ez):
    return ss(0.034, 0.018, np.abs(x - ex)) * ss(ez + 0.012, ez + 0.022, z) * ss(ez + 0.05, ez + 0.038, z) * ss(yf + 0.05, yf + 0.03, y)
brows = sum(brow_band(ex, ez) for ex, ez in EYES)
inner = sum(brow_band(ex, ez) * ss(0.03, 0.005, np.abs(x)) for ex, ez in EYES)

plan = {
    #             jaw deg, lip gain, extra (world)
    "mouth_slight": (6, 1.0, vec(D2=0.0008, w=up_lip)),
    "mouth_ah": (18, 1.0, vec(D2=0.003, w=up_lip)),
    "mouth_ee": (3, 1.5, vec(D2=0.0028, w=up_lip) + vec(D2=-0.0025, w=lo_lip)),
    "mouth_oh": (13, 1.3, vec(D1=-0.002, w=up_lip + lo_lip)),
    "mouth_oo": (7, 1.45, vec(D1=-0.003, w=up_lip + lo_lip)),
    "mouth_f": (3, 0.0, vec(D1=0.0035, D2=0.0032, w=lo_lip) + vec(D2=0.001, w=up_lip)),
    "mouth_closed": (0, 0.0, vec(D2=-0.0012, D1=0.0008, w=up_lip) + vec(D2=0.0012, D1=0.0008, w=lo_lip)),
    "jawOpen": (18, 0.0, 0),
}
jaws = {d: jaw_deltas(d) for d in sorted({v[0] for v in plan.values()})}

def set_key(o, name, delta_local):
    kb = o.data.shape_keys.key_blocks if o.data.shape_keys else None
    if kb is None:
        o.shape_key_add(name="Basis", from_mix=False)
        kb = o.data.shape_keys.key_blocks
    k = kb.get(name) or o.shape_key_add(name=name, from_mix=False)
    base = np.array([v.co for v in kb["Basis"].data])
    flat = (base + delta_local).astype(np.float32).ravel()
    k.data.foreach_set("co", flat)

for name, (deg, gain, extra) in plan.items():
    jd = jaws[deg]
    lipw = lip.get(name, np.zeros_like(FW)) * gain
    set_key(face, name, jd["Juniper"] + toLocal(lipw + (extra if not isinstance(extra, int) else 0)))
    set_key(cup, name, jd["MouthInside"])
    set_key(lo_t, name, jd["TeethLower"])
    set_key(tongue, name, jd["Tongue"])
set_key(face, "blink", np.zeros_like(FW))
set_key(face, "browUp", toLocal(vec(D2=0.009, w=brows)))
set_key(face, "browDown", toLocal(vec(D2=-0.005, w=brows) + vec(D2=-0.004, w=inner) + vec(D0=-np.sign(x) * 0.002, w=inner)))
# Keep the other meshes' key lists in step (three.js drives morphs by name on each mesh).
for o in [cup, lo_t, tongue, up_t] + lid_objs:
    for name in list(plan) + ["smile", "blink", "browUp", "browDown"]:
        if not o.data.shape_keys or name not in o.data.shape_keys.key_blocks:
            set_key(o, name, np.zeros((len(o.data.vertices), 3)))

# ---- 5. write
bpy.ops.object.select_all(action="SELECT")
bpy.ops.export_scene.gltf(filepath=OUT, export_format="GLB", export_morph=True, export_morph_normal=False, export_skins=True, export_animations=False, export_yup=True)
bpy.ops.wm.save_as_mainfile(filepath="/tmp/juniper/Juniper_face.blend")
print("WROTE", OUT)
