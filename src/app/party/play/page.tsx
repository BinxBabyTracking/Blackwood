import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { normalizeState, respond } from "@/game/engine/engine";
import { findInvestigation, investigatorName } from "@/game/persistence";
import { loadCase } from "@/game/registry";
import { InvestigationShell } from "@/game/ui/investigation-shell";
import { currentGuest, lobbyGuests } from "@/lib/party";
import { PartyFrame } from "../party-ui";

export const metadata: Metadata = { title: "Joint investigation", robots: { index: false } };

/** A guest's screen: the host's investigation, played on the guest's own phone or laptop. */
export default function GuestPlayPage() {
  return (
    <Suspense fallback={<PartyFrame title="Opening the file">One moment.</PartyFrame>}>
      <GuestDesk />
    </Suspense>
  );
}

async function GuestDesk() {
  const seat = await currentGuest().catch(() => null);
  if (!seat) redirect("/party/ended");
  if (seat.lobby.status !== "started") redirect(`/party/${seat.lobby.code}`);
  const def = loadCase(seat.lobby.case_id);
  const loaded = def ? await findInvestigation(seat.lobby.host_user_id, def.id).catch(() => null) : null;
  if (!def || !loaded) return <PartyFrame title="The case file could not be opened.">Ask the host to reopen the joint investigation.</PartyFrame>;

  const [host, guests] = await Promise.all([investigatorName(seat.lobby.host_user_id), lobbyGuests(seat.lobby.id)]);
  return (
    <main id="main">
      <InvestigationShell
        caseId={def.id}
        homeLocation={def.startLocation}
        initial={respond(def, normalizeState(def, loaded.state)).view}
        investigator={host}
        prefs={{ reducedMotion: false, masterVolume: 80, musicVolume: 70, dialogueVolume: 90, sfxVolume: 75 }}
        party={{ label: `${seat.lobby.group_name ? `${seat.lobby.group_name} · ` : ""}Helping ${host} · ${guests.length + 1} at the table`, guest: true, stamp: loaded.updatedAt }}
      />
    </main>
  );
}
