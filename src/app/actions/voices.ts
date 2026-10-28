"use server";

import { hasAdminAccess } from "@/lib/admin-gate";
import { requireInvestigator } from "@/lib/investigator";
import { chooseVoice, currentVoiceAudio, designVoices, previewAudio, setDescription, restoreOriginalVoice, voiceRows, type VoiceRow } from "@/lib/voice-studio";

type Result<T> = ({ ok: true } & T) | { error: string };

async function admin() {
  const me = await requireInvestigator();
  return hasAdminAccess(me.id);
}
const fail = (e: unknown, fallback: string) => ({ error: e instanceof Error ? e.message : fallback });

/** Admin: every speaking character in a case, with the samples made so far. */
export async function loadVoices(caseId: string): Promise<Result<{ rows: VoiceRow[] }>> {
  if (!(await admin())) return { error: "Not allowed." };
  try {
    return { ok: true, rows: await voiceRows(caseId) };
  } catch (e) {
    return fail(e, "The voices could not be loaded.");
  }
}

/** Admin: saves the description, then makes three samples from it. */
export async function designCharacterVoices(caseId: string, characterId: string, description: string): Promise<Result<{ rows: VoiceRow[] }>> {
  if (!(await admin())) return { error: "Not allowed." };
  try {
    await setDescription(caseId, characterId, description);
    await designVoices(caseId, characterId);
    return { ok: true, rows: await voiceRows(caseId) };
  } catch (e) {
    console.error("designCharacterVoices", caseId, characterId, e instanceof Error ? e.message : e);
    return fail(e, "The voices could not be designed.");
  }
}

export async function saveVoiceDescription(caseId: string, characterId: string, description: string): Promise<Result<object>> {
  if (!(await admin())) return { error: "Not allowed." };
  try {
    await setDescription(caseId, characterId, description);
    return { ok: true };
  } catch (e) {
    return fail(e, "The description couldn't be saved.");
  }
}

export async function playSample(previewId: string): Promise<Result<{ src: string }>> {
  if (!(await admin())) return { error: "Not allowed." };
  try {
    return { ok: true, src: await previewAudio(previewId) };
  } catch (e) {
    return fail(e, "The sample couldn't be played.");
  }
}

export async function playCurrentVoice(caseId: string, characterId: string): Promise<Result<{ src: string }>> {
  if (!(await admin())) return { error: "Not allowed." };
  try {
    return { ok: true, src: await currentVoiceAudio(caseId, characterId) };
  } catch (e) {
    return fail(e, "The current voice couldn't be played.");
  }
}

/** Admin: makes a sample the character's voice for every player. */
export async function chooseSample(caseId: string, previewId: string): Promise<Result<{ rows: VoiceRow[] }>> {
  if (!(await admin())) return { error: "Not allowed." };
  try {
    await chooseVoice(previewId);
    return { ok: true, rows: await voiceRows(caseId) };
  } catch (e) {
    console.error("chooseSample", previewId, e instanceof Error ? e.message : e);
    return fail(e, "That voice couldn't be chosen.");
  }
}

export async function restoreOriginal(caseId: string, characterId: string): Promise<Result<{ rows: VoiceRow[] }>> {
  if (!(await admin())) return { error: "Not allowed." };
  try {
    await restoreOriginalVoice(caseId, characterId);
    return { ok: true, rows: await voiceRows(caseId) };
  } catch (e) {
    return fail(e, "That couldn't be changed.");
  }
}
