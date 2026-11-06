extends Node
## Blackwood Investigations, desktop client prototype: the 80s detective office from The Whitmore File.
##
## Walk the office with WASD or a controller, look at what is on the desk, flip the light switch,
## sit at the desk, read Det. Bennett's case file, and pick up the telephone to question him.
## Signed in, every action goes to the same game server as the website (the save is shared);
## offline, the office can still be walked and looked at.

const CASE_ID := "C001"
const ROOM_FILE := "res://data/c001_office.json"
const NEAR := 2.6
## Desk things the office always has, for walking it offline (deliveries come and go with the case).
const OFFLINE_SET := ["office_casefile", "office_board", "office_map", "office_recorder", "office_notebook", "office_mail", "office_typewriter", "office_phone"]
## Screens of the website's game that come to the desktop client in Phase 3.
const LATER := {
	"office_board": "The murder board",
	"office_map": "Travel by the street map",
	"office_notebook": "The notebook",
	"office_typewriter": "The final report",
	"office_report": "The final report",
}

var api: Api
var room := RoomBuilder.new()
var data: Dictionary
var player: Player
var online := false
var view: Dictionary = {}
var visible_ids: Array = []
var busy := false

# Interface
var ui_root: Control
var hud: Control
var prompt: Label
var dot: Panel
var objectives: Label
var toast: Label
var markers := {}
var screen: Control = null
var focus_hs: Dictionary = {}

# Interview
var talking_to := ""
var transcript: RichTextLabel
var ask_field: LineEdit
var ask_button: Button
var interview_status: Label
var voice_player: AudioStreamPlayer
var voice_queue: Array = []
var interview_voiced := false


func _ready() -> void:
	_setup_input()
	api = Api.new()
	add_child(api)
	voice_player = AudioStreamPlayer.new()
	add_child(voice_player)
	voice_player.finished.connect(_next_voice)

	data = JSON.parse_string(FileAccess.get_file_as_string(ROOM_FILE))
	var world := Node3D.new()
	world.name = "World"
	add_child(world)
	room.build(world, data)
	player = Player.new()
	player.room = room
	player.eye = float(data.get("eye", 1.673))
	world.add_child(player)
	var start: Array = data.get("start", [0, 0, 0])
	player.place(float(start[0]), float(start[1]), float(start[2]))
	_build_markers(world)

	var layer := CanvasLayer.new()
	add_child(layer)
	ui_root = Control.new()
	ui_root.set_anchors_preset(Control.PRESET_FULL_RECT)
	ui_root.mouse_filter = Control.MOUSE_FILTER_IGNORE
	ui_root.theme = UI.theme()
	layer.add_child(ui_root)
	_build_hud()

	# Screenshot mode for automated checks: --shot=path.png renders the office and quits.
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--shot="):
			_take_shot(arg.substr(7))
			return

	if api.signed_in():
		_go_online()
	else:
		_show_login()


# ---------------------------------------------------------------- input

