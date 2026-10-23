import type { NextRequest } from "next/server";
import sharp from "sharp";

/**
 * A photograph the investigator took: GET /api/photo?bg=/art/scene.webp&r=x,y,w,h[&s=/art/object.webp]
 * Crops the scene painting around the subject (x, y, w, h are percentages of
 * the 16:9 scene) and lays the painted object back over it, as it stood when
 * the photo was taken. Only the site's own artwork can be used.
 */
const SAFE = /^\/(art|cases)\/[A-Za-z0-9_./-]+\.(webp|png|jpg|jpeg|svg)$/;

export async function GET(request: NextRequest) {
  const p = request.nextUrl.searchParams;
  const bg = p.get("bg") ?? "";
  const sprite = p.get("s");
  const r = (p.get("r") ?? "").split(",").map(Number);
  if (!SAFE.test(bg) || bg.includes("..") || (sprite && (!SAFE.test(sprite) || sprite.includes(".."))) || r.length !== 4 || r.some((n) => !Number.isFinite(n)))
    return new Response("Bad photo.", { status: 400 });

  const load = async (path: string) => {
    const res = await fetch(new URL(path, request.nextUrl.origin));
    if (!res.ok) throw new Error(`${path}: ${res.status}`);
    return Buffer.from(await res.arrayBuffer());
  };

  try {
    const W = 1920;
    const H = 1080;
    const scene = await sharp(await load(bg), { density: 144 }).resize(W, H, { fit: "fill" }).toBuffer();
    const [x, y, w, h] = r;
    const box = { left: Math.round((x / 100) * W), top: Math.round((y / 100) * H), width: Math.max(8, Math.round((w / 100) * W)), height: Math.max(8, Math.round((h / 100) * H)) };

    let composed = sharp(scene);
    if (sprite) {
      // The object is drawn the way the scene draws it: contained in its box, centered.
      const obj = await sharp(await load(sprite)).resize(box.width, box.height, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
      composed = sharp(await composed.composite([{ input: obj, left: box.left, top: box.top }]).toBuffer());
    }

    // Frame the subject with some of the room around it, as a photograph would, in a square-ish 4:3 frame.
    const cx = box.left + box.width / 2;
    const cy = box.top + box.height / 2;
    let fw = Math.max(box.width * 1.6, box.height * 1.6 * (4 / 3), 360);
    let fh = fw * (3 / 4);
    fw = Math.min(fw, W);
    fh = Math.min(fh, H);
    const left = Math.round(Math.min(Math.max(0, cx - fw / 2), W - fw));
    const top = Math.round(Math.min(Math.max(0, cy - fh / 2), H - fh));
    const out = await sharp(await composed.toBuffer())
      .extract({ left, top, width: Math.round(fw), height: Math.round(fh) })
      .resize(1024, 768, { fit: "cover" })
      // A slightly faded, warm print.
      .modulate({ saturation: 0.82, brightness: 1.03 })
      .tint({ r: 255, g: 240, b: 220 })
      .jpeg({ quality: 82 })
      .toBuffer();
    return new Response(new Uint8Array(out), { headers: { "Content-Type": "image/jpeg", "Cache-Control": "public, max-age=31536000, immutable" } });
  } catch (e) {
    console.error("photo", e);
    return new Response("The photograph could not be developed.", { status: 502 });
  }
}
