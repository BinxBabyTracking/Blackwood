extends Screen
## The murder board: pin evidence and people, move them around, and tie them together with red string.
## Mouse: drag to move, right-click one card then another to tie or untie them.
## Controller: A picks a card up (move it with the left stick, A to put it down), X ties strings,
## Y takes a card down. Keyboard: Enter picks up, C ties, Delete takes down.

const CARD := Vector2(170, 210)

var area: Control
var cards := {}
var drawer: VBoxContainer
var help: Label
var _held := ""
var _drag := ""
var _drag_off := Vector2.ZERO
var _moved := false
var _tie_from := ""


func _init(g: Node) -> void:
	super(g)
	var v := frame(String(game.view.get("words", {}).get("board", "Murder board")), 1780, 940, 0.75)
	var h := HBoxContainer.new()
	h.add_theme_constant_override("separation", 16)
	h.size_flags_vertical = Control.SIZE_EXPAND_FILL
	v.add_child(h)
	area = Control.new()
	area.custom_minimum_size = Vector2(1380, 800)
	area.clip_contents = true
	area.draw.connect(_draw_board)
	area.gui_input.connect(_area_input)
	h.add_child(area)
	var side := VBoxContainer.new()
	side.custom_minimum_size = Vector2(320, 0)
	h.add_child(side)
	side.add_child(UI.label("Not pinned yet", 20, UI.BRASS))
	var sc := scroller(600)
	side.add_child(sc[0])
	drawer = sc[1]
	help = UI.label("", 16, UI.DIM)
	side.add_child(help)
	_rebuild()


func on_view(_v: Dictionary) -> void:
	_rebuild()


func _items() -> Array:
	return game.view.get("board", {}).get("items", [])


func _info(id: String) -> Dictionary:
	var e: Dictionary = game.evidence_by_id(id)
	if not e.is_empty():
		return {"title": "%s %s" % [e.get("label", ""), e.title], "image": e.get("image", "")}
	for c in game.view.get("characters", []):
		if c.id == id:
			return {"title": c.name, "image": c.portrait}
	return {"title": id, "image": ""}


func _rebuild() -> void:
	var focused := ""
	for id in cards:
		if is_instance_valid(cards[id]) and (cards[id] as Control).has_focus():
			focused = id
	for c in area.get_children():
		c.queue_free()
	cards.clear()
	for it in _items():
		var id := String(it.id)
		var info := _info(id)
		var card := Button.new()
		card.custom_minimum_size = CARD
		card.size = CARD
		card.position = Vector2(float(it.x) / 100.0 * (area.custom_minimum_size.x - CARD.x), float(it.y) / 100.0 * (area.custom_minimum_size.y - CARD.y))
		card.tooltip_text = info.title
		var col := VBoxContainer.new()
		col.set_anchors_preset(Control.PRESET_FULL_RECT)
		col.offset_left = 8
		col.offset_right = -8
		col.offset_top = 8
		col.offset_bottom = -8
		col.mouse_filter = Control.MOUSE_FILTER_IGNORE
		var pic := picture(String(info.image), Vector2(150, 140))
		pic.mouse_filter = Control.MOUSE_FILTER_IGNORE
		col.add_child(pic)
		var lab := UI.label(info.title, 15)
		lab.mouse_filter = Control.MOUSE_FILTER_IGNORE
		lab.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		col.add_child(lab)
		card.add_child(col)
		card.gui_input.connect(_card_input.bind(id))
		card.focus_entered.connect(func() -> void: area.queue_redraw())
		area.add_child(card)
		cards[id] = card
	for c in drawer.get_children():
		c.queue_free()
	var pinned := {}
	for it in _items():
		pinned[String(it.id)] = true
	var any := false
	for e in game.collected_evidence():
		if e.get("boardable", false) and not pinned.has(String(e.id)):
			drawer.add_child(_pin_button(String(e.id), "%s %s" % [e.get("label", ""), e.title]))
			any = true
	for c in game.view.get("characters", []):
		if c.get("onBoard", false) and not pinned.has(String(c.id)):
			drawer.add_child(_pin_button(String(c.id), String(c.name)))
			any = true
	if not any:
		drawer.add_child(UI.label("Everything you have is on the board.", 17, UI.DIM))
	_help()
	area.queue_redraw()
	if focused != "" and cards.has(focused):
		(cards[focused] as Control).grab_focus()
	elif first_focus == null or not is_instance_valid(first_focus) or first_focus.text == "Close":
		if cards.size() > 0:
			first_focus = cards.values()[0]


func _pin_button(id: String, title: String) -> Button:
	var b := UI.button("Pin: " + title, func() -> void: game.pin(id))
	b.alignment = HORIZONTAL_ALIGNMENT_LEFT
	b.clip_text = true
	b.custom_minimum_size = Vector2(300, 0)
	return b


func _help() -> void:
	if _tie_from != "":
		help.text = "Choose the card to tie %s to (X / C / right-click). B cancels." % _info(_tie_from).title
	elif _held != "":
		help.text = "Move it with the left stick or arrows, then A / Enter to put it down."
	else:
		help.text = "Drag cards to move them. Right-click (X on a controller, C on the keyboard) to tie two together with string; again on a tied pair unties them. Y or Delete takes a card down."


