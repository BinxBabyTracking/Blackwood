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
import { loadCase } from "@/game/registry";
import { soundtrackStatus } from "@/lib/soundtrack";
import { SoundtrackPanel } from "@/components/portal/soundtrack-panel";
import { InterviewAICheck } from "@/components/portal/interview-ai-check";
import { createAdminClient } from "@/lib/supabase/admin";

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
  const def = loadCase("C001");
  if (!def?.soundtrack?.length) return null;
  const made = await soundtrackStatus(def.id).catch(() => ({}) as Record<string, string>);
  return (
    <section aria-labelledby="sound" className="max-w-3xl">
      <h2 id="sound" className="font-serif text-xl text-smoke">
        Music and room sound
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
