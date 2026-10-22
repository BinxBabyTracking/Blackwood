import { paintedArt } from "@/lib/art";
import type { CatalogCase } from "@/lib/types";

type CoverCase = Pick<CatalogCase, "id" | "case_number" | "title" | "is_preview" | "cover_image_url">;

/**
 * Case artwork. Until final art exists (Phase 2), each case gets a drawn
 * night scene chosen from its id, clearly marked as placeholder artwork.
 */
export function CaseCover({
  c,
  className = "",
  variant = "card",
  priority = false,
}: {
  c: CoverCase;
  className?: string;
  variant?: "card" | "hero";
  priority?: boolean;
}) {
  const cover = c.cover_image_url ?? paintedArt(`${c.id.toLowerCase()}_cover`);
  if (cover) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={cover}
        alt=""
        loading={priority ? "eager" : "lazy"}
        className={`h-full w-full object-cover ${className}`}
      />
    );
  }

  const seed = Number.parseInt(c.case_number, 10) || 0;
  const id = `cv-${c.id}-${variant}`;

  return (
    <div className={`relative h-full w-full overflow-hidden bg-[#0e1318] ${className}`}>
      <svg
        viewBox="0 0 400 240"
        preserveAspectRatio="xMidYMid slice"
        className={variant === "hero" ? "absolute inset-y-0 right-0 h-full w-full md:w-[62%]" : "absolute inset-0 h-full w-full"}
        aria-hidden
      >
        <defs>
          <radialGradient id={`${id}-glow`} cx="0.68" cy="0.38" r="0.6">
            <stop offset="0" stopColor="#c6a472" stopOpacity="0.55" />
            <stop offset="0.45" stopColor="#7a5f3a" stopOpacity="0.16" />
            <stop offset="1" stopColor="#0e1318" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1a222b" />
            <stop offset="1" stopColor="#0b0f13" />
          </linearGradient>
          <filter id={`${id}-blur`}>
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>
        <rect width="400" height="240" fill={`url(#${id}-sky)`} />
        {c.is_preview ? <SealedScene id={id} /> : seed % 3 === 1 ? <WindowScene id={id} /> : seed % 3 === 2 ? <StreetScene id={id} /> : <DoorScene id={id} />}
      </svg>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(18,23,29,0.85))]" />
      <span className={`absolute right-2 rounded-[2px] ${variant === "hero" ? "bottom-2" : "top-2"} bg-ink/70 px-1.5 py-0.5 font-mono text-[0.625rem] tracking-wide text-smoke`}>
        Placeholder art
      </span>
    </div>
  );
}

/** A lit window behind half-open blinds, a hillside of palms below. */
function WindowScene({ id }: { id: string }) {
  return (
    <g>
      <rect width="400" height="240" fill={`url(#${id}-glow)`} />
      <g transform="translate(232 46)">
        <rect width="104" height="118" fill="#c6a472" opacity="0.7" filter={`url(#${id}-blur)`} />
        <rect width="104" height="118" fill="#e4c995" opacity="0.85" />
        {Array.from({ length: 13 }, (_, i) => (
          <rect key={i} y={i * 9 + 2} width="104" height="5" fill="#2a2118" opacity="0.88" />
        ))}
        <rect x="-4" y="-4" width="112" height="126" fill="none" stroke="#0b0f13" strokeWidth="8" />
        <rect x="50" width="4" height="118" fill="#0b0f13" />
      </g>
      <path d="M0 196 C80 178 150 186 220 176 S340 168 400 174 V240 H0Z" fill="#090c10" />
      <g fill="#090c10">
        <path d="M70 196 l3 -88 l3 0 l2 88z" />
        <path d="M74 108 c-22 -4 -34 6 -42 16 c14 -10 28 -12 42 -12 c-14 4 -26 14 -30 26 c10 -12 20 -18 30 -22 c4 8 4 22 2 30 c6 -10 8 -22 4 -32 c14 2 26 10 34 22 c-4 -14 -16 -24 -30 -28 c14 -2 28 2 38 10 c-10 -12 -28 -16 -48 -10z" />
        <path d="M120 190 l2 -60 l3 0 l1 60z" />
        <path d="M123 130 c-16 -2 -26 4 -32 12 c10 -6 20 -8 32 -8 c-8 4 -16 12 -18 20 c6 -8 12 -12 18 -14 c8 4 14 12 16 22 c0 -10 -6 -18 -14 -22 c10 0 20 4 26 10 c-6 -10 -18 -14 -28 -20z" />
      </g>
    </g>
  );
}

/** A single streetlamp in low fog, the kerb running out of frame. */
function StreetScene({ id }: { id: string }) {
  return (
    <g>
      <ellipse cx="250" cy="70" rx="120" ry="90" fill="#c6a472" opacity="0.18" filter={`url(#${id}-blur)`} />
      <path d="M210 70 L160 240 H340 L290 70Z" fill="#c6a472" opacity="0.08" />
      <rect x="246" y="62" width="8" height="178" fill="#06090c" />
      <path d="M232 62 h36 l-6 -10 h-24z" fill="#06090c" />
      <ellipse cx="250" cy="66" rx="12" ry="4" fill="#f3e2bf" />
      <rect x="0" y="206" width="400" height="34" fill="#080b0e" />
      <path d="M0 206 H400" stroke="#2c343c" strokeWidth="1.5" />
      <rect x="0" y="150" width="400" height="60" fill="#a9afb7" opacity="0.05" filter={`url(#${id}-blur)`} />
    </g>
  );
}

/** An open doorway spilling light down porch steps. */
function DoorScene({ id }: { id: string }) {
  return (
    <g>
      <rect width="400" height="240" fill={`url(#${id}-glow)`} opacity="0.7" />
      <rect x="0" y="0" width="400" height="200" fill="#111820" />
      <g transform="translate(176 60)">
        <rect width="64" height="128" fill="#e8cd9b" />
        <rect x="64" width="22" height="128" fill="#1d1813" transform="skewY(8)" />
        <rect x="18" y="58" width="18" height="70" rx="9" fill="#14110d" opacity="0.92" />
      </g>
      <path d="M176 188 H240 L300 240 H120Z" fill="#c6a472" opacity="0.32" />
      <path d="M150 196 H266 M138 212 H278 M126 228 H290" stroke="#0a0d10" strokeWidth="3" />
      <rect x="60" y="80" width="40" height="52" fill="#1e2730" />
      <rect x="310" y="80" width="40" height="52" fill="#1e2730" />
    </g>
  );
}

/** A tied archive folder with a closed seal. */
function SealedScene({ id }: { id: string }) {
  return (
    <g>
      <rect width="400" height="240" fill={`url(#${id}-glow)`} opacity="0.35" />
      <g transform="translate(108 52) rotate(-4 92 68)">
        <path d="M0 14 h56 l10 -14 h118 v136 h-184z" fill="#3a3024" />
        <rect y="20" width="184" height="116" fill="#4a3d2d" />
        <path d="M0 78 H184" stroke="#2a2219" strokeWidth="3" />
        <circle cx="92" cy="78" r="14" fill="#6e2f2b" />
        <circle cx="92" cy="78" r="9" fill="none" stroke="#8f4a43" strokeWidth="1.5" />
      </g>
    </g>
  );
}
