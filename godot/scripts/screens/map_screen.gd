extends Screen
## The street map: every place you can go, pinned where it is. Choose one to drive there.

func _init(g: Node) -> void:
	super(g)
	var v := frame(String(game.view.get("mapTitle", "Map")), 1700, 900, 0.75)
	var h := HBoxContainer.new()
	h.add_theme_constant_override("separation", 18)
	v.add_child(h)
	var map := Control.new()
	map.custom_minimum_size = Vector2(1200, 780)
	h.add_child(map)
	var img := picture(String(game.view.get("caseArt", {}).get("map", "/art/%s_map.webp" % String(game.case_id).to_lower())), Vector2(1200, 780))
	img.stretch_mode = TextureRect.STRETCH_SCALE
	img.set_anchors_preset(Control.PRESET_FULL_RECT)
	map.add_child(img)
	var side := VBoxContainer.new()
	side.custom_minimum_size = Vector2(380, 0)
	side.add_theme_constant_override("separation", 10)
	h.add_child(side)
	side.add_child(UI.label("Where to?", 22, UI.BRASS))
	for m in game.view.get("map", []):
		if not m.get("available", false):
			continue
		var id := String(m.id)
		var here := bool(m.get("current", false))
		var label := String(m.name) + ("   (you are here)" if here else "")
		var b := UI.button(label, func() -> void: game.travel(id))
		b.alignment = HORIZONTAL_ALIGNMENT_LEFT
		b.disabled = here
		b.tooltip_text = String(m.get("subtitle", ""))
		side.add_child(b)
		if first_focus == null or (first_focus is Button and (first_focus as Button).text == "Close"):
			if not here:
				first_focus = b
		if m.get("pin") is Dictionary:
			var pin := Button.new()
			pin.text = "●" if not here else "◉"
			pin.tooltip_text = "%s\n%s" % [m.name, m.get("subtitle", "")]
			pin.flat = true
			pin.add_theme_font_size_override("font_size", 30)
			pin.add_theme_color_override("font_color", Color("c0392b") if not here else UI.BRASS)
			pin.position = Vector2(float(m.pin.x) / 100.0 * 1200 - 16, float(m.pin.y) / 100.0 * 780 - 24)
			pin.pressed.connect(func() -> void: game.travel(id))
			pin.disabled = here
			pin.focus_mode = Control.FOCUS_NONE
			map.add_child(pin)
			var tag := UI.label(String(m.name) + (("  ·  " + String(m.tag)) if m.get("tag") else ""), 15, Color.WHITE)
			tag.autowrap_mode = TextServer.AUTOWRAP_OFF
			tag.add_theme_constant_override("outline_size", 6)
			tag.add_theme_color_override("font_outline_color", Color.BLACK)
			tag.position = pin.position + Vector2(30, 6)
			map.add_child(tag)
