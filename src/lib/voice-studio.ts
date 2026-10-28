import "server-only";
import { caseIds, loadCase } from "@/game/registry";
import type { CaseDefinition, CharacterDef } from "@/game/engine/types";
import { castVoice, narrate, refreshVoices } from "@/lib/narration/elevenlabs";
import { createAdminClient } from "@/lib/supabase/admin";

/*
 * The Admin voice studio. Each character's voice can be designed with
 * ElevenLabs Voice Design from a written description (by default the case's
 * own casting direction), which makes three samples to choose from. A chosen
 * sample is saved to the ElevenLabs account as a voice, and replaces the
 * case's built-in voice for every player (see castVoice). Lines are cached by
 * voice, so a new voice records each line afresh the first time it's needed.
 */

const API_BASE = (process.env.ELEVENLABS_API_BASE ?? "https://api.elevenlabs.io").replace(/\/$/, "");
const API_KEY = process.env.ELEVENLABS_API_KEY ?? "";
/** The Voice Design model. eleven_ttv_v3 follows descriptions (accent, era, recording quality) more closely. */
const DESIGN_MODEL = process.env.ELEVENLABS_DESIGN_MODEL ?? "eleven_ttv_v3";
const BUCKET = "narration";

function db() {
  const a = createAdminClient();
  if (!a) throw new Error("The server is not configured for storage.");
  return a;
}

/** The case's people who speak and are cast on their own (not speaking in someone else's voice). */
const voiced = (def: CaseDefinition) => def.characters.filter((c) => c.voice && !c.voice.sameAs);

/**
 * What a sample says: the character's own words, so the voice is judged on the
 * kind of thing it will actually say. Between 100 and 1000 characters, as
 * Voice Design requires; null lets ElevenLabs write a line instead.
 */
function sampleText(def: CaseDefinition, c: CharacterDef): string | null {
  const lines: string[] = [];
  const push = (t: string) => {
    const clean = t.replace(/\s+/g, " ").trim();
    if (clean && !lines.includes(clean)) lines.push(clean);
  };
  for (const q of def.questions.filter((x) => x.characterId === c.id)) q.reply.forEach(push);
  for (const call of def.calls) call.lines.forEach((l, i) => (call.speakers?.[i] ?? call.from) === c.id && push(l));
  for (const st of def.statements) st.transcript.forEach((l) => l.speakerId === c.id && push(l.text));
  for (const e of def.evidence) e.readAloud?.forEach((p) => p.speakerId === c.id && push(p.text));
  let out = "";
  for (const l of lines) {
    if (out.length >= 220) break;
    if ((out + " " + l).length > 600) continue;
    out = out ? `${out} ${l}` : l;
  }
  return out.length >= 100 ? out : null;
}

export interface VoiceRow {
  caseId: string;
  characterId: string;
  name: string;
  role: string;
  /** The case's own casting direction. */
  direction: string;
  /** The description voices are designed from: an edited one, or the direction. */
  description: string;
  edited: boolean;
  /** The voice players hear now. */
  current: { voiceId: string; chosen: boolean };
  previews: { id: string; generatedVoiceId: string; description: string; createdAt: string; chosen: boolean }[];
}

/** Every speaking character in a case, with what's chosen and every sample made. */
export async function voiceRows(caseId: string): Promise<VoiceRow[]> {
  const def = loadCase(caseId);
  if (!def) return [];
  await refreshVoices(true);
  const [{ data: cast }, { data: prev }] = await Promise.all([
    db().from("voice_casting").select("character_id, description, voice_id, generated_voice_id").eq("case_id", def.id),
    db().from("voice_previews").select("id, character_id, generated_voice_id, description, created_at").eq("case_id", def.id).order("created_at", { ascending: false }).limit(500),
  ]);
  const rows = (cast ?? []) as { character_id: string; description: string | null; voice_id: string | null; generated_voice_id: string | null }[];
  const previews = (prev ?? []) as { id: string; character_id: string; generated_voice_id: string; description: string; created_at: string }[];
  return voiced(def).map((c) => {
    const r = rows.find((x) => x.character_id === c.id);
    const direction = c.voice!.direction;
    return {
      caseId: def.id,
      characterId: c.id,
      name: c.name,
      role: c.role,
      direction,
      description: r?.description ?? direction,
      edited: Boolean(r?.description),
      current: { voiceId: castVoice(def.id, c.id, c.voice!).voiceId, chosen: Boolean(r?.voice_id) },
      previews: previews
        .filter((p) => p.character_id === c.id)
        .map((p) => ({ id: p.id, generatedVoiceId: p.generated_voice_id, description: p.description, createdAt: p.created_at, chosen: p.generated_voice_id === r?.generated_voice_id })),
    };
  });
}

