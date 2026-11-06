extends Screen
## Questioning someone, in your own words. In a room, the camera turns to their face and the
## questions sit on the right; by telephone, their portrait sits on the left.

var data: Dictionary
var in_room := false
var character_id := ""
var transcript: RichTextLabel
var field: LineEdit
var ask_button: Button
var status: Label
var extra: HBoxContainer
var portrait: TextureRect
var _face_frames := {}
var _present_box: VBoxContainer
var _pending := false


func _init(g: Node, o: Dictionary, room := false) -> void:
	super(g)
	data = o
	in_room = room
	character_id = String(o.characterId)
	var shade := ColorRect.new()
	shade.color = Color(0, 0, 0, 0.0 if in_room else 0.6)
	shade.set_anchors_preset(Control.PRESET_FULL_RECT)
	shade.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(shade)
	var p := PanelContainer.new()
	p.set_anchors_preset(Control.PRESET_FULL_RECT)
	if in_room:
		p.anchor_left = 0.52
		p.offset_left = 0
		p.offset_right = -50
		p.offset_top = 60
		p.offset_bottom = -60
		var sb := (UI.theme().get_stylebox("panel", "PanelContainer") as StyleBoxFlat).duplicate() as StyleBoxFlat
		sb.bg_color = Color(0.05, 0.045, 0.04, 0.86)
		p.add_theme_stylebox_override("panel", sb)
	else:
		p.offset_left = 110
		p.offset_right = -110
		p.offset_top = 80
		p.offset_bottom = -80
	add_child(p)
	var h := HBoxContainer.new()
	h.add_theme_constant_override("separation", 26)
	p.add_child(h)
	if not in_room:
		var left := VBoxContainer.new()
		left.custom_minimum_size = Vector2(340, 0)
		h.add_child(left)
		portrait = picture(String(o.get("portrait", "")), Vector2(340, 430))
		portrait.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
		left.add_child(portrait)
		_load_face(o.get("face"))
	var right := VBoxContainer.new()
	right.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	right.add_theme_constant_override("separation", 12)
	h.add_child(right)
	var head := HBoxContainer.new()
	var who := VBoxContainer.new()
	who.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	who.add_child(UI.label(String(o.name), 28, UI.BRASS))
	var where := "By telephone" if o.medium == "telephone" else String(o.where)
	who.add_child(UI.label("%s  ·  %s" % [o.role, where], 18, UI.DIM))
	head.add_child(who)
	var leave := UI.button("Hang up" if o.medium == "telephone" else "Step away", func() -> void: game.close_screen())
	head.add_child(leave)
	right.add_child(head)
	transcript = RichTextLabel.new()
	transcript.bbcode_enabled = true
	transcript.scroll_following = true
	transcript.size_flags_vertical = Control.SIZE_EXPAND_FILL
	transcript.add_theme_font_size_override("normal_font_size", 21)
	transcript.add_theme_font_size_override("italics_font_size", 21)
	right.add_child(transcript)
	status = UI.label("", 18, UI.DIM)
	right.add_child(status)
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 10)
	field = LineEdit.new()
	field.placeholder_text = "Ask in your own words..."
	field.max_length = 300
	field.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	field.text_submitted.connect(func(_t: String) -> void: _ask())
	field.focus_entered.connect(func() -> void:
		if DisplayServer.has_feature(DisplayServer.FEATURE_VIRTUAL_KEYBOARD) and Input.get_connected_joypads().size() > 0:
			DisplayServer.virtual_keyboard_show(field.text))
	row.add_child(field)
	ask_button = UI.button("Ask", _ask)
	row.add_child(ask_button)
	right.add_child(row)
	extra = HBoxContainer.new()
	extra.add_theme_constant_override("separation", 10)
	right.add_child(extra)
	_present_box = VBoxContainer.new()
	_present_box.visible = false
	var ps := scroller(220)
	(ps[1] as VBoxContainer).add_child(_present_box)
	_present_box.visible = true
	ps[0].visible = false
	right.add_child(ps[0])
	first_focus = field
	show_outcome(o)


