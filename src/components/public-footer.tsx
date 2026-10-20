import Link from "next/link";
import { Seal } from "./wordmark";

const LINKS = [
  { href: "/about", label: "About" },
  { href: "/investigations", label: "Investigations" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
];

export function PublicFooter() {
  return (
    <footer className="border-t border-rule bg-ink-2">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-8 md:grid-cols-[1.2fr_1fr]">
        <div>
          <div className="flex items-center gap-3 text-brass">
            <Seal className="h-8 w-8" />
            <span className="font-display text-xl text-paper">Blackwood Investigations</span>
          </div>
          <p className="mt-2 font-serif italic text-smoke">Every Case Has a Truth.</p>
          <p className="mt-6 max-w-[56ch] text-xs leading-relaxed text-smoke">
            Blackwood Investigations is a work of interactive fiction. The agency, its history, its staff and every case
            in its archive are invented for entertainment. It is not a licensed private investigation agency and does not
            offer investigative, legal or security services. Any resemblance to real people or events is coincidental.
          </p>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 content-start gap-x-8 gap-y-3 text-sm">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-smoke hover:text-paper">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="border-t border-rule">
        <p className="mx-auto max-w-7xl px-4 py-5 font-mono text-xs text-smoke sm:px-8">
          Blackwood Investigations, a fictional agency, est. 1978
        </p>
      </div>
    </footer>
  );
}
