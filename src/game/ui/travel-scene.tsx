"use client";

import { useEffect, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { paintedArt } from "@/lib/art";
import type { TravelMode } from "./travel-audio";

/*
 * The journey between locations: a 1985 sedan crossing Los Angeles at dusk,
 * or the investigator on foot across Hollister Avenue. Once the paintings
 * exist (travel_* in art/manifest.json) the painted versions play; until
 * then a drawn SVG version stands in. Skippable at any time.
 */

const W = 1600;
const H = 900;

/** A layer that scrolls left forever: two copies of one tile, shifted by one tile width. */
function Scroll({ seconds, still, children }: { seconds: number; still: boolean; children: ReactNode }) {
  const style = { "--tile": `${W}px`, animationDuration: `${seconds}s` } as CSSProperties;
  return (
    <g className={still ? undefined : "travel-scroll"} style={style}>
      <g>{children}</g>
      <g transform={`translate(${W} 0)`}>{children}</g>
    </g>
  );
}

function Palm({ x, base, h, color }: { x: number; base: number; h: number; color: string }) {
  const top = base - h;
  return (
    <g fill={color} stroke={color}>
      <path d={`M${x} ${base} Q${x + 8} ${base - h / 2} ${x + 4} ${top}`} strokeWidth="7" fill="none" />
      {[-70, -35, 0, 35, 70, 110, -110].map((a) => (
        <path key={a} d={`M${x + 4} ${top} q${Math.sin((a * Math.PI) / 180) * 50} ${-12 + Math.abs(a) / 6} ${Math.sin((a * Math.PI) / 180) * 80} ${18 + Math.abs(a) / 3}`} strokeWidth="6" fill="none" strokeLinecap="round" />
      ))}
    </g>
  );
}

function DriveScene({ still }: { still: boolean }) {
  const buildings = [
    [0, 210], [90, 150], [170, 260], [250, 120], [330, 190], [520, 230], [600, 140], [700, 300], [790, 170], [980, 200], [1060, 250], [1160, 130], [1250, 220], [1420, 180], [1500, 240],
  ];
  return (
    <>
      <defs>
        <linearGradient id="dusk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1d1830" />
          <stop offset="0.45" stopColor="#6d3a4a" />
          <stop offset="0.75" stopColor="#d07a45" />
          <stop offset="1" stopColor="#f2b56b" />
        </linearGradient>
        <radialGradient id="lamp" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffd890" stopOpacity="0.8" />
          <stop offset="1" stopColor="#ffd890" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill="url(#dusk)" />
      <circle cx="1180" cy="560" r="70" fill="#f7cf86" opacity="0.85" />
      {/* Hills, far away */}
      <Scroll seconds={60} still={still}>
        <path d={`M0 600 C200 470 380 520 520 480 S820 420 1000 500 S1350 450 1600 600 L1600 900 L0 900 Z`} fill="#4a2c3c" opacity="0.85" />
      </Scroll>
      {/* The city: low buildings and palms */}
      <Scroll seconds={16} still={still}>
        {buildings.map(([x, h]) => (
          <g key={x}>
            <rect x={x} y={640 - h} width="78" height={h} fill="#2b1f2c" />
            {Array.from({ length: Math.floor(h / 45) }, (_, i) => (
              <rect key={i} x={x + 14 + (i % 2) * 30} y={640 - h + 18 + i * 40} width="14" height="10" fill="#f3c46e" opacity={(x + i) % 3 ? 0.55 : 0.15} />
            ))}
          </g>
        ))}
        {[440, 900, 1340].map((x) => (
          <Palm key={x} x={x} base={640} h={330} color="#1f1622" />
        ))}
      </Scroll>
      {/* Road */}
      <rect y="640" width={W} height="260" fill="#1a1718" />
      <rect y="640" width={W} height="14" fill="#2c2526" />
      <Scroll seconds={0.9} still={still}>
        {Array.from({ length: 8 }, (_, i) => (
          <rect key={i} x={i * 200} y="790" width="110" height="8" fill="#c9b27a" opacity="0.7" />
        ))}
      </Scroll>
      {/* Streetlights rushing past, in front of the city */}
      <Scroll seconds={2.6} still={still}>
        {[150, 950].map((x) => (
          <g key={x}>
            <circle cx={x + 64} cy="378" r="60" fill="url(#lamp)" />
            <rect x={x} y="380" width="9" height="270" fill="#141012" />
            <path d={`M${x + 4} 382 q30 -18 60 -4`} stroke="#141012" strokeWidth="7" fill="none" />
            <rect x={x + 54} y="378" width="22" height="8" rx="3" fill="#ffd890" />
          </g>
        ))}
      </Scroll>
      {/* The sedan */}
      <g className={still ? undefined : "travel-bob"}>
        <ellipse cx="800" cy="768" rx="250" ry="16" fill="#000" opacity="0.45" />
        <path
          d="M560 740 L560 690 Q565 668 600 664 L660 660 L705 612 Q720 598 760 596 L900 596 Q935 598 955 616 L1000 660 L1040 664 Q1070 670 1075 700 L1078 740 Z"
          fill="#5b4632"
        />
        <path d="M712 618 Q722 606 750 605 L800 605 L800 656 L676 656 Z" fill="#9fb2bd" opacity="0.55" />
        <path d="M812 605 L895 605 Q925 607 940 624 L970 656 L812 656 Z" fill="#9fb2bd" opacity="0.55" />
        <rect x="560" y="700" width="518" height="6" fill="#c8b48a" opacity="0.7" />
        <rect x="1060" y="690" width="18" height="12" rx="2" fill="#ffe6a6" />
        <rect x="560" y="694" width="10" height="12" fill="#a5281f" />
        <path d="M1078 694 L1500 650 L1500 760 L1078 704 Z" fill="#ffe6a6" opacity="0.08" />
        {[660, 980].map((cx) => (
          <g key={cx} className={still ? undefined : "travel-spin"} style={{ transformOrigin: `${cx}px 745px` }}>
            <circle cx={cx} cy="745" r="38" fill="#121010" />
            <circle cx={cx} cy="745" r="18" fill="#8d8a84" />
            <path d={`M${cx - 18} 745 H${cx + 18} M${cx} 727 V763`} stroke="#3b3936" strokeWidth="4" />
          </g>
        ))}
      </g>
    </>
  );
}

function Jacaranda({ x, base }: { x: number; base: number }) {
  return (
    <g>
      <path d={`M${x} ${base} q-6 -90 4 -170`} stroke="#3a2a24" strokeWidth="12" fill="none" />
      {[[-60, -200, 80], [10, -240, 95], [70, -190, 75], [-10, -170, 70]].map(([dx, dy, r], i) => (
        <circle key={i} cx={x + dx} cy={base + dy} r={r} fill={i % 2 ? "#8a6fb4" : "#7a5fa6"} opacity="0.92" />
      ))}
    </g>
  );
}

function WalkScene({ still }: { still: boolean }) {
  return (
    <>
      <defs>
        <linearGradient id="afternoon" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7fa3bf" />
          <stop offset="1" stopColor="#f0d6a8" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill="url(#afternoon)" />
      {/* Bungalows across the street */}
      <Scroll seconds={22} still={still}>
        {[40, 440, 840, 1240].map((x, i) => (
          <g key={x}>
            <rect x={x} y="430" width="300" height="180" fill={["#d9c8a6", "#c7b394", "#e0d2b5", "#cbb898"][i]} />
            <path d={`M${x - 20} 440 L${x + 150} 350 L${x + 320} 440 Z`} fill="#7a4d3a" />
            <rect x={x + 30} y="480" width="70" height="60" fill="#4d5f6b" />
            <rect x={x + 200} y="480" width="70" height="60" fill="#4d5f6b" />
            <rect x={x + 125} y="500" width="50" height="110" fill="#5c3b2c" />
            <rect x={x - 10} y="604" width="320" height="10" fill="#9c8e74" />
          </g>
        ))}
        {[330, 1130].map((x) => (
          <Jacaranda key={x} x={x} base={620} />
        ))}
      </Scroll>
      {/* Lawns, hedges and the sidewalk on this side */}
      <rect y="620" width={W} height="60" fill="#6f8a4c" />
      <Scroll seconds={9} still={still}>
        {Array.from({ length: 8 }, (_, i) => (
          <ellipse key={i} cx={i * 200 + 60} cy="640" rx="90" ry="34" fill="#4f6a35" />
        ))}
      </Scroll>
      <rect y="680" width={W} height="220" fill="#b9b1a2" />
      <Scroll seconds={3.4} still={still}>
        {Array.from({ length: 9 }, (_, i) => (
          <rect key={i} x={i * 180} y="680" width="3" height="220" fill="#8f877a" />
        ))}
      </Scroll>
      <rect y="860" width={W} height="40" fill="#7d776c" />
      {/* The investigator, in profile, walking right */}
      <g className={still ? undefined : "travel-step"} transform="translate(700 0)">
        <ellipse cx="44" cy="842" rx="64" ry="9" fill="#000" opacity="0.22" />
        {/* far leg and arm, in shadow */}
        <g className={still ? undefined : "travel-leg-b"} style={{ transformOrigin: "44px 700px" }}>
          <rect x="34" y="700" width="20" height="132" rx="6" fill="#1c1c22" />
          <path d="M34 826 h34 q8 0 8 8 v4 h-42 z" fill="#0f0f12" />
        </g>
        <g className={still ? undefined : "travel-arm-b"} style={{ transformOrigin: "42px 580px" }}>
          <rect x="32" y="576" width="18" height="118" rx="9" fill="#6f5e3f" />
        </g>
        {/* near leg */}
        <g className={still ? undefined : "travel-leg-a"} style={{ transformOrigin: "44px 700px" }}>
          <rect x="34" y="700" width="20" height="132" rx="6" fill="#2a2a31" />
          <path d="M34 826 h34 q8 0 8 8 v4 h-42 z" fill="#17171b" />
        </g>
        {/* trench coat, side view */}
        <path d="M14 566 Q44 548 74 566 L90 752 Q46 762 2 752 Z" fill="#a08b62" />
        <path d="M74 566 L58 640" stroke="#7d6a47" strokeWidth="3" />
        <rect x="6" y="642" width="80" height="9" fill="#7d6a47" />
        <path d="M2 752 L10 700" stroke="#8c7853" strokeWidth="3" />
        {/* near arm */}
        <g className={still ? undefined : "travel-arm"} style={{ transformOrigin: "46px 580px" }}>
          <rect x="36" y="576" width="19" height="120" rx="9" fill="#94805a" />
          <circle cx="46" cy="698" r="9" fill="#c99a78" />
        </g>
        {/* head in profile, fedora brim forward */}
        <rect x="34" y="530" width="22" height="34" fill="#c99a78" />
        <circle cx="46" cy="514" r="27" fill="#c99a78" />
        <path d="M71 512 l9 8 l-9 3 z" fill="#c99a78" />
        <path d="M2 498 Q46 486 92 494 L90 501 Q46 494 6 506 Z" fill="#2a241c" />
        <path d="M18 498 Q20 466 46 462 Q72 466 74 496 Z" fill="#3a3027" />
        <rect x="18" y="488" width="56" height="8" fill="#1d1813" />
      </g>
    </>
  );
}


/** Painted travel art, when it has been made. */
const ART = {
  travel_drive_far: paintedArt("travel_drive_far"),
  travel_drive_near: paintedArt("travel_drive_near"),
  travel_drive_car: paintedArt("travel_drive_car"),
  travel_walk: paintedArt("travel_walk"),
};

/**
 * A painted layer that scrolls left forever. The tile alternates with its own
 * mirror image, so the seams always match without a specially tiled painting.
 */
function PaintedScroll({ src, seconds, still, className = "" }: { src: string; seconds: number; still: boolean; className?: string }) {
  return (
    <div className={`absolute flex h-full w-max ${still ? "" : "travel-pan"} ${className}`} style={{ animationDuration: `${seconds}s` }}>
      {[0, 1, 2, 3].map((i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={i} src={src} alt="" draggable={false} className={`h-full w-auto max-w-none select-none ${i % 2 ? "-scale-x-100" : ""}`} />
      ))}
    </div>
  );
}

type DriveArt = { far: string; near: string; car: string };

function PaintedDrive({ still, art }: { still: boolean; art: DriveArt }) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#1a1420]">
      {/* Distant city and hills */}
      <div className="absolute inset-x-0 top-0 h-[92%]">
        <PaintedScroll src={art.far} seconds={60} still={still} />
      </div>
      {/* The road */}
      <div className="absolute inset-x-0 bottom-0 h-[24%] bg-gradient-to-b from-[#24201d] to-[#0f0d0c]">
        <div className={`absolute inset-x-0 top-[42%] h-[3%] min-h-[3px] travel-dashes ${still ? "" : "travel-dashes-run"}`} />
      </div>
      {/* Palms and streetlights along the boulevard */}
      <div className="absolute inset-x-0 bottom-[22%] h-[62%]">
        <PaintedScroll src={art.near} seconds={11} still={still} className="bottom-0" />
      </div>
      {/* The car */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={art.car} alt="" draggable={false} className={`absolute bottom-[7%] left-1/2 h-[27%] w-auto -translate-x-1/2 select-none drop-shadow-[0_10px_8px_rgba(0,0,0,0.6)] ${still ? "" : "travel-bob"}`} />
    </div>
  );
}

