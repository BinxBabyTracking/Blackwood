class_name RoomBuilder
extends RefCounted
## Builds a walkable place from the same data the website uses (exported to godot/data/*.json by
## scripts/godot/export-room.mjs): box rooms with walls from flat paintings, Meshy furniture and
## people, and all the lighting in code. Coordinates match the website exactly (metres, Y up,
## each room's front wall toward -Z).

const SUN := {
	"day": {"az": 15.0, "el": 48.0, "color": Color("fff0d8"), "energy": 2.4},
	"night": {"az": 22.0, "el": 8.0, "color": Color("ffcf8a"), "energy": 0.9},
}
const SKY := {
	"day": {"sky": Color("fff4e6"), "ground": Color("8a6a50"), "energy": 0.75},
	"night": {"sky": Color("5a6a99"), "ground": Color("2a2018"), "energy": 0.22},
}
const LIGHT_COLOR := Color("ffd29a")
const PERSON_SHADER := preload("res://scripts/person.gdshader")
const OUTSIDE_SHADER := preload("res://scripts/outside.gdshader")

var root: Node3D
var data: Dictionary
var night := true
## Light id → { lights: [{ light, energy }], glow: [materials], ceil: [materials], on: bool }
var lights := {}
## Where you can't walk: furniture footprints (Rect2 in x/z).
var blockers: Array[Rect2] = []
## Where you can walk: each room's floor less a body's width from the walls, and the doorways.
var areas: Array[Rect2] = []
var rooms: Array = []
var wall_thickness := 0.15
## People standing here, by their talk hotspot id: { node, skeleton, bones, base, mesh, jaw, mouth_mat, rot_y, phase }.
var people := {}
## Things shown only while the case has their hotspot in the scene: [{ id, node }].
var show_if: Array = []
var _t := 0.0


func build(parent: Node3D, room_data: Dictionary) -> Node3D:
	data = room_data
	night = bool(data.get("startNight", false))
	root = Node3D.new()
	root.name = String(data.get("id", "place"))
	parent.add_child(root)
	wall_thickness = float(data.get("wall", 0.15))
	_environment()
	for r in data.get("rooms", []):
		_room(r)
	for p in data.get("passages", []):
		var along := String(p.get("along", "z"))
		var x: Array = p.x
		var z: Array = p.z
		if along == "x":
			areas.append(Rect2(float(x[0]), float(z[0]) + 0.28, float(x[1]) - float(x[0]), float(z[1]) - float(z[0]) - 0.56))
		else:
			areas.append(Rect2(float(x[0]) + 0.28, float(z[0]), float(x[1]) - float(x[0]) - 0.56, float(z[1]) - float(z[0])))
	for dc in data.get("decals", []):
		_decal(dc)
	for m in data.get("models", []):
		_model(m)
	for r in data.get("rooms", []):
		var l: Dictionary = r.get("light", {})
		if l.get("startOn", false):
			set_light(String(l.get("id", "")), true)
	return root


# ---------------------------------------------------------------- environment

func _environment() -> void:
	var k: Dictionary = SKY.night if night else SKY.day
	var env := Environment.new()
	env.background_mode = Environment.BG_COLOR
	env.background_color = Color.BLACK
	env.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	env.ambient_light_color = (k.sky as Color).lerp(k.ground, 0.45)
	env.ambient_light_energy = k.energy
	env.tonemap_mode = Environment.TONE_MAPPER_AGX
	env.tonemap_exposure = 1.15
	env.ssao_enabled = true
	env.ssao_radius = 0.6
	env.ssao_intensity = 1.6
	env.glow_enabled = true
	env.glow_intensity = 0.3
	env.glow_bloom = 0.03
	env.adjustment_enabled = true
	env.adjustment_saturation = 0.92
	env.adjustment_contrast = 1.05
	var we := WorldEnvironment.new()
	we.environment = env
	root.add_child(we)

	# Daylight, or at night the city's glow: low light from outside, through the windows.
	var s: Dictionary = SUN.night if night else SUN.day
	var sun := DirectionalLight3D.new()
	sun.name = "Sun"
	sun.light_color = s.color
	sun.light_energy = s.energy
	sun.shadow_enabled = true
	sun.shadow_bias = 0.02
	sun.shadow_normal_bias = 0.6
	sun.directional_shadow_mode = DirectionalLight3D.SHADOW_PARALLEL_2_SPLITS
	sun.directional_shadow_max_distance = 18.0
	var a := deg_to_rad(float(s.az))
	var e := deg_to_rad(float(s.el))
	var from := Vector3(sin(a) * cos(e), sin(e), -cos(a) * cos(e))
	root.add_child(sun)
	sun.look_at_from_position(from * 12.0, Vector3.ZERO, Vector3.UP)


