import type { Metadata } from "next";
import { Suspense } from "react";
import { Ledger, PortalHeading } from "@/components/portal/heading";
import { SetupNotice } from "@/components/setup-notice";
import { LoadingFile } from "@/components/ui";
import { getAchievements, getRanks } from "@/lib/catalog";
import { formatDate, formatHours } from "@/lib/format";
import { getAwardedAchievementIds, getServiceRecord, requireInvestigator } from "@/lib/investigator";

export const metadata: Metadata = { title: "Service Record" };

export default function ServiceRecordPage() {
  return (
    <>
      <PortalHeading title="Service Record">
        Your standing with the agency. Every figure here comes from cases you have actually worked.
      </PortalHeading>
      <Suspense fallback={<LoadingFile label="Retrieving service record" />}>
        <Record />
      </Suspense>
    </>
  );
}

async function Record() {
  const me = await requireInvestigator();
  const [record, ranks, achievements, awarded] = await Promise.all([
    getServiceRecord(me.id),
    getRanks(),
    getAchievements(),
    getAwardedAchievementIds(me.id),
  ]);
  const rank = ranks.ok ? ranks.data.find((r) => r.level === me.profile.rank_level) : undefined;

  return (
    <div className="space-y-16">
      <section aria-labelledby="stats">
        <h2 id="stats" className="mb-5 font-serif text-xl text-smoke">
          Detective Statistics
        </h2>
        <Ledger
          items={[
            { label: "Cases Closed", value: record.cases_closed },
            { label: "Cases Investigated", value: record.cases_investigated },
            { label: "Total Investigation Hours", value: formatHours(record.total_investigation_seconds) },
            { label: "Current Rank", value: rank?.title ?? `Level ${me.profile.rank_level}` },
            {
              label: "Investigation Accuracy",
              value: record.accuracy == null ? "None yet" : `${record.accuracy}%`,
              note: record.accuracy == null ? "Recorded once you close a case." : undefined,
            },
            { label: "Completed Milestones", value: `${awarded.size} of ${achievements.ok ? achievements.data.length : 0}` },
          ]}
          cols={3}
        />
      </section>

      <section aria-labelledby="ranks">
        <h2 id="ranks" className="font-serif text-xl text-smoke">
          Agency Rank
        </h2>
        <p className="mt-1 mb-6 max-w-[62ch] text-sm text-smoke">
          Advancement depends on closed cases and the quality of your findings. Ranks without published criteria are
          awarded as more of the archive opens.
        </p>
        {!ranks.ok ? (
          <SetupNotice reason={ranks.reason} message={ranks.message} compact />
        ) : (
          <ol className="relative space-y-0 border-l border-rule">
            {ranks.data.map((r) => {
              const current = r.level === me.profile.rank_level;
              const reached = r.level <= me.profile.rank_level;
              return (
                <li key={r.level} className="relative py-4 pl-8" aria-current={current ? "step" : undefined}>
                  <span
                    aria-hidden
                    className={`absolute -left-[7px] top-5 h-[13px] w-[13px] rounded-full border ${
                      current ? "border-brass bg-brass" : reached ? "border-brass bg-ink" : "border-rule bg-ink"
                    }`}
                  />
                  <div className="flex flex-wrap items-baseline gap-x-3">
                    <span className="font-mono text-xs text-smoke">Grade {r.level}</span>
                    <span className={`font-serif text-lg ${current ? "text-brass" : reached ? "text-paper" : "text-smoke"}`}>{r.title}</span>
                    {current ? <span className="text-xs text-brass">Your current rank</span> : null}
                  </div>
                  <p className="mt-1 max-w-[60ch] text-sm text-smoke">{r.description}</p>
                  {r.min_cases_closed != null && !reached ? (
                    <p className="mt-1 font-mono text-xs text-smoke">
                      Requires {r.min_cases_closed} closed {r.min_cases_closed === 1 ? "case" : "cases"}
                      {r.min_accuracy != null ? ` at ${r.min_accuracy}% accuracy` : ""}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ol>
        )}
      </section>

      <section aria-labelledby="commendations">
        <h2 id="commendations" className="mb-6 font-serif text-xl text-smoke">
          Commendations
        </h2>
        {!achievements.ok ? (
          <SetupNotice reason={achievements.reason} message={achievements.message} compact />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {achievements.data.map((a) => {
              const awardedAt = awarded.get(a.id);
              return (
                <li
                  key={a.id}
                  className={`flex gap-4 rounded-[var(--radius-file)] border p-5 ${awardedAt ? "border-brass/60 bg-card" : "border-rule bg-ink-2"}`}
                >
                  <Medal earned={Boolean(awardedAt)} />
                  <div>
                    <p className={`font-serif text-lg ${awardedAt ? "text-paper" : "text-smoke"}`}>{a.title}</p>
                    <p className="mt-1 text-sm text-smoke">{awardedAt ? a.description : a.criteria}</p>
                    <p className="mt-2 font-mono text-xs text-smoke">
                      {awardedAt ? `Awarded ${formatDate(awardedAt)}` : "Locked"}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function Medal({ earned }: { earned: boolean }) {
  return (
    <svg viewBox="0 0 40 48" className={`h-12 w-10 shrink-0 ${earned ? "text-brass" : "text-rule"}`} fill="none" aria-hidden>
      <path d="M12 2h16l-4 14h-8z" fill="currentColor" opacity={earned ? 0.5 : 0.6} />
      <circle cx="20" cy="30" r="13" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="20" cy="30" r="9" stroke="currentColor" strokeWidth="0.8" strokeDasharray="1.5 2" />
      {earned ? (
        <path d="M15 30l3.5 3.5L26 26" stroke="currentColor" strokeWidth="1.8" />
      ) : (
        <path d="M17 29v-2a3 3 0 016 0v2M16 29h8v6h-8z" stroke="currentColor" strokeWidth="1.2" />
      )}
    </svg>
  );
}
