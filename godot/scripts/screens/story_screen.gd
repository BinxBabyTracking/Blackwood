extends Screen
## Cards read one after another, with the narrator (or Det. Bennett) speaking each one:
## the case's opening briefing, and the ending once the report is accepted.

var cards: Array = []
var index := 0
var title_label: Label
var heading: Label
var text: RichTextLabel
var next_button: Button
var on_done: Callable
var image_rect: TextureRect


## cards: [{ heading, text, voice: { kind, id, n, speaker } }]
func _init(g: Node, title: String, list: Array, done: Callable, image := "") -> void:
	super(g)
	cards = list
	on_done = done
	var bg := ColorRect.new()
	bg.color = Color(0, 0, 0, 0.9)
	bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	add_child(bg)
	if image != "":
		image_rect = picture(image, Vector2(0, 0))
		image_rect.set_anchors_preset(Control.PRESET_FULL_RECT)
		image_rect.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
		image_rect.modulate = Color(1, 1, 1, 0.25)
		add_child(image_rect)
	var center := CenterContainer.new()
	center.set_anchors_preset(Control.PRESET_FULL_RECT)
	add_child(center)
	var v := VBoxContainer.new()
	v.custom_minimum_size = Vector2(1100, 0)
	v.add_theme_constant_override("separation", 22)
	center.add_child(v)
	title_label = UI.label(title, 22, UI.DIM)
	v.add_child(title_label)
	heading = UI.label("", 36, UI.BRASS)
	v.add_child(heading)
	text = rich("", 26)
	v.add_child(text)
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 14)
	v.add_child(row)
	next_button = UI.button("Continue", _next)
	row.add_child(next_button)
	row.add_child(UI.button("Skip", _finish))
	first_focus = next_button
	_show()


func _show() -> void:
	var c: Dictionary = cards[index]
	heading.text = String(c.get("heading", ""))
	heading.visible = heading.text != ""
	text.text = String(c.get("text", ""))
	next_button.text = "Continue" if index < cards.size() - 1 else "Done"
	game.stop_voice()
	if c.get("voice") is Dictionary:
		game.play_lines([c.voice])


func _next() -> void:
	if index < cards.size() - 1:
		index += 1
		_show()
	else:
		_finish()


func _finish() -> void:
	game.stop_voice()
	var f := on_done
	game.close_screen()
	if f.is_valid():
		f.call()