func _setup_input() -> void:
	var keys := {
		"move_forward": [KEY_W, KEY_UP], "move_back": [KEY_S, KEY_DOWN], "move_left": [KEY_A], "move_right": [KEY_D],
		"turn_left": [KEY_LEFT], "turn_right": [KEY_RIGHT], "hurry": [KEY_SHIFT], "interact": [KEY_E, KEY_SPACE],
		"back": [KEY_ESCAPE], "pause": [], "look_left": [], "look_right": [], "look_up": [], "look_down": [],
	}
	var axes := {
		"move_forward": [JOY_AXIS_LEFT_Y, -1.0], "move_back": [JOY_AXIS_LEFT_Y, 1.0], "move_left": [JOY_AXIS_LEFT_X, -1.0], "move_right": [JOY_AXIS_LEFT_X, 1.0],
		"look_left": [JOY_AXIS_RIGHT_X, -1.0], "look_right": [JOY_AXIS_RIGHT_X, 1.0], "look_up": [JOY_AXIS_RIGHT_Y, -1.0], "look_down": [JOY_AXIS_RIGHT_Y, 1.0],
	}
	var buttons := {"interact": [JOY_BUTTON_A], "back": [JOY_BUTTON_B], "pause": [JOY_BUTTON_START], "hurry": [JOY_BUTTON_LEFT_STICK]}
	for action in keys:
		if not InputMap.has_action(action):
			InputMap.add_action(action, 0.2)
		for k in keys[action]:
			var e := InputEventKey.new()
			e.physical_keycode = k
			InputMap.action_add_event(action, e)
		if axes.has(action):
			var j := InputEventJoypadMotion.new()
			j.axis = axes[action][0]
			j.axis_value = axes[action][1]
			InputMap.action_add_event(action, j)
		for b in buttons.get(action, []):
			var jb := InputEventJoypadButton.new()
			jb.button_index = b
			InputMap.action_add_event(action, jb)
	var click := InputEventMouseButton.new()
	click.button_index = MOUSE_BUTTON_LEFT
	InputMap.action_add_event("interact", click)


func _unhandled_input(event: InputEvent) -> void:
	if screen != null:
		if event.is_action_pressed("back") or (event.is_action_pressed("pause") and screen.name != "Login"):
			if screen.name != "Login":
				get_viewport().set_input_as_handled()
				_close_screen()
		return
	if event.is_action_pressed("back") or event.is_action_pressed("pause"):
		_show_pause()
	elif event.is_action_pressed("interact"):
		if Input.mouse_mode != Input.MOUSE_MODE_CAPTURED and event is InputEventMouseButton:
			Input.mouse_mode = Input.MOUSE_MODE_CAPTURED
		elif not focus_hs.is_empty() and not busy:
			_interact(focus_hs)


func _walking(on: bool) -> void:
	player.enabled = on
	hud.visible = on
	Input.mouse_mode = Input.MOUSE_MODE_CAPTURED if on else Input.MOUSE_MODE_VISIBLE


# ---------------------------------------------------------------- hotspots

func _build_markers(world: Node3D) -> void:
	for hs in data.get("hotspots", []):
		var l := Label3D.new()
		l.billboard = BaseMaterial3D.BILLBOARD_ENABLED
		l.no_depth_test = true
		l.fixed_size = true
		l.pixel_size = 0.0009
		l.font_size = 30
		l.outline_size = 10
		l.modulate = UI.BRASS
		l.text = "○" if hs.kind == "switch" else ("↓" if hs.kind == "seat" else "?")
		l.position = Vector3(float(hs.at[0]), float(hs.at[1]), float(hs.at[2]))
		l.visible = false
		world.add_child(l)
		markers[hs.id] = l


func _hs_shown(hs: Dictionary) -> bool:
	if hs.kind == "switch" or hs.kind == "seat":
		return not (hs.kind == "seat" and player.is_seated())
	var game := String(hs.get("game", hs.id))
	return game in (visible_ids if online else OFFLINE_SET)


func _process(_dt: float) -> void:
	if player == null or not player.enabled:
		return
	var cam := player.camera.global_position
	var fwd := player.forward()
	var best := {}
	var best_score := 1e9
	for hs in data.get("hotspots", []):
		var m: Label3D = markers[hs.id]
		var at := Vector3(float(hs.at[0]), float(hs.at[1]), float(hs.at[2]))
		var to := at - cam
		var dist := to.length()
		var shown := _hs_shown(hs) and dist < NEAR and fwd.dot(to) > 0.0
		m.visible = shown
		if hs.kind == "switch":
			m.text = "●" if room.is_on(String(hs.light)) else "○"
		if not shown:
			continue
		var ang := rad_to_deg(fwd.angle_to(to))
		var limit := 9.0 + 10.0 / maxf(dist, 0.4)
		m.modulate = UI.BRASS
		if ang < limit and ang + dist * 2.0 < best_score:
			best_score = ang + dist * 2.0
			best = hs
	focus_hs = best
	if best.is_empty():
		prompt.text = ""
	else:
		(markers[best.id] as Label3D).modulate = UI.PAPER
		var verb := "flip the switch" if best.kind == "switch" else ("sit down" if best.kind == "seat" else "look at the " + _label_for(best).to_lower())
		var btn := "A" if Input.get_connected_joypads().size() > 0 else "E"
		prompt.text = "%s: %s" % [btn, verb]