func show_outcome(o: Dictionary) -> void:
	data = o
	var t := PackedStringArray()
	for l in o.get("history", []):
		if l.kind == "cue":
			t.append("[color=#9c907c][i]%s[/i][/color]" % l.text)
		elif l.speakerId == "you":
			t.append("[color=#9c907c]You:[/color] %s" % l.text)
		elif l.get("via", "") == "text":
			t.append("[color=#b8944f]%s (text):[/color] %s" % [l.speaker, l.text])
		else:
			t.append("[color=#b8944f]%s:[/color] %s" % [l.speaker, l.text])
	if o.get("demeanor"):
		t.append("[color=#9c907c][i]%s[/i][/color]" % o.demeanor)
	transcript.text = "\n\n".join(t)
	var q: Dictionary = o.get("questions", {})
	var can := bool(o.get("canAsk", false))
	status.text = ("%d questions left with %s." % [int(q.get("left", 0)), String(o.name).split(" ")[0]]) if (can and q.get("limited", false)) else ("" if can else String(o.get("idle", "")))
	field.editable = can and not _pending
	ask_button.disabled = not field.editable
	for c in extra.get_children():
		c.queue_free()
	if o.medium != "telephone" and game.collected_evidence().size() > 0:
		extra.add_child(UI.button("Show them evidence", _toggle_present))
	var ext = q.get("extend")
	if ext is Dictionary:
		var lbl := "%s ($%d)" % [ext.offer, int(ext.cost)]
		extra.add_child(UI.button(lbl, func() -> void:
			game.act({"type": "extendInterview", "characterId": character_id, "requestId": "%d" % Time.get_ticks_usec()})))
	if o.get("voiced", false):
		var refs: Array = []
		for n in o.get("latest", []):
			for l in o.get("history", []):
				if int(l.n) == int(n) and l.speakerId != "you" and l.speakerId != "cue" and l.get("via", "") != "text":
					refs.append({"kind": "conversation", "id": character_id, "n": int(n), "speaker": l.speakerId})
		if refs.size() > 0:
			game.play_lines(refs)


func _ask() -> void:
	var text := field.text.strip_edges()
	if text == "" or _pending:
		return
	_pending = true
	field.text = ""
	field.editable = false
	ask_button.disabled = true
	status.text = "..."
	transcript.text += "\n\n[color=#9c907c]You:[/color] %s" % text
	var r: Dictionary = await game.act({"type": "askFree", "characterId": character_id, "text": text})
	_pending = false
	if r.has("error"):
		status.text = String(r.error)
		field.editable = true
		ask_button.disabled = false
	if is_instance_valid(field):
		field.grab_focus()


func _toggle_present() -> void:
	var box := _present_box.get_parent().get_parent() as ScrollContainer
	box.visible = not box.visible
	for c in _present_box.get_children():
		c.queue_free()
	if not box.visible:
		return
	_present_box.add_child(UI.label("Show %s:" % String(data.name).split(" ")[0], 19, UI.DIM))
	var first: Button = null
	for e in game.collected_evidence():
		var b := UI.button("%s  %s" % [e.get("label", ""), e.title], func() -> void:
			box.visible = false
			game.act({"type": "present", "characterId": character_id, "evidenceId": e.id}))
		b.alignment = HORIZONTAL_ALIGNMENT_LEFT
		_present_box.add_child(b)
		if first == null:
			first = b
	if first:
		first.call_deferred("grab_focus")


func _load_face(face: Variant) -> void:
	if not (face is Dictionary):
		return
	for k in face:
		var tex: Texture2D = await game.fetch_texture(String(face[k]))
		if tex:
			_face_frames[k] = tex


## A talking portrait follows the voice: the louder, the wider the mouth.
func _process(dt: float) -> void:
	super(dt)
	if portrait == null or _face_frames.is_empty():
		return
	var v: float = game.voice_level
	var shape := "rest"
	if v > 0.55:
		shape = "ah"
	elif v > 0.35:
		shape = "oh"
	elif v > 0.18:
		shape = "ee"
	elif v > 0.07:
		shape = "slight"
	if _face_frames.has(shape):
		portrait.texture = _face_frames[shape]


func on_close() -> void:
	game.stop_voice()
