extends Node
## A scripted run through the case for automated checks (against the local stand-in server,
## scripts/godot/mock-server.ts): presses what a player would press and saves a screenshot of each step.

var g: Node
var dir := ""
var n := 0


func run(game: Node, out_dir: String) -> void:
	g = game
	dir = out_dir
	DirAccess.make_dir_recursive_absolute(dir)
	g.api.access_token = "local"
	g.api.email = "test@local"
	await g.go_online()
	await _wait(1.5)
	await shot("intro")
	g.close_screen()
	await g.act({"type": "dismissIntro"}, false)
	await _wait(0.5)
	await shot("office")
	await _hotspot("office_casefile")
	await shot("casefile")
	g.close_screen()
	await _hotspot("office_phone")
	await shot("phone_panel")
	await g.act({"type": "talk", "characterId": "bennett"})
	await _wait(0.5)
	await shot("bennett")
	await g.act({"type": "askFree", "characterId": "bennett", "text": "What did the coroner say about the cause of death?"})
	await _wait(0.5)
	await shot("bennett_answer")
	g.close_screen()
	await _hotspot("office_recorder")
	await shot("tapes")
	g.close_screen()
	g.open_map()
	await shot("map")
	g.travel("living_room")
	await _wait(3.0)
	await shot("living_room")
	await _hotspot("lr_glass")
	await shot("glass")
	var e: Dictionary = g.evidence_by_id("E02")
	await g.act({"type": "collect", "evidenceId": "E02"}, false)
	g.close_screen()
	for h in ["lr_ledger", "lr_diary", "lr_wine", "lr_poker"]:
		var r: Dictionary = await g.act({"type": "hotspot", "hotspotId": h}, false)
		if r.has("outcome") and r.outcome.get("evidence") is Dictionary:
			await g.act({"type": "collect", "evidenceId": r.outcome.evidence.id}, false)
	# Walk through the arch into the kitchen.
	g.player.place(0.0, 3.6, 180.0)
	await _wait(2.0)
	await shot("kitchen")
	g.travel("diner")
	await _wait(3.0)
	await shot("diner")
	await _hotspot("d_rosa")
	await _wait(2.0)
	await shot("rosa")
	await g.act({"type": "askFree", "characterId": "rosa", "text": "Was Daniel here on Friday night?"})
	await _wait(1.0)
	await shot("rosa_answer")
	g.close_screen()
	for loc in ["daniel_apartment", "margaret_house", "robert_garage", "patricia_office"]:
		g.travel(loc)
		await _wait(3.0)
		await shot(loc)
	g.travel("office")
	await _wait(3.0)
	for id in ["E02"]:
		await g.pin(id)
	await g.act({"type": "boardAdd", "itemId": "daniel", "x": 60, "y": 30}, false)
	await g.act({"type": "connect", "a": "E02", "b": "daniel"}, false)
	g.open_panel("board")
	await shot("board")
	g.open_panel("notebook")
	await shot("notebook")
	g.screen.tabs.current_tab = 1
	await shot("notebook_evidence")
	g.screen.tabs.current_tab = 4
	await shot("notebook_timeline")
	g.open_panel("conclusion")
	await shot("report")
	g.close_screen()


func _hotspot(id: String) -> void:
	await g.act({"type": "hotspot", "hotspotId": id})
	await _wait(0.6)


func _wait(s: float) -> void:
	await get_tree().create_timer(s).timeout


func shot(name: String) -> void:
	for i in 6:
		await get_tree().process_frame
	n += 1
	g.get_viewport().get_texture().get_image().save_png("%s/%02d_%s.png" % [dir, n, name])
	print("shot ", name)
