/**
 * Generates placeholder artwork for a case from its own scene data, so every
 * hotspot has a drawn object in the right place. Final art replaces these
 * files one for one. Run: npm run assets:placeholders -- C001
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { loadCase } from "../src/game/registry";
import type { CaseDefinition, HotspotDef, LocationDef } from "../src/game/engine/types";

const caseId = process.argv[2] ?? "C001";
const def = loadCase(caseId) as CaseDefinition;
const W = 1600;
const H = 900;
const out = join("public", "cases", caseId);

const C = {
  ink: "#12171d",
  wood: "#4a3526",
  woodDark: "#2c2018",
  brass: "#c6a472",
  paper: "#e8dcc4",
  paperDim: "#b9ab92",
  lamp: "#f0d39a",
  steel: "#5f6a73",
  red: "#7d3a33",
};

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// ---------------------------------------------------------------------------
// Scene backdrops
// ---------------------------------------------------------------------------

type Palette = { wall: string; wall2: string; floor: string; floor2: string; light: string; trim: string };
const palettes: Record<string, Palette> = {
  office: { wall: "#2b3238", wall2: "#1d2328", floor: "#3a2a1f", floor2: "#21170f", light: "#e9c98c", trim: "#141a1f" },
  living_room: { wall: "#3c3a33", wall2: "#26251f", floor: "#4b2f28", floor2: "#2a1914", light: "#f0d6a2", trim: "#1b1915" },
  kitchen: { wall: "#566152", wall2: "#343c33", floor: "#6b6252", floor2: "#3b362d", light: "#f4e3b5", trim: "#22281f" },
  diner: { wall: "#5e2f2c", wall2: "#3a1d1b", floor: "#2d3236", floor2: "#1b1f22", light: "#ffe2a8", trim: "#1a1a1a" },
  daniel_apartment: { wall: "#3f4a4f", wall2: "#273034", floor: "#5a4636", floor2: "#33271e", light: "#d9e1e6", trim: "#1a2023" },
  margaret_house: { wall: "#4f4438", wall2: "#302a22", floor: "#5c3f2c", floor2: "#34241a", light: "#f3dcae", trim: "#211b15" },
  robert_garage: { wall: "#4a4f4a", wall2: "#2c302c", floor: "#55585a", floor2: "#303234", light: "#f5f0d0", trim: "#1c1e1c" },
  patricia_office: { wall: "#545a52", wall2: "#363b35", floor: "#4b4f55", floor2: "#2c2f33", light: "#eef2e2", trim: "#20231f" },
};

function backdrop(l: LocationDef, state: string) {
  const p = palettes[l.id] ?? palettes.office;
  const horizon = 0.62 * H;
  let s = `
  <defs>
    <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.wall2}"/><stop offset="1" stop-color="${p.wall}"/></linearGradient>
    <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.floor}"/><stop offset="1" stop-color="${p.floor2}"/></linearGradient>
    <radialGradient id="pool" cx="0.5" cy="0.35" r="0.7"><stop offset="0" stop-color="${p.light}" stop-opacity="0.35"/><stop offset="1" stop-color="${p.light}" stop-opacity="0"/></radialGradient>
    <radialGradient id="vig" cx="0.5" cy="0.5" r="0.75"><stop offset="0.55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.65"/></radialGradient>
    <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0.5 0 0 0 0 0.45 0 0 0 0 0.4 0 0 0 0.12 0"/></filter>
  </defs>
  <rect width="${W}" height="${horizon}" fill="url(#wall)"/>
  <rect y="${horizon}" width="${W}" height="${H - horizon}" fill="url(#floor)"/>
  <rect y="${horizon - 6}" width="${W}" height="10" fill="${p.trim}"/>`;
  // floor boards / tiles
  if (l.id === "kitchen" || l.id === "diner") {
    for (let x = 0; x < W; x += 80) for (let y = horizon + 10; y < H; y += 60) {
      if (((x / 80) + Math.floor((y - horizon) / 60)) % 2 === 0) s += `<rect x="${x}" y="${y}" width="80" height="60" fill="#000" opacity="0.12"/>`;
    }
  } else if (l.id !== "robert_garage") {
    for (let y = horizon + 30; y < H; y += 34) s += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="#000" stroke-opacity="0.18"/>`;
  } else {
    s += `<ellipse cx="800" cy="${H - 80}" rx="300" ry="40" fill="#1a1a1a" opacity="0.35"/>`;
  }
  // wallpaper stripes for homes
  if (["living_room", "margaret_house"].includes(l.id)) {
    for (let x = 0; x < W; x += 46) s += `<rect x="${x}" y="0" width="16" height="${horizon}" fill="#fff" opacity="0.025"/>`;
  }
  if (l.id === "diner") {
    s += `<rect y="${horizon - 150}" width="${W}" height="20" fill="#c8c2b4" opacity="0.5"/>`;
    s += `<rect y="40" width="${W}" height="24" fill="#d24d3f" opacity="0.35"/>`;
  }
  if (l.id === "office") {
    // window with blinds behind desk
    s += `<g opacity="0.85"><rect x="560" y="70" width="440" height="330" fill="#8ea1b0" opacity="0.35"/>`;
    for (let y = 76; y < 400; y += 16) s += `<rect x="560" y="${y}" width="440" height="9" fill="#141a1f" opacity="0.8"/>`;
    s += `<rect x="556" y="66" width="448" height="338" fill="none" stroke="${p.trim}" stroke-width="10"/></g>`;
    // big desk
    s += `<path d="M300 560 L1250 560 L1300 640 L250 640 Z" fill="${C.wood}"/><rect x="250" y="640" width="1050" height="26" fill="${C.woodDark}"/><rect x="290" y="666" width="60" height="200" fill="${C.woodDark}"/><rect x="1200" y="666" width="60" height="200" fill="${C.woodDark}"/>`;
    s += `<g><rect x="1190" y="380" width="14" height="180" fill="#1b1612"/><path d="M1130 390 L1260 390 L1230 330 L1160 330 Z" fill="#2e4632"/><ellipse cx="1195" cy="565" rx="200" ry="40" fill="${C.lamp}" opacity="0.18"/></g>`;
  }
  if (l.id === "patricia_office") {
    s += `<rect x="760" y="560" width="520" height="30" fill="#6f6a5e"/><rect x="780" y="590" width="20" height="240" fill="#3a3832"/><rect x="1240" y="590" width="20" height="240" fill="#3a3832"/>`;
    for (let x = 100; x < W; x += 260) s += `<rect x="${x}" y="20" width="160" height="14" fill="#fffbe8" opacity="0.6"/>`;
  }
  if (l.id === "daniel_apartment" && state === "B") {
    s += `<rect x="0" y="0" width="${W}" height="${H}" fill="#0b1013" opacity="0.25"/>`;
  }
  return s;
}

// ---------------------------------------------------------------------------
// Objects by hotspot kind (drawn inside the hotspot rectangle)
// ---------------------------------------------------------------------------

function obj(h: HotspotDef, l: LocationDef, state: string): string {
  const x = (h.rect.x / 100) * W;
  const y = (h.rect.y / 100) * H;
  const w = (h.rect.w / 100) * W;
  const hh = (h.rect.h / 100) * H;
  const cx = x + w / 2;
  const b = y + hh;
  switch (h.kind) {
    case "folder":
      return `<g transform="rotate(-3 ${cx} ${y + hh / 2})"><rect x="${x}" y="${y + 6}" width="${w}" height="${hh - 6}" fill="#a88a55"/><rect x="${x + 6}" y="${y}" width="${w * 0.35}" height="12" fill="#a88a55"/><rect x="${x + w * 0.1}" y="${y + hh * 0.35}" width="${w * 0.5}" height="8" fill="#5a4426"/><rect x="${x + w * 0.62}" y="${y + 10}" width="${w * 0.3}" height="${hh * 0.3}" fill="${C.paper}" opacity="0.8"/></g>`;
    case "board": {
      let s = `<rect x="${x}" y="${y}" width="${w}" height="${hh}" fill="#8a6a45" stroke="#3a2a1a" stroke-width="10"/>`;
      for (let i = 0; i < 6; i++) s += `<rect x="${x + 30 + (i % 3) * (w / 3.2)}" y="${y + 30 + Math.floor(i / 3) * (hh / 2.2)}" width="${w / 5}" height="${hh / 3.4}" fill="${C.paper}" opacity="0.7" transform="rotate(${(i * 7) % 9 - 4} ${x + 60} ${y + 60})"/>`;
      s += `<path d="M${x + 60} ${y + 80} L${x + w * 0.6} ${y + hh * 0.6} L${x + w * 0.8} ${y + 70}" stroke="#b02a22" stroke-width="2.5" fill="none"/>`;
      return s;
    }
    case "labfolder":
      return `<g transform="rotate(4 ${cx} ${y + hh / 2})"><rect x="${x}" y="${y + 4}" width="${w}" height="${hh - 4}" fill="#6f8796"/><rect x="${x + 4}" y="${y}" width="${w * 0.4}" height="8" fill="#6f8796"/><rect x="${x + w * 0.15}" y="${y + hh * 0.35}" width="${w * 0.6}" height="${hh * 0.22}" fill="${C.paper}"/></g>`;
    case "diary":
      return `<rect x="${x}" y="${y + hh * 0.15}" width="${w}" height="${hh * 0.85}" fill="#4a1f1c"/><rect x="${x + w * 0.08}" y="${y + hh * 0.22}" width="${w * 0.84}" height="${hh * 0.7}" fill="${C.paper}"/><line x1="${cx}" y1="${y + hh * 0.22}" x2="${cx}" y2="${y + hh * 0.92}" stroke="#7a6a52" stroke-width="2"/>${[0, 1, 2].map((i) => `<line x1="${x + w * 0.14}" y1="${y + hh * (0.4 + i * 0.15)}" x2="${cx - 6}" y2="${y + hh * (0.4 + i * 0.15)}" stroke="#2a3f6b" stroke-width="2"/>`).join("")}`;
    case "hand":
      return "";
    case "phone":
      return `<rect x="${x}" y="${y + hh * 0.35}" width="${w}" height="${hh * 0.65}" rx="10" fill="#1b1b1b"/><path d="M${x - 4} ${y + hh * 0.35} Q${cx} ${y - 6} ${x + w + 4} ${y + hh * 0.35}" stroke="#1b1b1b" stroke-width="16" fill="none"/><circle cx="${cx}" cy="${y + hh * 0.68}" r="${w * 0.22}" fill="#3a3a3a" stroke="#777" stroke-width="2"/>`;
    case "notebook":
      return `<rect x="${x}" y="${y}" width="${w}" height="${hh}" fill="#3d2b1f" transform="rotate(4 ${cx} ${y + hh / 2})"/><rect x="${x + 4}" y="${y + 4}" width="${w - 8}" height="${hh - 8}" fill="${C.paperDim}" opacity="0.3" transform="rotate(4 ${cx} ${y + hh / 2})"/>`;
    case "map": {
      let s = `<rect x="${x}" y="${y}" width="${w}" height="${hh}" fill="#d9cfb2" stroke="#2a2a2a" stroke-width="6"/>`;
      for (let i = 1; i < 6; i++) s += `<line x1="${x + (w * i) / 6}" y1="${y}" x2="${x + (w * i) / 6 + 20}" y2="${b}" stroke="#9c8f6f" stroke-width="2"/><line x1="${x}" y1="${y + (hh * i) / 6}" x2="${x + w}" y2="${y + (hh * i) / 6 - 12}" stroke="#9c8f6f" stroke-width="2"/>`;
      s += `<path d="M${x + 20} ${b - 40} C${x + w * 0.3} ${y + 40} ${x + w * 0.6} ${b - 20} ${x + w - 20} ${y + 30}" stroke="#4f7fa0" stroke-width="5" fill="none"/>`;
      for (const [px, py] of [[0.3, 0.4], [0.55, 0.3], [0.7, 0.6], [0.4, 0.7]]) s += `<circle cx="${x + w * px}" cy="${y + hh * py}" r="6" fill="#b02a22"/>`;
      return s;
    }
    case "recorder":
      return `<rect x="${x}" y="${y + hh * 0.2}" width="${w}" height="${hh * 0.8}" rx="6" fill="#2a2a2a"/><rect x="${x + w * 0.1}" y="${y + hh * 0.3}" width="${w * 0.5}" height="${hh * 0.35}" fill="#555"/><circle cx="${x + w * 0.25}" cy="${y + hh * 0.47}" r="${hh * 0.1}" fill="#222"/><circle cx="${x + w * 0.45}" cy="${y + hh * 0.47}" r="${hh * 0.1}" fill="#222"/>${[0, 1, 2].map((i) => `<rect x="${x + w * 0.68 + i * w * 0.1}" y="${y + hh * 0.3}" width="${w * 0.07}" height="${hh * 0.2}" fill="#999"/>`).join("")}<rect x="${x + w + 8}" y="${y + hh * 0.4}" width="${w * 0.25}" height="${hh * 0.6}" fill="#3b2f25"/>`;
    case "envelope":
      return `<rect x="${x}" y="${y}" width="${w}" height="${hh}" fill="#d8c79c" transform="rotate(-6 ${cx} ${y})"/><path d="M${x} ${y} L${cx} ${y + hh * 0.6} L${x + w} ${y}" stroke="#a39065" stroke-width="3" fill="none" transform="rotate(-6 ${cx} ${y})"/>`;
    case "tray":
      return `<rect x="${x}" y="${y + hh * 0.35}" width="${w}" height="${hh * 0.65}" fill="none" stroke="#7a7466" stroke-width="4"/>${[0.25, 0.5, 0.75].map((f) => `<line x1="${x + w * f}" y1="${y + hh * 0.35}" x2="${x + w * f}" y2="${b}" stroke="#7a7466" stroke-width="2"/>`).join("")}<rect x="${x + 6}" y="${y + hh * 0.5}" width="${w - 12}" height="${hh * 0.12}" fill="#d9cfb2" opacity="0.5"/>`;
    case "typewriter":
      return `<path d="M${x} ${b} L${x + w * 0.1} ${y + hh * 0.35} L${x + w * 0.9} ${y + hh * 0.35} L${x + w} ${b} Z" fill="#232323"/><rect x="${x + w * 0.05}" y="${y + hh * 0.25}" width="${w * 0.9}" height="${hh * 0.12}" rx="8" fill="#111"/><rect x="${x + w * 0.25}" y="${y}" width="${w * 0.5}" height="${hh * 0.3}" fill="${C.paper}"/>${Array.from({ length: 12 }, (_, i) => `<circle cx="${x + w * 0.15 + (i % 6) * w * 0.14}" cy="${y + hh * 0.6 + Math.floor(i / 6) * hh * 0.15}" r="5" fill="#bbb"/>`).join("")}`;
    case "chair":
      return `<g transform="rotate(-78 ${cx} ${b - 20})"><rect x="${cx - w * 0.35}" y="${b - hh * 0.55}" width="${w * 0.7}" height="${hh * 0.08}" fill="#5a3b28"/><rect x="${cx - w * 0.35}" y="${b - hh * 1.05}" width="${w * 0.08}" height="${hh * 0.6}" fill="#4a3020"/><rect x="${cx + w * 0.27}" y="${b - hh * 1.05}" width="${w * 0.08}" height="${hh * 0.6}" fill="#4a3020"/><rect x="${cx - w * 0.35}" y="${b - hh * 1.05}" width="${w * 0.7}" height="${hh * 0.12}" fill="#5a3b28"/><rect x="${cx - w * 0.33}" y="${b - hh * 0.5}" width="${w * 0.06}" height="${hh * 0.45}" fill="#3a2418"/><rect x="${cx + w * 0.27}" y="${b - hh * 0.5}" width="${w * 0.06}" height="${hh * 0.45}" fill="#3a2418"/></g><path d="M${x - 40} ${b} q60 -18 120 0 t120 0" stroke="#000" stroke-opacity="0.25" stroke-width="6" fill="none"/>`;
    case "glass":
      return Array.from({ length: 9 }, (_, i) => `<path d="M${x + (i * w) / 9} ${b - 6 - (i % 3) * 8} l${8 + (i % 4) * 4} ${-10 - (i % 2) * 6} l6 14 z" fill="#d7e4ea" opacity="0.75"/>`).join("") + `<rect x="${x + w * 0.65}" y="${y}" width="${w * 0.32}" height="${hh * 0.6}" fill="#e6e1d0" opacity="0.8"/><rect x="${x + w * 0.7}" y="${y + 4}" width="${w * 0.12}" height="${hh * 0.2}" fill="#b02a22"/>`;
    case "desk":
      return `<rect x="${x}" y="${y + hh * 0.2}" width="${w}" height="${hh * 0.8 + 40}" fill="${C.wood}"/><path d="M${x} ${y + hh * 0.25} Q${cx} ${y - hh * 0.5} ${x + w} ${y + hh * 0.25}" fill="${C.woodDark}"/><rect x="${x + w * 0.15}" y="${y + hh * 0.35}" width="${w * 0.7}" height="${hh * 0.35}" fill="${C.paper}" opacity="0.85"/>${[0, 1, 2, 3].map((i) => `<line x1="${x + w * 0.2}" y1="${y + hh * (0.42 + i * 0.07)}" x2="${x + w * 0.8}" y2="${y + hh * (0.42 + i * 0.07)}" stroke="#6b5a40" stroke-width="2"/>`).join("")}`;
    case "drawer":
      return `<rect x="${x}" y="${y}" width="${w}" height="${hh}" fill="${C.woodDark}" stroke="#1a120c" stroke-width="3"/><rect x="${cx - 18}" y="${y + hh * 0.4}" width="36" height="8" rx="3" fill="${C.brass}"/>`;
    case "sideboard":
      return `<rect x="${x}" y="${y + hh * 0.35}" width="${w}" height="${hh * 0.65 + 60}" fill="${C.wood}"/><rect x="${x}" y="${y + hh * 0.35}" width="${w}" height="10" fill="${C.woodDark}"/><ellipse cx="${x + w * 0.25}" cy="${y + hh * 0.3}" rx="${w * 0.12}" ry="10" fill="#e8e3d6" opacity="0.8"/><rect x="${x + w * 0.24}" y="${y + hh * 0.3}" width="6" height="${hh * 0.06}" fill="#e8e3d6"/>${[0, 1, 2, 3, 4].map((i) => `<rect x="${x + w * 0.55 + i * 18}" y="${y + hh * 0.18}" width="12" height="${hh * 0.16}" fill="#cfe0e8" opacity="0.6"/>`).join("")}<rect x="${x + w * 0.55 + 5 * 18}" y="${y + hh * 0.18}" width="12" height="${hh * 0.16}" fill="none" stroke="#cfe0e8" stroke-opacity="0.25" stroke-dasharray="3 3"/>`;
    case "bottle":
      return `<rect x="${x + w * 0.25}" y="${y + hh * 0.35}" width="${w * 0.5}" height="${hh * 0.65}" rx="6" fill="#2c1418"/><rect x="${x + w * 0.4}" y="${y}" width="${w * 0.2}" height="${hh * 0.4}" fill="#2c1418"/><rect x="${x + w * 0.27}" y="${y + hh * 0.55}" width="${w * 0.46}" height="${hh * 0.2}" fill="${C.paper}" opacity="0.7"/>`;
    case "poker":
      return `<rect x="${x}" y="${y - 120}" width="${w * 3}" height="${hh + 120}" fill="#2a2420" transform="translate(${-w * 1.5} 0)"/><rect x="${x - w}" y="${y + hh * 0.5}" width="${w * 2}" height="${hh * 0.5}" fill="#120e0b"/><line x1="${cx}" y1="${y}" x2="${cx}" y2="${b}" stroke="#1a1a1a" stroke-width="8"/><line x1="${cx + 12}" y1="${y + 10}" x2="${cx + 12}" y2="${b}" stroke="#2a2a2a" stroke-width="6"/><circle cx="${cx}" cy="${y}" r="9" fill="${C.brass}"/>`;
    case "sofa":
      return `<rect x="${x}" y="${y + hh * 0.2}" width="${w}" height="${hh * 0.8}" rx="18" fill="#5b3b3a"/><rect x="${x + 10}" y="${y + hh * 0.45}" width="${w - 20}" height="${hh * 0.3}" fill="#6d4644"/><path d="M${x + w * 0.9} ${b + 40} l60 -10 l-10 40 l-70 6 z" fill="none" stroke="#e8e0cc" stroke-dasharray="10 8" stroke-width="3" opacity="0.6"/>`;
    case "door":
      return `<rect x="${x}" y="${y}" width="${w}" height="${hh}" fill="#3a2618" stroke="#160f09" stroke-width="6"/><rect x="${x + w * 0.15}" y="${y + hh * 0.08}" width="${w * 0.7}" height="${hh * 0.35}" fill="none" stroke="#160f09" stroke-width="3"/><rect x="${x + w * 0.15}" y="${y + hh * 0.5}" width="${w * 0.7}" height="${hh * 0.42}" fill="none" stroke="#160f09" stroke-width="3"/><circle cx="${x + w * 0.85}" cy="${y + hh * 0.5}" r="7" fill="${C.brass}"/>`;
    case "doorway":
      return `<rect x="${x}" y="${y}" width="${w}" height="${hh}" fill="#0b0c0c" opacity="0.9"/><rect x="${x}" y="${y}" width="${w}" height="${hh}" fill="url(#pool)" opacity="0.5"/><rect x="${x - 6}" y="${y - 6}" width="${w + 12}" height="${hh + 6}" fill="none" stroke="#1a1612" stroke-width="10"/>`;
    case "window":
      return `<rect x="${x}" y="${y}" width="${w}" height="${hh}" fill="#0f1a22"/><rect x="${x}" y="${y}" width="${w}" height="${hh}" fill="#26404f" opacity="0.6"/>${Array.from({ length: 12 }, (_, i) => `<line x1="${x}" y1="${y + (hh * i) / 12}" x2="${x + w}" y2="${y + (hh * i) / 12}" stroke="#7d8d93" stroke-opacity="0.35"/>`).join("")}<path d="M${x + w * 0.35} ${y + hh * 0.3} h${w * 0.25} v${hh * 0.3}" stroke="#d9e4e8" stroke-width="3" fill="none"/><rect x="${x - 8}" y="${y - 8}" width="${w + 16}" height="${hh + 16}" fill="none" stroke="#e6e0d0" stroke-width="10"/><rect x="${x - 30}" y="${b + 8}" width="${w + 60}" height="${80}" fill="#b6b2a4"/>`;
    case "backdoor":
      return `<rect x="${x}" y="${y}" width="${w}" height="${hh}" fill="#e2dcc8"/><rect x="${x + w * 0.12}" y="${y + hh * 0.08}" width="${w * 0.76}" height="${hh * 0.35}" fill="#2b4352"/><circle cx="${x + w * 0.82}" cy="${y + hh * 0.55}" r="8" fill="${C.brass}"/><rect x="${x + w * 0.76}" y="${y + hh * 0.46}" width="${w * 0.12}" height="12" fill="#9a8a6a"/>`;
    case "calendar":
      return `<rect x="${x}" y="${y}" width="${w}" height="${hh}" fill="${C.paper}"/><rect x="${x}" y="${y}" width="${w}" height="${hh * 0.3}" fill="#6d8f9a"/>${Array.from({ length: 20 }, (_, i) => `<rect x="${x + 6 + (i % 5) * (w - 12) / 5}" y="${y + hh * 0.36 + Math.floor(i / 5) * hh * 0.15}" width="${(w - 20) / 5}" height="${hh * 0.12}" fill="none" stroke="#999" stroke-width="1"/>`).join("")}`;
    case "wallphone":
      return `<rect x="${x}" y="${y}" width="${w}" height="${hh}" rx="6" fill="#d8ccb0"/><path d="M${cx} ${b} q-20 60 10 120" stroke="#d8ccb0" stroke-width="4" fill="none" stroke-dasharray="4 3"/>`;
    case "knives":
      return `<path d="M${x} ${b} L${x + w * 0.3} ${y + hh * 0.2} L${x + w} ${y + hh * 0.4} L${x + w * 0.8} ${b} Z" fill="#7a5532"/>${[0.35, 0.5, 0.65].map((p) => `<rect x="${x + w * p}" y="${y}" width="6" height="${hh * 0.3}" fill="#1a1a1a"/>`).join("")}`;
    case "rack":
      return `<rect x="${x}" y="${y + hh * 0.6}" width="${w}" height="${hh * 0.4}" fill="#c9c3b5"/>${Array.from({ length: 5 }, (_, i) => `<ellipse cx="${x + w * 0.15 + i * w * 0.17}" cy="${y + hh * 0.45}" rx="${w * 0.07}" ry="${hh * 0.45}" fill="#efeadd" stroke="#bbb"/>`).join("")}<rect x="${x - 60}" y="${b}" width="${w + 120}" height="160" fill="#c9c3b5" opacity="0.6"/>`;
    case "person":
      return person(cx, y, w, hh, l.id);
    case "schedule":
      return `<rect x="${x}" y="${y}" width="${w}" height="${hh}" fill="${C.paper}" transform="rotate(2 ${cx} ${y})"/>${Array.from({ length: 7 }, (_, i) => `<line x1="${x + 8}" y1="${y + 14 + i * (hh - 20) / 7}" x2="${x + w - 8}" y2="${y + 14 + i * (hh - 20) / 7}" stroke="#555" stroke-width="2"/>`).join("")}<circle cx="${cx}" cy="${y + 4}" r="5" fill="#b02a22"/>`;
    case "spike":
      return `<rect x="${x}" y="${y + hh * 0.7}" width="${w * 1.6}" height="${hh * 0.3 + 20}" fill="#9aa0a3" transform="translate(${-w * 0.3} 0)"/><line x1="${cx}" y1="${y}" x2="${cx}" y2="${b}" stroke="#aaa" stroke-width="3"/>${[0, 1, 2, 3].map((i) => `<rect x="${cx - 22}" y="${y + hh * 0.2 + i * 9}" width="44" height="7" fill="${C.paper}" transform="rotate(${i * 6 - 9} ${cx} ${y + hh * 0.3})"/>`).join("")}`;
    case "booth":
      return `<rect x="${x}" y="${y - hh * 0.6}" width="${w}" height="${hh * 0.6}" fill="#24323c"/><rect x="${x}" y="${y}" width="${w * 0.2}" height="${hh}" fill="#8c2d28"/><rect x="${x + w * 0.8}" y="${y}" width="${w * 0.2}" height="${hh}" fill="#8c2d28"/><rect x="${x + w * 0.2}" y="${y + hh * 0.35}" width="${w * 0.6}" height="14" fill="#cfc8b8"/><rect x="${cx - 5}" y="${y + hh * 0.35}" width="10" height="${hh * 0.65}" fill="#777"/>`;
    case "pie":
      return `<rect x="${x}" y="${y}" width="${w}" height="${hh}" fill="#d9e6ea" opacity="0.35" stroke="#bbb"/>${[0, 1, 2].map((i) => `<ellipse cx="${x + w * (0.2 + i * 0.3)}" cy="${y + hh * 0.6}" rx="${w * 0.12}" ry="${hh * 0.12}" fill="${["#9c2b2b", "#c58b4a", "#f1e6a8"][i]}"/>`).join("")}<rect x="${x - 200}" y="${b}" width="${w + 900}" height="60" fill="#8a8580"/>`;
    case "jukebox":
      return `<path d="M${x} ${b} L${x} ${y + hh * 0.3} Q${cx} ${y - hh * 0.2} ${x + w} ${y + hh * 0.3} L${x + w} ${b} Z" fill="#3b2b22"/><path d="M${x + 8} ${y + hh * 0.32} Q${cx} ${y - hh * 0.05} ${x + w - 8} ${y + hh * 0.32}" stroke="#ffb347" stroke-width="5" fill="none"/><rect x="${x + 10}" y="${y + hh * 0.45}" width="${w - 20}" height="${hh * 0.2}" fill="#d7c48c" opacity="0.7"/>`;
    case "coatrack":
    case "coatrack_empty": {
      let s = `<rect x="${cx - 4}" y="${y}" width="8" height="${hh}" fill="#2a1c13"/><rect x="${cx - 40}" y="${b - 6}" width="80" height="8" fill="#2a1c13"/>`;
      s += `<path d="M${cx - 30} ${y + 20} q-10 120 4 240 h30 q8 -120 0 -240 z" fill="#585e63"/><path d="M${cx + 4} ${y + 24} q10 110 -2 200 h28 q8 -110 -2 -200 z" fill="#1f2a44"/>`;
      if (h.kind === "coatrack") s += `<path d="M${cx + 10} ${y + 14} q20 100 4 190 h36 q14 -90 -4 -190 z" fill="#b39a6c"/><rect x="${cx + 18}" y="${y + 190}" width="24" height="12" fill="#6f5a3d"/>`;
      return s;
    }
    case "basket":
      return `<path d="M${x} ${y} h${w} l-6 ${hh} h${-w + 12} z" fill="#4b4f52"/>`;
    case "tin":
      return `<rect x="${x}" y="${y + hh * 0.3}" width="${w}" height="${hh * 0.7}" fill="#c9c9c9"/><rect x="${x + w * 0.4}" y="${y + hh * 0.45}" width="${w * 0.2}" height="${hh * 0.4}" fill="#b02a22"/><rect x="${x + w * 0.25}" y="${y + hh * 0.58}" width="${w * 0.5}" height="${hh * 0.14}" fill="#b02a22"/><rect x="${x - 300}" y="${b}" width="${w + 340}" height="40" fill="#8b847a" opacity="0.6"/>`;
    case "ashtray":
      return `<ellipse cx="${cx}" cy="${y + hh * 0.6}" rx="${w / 2}" ry="${hh * 0.35}" fill="#4f5a5e"/><ellipse cx="${cx}" cy="${y + hh * 0.55}" rx="${w * 0.35}" ry="${hh * 0.2}" fill="#2a2a2a"/><path d="M${cx - 10} ${y + hh * 0.45} l20 -6 l4 12 z" fill="${C.paper}"/>`;
    case "suitcase":
      return `<rect x="${x}" y="${y + hh * 0.2}" width="${w}" height="${hh * 0.8}" rx="8" fill="#5a3f2b"/><rect x="${cx - 20}" y="${y}" width="40" height="${hh * 0.25}" rx="6" fill="none" stroke="#2a1c13" stroke-width="6"/><rect x="${x + w * 0.65}" y="${y + hh * 0.05}" width="${w * 0.2}" height="${hh * 0.3}" fill="${C.paper}"/>`;
    case "frontwindow":
      return `<rect x="${x}" y="${y}" width="${w}" height="${hh}" fill="#121d27"/><rect x="${x + w * 0.55}" y="${y + hh * 0.45}" width="${w * 0.3}" height="${hh * 0.4}" fill="#3b3a33"/><circle cx="${x + w * 0.35}" cy="${y + hh * 0.35}" r="${w * 0.16}" fill="#3c2f5a" opacity="0.8"/><rect x="${x + w * 0.15}" y="${y + hh * 0.2}" width="4" height="${hh * 0.7}" fill="#888"/><circle cx="${x + w * 0.15}" cy="${y + hh * 0.2}" r="10" fill="${C.lamp}"/><rect x="${x}" y="${y}" width="${w}" height="${hh}" fill="#fff" opacity="0.08"/>${Array.from({ length: 14 }, (_, i) => `<circle cx="${x + (i * w) / 14}" cy="${y + 10}" r="8" fill="#f0eadb" opacity="0.4"/>`).join("")}<rect x="${x - 8}" y="${y - 8}" width="${w + 16}" height="${hh + 16}" fill="none" stroke="#efe6d4" stroke-width="10"/>`;
    case "tv":
      return `<rect x="${x}" y="${y}" width="${w}" height="${hh}" fill="#5a3c25"/><rect x="${x + w * 0.08}" y="${y + hh * 0.12}" width="${w * 0.55}" height="${hh * 0.7}" rx="14" fill="#1d2326"/><rect x="${x + w * 0.72}" y="${y + hh * 0.15}" width="${w * 0.2}" height="${hh * 0.6}" fill="#3a2818"/><circle cx="${x + w * 0.82}" cy="${y + hh * 0.3}" r="7" fill="#888"/>`;
    case "photo":
      return `<rect x="${x}" y="${y}" width="${w}" height="${hh}" fill="${C.brass}"/><rect x="${x + 6}" y="${y + 6}" width="${w - 12}" height="${hh - 12}" fill="#7d7a70"/><circle cx="${x + w * 0.35}" cy="${y + hh * 0.45}" r="${w * 0.1}" fill="#4a4740"/><circle cx="${x + w * 0.62}" cy="${y + hh * 0.45}" r="${w * 0.1}" fill="#4a4740"/>`;
    case "cat":
      return `<ellipse cx="${cx}" cy="${y + hh * 0.6}" rx="${w * 0.5}" ry="${hh * 0.35}" fill="#c27a3a"/><circle cx="${x + w * 0.85}" cy="${y + hh * 0.4}" r="${hh * 0.22}" fill="#c27a3a"/><path d="M${x + w * 0.8} ${y + hh * 0.2} l6 -14 l6 14 M${x + w * 0.9} ${y + hh * 0.22} l6 -12 l4 14" fill="#c27a3a"/>`;
    case "lift":
      return `<rect x="${x + w * 0.1}" y="${b}" width="14" height="${H - b}" fill="#c9a227"/><rect x="${x + w * 0.85}" y="${b}" width="14" height="${H - b}" fill="#c9a227"/><path d="M${x} ${y + hh * 0.5} q${w * 0.05} -${hh * 0.45} ${w * 0.3} -${hh * 0.45} h${w * 0.35} q${w * 0.15} 0 ${w * 0.35} ${hh * 0.45} v${hh * 0.3} h-${w} z" fill="#6b7f8a"/><circle cx="${x + w * 0.2}" cy="${y + hh * 0.85}" r="${hh * 0.15}" fill="#151515"/><circle cx="${x + w * 0.8}" cy="${y + hh * 0.85}" r="${hh * 0.15}" fill="#151515"/>`;
    case "orders":
      return `<rect x="${x}" y="${y}" width="${w}" height="${hh}" fill="#5a4a36"/>${Array.from({ length: 6 }, (_, i) => `<rect x="${x + 8 + (i % 2) * w * 0.45}" y="${y + 10 + Math.floor(i / 2) * hh * 0.3}" width="${w * 0.4}" height="${hh * 0.25}" fill="#f2e7c9" transform="rotate(${(i % 3) * 3 - 3} ${cx} ${y})"/>`).join("")}`;
    case "bench":
      return `<rect x="${x}" y="${y + hh * 0.3}" width="${w}" height="${hh * 0.15}" fill="#5b4430"/><rect x="${x + 10}" y="${y + hh * 0.45}" width="12" height="${hh * 0.55 + 100}" fill="#3a2a1c"/><rect x="${x + w - 22}" y="${y + hh * 0.45}" width="12" height="${hh * 0.55 + 100}" fill="#3a2a1c"/><rect x="${x}" y="${y - hh * 0.9}" width="${w}" height="${hh * 1.1}" fill="#4d5a4d" opacity="0.7"/>${Array.from({ length: 8 }, (_, i) => `<rect x="${x + 20 + i * (w - 40) / 8}" y="${y - hh * 0.6}" width="6" height="${hh * 0.5}" fill="#aaa"/>`).join("")}<rect x="${x + w * 0.6}" y="${y + hh * 0.05}" width="${w * 0.2}" height="${hh * 0.25}" rx="4" fill="#2a2a2a"/>`;
    case "filing":
      return Array.from({ length: 4 }, (_, i) => `<rect x="${x}" y="${y + (i * hh) / 4}" width="${w}" height="${hh / 4 - 4}" fill="#7d8478"/><rect x="${cx - 18}" y="${y + (i * hh) / 4 + 14}" width="36" height="8" fill="#c8c8c0"/>`).join("");
    case "adder":
      return `<rect x="${x}" y="${y + hh * 0.3}" width="${w}" height="${hh * 0.7}" rx="6" fill="#d8d3c4"/><rect x="${x + w * 0.4}" y="${y - hh * 0.6}" width="${w * 0.2}" height="${hh * 0.9}" fill="#f6f2e4"/>${Array.from({ length: 12 }, (_, i) => `<circle cx="${x + w * 0.15 + (i % 4) * w * 0.2}" cy="${y + hh * 0.5 + Math.floor(i / 4) * hh * 0.15}" r="5" fill="#555"/>`).join("")}`;
    case "notices":
      return `<rect x="${x}" y="${y}" width="${w}" height="${hh}" fill="#7c6a4a"/>${[0, 1, 2].map((i) => `<rect x="${x + 10 + i * w * 0.28}" y="${y + 12 + (i % 2) * 20}" width="${w * 0.24}" height="${hh * 0.6}" fill="${C.paper}"/>`).join("")}`;
    default:
      return `<rect x="${x}" y="${y}" width="${w}" height="${hh}" fill="#888" opacity="0.4"/>`;
  }
}

const PEOPLE: Record<string, { coat: string; hair: string; skin: string }> = {
  diner: { coat: "#e9e3d3", hair: "#2b1b14", skin: "#c69673" },
  daniel_apartment: { coat: "#2f3a52", hair: "#3a2a1f", skin: "#d6b08f" },
  margaret_house: { coat: "#6c4f6e", hair: "#cfc9c0", skin: "#e2c1a6" },
  robert_garage: { coat: "#3c5a6e", hair: "#5a4632", skin: "#b88762" },
  patricia_office: { coat: "#7a3b3b", hair: "#1e1714", skin: "#8d5e43" },
};

function person(cx: number, y: number, w: number, h: number, loc: string) {
  const p = PEOPLE[loc] ?? PEOPLE.diner;
  const head = w * 0.28;
  return `<g><ellipse cx="${cx}" cy="${y + h}" rx="${w * 0.6}" ry="14" fill="#000" opacity="0.3"/>
  <path d="M${cx - w * 0.45} ${y + h} L${cx - w * 0.42} ${y + head * 2.6} Q${cx} ${y + head * 2} ${cx + w * 0.42} ${y + head * 2.6} L${cx + w * 0.45} ${y + h} Z" fill="${p.coat}"/>
  <rect x="${cx - head * 0.35}" y="${y + head * 1.7}" width="${head * 0.7}" height="${head * 0.6}" fill="${p.skin}"/>
  <ellipse cx="${cx}" cy="${y + head * 1.2}" rx="${head * 0.75}" ry="${head * 0.9}" fill="${p.skin}"/>
  <path d="M${cx - head * 0.8} ${y + head * 1.1} Q${cx - head * 0.7} ${y + head * 0.1} ${cx} ${y + head * 0.2} Q${cx + head * 0.8} ${y + head * 0.1} ${cx + head * 0.8} ${y + head * 1.1} Q${cx} ${y + head * 0.55} ${cx - head * 0.8} ${y + head * 1.1}" fill="${p.hair}"/>
  ${loc === "daniel_apartment" ? `<rect x="${cx + w * 0.3}" y="${y + h * 0.55}" width="${w * 0.18}" height="${w * 0.14}" rx="4" fill="#f2efe6"/>` : ""}
  </g>`;
}

function scene(l: LocationDef, state: string) {
  let body = backdrop(l, state);
  const hs = l.hotspots.filter((h) => {
    if (h.sprite) return false; // event objects are drawn over the scene at runtime
    const v = h.visible as { env?: string; is?: string; flag?: string } | undefined;
    if (!v) return true;
    if (v.env) return v.is === state;
    return true; // flag-gated objects are drawn; they simply are not clickable until relevant
  });
  // Draw people last so they stand in front of furniture.
  const sorted = [...hs].sort((a, b) => (a.kind === "person" ? 1 : 0) - (b.kind === "person" ? 1 : 0));
  for (const h of sorted) body += obj(h, l, state);
  body += `<rect width="${W}" height="${H}" fill="url(#pool)"/><rect width="${W}" height="${H}" fill="url(#vig)"/><rect width="${W}" height="${H}" filter="url(#grain)"/>`;
  body += `<text x="${W - 24}" y="${H - 20}" text-anchor="end" font-family="Courier New, monospace" font-size="16" fill="#fff" opacity="0.35">PLACEHOLDER ART ${esc(def.id)}</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${body}</svg>`;
}

// ---------------------------------------------------------------------------
// Portraits and evidence
// ---------------------------------------------------------------------------

const PORTRAIT: Record<string, { coat: string; hair: string; skin: string; bg: string }> = {
  eleanor: { coat: "#3f4f5f", hair: "#d8d2c8", skin: "#e5c6ae", bg: "#3a3d40" },
  margaret: { coat: "#6c4f6e", hair: "#cfc9c0", skin: "#e2c1a6", bg: "#3d3a36" },
  daniel: { coat: "#2f3a52", hair: "#3a2a1f", skin: "#d6b08f", bg: "#2f363b" },
  robert: { coat: "#3c5a6e", hair: "#5a4632", skin: "#b88762", bg: "#383c3a" },
  patricia: { coat: "#7a3b3b", hair: "#1e1714", skin: "#8d5e43", bg: "#3a3638" },
  bennett: { coat: "#5c5244", hair: "#55504a", skin: "#c99a78", bg: "#34383b" },
  rosa: { coat: "#e9e3d3", hair: "#2b1b14", skin: "#c69673", bg: "#4a2e2c" },
};

function portrait(id: string, name: string) {
  const p = PORTRAIT[id] ?? PORTRAIT.daniel;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 750" width="600" height="750">
  <defs><radialGradient id="l" cx="0.4" cy="0.3" r="0.8"><stop offset="0" stop-color="#fff" stop-opacity="0.18"/><stop offset="1" stop-color="#000" stop-opacity="0.4"/></radialGradient>
  <filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2"/><feColorMatrix values="0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 0.16 0"/></filter></defs>
  <rect width="600" height="750" fill="${p.bg}"/>
  <path d="M90 750 L110 520 Q300 430 490 520 L510 750 Z" fill="${p.coat}"/>
  <path d="M250 470 L300 560 L350 470 Z" fill="#eee" opacity="0.6"/>
  <rect x="255" y="380" width="90" height="100" fill="${p.skin}"/>
  <ellipse cx="300" cy="300" rx="115" ry="140" fill="${p.skin}"/>
  <path d="M180 300 Q190 140 300 150 Q420 140 420 300 Q300 210 180 300" fill="${p.hair}"/>
  <rect width="600" height="750" fill="url(#l)"/><rect width="600" height="750" filter="url(#g)"/>
  <rect x="0" y="660" width="600" height="90" fill="#111" opacity="0.75"/>
  <text x="300" y="715" text-anchor="middle" font-family="Georgia, serif" font-size="34" fill="#f3ede3">${esc(name)}</text>
  <text x="590" y="24" text-anchor="end" font-family="Courier New, monospace" font-size="14" fill="#fff" opacity="0.4">PLACEHOLDER</text>
  </svg>`;
}

function wrapLines(text: string, max: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    if ((line + " " + w).trim().length > max) {
      lines.push(line.trim());
      line = w;
    } else line += " " + w;
  }
  if (line.trim()) lines.push(line.trim());
  return lines;
}

const DOCS = new Set(["E03", "E04", "E09", "E11", "E12", "E13", "E15"]);

function evidenceArt(e: CaseDefinition["evidence"][number]) {
  const W2 = 1200;
  const H2 = 900;
  let body = `<rect width="${W2}" height="${H2}" fill="#1f2326"/>`;
  if (DOCS.has(e.id)) {
    // Placeholder layout only: structure of the document, no invented content.
    const handwritten = ["E03", "E04", "E09", "E12"].includes(e.id);
    body += `<rect x="200" y="60" width="800" height="780" fill="${e.id === "E04" || e.id === "E13" ? "#efe9d6" : C.paper}"/>`;
    if (e.id === "E15") body += `<path d="M1000 60 L1000 840 L960 800 L985 740 L950 680 L990 620 L955 560 L995 500 L960 440 L990 380 L955 320 L990 260 L960 200 L995 140 L965 60 Z" fill="#1f2326"/>`;
    if (handwritten) for (let y = 150; y < 820; y += 34) body += `<line x1="230" y1="${y}" x2="970" y2="${y}" stroke="#8fb0c7" stroke-width="1.5" opacity="0.6"/>`;
    body += `<text x="240" y="120" font-family="Courier New, monospace" font-size="26" font-weight="bold" fill="#2a241c">${esc(e.title.toUpperCase())}</text>`;
    for (let k = 0; k < 13; k++) {
      const yy = 180 + k * 46;
      const wLine = 200 + ((k * 137) % 460);
      body += handwritten
        ? `<path d="M240 ${yy} q ${wLine / 4} -10 ${wLine / 2} 0 t ${wLine / 2} 0" stroke="#2f3f6a" stroke-width="3" fill="none" opacity="0.55"/>`
        : `<rect x="240" y="${yy - 14}" width="${wLine}" height="14" fill="#2f2a22" opacity="0.25"/>`;
    }
    body += `<g transform="rotate(-12 600 470)"><rect x="330" y="420" width="540" height="100" fill="none" stroke="#7d3a33" stroke-width="6" opacity="0.75"/><text x="600" y="485" text-anchor="middle" font-family="Courier New, monospace" font-size="38" font-weight="bold" fill="#7d3a33" opacity="0.75">TEXT PENDING</text></g>`;
  } else {
    body += `<ellipse cx="600" cy="470" rx="420" ry="300" fill="#2c3236"/>`;
    body += physical(e.id);
  }
  body += `<rect x="40" y="${H2 - 110}" width="300" height="70" fill="#d9cfb8"/><text x="60" y="${H2 - 64}" font-family="Courier New, monospace" font-size="28" font-weight="bold" fill="#2a241c">${e.id}</text><text x="140" y="${H2 - 64}" font-family="Courier New, monospace" font-size="18" fill="#2a241c">C001 EVIDENCE</text>`;
  body += `<text x="${W2 - 20}" y="30" text-anchor="end" font-family="Courier New, monospace" font-size="16" fill="#fff" opacity="0.35">PLACEHOLDER</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W2} ${H2}" width="${W2}" height="${H2}">${body}</svg>`;
}

function physical(id: string) {
  switch (id) {
    case "E01":
      return `<rect x="300" y="200" width="600" height="500" fill="#3b4a52"/>${Array.from({ length: 40 }, (_, i) => `<line x1="300" y1="${200 + i * 12.5}" x2="900" y2="${200 + i * 12.5}" stroke="#9aa8ae" stroke-width="1.5"/><line x1="${300 + i * 15}" y1="200" x2="${300 + i * 15}" y2="700" stroke="#9aa8ae" stroke-width="1.5"/>`).join("")}<path d="M520 330 L520 520 L700 520" stroke="#1f2326" stroke-width="18" fill="none"/><path d="M528 330 L548 520 L700 540" stroke="#cdd6da" stroke-width="3" fill="none"/><rect x="290" y="190" width="620" height="520" fill="none" stroke="#c9c7bd" stroke-width="16"/>`;
    case "E02":
      return `<rect x="380" y="260" width="440" height="420" fill="#e6e1d0" opacity="0.5"/><path d="M450 600 L560 330 L640 360 L700 610 Z" fill="#d7e4ea" opacity="0.85"/><path d="M560 330 L590 345 L620 600 L600 610 Z" fill="#6e1f1a" opacity="0.8"/><text x="420" y="300" font-family="Courier New" font-size="22" fill="#2a241c">LAPD ITEM 7</text>`;
    case "E05":
      return `<path d="M330 260 L500 220 Q600 260 700 220 L870 260 L930 640 L840 650 L820 420 L820 700 L380 700 L380 420 L360 650 L270 640 Z" fill="#b39a6c"/><path d="M840 600 L930 600 L935 650 L842 655 Z" fill="#5a3426"/><rect x="590" y="240" width="20" height="460" fill="#8a744f"/>`;
    case "E06":
      return `<path d="M380 700 L520 300 L860 380 L800 700 Z" fill="#7a5532"/>${[0, 1, 2, 3].map((i) => `<rect x="${540 + i * 70}" y="${250 + i * 18}" width="22" height="${110 - i * 12}" fill="#1a1a1a"/><rect x="${545 + i * 70}" y="${330 + i * 18}" width="12" height="40" fill="#0d0b09"/>`).join("")}<rect x="460" y="330" width="60" height="22" fill="#0d0b09" transform="rotate(16 490 340)"/><rect x="820" y="520" width="150" height="80" fill="#e6e1d0" transform="rotate(6 895 560)"/><text x="835" y="565" font-family="Courier New" font-size="18" fill="#2a241c" transform="rotate(6 895 560)">LAPD TAG</text>`;
    case "E07":
      return `<g transform="rotate(-80 600 500)"><rect x="440" y="300" width="300" height="34" fill="#5a3b28"/><rect x="440" y="100" width="34" height="240" fill="#4a3020"/><rect x="706" y="100" width="34" height="240" fill="#4a3020"/><rect x="440" y="100" width="300" height="44" fill="#5a3b28"/><rect x="450" y="334" width="26" height="200" fill="#3a2418"/><rect x="706" y="334" width="26" height="200" fill="#3a2418" transform="rotate(12 719 334)"/></g>`;
    case "E08":
      return `<rect x="250" y="300" width="700" height="380" fill="#3a2618"/>${[0, 1, 2, 3, 5, 6].map((i) => `<rect x="${290 + i * 95}" y="240" width="80" height="420" fill="#b8a36e"/><rect x="${290 + i * 95}" y="230" width="50" height="22" fill="#e8dcc4"/>`).join("")}<rect x="${290 + 4 * 95}" y="240" width="80" height="20" fill="#b8a36e" opacity="0.5"/><rect x="${290 + 4 * 95}" y="210" width="80" height="34" fill="#e8dcc4"/><text x="${296 + 4 * 95}" y="234" font-family="Georgia" font-style="italic" font-size="12" fill="#2a241c">Estate: Mercer</text>`;
    case "E10":
      return `<rect x="380" y="150" width="440" height="620" fill="#e2dcc8"/><rect x="560" y="400" width="200" height="90" rx="10" fill="#9a8a6a"/><rect x="580" y="430" width="120" height="30" fill="#6b5d43"/><circle cx="720" cy="445" r="22" fill="${C.brass}"/><rect x="820" y="150" width="30" height="620" fill="#c9c2ad"/>`;
    case "E14":
      return `<path d="M420 760 L470 430 Q480 330 560 300 L700 300 Q760 320 770 400 L760 760 Z" fill="#d6b08f"/><path d="M455 520 Q600 470 770 510 L765 640 Q600 610 445 650 Z" fill="#f2efe6"/><path d="M470 560 Q600 520 760 555" stroke="#d8d2c2" stroke-width="4" fill="none"/>`;
    default:
      return "";
  }
}

// ---------------------------------------------------------------------------

function write(rel: string, svg: string) {
  const p = join(out, rel);
  mkdirSync(join(p, ".."), { recursive: true });
  writeFileSync(p, svg);
}

for (const l of def.locations) {
  if (typeof l.background === "string") {
    write(def.assets.images[l.background].replace(`/cases/${caseId}/`, ""), scene(l, "A"));
  } else {
    for (const [state, key] of Object.entries(l.background.states)) {
      write(def.assets.images[key].replace(`/cases/${caseId}/`, ""), scene(l, state));
    }
  }
}
for (const c of def.characters) write(def.assets.images[c.portrait].replace(`/cases/${caseId}/`, ""), portrait(c.id, c.name));
// Event objects, drawn over the scene when their condition holds.
const OBJECTS: Record<string, string> = {
  envelope_sealed: `<rect x="10" y="22" width="180" height="120" rx="3" fill="#cdb27a" transform="rotate(-5 100 82)"/><path d="M14 26 L100 92 L186 26" stroke="#9c834f" stroke-width="4" fill="none" transform="rotate(-5 100 82)"/><circle cx="100" cy="92" r="11" fill="#8a2f28" transform="rotate(-5 100 82)"/><rect x="34" y="106" width="80" height="6" fill="#3b3326" opacity="0.6" transform="rotate(-5 100 82)"/>`,
  envelope_open: `<rect x="10" y="40" width="180" height="110" rx="3" fill="#cdb27a" transform="rotate(-5 100 95)"/><path d="M10 40 L100 4 L190 40" fill="#bfa36a" transform="rotate(-5 100 95)"/><rect x="40" y="20" width="110" height="70" fill="#efe7d4" transform="rotate(-9 95 55)"/><rect x="52" y="34" width="70" height="4" fill="#666" transform="rotate(-9 95 55)"/><rect x="52" y="46" width="85" height="4" fill="#666" transform="rotate(-9 95 55)"/>`,
  evidence_bag: `<path d="M30 30 L170 30 L162 190 L38 190 Z" fill="#9b7b52"/><rect x="30" y="22" width="140" height="18" fill="#8b6c45"/><rect x="30" y="26" width="140" height="8" fill="#a5281f"/><rect x="62" y="80" width="76" height="52" fill="#efe7d4"/><rect x="70" y="92" width="58" height="5" fill="#333"/><rect x="70" y="104" width="44" height="5" fill="#333"/><text x="100" y="124" text-anchor="middle" font-family="Courier New, monospace" font-size="11" fill="#a5281f">LAPD</text>`,
  evidence_bag_open: `<path d="M30 40 L170 40 L162 190 L38 190 Z" fill="#9b7b52"/><path d="M30 40 L60 18 L150 14 L170 40 Z" fill="#7d6040"/><rect x="62" y="80" width="76" height="52" fill="#efe7d4"/><rect x="70" y="92" width="58" height="5" fill="#333"/><rect x="70" y="104" width="44" height="5" fill="#333"/><rect x="40" y="44" width="120" height="30" fill="#b39a6c" opacity="0.9"/>`,
};
for (const [k, body] of Object.entries(OBJECTS)) {
  const key = `obj.${k}`;
  if (def.assets.images[key]) write(def.assets.images[key].replace(`/cases/${caseId}/`, ""), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">${body}</svg>`);
}
for (const e of def.evidence) write(def.assets.images[e.image].replace(`/cases/${caseId}/`, ""), evidenceArt(e));
mkdirSync(join(out, "audio"), { recursive: true });
writeFileSync(
  join(out, "audio", "README.txt"),
  "Drop recordings here (mp3 or ogg) and set their URLs in src/cases/" + caseId + "/assets.ts.\nUntil an entry is set, the game shows transcripts only and no play control.\n",
);
console.log(`Placeholder art written to ${out}`);