func _label_for(hs: Dictionary) -> String:
	if online:
		for h in view.get("location", {}).get("hotspots", []):
			if h.id == hs.get("game", ""):
				return String(h.label)
	return String(hs.label)


func _interact(hs: Dictionary) -> void:
	if hs.kind == "switch":
		var id := String(hs.light)
		if room.is_on(id):
			room.set_light(id, false)
		else:
			room.flick_on(id, get_tree())
		return
	if hs.kind == "seat":
		var s: Array = hs.seat
		player.sit(float(s[0]), float(s[1]), float(s[2]))
		return
	var game := String(hs.get("game", hs.id))
	var default_text := String(hs.get("text", ""))
	if not online:
		var parts := default_text.split(": ", true, 1)
		_show_reader(String(hs.label), parts[1] if parts.size() > 1 else default_text, _later_note(game))
		return
	busy = true
	if game == "office_casefile":
		await _act({"type": "readDocument", "documentId": "casefile"})
	elif game == "office_phone":
		await _phone()
	else:
		var r := await _act({"type": "hotspot", "hotspotId": game}, false)
		if r.has("outcome") and r.outcome.kind == "panel":
			var parts := default_text.split(": ", true, 1)
			_show_reader(_label_for(hs), parts[1] if parts.size() > 1 else default_text, _later_note(game))
		elif r.has("outcome"):
			_show_outcome(r.outcome)
	busy = false


func _later_note(game: String) -> String:
	if LATER.has(game):
		return "%s opens here in Phase 3 of the desktop build. For now, use the website for it." % LATER[game]
	if game == "office_recorder":
		return "The tapes play here in Phase 3. For now, use the website for them."
	return ""


# ---------------------------------------------------------------- talking to the server

func _go_online() -> void:
	_toast("Opening the Whitmore File...")
	var r := await api.view(CASE_ID)
	if not r.ok:
		if r.code == 401:
			api.sign_out()
			_show_login("Your session has ended. Sign in again.")
		else:
			_show_login(String(r.data.get("error", "Could not reach Blackwood.")))
		return
	online = true
	_take_view(r.data.response)
	if String(view.get("location", {}).get("id", "office")) != "office":
		var t := await _act({"type": "travel", "locationId": "office"}, false)
		if t.has("view"):
			_toast("Back at the office.")
	if not bool(view.get("introSeen", true)):
		var lines := PackedStringArray()
		for p in view.get("intro", []):
			if String(p.get("heading", "")) != "":
				lines.append("[b]%s[/b]" % p.heading)
			lines.append(String(p.get("text", "")))
		_show_reader(String(view.get("title", "The Whitmore File")), "\n\n".join(lines), "", func() -> void: _act({"type": "dismissIntro"}, false))
	else:
		_close_screen()
		_toast("Signed in as %s." % api.email)


## Runs one action on the server. Shows any error, takes the new view, and (when `show` is set) shows what happened.
func _act(action: Dictionary, show := true) -> Dictionary:
	var r := await api.play(CASE_ID, action)
	if r.has("error"):
		_toast(String(r.error))
		return r
	if r.has("view"):
		_take_view(r.view)
	if show and r.has("outcome"):
		_show_outcome(r.outcome)
	return r