# ---------------------------------------------------------------- walls, floors, ceilings

func _mat(tex_path: String, cutout := false, repeat := 1.0) -> StandardMaterial3D:
	var m := StandardMaterial3D.new()
	m.albedo_texture = load(tex_path)
	m.roughness = 0.95
	m.metallic = 0.0
	m.specular_mode = BaseMaterial3D.SPECULAR_DISABLED
	m.texture_filter = BaseMaterial3D.TEXTURE_FILTER_LINEAR_WITH_MIPMAPS_ANISOTROPIC
	m.cull_mode = BaseMaterial3D.CULL_DISABLED
	if cutout:
		m.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA_SCISSOR
		m.alpha_scissor_threshold = 0.5
	if repeat != 1.0:
		m.uv1_scale = Vector3(repeat, repeat, 1)
	return m


func _quad(size: Vector2, mat: Material) -> MeshInstance3D:
	var q := QuadMesh.new()
	q.size = size
	var mi := MeshInstance3D.new()
	mi.mesh = q
	mi.material_override = mat
	return mi


func _room(r: Dictionary) -> void:
	var s: Array = r.size
	var w := float(s[0])
	var d := float(s[1])
	var h := float(s[2])
	var cx := float(r.center[0])
	var cz := float(r.center[1])
	var tint := float(r.get("tint", 1.0))
	rooms.append({"id": r.id, "name": r.name, "rect": Rect2(cx - w / 2, cz - d / 2, w, d), "location": r.get("location", ""), "enter": r.get("enter", "")})

	var floor_mat := _mat(String(r.floor.tex), false, float(r.floor.get("repeat", 1)))
	floor_mat.albedo_color = Color(tint, tint, tint)
	var fl := _quad(Vector2(w, d), floor_mat)
	fl.rotation.x = -PI / 2
	fl.position = Vector3(cx, 0, cz)
	root.add_child(fl)

	var ceil_mat := _mat(String(r.ceil.tex))
	ceil_mat.albedo_color = Color(tint, tint, tint)
	var L: Dictionary = r.light
	if L.has("glow"):
		ceil_mat.emission_enabled = true
		ceil_mat.emission_texture = load(String(L.glow))
		ceil_mat.emission = Color.BLACK
	var ce := _quad(Vector2(w, d), ceil_mat)
	ce.rotation.x = PI / 2
	ce.position = Vector3(cx, h, cz)
	root.add_child(ce)

	for side in ["front", "back", "left", "right"]:
		if r.walls.has(side):
			_wall(r, side, r.walls[side], w, d, h)

	# The ceiling light, from its switch.
	var omni := OmniLight3D.new()
	omni.light_color = LIGHT_COLOR
	omni.omni_range = maxf(7.0, maxf(w, d) * 1.3)
	omni.omni_attenuation = 1.3
	omni.shadow_enabled = true
	omni.shadow_bias = 0.03
	omni.light_size = 0.25
	omni.position = Vector3(float(L.at[0]), float(L.at[1]) - 0.15, float(L.at[2]))
	omni.light_energy = 0.0
	root.add_child(omni)
	var entry := _light_entry(String(L.id))
	entry.lights.append({"light": omni, "energy": float(L.get("power", 10)) * 0.16})
	if L.has("glow"):
		entry.ceil.append(ceil_mat)

	areas.append(Rect2(cx - w / 2 + 0.28, cz - d / 2 + 0.28, w - 0.56, d - 0.56))


