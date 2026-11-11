"use server";

import { headers } from "next/headers";
import { refreshArt } from "@/game/registry";
import { hasAdminAccess } from "@/lib/admin-gate";
import { checkMeshyModel, confirmModel, fullPrompt, generateImage, modelUploadTarget, setLive, setLiveModel, setSubject, startMeshyModel, uploadImage, skinPerson, setLiveCharacter, characterUploadTarget, confirmCharacter, type MeshyCheck, type Tier } from "@/lib/art-studio";
import { requireInvestigator } from "@/lib/investigator";

type Result<T> = ({ ok: true } & T) | { error: string };

async function admin() {
  const me = await requireInvestigator();
  return hasAdminAccess(me.id);
}
const fail = (e: unknown, fallback: string) => ({ error: e instanceof Error ? e.message : fallback });

async function origin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (host) return `${h.get("x-forwarded-proto") ?? "https"}://${host}`;
  return process.env.NEXT_PUBLIC_SITE_URL ?? "";
}

/** Admin: makes one image with OpenAI. With `goLive`, it goes live straight away. */
export async function generateArt(id: string, goLive = false, tier: Tier = "standard"): Promise<Result<{ version: number; url: string; model: string; cost: number }>> {
  if (!(await admin())) return { error: "Not allowed." };
  try {
    const r = await generateImage(id, await origin(), tier === "draft" || tier === "best" ? tier : "standard");
    if (goLive) {
      await setLive(id, r.version);
      await refreshArt(true);
    }
    return { ok: true, ...r };
  } catch (e) {
    console.error("generateArt", id, e instanceof Error ? e.message : e);
    return fail(e, "The image could not be made.");
  }
}

/** Admin: makes a version live, or goes back to the committed painting (version null). */
export async function setArtLive(id: string, version: number | null): Promise<Result<object>> {
  if (!(await admin())) return { error: "Not allowed." };
  try {
    await setLive(id, version);
    await refreshArt(true);
    return { ok: true };
  } catch (e) {
    return fail(e, "That couldn't be changed.");
  }
}

export async function saveArtSubject(id: string, subject: string): Promise<Result<object>> {
  if (!(await admin())) return { error: "Not allowed." };
  try {
    await setSubject(id, subject);
    return { ok: true };
  } catch (e) {
    return fail(e, "The prompt couldn't be saved.");
  }
}

export async function uploadArt(fd: FormData): Promise<Result<{ version: number; url: string }>> {
  if (!(await admin())) return { error: "Not allowed." };
  const id = String(fd.get("id") ?? "");
  const file = fd.get("file");
  if (!(file instanceof File) || !file.size) return { error: "Choose an image file." };
  try {
    return { ok: true, ...(await uploadImage(id, file, await origin())) };
  } catch (e) {
    return fail(e, "The upload failed.");
  }
}

/** Admin: where to upload a new GLB for a 3D model entry (the browser uploads it straight to storage). */
export async function startModelUpload(id: string): Promise<Result<{ version: number; path: string; token: string }>> {
  if (!(await admin())) return { error: "Not allowed." };
  try {
    return { ok: true, ...(await modelUploadTarget(id)) };
  } catch (e) {
    return fail(e, "The upload couldn't start.");
  }
}

/** Admin: records an uploaded GLB and makes it the one the game uses. */
export async function finishModelUpload(id: string, version: number): Promise<Result<{ version: number; url: string; bytes: number }>> {
  if (!(await admin())) return { error: "Not allowed." };
  try {
    return { ok: true, ...(await confirmModel(id, version)) };
  } catch (e) {
    return fail(e, "The model couldn't be saved.");
  }
}

/** Admin: chooses which uploaded GLB the game uses (null for none). */
export async function chooseModel(id: string, version: number | null): Promise<Result<object>> {
  if (!(await admin())) return { error: "Not allowed." };
  try {
    await setLiveModel(id, version);
    return { ok: true };
  } catch (e) {
    return fail(e, "That couldn't be changed.");
  }
}

/** Admin: the full prompt an image is made from (loaded when asked for, to keep the Artwork tab light). */
export async function artFullPrompt(id: string, subject: string): Promise<Result<{ prompt: string }>> {
  if (!(await admin())) return { error: "Not allowed." };
  return { ok: true, prompt: fullPrompt(id, subject) };
}

/** Admin: starts making a 3D model with Meshy from its reference picture. */
export async function startMeshy(id: string): Promise<Result<{ task: string; already: boolean; from: "picture" | "prompt" }>> {
  if (!(await admin())) return { error: "Not allowed." };
  try {
    return { ok: true, ...(await startMeshyModel(id, await origin())) };
  } catch (e) {
    console.error("startMeshy", id, e instanceof Error ? e.message : e);
    return fail(e, "Meshy could not start the model.");
  }
}