func _take_view(v: Dictionary) -> void:
	view = v
	visible_ids = []
	for h in v.get("location", {}).get("hotspots", []):
		visible_ids.append(h.id)
	var lines := PackedStringArray()
	for o in v.get("objectives", []):
		if not o.get("done", false):
			lines.append("•  " + String(o.text))
	objectives.text = ("OBJECTIVES\n" + "\n".join(lines.slice(0, 5))) if lines.size() > 0 else ""
	for m in v.get("messages", []):
		_toast(String(m))
	var ringing = v.get("phone", {}).get("ringing")
	if ringing is Dictionary and screen == null:
		_toast("The telephone is ringing.")


func _show_outcome(o: Dictionary) -> void:
	match String(o.get("kind", "none")):
		"inspect":
			_show_reader(String(o.title), String(o.text))
		"document":
			var parts := PackedStringArray()
			for d in o.get("dossier", []):
				parts.append("[color=#9c907c]%s:[/color] %s" % [d.label, d.value])
			if o.get("people", []).size() > 0:
				parts.append("\n[b]%s[/b]" % o.get("peopleHeading", "Persons involved"))
				for p in o.people:
					parts.append("%s, %s" % [p.name, p.role])
			for p in o.get("pages", []):
				if String(p.get("heading", "")) != "":
					parts.append("\n[b]%s[/b]" % p.heading)
				parts.append(String(p.body))
			_show_reader(String(o.title), "\n".join(parts))
		"call":
			_show_reader(String(o.title), "[color=#9c907c]%s[/color]\n\n%s" % [o.get("from", ""), "\n\n".join(PackedStringArray(o.get("lines", [])))])
		"conversation":
			_show_interview(o)
		"panel":
			pass
		"none":
			pass
		_:
			_show_reader(String(o.get("title", "")), String(o.get("text", "")))


func _phone() -> void:
	var ringing = view.get("phone", {}).get("ringing")
	if ringing is Dictionary:
		await _act({"type": "answerCall", "callId": String(ringing.id)})
		return
	await _act({"type": "talk", "characterId": "bennett"})


# ---------------------------------------------------------------- screens

func _build_hud() -> void:
	hud = Control.new()
	hud.set_anchors_preset(Control.PRESET_FULL_RECT)
	hud.mouse_filter = Control.MOUSE_FILTER_IGNORE
	ui_root.add_child(hud)
	dot = Panel.new()
	var sb := StyleBoxFlat.new()
	sb.bg_color = Color(1, 1, 1, 0.7)
	sb.set_corner_radius_all(4)
	dot.add_theme_stylebox_override("panel", sb)
	dot.size = Vector2(6, 6)
	dot.set_anchors_preset(Control.PRESET_CENTER)
	dot.position -= Vector2(3, 3)
	hud.add_child(dot)
	prompt = UI.label("", 24)
	prompt.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	prompt.set_anchors_preset(Control.PRESET_CENTER)
	prompt.size = Vector2(900, 40)
	prompt.position = Vector2(-450, 40)
	prompt.add_theme_constant_override("outline_size", 8)
	prompt.add_theme_color_override("font_outline_color", Color.BLACK)
	hud.add_child(prompt)
	objectives = UI.label("", 19, UI.PAPER)
	objectives.position = Vector2(40, 36)
	objectives.size = Vector2(620, 300)
	objectives.add_theme_constant_override("outline_size", 6)
	objectives.add_theme_color_override("font_outline_color", Color.BLACK)
	hud.add_child(objectives)
	toast = UI.label("", 22)
	toast.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	toast.set_anchors_preset(Control.PRESET_CENTER_BOTTOM)
	toast.size = Vector2(1200, 40)
	toast.position = Vector2(-600, -110)
	toast.add_theme_constant_override("outline_size", 8)
	toast.add_theme_color_override("font_outline_color", Color.BLACK)
	ui_root.add_child(toast)


