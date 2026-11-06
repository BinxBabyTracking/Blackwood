extends Node
## Blackwood Investigations, desktop client: The Whitmore File (C001), played in walkable 3D rooms.
##
## Everything the case decides (what you find, what people say, whether the report holds up) is
## decided by the same game server as the website, so the save is shared with the website. This
## client shows the rooms, takes what the player does, and shows what comes back.

const CASE_ID := "C001"
const NEAR := 2.6
## The 3D place for each of the case's locations (godot/data/<file>.json).
const SCENES := {
	"office": "c001_office", "living_room": "c001_house", "kitchen": "c001_house", "diner": "c001_diner",
	"daniel_apartment": "c001_apartment", "margaret_house": "c001_margaret", "robert_garage": "c001_garage", "patricia_office": "c001_bank",
}
## For walking around offline (no server): the places and their names.
const OFFLINE_PLACES := [
	["office", "Detective's Office"], ["living_room", "Eleanor's Living Room"], ["kitchen", "Eleanor's Kitchen"], ["diner", "Maple Street Diner"],
	["daniel_apartment", "Daniel Mercer's Apartment"], ["margaret_house", "Margaret Ellis's House"], ["robert_garage", "Hale Automotive"], ["patricia_office", "Pacific Crest Savings & Loan"],
]
const ReaderScreen := preload("res://scripts/screens/reader_screen.gd")
const InterviewScreen := preload("res://scripts/screens/interview_screen.gd")
const NotebookScreen := preload("res://scripts/screens/notebook_screen.gd")
const BoardScreen := preload("res://scripts/screens/board_screen.gd")
const MapScreen := preload("res://scripts/screens/map_screen.gd")
const PhoneScreen := preload("res://scripts/screens/phone_screen.gd")
const MailScreen := preload("res://scripts/screens/mail_screen.gd")
const TapesScreen := preload("res://scripts/screens/tapes_screen.gd")
const ReportScreen := preload("res://scripts/screens/report_screen.gd")
const StoryScreen := preload("res://scripts/screens/story_screen.gd")

var case_id := CASE_ID
var api: Api
var view: Dictionary = {}
var online := false
var here := "office"
var busy := false

# The place
var world: Node3D
var room: RoomBuilder
var data: Dictionary = {}
var scene_file := ""
var player: Player
var visible_ids: Array = []
var markers := {}
var focus_hs: Dictionary = {}
var _entering := ""

# Interface
var ui_root: Control
var hud: Control
var prompt: Label
var objectives: Label
var place_label: Label
# The corner: the map as a quarter circle in the top right, the notes at the top of its curve, the evidence below it.
const CORNER_R := 230.0
var corner: Control
var corner_map: Button
var corner_notes: Button
var corner_evidence: Button
var _evidence_count: Label
var _hints := {}
var _seen_evidence := -1
var _evidence_pulse: Tween
var toast_label: Label
var stamp_label: Label
var fade: ColorRect
var screen: Control = null
var _menu_open := false
var _shown_messages := {}

# Sound
var voice_player: AudioStreamPlayer
var voice_level := 0.0
var _voice_queue: Array = []
var _voice_token := 0
var _speaker := ""
var _spectrum: AudioEffectSpectrumAnalyzerInstance
var music_player: AudioStreamPlayer
var ambience_player: AudioStreamPlayer
var ring_player: AudioStreamPlayer
var _music_list: Array = []
var _music_index := 0
var _ambience_url := ""
var music_volume := 0.6
var voice_volume := 1.0

# Interview in a room: the camera turns to the person's face.
var _face_id := ""
var _textures := {}
var _lab_timer := 0.0
var _labs_waiting := false


func _ready() -> void:
	_setup_input()
	Input.joy_connection_changed.connect(func(_d: int, _c: bool) -> void: _update_corner())
	_setup_audio()
	api = Api.new()
	add_child(api)
	var layer := CanvasLayer.new()
	layer.layer = 5
	add_child(layer)
	ui_root = Control.new()
	ui_root.set_anchors_preset(Control.PRESET_FULL_RECT)
	ui_root.mouse_filter = Control.MOUSE_FILTER_IGNORE
	ui_root.theme = UI.theme()
	layer.add_child(ui_root)
	_build_hud()
	player = Player.new()
	add_child(player)

	var shot := ""
	var walk := ""
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--shot="):
			shot = arg.substr(7)
		if arg.begins_with("--walk="):
			walk = arg.substr(7)
	if shot != "":
		await load_place(walk if walk != "" else "office", false)
		_take_shot(shot)
		return
	await load_place("office", false)
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--autoplay="):
			_autoplay(arg.substr(11))
			return
	if api.signed_in():
		go_online()
	else:
		show_login()


# ---------------------------------------------------------------- input

func _setup_input() -> void:
	var keys := {
		"move_forward": [KEY_W, KEY_UP], "move_back": [KEY_S, KEY_DOWN], "move_left": [KEY_A], "move_right": [KEY_D],
		"turn_left": [KEY_LEFT], "turn_right": [KEY_RIGHT], "hurry": [KEY_SHIFT], "interact": [KEY_E, KEY_SPACE],
		"back": [KEY_ESCAPE], "pause": [], "notebook": [KEY_TAB, KEY_N], "map": [KEY_M], "evidence": [KEY_I], "cursor": [KEY_ALT],
		"look_left": [], "look_right": [], "look_up": [], "look_down": [],
	}
	var axes := {
		"move_forward": [JOY_AXIS_LEFT_Y, -1.0], "move_back": [JOY_AXIS_LEFT_Y, 1.0], "move_left": [JOY_AXIS_LEFT_X, -1.0], "move_right": [JOY_AXIS_LEFT_X, 1.0],
		"look_left": [JOY_AXIS_RIGHT_X, -1.0], "look_right": [JOY_AXIS_RIGHT_X, 1.0], "look_up": [JOY_AXIS_RIGHT_Y, -1.0], "look_down": [JOY_AXIS_RIGHT_Y, 1.0],
	}
	var buttons := {"interact": [JOY_BUTTON_A], "back": [JOY_BUTTON_B], "pause": [JOY_BUTTON_START], "hurry": [JOY_BUTTON_LEFT_STICK], "notebook": [JOY_BUTTON_BACK], "map": [JOY_BUTTON_Y], "evidence": [JOY_BUTTON_X]}
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
	# The left stick moves through menus as well as the D-pad.
	for pair in [["ui_up", JOY_AXIS_LEFT_Y, -1.0], ["ui_down", JOY_AXIS_LEFT_Y, 1.0], ["ui_left", JOY_AXIS_LEFT_X, -1.0], ["ui_right", JOY_AXIS_LEFT_X, 1.0]]:
		var jm := InputEventJoypadMotion.new()
		jm.axis = pair[1]
		jm.axis_value = pair[2]
		InputMap.action_add_event(pair[0], jm)


