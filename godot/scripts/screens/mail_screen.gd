extends Screen
## The mail tray: what has come to the office.

func _init(g: Node) -> void:
	super(g)
	var v := frame("Mail", 900, 0)
	var list: Array = game.view.get("deliveries", [])
	if list.is_empty():
		v.add_child(UI.label("Nothing has come for you yet.", 20, UI.DIM))
	for d in list:
		var id := String(d.id)
		var b := UI.button(String(d.title), func() -> void: game.act({"type": "openDelivery", "deliveryId": id}))
		b.alignment = HORIZONTAL_ALIGNMENT_LEFT
		v.add_child(b)
		if first_focus is Button and (first_focus as Button).text == "Close":
			first_focus = b