func _center(id: String) -> Vector2:
	var c: Control = cards[id]
	return c.position + c.size / 2


func _draw_board() -> void:
	area.draw_rect(Rect2(Vector2.ZERO, area.size), Color("8a6a45"))
	var rng := RandomNumberGenerator.new()
	rng.seed = 7
	for i in 900:
		var p := Vector2(rng.randf() * area.size.x, rng.randf() * area.size.y)
		area.draw_circle(p, rng.randf_range(1, 3), Color(0.35, 0.24, 0.12, 0.25))
	area.draw_rect(Rect2(Vector2.ZERO, area.size), Color("3a2414"), false, 10)
	for pair in game.view.get("board", {}).get("connections", []):
		var a := String(pair[0])
		var b := String(pair[1])
		if cards.has(a) and cards.has(b):
			area.draw_line(_center(a) - Vector2(0, CARD.y * 0.42), _center(b) - Vector2(0, CARD.y * 0.42), Color("b3202a"), 3.0, true)
	for id in cards:
		var c: Control = cards[id]
		area.draw_circle(c.position + Vector2(CARD.x / 2, 12), 7, Color("c0392b"))
		if id == _tie_from:
			area.draw_rect(Rect2(c.position - Vector2(6, 6), CARD + Vector2(12, 12)), Color("e74c3c"), false, 4)
		if id == _held:
			area.draw_rect(Rect2(c.position - Vector2(6, 6), CARD + Vector2(12, 12)), UI.PAPER, false, 4)


func _card_input(event: InputEvent, id: String) -> void:
	if event is InputEventMouseButton:
		if event.button_index == MOUSE_BUTTON_LEFT:
			if event.pressed:
				if _tie_from != "":
					_tie(id)
					return
				_drag = id
				_moved = false
				_drag_off = event.position
			elif _drag == id:
				_drag = ""
				if _moved:
					_save_pos(id)
		elif event.button_index == MOUSE_BUTTON_RIGHT and event.pressed:
			_tie(id)
	elif event is InputEventMouseMotion and _drag == id:
		var c: Control = cards[id]
		c.position = (c.position + event.position - _drag_off).clamp(Vector2.ZERO, area.size - CARD)
		_moved = true
		area.queue_redraw()
	elif event.is_action_pressed("ui_accept"):
		accept_event()
		if _tie_from != "":
			_tie(id)
		elif _held == id:
			_held = ""
			_save_pos(id)
		else:
			_held = id
		_help()
		area.queue_redraw()
	elif (event is InputEventJoypadButton and event.pressed and event.button_index == JOY_BUTTON_X) or (event is InputEventKey and event.pressed and event.physical_keycode == KEY_C):
		accept_event()
		_tie(id)
	elif (event is InputEventJoypadButton and event.pressed and event.button_index == JOY_BUTTON_Y) or (event is InputEventKey and event.pressed and event.physical_keycode == KEY_DELETE):
		accept_event()
		game.act({"type": "boardRemove", "itemId": id}, false)


func _area_input(event: InputEvent) -> void:
	if event is InputEventMouseButton and event.pressed and _tie_from != "":
		_tie_from = ""
		_help()
		area.queue_redraw()


func _tie(id: String) -> void:
	if _tie_from == "":
		_tie_from = id
	elif _tie_from == id:
		_tie_from = ""
	else:
		var a := _tie_from
		_tie_from = ""
		var tied := false
		for pair in game.view.get("board", {}).get("connections", []):
			if (pair[0] == a and pair[1] == id) or (pair[0] == id and pair[1] == a):
				tied = true
		game.act({"type": "disconnect" if tied else "connect", "a": a, "b": id}, false)
	_help()
	area.queue_redraw()


func _save_pos(id: String) -> void:
	var c: Control = cards[id]
	var span := area.size - CARD
	var x := clampf(c.position.x / span.x * 100.0, 0, 100)
	var y := clampf(c.position.y / span.y * 100.0, 0, 100)
	game.act({"type": "boardMove", "itemId": id, "x": x, "y": y}, false)


## A held card follows the left stick or the arrow keys.
func _process(dt: float) -> void:
	super(dt)
	if _held == "" or not cards.has(_held):
		return
	var mv := Input.get_vector("move_left", "move_right", "move_forward", "move_back")
	var k := Vector2(Input.get_axis("ui_left", "ui_right"), Input.get_axis("ui_up", "ui_down"))
	if mv.length() < 0.1:
		mv = k
	if mv.length() > 0.1:
		var c: Control = cards[_held]
		c.position = (c.position + mv * 520 * dt).clamp(Vector2.ZERO, area.size - CARD)
		area.queue_redraw()


func _input(event: InputEvent) -> void:
	# While a card is held, the D-pad and arrows move it instead of moving focus.
	if _held != "" and (event.is_action("ui_left") or event.is_action("ui_right") or event.is_action("ui_up") or event.is_action("ui_down")):
		get_viewport().set_input_as_handled()
	if _tie_from != "" and event.is_action_pressed("back"):
		_tie_from = ""
		_help()
		area.queue_redraw()
		get_viewport().set_input_as_handled()
