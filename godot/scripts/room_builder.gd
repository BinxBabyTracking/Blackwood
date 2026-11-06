class_name RoomBuilder
extends RefCounted
## Builds a walkable room from the same data the website uses (exported to godot/data/*.json by
## scripts/godot/export-room.mjs): box walls from flat paintings, Meshy furniture, and all the
## lighting in code. Coordinates match the website exactly (metres, Y up, the front wall at -Z).

const NIGHT := {"sun_color": Color("ffcf8a"), "sun_energy": 0.9, "az": 22.0, "el": 8.0, "sky": Color("5a6a99"), "ground": Color("2a2018"), "ambient": 0.22}
const LIGHT_COLOR := Color("ffd29a")

var root: Node3D
var data: Dictionary
## Light id → { lights: [{ light, energy }], glow: [materials], ceil: material, on: bool }
var lights := {}
## Where you can't walk: furniture footprints (Rect2 in x/z).
var blockers: Array[Rect2] = []
## Where you can walk: each room's floor, less a body's width from the walls.
var areas: Array[Rect2] = []
var wall_thickness := 0.15


func build(parent: Node3D, room_data: Dictionary) -> Node3D:
	data = room_data
	root = Node3D.new()
	root.name = String(data.get("id", "room"))
	parent.add_child(root)
	wall_thickness = float(data.get("wall", 0.15))
	_environment()
	for r in data.get("rooms", []):
		_room(r)
	for m in data.get("models", []):
		_model(m)
	for r in data.get("rooms", []):
		var l: Dictionary = r.get("light", {})
		if l.get("startOn", false):
			set_light(String(l.get("id", "")), true)
	return root


# ---------------------------------------------------------------- environment

func _environment() -> void:
	var env := Environment.new()
	env.background_mode = Environment.BG_COLOR
	env.background_color = Color.BLACK
	env.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	env.ambient_light_color = NIGHT.sky.lerp(NIGHT.ground, 0.45)
	env.ambient_light_energy = NIGHT.ambient
	env.tonemap_mode = Environment.TONE_MAPPER_AGX
	env.tonemap_exposure = 1.15
	env.ssao_enabled = true
	env.ssao_radius = 0.6
	env.ssao_intensity = 1.6
	env.glow_enabled = true
	env.glow_intensity = 0.35
	env.glow_bloom = 0.04
	env.adjustment_enabled = true
	env.adjustment_saturation = 0.92
	env.adjustment_contrast = 1.05
	var we := WorldEnvironment.new()
	we.environment = env
	root.add_child(we)

	# City glow: low streetlight from in front, through the window and the gaps in the blinds.
	var sun := DirectionalLight3D.new()
	sun.name = "CityGlow"
	sun.light_color = NIGHT.sun_color
	sun.light_energy = NIGHT.sun_energy
	sun.shadow_enabled = true
	sun.shadow_bias = 0.02
	sun.shadow_normal_bias = 0.6
	sun.directional_shadow_mode = DirectionalLight3D.SHADOW_ORTHOGONAL
	sun.directional_shadow_max_distance = 14.0
	var a := deg_to_rad(NIGHT.az)
	var e := deg_to_rad(NIGHT.el)
	var from := Vector3(sin(a) * cos(e), sin(e), -cos(a) * cos(e))
	root.add_child(sun)
	sun.look_at_from_position(from * 12.0, Vector3.ZERO, Vector3.UP)


