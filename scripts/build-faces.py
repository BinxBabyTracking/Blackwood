#!/usr/bin/env python3
"""
Builds a talking portrait's frames from hand-made images.

    python3 scripts/build-faces.py c003 rachel path/to/folder

The folder holds the person's portrait and its edited copies, named as the
art prompts name them:

    c003_portrait_rachel.png        mouth closed (the base)
    c003_rachel_mouth_open_slight.png
    c003_rachel_mouth_ah.png
    c003_rachel_mouth_ee.png
    c003_rachel_mouth_oh.png
    c003_rachel_mouth_oo.png
    c003_rachel_mouth_f.png         optional
    c003_rachel_blink.png

Image generators redraw small things on every edit (a strand of hair, the
grain), so a raw edit would make the whole face shimmer when frames switch.
Each frame is therefore the base portrait with only the changed area blended
in: the mouth from each mouth image, the eyes from the blink. The area is
found from where the edits differ from the base, then feathered.

Writes public/art/<case>_face_<person>_<shape>.webp and lists them in
src/art/generated.json. The base itself is imported as the portrait the usual
way (art/inbox and scripts/import-art.mjs).
"""
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SIZE = (768, 1152)
SHAPES = ["slight", "ah", "ee", "oh", "oo", "f"]
FILES = {"slight": "mouth_open_slight", "ah": "mouth_ah", "ee": "mouth_ee", "oh": "mouth_oh", "oo": "mouth_oo", "f": "mouth_f"}


def load(path: Path) -> Image.Image:
    return Image.open(path).convert("RGB")


def changed_box(base: np.ndarray, others: list[np.ndarray], limit: tuple[float, float]) -> tuple[int, int, int, int]:
    """The box around where the edits differ from the base, inside the given vertical band (fractions of height)."""
    h, w, _ = base.shape
    diff = np.zeros((h, w))
    for o in others:
        diff = np.maximum(diff, np.abs(o.astype(float) - base.astype(float)).mean(axis=2))
    diff = np.asarray(Image.fromarray(diff.astype(np.uint8)).filter(ImageFilter.GaussianBlur(6)), dtype=float)
    band = np.zeros_like(diff, dtype=bool)
    band[int(limit[0] * h) : int(limit[1] * h), int(0.2 * w) : int(0.8 * w)] = True
    hot = (diff > 18) & band
    ys, xs = np.nonzero(hot)
    if len(xs) == 0:
        raise SystemExit("No change found between the base and the edits.")
    # Ignore stray specks: keep the central 98% of changed pixels.
    x0, x1 = np.percentile(xs, [1, 99])
    y0, y1 = np.percentile(ys, [1, 99])
    return int(x0), int(y0), int(x1), int(y1)


def mask_for(size: tuple[int, int], box: tuple[int, int, int, int], margin: float) -> Image.Image:
    """A soft ellipse around the box, so the blended area has no visible edge."""
    w, h = size
    x0, y0, x1, y1 = box
    mx, my = (x1 - x0) * margin, (y1 - y0) * margin
    m = Image.new("L", size, 0)
    from PIL import ImageDraw

    ImageDraw.Draw(m).ellipse([x0 - mx, y0 - my, x1 + mx, y1 + my], fill=255)
    return m.filter(ImageFilter.GaussianBlur(max(8, (x1 - x0) * 0.12)))


def main() -> None:
    if len(sys.argv) != 4:
        raise SystemExit(__doc__)
    case, person, folder = sys.argv[1], sys.argv[2], Path(sys.argv[3])
    base_img = load(folder / f"{case}_portrait_{person}.png")
    base = np.asarray(base_img)
    mouths = {s: load(folder / f"{case}_{person}_{FILES[s]}.png") for s in SHAPES if (folder / f"{case}_{person}_{FILES[s]}.png").exists()}
    blink = load(folder / f"{case}_{person}_blink.png")
    for name, im in [*mouths.items(), ("blink", blink)]:
        if im.size != base_img.size:
            raise SystemExit(f"{name} is {im.size}, the base is {base_img.size}. Every image must be the same size.")

    mouth_box = changed_box(base, [np.asarray(m) for m in mouths.values()], (0.30, 0.70))
    eye_box = changed_box(base, [np.asarray(blink)], (0.20, 0.45))
    mouth_mask = mask_for(base_img.size, mouth_box, 0.35)
    eye_mask = mask_for(base_img.size, eye_box, 0.25)

    frames = {"rest": base_img}
    for s, m in mouths.items():
        frames[s] = Image.composite(m, base_img, mouth_mask)
    frames["blink"] = Image.composite(blink, base_img, eye_mask)

    out = ROOT / "public" / "art"
    out.mkdir(parents=True, exist_ok=True)
    reg_path = ROOT / "src" / "art" / "generated.json"
    reg = json.loads(reg_path.read_text())
    now = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    for shape, im in frames.items():
        key = f"{case}_face_{person}_{shape}"
        im.resize(SIZE, Image.LANCZOS).save(out / f"{key}.webp", "WEBP", quality=82, method=6)
        reg["images"][key] = {"url": f"/art/{key}.webp", "kind": "face", "model": "hand-imported", "generatedAt": now}
    reg_path.write_text(json.dumps(reg, indent=2) + "\n")
    print(f"{person}: mouth area {mouth_box}, eye area {eye_box}; frames {', '.join(frames)}")


if __name__ == "__main__":
    main()
