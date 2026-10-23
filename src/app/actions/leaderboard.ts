"use server";

import { revalidatePath } from "next/cache";
import { loadCase } from "@/game/registry";
import { hasAdminAccess } from "@/lib/admin-gate";
import { requireInvestigator } from "@/lib/investigator";
import { boards, cleanName, hideMine, myResult, removeEntry, submit } from "@/lib/leaderboard";
import { screenName } from "@/lib/moderation";
import { hostLobby } from "@/lib/party";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/** A case's boards, for the leaderboard window. Anyone may look; a signed-in viewer also sees their own place. */
export async function getLeaderboard(caseId: string) {
  const supabase = await createClient();
  const me = supabase ? (await supabase.auth.getUser()).data.user : null;
  const def = loadCase(caseId);
  if (!def) return { error: "Unknown case." } as const;
  try {
    return { boards: await boards(def.id, me?.id ?? null), title: def.title, signedIn: Boolean(me) } as const;
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
    const screened = await screenName(clean.name);
    if (!screened.ok) return { error: screened.error };
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

export type NameTest = { name: string; allowed: boolean; by: "words" | "claude" | null } | null;

/** Admin: tries a name against the screening, to see what players would get. */
export async function adminTestName(_prev: NameTest, fd: FormData): Promise<NameTest> {
  const me = await requireInvestigator();
  if (!(await hasAdminAccess(me.id))) return null;
  const name = String(fd.get("name") ?? "").replace(/\s+/g, " ").trim().slice(0, 40);
  if (!name) return null;
  const r = await screenName(name);
  return { name, allowed: r.ok, by: r.ok ? null : r.by };
}