func _unhandled_input(event: InputEvent) -> void:
	if screen != null:
		if event.is_action_pressed("back") and screen.name != "Login":
			get_viewport().set_input_as_handled()
			close_screen()
		return
	if busy:
		return
	if event.is_action_pressed("back") or event.is_action_pressed("pause"):
		show_pause()
	elif event.is_action_pressed("notebook"):
		if online:
			open_screen(NotebookScreen.new(self))
	elif event.is_action_pressed("map"):
		open_map()
	elif event.is_action_pressed("evidence"):
		open_evidence()
	elif event.is_action_pressed("cursor"):
		# Hold Alt to bring the pointer back and click the corner (the map, the notes, the evidence).
		Input.mouse_mode = Input.MOUSE_MODE_VISIBLE
	elif event.is_action_released("cursor") and screen == null:
		Input.mouse_mode = Input.MOUSE_MODE_CAPTURED
	elif event.is_action_pressed("interact"):
		if Input.mouse_mode != Input.MOUSE_MODE_CAPTURED and event is InputEventMouseButton:
			Input.mouse_mode = Input.MOUSE_MODE_CAPTURED
		elif not focus_hs.is_empty():
			interact(focus_hs)


func _walking(on: bool) -> void:
	player.enabled = on
	hud.visible = on
	Input.mouse_mode = Input.MOUSE_MODE_CAPTURED if on else Input.MOUSE_MODE_VISIBLE


# ---------------------------------------------------------------- places

## Builds the 3D place for a location (unless it's already standing), and puts you where you arrive.
func load_place(loc: String, fade_in := true) -> void:
	var file: String = SCENES.get(loc, "")
	if file == "":
		toast("That place hasn't been built for the desktop yet.")
		return
	here = loc
	if file != scene_file:
		if fade_in:
			await _fade(1.0, 0.35)
		if world:
			world.queue_free()
		markers.clear()
		data = JSON.parse_string(FileAccess.get_file_as_string("res://data/%s.json" % file))
		scene_file = file
		world = Node3D.new()
		world.name = "World"
		add_child(world)
		room = RoomBuilder.new()
		room.build(world, data)
		_build_markers()
		player.room = room
		player.eye = float(data.get("eye", 1.673))
		if player.get_parent():
			player.get_parent().remove_child(player)
		world.add_child(player)
		_place_player(loc)
		room.apply_visible(visible_ids if online else _offline_visible())
		await get_tree().process_frame
		if fade_in:
			_fade(0.0, 0.6)
	else:
		var r := room.room_at(player.position.x, player.position.z)
		if String(r.get("location", "")) != loc:
			_place_player(loc)
	var rr := room.room_at(player.position.x, player.position.z)
	place_label.text = String(rr.get("name", data.get("name", "")))
	_entering = ""
	_update_corner()


func _place_player(loc: String) -> void:
	var s: Array = []
	var starts: Dictionary = data.get("starts", {})
	if starts.has(loc):
		s = starts[loc]
	elif data.has("start"):
		s = data.start
	else:
		for r in data.get("rooms", []):
			if r.get("location", "") == loc:
				s = [r.center[0], r.center[1], 0]
	if s.is_empty():
		s = [0, 0, 0]
	player.place(float(s[0]), float(s[1]), float(s[2]))


func _fade(to: float, t: float) -> void:
	var tw := create_tween()
	tw.tween_property(fade, "color:a", to, t)
	await tw.finished


func travel(loc: String) -> void:
	if not online:
		close_screen()
		await _travel_card(loc, _offline_name(loc), "")
		return
	if busy:
		return
	busy = true
	close_screen()
	var r := await act({"type": "travel", "locationId": loc}, false)
	busy = false
	if r.has("error"):
		return
	if r.has("outcome") and String(r.outcome.get("kind", "none")) != "none":
		handle_outcome(r.outcome)


func _travel_card(loc: String, name: String, subtitle: String) -> void:
	busy = true
	await _fade(1.0, 0.4)
	var card := VBoxContainer.new()
	card.set_anchors_preset(Control.PRESET_CENTER)
	card.position = Vector2(-500, -60)
	card.custom_minimum_size = Vector2(1000, 0)
	var l1 := UI.label(name, 40, UI.BRASS)
	l1.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	card.add_child(l1)
	var l2 := UI.label(subtitle, 22, UI.DIM)
	l2.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	card.add_child(l2)
	ui_root.add_child(card)
	var started := Time.get_ticks_msec()
	await load_place(loc, false)
	var left := 1600 - (Time.get_ticks_msec() - started)
	if left > 0:
		await get_tree().create_timer(left / 1000.0).timeout
	card.queue_free()
	await _fade(0.0, 0.6)
	busy = false


func _offline_name(loc: String) -> String:
	for p in OFFLINE_PLACES:
		if p[0] == loc:
			return p[1]
	return loc


func _offline_visible() -> Array:
	var ids: Array = []
	for hs in data.get("hotspots", []):
		if String(hs.get("visit", "A")) == "A":
			ids.append(String(hs.get("game", hs.id)))
	return ids


# ---------------------------------------------------------------- hotspots

