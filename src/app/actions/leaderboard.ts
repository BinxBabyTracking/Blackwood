"use server";

import { revalidatePath } from "next/cache";
import { loadCase } from "@/game/registry";
import { hasAdminAccess } from "@/lib/admin-gate";
import { requireInvestigator } from "@/lib/investigator";
import { boards, cleanName, hideMine, myResult, removeEntry, submit } from "@/lib/leaderboard";
import { hostLobby } from "@/lib/party";
import { createAdminClient } from "@/lib/supabase/admin";

/** A case's boards, for the leaderboard window. */
export async function getLeaderboard(caseId: string) {
  const me = await requireInvestigator();
  const def = loadCase(caseId);
  if (!def) return { error: "Unknown case." } as const;
  try {
    return { boards: await boards(def.id, me.id), title: def.title } as const;
  } catch (e) {
    console.error("getLeaderboard", e);
    return { error: "The leaderboard is unavailable right now." } as const;
  }
}

/** The investigator's first-solve score and where it places, for the closing screen. */
export async function getMyResult(caseId: string) {
  const me = await requireInvestigator();
  const def = loadCase(caseId);
  if (!def) return null;
  return myResult(def, me.id, me.profile.display_name).catch((e) => {
    console.error("getMyResult", e);
    return null;
  });
}

export async function submitLeaderboard(caseId: string, name: string) {
  const me = await requireInvestigator();
  const def = loadCase(caseId);
  if (!def) return { error: "Unknown case." };
  const res = await submit(def, me.id, name);
  revalidatePath("/agency/cases");
  return res;
}

export async function setMyEntryHidden(caseId: string, hidden: boolean) {
  const me = await requireInvestigator();
  await hideMine(caseId, me.id, hidden);
  return { ok: true };
}

/** Host: names the group for a joint investigation. */
export async function setGroupName(name: string) {
  const me = await requireInvestigator();
  const l = await hostLobby(me.id);
  if (!l) return { error: "Open a lobby first." };
  const trimmed = String(name ?? "").trim();
  if (trimmed) {
    const clean = cleanName(trimmed);
    if ("error" in clean) return clean;
  }
  await createAdminClient()!.from("party_lobbies").update({ group_name: trimmed || null }).eq("id", l.id).eq("host_user_id", me.id);
  return { ok: true, name: trimmed };
}

/** Admin: takes an entry off the board for good. */
export async function adminRemoveEntry(fd: FormData) {
  const me = await requireInvestigator();
  if (!(await hasAdminAccess(me.id))) return;
  const id = Number(fd.get("id"));
  if (Number.isInteger(id)) await removeEntry(id);
  revalidatePath("/agency/admin");
}
