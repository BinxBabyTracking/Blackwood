import type { Metadata } from "next";
import Link from "next/link";
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
        <p className="mb-8 text-lg">
          For help with your account, a purchase or a case,{" "}
          <Link href="/support" className="text-brass underline underline-offset-4">
            open a support ticket
          </Link>
          . We answer every one.
        </p>
        {email ? (
          <p className="text-lg">
            Write to{" "}
            <a href={`mailto:${email}`} className="text-brass underline underline-offset-4">
              {email}
            </a>
            . We read every message.
          </p>
        ) : null}
        <p className="mt-8 text-sm text-smoke">
          Blackwood Investigations is a fictional agency and cannot take on real investigations. For a real emergency, contact local
          law enforcement.
        </p>
      </section>
    </>
  );
}