func _build_markers() -> void:
	for hs in data.get("hotspots", []):
		var l := Label3D.new()
		l.billboard = BaseMaterial3D.BILLBOARD_ENABLED
		l.no_depth_test = true
		l.fixed_size = true
		l.pixel_size = 0.0009
		l.font_size = 30
		l.outline_size = 10
		l.modulate = UI.BRASS
		l.text = "○" if hs.kind == "switch" else ("↓" if hs.kind == "seat" else ("…" if hs.get("person") else "?"))
		l.position = Vector3(float(hs.at[0]), float(hs.at[1]), float(hs.at[2]))
		l.visible = false
		world.add_child(l)
		markers[hs.id] = l


func _hs_shown(hs: Dictionary) -> bool:
	if hs.kind == "switch":
		return true
	if hs.kind == "seat":
		return not player.is_seated()
	var game_id := String(hs.get("game", hs.id))
	if online:
		return visible_ids.has(game_id)
	return String(hs.get("visit", "A")) == "A"


func _attention(game_id: String) -> String:
	for h in view.get("location", {}).get("hotspots", []):
		if h.id == game_id and h.get("attention", false):
			return String(h.get("callout", "")) if h.get("callout") else "!"
	return ""


func _update_focus() -> void:
	var cam := player.camera.global_position
	var fwd := player.forward()
	var best := {}
	var best_score := 1e9
	for hs in data.get("hotspots", []):
		var m: Label3D = markers.get(hs.id)
		if m == null:
			continue
		var at := Vector3(float(hs.at[0]), float(hs.at[1]), float(hs.at[2]))
		var to := at - cam
		var dist := to.length()
		var game_id := String(hs.get("game", hs.id))
		var att := _attention(game_id) if online else ""
		var reach := 9.0 if att != "" else NEAR
		var same_room := String(room.room_at(at.x, at.z).get("id", "")) == String(room.room_at(cam.x, cam.z).get("id", ""))
		var shown := _hs_shown(hs) and dist < reach and fwd.dot(to) > 0.0 and same_room
		m.visible = shown
		if hs.kind == "switch":
			m.text = "●" if room.is_on(String(hs.light)) else "○"
		if not shown:
			continue
		m.modulate = Color("e8b54a") if att != "" else UI.BRASS
		if dist > NEAR:
			continue
		var ang := rad_to_deg(fwd.angle_to(to))
		var limit := 9.0 + 10.0 / maxf(dist, 0.4)
		if ang < limit and ang + dist * 2.0 < best_score:
			best_score = ang + dist * 2.0
			best = hs
	focus_hs = best
	if best.is_empty():
		prompt.text = ""
		return
	(markers[best.id] as Label3D).modulate = UI.PAPER
	var btn := "A" if Input.get_connected_joypads().size() > 0 else "E"
	var verb := ""
	if best.kind == "switch":
		verb = "flip the switch"
	elif best.kind == "seat":
		verb = "sit down"
	elif best.get("person"):
		verb = "talk to " + _label_for(best).split(",")[0]
	else:
		verb = "look at the " + _label_for(best).to_lower()
	prompt.text = "%s: %s" % [btn, verb]


func _label_for(hs: Dictionary) -> String:
	if online:
		for h in view.get("location", {}).get("hotspots", []):
			if h.id == hs.get("game", hs.id):
				return String(h.label)
	return String(hs.label)


func interact(hs: Dictionary) -> void:
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
	var game_id := String(hs.get("game", hs.id))
	if not online:
		var t := String(hs.get("text", ""))
		var parts := t.split(": ", true, 1)
		open_screen(ReaderScreen.new(self, {"kind": "note", "title": String(hs.label), "text": (parts[1] if parts.size() > 1 else t) + "\n\n[color=#9c907c]Sign in to play the case.[/color]"}))
		return
	busy = true
	await act({"type": "hotspot", "hotspotId": game_id})
	busy = false


# ---------------------------------------------------------------- the server

func go_online() -> void:
	busy = true
	toast("Opening the Whitmore File...")
	var r := await api.view(case_id)
	busy = false
	if not r.ok:
		if r.code == 401:
			api.sign_out()
			show_login("Your session has ended. Sign in again.")
		else:
			show_login(String(r.data.get("error", "Could not reach Blackwood.")))
		return
	online = true
	close_screen(false)
	take_view(r.data.response.view)
	_walking(true)
	if not bool(view.get("introSeen", true)):
		_show_intro()
	elif view.get("status") == "closed" and view.get("closure") is Dictionary:
		toast("This case is closed. You can walk the places and read your notes.")
	else:
		toast("Signed in as %s." % api.email)


## Runs one game action on the server: takes the new view, then (if `route`) shows what came of it.
func act(action: Dictionary, route := true) -> Dictionary:
	var r := await api.play(case_id, action)
	if r.has("error"):
		toast(String(r.error))
		if not r.get("saved", true):
			toast(String(r.error) + " (not saved)")
		return r
	if r.has("view"):
		take_view(r.view)
	if route and r.has("outcome"):
		handle_outcome(r.outcome)
	return r


func take_view(v: Dictionary) -> void:
	var old_loc := here
	var old_labs := _labs_done(view)
	view = v
	visible_ids = []
	for h in v.get("location", {}).get("hotspots", []):
		visible_ids.append(h.id)
	var lines := PackedStringArray()
	for o in v.get("objectives", []):
		if not o.get("done", false) and not o.get("optional", false):
			lines.append("•  " + String(o.text))
	objectives.text = ("OBJECTIVES\n" + "\n".join(lines.slice(0, 4))) if lines.size() > 0 else ""
	if room:
		room.apply_visible(visible_ids)
	# Notices from the case, once each.
	var msgs: Array = v.get("messages", [])
	if msgs.size() > 0:
		for m in msgs:
			if not _shown_messages.has(m):
				_shown_messages[m] = true
				toast(String(m))
		act({"type": "dismissMessages"}, false)
	# The telephone rings at the office.
	var ringing: bool = v.get("phone", {}).get("ringing") is Dictionary and (String(v.get("location", {}).get("id", "")) == "office" or v.get("phone", {}).get("mobile", false))
	if ringing and not ring_player.playing:
		ring_player.play()
	elif not ringing and ring_player.playing:
		ring_player.stop()
	if _labs_done(v) > old_labs:
		toast("Lab results are back at the office.")
	_labs_waiting = false
	for l in v.get("labs", []):
		if not l.get("done", false):
			_labs_waiting = true
	_update_music()
	var loc := String(v.get("location", {}).get("id", here))
	if loc != old_loc or loc != here:
		var lv: Dictionary = v.get("location", {})
		if SCENES.get(loc, "") == scene_file:
			load_place(loc)
		else:
			_travel_card(loc, String(lv.get("name", "")), String(lv.get("subtitle", "")))
	_update_corner()
	if screen and screen.has_method("on_view"):
		screen.on_view(v)


