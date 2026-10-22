"use server";

import { timingSafeEqual } from "node:crypto";
import { redirect } from "next/navigation";
import { PersistenceError, startInvestigation } from "@/game/persistence";
import { loadCase } from "@/game/registry";
import { requireInvestigator } from "@/lib/investigator";
import {
  addGuest,
  currentGuest,
  hostLobby,
  lobbyByCode,
  lobbyGuests,
  openLobby,
  removeGuest,
  seatGuest,
  setLobbyStatus,
  unseatGuest,
} from "@/lib/party";

/** Host: opens a joint investigation for a case and shows its QR code. */
export async function openParty(fd: FormData) {
  const me = await requireInvestigator();
  const def = loadCase(String(fd.get("caseId") ?? ""));
  if (!def) redirect("/agency/joint-investigations?error=case");
  try {
    // Everyone plays the host's investigation: continue theirs, or open one.
    await startInvestigation(me.id, def);
    await openLobby(me.id, def.id);
  } catch (e) {
    console.error("openParty", e);
    redirect(`/agency/joint-investigations?error=${e instanceof PersistenceError ? "case" : "open"}`);
  }
  redirect("/agency/joint-investigations");
}

export type LobbyStatus = { status: "lobby" | "started" | "ended"; guests: { id: string; name: string }[] };

/** Host: who has joined so far. Polled by the lobby screen. */
export async function hostLobbyStatus(): Promise<LobbyStatus> {
  const me = await requireInvestigator();
  const l = await hostLobby(me.id);
  if (!l) return { status: "ended", guests: [] };
  const guests = await lobbyGuests(l.id);
  return { status: l.status, guests: guests.map((g) => ({ id: g.id, name: g.name })) };
}

/** Host: starts the investigation for everyone in the lobby. */
export async function startParty() {
  const me = await requireInvestigator();
  const l = await hostLobby(me.id);
  if (!l) redirect("/agency/joint-investigations");
  await setLobbyStatus(me.id, l.id, "started");
  redirect(`/play/${l.case_id}`);
}

/** Host: ends the joint investigation. Guests are sent back to the start; the host's progress stays. */
export async function closeParty() {
  const me = await requireInvestigator();
  const l = await hostLobby(me.id);
  if (l) await setLobbyStatus(me.id, l.id, "ended");
  redirect("/agency/joint-investigations");
}

/** Host: removes someone from the lobby. */
export async function removePartyGuest(fd: FormData) {
  const me = await requireInvestigator();
  const l = await hostLobby(me.id);
  const id = String(fd.get("guestId") ?? "");
  if (l && (await lobbyGuests(l.id)).some((g) => g.id === id)) await removeGuest(id);
}

export type JoinState = { error?: string };

/** Guest: takes a seat with just a name. The QR link carries the lobby's key. */
export async function joinParty(_prev: JoinState, fd: FormData): Promise<JoinState> {
  const code = String(fd.get("code") ?? "").trim().toUpperCase().slice(0, 12);
  const key = String(fd.get("key") ?? "");
  const name = String(fd.get("name") ?? "").replace(/\s+/g, " ").trim().slice(0, 40);
  if (!name) return { error: "Enter a name so the table knows who you are." };
  const lobby = await lobbyByCode(code).catch(() => null);
  const ok = lobby && key.length === lobby.join_key.length && timingSafeEqual(Buffer.from(key), Buffer.from(lobby.join_key));
  if (!lobby || !ok) return { error: "This invitation has ended. Ask the host to show the code again." };
  const guest = await addGuest(lobby, name);
  if (!guest) return { error: "The table is full." };
  await seatGuest(lobby, guest);
  redirect(lobby.status === "started" ? "/party/play" : `/party/${lobby.code}?k=${encodeURIComponent(key)}`);
}

/** Guest: whether the host has started. Polled by the waiting screen. */
export async function guestStatus(): Promise<{ status: "lobby" | "started" | "ended"; count: number }> {
  const seat = await currentGuest().catch(() => null);
  if (!seat) return { status: "ended", count: 0 };
  const guests = await lobbyGuests(seat.lobby.id);
  return { status: seat.lobby.status, count: guests.length + 1 };
}

/** Guest: leaves the table. */
export async function leaveParty() {
  const seat = await currentGuest().catch(() => null);
  if (seat) await removeGuest(seat.guest.id);
  await unseatGuest();
  redirect("/");
}