var _toast_tween: Tween
func _toast(text: String) -> void:
	toast.text = text
	toast.modulate.a = 1.0
	if _toast_tween:
		_toast_tween.kill()
	_toast_tween = create_tween()
	_toast_tween.tween_interval(3.5)
	_toast_tween.tween_property(toast, "modulate:a", 0.0, 0.8)


func _open_screen(c: Control, focus: Control) -> void:
	_close_screen(false)
	screen = c
	ui_root.add_child(c)
	_walking(false)
	if focus:
		focus.call_deferred("grab_focus")


var _on_close: Callable
func _close_screen(resume := true) -> void:
	if screen:
		screen.queue_free()
		screen = null
	if talking_to != "":
		talking_to = ""
		voice_queue.clear()
		voice_player.stop()
	if _on_close.is_valid():
		var f := _on_close
		_on_close = Callable()
		f.call()
	if resume:
		_walking(true)


func _shade() -> Control:
	var c := ColorRect.new()
	c.color = Color(0, 0, 0, 0.55)
	c.set_anchors_preset(Control.PRESET_FULL_RECT)
	return c


func _show_login(message := "") -> void:
	var c := _shade()
	c.name = "Login"
	c.color = Color(0, 0, 0, 0.72)
	var v := UI.centered_panel(c, 640)
	var title := UI.label("BLACKWOOD INVESTIGATIONS", 34, UI.BRASS)
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	v.add_child(title)
	var sub := UI.label("Sign in with your Blackwood agency account.", 20, UI.DIM)
	sub.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	v.add_child(sub)
	var em := LineEdit.new()
	em.placeholder_text = "Email"
	em.text = api.email
	v.add_child(em)
	var pw := LineEdit.new()
	pw.placeholder_text = "Password"
	pw.secret = true
	v.add_child(pw)
	var status := UI.label(message, 19, Color("d98c6a"))
	v.add_child(status)
	var go := func() -> void:
		status.text = "Signing in..."
		var r := await api.login(em.text, pw.text)
		if r.ok:
			_go_online()
		else:
			status.text = String(r.data.get("error", "Could not sign in."))
	pw.text_submitted.connect(func(_t: String) -> void: go.call())
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 12)
	var sign := UI.button("Sign in", go)
	sign.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	row.add_child(sign)
	var off := UI.button("Walk the office offline", func() -> void:
		online = false
		_close_screen()
		_toast("Offline: walk and look around. Sign in from the menu (Esc) to play the case."))
	off.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	row.add_child(off)
	v.add_child(row)
	v.add_child(UI.button("Quit", func() -> void: get_tree().quit()))
	_open_screen(c, em if em.text == "" else pw)


func _show_pause() -> void:
	var c := _shade()
	var v := UI.centered_panel(c, 520)
	v.add_child(UI.label("Blackwood Investigations", 28, UI.BRASS))
	v.add_child(UI.label(("Signed in as %s" % api.email) if online else "Offline", 18, UI.DIM))
	var resume := UI.button("Back to the office", func() -> void: _close_screen())
	v.add_child(resume)
	if online:
		v.add_child(UI.button("Sign out", func() -> void:
			api.sign_out()
			online = false
			visible_ids = []
			objectives.text = ""
			_show_login()))
	else:
		v.add_child(UI.button("Sign in", func() -> void: _show_login()))
	v.add_child(UI.label("Move: WASD or left stick   Look: mouse or right stick   Hurry: Shift or L3\nUse: E, click or A   Back: Esc or B", 16, UI.DIM))
	v.add_child(UI.button("Quit", func() -> void: get_tree().quit()))
	_open_screen(c, resume)


