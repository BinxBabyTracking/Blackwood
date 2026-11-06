extends Screen
## The detective's notebook: objectives, evidence, people, notes, the timeline, interviews and
## your own notes. LB / RB (or Q / E... the tabs themselves) switch pages.

var tabs: TabContainer
var view: Dictionary
var _detail: VBoxContainer
var _notes: TextEdit
var _note_for := ""
var _note_edit: TextEdit
var _start_tab := 0


func _init(g: Node, start_tab := 0) -> void:
	super(g)
	_start_tab = start_tab
	view = game.view
	var v := frame("Notebook", 1500, 860)
	tabs = TabContainer.new()
	tabs.size_flags_vertical = Control.SIZE_EXPAND_FILL
	v.add_child(tabs)
	_build()
	tabs.current_tab = start_tab


func _build() -> void:
	for c in tabs.get_children():
		c.queue_free()
	_page_objectives()
	_page_evidence()
	_page_people()
	_page_notes()
	_page_timeline()
	_page_interviews()
	_page_mine()


func _page(title: String) -> VBoxContainer:
	var sc := scroller(600)
	(sc[0] as ScrollContainer).name = title
	tabs.add_child(sc[0])
	return sc[1]


func _page_objectives() -> void:
	var p := _page("Objectives")
	for o in view.get("objectives", []):
		var mark := "✓" if o.done else "•"
		var col := UI.DIM if o.done else UI.PAPER
		var t := ("%s  %s" % [mark, o.text]) + ("   (optional)" if o.get("optional", false) else "")
		p.add_child(UI.label(t, 22, col))
	for d in view.get("deductions", []):
		p.add_child(UI.label("Established: " + String(d.title), 22, UI.BRASS))
		p.add_child(UI.label(String(d.text), 19, UI.DIM))
	for d in view.get("developments", []):
		p.add_child(UI.label("%s  (%s)" % [d.title, d.status], 22, UI.BRASS))
		for l in d.get("learned", []):
			p.add_child(UI.label("  " + String(l), 19, UI.PAPER))


func _page_evidence() -> void:
	var h := HSplitContainer.new()
	h.name = "Evidence"
	h.split_offset = 420
	tabs.add_child(h)
	var ls := scroller(600)
	(ls[0] as Control).custom_minimum_size = Vector2(440, 600)
	h.add_child(ls[0])
	var list: VBoxContainer = ls[1]
	var ds := scroller(600)
	h.add_child(ds[0])
	_detail = ds[1]
	var items: Array = game.collected_evidence()
	if items.is_empty():
		list.add_child(UI.label("Nothing collected yet. Look closely at the scenes and collect what matters.", 20, UI.DIM))
	for e in items:
		var b := UI.button("%s  %s" % [e.get("label", ""), e.title], func() -> void: _show_evidence(String(e.id)))
		b.alignment = HORIZONTAL_ALIGNMENT_LEFT
		b.focus_entered.connect(func() -> void: _show_evidence(String(e.id)))
		list.add_child(b)
	if items.size() > 0:
		_show_evidence(String(items[0].id))


func _show_evidence(id: String) -> void:
	if _note_for == id:
		return
	_save_note()
	for c in _detail.get_children():
		c.queue_free()
	var e: Dictionary = game.evidence_by_id(id)
	if e.is_empty():
		return
	_note_for = id
	_detail.add_child(UI.label("%s  %s" % [e.get("label", ""), e.title], 26, UI.BRASS))
	if String(e.get("image", "")) != "":
		_detail.add_child(picture(String(e.image), Vector2(0, 360)))
	_detail.add_child(UI.label("Found: %s" % e.get("foundAt", e.get("source", "")), 18, UI.DIM))
	_detail.add_child(rich(String(e.get("inspection", e.get("description", "")))))
	if (e.get("related", []) as Array).size() > 0:
		_detail.add_child(UI.label("Related: " + ", ".join(PackedStringArray(e.related)), 18, UI.DIM))
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 10)
	if e.get("boardable", false):
		if game.on_board(id):
			var pinned := UI.label("Pinned on the murder board.", 18, UI.DIM)
			pinned.autowrap_mode = TextServer.AUTOWRAP_OFF
			row.add_child(pinned)
		else:
			row.add_child(UI.button("Pin to the murder board", func() -> void:
				await game.pin(id)
				_note_for = ""
				_show_evidence(id)))
	if e.get("audio"):
		row.add_child(UI.button("Play the recording", func() -> void: game.play_url(String(e.audio))))
	_detail.add_child(row)
	_detail.add_child(UI.label("Your note", 18, UI.DIM))
	_note_edit = TextEdit.new()
	_note_edit.text = String(e.get("note", ""))
	_note_edit.custom_minimum_size = Vector2(0, 110)
	_note_edit.wrap_mode = TextEdit.LINE_WRAPPING_BOUNDARY
	_detail.add_child(_note_edit)


