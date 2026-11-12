import bpy, mathutils, sys
bpy.ops.wm.open_mainfile(filepath="/tmp/juniper/Juniper_face.blend")
sc = bpy.context.scene
sc.render.engine = "BLENDER_EEVEE"
sc.render.resolution_x = sc.render.resolution_y = 340
sc.eevee.taa_render_samples = 8
w = bpy.data.worlds.new("w"); w.use_nodes = True; w.node_tree.nodes["Background"].inputs[1].default_value = 1.0; sc.world = w
ld = bpy.data.lights.new("k", "SUN"); ld.energy = 3; lo = bpy.data.objects.new("k", ld); lo.rotation_euler = (1.0, 0, 0.4); sc.collection.objects.link(lo)
cam = bpy.data.cameras.new("c"); cam.lens = 100; co = bpy.data.objects.new("c", cam); sc.collection.objects.link(co); sc.camera = co
tgt = mathutils.Vector((0.0, -0.12, 0.66))
view = "three" if "three" in sys.argv else "front"
off = mathutils.Vector((0, -1, 0.05)) if view == "front" else mathutils.Vector((0.6, -0.85, 0.05))
co.location = tgt + off.normalized() * 0.55
co.rotation_euler = (tgt - co.location).to_track_quat("-Z", "Y").to_euler()
meshes = [o for o in bpy.data.objects if o.type == "MESH" and o.data.shape_keys]
names = sys.argv[sys.argv.index("--")+1].split(",") if "--" in sys.argv else ["Basis"]
for n in names:
    for o in meshes:
        for k in o.data.shape_keys.key_blocks:
            k.value = 1.0 if k.name == n else 0.0
    sc.render.filepath = f"/tmp/juniper/s_{view}_{n}.png"
    bpy.ops.render.render(write_still=True)
print("DONE")