func _wall(r: Dictionary, side: String, def: Dictionary, w: float, d: float, h: float) -> void:
	var cx := float(r.center[0])
	var cz := float(r.center[1])
	var pos := Vector2.ZERO
	var rot := 0.0
	var width := w
	match side:
		"front":
			pos = Vector2(cx, cz - d / 2)
		"back":
			pos = Vector2(cx, cz + d / 2)
			rot = PI
		"left":
			pos = Vector2(cx - w / 2, cz)
			rot = PI / 2
			width = d
		"right":
			pos = Vector2(cx + w / 2, cz)
			rot = -PI / 2
			width = d
	var g := Node3D.new()
	g.name = "%s_%s" % [r.id, side]
	g.position = Vector3(pos.x, 0, pos.y)
	g.rotation.y = rot
	root.add_child(g)

	var cutout := bool(def.get("cutout", false))
	var tint := float(r.get("tint", 1.0))
	var m := _mat(String(def.tex), cutout)
	m.albedo_color = Color(tint, tint, tint)
	var face := _quad(Vector2(width, h), m)
	face.position.y = h / 2
	g.add_child(face)

	# The depth of an opening: strips through the wall's thickness (a window sill in wood).
	var plaster := StandardMaterial3D.new()
	plaster.albedo_color = Color(0.42, 0.38, 0.33) * tint
	plaster.roughness = 1.0
	plaster.cull_mode = BaseMaterial3D.CULL_DISABLED
	var trim := StandardMaterial3D.new()
	trim.albedo_color = Color(0.30, 0.19, 0.11)
	trim.roughness = 0.7
	trim.cull_mode = BaseMaterial3D.CULL_DISABLED
	var p := func(u: float, v: float) -> Vector2: return Vector2((u - 0.5) * width, (1.0 - v) * h)
	for rv in def.get("reveals", []):
		if rv.has("arch"):
			var pts: Array[Vector2] = []
			for uv in rv.arch:
				pts.append(p.call(float(uv[0]), float(uv[1])))
			var line: Array[Vector2] = [Vector2(pts[0].x, 0)]
			line.append_array(pts)
			line.append(Vector2(pts[pts.size() - 1].x, 0))
			for i in line.size() - 1:
				_strip(g, line[i], line[i + 1], plaster)
		elif rv.has("rect"):
			var u0 := float(rv.rect[0])
			var u1 := float(rv.rect[1])
			var v0 := float(rv.rect[2])
			var v1 := float(rv.rect[3])
			var c: Array[Vector2] = [p.call(u0, v1), p.call(u1, v1), p.call(u1, v0), p.call(u0, v0)]
			for i in 4:
				var mat := trim if (rv.get("wood", false) or (i == 0 and rv.get("sill", false))) else plaster
				_strip(g, c[i], c[(i + 1) % 4], mat)

	if def.has("screen"):
		# A fine window screen over the opening.
		var sc: Array = def.screen
		var a: Vector2 = p.call(float(sc[0]), float(sc[3]))
		var b: Vector2 = p.call(float(sc[1]), float(sc[2]))
		var sm := StandardMaterial3D.new()
		sm.albedo_color = Color(0.12, 0.12, 0.12, 0.35)
		sm.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
		sm.cull_mode = BaseMaterial3D.CULL_DISABLED
		var sq := _quad(Vector2(absf(b.x - a.x), absf(b.y - a.y)), sm)
		sq.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
		sq.position = Vector3((a.x + b.x) / 2, (a.y + b.y) / 2, -wall_thickness * 0.8)
		g.add_child(sq)

	if def.has("outside"):
		var o: Dictionary = def.outside
		var om := ShaderMaterial.new()
		om.shader = OUTSIDE_SHADER
		om.set_shader_parameter("tex", load(String(o.night if night else o.day)))
		var same := String(o.night) == String(o.day)
		om.set_shader_parameter("shade", ((0.3 if same else 0.9) if night else 1.0))
		om.set_shader_parameter("repeats", 5.0)
		var ow := float(o.width) * 5.0
		var out := _quad(Vector2(ow, ow * 864.0 / 1536.0), om)
		out.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
		out.position = Vector3((float(o.u) - 0.5) * width, float(o.y), -wall_thickness - float(o.distance))
		g.add_child(out)