func _labs_done(v: Dictionary) -> int:
	var n := 0
	for l in v.get("labs", []):
		if l.get("done", false):
			n += 1
	return n


func handle_outcome(o: Dictionary) -> void:
	match String(o.get("kind", "none")):
		"none":
			pass
		"panel":
			open_panel(String(o.panel))
		"conversation":
			var room_person := _person_here(String(o.characterId))
			if screen and screen.get_script() == InterviewScreen and screen.character_id == String(o.characterId):
				screen.show_outcome(o)
			else:
				var in_room: bool = room_person != "" and String(o.medium) != "telephone"
				open_screen(InterviewScreen.new(self, o, in_room))
				if in_room:
					_face_id = room_person
					player.camera_free = true
		"verdict":
			if o.get("correct", false):
				_show_closure(o)
			else:
				open_screen(ReaderScreen.new(self, {"kind": "note", "title": "The agency returned your report", "text": "%s\n\n%s" % [o.get("feedback", ""), o.get("note", "")]}))
		"error":
			toast(String(o.get("message", "")))
		"sequence", "compare":
			toast(String(o.get("message", o.get("comment", ""))))
		_:
			open_screen(ReaderScreen.new(self, o))


func open_panel(p: String) -> void:
	match p:
		"casefile":
			act({"type": "readDocument", "documentId": "casefile"})
		"board":
			open_screen(BoardScreen.new(self))
		"notebook":
			open_screen(NotebookScreen.new(self))
		"map":
			open_map()
		"phone":
			open_screen(PhoneScreen.new(self))
		"statements":
			open_screen(TapesScreen.new(self))
		"delivery":
			open_screen(MailScreen.new(self))
		"conclusion":
			open_screen(ReportScreen.new(self))
		_:
			toast("That isn't in the desktop version yet.")


func open_map() -> void:
	if online:
		open_screen(MapScreen.new(self))
		return
	var s := Screen.new(self)
	var v := s.frame("Where to? (offline)", 700)
	for p in OFFLINE_PLACES:
		var id: String = p[0]
		var b := UI.button(p[1], func() -> void: travel(id))
		v.add_child(b)
		if s.first_focus is Button and (s.first_focus as Button).text == "Close":
			s.first_focus = b
	open_screen(s)


## The talk hotspot of someone standing in this place, or "".
func _person_here(character_id: String) -> String:
	for hs in data.get("hotspots", []):
		if String(hs.get("person", "")) == character_id and room.people.has(String(hs.id)):
			return String(hs.id)
	return ""


func _show_intro() -> void:
	var cards: Array = []
	var intro: Array = view.get("intro", [])
	for i in intro.size():
		cards.append({"heading": intro[i].get("heading", ""), "text": intro[i].get("text", ""), "voice": {"kind": "intro", "id": "intro", "n": i, "speaker": "narrator"}})
	if cards.is_empty():
		act({"type": "dismissIntro"}, false)
		return
	open_screen(StoryScreen.new(self, String(view.get("title", "")), cards, func() -> void: act({"type": "dismissIntro"}, false), "/art/c001_cover.webp"))


func _show_closure(o: Dictionary) -> void:
	var c = view.get("closure")
	if not (c is Dictionary):
		open_screen(ReaderScreen.new(self, {"kind": "note", "title": "Case closed", "text": String(o.get("feedback", ""))}))
		return
	var cards: Array = [{"heading": "Report accepted", "text": String(c.get("accepted", "")), "voice": {"kind": "resolution", "id": "accepted", "n": 0, "speaker": "narrator"}}]
	var rec: Array = c.get("reconstruction", [])
	for i in rec.size():
		cards.append({"heading": rec[i].heading, "text": rec[i].body, "voice": {"kind": "resolution", "id": "reconstruction", "n": i, "speaker": "narrator"}})
	var ben: Array = c.get("bennett", [])
	var caller := "Det. Frank Bennett"
	if c.get("caller") is Dictionary:
		caller = String(c.caller.name)
	for i in ben.size():
		cards.append({"heading": caller if i == 0 else "", "text": "“%s”" % ben[i], "voice": {"kind": "resolution", "id": "bennett", "n": i, "speaker": "bennett"}})
	var rec_info = o.get("record")
	if rec_info is Dictionary:
		var t := "Case closed."
		if rec_info.get("rank"):
			t += " Rank: %s." % rec_info.rank
		if (rec_info.get("awarded", []) as Array).size() > 0:
			t += " Awarded: %s." % ", ".join(PackedStringArray(rec_info.awarded))
		cards.append({"heading": "Service record", "text": t})
	open_screen(StoryScreen.new(self, "The Whitmore File", cards, Callable(), "/art/c001_cover.webp"))


# ---------------------------------------------------------------- helpers for the screens

func evidence_by_id(id: String) -> Dictionary:
	for e in view.get("evidence", []):
		if e.id == id:
			return e
	return {}


func collected_evidence() -> Array:
	var out: Array = []
	for e in view.get("evidence", []):
		if e.get("collected", false):
			out.append(e)
	return out


func on_board(id: String) -> bool:
	for it in view.get("board", {}).get("items", []):
		if it.id == id:
			return true
	return false


func pin(id: String) -> void:
	await act({"type": "boardAdd", "itemId": id, "x": randf_range(8, 85), "y": randf_range(8, 75)}, false)
	toast("Pinned to the murder board at the office.")


func character_name(id: String) -> String:
	for c in view.get("characters", []):
		if c.id == id:
			return String(c.name)
	return "A voice"


