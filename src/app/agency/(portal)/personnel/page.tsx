import type { Metadata } from "next";
import { Suspense } from "react";
import { Avatar } from "@/components/portal/avatar";
import { PortalHeading } from "@/components/portal/heading";
import { LoadingFile, Panel } from "@/components/ui";
import { getRanks } from "@/lib/catalog";
import { formatDate, formatHours } from "@/lib/format";
import { getServiceRecord, getSettings, requireInvestigator } from "@/lib/investigator";
import { CaseAlerts } from "./case-alerts";
import { PersonnelForm } from "./personnel-form";

export const metadata: Metadata = { title: "Personnel File" };

export default function PersonnelPage() {
  return (
    <>
      <PortalHeading title="Personnel File">Your record with the agency, and the details you can change.</PortalHeading>
      <Suspense fallback={<LoadingFile label="Retrieving personnel file" />}>
        <Personnel />
      </Suspense>
    </>
  );
}

async function Personnel() {
  const me = await requireInvestigator();
  const [record, ranks, settings] = await Promise.all([getServiceRecord(me.id), getRanks(), getSettings(me.id)]);
  const rank = ranks.ok ? ranks.data.find((r) => r.level === me.profile.rank_level)?.title : undefined;
  const p = me.profile;

  const rows: [string, string][] = [
    ["Agency rank", rank ?? `Level ${p.rank_level}`],
    ["Date joined", formatDate(p.created_at, { dateStyle: "long" })],
    ["Cases solved", String(record.cases_closed)],
    ["Total investigation hours", formatHours(record.total_investigation_seconds)],
    ["Investigation preference", p.investigation_preference === "collaborative" ? "Collaborative" : p.investigation_preference === "solo" ? "Solo" : "Not set"],
  ];

  return (
    <div className="grid gap-10 lg:grid-cols-[22rem_1fr]">
      <Panel className="h-fit overflow-hidden">
        <div className="flex items-center justify-between border-b border-rule bg-card px-5 py-3">
          <span className="text-xs text-smoke">Personnel record</span>
          <span className="font-mono text-xs text-brass">BW-{me.id.slice(0, 6).toUpperCase()}</span>
        </div>
        <div className="flex items-center gap-4 p-5">
          <Avatar name={p.display_name} url={p.avatar_url} size={88} />
          <div className="min-w-0">
            <p className="truncate font-display text-2xl">{p.display_name}</p>
            <p className="text-sm text-brass">{rank}</p>
          </div>
        </div>
        <dl className="divide-y divide-rule border-t border-rule">
          {rows.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 px-5 py-3 text-sm">
              <dt className="text-smoke">{k}</dt>
              <dd className="text-right">{v}</dd>
            </div>
          ))}
        </dl>
      </Panel>

      <section aria-labelledby="edit">
        <h2 id="edit" className="mb-6 font-serif text-xl">
          Edit personnel details
        </h2>
        <PersonnelForm
          defaults={{ display_name: p.display_name, avatar_url: p.avatar_url, investigation_preference: p.investigation_preference }}
        />
        <p className="mt-8 text-sm text-smoke">
          Your sign-in email is {me.email ?? "not available"}. Change it, or your password, in Agency Settings.
        </p>

        <Panel className="mt-12 p-6">
          <h2 className="font-serif text-xl">Get notified when a new case is available</h2>
          <p className="mb-5 mt-1 text-sm text-smoke">One short email when the agency opens a new case. Nothing else.</p>
          <CaseAlerts email={settings?.new_case_email ?? me.email ?? ""} on={settings?.notify_new_assignments ?? true} />
        </Panel>
      </section>
    </div>
  );
}
