# Testing Zone tool, kept for reference: file names point at the images Ian uploaded in the chat where this was built.
"""
Bakes a box room for the 360° viewer, lit in code instead of in the artwork.

Outputs two equirectangular images:
  <name>.webp        the room's surfaces in plain light, with the outside view seen through the window panes
  <name>_light.webp  R = moonlight reaching each surface through the windows, G = 1 inside the room, 0 for the outside view

The viewer multiplies them together at run time with an ambient night level, the moon on or off, and the ceiling bulb.
"""
import sys, numpy as np
from PIL import Image, ImageFilter

U = '/mnt/user-data/uploads/'
OUT = sys.argv[1]
OW, OH = int(sys.argv[2]), int(sys.argv[3])

W = D = 1.5; H = 1.0; EYE = 0.55
SKY_Z = -3.75                      # the sky backdrop, 3 units behind the window wall
MOON_AZ, MOON_EL = 21.0, 16.0      # degrees: right of center, above the horizon (seen through the right window's upper panes)

def load(name, rot=0, crop=None):
    im = Image.open(U + name).convert('RGBA')
    if crop: im = im.crop(crop)
    a = np.asarray(im).astype(np.float32) / 255
    if rot: a = np.ascontiguousarray(np.rot90(a, k=rot))
    return a

