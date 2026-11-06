extends Screen
## The police interview tapes: each statement as a transcript, played in the speakers' voices.

var list: VBoxContainer
var body: VBoxContainer
var current := ""


func _init(g: Node) -> void:
	super(g)
	var v := frame("Police interview tapes", 1500, 820)
	var h := HBoxContainer.new()
	h.add_theme_constant_override("separation", 20)
	h.size_flags_vertical = Control.SIZE_EXPAND_FILL
	v.add_child(h)
	list = VBoxContainer.new()
	list.custom_minimum_size = Vector2(380, 0)
	h.add_child(list)
	var sc := scroller(640)
	(sc[0] as Control).size_flags_horizontal = Control.SIZE_EXPAND_FILL
	h.add_child(sc[0])
	body = sc[1]
	var stmts: Array = game.view.get("statements", [])
	for s in stmts:
		var cid := String(s.characterId)
		var b := UI.button(String(s.name), func() -> void: _show(cid))
		b.alignment = HORIZONTAL_ALIGNMENT_LEFT
		list.add_child(b)
		if first_focus is Button and (first_focus as Button).text == "Close":
			first_focus = b
	if stmts.is_empty():
		list.add_child(UI.label("No tapes on file.", 20, UI.DIM))
	else:
		_show(String(stmts[0].characterId))


func _show(cid: String) -> void:
	if cid == current:
		return
	current = cid
	game.stop_voice()
	for c in body.get_children():
		c.queue_free()
	for s in game.view.get("statements", []):
		if s.characterId != cid:
			continue
		body.add_child(UI.label(String(s.name), 26, UI.BRASS))
		body.add_child(UI.label("%s  ·  %s" % [s.tape, s.recordedAt], 18, UI.DIM))
		body.add_child(UI.label("%s  ·  %s" % [s.officer, s.status], 18, UI.DIM))
		if s.get("voiced", false) or s.get("audio"):
			body.add_child(UI.button("Play the tape", func() -> void: _play(s)))
		var t := PackedStringArray()
		for l in s.transcript:
			t.append("[color=#b8944f]%s:[/color] %s" % [l.speaker, l.text])
		body.add_child(rich("\n\n".join(t)))


func _play(s: Dictionary) -> void:
	if s.get("audio"):
		game.play_url(String(s.audio))
		return
	var refs: Array = []
	for i in s.transcript.size():
		refs.append({"kind": "statement", "id": s.characterId, "n": i, "speaker": s.transcript[i].speakerId})
	game.play_lines(refs)


func on_close() -> void:
	game.stop_voice()