func _save_note() -> void:
	if _note_for == "" or _note_edit == null or not is_instance_valid(_note_edit):
		return
	var e: Dictionary = game.evidence_by_id(_note_for)
	if _note_edit.text != String(e.get("note", "")):
		game.act({"type": "saveEvidenceNote", "evidenceId": _note_for, "text": _note_edit.text}, false)


func _page_people() -> void:
	var p := _page("People")
	for c in view.get("characters", []):
		var row := HBoxContainer.new()
		row.add_theme_constant_override("separation", 18)
		row.add_child(picture(String(c.portrait), Vector2(150, 190)))
		var col := VBoxContainer.new()
		col.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		var name := String(c.name) + ("  (deceased)" if c.get("deceased", false) else "")
		col.add_child(UI.label(name, 24, UI.BRASS))
		col.add_child(UI.label(String(c.role), 18, UI.DIM))
		for b in c.get("bio", []):
			col.add_child(UI.label(String(b), 19))
		for iv in view.get("interviews", []):
			if iv.characterId == c.id:
				col.add_child(UI.label("Interview: %s" % iv.status, 18, UI.DIM))
				for s in iv.get("statements", []):
					col.add_child(UI.label("Says: " + String(s.text), 18))
				for k in iv.get("contradictions", []):
					col.add_child(UI.label("Contradiction: %s. %s" % [k.title, k.text], 18, Color("d98c6a")))
		row.add_child(col)
		if c.get("onBoard", false) and not game.on_board(String(c.id)):
			var cid := String(c.id)
			row.add_child(UI.button("Pin", func() -> void: game.pin(cid)))
		p.add_child(row)


func _page_notes() -> void:
	var p := _page("Notes")
	var entries: Array = view.get("notebook", []).duplicate()
	entries.reverse()
	if entries.is_empty():
		p.add_child(UI.label("What you learn goes here.", 20, UI.DIM))
	for n in entries:
		var col := Color("d98c6a") if n.get("kind", "") == "contradiction" else UI.BRASS
		p.add_child(UI.label(String(n.title), 21, col))
		p.add_child(UI.label(String(n.text), 19))


func _page_timeline() -> void:
	var p := _page("Timeline")
	for t in view.get("timeline", []):
		var row := HBoxContainer.new()
		var time := UI.label(String(t.time), 20, UI.BRASS)
		time.custom_minimum_size = Vector2(170, 0)
		row.add_child(time)
		var col := VBoxContainer.new()
		col.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		col.add_child(UI.label(String(t.text), 20))
		col.add_child(UI.label(String(t.source), 16, UI.DIM))
		row.add_child(col)
		p.add_child(row)


func _page_interviews() -> void:
	var p := _page("Interviews")
	for iv in view.get("interviews", []):
		if (iv.get("transcript", []) as Array).is_empty():
			continue
		p.add_child(UI.label("%s  ·  %s" % [iv.name, iv.status], 23, UI.BRASS))
		var t := PackedStringArray()
		for l in iv.transcript:
			if l.kind == "cue":
				continue
			t.append(("[color=#9c907c]You:[/color] " if l.speakerId == "you" else "[color=#b8944f]%s:[/color] " % l.speaker) + String(l.text))
		p.add_child(rich("\n".join(t), 19))
	for s in view.get("statements", []):
		pass


func _page_mine() -> void:
	var p := _page("My notes")
	_notes = TextEdit.new()
	_notes.text = String(view.get("playerNotes", ""))
	_notes.custom_minimum_size = Vector2(0, 560)
	_notes.wrap_mode = TextEdit.LINE_WRAPPING_BOUNDARY
	_notes.placeholder_text = "Your own notes on the case."
	p.add_child(_notes)


func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventJoypadButton and event.pressed:
		if event.button_index == JOY_BUTTON_RIGHT_SHOULDER:
			tabs.current_tab = (tabs.current_tab + 1) % tabs.get_tab_count()
		elif event.button_index == JOY_BUTTON_LEFT_SHOULDER:
			tabs.current_tab = (tabs.current_tab - 1 + tabs.get_tab_count()) % tabs.get_tab_count()


func on_close() -> void:
	_save_note()
	if _notes and _notes.text != String(view.get("playerNotes", "")):
		game.act({"type": "saveNotes", "text": _notes.text}, false)
