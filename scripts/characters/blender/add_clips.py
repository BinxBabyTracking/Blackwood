# Copies the animation clips (walk, sit, agree...) from a Tripo export onto a face-rigged character.
# Usage: python3 add_clips.py -- <face_rigged.glb> <tripo_with_clips.glb> <out.glb>
# Bone names must match; the face rig may add jaw bones and drop Tripo's root bone.
import bpy, sys
face, anim, out = sys.argv[sys.argv.index('--')+1:]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=face)
farm = next(o for o in bpy.context.scene.objects if o.type == 'ARMATURE')
keep = set(bpy.context.scene.objects)
before = set(bpy.data.actions)
bpy.ops.import_scene.gltf(filepath=anim)
aarm = next(o for o in bpy.context.scene.objects if o.type == 'ARMATURE' and o not in keep)
acts = [a for a in bpy.data.actions if a not in before]
print('actions', [a.name for a in acts])
fb = set(b.name for b in farm.data.bones); ab = set(b.name for b in aarm.data.bones)
print('missing in face', ab - fb, 'extra in face', fb - ab)
# rest-pose check on shared bones
import mathutils
worst = 0
for n in fb & ab:
    d = (farm.data.bones[n].matrix_local.translation - aarm.data.bones[n].matrix_local.translation).length
    worst = max(worst, d)
print('worst rest offset', worst)
for o in [o for o in bpy.context.scene.objects if o not in keep]:
    bpy.data.objects.remove(o, do_unlink=True)
farm.animation_data_create()
for a in acts:
    a.name = a.name.split('|')[-1].split('.')[0] if '|' in a.name else a.name
    a.use_fake_user = True
    tr = farm.animation_data.nla_tracks.new(); tr.name = a.name
    st = tr.strips.new(a.name, int(a.frame_range[0]), a)
    if hasattr(a, 'slots') and a.slots: st.action_slot = a.slots[0]
farm.animation_data.action = None
bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', export_animations=True, export_animation_mode='NLA_TRACKS', export_morph=True, export_skins=True)
