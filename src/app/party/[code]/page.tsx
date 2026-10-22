import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { loadCase } from "@/game/registry";
import { currentGuest, lobbyByCode, lobbyGuests } from "@/lib/party";
import { JoinForm, PartyFrame, Waiting } from "../party-ui";

export const metadata: Metadata = { title: "Join the investigation", robots: { index: false } };

/** Where the host's QR code leads: give a name, then wait for the host to start. */
export default function JoinPage({ params, searchParams }: PageProps<"/party/[code]">) {
  return (
    <Suspense fallback={<PartyFrame title="Opening the file">One moment.</PartyFrame>}>
      <Join params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function Join({ params, searchParams }: { params: Promise<{ code: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { code } = await params;
  const { k } = await searchParams;
  const key = typeof k === "string" ? k : "";
  const [seat, lobby] = await Promise.all([currentGuest().catch(() => null), lobbyByCode(code).catch(() => null)]);

  if (seat && seat.lobby.code === code.toUpperCase()) {
    if (seat.lobby.status === "started") redirect("/party/play");
    const count = (await lobbyGuests(seat.lobby.id)).length + 1;
    return (
      <PartyFrame title={loadCase(seat.lobby.case_id)?.title ?? "Joint investigation"} kicker={seat.lobby.case_id}>
        <Waiting name={seat.guest.name} initialCount={count} />
      </PartyFrame>
    );
  }
  if (!lobby) {
    return <PartyFrame title="This invitation has ended.">Ask the host to open a joint investigation and show the code again.</PartyFrame>;
  }
  return (
    <PartyFrame title={loadCase(lobby.case_id)?.title ?? "Joint investigation"} kicker={lobby.case_id}>
      <p>You are joining a joint investigation. Everything you find goes into the host&apos;s case file.</p>
      <JoinForm code={lobby.code} joinKey={key} />
    </PartyFrame>
  );
}
