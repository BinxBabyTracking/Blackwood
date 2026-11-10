import * as THREE from "three";

/*
 * The murder board as it hangs in the room: what the player has pinned and
 * strung, drawn onto a canvas laid over the board model's cork. It follows the
 * board as it changes, so a glance across the office shows the case so far.
 * The board itself (dragging, stringing) still opens when you use it.
 */

export type LiveBoardCard = { id: string; x: number; y: number; title: string; image: string; person: boolean };
export type LiveBoard = { items: LiveBoardCard[]; connections: [string, string][] };

/** Board units: 100 across and down is the board's first page (1600 by 1000 board pixels), as in the full-screen board. */
const PAGE_W = 1600;
const PAGE_H = 1000;
const CARD_W = 150;
const tilt = (id: string) => (((id.charCodeAt(id.length - 1) % 7) - 3) * 0.8 * Math.PI) / 180;

/** A stable key for what the board shows, so it is only redrawn when something changes. */
export const liveBoardKey = (b: LiveBoard | undefined) =>
  b ? `${b.items.map((i) => `${i.id}@${i.x.toFixed(1)},${i.y.toFixed(1)}`).join(";")}|${b.connections.map((c) => c.join("-")).join(";")}` : "";

export function makeLiveBoard(width: number, height: number) {
  const W = 2048;
  const H = Math.max(256, Math.round((W * height) / width));
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  const material = new THREE.MeshStandardMaterial({ map: texture, transparent: true, roughness: 0.85, metalness: 0, depthWrite: false });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
  mesh.receiveShadow = true;
  mesh.renderOrder = 1;

  const images = new Map<string, HTMLImageElement>();
  let current: LiveBoard = { items: [], connections: [] };

  const image = (src: string) => {
    if (!src) return null;
    let im = images.get(src);
    if (!im) {
      im = new Image();
      im.crossOrigin = "anonymous";
      im.onload = () => draw(current);
      im.src = src;
      images.set(src, im);
    }
    return im.complete && im.naturalWidth ? im : null;
  };

  function draw(board: LiveBoard) {
    current = board;
    ctx.clearRect(0, 0, W, H);
    const items = board.items;
    if (!items.length) {
      texture.needsUpdate = true;
      return;
    }
    // Frame what's pinned, in board pixels, and fit it to the cork (never so close that one card fills it).
    const cardH = (p: boolean) => CARD_W * (p ? 1.25 : 0.75) + 44;
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const it of items) {
      const x = (it.x / 100) * PAGE_W;
      const y = (it.y / 100) * PAGE_H;
      x0 = Math.min(x0, x);
      y0 = Math.min(y0, y);
      x1 = Math.max(x1, x + CARD_W);
      y1 = Math.max(y1, y + cardH(it.person));
    }
    const pad = 60;
    x0 -= pad; y0 -= pad; x1 += pad; y1 += pad;
    const s = Math.min(W / (x1 - x0), H / (y1 - y0), W / (CARD_W * 5));
    const ox = (W - (x1 - x0) * s) / 2 - x0 * s;
    const oy = (H - (y1 - y0) * s) / 2 - y0 * s;
    const P = (bx: number, by: number) => [ox + bx * s, oy + by * s] as const;
    const pin = (id: string) => {
      const it = items.find((i) => i.id === id)!;
      return P((it.x / 100) * PAGE_W + CARD_W / 2, (it.y / 100) * PAGE_H + 7);
    };
    const onBoard = new Set(items.map((i) => i.id));

    // Cards first, string over them, pins on top, as on the full board.
    for (const it of items) {
      const [cx, cy] = P((it.x / 100) * PAGE_W, (it.y / 100) * PAGE_H);
      const w = CARD_W * s;
      const m = 0.06 * w;
      const ph = (w - m * 2) * (it.person ? 1.25 : 0.75);
      const h = cardH(it.person) * s;
      ctx.save();
      ctx.translate(cx + w / 2, cy);
      ctx.rotate(tilt(it.id));
      ctx.translate(-w / 2, 0);
      ctx.shadowColor = "rgba(0,0,0,0.45)";
      ctx.shadowBlur = 10 * s;
      ctx.shadowOffsetY = 6 * s;
      ctx.fillStyle = "#f0e6cf";
      ctx.fillRect(0, 0, w, h);
      ctx.shadowColor = "transparent";
      const im = image(it.image);
      if (im) {
        // Cover the photo area, cropping the long side.
        const pw = w - m * 2;
        const r = Math.max(pw / im.naturalWidth, ph / im.naturalHeight);
        const sw = pw / r;
        const sh = ph / r;
        ctx.drawImage(im, (im.naturalWidth - sw) / 2, (im.naturalHeight - sh) / 2, sw, sh, m, m, pw, ph);
      } else {
        ctx.fillStyle = "#d8ccb0";
        ctx.fillRect(m, m, w - m * 2, ph);
      }
      ctx.fillStyle = "#231e17";
      const fs = Math.max(10, 15 * s);
      ctx.font = `600 ${fs}px Georgia, serif`;
      ctx.textBaseline = "top";
      const words = it.title.split(/\s+/);
      let line = "";
      let ly = m + ph + 6 * s;
      let lines = 0;
      for (const word of words) {
        const t = line ? `${line} ${word}` : word;
        if (ctx.measureText(t).width > w - m * 2 && line) {
          ctx.fillText(line, m, ly);
          ly += fs * 1.15;
          line = word;
          if (++lines === 1) {
            // Two lines at most: the rest is cut short.
            const rest = words.slice(words.indexOf(word)).join(" ");
            let tail = rest;
            while (tail && ctx.measureText(`${tail}...`).width > w - m * 2) tail = tail.slice(0, -1);
            line = tail === rest ? rest : `${tail.trimEnd()}...`;
            break;
          }
        } else line = t;
      }
      if (line) ctx.fillText(line, m, ly);
      ctx.restore();
    }

    for (const [a, b] of board.connections) {
      if (!onBoard.has(a) || !onBoard.has(b)) continue;
      const [px, py] = pin(a);
      const [qx, qy] = pin(b);
      const len = Math.hypot(qx - px, qy - py);
      const mx = (px + qx) / 2;
      const my = (py + qy) / 2 + Math.min(60 * s, len * 0.08);
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(px + 3 * s, py + 6 * s);
      ctx.quadraticCurveTo(mx + 3 * s, my + 6 * s, qx + 3 * s, qy + 6 * s);
      ctx.strokeStyle = "rgba(0,0,0,0.35)";
      ctx.lineWidth = Math.max(2, 4 * s);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.quadraticCurveTo(mx, my, qx, qy);
      ctx.strokeStyle = "#9e1b14";
      ctx.lineWidth = Math.max(2, 4 * s);
      ctx.stroke();
    }

    for (const it of items) {
      const [x, y] = pin(it.id);
      const r = Math.max(4, 9 * s);
      const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
      g.addColorStop(0, "#ff8a7a");
      g.addColorStop(0.45, "#c2271c");
      g.addColorStop(1, "#5e0d08");
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
    }
    texture.needsUpdate = true;
  }

  return { mesh, draw, dispose: () => (texture.dispose(), material.dispose(), mesh.geometry.dispose()) };
}
