import type { Metadata } from "next";
import { Suspense } from "react";
import { lockAdmin } from "@/app/actions/admin";
import { updateRates } from "@/app/actions/spending";
import { AdminUnlock } from "@/components/portal/admin-unlock";
import { Ledger, PortalHeading } from "@/components/portal/heading";
import { LoadingFile } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { requireInvestigator } from "@/lib/investigator";
import { hasAdminAccess } from "@/lib/admin-gate";
import { getSpending, type Money } from "@/lib/spending";
import { caseIds, loadCase } from "@/game/registry";
import { soundtrackStatus } from "@/lib/soundtrack";
import { SoundtrackPanel } from "@/components/portal/soundtrack-panel";
import { InterviewAICheck } from "@/components/portal/interview-ai-check";
import { createAdminClient } from "@/lib/supabase/admin";
import { getFeedback } from "@/lib/feedback";
import { allEntries } from "@/lib/leaderboard";
import { adminRemoveEntry } from "@/app/actions/leaderboard";
import { NameCheck } from "@/components/portal/name-check";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

/** Making a music track with ElevenLabs can take a couple of minutes. */
export const maxDuration = 300;

/** Dollars, with cents shown to a tenth of a cent for small amounts. */
function usd(n: number) {
  if (n === 0) return "$0.00";
  if (Math.abs(n) < 0.1) return `$${n.toFixed(4)}`;
  return `$${n.toFixed(2)}`;
}

export default function AdminPage() {
  return (
    <>
      <PortalHeading title="Admin: Spending">
        What the paid services cost, by case and by playthrough: Claude for interviews, ElevenLabs for voices and push-to-talk.
        Figures are estimates from your rates below; the providers&apos; own dashboards are the bill.
      </PortalHeading>
      <Suspense fallback={<LoadingFile label="Totting up the ledger" />}>
        <Spending />
      </Suspense>
    </>
  );
}

