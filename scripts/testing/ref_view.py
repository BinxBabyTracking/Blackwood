# Testing Zone tool: renders a reference view for a piece of furniture, from the player's eye, looking at the spot
# where it goes, with a red wireframe box of its real size. Writes the image and a JSON of the camera and box so the
# returned art can be fitted to the box. usage: ref_view.py panorama.webp eye out_basename x0 x1 z0 z1 height
import sys, json, numpy as np
from PIL import Image, ImageDraw, ImageEnhance
pano, eye, out = sys.argv[1], float(sys.argv[2]), sys.argv[3]
x0, x1, z0, z1, hgt = map(float, sys.argv[4:9])
W, H, FOVV = 1536, 1024, np.radians(62)
P = np.asarray(Image.open(pano).convert('RGB')).astype(np.float32) / 255
cx, cz, cy = (x0 + x1) / 2, (z0 + z1) / 2, -eye + hgt / 2
a = np.arctan2(cx, -cz); b = np.arctan2(cy, np.hypot(cx, cz))
f = np.array([np.sin(a) * np.cos(b), np.sin(b), -np.cos(a) * np.cos(b)])
r = np.array([np.cos(a), 0, np.sin(a)]); u = np.cross(r, f)
th = np.tan(FOVV / 2); asp = W / H
j, i = np.meshgrid(np.arange(W), np.arange(H))
sx = ((j + .5) / W * 2 - 1) * th * asp; sy = (1 - (i + .5) / H * 2) * th
d = f[None, None] + sx[..., None] * r + sy[..., None] * u; d /= np.linalg.norm(d, axis=2, keepdims=True)
yaw = np.arctan2(d[..., 0], -d[..., 2]); pit = np.arcsin(np.clip(d[..., 1], -1, 1))
ph, pw = P.shape[:2]
px = ((0.5 + yaw / (2 * np.pi)) * pw).astype(int) % pw; py = np.clip(((0.5 - pit / np.pi) * ph).astype(int), 0, ph - 1)
img = Image.fromarray((P[py, px] * 255).astype(np.uint8))
img = ImageEnhance.Color(img).enhance(0.35); img = ImageEnhance.Brightness(img).enhance(1.25)
def proj(p):
    p = np.array(p) - np.array([0, 0, 0]); xc, yc, zc = p @ r, p @ u, p @ f
    return ((xc / (zc * th * asp) + 1) / 2 * W, (1 - yc / (zc * th)) / 2 * H)
yb, yt = -eye, -eye + hgt
C = [(x, y, z) for y in (yb, yt) for z in (z0, z1) for x in (x0, x1)]
E = [(0,1),(2,3),(0,2),(1,3),(4,5),(6,7),(4,6),(5,7),(0,4),(1,5),(2,6),(3,7)]
dr = ImageDraw.Draw(img); pts = [proj(c) for c in C]
for e in E: dr.line([pts[e[0]], pts[e[1]]], fill=(230, 20, 20), width=5)
img.save(out + '.png')
xs = [p[0] for p in pts]; ys = [p[1] for p in pts]
json.dump({'yaw': float(np.degrees(a)), 'pitch': float(np.degrees(b)), 'fovv': 62, 'W': W, 'H': H,
           'box': [x0, x1, z0, z1, hgt], 'bbox': [min(xs), min(ys), max(xs), max(ys)]}, open(out + '.json', 'w'), indent=1)
print(out, 'yaw', round(float(np.degrees(a)), 1), 'pitch', round(float(np.degrees(b)), 1), 'bbox', [round(v) for v in (min(xs), min(ys), max(xs), max(ys))])
