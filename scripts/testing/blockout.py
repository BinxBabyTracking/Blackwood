# Testing Zone tool: renders a rough block model of a piece of furniture from the player's eye, over a faded view of
# the room, for ChatGPT to paint over. Boxes are [x0,x1,y0,y1,z0,z1] in room units (y up from the floor).
# usage: blockout.py panorama.webp eye model.json out_basename
import sys, json, numpy as np
from PIL import Image, ImageEnhance, ImageFilter
pano, eye, model, out = sys.argv[1], float(sys.argv[2]), sys.argv[3], sys.argv[4]
M = json.load(open(model)); boxes = np.array(M['boxes'], float)
W, H, FOVV = 1536, 1024, np.radians(62)
lo = np.stack([boxes[:, 0], boxes[:, 2] - eye, boxes[:, 4]], 1); hi = np.stack([boxes[:, 1], boxes[:, 3] - eye, boxes[:, 5]], 1)
c = (lo.min(0) + hi.max(0)) / 2
a = np.arctan2(c[0], -c[2]); b = np.arctan2(c[1], np.hypot(c[0], c[2]))
f = np.array([np.sin(a) * np.cos(b), np.sin(b), -np.cos(a) * np.cos(b)]); r = np.array([np.cos(a), 0, np.sin(a)]); u = np.cross(r, f)
th = np.tan(FOVV / 2); asp = W / H
j, i = np.meshgrid(np.arange(W), np.arange(H))
d = f + (((j + .5) / W * 2 - 1) * th * asp)[..., None] * r + ((1 - (i + .5) / H * 2) * th)[..., None] * u
d /= np.linalg.norm(d, axis=2, keepdims=True); D = d.reshape(-1, 3)
# Faded room behind.
P = np.asarray(Image.open(pano).convert('RGB')).astype(np.float32) / 255; ph, pw = P.shape[:2]
yaw = np.arctan2(D[:, 0], -D[:, 2]); pit = np.arcsin(np.clip(D[:, 1], -1, 1))
bg = P[np.clip(((0.5 - pit / np.pi) * ph).astype(int), 0, ph - 1), ((0.5 + yaw / (2 * np.pi)) * pw).astype(int) % pw]
bg = bg * 0.35 + 0.6
# Ray against every box (slab test), keep the nearest hit and which face.
best = np.full(len(D), np.inf); face = np.full(len(D), -1)
with np.errstate(divide='ignore', invalid='ignore'):
    for k in range(len(boxes)):
        t1 = lo[k] / D; t2 = hi[k] / D
        tn = np.minimum(t1, t2); tf = np.maximum(t1, t2)
        tnear = tn.max(1); tfar = tf.min(1); hit = (tnear <= tfar) & (tnear > 0) & (tnear < best)
        best[hit] = tnear[hit]; face[hit] = tn[hit].argmax(1)
shade = np.array([0.55, 0.92, 0.72])            # side (x), top (y), front (z) faces: different grays so the shape reads
col = bg.copy(); m = face >= 0
col[m] = shade[face[m]][:, None] * np.array([0.78, 0.72, 0.66])
img = (col.reshape(H, W, 3) * 255).astype(np.uint8)
# Dark outlines where the hit changes, so each block's edges are clear.
depth = np.where(m, best, 99).reshape(H, W); fc = face.reshape(H, W)
edge = np.zeros((H, W), bool)
for ax in (0, 1):
    dd = np.abs(np.diff(depth, axis=ax)) > 0.01; ff = np.diff(fc, axis=ax) != 0
    e = dd | ff
    if ax == 0: edge[1:] |= e; edge[:-1] |= e
    else: edge[:, 1:] |= e; edge[:, :-1] |= e
img[edge & (depth < 99)] = (40, 34, 30)
Image.fromarray(img).save(out + '.png')
ys, xs = np.where(depth < 99)
json.dump({'yaw': float(np.degrees(a)), 'pitch': float(np.degrees(b)), 'fovv': 62, 'W': W, 'H': H,
           'center': c.tolist(), 'bbox': [int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())]}, open(out + '.json', 'w'), indent=1)
print(out, 'bbox', xs.min(), ys.min(), xs.max(), ys.max())
