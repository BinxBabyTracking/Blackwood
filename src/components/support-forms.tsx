"use client";

import { useActionState, useEffect, useRef } from "react";
import { adminReply, openTicket, replyToTicket } from "@/app/actions/support";
import { Field, FormMessage, IDLE, SubmitButton } from "@/components/form";

const CATEGORIES = [
  { id: "account", label: "My account or sign-in" },
  { id: "billing", label: "A purchase or refund" },
  { id: "bug", label: "Something is broken" },
  { id: "case", label: "Help with a case" },
  { id: "other", label: "Something else" },
];

function Area({ name, label, rows = 6, error, hint }: { name: string; label: string; rows?: number; error?: string; hint?: string }) {
  const id = `f-${name}`;
  return (
    <div>
      <label htmlFor={id} className="block text-sm text-paper">
        {label}
      </label>
      <textarea id={id} name={name} rows={rows} required aria-invalid={error ? true : undefined} className="field mt-1.5 resize-y" />
      {hint ? <p className="mt-1.5 text-xs text-smoke">{hint}</p> : null}
      {error ? <p className="mt-1.5 text-xs text-[#e2a7a2]">{error}</p> : null}
    </div>
  );
}

/** Open a new ticket. Signed-in players don't type an email: their account's is used. */
export function NewTicketForm({ email, cases }: { email: string | null; cases: { id: string; title: string }[] }) {
  const [state, action] = useActionState(openTicket, IDLE);
  const errors = state.status === "error" ? state.fieldErrors ?? {} : {};
  return (
    <form action={action} className="space-y-5" noValidate>
      {email ? (
        <p className="text-sm text-smoke">
          We&apos;ll answer on this site, and you can find the ticket under Support any time you&apos;re signed in as <span className="text-paper">{email}</span>.
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Email" name="email" type="email" autoComplete="email" required error={errors.email} hint="So we know who you are. Keep the ticket's link to read our answer." />
          <Field label="Name (optional)" name="name" autoComplete="name" />
        </div>
      )}
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="f-category" className="block text-sm text-paper">
            What it&apos;s about
          </label>
          <select id="f-category" name="category" defaultValue="other" className="field mt-1.5">
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="f-case" className="block text-sm text-paper">
            Case (optional)
          </label>
          <select id="f-case" name="case" defaultValue="" className="field mt-1.5">
            <option value="">Not about a case</option>
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.id} {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>
      <Field label="Subject" name="subject" required maxLength={140} error={errors.subject} />
      <Area name="message" label="Message" rows={7} error={errors.message} hint="What happened, and what you expected. For a problem in a case, say where you were and what you'd just done." />
      {/* Left empty by people; bots fill it in. */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <FormMessage state={state} />
      <SubmitButton pending="Sending">Open ticket</SubmitButton>
    </form>
  );
}

function useClearOnSuccess(state: { status: string }) {
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.status === "success") ref.current?.reset();
  }, [state]);
  return ref;
}

/** The player's reply on their ticket's page. */
export function ReplyForm({ token, closed }: { token: string; closed: boolean }) {
  const [state, action] = useActionState(replyToTicket, IDLE);
  const ref = useClearOnSuccess(state);
  return (
    <form ref={ref} action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <Area name="message" label={closed ? "Reopen with a reply" : "Add a reply"} rows={5} />
      <FormMessage state={state} />
      <SubmitButton pending="Sending">Send reply</SubmitButton>
    </form>
  );
}

/** Admin: answer a ticket, optionally closing it. */
export function AdminReplyForm({ id }: { id: number }) {
  const [state, action] = useActionState(adminReply, IDLE);
  const ref = useClearOnSuccess(state);
  return (
    <form ref={ref} action={action} className="space-y-3">
      <input type="hidden" name="id" value={id} />
      <label className="block">
        <span className="sr-only">Reply</span>
        <textarea name="message" rows={4} required placeholder="Write your reply. The player sees it on their ticket's page." className="field resize-y" />
      </label>
      <label className="flex items-center gap-2 text-sm text-smoke">
        <input type="checkbox" name="close" value="1" className="h-4 w-4" />
        Close the ticket with this reply
      </label>
      <FormMessage state={state} />
      <SubmitButton pending="Sending">Send reply</SubmitButton>
    </form>
  );
}
