/**
 * The agency office after hours, drawn in layers: street light coming through
 * venetian blinds and falling across the room, a desk lamp, an open file.
 * Placeholder for final photography; every layer is decorative.
 */
export function HeroOffice() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      {/* Room */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_78%_20%,#26303a_0%,#161c23_45%,#0d1116_100%)]" />

      {/* Window on the right wall */}
      <div className="absolute right-[7%] top-[12%] hidden h-[46%] w-[20%] opacity-60 md:block">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#8d9aa6_0%,#5c6874_55%,#39434d_100%)] opacity-50" />
        <div className="absolute inset-0 bg-[repeating-linear-gradient(180deg,#0e1318_0_9px,transparent_9px_15px)] opacity-95" />
        <div className="absolute inset-y-0 left-1/2 w-[6px] -translate-x-1/2 bg-[#0b0f13]" />
        <div className="absolute inset-0 outline outline-[6px] outline-[#0b0f13]" />
      </div>

      {/* Light through the blinds, thrown across the whole room */}
      <div
        className="absolute -inset-[20%] origin-top-right opacity-[0.16] motion-safe:animate-[blinds-drift_38s_ease-in-out_infinite_alternate]"
        style={{
          transform: "rotate(-14deg)",
          backgroundImage:
            "repeating-linear-gradient(180deg, rgba(220,226,232,0.9) 0 26px, transparent 26px 50px)",
          maskImage: "radial-gradient(70% 60% at 72% 34%, black 0%, rgba(0,0,0,0.5) 45%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(70% 60% at 72% 34%, black 0%, rgba(0,0,0,0.5) 45%, transparent 80%)",
        }}
      />

      {/* Lamp pool on the desk */}
      <div className="absolute bottom-[-12%] left-[48%] h-[70%] w-[70%] rounded-full bg-[radial-gradient(closest-side,rgba(198,164,114,0.42),rgba(198,164,114,0.12)_45%,transparent_75%)] motion-safe:animate-[lamp-breathe_9s_ease-in-out_infinite]" />

      {/* Desk, lamp and file, drawn */}
      <svg
        className="absolute bottom-0 right-0 h-[48%] w-full max-w-[1100px] md:w-[78%]"
        viewBox="0 0 900 380"
        preserveAspectRatio="xMaxYMax meet"
        fill="none"
      >
        <defs>
          <linearGradient id="desk" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2a221a" />
            <stop offset="1" stopColor="#0d0b09" />
          </linearGradient>
          <linearGradient id="paper" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#e9dfcc" />
            <stop offset="1" stopColor="#b9ab92" />
          </linearGradient>
          <radialGradient id="shade" cx="0.5" cy="1" r="0.8">
            <stop offset="0" stopColor="#f1d9a8" />
            <stop offset="1" stopColor="#6b5534" />
          </radialGradient>
        </defs>
        {/* desk top */}
        <path d="M0 250 L900 210 V380 H0Z" fill="url(#desk)" />
        <path d="M0 250 L900 210" stroke="#4a3c2c" strokeWidth="2" />
        {/* open case file */}
        <g transform="translate(360 196) rotate(-7)">
          <path d="M0 22 L190 0 L232 44 L36 70Z" fill="#6d5a3d" />
          <path d="M14 22 L186 4 L222 42 L46 62Z" fill="url(#paper)" opacity="0.92" />
          <path d="M60 30 L170 18 M66 38 L182 26 M72 46 L150 38" stroke="#5b5144" strokeWidth="2" opacity="0.6" />
          <rect x="44" y="24" width="30" height="22" fill="#2e2a24" opacity="0.8" transform="rotate(-6 44 24)" />
        </g>
        {/* photograph */}
        <g transform="translate(610 210) rotate(9)">
          <rect width="78" height="56" fill="#d6ccb8" />
          <rect x="5" y="5" width="68" height="40" fill="#30363c" />
          <path d="M5 38 L28 22 L44 32 L58 18 L73 30 V45 H5Z" fill="#1b2025" />
        </g>
        {/* lamp */}
        <g transform="translate(720 30)">
          <path d="M70 190 h70 v14 h-70z" fill="#15110d" />
          <path d="M102 190 L92 92 L60 40" stroke="#15110d" strokeWidth="7" strokeLinecap="round" />
          <path d="M14 70 L64 8 L110 40 L56 102Z" fill="#1d1712" />
          <path d="M14 70 L56 102" stroke="url(#shade)" strokeWidth="5" />
        </g>
        {/* cup */}
        <g transform="translate(250 214)">
          <ellipse cx="22" cy="30" rx="26" ry="7" fill="#0b0a08" opacity="0.6" />
          <path d="M2 4 h40 l-4 26 h-32z" fill="#e1d6c2" opacity="0.85" />
          <ellipse cx="22" cy="4" rx="20" ry="4" fill="#3a2a1d" />
        </g>
      </svg>

      {/* Vignette and floor */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_40%,transparent_40%,rgba(8,11,14,0.85)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(18,23,29,0.96)_0%,rgba(18,23,29,0.75)_38%,transparent_70%)]" />
    </div>
  );
}
