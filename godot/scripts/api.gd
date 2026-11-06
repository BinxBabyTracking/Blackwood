class_name Api
extends Node
## Talks to the Blackwood website: sign-in, the investigation view, game actions and voices.
## Everything the game decides (interview answers, evidence, objectives) stays on the server,
## exactly as on the website. The desktop client only sends what the player did.

const SESSION_FILE := "user://session.cfg"
const DEFAULT_BASE := "https://blackwoodinvestigation.com"

var base := DEFAULT_BASE
var access_token := ""
var refresh_token := ""
var email := ""


func _ready() -> void:
	var cfg := ConfigFile.new()
	if cfg.load(SESSION_FILE) == OK:
		base = String(cfg.get_value("server", "base", DEFAULT_BASE))
		access_token = String(cfg.get_value("session", "access", ""))
		refresh_token = String(cfg.get_value("session", "refresh", ""))
		email = String(cfg.get_value("session", "email", ""))
	# A different server for testing: --server=https://... on the command line.
	for arg in OS.get_cmdline_user_args() + OS.get_cmdline_args():
		if arg.begins_with("--server="):
			base = arg.substr(9).trim_suffix("/")


func signed_in() -> bool:
	return access_token != ""


func save_session() -> void:
	var cfg := ConfigFile.new()
	cfg.set_value("server", "base", base)
	cfg.set_value("session", "access", access_token)
	cfg.set_value("session", "refresh", refresh_token)
	cfg.set_value("session", "email", email)
	cfg.save(SESSION_FILE)


func sign_out() -> void:
	access_token = ""
	refresh_token = ""
	save_session()


## Returns { ok, code, data } where data is the parsed JSON (or {} when there was none).
func call_json(method: HTTPClient.Method, path: String, body: Variant = null, retry := true) -> Dictionary:
	var http := HTTPRequest.new()
	http.timeout = 60.0
	add_child(http)
	var headers := PackedStringArray(["Content-Type: application/json", "Accept: application/json"])
	if access_token != "":
		headers.append("Authorization: Bearer " + access_token)
	var payload := "" if body == null else JSON.stringify(body)
	var err := http.request(base + path, headers, method, payload)
	if err != OK:
		http.queue_free()
		return {"ok": false, "code": 0, "data": {"error": "Could not reach Blackwood."}}
	var res: Array = await http.request_completed
	http.queue_free()
	var code: int = res[1]
	var text: String = (res[3] as PackedByteArray).get_string_from_utf8()
	var data: Variant = JSON.parse_string(text) if text != "" else {}
	if not (data is Dictionary):
		data = {"error": "Unexpected reply from Blackwood (%d)." % code}
	if res[0] != HTTPRequest.RESULT_SUCCESS:
		data = {"error": "Could not reach Blackwood. Check your connection."}
	if code == 401 and retry and refresh_token != "" and path != "/api/client/refresh":
		if await refresh():
			return await call_json(method, path, body, false)
	return {"ok": code >= 200 and code < 300, "code": code, "data": data}


## Raw bytes (voices, portraits). Returns an empty array on failure.
func get_bytes(path: String) -> PackedByteArray:
	var http := HTTPRequest.new()
	http.timeout = 60.0
	add_child(http)
	var headers := PackedStringArray()
	if access_token != "":
		headers.append("Authorization: Bearer " + access_token)
	var url := path if path.begins_with("http") else base + path
	if http.request(url, headers) != OK:
		http.queue_free()
		return PackedByteArray()
	var res: Array = await http.request_completed
	http.queue_free()
	if res[0] != HTTPRequest.RESULT_SUCCESS or res[1] < 200 or res[1] >= 300:
		return PackedByteArray()
	return res[3]


func login(user_email: String, password: String) -> Dictionary:
	var r := await call_json(HTTPClient.METHOD_POST, "/api/client/login", {"email": user_email, "password": password}, false)
	if r.ok:
		_take_session(r.data)
	return r


func refresh() -> bool:
	var r := await call_json(HTTPClient.METHOD_POST, "/api/client/refresh", {"refreshToken": refresh_token}, false)
	if r.ok:
		_take_session(r.data)
		return true
	access_token = ""
	save_session()
	return false


func _take_session(d: Dictionary) -> void:
	access_token = String(d.get("accessToken", ""))
	refresh_token = String(d.get("refreshToken", ""))
	if String(d.get("email", "")) != "":
		email = String(d.get("email", ""))
	save_session()


func view(case_id: String) -> Dictionary:
	return await call_json(HTTPClient.METHOD_GET, "/api/client/view?caseId=%s&start=1" % case_id.uri_encode())


## One game action. Returns the server's PlayResult: { view, outcome } or { error, saved }.
func play(case_id: String, action: Dictionary) -> Dictionary:
	var r := await call_json(HTTPClient.METHOD_POST, "/api/client/play", {"caseId": case_id, "action": action})
	if not r.ok and not r.data.has("error"):
		return {"error": "Something went wrong (%d)." % r.code}
	return r.data


func voice(case_id: String, character_id: String, n: int) -> PackedByteArray:
	return await get_bytes("/api/voice?caseId=%s&kind=conversation&id=%s&n=%d" % [case_id, character_id, n])


## Loads a picture from the site (portrait art) as a texture, or null.
func texture(path: String) -> Texture2D:
	if path == "":
		return null
	var bytes := await get_bytes(path)
	if bytes.size() < 12:
		return null
	var img := Image.new()
	var err := ERR_FILE_UNRECOGNIZED
	if bytes[0] == 0x89 and bytes[1] == 0x50:
		err = img.load_png_from_buffer(bytes)
	elif bytes[0] == 0xFF and bytes[1] == 0xD8:
		err = img.load_jpg_from_buffer(bytes)
	elif bytes[8] == 0x57 and bytes[9] == 0x45:
		err = img.load_webp_from_buffer(bytes)
	return ImageTexture.create_from_image(img) if err == OK else null
