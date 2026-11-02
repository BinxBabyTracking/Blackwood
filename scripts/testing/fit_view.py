# Testing Zone tool: fits art painted over a reference view into its red box, on a frame the size of the reference.
# usage: fit_view.py art.png ref.json out.webp
import sys, json, numpy as np
from PIL import Image
art, ref, out = sys.argv[1:4]
j = json.load(open(ref)); W, H = j['W'], j['H']; bx0, by0, bx1, by1 = j['bbox']
im = Image.open(art).convert('RGBA'); a = np.asarray(im); op = a[..., 3] > 128
ys = np.where(op.any(1))[0]; xs = np.where(op.any(0))[0]
obj = im.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
s = ((bx1 - bx0) / obj.size[0] + (by1 - by0) / obj.size[1]) / 2
obj = obj.resize((round(obj.size[0] * s), round(obj.size[1] * s)), Image.LANCZOS)
frame = Image.new('RGBA', (W, H), (0, 0, 0, 0))
# Line up the bottoms (where it meets the floor) and the middles across.
frame.alpha_composite(obj, (round((bx0 + bx1) / 2 - obj.size[0] / 2), round(by1 - obj.size[1])))
frame.save(out, quality=90)
print('scale', round(s, 3), 'size', obj.size)
