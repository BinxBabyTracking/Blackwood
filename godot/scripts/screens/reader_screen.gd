extends Screen
## What the investigator looks at: a note, a found item (with Collect), a document, a telephone
## call, a delivery. One screen shape for all of them, built from the server's outcome.

var outcome: Dictionary
var _evidence_box: VBoxContainer
var _image_path := ""


func _init(g: Node, o: Dictionary) -> void:
	super(g)
	outcome = o
	var kind := String(o.get("kind", "inspect"))
	var v := frame(_title(), 1320)
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 26)
	v.add_child(row)
	_image_path = String(o.get("image", "") if o.get("image") != null else "")
	if kind == "delivery":
		_image_path = String(o.get("exterior", ""))
	if _image_path != "":
		row.add_child(picture(_image_path, Vector2(480, 480)))
	var sc := scroller(480)
	(sc[0] as ScrollContainer).custom_minimum_size = Vector2(720 if _image_path != "" else 1200, 480)
	(sc[0] as ScrollContainer).size_flags_horizontal = Control.SIZE_EXPAND_FILL
	row.add_child(sc[0])
	var body: VBoxContainer = sc[1]
	body.add_child(rich(_body()))
	_evidence_box = VBoxContainer.new()
	_evidence_box.add_theme_constant_override("separation", 8)
	body.add_child(_evidence_box)
	var actions := HBoxContainer.new()
	actions.add_theme_constant_override("separation", 12)
	v.add_child(actions)
	if kind == "delivery" and o.get("sealed", false):
		var open := UI.button("Open it", func() -> void: game.act({"type": "openDelivery", "deliveryId": o.id}))
		actions.add_child(open)
		first_focus = open
	if kind == "call" and o.get("voiced", false):
		actions.add_child(UI.button("Play the call again", _play))
	if kind == "document":
		actions.add_child(UI.button("Read it to me", _read_aloud))
	_fill_evidence()
	if kind == "call" and o.get("voiced", false):
		_play()


func _title() -> String:
	var o := outcome
	if o.get("evidence") is Dictionary:
		return "%s  %s" % [o.evidence.get("label", ""), o.evidence.title]
	return String(o.get("title", ""))


func _body() -> String:
	var o := outcome
	match String(o.get("kind", "")):
		"inspect":
			var t := String(o.get("text", ""))
			if o.get("evidence") is Dictionary:
				var e: Dictionary = o.evidence
				t += "\n\n" + String(e.get("inspection", e.get("description", "")))
			return t
		"document":
			var parts := PackedStringArray()
			for d in o.get("dossier", []):
				parts.append("[color=#9c907c]%s:[/color] %s" % [d.label, d.value])
			if o.get("people", []).size() > 0:
				parts.append("\n[b]%s[/b]" % o.get("peopleHeading", "Persons involved"))
				for p in o.people:
					parts.append("%s, [color=#9c907c]%s[/color]" % [p.name, p.role])
			for p in o.get("pages", []):
				if String(p.get("heading", "")) != "":
					parts.append("\n[b]%s[/b]" % p.heading)
				parts.append(String(p.body))
			return "\n".join(parts)
		"call":
			var lines := PackedStringArray()
			var speakers: Array = o.get("speakers", [])
			for i in o.lines.size():
				var who := String(o.from)
				if speakers.size() > i:
					who = game.character_name(String(speakers[i]))
				lines.append("[color=#b8944f]%s:[/color] %s" % [who, o.lines[i]])
			return "\n\n".join(lines)
		"delivery":
			if o.get("sealed", false):
				return "It came to the office for you. Open it to see what is inside."
			return String(o.get("text", ""))
		"deduction":
			return String(o.get("text", ""))
	return String(o.get("text", ""))


## Things here that go in the notebook: a Collect button for each one not yet taken.
func _fill_evidence() -> void:
	for c in _evidence_box.get_children():
		c.queue_free()
	var items: Array = []
	if outcome.get("evidence") is Dictionary:
		var e: Dictionary = game.evidence_by_id(String(outcome.evidence.id))
		if e.is_empty():
			e = outcome.evidence
		items.append({"id": e.id, "title": e.title, "collected": e.get("collected", false)})
	elif outcome.get("evidence") is Array:
		for e in outcome.evidence:
			var now: Dictionary = game.evidence_by_id(String(e.id))
			items.append({"id": e.id, "title": e.title, "collected": now.get("collected", e.get("collected", false))})
	if items.is_empty():
		return
	_evidence_box.add_child(UI.label("Evidence", 22, UI.BRASS))
	for it in items:
		if it.collected:
			_evidence_box.add_child(UI.label("✓  %s is in your notebook." % it.title, 20, UI.DIM))
		else:
			var b := UI.button("Collect: %s" % it.title, func() -> void: _collect(String(it.id)))
			_evidence_box.add_child(b)
			if first_focus == null or first_focus.text == "Close":
				first_focus = b


func _collect(id: String) -> void:
	var r: Dictionary = await game.act({"type": "collect", "evidenceId": id}, false)
	if not r.has("error"):
		game.toast("Collected. It is in your notebook.")
		game.stamp("COLLECTED")
	_fill_evidence()
	focus_first()


func on_view(_v: Dictionary) -> void:
	_fill_evidence()


func _play() -> void:
	var refs: Array = []
	for i in outcome.lines.size():
		refs.append({"kind": "call", "id": outcome.id, "n": i, "speaker": (outcome.get("speakers", []) as Array)[i] if (outcome.get("speakers", []) as Array).size() > i else outcome.get("fromId", "")})
	game.play_lines(refs)


func _read_aloud() -> void:
	var refs: Array = []
	for i in outcome.get("pages", []).size():
		refs.append({"kind": "document", "id": outcome.id, "n": i, "speaker": "narrator"})
	game.play_lines(refs)


func on_close() -> void:
	game.stop_voice()
