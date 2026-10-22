"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { guestStatus, joinParty, leaveParty } from "@/app/actions/party";
import { SubmitButton } from "@/components/form";
import { Seal } from "@/components/wordmark";

export function PartyFrame({ title, kicker, children }: { title: string; kicker?: string; children: React.ReactNode }) {
  return (
    <main id="main" className="flex min-h-dvh items-center justify-center bg-ink px-5 py-10 text-paper">
      <div className="w-full max-w-sm text-center">
        <Seal className="mx-auto h-12 w-12 text-brass" />
        {kicker ? <p className="mt-5 font-mono text-sm text-brass">{kicker}</p> : null}
        <h1 className={`${kicker ? "mt-1" : "mt-5"} font-display text-3xl`}>{title}</h1>
        <div className="mt-4 space-y-5 text-smoke">{children}</div>
      </div>
    </main>
  );
}

export function JoinForm({ code, joinKey }: { code: string; joinKey: string }) {
  const [state, action] = useActionState(joinParty, {});
  return (
    <form action={action} className="space-y-4 text-left">
      <input type="hidden" name="code" value={code} />
      <input type="hidden" name="key" value={joinKey} />
      <label className="block text-sm text-paper">
        Your name
        <input name="name" className="field mt-1.5" maxLength={40} autoComplete="given-name" required autoFocus />
      </label>
      {state.error ? (
        <p role="alert" className="border border-fault bg-fault/15 px-3 py-2 text-sm text-paper">
          {state.error}
        </p>
      ) : null}
      <SubmitButton pending="Joining" className="w-full justify-center">
        Join the investigation
      </SubmitButton>
    </form>
  );
}

/** Seated: wait here until the host presses Start. */
export function Waiting({ name, initialCount }: { name: string; initialCount: number }) {
  const router = useRouter();
  const [count, setCount] = useState(initialCount);
  const [ended, setEnded] = useState(false);
  useEffect(() => {
    let stopped = false;
    const t = setInterval(async () => {
      const s = await guestStatus().catch(() => null);
      if (stopped || !s) return;
      if (s.status === "started") router.replace("/party/play");
      else if (s.status === "ended") setEnded(true);
      else setCount(s.count);
    }, 2000);
    return () => {
      stopped = true;
      clearInterval(t);
    };
  }, [router]);
  if (ended) return <p>The host ended the joint investigation.</p>;
  return (
    <>
      <p>
        You&apos;re in, <span className="text-paper">{name}</span>.
      </p>
      <p className="font-serif text-xl text-paper" role="status" aria-live="polite">
        {count} in the lobby
      </p>
      <p className="animate-pulse font-mono text-xs tracking-[0.2em]">WAITING FOR THE HOST TO START</p>
      <form action={leaveParty}>
        <button type="submit" className="text-sm underline-offset-4 hover:text-paper hover:underline">
          Leave
        </button>
      </form>
    </>
  );
}