def delight(a, sigma=40):
    """Evens out light painted into a texture: divides by a blurred copy of its brightness."""
    rgb = a[..., :3]
    L = rgb @ np.array([0.299, 0.587, 0.114], np.float32)
    B = np.asarray(Image.fromarray((np.clip(L, 0, 1) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(sigma))).astype(np.float32) / 255
    out = rgb / np.maximum(B, 0.03)[..., None] * B.mean()
    a = a.copy(); a[..., :3] = np.clip(out, 0, 1)
    return a

def level(a, target=0.42):
    """Brings each face to the same middle brightness, so the viewer's lighting sets the mood, not the artwork."""
    rgb = a[..., :3]; m = a[..., 3] > 0.5
    L = rgb @ np.array([0.299, 0.587, 0.114], np.float32)
    a = a.copy(); a[..., :3] = np.clip(rgb * (target / max(np.median(L[m]), 1e-3)), 0, 1)
    return a

F = {
    'front': level(load('7b6d5a3d-image.png', crop=(21, 4, 1652, 937))),              # new window wall, transparent panes
    'back':  level(delight(load('efec64fd-image.png'), 60)),
    'left':  level(delight(load('16bb4853-image.png'), 30)),                          # had window light painted on it
    'right': level(delight(load('7b9fbf60-image.png'), 60)),
    'floor': level(delight(load('81018a81-image.png', rot=-1), 30)),                  # had window light painted on it
    'ceil':  level(delight(load('f3acd070-image.png'), 60), 0.38),
}
SKY = np.asarray(Image.open(U + '04d5a9ad-image.png').convert('RGB')).astype(np.float32) / 255
# Window alpha, softened slightly: the moon is not a point, so the edges of its light are a little soft.
alpha_img = Image.fromarray((F['front'][..., 3] * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(2.5))
FRONT_ALPHA = np.asarray(alpha_img).astype(np.float32) / 255

def sample(img, u, v):
    h, w = img.shape[:2]
    px = np.clip(u * w - 0.5, 0, w - 1.001); py = np.clip(v * h - 0.5, 0, h - 1.001)
    x0 = px.astype(np.int32); y0 = py.astype(np.int32); fx = px - x0; fy = py - y0
    if img.ndim == 3: fx = fx[:, None]; fy = fy[:, None]
    return (img[y0, x0] * (1 - fx) * (1 - fy) + img[y0, x0 + 1] * fx * (1 - fy)
            + img[y0 + 1, x0] * (1 - fx) * fy + img[y0 + 1, x0 + 1] * fx * fy)

az, el = np.radians(MOON_AZ), np.radians(MOON_EL)
MOON = np.array([np.sin(az) * np.cos(el), np.sin(el), -np.cos(az) * np.cos(el)], np.float32)
# Place the sky so its moon sits in that direction.
SKY_W = 8.4; SKY_H = SKY_W * SKY.shape[0] / SKY.shape[1]
s = SKY_Z / MOON[2]; mx, my = MOON[0] * s, MOON[1] * s          # where the moon lands on the sky plane (relative to the eye)
MOON_UV = (0.501, 0.374)                                          # where the moon is in the sky image
SKY_CX = mx - (MOON_UV[0] - 0.5) * SKY_W; SKY_CY = my + (MOON_UV[1] - 0.5) * SKY_H

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
    x = dx * t; y = dy * t; z = dz * t            # hit point relative to the eye
    yf = y + EYE                                   # height above the floor
    col = np.zeros((len(t), 3), np.float32); moon = np.zeros(len(t), np.float32); inside = np.ones(len(t), np.float32)
    hx = t == tx; hy = (t == ty) & ~hx; hz = (t == tz) & ~hx & ~hy
    faces = [
        ('front', hz & (dz < 0), lambda m: ((x[m] + W / 2) / W, (H - yf[m]) / H)),
        ('back',  hz & (dz > 0), lambda m: ((W / 2 - x[m]) / W, (H - yf[m]) / H)),
        ('left',  hx & (dx < 0), lambda m: ((D / 2 - z[m]) / D, (H - yf[m]) / H)),
        ('right', hx & (dx > 0), lambda m: ((z[m] + D / 2) / D, (H - yf[m]) / H)),
        ('ceil',  hy & (dy > 0), lambda m: ((x[m] + W / 2) / W, (D / 2 - z[m]) / D)),
        ('floor', hy & (dy < 0), lambda m: ((x[m] + W / 2) / W, (z[m] + D / 2) / D)),
    ]
    for name, m, uv in faces:
        if not m.any(): continue
        u, v = uv(m)
        c = sample(F[name], u, v)
        a = c[:, 3:4]
        if name == 'front':
            # Through the glass: the sky, a little hazed by dirty panes.
            s2 = SKY_Z / dz[m]
            su = (x[m] / np.maximum(t[m], 1e-6) * s2 - SKY_CX) / SKY_W + 0.5
            sv = 0.5 - (y[m] / np.maximum(t[m], 1e-6) * s2 - SKY_CY) / SKY_H
            sky = sample(SKY, su, sv) * 0.85 + np.array([0.05, 0.06, 0.08], np.float32)
            col[m] = c[:, :3] * a + sky * (1 - a)
            inside[m] = a[:, 0]
        else:
            col[m] = c[:, :3]
            # Moonlight: follow the moon's direction from this point back to the window wall; lit where the panes are open.
            px, py, pz = x[m], yf[m], z[m]
            sm = (-D / 2 - pz) / MOON[2]
            qx = px + MOON[0] * sm; qy = py + MOON[1] * sm
            ok = (sm > 0) & (qx > -W / 2) & (qx < W / 2) & (qy > 0) & (qy < H)
            qa = sample(FRONT_ALPHA, (qx + W / 2) / W, (H - qy) / H)
            n = {'back': [0, 0, -1], 'left': [1, 0, 0], 'right': [-1, 0, 0], 'ceil': [0, -1, 0], 'floor': [0, 1, 0]}[name]
            lam = max(0.0, float(np.dot(n, MOON)))
            moon[m] = np.where(ok, (1 - qa), 0) * lam
    albedo[r0:r1] = col.reshape(r1 - r0, OW, 3)
    light[r0:r1, :, 0] = moon.reshape(r1 - r0, OW)
    light[r0:r1, :, 1] = inside.reshape(r1 - r0, OW)
    print('rows', r1, flush=True)

mx_l = light[..., 0].max(); print('moon max', mx_l)
if mx_l > 0: light[..., 0] /= mx_l
Image.fromarray((np.clip(albedo, 0, 1) * 255).astype(np.uint8)).save(OUT + '.webp', quality=90)
Image.fromarray((np.clip(light, 0, 1) * 255).astype(np.uint8)).save(OUT + '_light.webp', quality=92)
print('moon dir', MOON.round(3), 'moon lambert scale', mx_l)
