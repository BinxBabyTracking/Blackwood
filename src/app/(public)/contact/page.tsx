import type { Metadata } from "next";
import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = { title: "Contact" };

const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

export default function ContactPage() {
  return (
    <>
      <PageIntro title="Contact" kicker="Front desk">
        Questions about your account, the platform or a case in the archive.
      </PageIntro>
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-8">
        {email ? (
          <p className="text-lg">
            Write to{" "}
            <a href={`mailto:${email}`} className="text-brass underline underline-offset-4">
              {email}
            </a>
            . We read every message.
          </p>
        ) : (
          <p className="rounded-[var(--radius-file)] border border-dashed border-rule p-6 text-smoke">
            A support address has not been published yet. Set <code className="font-mono text-paper">NEXT_PUBLIC_CONTACT_EMAIL</code>{" "}
            to show it here.
          </p>
        )}
        <p className="mt-8 text-sm text-smoke">
          Blackwood Investigations is fictional and cannot take on real investigations. For a real emergency, contact local
          law enforcement.
        </p>
      </section>
    </>
  );
}
