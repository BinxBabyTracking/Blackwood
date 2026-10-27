import type { Metadata } from "next";
import QRCode from "qrcode";
import Link from "next/link";
import { Suspense } from "react";
import { closeParty } from "@/app/actions/party";
import { PortalHeading } from "@/components/portal/heading";
import { LoadingFile, Panel, buttonClass } from "@/components/ui";
import { loadCase } from "@/game/registry";
import { requireInvestigator } from "@/lib/investigator";
import { hostLobby, lobbyGuests, MAX_PARTY } from "@/lib/party";
import { siteOrigin } from "@/lib/site";
import { CopyLink, HostLobby } from "./joint-forms";

export const metadata: Metadata = { title: "Investigate as a Team" };

export default function JointInvestigationsPage({ searchParams }: PageProps<"/agency/joint-investigations">) {
  return (
    <>
      <PortalHeading title="Investigate as a Team">
        Work a case together in the same room. You host and show a QR code; everyone else scans it with their phone, gives a name,
        and joins your investigation. No accounts needed for them.
      </PortalHeading>
      <Suspense fallback={<LoadingFile label="Opening the team lobby" />}>
        <Joint searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Joint({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const me = await requireInvestigator();
  const { error } = await searchParams;
  const lobby = await hostLobby(me.id).catch(() => null);

  if (!lobby) {
    return (
      <Panel className="max-w-xl p-6">
        <h2 className="font-serif text-xl">No team investigation is open</h2>
        {error ? (
          <p role="alert" className="mt-4 border border-fault bg-fault/15 px-4 py-3 text-sm">
            {error === "case" ? "That case is not open for investigation." : "The team investigation could not be opened. Try again."}
          </p>
        ) : null}
        <p className="mt-2 text-sm text-smoke">
          Open a case under Available Assignments or My Case Files and choose Investigate as a Team. You get a QR code here for everyone to scan.
        </p>
        <Link href="/agency/assignments" className={buttonClass("primary", "mt-5")}>
          Available Assignments
        </Link>
      </Panel>
    );
  }

  const link = `${await siteOrigin()}/party/${lobby.code}?k=${encodeURIComponent(lobby.join_key)}`;
  const svg = await QRCode.toString(link, { type: "svg", margin: 1, errorCorrectionLevel: "M", color: { dark: "#14171a", light: "#efe8d6" } });
  const guests = await lobbyGuests(lobby.id);
  const title = loadCase(lobby.case_id)?.title ?? lobby.case_id;

  return (
    <Panel className="mx-auto max-w-md p-6 text-center">
      <p className="font-mono text-sm text-brass">{lobby.case_id}</p>
      <h2 className="font-serif text-2xl">{title}</h2>
      <p className="mt-1 text-sm text-smoke">Scan to join the investigation.</p>
      <div
        className="mx-auto mt-5 w-full max-w-[18rem] overflow-hidden rounded-[2px] bg-[#efe8d6] p-2 [&>svg]:block [&>svg]:h-auto [&>svg]:w-full"
        role="img"
        aria-label={`QR code to join, code ${lobby.code}`}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      <p className="mt-3 font-mono text-lg tracking-[0.3em]">{lobby.code}</p>
      <CopyLink link={link} />
      <HostLobby
        caseId={lobby.case_id}
        max={MAX_PARTY}
        initial={{ status: lobby.status, guests: guests.map((g) => ({ id: g.id, name: g.name })) }}
        host={me.profile.display_name ?? "You"}
        groupName={lobby.group_name ?? ""}
      />
      <form action={closeParty} className="mt-4">
        <button type="submit" className="text-sm text-smoke underline-offset-4 hover:text-paper hover:underline">
          End the joint investigation
        </button>
      </form>
      <p className="mt-2 text-xs text-smoke">Ending it sends everyone else out. Your progress on the case is kept.</p>
    </Panel>
  );
}
