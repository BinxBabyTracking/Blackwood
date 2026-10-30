# Testing Zone tool: bakes a box room for the 360° viewer, lit in code instead of in the artwork.
#
# usage: python3 bake_box.py config.json OUT_BASENAME WIDTH HEIGHT
#
# Writes OUT.webp (the room in plain light, with the outside view through the window panes) and OUT_light.webp
# (R = light from outside reaching each surface through the window openings, G = 1 inside the room, 0 for the view out).
# The viewer combines them at run time with a night level, the outside light on or off, and the room's lamps.
import sys, json, numpy as np
from PIL import Image, ImageFilter

cfg = json.load(open(sys.argv[1])); OUT = sys.argv[2]; OW, OH = int(sys.argv[3]), int(sys.argv[4])
W, D, H, EYE = cfg['width'], cfg['depth'], 1.0, cfg['eye']
LUM = np.array([0.299, 0.587, 0.114], np.float32)

def load(spec):
    im = Image.open(spec['file']).convert('RGBA')
    if spec.get('crop'): im = im.crop(tuple(spec['crop']))
    if spec.get('mirror'): im = im.transpose(Image.FLIP_LEFT_RIGHT)
    a = np.asarray(im).astype(np.float32) / 255
    if spec.get('rot'): a = np.ascontiguousarray(np.rot90(a, k=spec['rot']))
    if spec.get('level'):
        m = a[..., 3] > 0.5; L = a[..., :3] @ LUM
        a = a.copy(); a[..., :3] = np.clip(a[..., :3] * (spec['level'] / max(np.median(L[m]), 1e-3)), 0, 1)
    return a

F = {k: load(v) for k, v in cfg['faces'].items()}
OUTSIDE = np.asarray(Image.open(cfg['outside']['file']).convert('RGB')).astype(np.float32) / 255
O = cfg['outside']; OUT_Z = -D / 2 - O['distance']; OUT_W = O['width']; OUT_H = OUT_W * OUTSIDE.shape[0] / OUTSIDE.shape[1]
alpha_img = Image.fromarray((F['front'][..., 3] * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(cfg['light'].get('softness', 2.5)))
FRONT_ALPHA = np.asarray(alpha_img).astype(np.float32) / 255
az, el = np.radians(cfg['light']['azimuth']), np.radians(cfg['light']['elevation'])
SRC = np.array([np.sin(az) * np.cos(el), np.sin(el), -np.cos(az) * np.cos(el)], np.float32)   # toward the light outside

def sample(img, u, v):
    h, w = img.shape[:2]
    px = np.clip(u * w - 0.5, 0, w - 1.001); py = np.clip(v * h - 0.5, 0, h - 1.001)
    x0 = px.astype(np.int32); y0 = py.astype(np.int32); fx = px - x0; fy = py - y0
    if img.ndim == 3: fx = fx[:, None]; fy = fy[:, None]
    return (img[y0, x0] * (1 - fx) * (1 - fy) + img[y0, x0 + 1] * fx * (1 - fy)
            + img[y0 + 1, x0] * (1 - fx) * fy + img[y0 + 1, x0 + 1] * fx * fy)

albedo = np.zeros((OH, OW, 3), np.float32); light = np.zeros((OH, OW, 3), np.float32)
for r0 in range(0, OH, 256):
    r1 = min(OH, r0 + 256)
    j, i = np.meshgrid(np.arange(OW), np.arange(r0, r1))
    yaw = ((j + 0.5) / OW - 0.5) * 2 * np.pi; pitch = (0.5 - (i + 0.5) / OH) * np.pi
    dx = (np.sin(yaw) * np.cos(pitch)).ravel(); dy = np.sin(pitch).ravel(); dz = (-np.cos(yaw) * np.cos(pitch)).ravel()
    with np.errstate(divide='ignore', invalid='ignore'):
        tx = np.where(dx > 0, (W / 2) / dx, np.where(dx < 0, (-W / 2) / dx, np.inf))
        tz = np.where(dz > 0, (D / 2) / dz, np.where(dz < 0, (-D / 2) / dz, np.inf))
        ty = np.where(dy > 0, (H - EYE) / dy, np.where(dy < 0, (-EYE) / dy, np.inf))
    t = np.minimum(np.minimum(tx, ty), tz)
    x = dx * t; y = dy * t; z = dz * t; yf = y + EYE
    col = np.zeros((len(t), 3), np.float32); lit = np.zeros(len(t), np.float32); inside = np.ones(len(t), np.float32)
    hx = t == tx; hy = (t == ty) & ~hx; hz = (t == tz) & ~hx & ~hy
    faces = [
        ('front', hz & (dz < 0), lambda m: ((x[m] + W / 2) / W, (H - yf[m]) / H), None),
        ('back',  hz & (dz > 0), lambda m: ((W / 2 - x[m]) / W, (H - yf[m]) / H), [0, 0, -1]),
        ('left',  hx & (dx < 0), lambda m: ((D / 2 - z[m]) / D, (H - yf[m]) / H), [1, 0, 0]),
        ('right', hx & (dx > 0), lambda m: ((z[m] + D / 2) / D, (H - yf[m]) / H), [-1, 0, 0]),
        ('ceil',  hy & (dy > 0), lambda m: ((x[m] + W / 2) / W, (D / 2 - z[m]) / D), [0, -1, 0]),
        ('floor', hy & (dy < 0), lambda m: ((x[m] + W / 2) / W, (z[m] + D / 2) / D), [0, 1, 0]),
    ]
    for name, m, uv, n in faces:
        if not m.any(): continue
        u, v = uv(m); c = sample(F[name], u, v); a = c[:, 3:4]
        if name == 'front':
            s2 = OUT_Z / dz[m]
            ou = (x[m] / np.maximum(t[m], 1e-6) * s2 - O['center'][0]) / OUT_W + 0.5
            ov = 0.5 - (y[m] / np.maximum(t[m], 1e-6) * s2 - O['center'][1]) / OUT_H
            view = sample(OUTSIDE, ou, ov) * O.get('brightness', 1.0) + np.array(O.get('haze', [0.02, 0.02, 0.03]), np.float32)
            col[m] = c[:, :3] * a + view * (1 - a); inside[m] = a[:, 0]
        else:
            col[m] = c[:, :3]
            # Light from outside: follow the light's direction from this point back to the window wall; lit where it is open.
            sm = (-D / 2 - z[m]) / SRC[2]
            qx = x[m] + SRC[0] * sm; qy = yf[m] + SRC[1] * sm
            ok = (sm > 0) & (qx > -W / 2) & (qx < W / 2) & (qy > 0) & (qy < H)
            qa = sample(FRONT_ALPHA, (qx + W / 2) / W, (H - qy) / H)
            lit[m] = np.where(ok, 1 - qa, 0) * max(0.0, float(np.dot(n, SRC)))
    albedo[r0:r1] = col.reshape(r1 - r0, OW, 3)
    light[r0:r1, :, 0] = lit.reshape(r1 - r0, OW); light[r0:r1, :, 1] = inside.reshape(r1 - r0, OW)

peak = light[..., 0].max()
if peak > 0: light[..., 0] /= peak
Image.fromarray((np.clip(albedo, 0, 1) * 255).astype(np.uint8)).save(OUT + '.webp', quality=cfg.get('quality', 82))
Image.fromarray((np.clip(light, 0, 1) * 255).astype(np.uint8)).save(OUT + '_light.webp', quality=92)
print('light dir', SRC.round(3), 'peak', round(float(peak), 3))
