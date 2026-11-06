class_name Screen
extends Control
## A full-screen panel over the room (notebook, board, report...). Built in code; works with mouse,
## keyboard and controller (focus moves with the D-pad or left stick, A to choose, B to go back).

var game: Node
var first_focus: Control
var _scrolls: Array[ScrollContainer] = []


func _init(g: Node) -> void:
	game = g
	set_anchors_preset(Control.PRESET_FULL_RECT)
	mouse_filter = Control.MOUSE_FILTER_STOP


## Called when the investigation changes while this screen is open.
func on_view(_view: Dictionary) -> void:
	pass


## Called when the screen is closing (save anything unsaved).
func on_close() -> void:
	pass


## A dark backdrop and a framed panel: returns the panel's content column.
func frame(title: String, width := 1200.0, height := 0.0, shade := 0.6) -> VBoxContainer:
	var bg := ColorRect.new()
	bg.color = Color(0, 0, 0, shade)
	bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	add_child(bg)
	var center := CenterContainer.new()
	center.set_anchors_preset(Control.PRESET_FULL_RECT)
	add_child(center)
	var p := PanelContainer.new()
	p.custom_minimum_size = Vector2(width, height)
	center.add_child(p)
	var v := VBoxContainer.new()
	v.add_theme_constant_override("separation", 14)
	p.add_child(v)
	var head := HBoxContainer.new()
	var t := UI.label(title, 30, UI.BRASS)
	t.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	head.add_child(t)
	var close := UI.button("Close", func() -> void: game.close_screen())
	head.add_child(close)
	v.add_child(head)
	if first_focus == null:
		first_focus = close
	return v


func scroller(min_height := 400.0) -> Array:
	var s := ScrollContainer.new()
	s.custom_minimum_size = Vector2(0, min_height)
	s.size_flags_vertical = Control.SIZE_EXPAND_FILL
	s.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	s.follow_focus = true
	var inner := VBoxContainer.new()
	inner.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	inner.add_theme_constant_override("separation", 12)
	s.add_child(inner)
	_scrolls.append(s)
	return [s, inner]


func rich(text: String, size := 21) -> RichTextLabel:
	var r := RichTextLabel.new()
	r.bbcode_enabled = true
	r.fit_content = true
	r.scroll_active = false
	r.text = text
	r.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	r.add_theme_font_size_override("normal_font_size", size)
	r.add_theme_font_size_override("bold_font_size", size)
	r.add_theme_font_size_override("italics_font_size", size)
	return r


func picture(path: String, size: Vector2) -> TextureRect:
	var t := TextureRect.new()
	t.custom_minimum_size = size
	t.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	t.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	game.load_picture(t, path)
	return t


func focus_first() -> void:
	if first_focus and is_instance_valid(first_focus):
		first_focus.grab_focus()


## The right stick scrolls long pages.
func _process(dt: float) -> void:
	var y := Input.get_axis("look_up", "look_down")
	if absf(y) < 0.15:
		return
	for s in _scrolls:
		if is_instance_valid(s) and s.is_visible_in_tree():
			s.scroll_vertical += int(y * 1100 * dt)
			return