func _show_reader(title: String, body: String, note := "", on_close := Callable()) -> void:
	var c := _shade()
	var v := UI.centered_panel(c, 1000)
	v.add_child(UI.label(title, 30, UI.BRASS))
	var text := RichTextLabel.new()
	text.bbcode_enabled = true
	text.text = body
	text.fit_content = true
	text.scroll_active = true
	text.custom_minimum_size = Vector2(0, 120)
	var scroll := ScrollContainer.new()
	scroll.custom_minimum_size = Vector2(0, mini(620, 120 + body.length() / 2))
	scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	text.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	scroll.add_child(text)
	v.add_child(scroll)
	if note != "":
		v.add_child(UI.label(note, 18, UI.DIM))
	var close := UI.button("Close", func() -> void: _close_screen())
	v.add_child(close)
	_open_screen(c, close)
	_on_close = on_close
	# A controller scrolls long documents with the right stick.
	scroll.set_meta("scroll", true)
	_reader_scroll = scroll


var _reader_scroll: ScrollContainer
func _physics_process(dt: float) -> void:
	if screen and is_instance_valid(_reader_scroll):
		var y := Input.get_axis("look_up", "look_down")
		if absf(y) > 0.1:
			_reader_scroll.scroll_vertical += int(y * 900 * dt)


# ---------------------------------------------------------------- the interview

func _show_interview(o: Dictionary) -> void:
	var first := talking_to != String(o.characterId) or screen == null
	if first:
		var c := _shade()
		var p := PanelContainer.new()
		p.set_anchors_preset(Control.PRESET_FULL_RECT)
		p.offset_left = 120
		p.offset_right = -120
		p.offset_top = 90
		p.offset_bottom = -90
		c.add_child(p)
		var h := HBoxContainer.new()
		h.add_theme_constant_override("separation", 28)
		p.add_child(h)
		var left := VBoxContainer.new()
		left.custom_minimum_size = Vector2(340, 0)
		h.add_child(left)
		var portrait := TextureRect.new()
		portrait.custom_minimum_size = Vector2(340, 420)
		portrait.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		portrait.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
		left.add_child(portrait)
		left.add_child(UI.label(String(o.name), 26, UI.BRASS))
		left.add_child(UI.label(String(o.role), 18, UI.DIM))
		left.add_child(UI.label(("By telephone" if o.medium == "telephone" else String(o.where)), 18, UI.DIM))
		var right := VBoxContainer.new()
		right.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		right.add_theme_constant_override("separation", 14)
		h.add_child(right)
		transcript = RichTextLabel.new()
		transcript.bbcode_enabled = true
		transcript.scroll_following = true
		transcript.size_flags_vertical = Control.SIZE_EXPAND_FILL
		right.add_child(transcript)
		interview_status = UI.label("", 18, UI.DIM)
		right.add_child(interview_status)
		var row := HBoxContainer.new()
		row.add_theme_constant_override("separation", 12)
		ask_field = LineEdit.new()
		ask_field.placeholder_text = "Ask a question in your own words..."
		ask_field.max_length = 300
		ask_field.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		ask_field.text_submitted.connect(func(_t: String) -> void: _ask())
		row.add_child(ask_field)
		ask_button = UI.button("Ask", _ask)
		row.add_child(ask_button)
		row.add_child(UI.button("Hang up" if o.medium == "telephone" else "Leave", func() -> void: _close_screen()))
		right.add_child(row)
		_open_screen(c, ask_field)
		talking_to = String(o.characterId)
		_load_portrait(portrait, String(o.get("portrait", "")))
	interview_voiced = bool(o.get("voiced", false))
	var t := PackedStringArray()
	for l in o.get("history", []):
		if l.kind == "cue":
			t.append("[color=#9c907c][i]%s[/i][/color]" % l.text)
		elif l.speakerId == o.characterId:
			t.append("[color=#b8944f]%s:[/color] %s" % [l.speaker, l.text])
		else:
			t.append("[color=#9c907c]You:[/color] %s" % l.text)
	transcript.text = "\n\n".join(t)
	var q: Dictionary = o.get("questions", {})
	var left_text := ""
	if q.get("limited", false):
		left_text = "%d questions left." % int(q.get("left", 0))
	interview_status.text = left_text if o.get("canAsk", false) else String(o.get("idle", ""))
	ask_field.editable = bool(o.get("canAsk", false))
	ask_button.disabled = not ask_field.editable
	# Speak what was just said.
	if interview_voiced:
		for n in o.get("latest", []):
			for l in o.get("history", []):
				if int(l.n) == int(n) and l.speakerId == o.characterId:
					voice_queue.append(int(n))
		if not voice_player.playing:
			_next_voice()


