import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageIntro } from "@/components/page-intro";
import { NewTicketForm } from "@/components/support-forms";
import { StatusTag } from "@/components/support-status";
import { Tag } from "@/components/ui";
import { getCatalog } from "@/lib/catalog";
import { formatDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { ticketsForUser } from "@/lib/support";

export const metadata: Metadata = { title: "Support" };

export default function SupportPage() {
  return (
    <>
      <PageIntro title="Support" kicker="Front desk">
        A problem with your account, a purchase or a case? Open a ticket and we&apos;ll answer here.
      </PageIntro>
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-8">
        <Suspense fallback={<p className="text-smoke">Opening the front desk...</p>}>
          <Desk />
        </Suspense>
        <p className="mt-12 text-sm text-smoke">
          Blackwood Investigations is a fictional agency and cannot take on real investigations. For a real emergency, contact local law enforcement.
        </p>
      </section>
    </>
  );
}

async function Desk() {
  const supabase = await createClient();
  const { data } = (await supabase?.auth.getUser()) ?? { data: { user: null } };
  const user = data.user;
  const [tickets, catalog] = await Promise.all([user ? ticketsForUser(user.id).catch(() => []) : [], getCatalog()]);
  const cases = catalog.ok ? catalog.data.filter((c) => c.status !== "in_development" && c.status !== "retired").map((c) => ({ id: c.id, title: c.title })) : [];
  return (
    <div className="space-y-14">
      {tickets.length ? (
        <div>
          <h2 className="font-serif text-2xl text-paper">Your tickets</h2>
          <ul className="mt-4 divide-y divide-rule border-y border-rule">
            {tickets.map((t) => (
              <li key={t.id}>
                <Link href={`/support/${t.token}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3 hover:bg-card/40">
                  <span className="min-w-0 flex-1 truncate text-paper">{t.subject}</span>
                  {t.unread ? <Tag tone="brass">New reply</Tag> : null}
                  <StatusTag status={t.status} />
                  <span className="font-mono text-xs text-smoke">{formatDate(t.updated_at, { dateStyle: "medium" })}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <div>
        <h2 className="font-serif text-2xl text-paper">Open a ticket</h2>
        {!user ? (
          <p className="mt-2 text-sm text-smoke">
            Have an account? <Link href="/login" className="text-brass underline underline-offset-2">Sign in</Link> first and your tickets will be kept together here.
          </p>
        ) : null}
        <div className="mt-6">
          <NewTicketForm email={user?.email ?? null} cases={cases} />
        </div>
      </div>
    </div>
  );
}