## Case art: from the game's own files when it ships with them, otherwise from the website.
func fetch_texture(path: String) -> Texture2D:
	if path == "":
		return null
	if _textures.has(path):
		return _textures[path]
	var local := "res://" + path.trim_prefix("/")
	var tex: Texture2D = null
	if path.begins_with("/art/") and ResourceLoader.exists(local):
		tex = load(local)
	elif online:
		tex = await api.texture(path)
	if tex:
		_textures[path] = tex
	return tex


func load_picture(rect: TextureRect, path: String) -> void:
	var tex := await fetch_texture(path)
	if tex and is_instance_valid(rect):
		rect.texture = tex


# ---------------------------------------------------------------- screens

func open_screen(s: Control) -> void:
	close_screen(false)
	screen = s
	ui_root.add_child(s)
	_walking(false)
	hud.visible = false
	if s.has_method("focus_first"):
		s.call_deferred("focus_first")


func close_screen(resume := true) -> void:
	if screen:
		if screen.has_method("on_close"):
			screen.on_close()
		screen.queue_free()
		screen = null
	if _face_id != "":
		_face_id = ""
		player.camera_free = false
		player.camera.position = Vector3.ZERO
	if resume:
		_walking(true)


func toast(text: String) -> void:
	if text == "":
		return
	toast_label.text = text
	toast_label.modulate.a = 1.0
	var tw := create_tween()
	tw.tween_interval(3.8)
	tw.tween_property(toast_label, "modulate:a", 0.0, 0.8)


func stamp(text: String) -> void:
	stamp_label.text = text
	stamp_label.modulate.a = 1.0
	stamp_label.scale = Vector2(1.6, 1.6)
	var tw := create_tween()
	tw.tween_property(stamp_label, "scale", Vector2.ONE, 0.18)
	tw.tween_interval(0.9)
	tw.tween_property(stamp_label, "modulate:a", 0.0, 0.5)


func _build_hud() -> void:
	hud = Control.new()
	hud.set_anchors_preset(Control.PRESET_FULL_RECT)
	hud.mouse_filter = Control.MOUSE_FILTER_IGNORE
	ui_root.add_child(hud)
	var dot := Panel.new()
	var sb := StyleBoxFlat.new()
	sb.bg_color = Color(1, 1, 1, 0.7)
	sb.set_corner_radius_all(4)
	dot.add_theme_stylebox_override("panel", sb)
	dot.size = Vector2(6, 6)
	dot.set_anchors_preset(Control.PRESET_CENTER)
	# The aiming dot sits exactly under the hidden pointer: it must not swallow the mouse's movement.
	dot.mouse_filter = Control.MOUSE_FILTER_IGNORE
	dot.position -= Vector2(3, 3)
	hud.add_child(dot)
	prompt = _outlined(UI.label("", 24))
	prompt.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	prompt.set_anchors_preset(Control.PRESET_CENTER)
	prompt.size = Vector2(1000, 40)
	prompt.position = Vector2(-500, 40)
	hud.add_child(prompt)
	objectives = _outlined(UI.label("", 19))
	objectives.position = Vector2(40, 70)
	objectives.size = Vector2(640, 300)
	hud.add_child(objectives)
	place_label = _outlined(UI.label("", 20, UI.DIM))
	place_label.size = Vector2(700, 40)
	place_label.position = Vector2(40, 30)
	hud.add_child(place_label)
	_build_corner()
	var keys := _outlined(UI.label("Hold Alt for the pointer     Esc / Start: menu", 16, UI.DIM))
	keys.set_anchors_preset(Control.PRESET_BOTTOM_LEFT)
	keys.position = Vector2(40, -50)
	keys.size = Vector2(900, 30)
	hud.add_child(keys)
	toast_label = _outlined(UI.label("", 22))
	toast_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	toast_label.set_anchors_preset(Control.PRESET_CENTER_BOTTOM)
	toast_label.size = Vector2(1300, 80)
	toast_label.position = Vector2(-650, -150)
	toast_label.z_index = 10
	ui_root.add_child(toast_label)
	stamp_label = _outlined(UI.label("", 54, Color("c0392b")))
	stamp_label.set_anchors_preset(Control.PRESET_CENTER)
	stamp_label.size = Vector2(600, 80)
	stamp_label.position = Vector2(-300, -240)
	stamp_label.pivot_offset = Vector2(300, 40)
	stamp_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	stamp_label.rotation = -0.12
	stamp_label.modulate.a = 0.0
	stamp_label.z_index = 10
	ui_root.add_child(stamp_label)
	fade = ColorRect.new()
	fade.color = Color(0, 0, 0, 1)
	fade.set_anchors_preset(Control.PRESET_FULL_RECT)
	fade.mouse_filter = Control.MOUSE_FILTER_IGNORE
	fade.z_index = 5
	ui_root.add_child(fade)
	_fade(0.0, 0.8)