/** Cases with anyone who speaks, for the Admin page. */
export function voiceCases() {
  return caseIds().flatMap((id) => {
    const d = loadCase(id);
    return d && voiced(d).length ? [{ id: d.id, title: d.title, count: voiced(d).length }] : [];
  });
}

function character(caseId: string, characterId: string) {
  const def = loadCase(caseId);
  const c = def?.characters.find((x) => x.id === characterId && x.voice && !x.voice.sameAs);
  if (!def || !c) throw new Error("Unknown character.");
  return { def, c };
}

function needKey() {
  if (!API_KEY) throw new Error("No ElevenLabs key is set on the server (ELEVENLABS_API_KEY).");
}

async function failure(res: Response, what: string): Promise<never> {
  const text = (await res.text().catch(() => "")).slice(0, 300);
  if (res.status === 401) throw new Error("ElevenLabs rejected the API key.");
  if (/permission|missing_permissions/i.test(text)) throw new Error("The ElevenLabs key needs the Voices permission (Voice Design and creating voices).");
  if (/voice_limit|maximum.*voices|limit.*voices/i.test(text)) throw new Error("The ElevenLabs account has no free voice slots. Remove unused voices in ElevenLabs, or upgrade the plan.");
  if (/quota|credits|insufficient/i.test(text)) throw new Error("The ElevenLabs account is out of credits.");
  if (res.status === 409) throw new Error("ElevenLabs is still working on the last request. Try again in a moment.");
  throw new Error(`${what} failed (ElevenLabs ${res.status}). ${text}`);
}

/** Saves an edited description (empty goes back to the case's direction). */
export async function setDescription(caseId: string, characterId: string, description: string) {
  const { def, c } = character(caseId, characterId);
  const clean = description.replace(/\s+/g, " ").trim().slice(0, 1000);
  const { error } = await db()
    .from("voice_casting")
    .upsert({ case_id: def.id, character_id: c.id, description: clean && clean !== c.voice!.direction ? clean : null, updated_at: new Date().toISOString() }, { onConflict: "case_id,character_id" });
  if (error) throw new Error(error.message);
}

