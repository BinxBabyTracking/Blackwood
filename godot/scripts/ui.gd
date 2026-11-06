class_name UI
extends RefCounted
## Small helpers for building the noir interface in code, with controller focus in mind.

const PAPER := Color("eadfc8")
const BRASS := Color("b8944f")
const INK := Color(0.055, 0.047, 0.04, 0.94)
const DIM := Color("9c907c")


static func theme() -> Theme:
	var t := Theme.new()
	t.default_font_size = 22
	var panel := StyleBoxFlat.new()
	panel.bg_color = INK
	panel.border_color = BRASS.darkened(0.25)
	panel.set_border_width_all(2)
	panel.set_corner_radius_all(3)
	panel.set_content_margin_all(28)
	t.set_stylebox("panel", "PanelContainer", panel)
	t.set_color("font_color", "Label", PAPER)
	t.set_color("default_color", "RichTextLabel", PAPER)
	t.set_font_size("normal_font_size", "RichTextLabel", 22)
	t.set_font_size("bold_font_size", "RichTextLabel", 22)

	var btn := StyleBoxFlat.new()
	btn.bg_color = Color(0.13, 0.11, 0.09)
	btn.border_color = BRASS.darkened(0.35)
	btn.set_border_width_all(1)
	btn.set_corner_radius_all(2)
	btn.set_content_margin_all(12)
	btn.content_margin_left = 22
	btn.content_margin_right = 22
	var hover := btn.duplicate() as StyleBoxFlat
	hover.bg_color = Color(0.2, 0.16, 0.11)
	hover.border_color = BRASS
	var focus := btn.duplicate() as StyleBoxFlat
	focus.bg_color = Color(0.24, 0.19, 0.12)
	focus.border_color = PAPER
	focus.set_border_width_all(2)
	t.set_stylebox("normal", "Button", btn)
	t.set_stylebox("hover", "Button", hover)
	t.set_stylebox("pressed", "Button", focus)
	t.set_stylebox("focus", "Button", focus)
	t.set_color("font_color", "Button", PAPER)
	t.set_color("font_hover_color", "Button", PAPER)
	t.set_color("font_focus_color", "Button", PAPER)

	var field := StyleBoxFlat.new()
	field.bg_color = Color(0.02, 0.02, 0.02, 0.9)
	field.border_color = BRASS.darkened(0.4)
	field.set_border_width_all(1)
	field.set_content_margin_all(12)
	var field_focus := field.duplicate() as StyleBoxFlat
	field_focus.border_color = BRASS
	t.set_stylebox("normal", "LineEdit", field)
	t.set_stylebox("focus", "LineEdit", field_focus)
	t.set_color("font_color", "LineEdit", PAPER)
	t.set_color("font_placeholder_color", "LineEdit", DIM)
	return t


static func label(text: String, size := 22, color := PAPER) -> Label:
	var l := Label.new()
	l.text = text
	l.add_theme_font_size_override("font_size", size)
	l.add_theme_color_override("font_color", color)
	l.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	return l


static func button(text: String, on_press: Callable) -> Button:
	var b := Button.new()
	b.text = text
	b.pressed.connect(on_press)
	return b


static func centered_panel(parent: Control, width := 720.0) -> VBoxContainer:
	var center := CenterContainer.new()
	center.set_anchors_preset(Control.PRESET_FULL_RECT)
	parent.add_child(center)
	var p := PanelContainer.new()
	p.custom_minimum_size = Vector2(width, 0)
	center.add_child(p)
	var v := VBoxContainer.new()
	v.add_theme_constant_override("separation", 14)
	p.add_child(v)
	return v
