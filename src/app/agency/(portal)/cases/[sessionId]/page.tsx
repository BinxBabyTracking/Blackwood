import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { LoadingFile } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { getFiledReport, requireInvestigator } from "@/lib/investigator";

export const metadata: Metadata = { title: "Final Investigative Report" };

export default function FiledReportPage({ params }: PageProps<"/agency/cases/[sessionId]">) {
  return (
    <Suspense fallback={<LoadingFile label="Retrieving the report" />}>
      <Report params={params} />
    </Suspense>
  );
}

async function Report({ params }: { params: Promise<{ sessionId: string }> }) {
  await requireInvestigator();
  const { sessionId } = await params;
  if (!/^[0-9a-z-]{8,40}$/i.test(sessionId)) notFound();
  const s = await getFiledReport(sessionId);
  const r = s?.final_report;
  if (!s || !r) notFound();

  return (
    <>
      <Link href="/agency/cases" className="mb-6 inline-block text-sm text-brass underline-offset-4 hover:underline">
        Back to My Case Files
      </Link>
      <article className="mx-auto max-w-3xl bg-[#efe8d6] px-6 py-10 text-[#231e17] shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)] sm:px-12">
        <header className="border-b-[3px] border-double border-[#231e17]/70 pb-4 text-center">
          <p className="font-display text-3xl tracking-[0.12em] sm:text-4xl">BLACKWOOD INVESTIGATIONS</p>
          <p className="mt-1 font-mono text-[0.7rem] tracking-[0.18em] text-[#231e17]/70">LICENSED PRIVATE INVESTIGATORS · LOS ANGELES, CALIFORNIA</p>
        </header>
        <h1 className="mt-8 text-center font-mono text-lg font-bold tracking-[0.22em]">FINAL INVESTIGATIVE REPORT</h1>
        <dl className="mx-auto mt-6 grid max-w-xl grid-cols-[9.5rem_1fr] gap-x-4 gap-y-1 font-mono text-[0.9rem]">
          {[
            ["Case No.", r.caseId],
            ["Case", r.title.toUpperCase()],
            ["Investigator", r.investigator],
            ["Investigation ID", s.id.slice(0, 8).toUpperCase()],
            ["Filed", formatDate(r.filedAt)],
            ["Submissions", String(r.attempts)],
          ].map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-xs uppercase tracking-[0.1em] text-[#231e17]/55">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-6 flex justify-center">
          <span className="rotate-[-6deg] border-[3px] border-[#4f6b4f]/80 px-4 py-1 font-mono text-sm font-bold tracking-[0.22em] text-[#4f6b4f]/90">ACCEPTED · CASE CLOSED</span>
        </div>
        <dl className="mt-10 space-y-5 font-mono text-[0.92rem]">
          {r.sections.map((sec) => (
            <div key={sec.section}>
              <dt className="border-b border-[#231e17]/25 pb-1 text-sm font-bold tracking-[0.12em]">
                SECTION {sec.section}. {sec.title.toUpperCase()}
              </dt>
              <dd className="mt-2">
                <span className="block font-serif italic text-[#231e17]/75">{sec.question}</span>
                <span className="font-bold">{sec.answer}</span>
              </dd>
            </div>
          ))}
          <div>
            <dt className="border-b border-[#231e17]/25 pb-1 text-sm font-bold tracking-[0.12em]">SECTION E. SUPPORTING EVIDENCE</dt>
            <dd className="mt-2">
              <ol className="space-y-0.5">
                {r.evidence.map((e, i) => (
                  <li key={e.id}>
                    Exhibit {i + 1}. <span className="text-[#7d3a33]">{e.id}</span> {e.title}
                  </li>
                ))}
              </ol>
            </dd>
          </div>
        </dl>
        <p className="mt-10 border-b border-[#231e17]/60 pb-1 font-serif text-2xl italic">{r.investigator}</p>
        <p className="mt-1 font-mono text-xs tracking-[0.12em] text-[#231e17]/60">SIGNATURE OF INVESTIGATOR</p>
      </article>
    </>
  );
}
