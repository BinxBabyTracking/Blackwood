"use server";

import { screenName } from "@/lib/moderation";
import { redirect } from "next/navigation";
import { refresh } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/types";

const AVATAR_TYPES: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" };
const AVATAR_MAX = 2 * 1024 * 1024;

async function session() {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase is not configured." } as const;
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { error: "Your session has ended. Sign in again." } as const;
  return { supabase, user: data.user } as const;
}

async function validateName(raw: FormDataEntryValue | null): Promise<{ name: string; error?: undefined } | { error: string }> {
  const name = typeof raw === "string" ? raw.trim().replace(/\s+/g, " ") : "";
  if (name.length < 2 || name.length > 40) return { error: "Use between 2 and 40 characters." };
  // Other players see this name (joint investigations, the leaderboard).
  const screened = await screenName(name);
  if (!screened.ok) return { error: screened.error };
  return { name };
}

/** Uploads an avatar to the investigator's own folder and returns its public URL. */
async function uploadAvatar(
  supabase: NonNullable<Awaited<ReturnType<typeof createClient>>>,
  userId: string,
  file: File,
): Promise<{ url: string } | { error: string }> {
  const ext = AVATAR_TYPES[file.type];
  if (!ext) return { error: "Use a PNG, JPEG or WebP image." };
  if (file.size > AVATAR_MAX) return { error: "Images must be 2 MB or smaller." };
  const path = `${userId}/avatar-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("avatars").upload(path, file, { contentType: file.type, upsert: false });
  if (error) return { error: `Upload failed: ${error.message}` };
  return { url: supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl };
}

function avatarFile(fd: FormData) {
  const f = fd.get("avatar");
  return f instanceof File && f.size > 0 ? f : null;
}

export async function completeOnboarding(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const s = await session();
  if ("error" in s) return { status: "error", message: s.error! };

  const fieldErrors: Record<string, string> = {};
  const name = await validateName(fd.get("display_name"));
  if ("error" in name) fieldErrors.display_name = name.error!;
  const pref = fd.get("investigation_preference");
  if (pref !== "solo" && pref !== "collaborative") fieldErrors.investigation_preference = "Choose how you prefer to work.";
  if (Object.keys(fieldErrors).length) return { status: "error", message: "Check the highlighted fields.", fieldErrors };

  let avatar_url: string | undefined;
  const file = avatarFile(fd);
  if (file) {
    const up = await uploadAvatar(s.supabase, s.user.id, file);
    if ("error" in up) return { status: "error", message: up.error, fieldErrors: { avatar: up.error } };
    avatar_url = up.url;
  }

  const { error } = await s.supabase
    .from("detective_profiles")
    .update({
      display_name: (name as { name: string }).name,
      investigation_preference: pref,
      ...(avatar_url ? { avatar_url } : {}),
      onboarded_at: new Date().toISOString(),
    })
    .eq("id", s.user.id);
  if (error) return { status: "error", message: `Could not save your personnel file: ${error.message}` };

  redirect("/agency");
}

export async function updateProfile(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const s = await session();
  if ("error" in s) return { status: "error", message: s.error! };

  const name = await validateName(fd.get("display_name"));
  if ("error" in name) return { status: "error", message: name.error!, fieldErrors: { display_name: name.error! } };
  const pref = fd.get("investigation_preference");
  if (pref !== "solo" && pref !== "collaborative") {
    return { status: "error", message: "Choose how you prefer to work.", fieldErrors: { investigation_preference: "Choose one." } };
  }

  const patch: Record<string, unknown> = { display_name: name.name, investigation_preference: pref };
  const file = avatarFile(fd);
  if (file) {
    const up = await uploadAvatar(s.supabase, s.user.id, file);
    if ("error" in up) return { status: "error", message: up.error, fieldErrors: { avatar: up.error } };
    patch.avatar_url = up.url;
  } else if (fd.get("remove_avatar") === "on") {
    patch.avatar_url = null;
  }

  const { error } = await s.supabase.from("detective_profiles").update(patch).eq("id", s.user.id);
  if (error) return { status: "error", message: `Could not save your personnel file: ${error.message}` };
  refresh();
  return { status: "success", message: "Personnel file updated." };
}
