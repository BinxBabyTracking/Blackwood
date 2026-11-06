extends Screen
## The final investigative report, typed up at the office: answer each question, then file it.
## Every piece of evidence you've collected goes with it.

var c: Dictionary
var draft := {}
var groups := {}
var submit: Button
var _dirty := false


func _init(g: Node) -> void:
	super(g)
	c = game.view.get("conclusion", {})
	draft = (c.get("draft", {}) as Dictionary).duplicate(true)
	var v := frame("Final investigative report", 1300, 900, 0.8)
	var sc := scroller(700)
	v.add_child(sc[0])
	var body: VBoxContainer = sc[1]
	var final_report = c.get("final")
	var head := PackedStringArray(["[color=#9c907c]Case No.[/color] %s" % game.view.get("caseId", ""), "[color=#9c907c]Case[/color] %s" % String(game.view.get("title", "")).to_upper()])
	for hd in c.get("header", []):
		head.append("[color=#9c907c]%s[/color] %s" % [hd.label, hd.value])
	body.add_child(rich("\n".join(head)))
	if final_report is Dictionary:
		body.add_child(UI.label("Filed by %s. The agency accepted this report." % final_report.get("investigator", "you"), 21, UI.BRASS))
	elif not c.get("available", false):
		body.add_child(UI.label("You aren't ready to write the report yet. Keep investigating.", 21, Color("d98c6a")))
	var review = c.get("review")
	if review is Dictionary and not (final_report is Dictionary):
		body.add_child(UI.label("Returned by the agency (attempt %d):" % int(review.attempt), 20, Color("d98c6a")))
		body.add_child(UI.label(String(review.note), 20))
	var theory: Dictionary = final_report.theory if final_report is Dictionary else {}
	for ch in c.get("choices", []):
		var id := String(ch.id)
		body.add_child(UI.label("%s.  %s" % [ch.section, ch.title], 24, UI.BRASS))
		body.add_child(UI.label(String(ch.question), 19, UI.DIM))
		var grid := GridContainer.new()
		grid.columns = 2
		grid.add_theme_constant_override("h_separation", 12)
		grid.add_theme_constant_override("v_separation", 8)
		body.add_child(grid)
		var bg := ButtonGroup.new()
		groups[id] = []
		var current: Variant = theory.get(id, draft.get(id))
		for o in ch.options:
			var b := CheckBox.new() if ch.get("multi", false) else CheckBox.new()
			b.text = String(o.label)
			b.custom_minimum_size = Vector2(560, 0)
			if not ch.get("multi", false):
				b.button_group = bg
			b.button_pressed = (current is Array and (current as Array).has(o.id)) or (current is String and current == o.id)
			b.disabled = final_report is Dictionary or not c.get("available", false)
			var oid := String(o.id)
			b.toggled.connect(func(on: bool) -> void: _pick(id, oid, on, ch.get("multi", false)))
			grid.add_child(b)
			groups[id].append(b)
			if first_focus is Button and (first_focus as Button).text == "Close" and not b.disabled:
				first_focus = b
	var letter := String.chr(65 + (c.get("choices", []) as Array).size())
	body.add_child(UI.label("%s.  Evidence" % letter, 24, UI.BRASS))
	var ev := PackedStringArray()
	for e in game.collected_evidence():
		ev.append("%s  %s" % [e.get("label", ""), e.title])
	body.add_child(UI.label("\n".join(ev) if ev.size() > 0 else "No evidence collected.", 19))
	body.add_child(UI.label("Evidence found: %d of %d." % [int(c.get("found", 0)), int(c.get("total", 0))], 18, UI.DIM))
	if not (final_report is Dictionary) and c.get("available", false):
		submit = UI.button("File the report", _submit)
		v.add_child(submit)
		_check()


func _pick(id: String, opt: String, on: bool, multi: bool) -> void:
	_dirty = true
	if multi:
		var cur: Array = draft.get(id, []) if draft.get(id) is Array else []
		if on and not cur.has(opt):
			cur.append(opt)
		elif not on:
			cur.erase(opt)
		draft[id] = cur
	elif on:
		draft[id] = opt
	_check()


func _complete() -> bool:
	for ch in c.get("choices", []):
		var v: Variant = draft.get(String(ch.id))
		if v == null or (v is Array and (v as Array).is_empty()) or (v is String and v == ""):
			return false
	return true


func _check() -> void:
	if submit:
		submit.disabled = not _complete()


func _submit() -> void:
	var theory := {"evidence": []}
	for ch in c.get("choices", []):
		theory[String(ch.id)] = draft.get(String(ch.id))
	_dirty = false
	game.act({"type": "submitConclusion", "theory": theory})


func on_close() -> void:
	if _dirty:
		if not draft.has("evidence"):
			draft["evidence"] = []
		game.act({"type": "saveReport", "draft": draft}, false)