func _build_corner() -> void:
	var R := CORNER_R
	corner = Control.new()
	corner.set_anchors_preset(Control.PRESET_TOP_RIGHT)
	corner.mouse_filter = Control.MOUSE_FILTER_IGNORE
	corner.size = Vector2(R + 140, R + 170)
	corner.position = Vector2(-corner.size.x, 0)
	hud.add_child(corner)

	corner_map = Button.new()
	corner_map.flat = true
	corner_map.focus_mode = Control.FOCUS_NONE
	corner_map.position = Vector2(corner.size.x - R, 0)
	corner_map.size = Vector2(R, R)
	corner_map.tooltip_text = "Map"
	corner_map.pressed.connect(open_map)
	var shade := Panel.new()
	var sb := StyleBoxFlat.new()
	sb.bg_color = Color(0, 0, 0, 0.55)
	sb.corner_radius_bottom_left = int(R)
	sb.shadow_color = Color(0, 0, 0, 0.6)
	sb.shadow_size = 14
	shade.add_theme_stylebox_override("panel", sb)
	shade.set_anchors_preset(Control.PRESET_FULL_RECT)
	shade.mouse_filter = Control.MOUSE_FILTER_IGNORE
	corner_map.add_child(shade)
	var pic := TextureRect.new()
	pic.set_anchors_preset(Control.PRESET_FULL_RECT)
	pic.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	pic.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	pic.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var mask := ShaderMaterial.new()
	mask.shader = preload("res://scripts/corner_map.gdshader")
	pic.material = mask
	corner_map.add_child(pic)
	load_picture(pic, "/art/%s_map.webp" % case_id.to_lower())
	var chip := _chip("MAP", "map")
	chip.position = Vector2(R * 0.42, R * 0.52)
	corner_map.add_child(chip)
	corner_map.mouse_entered.connect(func() -> void: corner_map.modulate = Color(1.12, 1.12, 1.12))
	corner_map.mouse_exited.connect(func() -> void: corner_map.modulate = Color.WHITE)
	corner.add_child(corner_map)

	corner_notes = _corner_object("/art/%s_obj_notebook.webp" % case_id.to_lower(), "NOTEBOOK", "notebook", func() -> void:
		if online:
			open_screen(NotebookScreen.new(self)))
	corner_notes.position = Vector2(corner.size.x - R - 12 - 110, 10)
	corner.add_child(corner_notes)

	corner_evidence = _corner_object("/art/%s_obj_evidence_bag.webp" % case_id.to_lower(), "EVIDENCE", "evidence", open_evidence)
	corner_evidence.position = Vector2(corner.size.x - 12 - 110, R + 12)
	corner.add_child(corner_evidence)
	_evidence_count = Label.new()
	_evidence_count.add_theme_font_size_override("font_size", 16)
	_evidence_count.add_theme_color_override("font_color", Color("14100c"))
	var badge := StyleBoxFlat.new()
	badge.bg_color = UI.BRASS
	badge.set_corner_radius_all(12)
	badge.content_margin_left = 7
	badge.content_margin_right = 7
	_evidence_count.add_theme_stylebox_override("normal", badge)
	_evidence_count.position = Vector2(84, -4)
	_evidence_count.mouse_filter = Control.MOUSE_FILTER_IGNORE
	corner_evidence.add_child(_evidence_count)
	_update_corner()


## A painted object in the corner (the notebook, the evidence bag): the picture, then its name and key.
func _corner_object(image: String, label: String, action: String, on_press: Callable) -> Button:
	var b := Button.new()
	b.flat = true
	b.focus_mode = Control.FOCUS_NONE
	b.size = Vector2(110, 120)
	b.tooltip_text = label.capitalize()
	b.pressed.connect(on_press)
	var pic := TextureRect.new()
	pic.position = Vector2(8, 0)
	pic.size = Vector2(94, 82)
	pic.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	pic.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	pic.mouse_filter = Control.MOUSE_FILTER_IGNORE
	b.add_child(pic)
	load_picture(pic, image)
	var chip := _chip(label, action)
	chip.position = Vector2(0, 86)
	b.add_child(chip)
	b.mouse_entered.connect(func() -> void: pic.position.y = -5)
	b.mouse_exited.connect(func() -> void: pic.position.y = 0)
	return b


## A small dark label with the object's name and its key (or controller button).
func _chip(text: String, action: String) -> Control:
	var p := PanelContainer.new()
	var sb := StyleBoxFlat.new()
	sb.bg_color = Color(0.05, 0.06, 0.075, 0.85)
	sb.set_corner_radius_all(2)
	sb.content_margin_left = 8
	sb.content_margin_right = 8
	sb.content_margin_top = 2
	sb.content_margin_bottom = 2
	p.add_theme_stylebox_override("panel", sb)
	p.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var h := HBoxContainer.new()
	h.add_theme_constant_override("separation", 8)
	h.mouse_filter = Control.MOUSE_FILTER_IGNORE
	p.add_child(h)
	var t := UI.label(text, 14, UI.PAPER)
	t.autowrap_mode = TextServer.AUTOWRAP_OFF
	t.mouse_filter = Control.MOUSE_FILTER_IGNORE
	h.add_child(t)
	var k := UI.label("", 14, UI.BRASS)
	k.autowrap_mode = TextServer.AUTOWRAP_OFF
	k.mouse_filter = Control.MOUSE_FILTER_IGNORE
	h.add_child(k)
	_hints[action] = k
	return p


## Shows what belongs in the corner here (in the office the map and notebook are part of the room),
## the evidence count, and the keys for whichever is in use, keyboard or controller.
func _update_corner() -> void:
	if corner == null:
		return
	var at_office := here == "office"
	var R := CORNER_R
	corner_map.visible = not at_office
	corner_notes.visible = online and not at_office
	corner_evidence.visible = online
	corner_evidence.position = Vector2(corner.size.x - 12 - 110, 10 if at_office else R + 12)
	var n := collected_evidence().size()
	_evidence_count.text = str(n)
	_evidence_count.visible = online
	if _seen_evidence < 0 or not online:
		_seen_evidence = n
	if n > _seen_evidence and (_evidence_pulse == null or not _evidence_pulse.is_valid()):
		_evidence_pulse = create_tween().set_loops()
		_evidence_pulse.tween_property(corner_evidence, "modulate", Color(1.5, 1.3, 0.9), 0.6)
		_evidence_pulse.tween_property(corner_evidence, "modulate", Color.WHITE, 0.6)
	var pad := Input.get_connected_joypads().size() > 0
	var keys := {"map": "Y" if pad else "M", "notebook": "Back" if pad else "Tab", "evidence": "X" if pad else "I"}
	for a in _hints:
		(_hints[a] as Label).text = keys.get(a, "")


func open_evidence() -> void:
	if not online:
		return
	_seen_evidence = collected_evidence().size()
	if _evidence_pulse and _evidence_pulse.is_valid():
		_evidence_pulse.kill()
	corner_evidence.modulate = Color.WHITE
	open_screen(NotebookScreen.new(self, 1))


func _outlined(l: Label) -> Label:
	l.add_theme_constant_override("outline_size", 8)
	l.add_theme_color_override("font_outline_color", Color.BLACK)
	l.mouse_filter = Control.MOUSE_FILTER_IGNORE
	return l


