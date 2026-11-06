extends Screen
## The office telephone: answer it when it rings, call the people you can reach, and the calls you've had.

var body: VBoxContainer


func _init(g: Node) -> void:
	super(g)
	var v := frame(String(game.view.get("words", {}).get("phone", "Telephone")), 1000, 0)
	var sc := scroller(560)
	v.add_child(sc[0])
	body = sc[1]
	_fill()


func on_view(_v: Dictionary) -> void:
	_fill()


func _fill() -> void:
	for c in body.get_children():
		c.queue_free()
	var ph: Dictionary = game.view.get("phone", {})
	var w: Dictionary = game.view.get("words", {})
	var first: Button = null
	if ph.get("ringing") is Dictionary:
		body.add_child(UI.label(String(w.get("callNotice", "The line is ringing.")), 22, UI.BRASS))
		var ring: Dictionary = ph.ringing
		first = UI.button(String(w.get("callAnswer", "Answer the telephone")), func() -> void: game.act({"type": "answerCall", "callId": ring.id}))
		body.add_child(first)
	var contacts: Array = ph.get("contacts", [])
	if contacts.size() > 0:
		body.add_child(UI.label("People you can reach", 22, UI.BRASS))
		for c in contacts:
			var cid := String(c.id)
			var b := UI.button("%s  ·  %s" % [c.name, c.role], func() -> void: game.act({"type": "talk", "characterId": cid}))
			b.alignment = HORIZONTAL_ALIGNMENT_LEFT
			body.add_child(b)
			if String(c.get("note", "")) != "":
				body.add_child(UI.label(String(c.note), 17, UI.DIM))
			if first == null:
				first = b
	body.add_child(UI.label(String(w.get("outgoing", "Make a call")), 22, UI.BRASS))
	var out: Array = ph.get("outgoing", [])
	if out.is_empty():
		body.add_child(UI.label("There is no one you need to call right now.", 19, UI.DIM))
	for c in out:
		var id := String(c.id)
		var b := UI.button("%s: %s" % [c.to, c.label], func() -> void: game.act({"type": "placeCall", "callId": id}))
		b.alignment = HORIZONTAL_ALIGNMENT_LEFT
		body.add_child(b)
		if first == null:
			first = b
	var log: Array = ph.get("log", [])
	if log.size() > 0:
		body.add_child(UI.label(String(w.get("callLog", "Earlier calls")), 22, UI.BRASS))
		for c in log:
			body.add_child(UI.label("•  " + String(c.title), 19))
	if first:
		first_focus = first
