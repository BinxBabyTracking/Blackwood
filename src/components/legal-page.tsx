import Link from "next/link";
import type { ReactNode } from "react";
import { CONTACT_EMAIL, LEGAL_UPDATED } from "@/lib/legal";
import { PageIntro } from "./page-intro";

export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <PageIntro title={title} />
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-8">
        <p className="mb-10 font-mono text-xs tracking-[0.12em] text-smoke">LAST UPDATED {LEGAL_UPDATED.toUpperCase()}</p>
        <div className="space-y-8 text-smoke [&_a]:text-brass [&_a]:underline [&_a]:underline-offset-2 [&_h2]:font-serif [&_h2]:text-xl [&_h2]:text-paper [&_li]:mt-1.5 [&_p]:mt-2 [&_p]:leading-relaxed [&_strong]:text-paper [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
          {children}
        </div>
        <nav aria-label="Legal" className="mt-14 flex flex-wrap gap-x-6 gap-y-2 border-t border-rule pt-6 text-sm">
          <Link href="/terms" className="text-smoke hover:text-paper">
            Terms of Service
          </Link>
          <Link href="/privacy" className="text-smoke hover:text-paper">
            Privacy Policy
          </Link>
          <Link href="/billing" className="text-smoke hover:text-paper">
            Billing and Refunds
          </Link>
          <Link href="/contact" className="text-smoke hover:text-paper">
            Contact
          </Link>
        </nav>
      </section>
    </>
  );
}

/** "write to us at x" or "use the Contact page" when no address is published. */
export function ContactLine() {
  return CONTACT_EMAIL ? (
    <>
      email us at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
    </>
  ) : (
    <>
      reach us through the <Link href="/contact">Contact page</Link>
    </>
  );
}
