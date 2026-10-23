import "server-only";
import { createHmac, randomBytes, randomInt, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/*
 * Joint investigations in the same room.
 *
 * The signed-in host opens a lobby and shows a QR code. Guests scan it, give a
 * name, and wait; when the host starts, everyone plays the host's own
 * investigation. Guests have no account: a signed cookie names their lobby
 * and seat, and every action they take is applied as the host, to the host's
 * save, for that one case only. Guests never see the host's account.
 */

export const MAX_PARTY = 6;
const GUEST_COOKIE = "bw_party";
const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export type Lobby = {
  id: string;
  code: string;
  join_key: string;
  host_user_id: string;
  case_id: string;
  status: "lobby" | "started" | "ended";
  created_at: string;
  started_at: string | null;
  expires_at: string;
  group_name: string | null;
  session_id: string | null;
  max_size: number;
};
export type Guest = { id: string; lobby_id: string; name: string; joined_at: string };

function db() {
  const a = createAdminClient();
  if (!a) throw new Error("The server is not configured for joint investigations.");
  return a;
}

const live = (l: Lobby | null) => Boolean(l && l.status !== "ended" && new Date(l.expires_at).getTime() > Date.now());

function newCode() {
  return Array.from({ length: 6 }, () => CODE_CHARS[randomInt(CODE_CHARS.length)]).join("");
}

/** Opens a new lobby for the host, closing any lobby they already had. */
export async function openLobby(hostId: string, caseId: string): Promise<Lobby> {
  await db().from("party_lobbies").update({ status: "ended" }).eq("host_user_id", hostId).neq("status", "ended");
  for (let i = 0; i < 5; i++) {
    const { data, error } = await db()
      .from("party_lobbies")
      .insert({ code: newCode(), join_key: randomBytes(12).toString("base64url"), host_user_id: hostId, case_id: caseId })
      .select("*")
      .single();
    if (!error && data) return data as Lobby;
  }
  throw new Error("Could not open a lobby. Try again.");
}

/** The host's open or running lobby, if any. */
export async function hostLobby(hostId: string): Promise<Lobby | null> {
  const { data } = await db()
    .from("party_lobbies")
    .select("*")
    .eq("host_user_id", hostId)
    .neq("status", "ended")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const l = (data as Lobby | null) ?? null;
  return live(l) ? l : null;
}

export async function lobbyByCode(code: string): Promise<Lobby | null> {
  const { data } = await db().from("party_lobbies").select("*").eq("code", code.toUpperCase()).maybeSingle();
  const l = (data as Lobby | null) ?? null;
  return live(l) ? l : null;
}

export async function lobbyGuests(lobbyId: string): Promise<Guest[]> {
  const { data } = await db().from("party_guests").select("id, lobby_id, name, joined_at").eq("lobby_id", lobbyId).order("joined_at");
  return (data ?? []) as Guest[];
}

export async function setLobbyStatus(hostId: string, lobbyId: string, status: "started" | "ended") {
  await db()
    .from("party_lobbies")
    .update(status === "started" ? { status, started_at: new Date().toISOString() } : { status })
    .eq("id", lobbyId)
    .eq("host_user_id", hostId);
}

/** Seats a guest, if there is room. */
export async function addGuest(lobby: Lobby, name: string): Promise<Guest | null> {
  const seated = await lobbyGuests(lobby.id);
  if (seated.length >= MAX_PARTY - 1) return null;
  const { data, error } = await db().from("party_guests").insert({ lobby_id: lobby.id, name }).select("id, lobby_id, name, joined_at").single();
  if (error) return null;
  // The largest the table has been: a joint investigation goes on the group leaderboard.
  const size = seated.length + 2;
  await db().from("party_lobbies").update({ max_size: size }).eq("id", lobby.id).lt("max_size", size);
  return data as Guest;
}

export async function removeGuest(guestId: string) {
  await db().from("party_guests").delete().eq("id", guestId);
}

// ---- The guest's seat, in a signed cookie ----------------------------------

function sign(value: string) {
  return createHmac("sha256", process.env.SUPABASE_SECRET_KEY ?? "").update(`party|${value}`).digest("base64url");
}

export async function seatGuest(lobby: Lobby, guest: Guest) {
  const value = `${lobby.id}.${guest.id}`;
  (await cookies()).set(GUEST_COOKIE, `${value}.${sign(value)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(lobby.expires_at),
  });
}

export async function unseatGuest() {
  (await cookies()).delete(GUEST_COOKIE);
}

/** The lobby and seat in this browser's guest cookie, while the lobby is open. */
export async function currentGuest(): Promise<{ lobby: Lobby; guest: Guest } | null> {
  if (!process.env.SUPABASE_SECRET_KEY) return null;
  const raw = (await cookies()).get(GUEST_COOKIE)?.value ?? "";
  const [lobbyId, guestId, sig] = raw.split(".");
  if (!lobbyId || !guestId || !sig) return null;
  const want = sign(`${lobbyId}.${guestId}`);
  if (sig.length !== want.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(want))) return null;
  const [{ data: l }, { data: g }] = await Promise.all([
    db().from("party_lobbies").select("*").eq("id", lobbyId).maybeSingle(),
    db().from("party_guests").select("id, lobby_id, name, joined_at").eq("id", guestId).maybeSingle(),
  ]);
  const lobby = (l as Lobby | null) ?? null;
  if (!live(lobby) || !g) return null;
  return { lobby: lobby!, guest: g as Guest };
}

/**
 * Who an action on this case is taken as. On a guest screen (`asGuest`), a
 * guest seated in a started lobby for this case acts as the host. Everywhere
 * else the signed-in investigator acts as themself, even if this browser also
 * holds a guest seat, so a guest's own solo game is never touched.
 */
export async function actingUser(caseId: string, asGuest = false): Promise<{ userId: string; guest: Guest | null; lobby: Lobby | null } | null> {
  if (asGuest) {
    const seat = await currentGuest().catch(() => null);
    if (seat && seat.lobby.status === "started" && seat.lobby.case_id === caseId) {
      return { userId: seat.lobby.host_user_id, guest: seat.guest, lobby: seat.lobby };
    }
    return null;
  }
  const supabase = await createClient();
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;
  return user ? { userId: user.id, guest: null, lobby: null } : null;
}

/** Audio and transcription requests come from a guest screen when that page is under /party/. */
export function fromGuestScreen(request: Request) {
  const ref = request.headers.get("referer");
  if (!ref) return false;
  try {
    const u = new URL(ref);
    return u.host === new URL(request.url).host && u.pathname.startsWith("/party/");
  } catch {
    return false;
  }
}

/** The running lobby the host is playing this case in, for the in-game roster. */
export async function hostParty(hostId: string, caseId: string) {
  const l = await hostLobby(hostId).catch(() => null);
  if (!l || l.status !== "started" || l.case_id !== caseId) return null;
  return l;
}