func _strip(parent: Node3D, a: Vector2, b: Vector2, mat: Material) -> void:
	var length := a.distance_to(b)
	if length < 0.0001:
		return
	var box := BoxMesh.new()
	box.size = Vector3(length + 0.004, 0.012, wall_thickness)
	var mi := MeshInstance3D.new()
	mi.mesh = box
	mi.material_override = mat
	mi.position = Vector3((a.x + b.x) / 2, (a.y + b.y) / 2, -wall_thickness / 2)
	mi.rotation.z = atan2(b.y - a.y, b.x - a.x)
	parent.add_child(mi)


func _decal(dc: Dictionary) -> void:
	var m := _mat(String(dc.tex), true)
	m.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	var q := _quad(Vector2(float(dc.size[0]), float(dc.size[1])), m)
	q.rotation = Vector3(-PI / 2, 0, 0)
	q.rotate_y(deg_to_rad(float(dc.get("rotY", 0))))
	q.position = Vector3(float(dc.pos[0]), 0.004, float(dc.pos[1]))
	q.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	root.add_child(q)


# ---------------------------------------------------------------- furniture and people

func _model(M: Dictionary) -> void:
	var scene: PackedScene = load(String(M.file))
	if scene == null:
		push_warning("Missing model " + String(M.file))
		return
	var inst := scene.instantiate() as Node3D
	for ap in inst.find_children("*", "AnimationPlayer", true, false):
		ap.queue_free()
	var inner := Node3D.new()
	inner.add_child(inst)
	inner.rotation.x = deg_to_rad(float(M.get("rotX", 0)))
	var box := _merged_aabb(inner, inner.transform)
	var center := box.get_center()
	var off := Node3D.new()
	off.add_child(inner)
	off.position = Vector3(-center.x, -box.position.y, -center.z)
	var grp := Node3D.new()
	grp.name = String(M.file).get_file().get_basename()
	grp.add_child(off)
	var k := float(M.size) / (box.size.y if String(M.get("fit", "x")) == "y" else box.size.x)
	var st: Array = M.get("stretch", [1, 1, 1])
	grp.scale = Vector3(k * float(st[0]), k * float(st[1]), k * float(st[2]))
	grp.rotation.y = deg_to_rad(float(M.get("rotY", 0)))
	grp.position = Vector3(float(M.pos[0]), float(M.pos[1]), float(M.pos[2]))
	root.add_child(grp)

	var lamp_id := String(M.get("lamp", ""))
	var glow_tex: Texture2D = load(String(M.glow)) if M.has("glow") else null
	var opacity := float(M.get("opacity", 1.0))
	var talk := String(M.get("talk", ""))
	var mouth_tex: Texture2D = load(String(M.mouth)) if M.has("mouth") else null
	var person := {}
	for mi in _meshes(grp):
		mi.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_ON if opacity >= 1.0 else GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
		if mi.mesh is ArrayMesh and talk != "" and mi.mesh.get_blend_shape_count() > 0:
			person.mesh = mi
		for i in mi.mesh.get_surface_count():
			var src := mi.get_active_material(i)
			var mat: Material
			if talk != "" and mouth_tex and src is StandardMaterial3D and (src as StandardMaterial3D).albedo_texture:
				var sm := ShaderMaterial.new()
				sm.shader = PERSON_SHADER
				sm.set_shader_parameter("albedo_tex", (src as StandardMaterial3D).albedo_texture)
				sm.set_shader_parameter("mouth_tex", mouth_tex)
				sm.set_shader_parameter("jaw", 0.0)
				person.mouth_mat = sm
				mat = sm
			else:
				var std: StandardMaterial3D = (src.duplicate() if src is StandardMaterial3D else StandardMaterial3D.new())
				# The website lights these as matte (Lambert); Meshy's metal settings look like chrome.
				std.metallic = 0.0
				std.metallic_texture = null
				std.roughness = maxf(std.roughness, 0.75)
				std.cull_mode = BaseMaterial3D.CULL_DISABLED
				if opacity < 1.0:
					std.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
					std.albedo_color.a = opacity
				if glow_tex and lamp_id != "":
					std.emission_enabled = true
					std.emission_texture = glow_tex
					std.emission = Color.BLACK
					_light_entry(lamp_id).glow.append(std)
				mat = std
			mi.set_surface_override_material(i, mat)

	if lamp_id != "" and M.has("light"):
		var lp := OmniLight3D.new()
		lp.light_color = LIGHT_COLOR
		lp.omni_range = 3.2
		lp.omni_attenuation = 1.6
		lp.shadow_enabled = true
		lp.light_size = 0.08
		var at: Array = M.light.at
		lp.position = Vector3(float(M.pos[0]) + float(at[0]), float(M.pos[1]) + float(at[1]) - 0.08, float(M.pos[2]) + float(at[2]) + 0.12)
		lp.light_energy = 0.0
		root.add_child(lp)
		_light_entry(lamp_id).lights.append({"light": lp, "energy": float(M.light.get("power", 2)) * 0.3})

	if M.has("showIf"):
		show_if.append({"id": String(M.showIf), "node": grp})

	if talk != "":
		var skel := grp.find_children("*", "Skeleton3D", true, false)
		person.node = grp
		person.rot_y = grp.rotation.y
		person.phase = randf() * 100.0
		person.jaw = 0.0
		if skel.size() > 0:
			person.skeleton = skel[0]
			if not OS.get_cmdline_user_args().has("--nopose"):
				_pose_rig(person)
			else:
				person.bones = {}
				person.base = {}
		people[talk] = person

	# Pieces you would bump into: standing on the floor and taller than a shin.
	if M.get("solid", true) and float(M.pos[1]) < 0.05:
		var wb := _merged_aabb(grp, grp.transform)
		if wb.size.y > 0.25:
			blockers.append(Rect2(wb.position.x, wb.position.z, wb.size.x, wb.size.z))