/** Admin: checks a Meshy model; stores it once it's finished. */
export async function checkMeshy(id: string): Promise<Result<{ check: MeshyCheck }>> {
  if (!(await admin())) return { error: "Not allowed." };
  try {
    const check = await checkMeshyModel(id);
    if (check.state === "done" && check.live) await refreshArt(true);
    return { ok: true, check };
  } catch (e) {
    console.error("checkMeshy", id, e instanceof Error ? e.message : e);
    return fail(e, "Couldn't check the model.");
  }
}

/** Admin: paints a person's 3D character from their views. */
export async function makeCharacter(person: string, base: string): Promise<Result<{ version: number; url: string; bytes: number; live: boolean; report: string[] }>> {
  if (!(await admin())) return { error: "Not allowed." };
  try {
    return { ok: true, ...(await skinPerson(person, base, await origin())) };
  } catch (e) {
    console.error("makeCharacter", person, e instanceof Error ? e.message : e);
    return fail(e, "Couldn't make the character.");
  }
}

/** Admin: chooses the version of a 3D character the game uses. */
export async function chooseCharacter(person: string, version: number): Promise<Result<object>> {
  if (!(await admin())) return { error: "Not allowed." };
  try {
    await setLiveCharacter(person, version);
    return { ok: true };
  } catch (e) {
    return fail(e, "Couldn't choose that version.");
  }
}

/** Admin: where to upload a finished 3D character GLB for a person (the browser uploads it straight to storage). */
export async function startCharacterUpload(person: string): Promise<Result<{ version: number; path: string; token: string }>> {
  if (!(await admin())) return { error: "Not allowed." };
  try {
    return { ok: true, ...(await characterUploadTarget(person)) };
  } catch (e) {
    return fail(e, "The upload couldn't start.");
  }
}

/** Admin: records an uploaded 3D character and makes it the one the game uses. */
export async function finishCharacterUpload(person: string, version: number): Promise<Result<{ version: number; url: string; bytes: number; report: string[] }>> {
  if (!(await admin())) return { error: "Not allowed." };
  try {
    return { ok: true, ...(await confirmCharacter(person, version)) };
  } catch (e) {
    return fail(e, "The character couldn't be saved.");
  }
}

/** Admin: turns a 3D model (every copy, in every room) because Meshy built it facing the wrong way. */
export async function turnModel(imageId: string, turn: number): Promise<Result<{ turn: number }>> {
  if (!(await admin())) return { error: "Not allowed." };
  if (!/^[a-z0-9_]+$/.test(imageId)) return { error: "Unknown model." };
  const t = ((((Math.round(turn / 90) * 90 + 180) % 360) + 360) % 360) - 180;
  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const db = createAdminClient();
    if (!db) return { error: "The database isn't configured." };
    const { error } = await db.from("art_turns").upsert({ image_id: imageId, turn: t, updated_at: new Date().toISOString() }, { onConflict: "image_id" });
    if (error) return { error: error.message };
    return { ok: true, turn: t };
  } catch (e) {
    return fail(e, "Couldn't save the turn.");
  }
}

/** Admin: saves a walkable room as arranged in Edit mode. */
export async function saveRoomLayout(roomId: string, layout: unknown): Promise<Result<object>> {
  if (!(await admin())) return { error: "Not allowed." };
  if (!/^[a-z0-9_]+$/.test(roomId)) return { error: "Unknown room." };
  const text = JSON.stringify(layout);
  if (text.length > 2_000_000) return { error: "That layout is too big to save." };
  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const db = createAdminClient();
    if (!db) return { error: "The database isn't configured." };
    const { error } = await db.from("world_layouts").upsert({ room_id: roomId, layout, updated_at: new Date().toISOString() }, { onConflict: "room_id" });
    return error ? { error: error.message } : { ok: true };
  } catch (e) {
    return fail(e, "Couldn't save the room.");
  }
}

/** Admin: puts a walkable room back to its generated layout. */
export async function clearRoomLayout(roomId: string): Promise<Result<object>> {
  if (!(await admin())) return { error: "Not allowed." };
  if (!/^[a-z0-9_]+$/.test(roomId)) return { error: "Unknown room." };
  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const db = createAdminClient();
    if (!db) return { error: "The database isn't configured." };
    const { error } = await db.from("world_layouts").delete().eq("room_id", roomId);
    return error ? { error: error.message } : { ok: true };
  } catch (e) {
    return fail(e, "Couldn't reset the room.");
  }
}