func show_login(message := "") -> void:
	var s := Screen.new(self)
	s.name = "Login"
	var v := s.frame("Blackwood Investigations", 660, 0, 0.75)
	(v.get_child(0).get_child(1) as Button).visible = false
	v.add_child(UI.label("Sign in with your Blackwood agency account. Your investigation is the same one you play on the website.", 19, UI.DIM))
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
			go_online()
		else:
			status.text = String(r.data.get("error", "Could not sign in."))
	pw.text_submitted.connect(func(_t: String) -> void: go.call())
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 12)
	var sign := UI.button("Sign in", go)
	sign.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	row.add_child(sign)
	var off := UI.button("Walk the places offline", func() -> void:
		online = false
		close_screen(false)
		_walking(true)
		toast("Offline: walk and look around. M or Y for the map. Sign in from the menu to play."))
	off.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	row.add_child(off)
	v.add_child(row)
	v.add_child(UI.button("Quit", func() -> void: get_tree().quit()))
	s.first_focus = em if em.text == "" else pw
	open_screen(s)


func show_pause() -> void:
	var s := Screen.new(self)
	var v := s.frame("Blackwood Investigations", 640)
	v.add_child(UI.label(("Signed in as %s" % api.email) if online else "Offline", 18, UI.DIM))
	var resume := UI.button("Back to the investigation", func() -> void: close_screen())
	v.add_child(resume)
	if online:
		v.add_child(UI.button("Notebook", func() -> void: open_screen(NotebookScreen.new(self))))
		v.add_child(UI.button("Map", func() -> void: open_map()))
		v.add_child(UI.button("Sign out", func() -> void:
			api.sign_out()
			online = false
			view = {}
			visible_ids = []
			objectives.text = ""
			_update_music()
			show_login()))
	else:
		v.add_child(UI.button("Map", func() -> void: open_map()))
		v.add_child(UI.button("Sign in", func() -> void: show_login()))
	if online:
		var voices_on: bool = view.get("voices", true)
		v.add_child(UI.button("Character voices: %s" % ("on" if voices_on else "off"), func() -> void:
			await act({"type": "setVoices", "enabled": not voices_on}, false)
			show_pause()))
		var narr_on: bool = view.get("narration", false)
		v.add_child(UI.button("Evidence read aloud: %s" % ("on" if narr_on else "off"), func() -> void:
			await act({"type": "setNarration", "enabled": not narr_on}, false)
			show_pause()))
		if view.get("status") == "closed" and view.get("closure") is Dictionary:
			v.add_child(UI.button("Hear the ending again", func() -> void: _show_closure({})))
	v.add_child(UI.label("Music", 18, UI.DIM))
	var ms := HSlider.new()
	ms.max_value = 1.0
	ms.step = 0.05
	ms.value = music_volume
	ms.value_changed.connect(func(x: float) -> void:
		music_volume = x
		_apply_volumes())
	v.add_child(ms)
	v.add_child(UI.label("Voices", 18, UI.DIM))
	var vs := HSlider.new()
	vs.max_value = 1.0
	vs.step = 0.05
	vs.value = voice_volume
	vs.value_changed.connect(func(x: float) -> void:
		voice_volume = x
		_apply_volumes())
	v.add_child(vs)
	v.add_child(UI.label("Move: WASD or left stick   Look: mouse or right stick   Hurry: Shift or L3\nUse: E, click or A   Notebook: Tab or Back   Map: M or Y   Evidence: I or X\nHold Alt for the pointer   Back: Esc or B", 16, UI.DIM))
	v.add_child(UI.button("Quit", func() -> void: get_tree().quit()))
	s.first_focus = resume
	open_screen(s)


# ---------------------------------------------------------------- every frame

func _process(dt: float) -> void:
	if room == null:
		return
	room.animate(dt, _face_id)
	# Mouth movement follows the voice.
	var mag := 0.0
	if voice_player.playing and _spectrum:
		mag = _spectrum.get_magnitude_for_frequency_range(120, 3200).length()
	voice_level = lerpf(voice_level, clampf(mag * 9.0, 0.0, 1.0), minf(1.0, dt * 18.0))
	var talker := _person_here(_speaker) if _speaker != "" else ""
	for id in room.people:
		room.set_jaw(id, voice_level if id == talker else 0.0)
	if _face_id != "":
		_interview_camera(dt)
	if player.enabled and screen == null:
		_update_focus()
		_check_doorways()
	if online and _labs_waiting:
		_lab_timer += dt
		if _lab_timer > 15.0 and not busy:
			_lab_timer = 0.0
			act({"type": "checkLabs"}, false)


## Walking through a doorway into a room that is another location (the kitchen) goes there in the case.
func _check_doorways() -> void:
	var r := room.room_at(player.position.x, player.position.z)
	if r.is_empty():
		return
	place_label.text = String(r.name)
	if not online or busy:
		return
	var loc := String(r.get("location", ""))
	var enter := String(r.get("enter", ""))
	if loc != "" and loc != here and enter != "" and _entering != loc:
		_entering = loc
		here = loc
		act({"type": "hotspot", "hotspotId": enter}, false)


func _interview_camera(dt: float) -> void:
	var f := room.face_of(_face_id)
	if f.is_empty():
		return
	var head: Vector3 = f.head
	var fwd: Vector3 = f.forward
	var cam_pos := head + fwd * 0.95 + Vector3(0, 0.02, 0)
	var dir := (head - cam_pos).normalized()
	var right := dir.cross(Vector3.UP).normalized()
	var target := Transform3D(Basis(), cam_pos).looking_at(head + right * 0.33, Vector3.UP)
	var cam := player.camera
	cam.global_transform = cam.global_transform.interpolate_with(target, minf(1.0, dt * 3.5))


# ---------------------------------------------------------------- sound

