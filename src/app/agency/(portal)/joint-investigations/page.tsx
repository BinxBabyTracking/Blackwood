import type { Metadata } from "next";
import { Suspense } from "react";
import { leaveJointInvestigation, setReady } from "@/app/actions/joint";
import { Avatar } from "@/components/portal/avatar";
import { PortalHeading } from "@/components/portal/heading";
import { LoadingFile, Panel, Tag, buttonClass } from "@/components/ui";
import { getFormingJointInvestigations, getJointEligibleCases, requireInvestigator, type JointInvestigation } from "@/lib/investigator";
import { CopyCode, JoinForm, OpenJointForm } from "./joint-forms";

export const metadata: Metadata = { title: "Joint Investigations" };

export default function JointInvestigationsPage() {
  return (
    <>
      <PortalHeading title="Joint Investigations">
        Work a case with up to five other investigators. The host opens the investigation and shares an invitation code;
        everyone marks themselves ready before the file is opened.
      </PortalHeading>
      <Suspense fallback={<LoadingFile label="Retrieving joint investigations" />}>
        <Joint />
      </Suspense>
    </>
  );
}

async function Joint() {
  const me = await requireInvestigator();
  const [eligible, forming] = await Promise.all([getJointEligibleCases(me.id), getFormingJointInvestigations(me.id)]);

  return (
    <div className="space-y-12">
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel className="p-6">
          <h2 className="font-serif text-xl">Open Joint Investigation</h2>
          <p className="mt-1 mb-5 text-sm text-smoke">You will host, and receive a code to invite your team.</p>
          <OpenJointForm cases={eligible} />
        </Panel>
        <Panel className="p-6">
          <h2 className="font-serif text-xl">Join Existing Assignment</h2>
          <p className="mt-1 mb-5 text-sm text-smoke">Enter the invitation code the host gave you.</p>
          <JoinForm />
        </Panel>
      </div>

      <section aria-labelledby="rosters">
        <h2 id="rosters" className="mb-4 font-serif text-xl">
          Investigator Rosters
        </h2>
        {forming.length === 0 ? (
          <p className="border-y border-rule py-5 text-sm text-smoke">
            You are not on any joint investigation roster. Open one or join with a code above.
          </p>
        ) : (
          <div className="space-y-6">
            {forming.map((s) => (
              <Roster key={s.id} s={s} myId={me.id} />
            ))}
          </div>
        )}
        <p className="mt-4 text-xs text-smoke">Rosters do not update live yet. Reload the page to see investigators who have joined.</p>
      </section>
    </div>
  );
}

function Roster({ s, myId }: { s: JointInvestigation; myId: string }) {
  const isHost = s.host_user_id === myId;
  const me = s.participants.find((p) => p.user_id === myId);
  const seats = Array.from({ length: s.max_participants }, (_, i) => s.participants[i] ?? null);
  const readyCount = s.participants.filter((p) => p.is_ready).length;

  return (
    <Panel className="overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-rule p-5">
        <div>
          <p className="font-mono text-sm text-brass">{s.case_id}</p>
          <p className="font-serif text-lg">{s.case?.title}</p>
          <p className="mt-1 text-xs text-smoke">
            {readyCount} of {s.participants.length} ready, {s.participants.length} of {s.max_participants} seats filled
          </p>
        </div>
        {s.invite_code ? <CopyCode code={s.invite_code} /> : null}
      </div>
      <ul className="grid gap-px bg-rule sm:grid-cols-2 lg:grid-cols-3">
        {seats.map((p, i) =>
          p ? (
            <li key={p.user_id} className="flex items-center gap-3 bg-ink-2 p-4">
              <Avatar name={p.profile?.display_name ?? null} url={p.profile?.avatar_url ?? null} size={36} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-paper">
                  {p.profile?.display_name ?? "Investigator"}
                  {p.user_id === myId ? <span className="text-smoke"> (you)</span> : null}
                </p>
                <div className="mt-1 flex gap-2">
                  {p.role === "host" ? <Tag tone="brass">Host</Tag> : null}
                  {p.is_ready ? <Tag tone="ok">Investigator Ready</Tag> : <Tag>Not ready</Tag>}
                </div>
              </div>
            </li>
          ) : (
            <li key={`open-${i}`} className="flex items-center bg-ink-2 p-4 text-sm text-smoke/70">
              Open seat
            </li>
          ),
        )}
      </ul>
      <div className="flex flex-wrap items-center gap-3 border-t border-rule p-5">
        {me ? (
          <form action={setReady}>
            <input type="hidden" name="sessionId" value={s.id} />
            <input type="hidden" name="ready" value={String(!me.is_ready)} />
            <button type="submit" className={buttonClass(me.is_ready ? "secondary" : "primary")}>
              {me.is_ready ? "Mark not ready" : "Mark Investigator Ready"}
            </button>
          </form>
        ) : null}
        <form action={leaveJointInvestigation}>
          <input type="hidden" name="sessionId" value={s.id} />
          <button type="submit" className={buttonClass("danger")}>
            {isHost ? "Close investigation" : "Leave roster"}
          </button>
        </form>
        <p className="text-xs text-smoke">Starting the investigation becomes available when the investigation desk opens.</p>
      </div>
    </Panel>
  );
}