func _meshes(n: Node) -> Array[MeshInstance3D]:
	var out: Array[MeshInstance3D] = []
	if n is MeshInstance3D:
		out.append(n)
	for c in n.get_children():
		out.append_array(_meshes(c))
	return out


## The bounds of every mesh under `n`, in the space `xform` maps n into (works before n is in the tree).
func _merged_aabb(n: Node, xform: Transform3D) -> AABB:
	var box := AABB()
	var first := true
	var stack: Array = [[n, xform]]
	while stack.size() > 0:
		var item: Array = stack.pop_back()
		var node: Node = item[0]
		var x: Transform3D = item[1]
		if node is MeshInstance3D and (node as MeshInstance3D).mesh:
			var mi := node as MeshInstance3D
			var mx := x
			# A rigged person is drawn through their bones (Meshy rigs are in centimetres under a 0.01 scale).
			var sk := mi.get_parent() as Skeleton3D
			if mi.skin and sk and mi.skin.get_bind_count() > 0:
				var b0 := sk.find_bone(mi.skin.get_bind_name(0))
				if b0 >= 0:
					mx = x * mi.transform.affine_inverse() * sk.get_bone_global_pose(b0) * mi.skin.get_bind_pose(0)
			var b: AABB = mx * mi.mesh.get_aabb()
			box = b if first else box.merge(b)
			first = false
		for c in node.get_children():
			if c is Node3D:
				stack.append([c, x * (c as Node3D).transform])
			else:
				stack.append([c, x])
	return box


# ---------------------------------------------------------------- people

