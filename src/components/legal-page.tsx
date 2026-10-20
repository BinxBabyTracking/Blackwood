import type { ReactNode } from "react";
import { PageIntro } from "./page-intro";

export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <PageIntro title={title} />
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-8">
        <p role="note" className="mb-10 rounded-[var(--radius-file)] border border-caution/60 bg-caution/10 p-4 text-sm text-paper">
          Draft for review. This text is a starting point written during development and has not been reviewed by a
          lawyer. Replace it before public launch.
        </p>
        <div className="space-y-8 text-smoke [&_h2]:font-serif [&_h2]:text-xl [&_h2]:text-paper [&_p]:mt-2 [&_p]:leading-relaxed">
          {children}
        </div>
      </section>
    </>
  );
}
