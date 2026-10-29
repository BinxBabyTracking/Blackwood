"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { acceptTerms } from "@/app/actions/legal";

/**
 * Shown over the Agency pages to an account that hasn't accepted the current
 * Terms, Privacy Policy and Billing and Refund Policy (older accounts, or after
 * the terms change). Nothing else can be used until it is accepted.
 */
export function TermsGate({ minAge, updated, changed }: { minAge: number; updated: string; changed: boolean }) {
  const router = useRouter();
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="terms-h">
      <div className="w-full max-w-md rounded-[var(--radius-file)] border border-rule bg-ink-2 p-6 text-paper shadow-2xl">
        <p className="font-mono text-xs tracking-[0.14em] text-brass">BLACKWOOD INVESTIGATIONS</p>
        <h2 id="terms-h" className="mt-2 font-serif text-2xl">{changed ? "Our terms have changed" : "Before you continue"}</h2>
        <p className="mt-3 text-sm leading-relaxed text-smoke">
          {changed ? `We updated our terms on ${updated}. ` : ""}Please read and accept the terms to keep using Blackwood. They cover your account, the
          AI-written character answers, purchases and refunds, and how we handle your information.
        </p>
        <ul className="mt-4 space-y-1 text-sm">
          {[
            ["/terms", "Terms of Service"],
            ["/privacy", "Privacy Policy"],
            ["/billing", "Billing and Refund Policy"],
          ].map(([href, label]) => (
            <li key={href}>
              <a href={href} target="_blank" className="text-brass underline underline-offset-2">
                {label}
              </a>
            </li>
          ))}
        </ul>
        <label className="mt-5 flex items-start gap-3 text-sm leading-relaxed">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-[#c4a36b]" />
          <span>
            I am {minAge} or older, and I agree to the Terms of Service, Privacy Policy and Billing and Refund Policy.
          </span>
        </label>
        {error ? (
          <p role="alert" className="mt-2 text-sm text-[#e08a7f]">
            {error}
          </p>
        ) : null}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={!agree || pending}
            onClick={() =>
              start(async () => {
                setError(null);
                const res = await acceptTerms();
                if ("error" in res) setError(res.error);
                else router.refresh();
              })
            }
            className="rounded-[2px] bg-brass px-4 py-2 text-sm font-semibold text-ink hover:bg-[#d4b585] disabled:opacity-50"
          >
            {pending ? "Saving…" : "Accept and continue"}
          </button>
          <form action="/auth/signout" method="post">
            <button type="submit" className="text-sm text-smoke hover:text-paper">
              Sign out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