const RIG_BONES := ["Hips", "Spine", "Spine01", "Spine02", "neck", "Head", "LeftArm", "RightArm", "LeftForeArm", "RightForeArm", "LeftHand", "RightHand", "headfront"]


## Lowers the arms from the rigging pose (as the website does), then remembers the pose for the idle.
func _pose_rig(p: Dictionary) -> void:
	var sk: Skeleton3D = p.skeleton
	var bones := {}
	for n in RIG_BONES:
		var i := sk.find_bone(n)
		if i >= 0:
			bones[n] = i
	p.bones = bones
	if not (bones.has("LeftArm") and bones.has("RightArm") and bones.has("Head")):
		p.base = {}
		return
	# Directions in the skeleton's own space (the model is scaled and turned in the room).
	var to_skel := (p.node as Node3D).transform.basis * _chain_basis(sk, p.node)
	to_skel = to_skel.inverse()
	var down := (to_skel * Vector3.DOWN).normalized()
	var gp := func(i: int) -> Vector3: return sk.get_bone_global_pose(i).origin
	var fwd := Vector3(0, 0, 1)
	if bones.has("headfront"):
		fwd = (gp.call(bones.headfront) - gp.call(bones.Head))
		fwd -= down * fwd.dot(down)
		fwd = fwd.normalized()
	var trunk: int = bones.get("Spine02", bones.get("Hips", 0))
	for side in ["Left", "Right"]:
		if not (bones.has(side + "ForeArm") and bones.has(side + "Hand")):
			continue
		var arm: int = bones[side + "Arm"]
		var fore: int = bones[side + "ForeArm"]
		var hand: int = bones[side + "Hand"]
		var out: Vector3 = gp.call(arm) - gp.call(trunk)
		out -= down * out.dot(down)
		out = out.normalized()
		_aim(sk, arm, fore, (down + out * 0.16 + fwd * 0.06).normalized())
		_aim(sk, fore, hand, (down + out * 0.05 + fwd * 0.3).normalized())
	var base := {}
	for n in bones:
		base[n] = sk.get_bone_pose_rotation(bones[n])
	p.base = base


## The rotation from the skeleton to the person's group (the import's own nodes in between).
func _chain_basis(sk: Node3D, top: Node3D) -> Basis:
	var b := Basis()
	var n: Node = sk
	while n and n != top:
		if n is Node3D:
			b = (n as Node3D).transform.basis * b
		n = n.get_parent()
	return b


## Turns a bone so the joint below it points along dir (skeleton space).
func _aim(sk: Skeleton3D, bone: int, child: int, dir: Vector3) -> void:
	sk.force_update_all_bone_transforms()
	var bg := sk.get_bone_global_pose(bone)
	var cur := (sk.get_bone_global_pose(child).origin - bg.origin).normalized()
	if cur.length() < 0.5:
		return
	var q := Quaternion(cur, dir)
	var world := bg.basis.get_rotation_quaternion()
	var parent := sk.get_bone_parent(bone)
	var pq := sk.get_bone_global_pose(parent).basis.get_rotation_quaternion() if parent >= 0 else Quaternion()
	sk.set_bone_pose_rotation(bone, (pq.inverse() * (q * world)).normalized())


## Breathing, a slow weight shift and glances around; still and facing you while being questioned.
func animate(dt: float, talking_to := "") -> void:
	_t += dt
	for id in people:
		var p: Dictionary = people[id]
		if not p.has("skeleton") or (p.base as Dictionary).is_empty():
			continue
		var sk: Skeleton3D = p.skeleton
		var T: float = _t + float(p.phase)
		var breath := sin(T * 1.5)
		var still: bool = id == talking_to
		var glance := 0.0 if still else sin(T * 0.19) * 0.22 + sin(T * 0.53) * 0.06
		_pose(p, sk, "Spine01", Vector3(breath * 0.012, 0, 0))
		_pose(p, sk, "Spine02", Vector3(breath * 0.016, 0, 0))
		_pose(p, sk, "Hips", Vector3(0, sin(T * 0.21) * 0.025, sin(T * 0.37) * 0.012))
		_pose(p, sk, "neck", Vector3(sin(T * 0.31) * 0.03, glance * 0.4, 0))
		_pose(p, sk, "Head", Vector3(sin(T * 0.43) * 0.04 - 0.02, glance * 0.6, sin(T * 0.27) * 0.02))
		_pose(p, sk, "LeftArm", Vector3(breath * 0.01, 0, sin(T * 0.33) * 0.02))
		_pose(p, sk, "RightArm", Vector3(breath * 0.01, 0, -sin(T * 0.29) * 0.02))


