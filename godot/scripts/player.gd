class_name Player
extends Node3D
## First-person walking: WASD or the left stick to walk, the mouse or the right stick to look,
## Shift or a click of the left stick to hurry. Walls and furniture stop you, as on the website.

const SPEED := 1.4
const HURRY := 1.7
const MOUSE_SENS := 0.0022
const STICK_LOOK := 2.6
const SEATED_EYE := 1.45

var room: RoomBuilder
var eye := 1.673
var yaw := 0.0
var pitch := 0.0
var enabled := true
## While being shown someone's face in an interview, the game moves the camera itself.
var camera_free := false
var seated_from := Vector3.INF
var camera: Camera3D
var _eye_now := 1.673
var _bob := 0.0


func _ready() -> void:
	camera = Camera3D.new()
	camera.fov = 70.0
	camera.near = 0.05
	add_child(camera)
	camera.make_current()


func place(x: float, z: float, yaw_deg: float) -> void:
	position = Vector3(x, eye, z)
	_eye_now = eye
	## The website measures turning clockwise; Godot counter-clockwise.
	yaw = deg_to_rad(-yaw_deg)
	pitch = 0.0
	_apply()


func sit(x: float, z: float, yaw_deg: float) -> void:
	seated_from = position
	position.x = x
	position.z = z
	yaw = deg_to_rad(-yaw_deg)
	pitch = deg_to_rad(-12)


func is_seated() -> bool:
	return seated_from != Vector3.INF


func _unhandled_input(event: InputEvent) -> void:
	if not enabled:
		return
	if event is InputEventMouseMotion and Input.mouse_mode == Input.MOUSE_MODE_CAPTURED:
		yaw -= event.relative.x * MOUSE_SENS
		pitch = clampf(pitch - event.relative.y * MOUSE_SENS, -1.35, 1.35)


func _process(dt: float) -> void:
	if enabled:
		var look := Input.get_vector("look_left", "look_right", "look_up", "look_down")
		yaw -= look.x * STICK_LOOK * dt
		pitch = clampf(pitch - look.y * STICK_LOOK * 0.75 * dt, -1.35, 1.35)
		var turn := Input.get_axis("turn_left", "turn_right")
		yaw -= turn * 1.9 * dt

		var mv := Input.get_vector("move_left", "move_right", "move_forward", "move_back")
		if mv.length() > 0.05:
			if is_seated():
				position.x = seated_from.x
				position.z = seated_from.z
				seated_from = Vector3.INF
			else:
				var sp := SPEED * (HURRY if Input.is_action_pressed("hurry") else 1.0) * minf(1.0, mv.length())
				var dir := Basis(Vector3.UP, yaw) * Vector3(mv.x, 0, mv.y)
				dir = dir.normalized() * sp * dt
				_move(dir.x, dir.z)
				_bob += dt * sp * 6.0
	var target := SEATED_EYE if is_seated() else eye
	_eye_now += (target - _eye_now) * minf(1.0, dt * 6.0)
	position.y = _eye_now + sin(_bob) * 0.012
	_apply()


## Slide along walls and furniture instead of stopping dead.
func _move(dx: float, dz: float) -> void:
	if room == null:
		position.x += dx
		position.z += dz
		return
	if room.free_at(position.x + dx, position.z + dz):
		position.x += dx
		position.z += dz
	elif room.free_at(position.x + dx, position.z):
		position.x += dx
	elif room.free_at(position.x, position.z + dz):
		position.z += dz


func _apply() -> void:
	rotation = Vector3(0, yaw, 0)
	if camera and not camera_free:
		camera.rotation = Vector3(pitch, 0, 0)


func forward() -> Vector3:
	return -camera.global_transform.basis.z