func _setup_audio() -> void:
	var idx := AudioServer.bus_count
	AudioServer.add_bus(idx)
	AudioServer.set_bus_name(idx, "Voice")
	AudioServer.set_bus_send(idx, "Master")
	AudioServer.add_bus_effect(idx, AudioEffectSpectrumAnalyzer.new())
	_spectrum = AudioServer.get_bus_effect_instance(idx, 0)
	voice_player = AudioStreamPlayer.new()
	voice_player.bus = "Voice"
	add_child(voice_player)
	voice_player.finished.connect(_next_line)
	music_player = AudioStreamPlayer.new()
	add_child(music_player)
	music_player.finished.connect(_next_track)
	ambience_player = AudioStreamPlayer.new()
	add_child(ambience_player)
	ring_player = AudioStreamPlayer.new()
	ring_player.stream = _ring_tone()
	ring_player.volume_db = -8.0
	add_child(ring_player)
	_apply_volumes()


func _apply_volumes() -> void:
	var duck := 0.5 if voice_player.playing else 1.0
	music_player.volume_db = linear_to_db(maxf(0.0001, music_volume * 0.35 * duck))
	ambience_player.volume_db = linear_to_db(maxf(0.0001, music_volume * 0.6 * duck))
	voice_player.volume_db = linear_to_db(maxf(0.0001, voice_volume))


## An old desk telephone's bell: two seconds of ringing, four of quiet, round and round.
func _ring_tone() -> AudioStreamWAV:
	var rate := 22050
	var n := rate * 6
	var bytes := PackedByteArray()
	bytes.resize(n * 2)
	for i in n:
		var t := float(i) / rate
		var v := 0.0
		if fmod(t, 6.0) < 2.0:
			var bell := sin(TAU * 440.0 * t) + sin(TAU * 480.0 * t)
			v = bell * 0.35 * (0.6 + 0.4 * sign(sin(TAU * 20.0 * t)))
		bytes.encode_s16(i * 2, int(clampf(v, -1.0, 1.0) * 32000))
	var s := AudioStreamWAV.new()
	s.format = AudioStreamWAV.FORMAT_16_BITS
	s.mix_rate = rate
	s.data = bytes
	s.loop_mode = AudioStreamWAV.LOOP_FORWARD
	s.loop_end = n
	return s


## Speaks lines one after another: [{ kind, id, n, speaker }] (see /api/voice on the website).
func play_lines(refs: Array) -> void:
	stop_voice()
	_voice_queue = refs.duplicate()
	_next_line()


func stop_voice() -> void:
	_voice_token += 1
	_voice_queue.clear()
	voice_player.stop()
	_speaker = ""
	_apply_volumes()


func _next_line() -> void:
	_speaker = ""
	_apply_volumes()
	if _voice_queue.is_empty() or not online:
		return
	if not view.get("voices", true) and String(_voice_queue[0].get("speaker", "")) != "narrator":
		_voice_queue.clear()
		return
	var token := _voice_token
	var ref: Dictionary = _voice_queue.pop_front()
	var bytes := await api.get_bytes("/api/voice?caseId=%s&kind=%s&id=%s&n=%d" % [case_id, ref.kind, ref.id, int(ref.n)])
	if token != _voice_token:
		return
	if bytes.size() < 64:
		_next_line()
		return
	var s := AudioStreamMP3.new()
	s.data = bytes
	voice_player.stream = s
	_speaker = String(ref.get("speaker", ""))
	voice_player.play()
	_apply_volumes()


func play_url(url: String) -> void:
	stop_voice()
	var token := _voice_token
	var bytes := await _cached_audio(url)
	if token != _voice_token or bytes.size() < 64:
		return
	var s := AudioStreamMP3.new()
	s.data = bytes
	voice_player.stream = s
	voice_player.play()


func _cached_audio(url: String) -> PackedByteArray:
	var file := "user://audio_%s.mp3" % url.md5_text()
	if FileAccess.file_exists(file):
		return FileAccess.get_file_as_bytes(file)
	var bytes := await api.get_bytes(url)
	if bytes.size() > 1024:
		var f := FileAccess.open(file, FileAccess.WRITE)
		if f:
			f.store_buffer(bytes)
	return bytes


## The case's music, round and round, and each place's own room sound.
func _update_music() -> void:
	var list: Array = view.get("music", []) if online else []
	if list != _music_list:
		_music_list = list
		_music_index = 0
		music_player.stop()
		if list.size() > 0:
			_next_track()
	var amb := String(view.get("location", {}).get("ambience", "")) if online and view.get("location", {}).get("ambience") else ""
	if amb != _ambience_url:
		_ambience_url = amb
		ambience_player.stop()
		if amb != "":
			var bytes := await _cached_audio(amb)
			if amb == _ambience_url and bytes.size() > 1024:
				var s := AudioStreamMP3.new()
				s.data = bytes
				s.loop = true
				ambience_player.stream = s
				ambience_player.play()


func _next_track() -> void:
	if _music_list.is_empty():
		return
	var url := String(_music_list[_music_index % _music_list.size()])
	_music_index += 1
	var bytes := await _cached_audio(url)
	if bytes.size() > 1024 and _music_list.has(url):
		var s := AudioStreamMP3.new()
		s.data = bytes
		music_player.stream = s
		music_player.play()


# ---------------------------------------------------------------- checks

## Screenshots of a place for automated checks: -- --shot=/tmp/x.png [--walk=diner]
func _take_shot(path: String) -> void:
	_walking(true)
	Input.mouse_mode = Input.MOUSE_MODE_VISIBLE
	for i in 30:
		await get_tree().process_frame
	var base := path.get_basename()
	var s: Array = data.get("starts", {}).get(here, data.get("start", [0, 0, 0]))
	for k in 4:
		player.place(float(s[0]), float(s[1]), float(s[2]) + k * 90.0)
		player.pitch = deg_to_rad(-6)
		for i in 10:
			await get_tree().process_frame
		get_viewport().get_texture().get_image().save_png("%s_%d.png" % [base, k])
	get_tree().quit()


## Plays the case against a server from a script, taking screenshots: -- --server=... --autoplay=/tmp/dir
func _autoplay(dir: String) -> void:
	var steps: Node = load("res://scripts/autoplay.gd").new()
	add_child(steps)
	await steps.run(self, dir)
	get_tree().quit()
