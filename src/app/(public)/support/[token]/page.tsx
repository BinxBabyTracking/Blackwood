import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { closeTicket } from "@/app/actions/support";
import { PageIntro } from "@/components/page-intro";
import { ReplyForm } from "@/components/support-forms";
import { StatusTag } from "@/components/support-status";
import { formatDate } from "@/lib/format";
import { categoryLabel, markPlayerSeen, ticketByToken } from "@/lib/support";

export const metadata: Metadata = { title: "Support ticket", robots: { index: false, follow: false } };

export default function TicketPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <>
      <PageIntro title="Support ticket" kicker="Front desk" />
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-8">
        <Suspense fallback={<p className="text-smoke">Finding your ticket...</p>}>
          <Ticket params={params} searchParams={searchParams} />
        </Suspense>
      </section>
    </>
  );
}

async function Ticket({ params, searchParams }: { params: Promise<{ token: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { token } = await params;
  const q = await searchParams;
  const found = await ticketByToken(token).catch(() => null);
  if (!found) notFound();
  const { ticket, messages } = found;
  await markPlayerSeen(ticket.id).catch(() => {});
  const closed = ticket.status === "closed";
  return (
    <div className="space-y-10">
      {q.new ? (
        <div role="status" className="rounded-[var(--radius-file)] border border-[color:var(--color-ok)] bg-[color:var(--color-ok)]/15 px-4 py-3 text-sm text-paper">
          Your ticket is open. We&apos;ll answer on this page. <strong>Bookmark it</strong>
          {ticket.user_id ? ", or find it under Support whenever you're signed in." : " or keep the link: it's how you get back to this ticket."}
        </div>
      ) : null}
      <header>
        <div className="flex flex-wrap items-center gap-3">
          <StatusTag status={ticket.status} />
          <span className="font-mono text-xs text-smoke">
            #{ticket.id} · {categoryLabel(ticket.category)}
            {ticket.case_id ? ` · ${ticket.case_id}` : ""} · opened {formatDate(ticket.created_at, { dateStyle: "medium", timeStyle: "short" })}
          </span>
        </div>
        <h2 className="mt-3 font-serif text-3xl text-paper">{ticket.subject}</h2>
      </header>
      <ol className="space-y-4">
        {messages.map((m) => (
          <li
            key={m.id}
            className={`rounded-[var(--radius-file)] border px-5 py-4 ${m.author === "staff" ? "border-brass/50 bg-brass/5" : "border-rule bg-card/40"}`}
          >
            <p className="font-mono text-xs tracking-[0.08em] text-smoke">
              {m.author === "staff" ? <span className="text-brass">BLACKWOOD SUPPORT</span> : "YOU"} · {formatDate(m.created_at, { dateStyle: "medium", timeStyle: "short" })}
            </p>
            <p className="mt-2 whitespace-pre-wrap leading-relaxed text-paper">{m.body}</p>
          </li>
        ))}
      </ol>
      <ReplyForm token={ticket.token} closed={closed} />
      {!closed ? (
        <form action={closeTicket}>
          <input type="hidden" name="token" value={ticket.token} />
          <button type="submit" className="text-sm text-smoke underline-offset-4 hover:text-paper hover:underline">
            My problem is solved: close this ticket
          </button>
        </form>
      ) : null}
      <p className="text-sm">
        <Link href="/support" className="text-brass underline underline-offset-2">
          Back to Support
        </Link>
      </p>
    </div>
  );
}