function PaintedWalk({ still, src }: { still: boolean; src: string }) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      {/* Seen through the investigator's eyes: a slow push forward with a walker's sway. */}
      <div className={`absolute inset-0 ${still ? "" : "travel-walk-push"}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" draggable={false} className={`h-full w-full select-none object-cover ${still ? "" : "travel-walk-sway"}`} />
      </div>
    </div>
  );
}

/** Whether travel scenes are switched on for this device. A per-viewer convenience, so it lives in the browser. */
const KEY = "bw.travelScenes";
const listeners = new Set<() => void>();
function readScenes() {
  try {
    return localStorage.getItem(KEY) !== "off";
  } catch {
    return true;
  }
}
export function setTravelScenes(on: boolean) {
  try {
    localStorage.setItem(KEY, on ? "on" : "off");
  } catch {
    /* storage unavailable; the setting simply does not persist */
  }
  listeners.forEach((l) => l());
}
export function useTravelScenes() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    readScenes,
    () => true,
  );
}
export { readScenes as travelScenesEnabled };

/**
 * A medieval case's walk, until its painting exists: a moor road under a
 * manuscript sky, in the flat colors of an illumination.
 */
function MedievalWalk({ still }: { still: boolean }) {
  return (
    <>
      <rect width={W} height={H} fill="#e9dcb8" />
      <rect width={W} height={H * 0.5} fill="#2f4f86" />
      <g fill="none" stroke="#d7aa45" strokeWidth="2" opacity="0.5">
        {[...Array(9)].map((_, i) => (
          <path key={i} d={`M${i * 190} ${60 + (i % 3) * 40} q30 -18 60 0 t60 0`} />
        ))}
      </g>
      <Scroll seconds={40} still={still}>
        <path d={`M0 ${H * 0.52} Q200 330 420 ${H * 0.5} T860 420 T1300 ${H * 0.5} T${W} 430 V${H} H0Z`} fill="#6f8f55" stroke="#2a1f15" strokeWidth="4" />
        {[180, 520, 980, 1360].map((x) => (
          <g key={x} stroke="#2a1f15" strokeWidth="3">
            <rect x={x} y="370" width="10" height="60" fill="#6b4a2b" />
            <circle cx={x + 5} cy="350" r="38" fill="#3f6b3a" />
          </g>
        ))}
      </Scroll>
      <Scroll seconds={14} still={still}>
        <path d={`M0 ${H * 0.66} Q300 560 640 ${H * 0.64} T1200 600 T${W} ${H * 0.66} V${H} H0Z`} fill="#8aa35e" stroke="#2a1f15" strokeWidth="4" />
        <path d={`M0 ${H * 0.8} Q400 690 800 ${H * 0.78} T${W} ${H * 0.8}`} fill="none" stroke="#b08a5a" strokeWidth="46" strokeLinecap="round" />
      </Scroll>
      {/* The examiner, in a dark cloak, staff in hand */}
      <g transform={`translate(${W / 2 - 40} 520)`} className={still ? undefined : "travel-bob"} stroke="#1b140e" strokeWidth="3">
        <path d="M40 0 q22 0 22 24 q0 22 -22 22 q-22 0 -22 -22 q0 -24 22 -24z" fill="#e8c9a0" />
        <path d="M10 44 q30 -14 60 0 l14 150 h-88z" fill="#3b2a6b" />
        <path d="M82 30 l18 190" strokeWidth="6" />
      </g>
    </>
  );
}

export function TravelScene({
  caseId,
  theme = "noir",
  art = {},
  area = null,
  mode,
  to,
  subtitle,
  reducedMotion,
  onSkip,
}: {
  caseId?: string;
  theme?: "noir" | "medieval";
  /** The case's own travel paintings (travel_drive_far, travel_walk_<area>, ...), live versions included. */
  art?: Record<string, string>;
  /** The destination's area: a painting made for that area is used before the case's general one. */
  area?: string | null;
  mode: TravelMode;
  to: string;
  subtitle: string;
  reducedMotion: boolean;
  onSkip: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === " " || e.key === "Enter") onSkip();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onSkip]);

  const medieval = theme === "medieval";
  /*
   * Each picture is the one made for the destination's area, else the case's
   * own, else the agency's Los Angeles one. A medieval case never borrows the city.
   */
  const pick = (name: keyof typeof ART) =>
    (area ? art[`${name}_${area}`] : undefined) ??
    art[name] ??
    (caseId ? paintedArt(`${caseId.toLowerCase()}_${name}${area ? `_${area}` : ""}`) ?? paintedArt(`${caseId.toLowerCase()}_${name}`) : null) ??
    (medieval ? null : ART[name]);
  const walk = medieval || mode === "walk" ? pick("travel_walk") : null;
  const drive = !medieval && mode === "drive" ? { far: pick("travel_drive_far"), near: pick("travel_drive_near"), car: pick("travel_drive_car") } : null;
  const driveReady = drive && drive.far && drive.near && drive.car ? (drive as DriveArt) : null;
  const paintedReady = medieval || mode === "walk" ? Boolean(walk) : Boolean(driveReady);
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black travel-fade"
      role="dialog"
      aria-modal="true"
      aria-label={`${mode === "drive" ? "Driving" : "Walking"} to ${to}`}
      data-travel={mode}
      onClick={onSkip}
    >
      {paintedReady ? (
        <div className="aspect-video max-h-full w-full max-w-[calc(100dvh*16/9)]" aria-hidden>
          {driveReady ? <PaintedDrive still={reducedMotion} art={driveReady} /> : <PaintedWalk still={reducedMotion} src={walk!} />}
        </div>
      ) : (
        <svg viewBox={`0 0 ${W} ${H}`} className="aspect-video max-h-full w-full max-w-[calc(100dvh*16/9)]" preserveAspectRatio="xMidYMid slice" aria-hidden>
          {medieval ? <MedievalWalk still={reducedMotion} /> : mode === "drive" ? <DriveScene still={reducedMotion} /> : <WalkScene still={reducedMotion} />}
          <rect width={W} height={H} fill="#000" opacity="0.08" />
        </svg>
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-6 pb-8 pt-20 sm:px-12">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-paper/70">{medieval ? "On foot to" : mode === "drive" ? "Driving to" : "Walking to"}</p>
        <p className="mt-1 font-display text-3xl text-paper sm:text-4xl travel-caption">{to}</p>
        <p className="font-mono text-xs text-paper/70">{subtitle}</p>
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onSkip();
        }}
        className="absolute right-4 top-4 rounded-[2px] bg-black/50 px-3 py-1.5 font-mono text-xs text-paper/80 hover:text-paper"
      >
        Skip
      </button>
    </div>
  );
}
