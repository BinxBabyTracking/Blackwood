"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { Wordmark } from "../wordmark";

const ICONS: Record<string, React.ReactNode> = {
  hq: <path d="M3 10.5L12 4l9 6.5V20H3zM9 20v-6h6v6" />,
  assignments: <path d="M5 4h11l3 3v13H5zM9 10h7M9 14h7M9 18h4" />,
  cases: <path d="M3 7h6l2 2h10v11H3zM3 11h18" />,
  joint: <path d="M8 11a3 3 0 100-6 3 3 0 000 6zM16 11a3 3 0 100-6 3 3 0 000 6zM2 20c0-3 3-5 6-5s6 2 6 5M14 15.5c3 0 8 1 8 4.5" />,
  record: <path d="M12 3l2.5 5 5.5.8-4 3.9.9 5.5-4.9-2.6-4.9 2.6.9-5.5-4-3.9 5.5-.8z" />,
  personnel: <path d="M4 5h16v14H4zM9 12a2.2 2.2 0 100-4.4A2.2 2.2 0 009 12zM5.8 16c.6-1.8 1.8-2.6 3.2-2.6s2.6.8 3.2 2.6M14.5 9h3M14.5 12.5h3" />,
  settings: <path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0M14 4v4M8 10v4M16 16v4" />,
};

export const PORTAL_NAV = [
  { href: "/agency", label: "Agency Headquarters", icon: "hq" },
  { href: "/agency/assignments", label: "Available Assignments", icon: "assignments" },
  { href: "/agency/cases", label: "My Case Files", icon: "cases" },
  { href: "/agency/joint-investigations", label: "Joint Investigations", icon: "joint" },
  { href: "/agency/service-record", label: "Service Record", icon: "record" },
  { href: "/agency/personnel", label: "Personnel File", icon: "personnel" },
  { href: "/agency/settings", label: "Agency Settings", icon: "settings" },
] as const;

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Suspense fallback={<NavLinks pathname={null} onNavigate={onNavigate} />}>
      <LiveNavLinks onNavigate={onNavigate} />
    </Suspense>
  );
}

function LiveNavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return <NavLinks pathname={usePathname()} onNavigate={onNavigate} />;
}

function NavLinks({ pathname, onNavigate }: { pathname: string | null; onNavigate?: () => void }) {
  const active = (href: string) =>
    pathname != null && (href === "/agency" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`));
  return (
    <ul className="space-y-0.5">
      {PORTAL_NAV.map((item) => {
        const on = active(item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={on ? "page" : undefined}
              className={`group relative flex items-center gap-3 rounded-[2px] px-3 py-2.5 text-sm transition-colors ${
                on ? "bg-card text-paper" : "text-smoke hover:bg-card/50 hover:text-paper"
              }`}
            >
              <span
                aria-hidden
                className={`absolute inset-y-1.5 left-0 w-[2px] transition-colors ${on ? "bg-brass" : "bg-transparent"}`}
              />
              <svg
                viewBox="0 0 24 24"
                className={`h-[18px] w-[18px] shrink-0 ${on ? "text-brass" : "text-smoke group-hover:text-paper"}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                {ICONS[item.icon]}
              </svg>
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/** The way into the Admin page, at the very bottom of the navigation. The page itself asks for a password. */
function AdminLink({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link
      href="/agency/admin"
      onClick={onNavigate}
      className="flex items-center gap-2 rounded-[2px] px-2 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-smoke/70 hover:text-paper"
    >
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
        <rect x="5" y="11" width="14" height="9" rx="1" />
        <path d="M8 11V8a4 4 0 0 1 8 0v3" />
      </svg>
      Admin
    </Link>
  );
}

export function SideNav() {
  return (
    <nav aria-label="Agency" className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-rule bg-rail lg:flex">
      <div className="border-b border-rule px-5 py-5">
        <Wordmark href="/agency" />
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-5">
        <NavList />
      </div>
      <p className="border-t border-rule px-5 pt-4 font-mono text-[0.7rem] leading-relaxed text-smoke">
        Internal use only.
        <br />
        Fictional agency, est. 1978
      </p>
      <div className="px-3 pb-3 pt-2">
        <AdminLink />
      </div>
    </nav>
  );
}

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  // The drawer is drawn at the end of the page, not inside the header: the header's blur would otherwise
  // shrink the "full screen" drawer to the header's own height.
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="-ml-2 p-2 text-paper lg:hidden"
        aria-expanded={open}
        aria-controls="agency-drawer"
        onClick={() => setOpen(true)}
      >
        <span className="sr-only">Open navigation</span>
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
          <path d="M3 7h18M3 12h18M3 17h12" />
        </svg>
      </button>
      {mounted ? createPortal(
      <div
        className={`fixed inset-0 z-50 lg:hidden ${open ? "" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
        <div
          className={`absolute inset-0 bg-ink/70 backdrop-blur-[2px] transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
          onClick={() => setOpen(false)}
        />
        <div
          id="agency-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Agency navigation"
          inert={!open}
          className={`absolute inset-y-0 left-0 flex w-[min(20rem,85vw)] flex-col border-r border-rule bg-rail transition-transform duration-300 ease-[var(--ease-drawer)] ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-rule px-5 py-5">
            <Wordmark href="/agency" />
            <button ref={closeRef} type="button" className="p-2 text-smoke hover:text-paper" onClick={() => setOpen(false)}>
              <span className="sr-only">Close navigation</span>
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                <path d="M5 5l14 14M19 5L5 19" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-5">
            <NavList onNavigate={() => setOpen(false)} />
          </div>
          <div className="border-t border-rule px-3 py-3">
            <AdminLink onNavigate={() => setOpen(false)} />
          </div>
        </div>
      </div>,
      document.body,
      ) : null}
    </>
  );
}