async function Spending() {
  const me = await requireInvestigator();
  if (!(await hasAdminAccess(me.id))) {
    return (
      <section aria-labelledby="locked" className="space-y-4">
        <h2 id="locked" className="font-serif text-xl text-smoke">
          Restricted
        </h2>
        <p className="max-w-[60ch] text-sm text-smoke">Enter the admin password to see spending. It stays open on this device for 12 hours.</p>
        <AdminUnlock />
      </section>
    );
  }
  const s = await getSpending();
  if (!s) return <p className="text-smoke">The server is not configured to read the ledger.</p>;
  const { rates } = s;

  return (
    <div className="space-y-14">
      <section aria-labelledby="totals">
        <h2 id="totals" className="mb-5 font-serif text-xl text-smoke">
          Totals
        </h2>
        <Ledger
          items={[
            { label: "Today", value: usd(s.today.total) },
            { label: "Last 7 days", value: usd(s.week.total) },
            { label: "All time", value: usd(s.all.total), note: breakdown(s.all) },
            { label: "Saved by reuse", value: usd(s.all.saved), note: "Answers and recordings reused instead of paid for again." },
          ]}
        />
      </section>

      <section aria-labelledby="cases">
        <h2 id="cases" className="font-serif text-xl text-smoke">
          By case
        </h2>
        <p className="mt-2 max-w-[70ch] text-sm text-smoke">
          Cost per completed playthrough is what one player costs you to take a case from start to solved. The suggested price keeps a{" "}
          {Math.round(rates.target_margin * 100)}% margin over that (or over the average playthrough until one is completed), before hosting,
          payment fees and tax.
        </p>
        {s.caseSpend.length ? (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[56rem] text-left text-sm">
              <thead className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-smoke">
                <tr className="border-b border-rule">
                  <th className="py-2 pr-4">Case</th>
                  <th className="py-2 pr-4 text-right">Playthroughs</th>
                  <th className="py-2 pr-4 text-right">Completed</th>
                  <th className="py-2 pr-4 text-right">Questions</th>
                  <th className="py-2 pr-4 text-right">Total cost</th>
                  <th className="py-2 pr-4 text-right">Per playthrough</th>
                  <th className="py-2 pr-4 text-right">Per completed</th>
                  <th className="py-2 text-right">Suggested price</th>
                </tr>
              </thead>
              <tbody className="tabular-nums">
                {s.caseSpend.map((c) => (
                  <tr key={c.caseId} className="border-b border-rule/60">
                    <td className="py-3 pr-4">
                      <span className="font-mono text-brass">{c.caseId}</span> {c.title}
                      <span className="block text-xs text-smoke">{breakdown(c.money)}</span>
                    </td>
                    <td className="py-3 pr-4 text-right">{c.playthroughs}</td>
                    <td className="py-3 pr-4 text-right">{c.completed}</td>
                    <td className="py-3 pr-4 text-right">{c.money.questions}</td>
                    <td className="py-3 pr-4 text-right">{usd(c.money.total)}</td>
                    <td className="py-3 pr-4 text-right">{usd(c.perPlaythrough)}</td>
                    <td className="py-3 pr-4 text-right">{c.perCompleted === null ? "None yet" : usd(c.perCompleted)}</td>
                    <td className="py-3 text-right font-semibold text-paper">{c.suggestedPrice === null ? "None yet" : usd(c.suggestedPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-4 text-smoke">Nothing recorded yet. Costs appear here as soon as someone asks a question or hears a voice.</p>
        )}
      </section>

      <section aria-labelledby="plays">
        <h2 id="plays" className="font-serif text-xl text-smoke">
          Playthroughs
        </h2>
        <p className="mt-2 text-sm text-smoke">The latest {s.playthroughs.length}, newest first.</p>
        {s.playthroughs.length ? (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[56rem] text-left text-sm">
              <thead className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-smoke">
                <tr className="border-b border-rule">
                  <th className="py-2 pr-4">Started</th>
                  <th className="py-2 pr-4">Player</th>
                  <th className="py-2 pr-4">Case</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4 text-right">Questions</th>
                  <th className="py-2 pr-4 text-right">Interviews</th>
                  <th className="py-2 pr-4 text-right">Voices</th>
                  <th className="py-2 pr-4 text-right">Push-to-talk</th>
                  <th className="py-2 pr-4 text-right">Total</th>
                  <th className="py-2 text-right">Saved</th>
                </tr>
              </thead>
              <tbody className="tabular-nums">
                {s.playthroughs.map((p) => (
                  <tr key={p.sessionId} className="border-b border-rule/60">
                    <td className="py-2.5 pr-4">{formatDate(p.startedAt, { dateStyle: "medium", timeStyle: "short" })}</td>
                    <td className="py-2.5 pr-4">{p.player}</td>
                    <td className="py-2.5 pr-4 font-mono text-brass">{p.caseId}</td>
                    <td className="py-2.5 pr-4">{p.status === "closed" ? "Solved" : "In progress"}</td>
                    <td className="py-2.5 pr-4 text-right">{p.money.questions}</td>
                    <td className="py-2.5 pr-4 text-right">{usd(p.money.claude)}</td>
                    <td className="py-2.5 pr-4 text-right">{usd(p.money.tts)}</td>
                    <td className="py-2.5 pr-4 text-right">{usd(p.money.stt)}</td>
                    <td className="py-2.5 pr-4 text-right font-semibold text-paper">{usd(p.money.total)}</td>
                    <td className="py-2.5 text-right text-smoke">{usd(p.money.saved)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      <Feedback />

      <LeaderboardAdmin />

      <CaseAlertList />

      <InterviewAI />

      <Soundtracks />

      <form action={lockAdmin}>
        <button type="submit" className="text-sm text-smoke underline-offset-4 hover:text-paper hover:underline">
          Lock the Admin page on this device
        </button>
      </form>

      <section aria-labelledby="rates" className="max-w-2xl">
        <h2 id="rates" className="font-serif text-xl text-smoke">
          Rates
        </h2>
        <p className="mt-2 text-sm text-smoke">
          In US dollars. Change these to match your plans; every figure on this page is re-priced with them.
        </p>
        <form action={updateRates} className="mt-5 grid gap-4 sm:grid-cols-2">
          <Rate id="claude_input_per_mtok" label="Claude input, per million tokens" value={rates.claude_input_per_mtok} />
          <Rate id="claude_output_per_mtok" label="Claude output, per million tokens" value={rates.claude_output_per_mtok} />
          <Rate id="tts_per_1k_chars" label="ElevenLabs voices, per 1,000 characters" value={rates.tts_per_1k_chars} />
          <Rate id="stt_per_hour" label="ElevenLabs push-to-talk, per hour of audio" value={rates.stt_per_hour} />
          <Rate id="target_margin" label="Target margin for suggested prices, %" value={Math.round(rates.target_margin * 100)} step="1" />
          <div className="flex items-end">
            <button type="submit" className="rounded-[2px] bg-brass px-4 py-2 text-sm font-semibold text-ink hover:bg-[#d4b585]">
              Save rates
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function Rate({ id, label, value, step = "0.0001" }: { id: string; label: string; value: number; step?: string }) {
  return (
    <label htmlFor={id} className="grid gap-1 text-sm">
      <span className="text-smoke">{label}</span>
      <input
        id={id}
        name={id}
        type="number"
        min="0"
        step={step}
        defaultValue={value}
        className="rounded-[2px] border border-rule bg-ink-2 px-3 py-2 font-mono text-paper focus:border-brass focus:outline-none"
      />
    </label>
  );
}

function breakdown(m: Money) {
  return `Interviews ${usd(m.claude)} · Voices ${usd(m.tts)} · Push-to-talk ${usd(m.stt)}`;
}

/** Music and room sound for each case, made with ElevenLabs. */
async function Soundtracks() {
  const defs = caseIds().flatMap((id) => {
    const d = loadCase(id);
    return d?.soundtrack?.length ? [d] : [];
  });
  if (!defs.length) return null;
  return (
    <>
      {await Promise.all(defs.map((d) => CaseSoundtrack({ def: d, many: defs.length > 1 })))}
    </>
  );
}

async function CaseSoundtrack({ def, many }: { def: NonNullable<ReturnType<typeof loadCase>>; many: boolean }) {
  if (!def.soundtrack?.length) return null;
  const made = await soundtrackStatus(def.id).catch(() => ({}) as Record<string, string>);
  return (
    <section key={def.id} aria-labelledby={`sound-${def.id}`} className="max-w-3xl">
      <h2 id={`sound-${def.id}`} className="font-serif text-xl text-smoke">
        Music and room sound{many ? `: ${def.id} ${def.title}` : ""}
      </h2>
      <p className="mt-2 text-sm text-smoke">
        Made once with ElevenLabs and stored; players never trigger a charge. Music needs a paid ElevenLabs plan and the key&apos;s Music
        permission; room sound needs the Sound Effects permission. Making a track again replaces it.
      </p>
      <SoundtrackPanel
        caseId={def.id}
        tracks={def.soundtrack.map((t) => ({ key: t.key, label: t.label, kind: t.kind, seconds: t.seconds, made: made[t.key] ?? null }))}
      />
    </section>
  );
}

/** Whether interviews can reach the AI, and the last time they couldn't. */
async function InterviewAI() {
  const db = createAdminClient();
  const { data } = db ? await db.from("site_settings").select("value").eq("key", "interview_ai_last_error").maybeSingle() : { data: null };
  return (
    <section aria-labelledby="ai" className="max-w-3xl">
      <h2 id="ai" className="font-serif text-xl text-smoke">
        Interview AI
      </h2>
      <p className="mt-2 text-sm text-smoke">
        Questions without a scripted answer are answered by Claude. If it can&apos;t be reached, people fall back to &quot;I don&apos;t know&quot;.
      </p>
      <InterviewAICheck lastError={(data?.value as { at: string; message: string } | null) ?? null} />
    </section>
  );
}

/** Everyone who wants to hear about new cases, with the address to use, ready to copy into an email. */
async function CaseAlertList() {
  const db = createAdminClient();
  if (!db) return null;
  const [{ data: rows }, users] = await Promise.all([
    db.from("user_settings").select("user_id, notify_new_assignments, new_case_email"),
    db.auth.admin.listUsers({ perPage: 1000 }),
  ]);
  const emailOf = new Map((users.data?.users ?? []).map((u) => [u.id, u.email ?? ""]));
  const list = ((rows ?? []) as { user_id: string; notify_new_assignments: boolean; new_case_email: string | null }[])
    .filter((r) => r.notify_new_assignments)
    .map((r) => r.new_case_email || emailOf.get(r.user_id) || "")
    .filter(Boolean);
  const unique = [...new Set(list)].sort();
  return (
    <section aria-labelledby="alerts" className="max-w-3xl">
      <h2 id="alerts" className="font-serif text-xl text-smoke">
        New-case email list
      </h2>
      <p className="mt-2 text-sm text-smoke">
        {unique.length} {unique.length === 1 ? "investigator wants" : "investigators want"} an email when a new case opens (set on their Personnel File).
        Copy the addresses into the Bcc line of your announcement.
      </p>
      {unique.length ? (
        <textarea readOnly className="field mt-4 h-28 font-mono text-xs" value={unique.join(", ")} aria-label="Email addresses" />
      ) : null}
    </section>
  );
}

const DIFF_LABEL = { too_easy: "Too easy", about_right: "About right", too_hard: "Too hard" } as const;

/** Player reviews and problem reports. Private: only shown here. */
async function Feedback() {
  const fb = await getFeedback().catch(() => null);
  if (!fb) return null;
  return (
    <section aria-labelledby="feedback" className="max-w-4xl">
      <h2 id="feedback" className="font-serif text-xl text-smoke">
        Player feedback
      </h2>
      <p className="mt-2 text-sm text-smoke">Case reviews from the end of a case, and reports sent from the in-game menu. Never shown publicly.</p>
      {fb.cases.length === 0 ? (
        <p className="mt-4 border-y border-rule py-5 text-sm text-smoke">No feedback yet.</p>
      ) : (
        <>
          <div className="mt-4 overflow-x-auto border-y border-rule">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <thead className="text-xs text-smoke">
                <tr className="border-b border-rule">
                  {["Case", "Reviews", "Average", "Too easy", "About right", "Too hard", "Reports"].map((h) => (
                    <th key={h} scope="col" className="px-3 py-3 font-normal first:pl-0">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-rule/70">
                {fb.cases.map((c) => (
                  <tr key={c.caseId}>
                    <th scope="row" className="py-3 pl-0 pr-3 font-normal">
                      <span className="font-mono text-brass">{c.caseId}</span>
                      <span className="ml-2 font-serif text-paper">{loadCase(c.caseId)?.title ?? ""}</span>
                    </th>
                    <td className="px-3 py-3">{c.reviews}</td>
                    <td className="px-3 py-3">{c.average === null ? "None" : `${c.average.toFixed(1)} ★`}</td>
                    <td className="px-3 py-3">{c.difficulty.too_easy}</td>
                    <td className="px-3 py-3">{c.difficulty.about_right}</td>
                    <td className="px-3 py-3">{c.difficulty.too_hard}</td>
                    <td className="px-3 py-3">{c.reports}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h3 className="mt-8 font-mono text-xs uppercase tracking-[0.16em] text-smoke">Latest, newest first</h3>
          <ul className="mt-3 divide-y divide-rule/70 border-y border-rule">
            {fb.latest
              .filter((r) => r.kind === "report" || r.stuck || r.message || r.rating || r.difficulty)
              .map((r) => (
                <li key={r.id} className="py-4 text-sm">
                  <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1 font-mono text-xs text-smoke">
                    <span className={r.kind === "report" ? "text-[#e08a7f]" : "text-brass"}>{r.kind === "report" ? "REPORT" : "REVIEW"}</span>
                    <span className="text-brass">{r.case_id}</span>
                    <span>{r.who}</span>
                    <span>{formatDate(r.created_at)}</span>
                    {r.rating ? <span className="text-paper">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span> : null}
                    {r.difficulty ? <span>{DIFF_LABEL[r.difficulty]}</span> : null}
                  </p>
                  {r.stuck ? (
                    <p className="mt-2">
                      <span className="text-smoke">Stuck: </span>
                      {r.stuck}
                    </p>
                  ) : null}
                  {r.message ? <p className="mt-2 whitespace-pre-wrap">{r.message}</p> : null}
                  {r.context ? (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-xs text-smoke hover:text-paper">Context</summary>
                      <Context ctx={r.context} />
                    </details>
                  ) : null}
                </li>
              ))}
          </ul>
        </>
      )}
    </section>
  );
}

function Context({ ctx }: { ctx: Record<string, unknown> }) {
  const convo = ctx.conversation as { with: string; lines: string[] } | null | undefined;
  const facts = (["location", "open", "status", "evidence", "photos", "deductions"] as const)
    .filter((k) => ctx[k] !== undefined && ctx[k] !== null)
    .map((k) => `${k[0].toUpperCase()}${k.slice(1)}: ${String(ctx[k])}`);
  return (
    <div className="mt-2 space-y-2 border-l border-rule pl-3 text-xs text-smoke">
      {facts.length ? <p>{facts.join(" · ")}</p> : null}
      {convo?.lines.length ? (
        <div>
          <p>Recent conversation with {convo.with}:</p>
          <ul className="mt-1 space-y-1 text-paper/85">
            {convo.lines.map((l, i) => (
              <li key={i}>{l}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

/** Every leaderboard entry, newest first, with a way to take one down. */
async function LeaderboardAdmin() {
  const rows = await allEntries().catch(() => null);
  if (!rows) return null;
  const t = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  return (
    <section aria-labelledby="lb" className="max-w-4xl">
      <h2 id="lb" className="font-serif text-xl text-smoke">
        Leaderboard entries
      </h2>
      <p className="mt-2 text-sm text-smoke">
        Names players put on the case leaderboards. Every name other players can see (display names, guest names, group names, leaderboard names) is screened when it is entered:
        a word check that sees through misspellings and look-alike letters, then a quick Claude check for names that only sound rude out loud. Remove anything that still slips
        through; it is deleted for good.
      </p>
      <NameCheck />
      {rows.length === 0 ? (
        <p className="mt-4 border-y border-rule py-5 text-sm text-smoke">No entries yet.</p>
      ) : (
        <div className="mt-4 overflow-x-auto border-y border-rule">
          <table className="w-full min-w-[44rem] text-left text-sm">
            <thead className="text-xs text-smoke">
              <tr className="border-b border-rule">
                {["Case", "Name", "Board", "Score", "Time", "Questions", "Returned", "Added", ""].map((h) => (
                  <th key={h} scope="col" className="px-3 py-3 font-normal first:pl-0">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-rule/70">
              {rows.map((r) => (
                <tr key={r.id} className={r.hidden ? "opacity-50" : ""}>
                  <td className="py-2 pl-0 pr-3 font-mono text-brass">{r.case_id}</td>
                  <td className="px-3 py-2 font-serif">
                    {r.name}
                    {r.hidden ? <span className="ml-1.5 text-xs text-smoke">(hidden by player)</span> : null}
                  </td>
                  <td className="px-3 py-2">{r.mode === "group" ? `Group of ${r.group_size}` : "Solo"}</td>
                  <td className="px-3 py-2 font-mono">{r.score}</td>
                  <td className="px-3 py-2 font-mono">{t(r.active_seconds)}</td>
                  <td className="px-3 py-2 font-mono">{r.questions}</td>
                  <td className="px-3 py-2 font-mono">{r.returned}</td>
                  <td className="px-3 py-2 font-mono text-xs">{formatDate(r.created_at)}</td>
                  <td className="px-3 py-2">
                    <form action={adminRemoveEntry}>
                      <input type="hidden" name="id" value={r.id} />
                      <button type="submit" className="text-xs text-[#e08a7f] underline-offset-4 hover:underline">
                        Remove
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
