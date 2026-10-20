import Link from "next/link";

/** The agency seal: a keyhole set in a ring, drawn rather than borrowed. */
export function Seal({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden fill="none">
      <circle cx="20" cy="20" r="18.5" stroke="currentColor" strokeWidth="1" />
      <circle cx="20" cy="20" r="15" stroke="currentColor" strokeWidth="0.6" strokeDasharray="1 2.2" />
      <circle cx="20" cy="17" r="3.6" fill="currentColor" />
      <path d="M18.2 19.5h3.6l1.4 8.5h-6.4z" fill="currentColor" />
    </svg>
  );
}

export function Wordmark({ href = "/", subtitle }: { href?: string; subtitle?: string }) {
  return (
    <Link href={href} className="group flex items-center gap-3 text-brass" aria-label="Blackwood Investigations, home">
      <Seal />
      <span className="leading-none">
        <span className="block font-display text-[1.15rem] tracking-[0.14em] text-paper group-hover:text-brass">
          BLACKWOOD
        </span>
        <span className="mt-1 block text-[0.68rem] tracking-[0.18em] text-smoke">
          {subtitle ?? "INVESTIGATIONS"}
        </span>
      </span>
    </Link>
  );
}