/** Designs three sample voices from the character's description, keeping each sample for review. */
export async function designVoices(caseId: string, characterId: string) {
  needKey();
  const { def, c } = character(caseId, characterId);
  const { data } = await db().from("voice_casting").select("description").eq("case_id", def.id).eq("character_id", c.id).maybeSingle();
  const description = (data as { description: string | null } | null)?.description ?? c.voice!.direction;
  const text = sampleText(def, c);
  const res = await fetch(`${API_BASE}/v1/text-to-voice/design?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ voice_description: description, model_id: DESIGN_MODEL, ...(text ? { text } : { auto_generate_text: true }) }),
    signal: AbortSignal.timeout(120000),
  });
  if (!res.ok) await failure(res, "Designing voices");
  const body = (await res.json()) as { previews?: { audio_base_64: string; generated_voice_id: string }[]; text?: string };
  const made: string[] = [];
  for (const p of body.previews ?? []) {
    const path = `voices/design/${def.id}/${c.id}/${p.generated_voice_id}.mp3`;
    const { error } = await db().storage.from(BUCKET).upload(path, Buffer.from(p.audio_base_64, "base64"), { contentType: "audio/mpeg", upsert: true });
    if (error) throw new Error(`Saving a sample failed: ${error.message}`);
    const { data: row, error: e2 } = await db()
      .from("voice_previews")
      .insert({ case_id: def.id, character_id: c.id, generated_voice_id: p.generated_voice_id, description, sample_text: body.text ?? text ?? "", audio_path: path })
      .select("id")
      .single();
    if (e2) throw new Error(`Recording a sample failed: ${e2.message}`);
    made.push((row as { id: string }).id);
  }
  if (!made.length) throw new Error("ElevenLabs returned no samples. Try again, or reword the description.");
  return made;
}

/** A sample's audio, as a data URL to play on the Admin page. */
export async function previewAudio(id: string) {
  const { data } = await db().from("voice_previews").select("audio_path").eq("id", id).maybeSingle();
  const path = (data as { audio_path: string } | null)?.audio_path;
  if (!path) throw new Error("That sample is gone.");
  const { data: file } = await db().storage.from(BUCKET).download(path);
  if (!file) throw new Error("That sample's audio is missing.");
  return `data:audio/mpeg;base64,${Buffer.from(await file.arrayBuffer()).toString("base64")}`;
}

/** The voice players hear now, speaking the same sample text, as a data URL. Cached like any line. */
export async function currentVoiceAudio(caseId: string, characterId: string) {
  needKey();
  const { def, c } = character(caseId, characterId);
  await refreshVoices(true);
  const text = sampleText(def, c) ?? `This is ${c.name}.`;
  const { audio } = await narrate(`${def.id}/voices/${c.id}`, text, castVoice(def.id, c.id, c.voice!));
  return `data:audio/mpeg;base64,${Buffer.from(audio).toString("base64")}`;
}

/**
 * Makes a sample the character's voice for every player: saves it to the
 * ElevenLabs account as a voice (once per sample) and records the choice.
 */
export async function chooseVoice(previewId: string) {
  needKey();
  const { data } = await db().from("voice_previews").select("case_id, character_id, generated_voice_id, description, saved_voice_id").eq("id", previewId).maybeSingle();
  const p = data as { case_id: string; character_id: string; generated_voice_id: string; description: string; saved_voice_id: string | null } | null;
  if (!p) throw new Error("That sample is gone.");
  const { def, c } = character(p.case_id, p.character_id);
  const voice_id = p.saved_voice_id ?? (await saveToAccount(def, c, p));
  const { error } = await db()
    .from("voice_casting")
    .upsert({ case_id: def.id, character_id: c.id, voice_id, generated_voice_id: p.generated_voice_id, updated_at: new Date().toISOString() }, { onConflict: "case_id,character_id" });
  if (error) throw new Error(error.message);
  await refreshVoices(true);
  return voice_id;
}

/** Saves a sample to the ElevenLabs account as a voice, once, and remembers which voice it became. */
async function saveToAccount(def: CaseDefinition, c: CharacterDef, p: { generated_voice_id: string; description: string }) {
  const res = await fetch(`${API_BASE}/v1/text-to-voice`, {
    method: "POST",
    headers: { "xi-api-key": API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      voice_name: `Blackwood ${def.id} ${c.name}`.slice(0, 100),
      voice_description: p.description.slice(0, 1000),
      generated_voice_id: p.generated_voice_id,
      labels: { app: "blackwood", case: def.id, character: c.id },
    }),
    signal: AbortSignal.timeout(60000),
  });
  if (!res.ok) await failure(res, "Saving the voice");
  const { voice_id } = (await res.json()) as { voice_id: string };
  await db().from("voice_previews").update({ saved_voice_id: voice_id }).eq("generated_voice_id", p.generated_voice_id);
  return voice_id;
}

/** Goes back to the case's built-in voice. */
export async function restoreOriginalVoice(caseId: string, characterId: string) {
  const { def, c } = character(caseId, characterId);
  const { error } = await db().from("voice_casting").update({ voice_id: null, generated_voice_id: null, updated_at: new Date().toISOString() }).eq("case_id", def.id).eq("character_id", c.id);
  if (error) throw new Error(error.message);
  await refreshVoices(true);
}