func _load_portrait(rect: TextureRect, path: String) -> void:
	var tex := await api.texture(path)
	if tex and is_instance_valid(rect):
		rect.texture = tex


func _ask() -> void:
	var q := ask_field.text.strip_edges()
	if q == "" or busy:
		return
	busy = true
	ask_field.text = ""
	ask_field.editable = false
	ask_button.disabled = true
	interview_status.text = "..."
	transcript.text += "\n\n[color=#9c907c]You:[/color] %s" % q
	var r := await _act({"type": "askFree", "characterId": talking_to, "text": q})
	if r.has("error") and is_instance_valid(ask_field):
		ask_field.editable = true
		ask_button.disabled = false
		interview_status.text = String(r.error)
	busy = false
	if is_instance_valid(ask_field):
		ask_field.grab_focus()


func _next_voice() -> void:
	if voice_queue.is_empty() or talking_to == "":
		return
	var n: int = voice_queue.pop_front()
	var who := talking_to
	var bytes := await api.voice(CASE_ID, who, n)
	if bytes.size() == 0 or talking_to != who:
		_next_voice()
		return
	var s := AudioStreamMP3.new()
	s.data = bytes
	voice_player.stream = s
	voice_player.play()


# ---------------------------------------------------------------- checks

func _take_shot(path: String) -> void:
	hud.visible = true
	objectives.text = "OBJECTIVES\n•  Read Detective Bennett's case file"
	for i in 30:
		await get_tree().process_frame
	var spots := {"desk": [0.3, 1.5, 0, -8], "door": [0.0, -0.4, 180, -4], "board": [0.9, 0.4, 270, 0], "map": [-0.6, 0.6, 90, 0]}
	var base := path.get_basename()
	for name in spots:
		var s: Array = spots[name]
		player.place(s[0], s[1], s[2])
		player.pitch = deg_to_rad(s[3])
		for i in 12:
			await get_tree().process_frame
		get_viewport().get_texture().get_image().save_png("%s_%s.png" % [base, name])
	# The screens, with made-up server replies, so their code runs too.
	online = true
	_show_outcome({"kind": "document", "title": "Case file from Det. Bennett", "dossier": [{"label": "Victim", "value": "Eleanor Whitmore, 64"}], "peopleHeading": "Persons present", "people": [{"name": "Margaret Ellis", "role": "Neighbor"}], "pages": [{"heading": "Summary", "body": "Test page. " .repeat(40)}]})
	for i in 8:
		await get_tree().process_frame
	get_viewport().get_texture().get_image().save_png("%s_reader.png" % base)
	_close_screen()
	_show_outcome({"kind": "conversation", "characterId": "bennett", "name": "Det. Frank Bennett", "role": "LAPD Northeast Division", "portrait": "", "where": "", "medium": "telephone", "voiced": false, "canAsk": true, "idle": "", "latest": [1],
		"questions": {"limited": true, "left": 12}, "history": [{"n": 0, "kind": "cue", "speakerId": "cue", "speaker": "", "text": "You call Det. Bennett."}, {"n": 1, "kind": "answer", "speakerId": "bennett", "speaker": "Det. Frank Bennett", "text": "Bennett. What have you got?"}]})
	for i in 8:
		await get_tree().process_frame
	get_viewport().get_texture().get_image().save_png("%s_interview.png" % base)
	_close_screen()
	_show_login("Test message.")
	for i in 8:
		await get_tree().process_frame
	get_viewport().get_texture().get_image().save_png("%s_login.png" % base)
	get_tree().quit()