func _pose(p: Dictionary, sk: Skeleton3D, name: String, e: Vector3) -> void:
	if not p.bones.has(name):
		return
	sk.set_bone_pose_rotation(p.bones[name], (p.base[name] as Quaternion) * Quaternion.from_euler(e))


## Opens a person's mouth (0 to 1): the jaw shape and the painted open mouth.
func set_jaw(id: String, v: float) -> void:
	if not people.has(id):
		return
	var p: Dictionary = people[id]
	p.jaw = v
	if p.has("mesh"):
		var mi: MeshInstance3D = p.mesh
		var bi := mi.find_blend_shape_by_name("jawOpen")
		if bi >= 0:
			mi.set_blend_shape_value(bi, v)
	if p.has("mouth_mat"):
		(p.mouth_mat as ShaderMaterial).set_shader_parameter("jaw", v)


## Where a person's face is, and which way they face.
func face_of(id: String) -> Dictionary:
	if not people.has(id):
		return {}
	var p: Dictionary = people[id]
	var node: Node3D = p.node
	var head := node.global_position + Vector3(0, 1.55, 0)
	if p.has("skeleton") and p.bones.has("Head"):
		var sk: Skeleton3D = p.skeleton
		head = sk.global_transform * sk.get_bone_global_pose(p.bones.Head).origin + Vector3(0, 0.06, 0)
	var ry: float = p.rot_y
	return {"head": head, "forward": Vector3(sin(ry), 0, cos(ry))}


# ---------------------------------------------------------------- lights and the case

func _light_entry(id: String) -> Dictionary:
	if not lights.has(id):
		lights[id] = {"lights": [], "glow": [], "ceil": [], "on": false}
	return lights[id]


func set_light(id: String, on: bool) -> void:
	var e := _light_entry(id)
	e.on = on
	for l in e.lights:
		(l.light as Light3D).light_energy = l.energy if on else 0.0
	for m in e.glow:
		(m as StandardMaterial3D).emission = Color(0.9, 0.8, 0.6) if on else Color.BLACK
	for m in e.ceil:
		(m as StandardMaterial3D).emission = Color(0.75, 0.7, 0.6) if on else Color.BLACK


## The flicker of a light coming on.
func flick_on(id: String, tree: SceneTree) -> void:
	for t in [0.06, 0.08, 0.05, 0.14]:
		set_light(id, true)
		await tree.create_timer(t).timeout
		set_light(id, false)
		await tree.create_timer(t * 0.7).timeout
	set_light(id, true)


func is_on(id: String) -> bool:
	return bool(_light_entry(id).on)


## Shows the pieces that come and go with the case (a coat rack between visits).
func apply_visible(ids: Array) -> void:
	for s in show_if:
		(s.node as Node3D).visible = ids.has(s.id)


func room_at(x: float, z: float) -> Dictionary:
	for r in rooms:
		if (r.rect as Rect2).has_point(Vector2(x, z)):
			return r
	return {}


## Whether a body at (x, z) fits: on a floor or in a doorway, and clear of the furniture.
func free_at(x: float, z: float, radius := 0.28) -> bool:
	var inside := false
	for a in areas:
		if a.has_point(Vector2(x, z)):
			inside = true
			break
	if not inside:
		return false
	for b in blockers:
		if b.grow(radius).has_point(Vector2(x, z)):
			return false
	return true
