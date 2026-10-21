import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { sessionStatusLabel } from "@/components/portal/active-list";
import { PortalHeading } from "@/components/portal/heading";
import { ButtonLink, EmptyFile, LoadingFile, Ref } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { getCaseFiles, requireInvestigator, type CaseFile } from "@/lib/investigator";

export const metadata: Metadata = { title: "My Case Files" };

export default function CaseFilesPage() {
  return (
    <>
      <PortalHeading title="My Case Files">
        Every investigation you have opened, closed or set aside. Case details stay sealed here; evidence and findings
        live inside each investigation.
      </PortalHeading>
      <Suspense fallback={<LoadingFile label="Retrieving case files" />}>
        <Files />
      </Suspense>
    </>
  );
}

const SECTIONS: { id: string; title: string; match: (f: CaseFile) => boolean; empty: string }[] = [
  {
    id: "active",
    title: "Active Investigations",
    match: (f) => f.status === "forming" || f.status === "active",
    empty: "No investigations are in progress.",
  },
  {
    id: "closed",
    title: "Closed Cases",
    match: (f) => f.status === "closed",
    empty: "You have not closed a case yet. Closed cases are filed here with their completion date.",
  },
  {
    id: "archived",
    title: "Archived Cases",
    match: (f) => f.status === "archived" || f.status === "abandoned",
    empty: "Nothing has been archived. Cases you set aside or replay later will be kept here.",
  },
];

async function Files() {
  const me = await requireInvestigator();
  const files = await getCaseFiles(me.id);

  if (files.length === 0) {
    return (
      <EmptyFile
        title="Your case drawer is empty."
        action={<ButtonLink href="/agency/assignments">Browse Available Assignments</ButtonLink>}
      >
        Accept an assignment and its file will appear here, with your start date, progress and saved position.
      </EmptyFile>
    );
  }

  return (
    <div className="space-y-14">
      {SECTIONS.map((s) => {
        const rows = files.filter(s.match);
        return (
          <section key={s.id} aria-labelledby={`${s.id}-h`}>
            <h2 id={`${s.id}-h`} className="mb-4 flex items-baseline gap-3 font-serif text-xl">
              {s.title}
              <span className="font-mono text-sm text-smoke">{rows.length}</span>
            </h2>
            {rows.length ? <FileTable rows={rows} /> : <p className="border-y border-rule py-5 text-sm text-smoke">{s.empty}</p>}
          </section>
        );
      })}
    </div>
  );
}

function FileTable({ rows }: { rows: CaseFile[] }) {
  return (
    <div className="overflow-x-auto border-y border-rule">
      <table className="w-full min-w-[62rem] text-left text-sm">
        <thead className="text-xs text-smoke">
          <tr className="border-b border-rule">
            {["Case", "Investigation ID", "Status", "Started", "Last activity", "Completed", "Save reference", "Replay", "Report"].map((h) => (
              <th key={h} scope="col" className="px-3 py-3 font-normal first:pl-0">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-rule/70">
          {rows.map((f) => (
            <tr key={f.id}>
              <th scope="row" className="py-3 pl-0 pr-3 font-normal">
                <span className="font-mono text-brass">{f.case_id}</span>
                <span className="ml-2 font-serif text-paper">{f.case?.title}</span>
              </th>
              <td className="px-3 py-3">
                <Ref>{f.id.slice(0, 8).toUpperCase()}</Ref>
              </td>
              <td className="px-3 py-3">{sessionStatusLabel(f.status)}</td>
              <td className="px-3 py-3">
                <Ref>{formatDate(f.started_at ?? f.created_at)}</Ref>
              </td>
              <td className="px-3 py-3">
                <Ref>{formatDate(f.last_activity_at)}</Ref>
              </td>
              <td className="px-3 py-3">
                <Ref>{f.completed_at ? formatDate(f.completed_at) : "Open"}</Ref>
              </td>
              <td className="px-3 py-3">
                <Ref>{f.latest_save_id ? f.latest_save_id.slice(0, 8).toUpperCase() : "No save yet"}</Ref>
              </td>
              <td className="px-3 py-3 text-smoke">{f.replay_eligible ? "Eligible" : "Not eligible"}</td>
              <td className="px-3 py-3">
                {f.final_report ? (
                  <Link href={`/agency/cases/${f.id}`} className="text-brass underline-offset-4 hover:underline">
                    Final report
                  </Link>
                ) : (
                  <span className="text-smoke">None filed</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
