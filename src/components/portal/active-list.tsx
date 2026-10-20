import Link from "next/link";
import type { CaseFile } from "@/lib/investigator";
import { formatDate } from "@/lib/format";
import { buttonClass } from "../ui";

const STATUS: Record<string, string> = {
  forming: "Assembling team",
  active: "Under investigation",
  closed: "Closed",
  archived: "Archived",
  abandoned: "Withdrawn",
};

export function sessionStatusLabel(s: string) {
  return STATUS[s] ?? s;
}

/** Investigations in progress, each with its progress and a way back in. */
export function ActiveInvestigations({ files }: { files: CaseFile[] }) {
  return (
    <ul className="divide-y divide-rule border-y border-rule">
      {files.map((f) => (
        <li key={f.id} className="grid gap-4 py-5 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <div className="flex flex-wrap items-baseline gap-x-3">
              <span className="font-mono text-sm text-brass">{f.case_id}</span>
              <span className="font-serif text-lg text-paper">{f.case?.title ?? "Unknown case"}</span>
            </div>
            <p className="mt-1 text-sm text-smoke">
              {sessionStatusLabel(f.status)}. Last activity{" "}
              <span className="font-mono">{formatDate(f.last_activity_at, { dateStyle: "medium", timeStyle: "short" })}</span>
            </p>
            <div className="mt-3 flex items-center gap-3">
              <div
                className="h-1 w-48 overflow-hidden rounded-full bg-card"
                role="progressbar"
                aria-valuenow={f.progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Investigation progress"
              >
                <div className="h-full bg-brass" style={{ width: `${f.progress}%` }} />
              </div>
              <span className="font-mono text-xs text-smoke">{f.progress}%</span>
            </div>
          </div>
          {f.case?.status === "available" ? (
            <Link href={`/play/${f.case_id}`} className={buttonClass("secondary")}>
              Resume Investigation
            </Link>
          ) : (
            <span className="text-sm text-smoke">Investigation desk not open yet</span>
          )}
        </li>
      ))}
    </ul>
  );
}
