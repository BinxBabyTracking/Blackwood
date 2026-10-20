"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { getBrowserClient } from "@/lib/supabase/client";
import { Wordmark } from "./wordmark";
import { buttonClass } from "./ui";

const NAV = [
  { href: "/about", label: "About the Agency" },
  { href: "/investigations", label: "Available Investigations" },
  { href: "/how-it-works", label: "How It Works" },
];

export function PublicHeader() {
  const [open, setOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const supabase = getBrowserClient();
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSignedIn(Boolean(data.session)));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setSignedIn(Boolean(session)));
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <header className="absolute inset-x-0 top-0 z-40">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-8">
        <Wordmark />
        <nav aria-label="Main" className="hidden items-center gap-8 lg:flex">
          <Suspense fallback={<MainLinks pathname={null} />}>
            <LiveMainLinks />
          </Suspense>
        </nav>
        <div className="hidden items-center gap-5 lg:flex">
          {signedIn ? (
            <Link href="/agency" className={buttonClass("secondary")}>
              Agency Headquarters
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm text-smoke hover:text-paper">
                Sign In
              </Link>
              <Link href="/join" className={buttonClass("primary")}>
                Join the Agency
              </Link>
            </>
          )}
        </div>
        <button
          type="button"
          className="relative z-50 -mr-2 p-2 text-paper lg:hidden"
          aria-expanded={open}
          aria-controls="public-menu"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
            {open ? <path d="M5 5l14 14M19 5L5 19" /> : <path d="M3 7h18M3 12h18M3 17h12" />}
          </svg>
        </button>
      </div>

      <div
        id="public-menu"
        hidden={!open}
        className="fixed inset-0 z-40 bg-ink/97 px-6 pt-24 backdrop-blur-sm lg:hidden"
      >
        <nav aria-label="Mobile" className="flex flex-col gap-1">
          <Link href="/" onClick={() => setOpen(false)} className="border-b border-rule py-4 font-display text-2xl">
            Home
          </Link>
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className="border-b border-rule py-4 font-display text-2xl">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="mt-8 flex flex-col gap-3" onClick={() => setOpen(false)}>
          {signedIn ? (
            <Link href="/agency" className={buttonClass("primary")}>
              Agency Headquarters
            </Link>
          ) : (
            <>
              <Link href="/join" className={buttonClass("primary")}>
                Join the Agency
              </Link>
              <Link href="/login" className={buttonClass("secondary")}>
                Sign In
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function LiveMainLinks() {
  return <MainLinks pathname={usePathname()} />;
}

function MainLinks({ pathname }: { pathname: string | null }) {
  const isActive = (href: string) => Boolean(pathname && (pathname === href || pathname.startsWith(`${href}/`)));
  return (
    <>
      {NAV.map((n) => (
        <Link
          key={n.href}
          href={n.href}
          aria-current={isActive(n.href) ? "page" : undefined}
          className="text-sm text-smoke transition-colors hover:text-paper aria-[current=page]:text-brass"
        >
          {n.label}
        </Link>
      ))}
    </>
  );
}
