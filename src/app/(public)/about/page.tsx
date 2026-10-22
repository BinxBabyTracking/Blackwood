import type { Metadata } from "next";
import { PageIntro } from "@/components/page-intro";
import { ButtonLink } from "@/components/ui";

export const metadata: Metadata = { title: "About the Agency" };

const RECORD = [
  { year: "1978", text: "Blackwood Investigations opens a two-room office and takes its first private commission." },
  { year: "1985", text: "The agency is retained on the Whitmore matter in Los Angeles. The file remains open." },
  { year: "1990s", text: "The archive grows past a thousand case files, many of them never closed." },
  { year: "Today", text: "The archive opens to a new intake of investigators, one assignment at a time." },
];

export default function AboutPage() {
  return (
    <>
      <PageIntro title="About the Agency" kicker="Private Investigative Services, est. 1978">
        Blackwood Investigations has spent nearly five decades on the cases other people stopped asking about.
      </PageIntro>

      <section className="mx-auto grid max-w-7xl gap-16 px-4 py-20 sm:px-8 lg:grid-cols-[1.3fr_1fr]">
        <div className="prose-agency max-w-[62ch] font-serif text-lg leading-[1.75] text-paper/90">
          <p>
            The agency was founded on a simple principle that still hangs above the front desk: every case has a truth.
            It may be buried in a witness statement, misfiled in a police report or hiding in plain sight across a dinner
            table. The work is to find it and to be able to prove it.
          </p>
          <p>
            Blackwood investigators work from the file outward. They read the evidence before they form a theory, they
            interview everyone who was there, and they submit findings only when the facts support them.
          </p>
          <p>
            New recruits join as Probationary Investigators. They begin with an introductory assignment and earn their
            way through the ranks by closing cases with sound, well-supported findings.
          </p>
        </div>

        <aside aria-labelledby="record-heading">
          <h2 id="record-heading" className="font-serif text-xl">
            Agency record
          </h2>
          <ol className="mt-6 border-l border-rule">
            {RECORD.map((r) => (
              <li key={r.year} className="relative pb-8 pl-6 last:pb-0">
                <span className="absolute -left-[5px] top-1.5 h-[9px] w-[9px] rounded-full border border-brass bg-ink" />
                <span className="font-mono text-sm text-brass">{r.year}</span>
                <p className="mt-1 text-smoke">{r.text}</p>
              </li>
            ))}
          </ol>
        </aside>
      </section>

      <section className="border-t border-rule bg-ink-2">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-8">
          <h2 className="font-serif text-2xl">A note on the cases</h2>
          <p className="mt-3 max-w-[64ch] text-smoke">
            The agency, its history and its staff are invented. The cases are not. Each one is drawn from a real
            investigation, with names, places, dates and identifying details changed to protect the privacy of the
            people involved and their families. No character represents a real, identifiable person.
          </p>
          <p className="mt-3 max-w-[64ch] text-smoke">
            Some of these cases were never solved. Where that is so, the solution in the game is our own dramatized
            reconstruction, not a finding about anyone in the real case.
          </p>
          <p className="mt-3 max-w-[64ch] text-smoke">
            Blackwood Investigations is interactive entertainment. It is not a licensed investigation agency and cannot
            take on real matters. If you need help with a real situation, contact local law enforcement or a licensed
            professional.
          </p>
          <div className="mt-8">
            <ButtonLink href="/join">Join the Agency</ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