# ---------------------------------------------------------------- walls, floor, ceiling

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
	var c: Array = r.center
	var s: Array = r.size
	var w := float(s[0])
	var d := float(s[1])
	var h := float(s[2])
	var cx := float(c[0])
	var cz := float(c[1])
	var tint := float(r.get("tint", 1.0))

	var floor_mat := _mat(String(r.floor.tex), false, float(r.floor.get("repeat", 1)))
	floor_mat.albedo_color = Color(tint, tint, tint)
	var fl := _quad(Vector2(w, d), floor_mat)
	fl.rotation.x = -PI / 2
	fl.position = Vector3(cx, 0, cz)
	root.add_child(fl)

	var ceil_mat := _mat(String(r.ceil.tex))
	ceil_mat.albedo_color = Color(tint, tint, tint)
	var ce := _quad(Vector2(w, d), ceil_mat)
	ce.rotation.x = PI / 2
	ce.position = Vector3(cx, h, cz)
	root.add_child(ce)

	for side in ["front", "back", "left", "right"]:
		if r.walls.has(side):
			_wall(r, side, r.walls[side], w, d, h)

	# The ceiling light, from its switch by the door.
	var L: Dictionary = r.light
	var omni := OmniLight3D.new()
	omni.light_color = LIGHT_COLOR
	omni.omni_range = 7.0
	omni.omni_attenuation = 1.4
	omni.shadow_enabled = true
	omni.shadow_bias = 0.03
	omni.light_size = 0.25
	omni.position = Vector3(float(L.at[0]), float(L.at[1]), float(L.at[2]))
	omni.light_energy = 0.0
	root.add_child(omni)
	_light_entry(String(L.id)).lights.append({"light": omni, "energy": float(L.get("power", 10)) * 0.16})
	_light_entry(String(L.id)).ceil = ceil_mat

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
	g.name = "Wall_" + side
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

	# The depth of an opening: strips through the wall's thickness (the window sill in wood).
	var plaster := StandardMaterial3D.new()
	plaster.albedo_color = Color(0.42, 0.38, 0.33)
	plaster.roughness = 1.0
	var trim := StandardMaterial3D.new()
	trim.albedo_color = Color(0.30, 0.19, 0.11)
	trim.roughness = 0.7
	for rv in def.get("reveals", []):
		if not rv.has("rect"):
			continue
		var u0 := float(rv.rect[0])
		var u1 := float(rv.rect[1])
		var v0 := float(rv.rect[2])
		var v1 := float(rv.rect[3])
		var p := func(u: float, v: float) -> Vector2: return Vector2((u - 0.5) * width, (1.0 - v) * h)
		var pts: Array[Vector2] = [p.call(u0, v1), p.call(u1, v1), p.call(u1, v0), p.call(u0, v0)]
		for i in 4:
			var mat := trim if (rv.get("wood", false) or (i == 0 and rv.get("sill", false))) else plaster
			_strip(g, pts[i], pts[(i + 1) % 4], mat)

	if def.has("outside"):
		var o: Dictionary = def.outside
		var om := StandardMaterial3D.new()
		om.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
		om.albedo_texture = load(String(o.night))
		om.albedo_color = Color(0.9, 0.9, 0.9)
		om.texture_filter = BaseMaterial3D.TEXTURE_FILTER_LINEAR_WITH_MIPMAPS_ANISOTROPIC
		var ow := float(o.width) * 1.6
		var out := _quad(Vector2(ow, ow * 864.0 / 1536.0), om)
		out.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
		out.position = Vector3((float(o.u) - 0.5) * width, float(o.y), -wall_thickness - float(o.distance) * 1.6)
		g.add_child(out)


func _strip(parent: Node3D, a: Vector2, b: Vector2, mat: Material) -> void:
	var length := a.distance_to(b)
	if length < 0.0001:
		return
	var box := BoxMesh.new()
	box.size = Vector3(length, 0.01, wall_thickness)
	var mi := MeshInstance3D.new()
	mi.mesh = box
	mi.material_override = mat
	mi.position = Vector3((a.x + b.x) / 2, (a.y + b.y) / 2, -wall_thickness / 2)
	mi.rotation.z = atan2(b.y - a.y, b.x - a.x)
	parent.add_child(mi)


# ---------------------------------------------------------------- furniture

func _model(M: Dictionary) -> void:
	var scene: PackedScene = load(String(M.file))
	if scene == null:
		push_warning("Missing model " + String(M.file))
		return
	var inst := scene.instantiate() as Node3D
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
	for mi in _meshes(grp):
		mi.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_ON
		if glow_tex and lamp_id != "":
			for i in mi.mesh.get_surface_count():
				var src := mi.get_active_material(i)
				var mat: StandardMaterial3D = (src.duplicate() if src is StandardMaterial3D else StandardMaterial3D.new())
				mat.emission_enabled = true
				mat.emission_texture = glow_tex
				mat.emission = Color.BLACK
				mi.set_surface_override_material(i, mat)
				_light_entry(lamp_id).glow.append(mat)

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
			var b: AABB = x * (node as MeshInstance3D).mesh.get_aabb()
			box = b if first else box.merge(b)
			first = false
		for c in node.get_children():
			if c is Node3D:
				stack.append([c, x * (c as Node3D).transform])
			else:
				stack.append([c, x])
	return box


# ---------------------------------------------------------------- lights

func _light_entry(id: String) -> Dictionary:
	if not lights.has(id):
		lights[id] = {"lights": [], "glow": [], "ceil": null, "on": false}
	return lights[id]


func set_light(id: String, on: bool) -> void:
	var e := _light_entry(id)
	e.on = on
	for l in e.lights:
		(l.light as Light3D).light_energy = l.energy if on else 0.0
	for m in e.glow:
		(m as StandardMaterial3D).emission = Color(0.9, 0.8, 0.6) if on else Color.BLACK


## The flicker of an old fluorescent tube coming on.
func flick_on(id: String, tree: SceneTree) -> void:
	for t in [0.06, 0.08, 0.05, 0.14]:
		set_light(id, true)
		await tree.create_timer(t).timeout
		set_light(id, false)
		await tree.create_timer(t * 0.7).timeout
	set_light(id, true)


func is_on(id: String) -> bool:
	return bool(_light_entry(id).on)


## Whether a body at (x, z) fits: on a floor and clear of the furniture.
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
