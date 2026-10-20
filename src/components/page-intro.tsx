import type { ReactNode } from "react";

/** Opening band for public inner pages. Leaves room for the overlaid header. */
export function PageIntro({ title, children, kicker }: { title: string; children?: ReactNode; kicker?: string }) {
  return (
    <section className="relative overflow-hidden border-b border-rule bg-[radial-gradient(90%_120%_at_85%_0%,#24303b_0%,#12171d_60%)] pb-14 pt-36">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        {kicker ? <p className="font-serif italic text-brass">{kicker}</p> : null}
        <h1 className="mt-3 max-w-[18ch] font-display text-5xl leading-[1.02] sm:text-6xl">{title}</h1>
        {children ? <div className="mt-5 max-w-[60ch] text-lg text-smoke">{children}</div> : null}
      </div>
    </section>
  );
}
