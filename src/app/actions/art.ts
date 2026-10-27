"use server";

import { headers } from "next/headers";
import { refreshArt } from "@/game/registry";
import { hasAdminAccess } from "@/lib/admin-gate";
import { generateImage, setLive, setSubject, uploadImage } from "@/lib/art-studio";
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
export async function generateArt(id: string, goLive = false): Promise<Result<{ version: number; url: string; model: string; cost: number }>> {
  if (!(await admin())) return { error: "Not allowed." };
  try {
    const r = await generateImage(id, await origin());
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
