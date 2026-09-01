from pathlib import Path
from html.parser import HTMLParser
from PIL import Image
import json
import re

ROOT = Path(__file__).resolve().parents[2]
expected = {
    "apple/app-icon-1024.png": ((1024, 1024), "RGB", False, None),
    "google-play/app-icon-512.png": ((512, 512), "RGBA", True, 1024 * 1024),
    "google-play/feature-graphic-1024x500.png": ((1024, 500), "RGB", False, None),
}
for name in ["01-shared-prayer-feed.png", "02-create-prayer-request.png", "03-anonymous-display-choice.png", "04-prayer-detail.png", "05-prayers-prayed-for.png", "06-verse-of-the-day.png"]:
    expected[f"apple/screenshots/iphone-6.3/{name}"] = ((1179, 2556), "RGB", False, None)
for name in ["01-shared-prayer-feed.jpg", "02-create-request-and-anonymous-choice.jpg", "03-prayer-detail.jpg", "04-prayers-prayed-for.jpg", "05-verse-of-the-day.jpg"]:
    expected[f"apple/screenshots/ipad-11/{name}"] = ((1640, 2360), "RGB", False, None)
for name in ["01-shared-prayer-feed.png", "02-create-prayer-request.png", "03-anonymous-display-choice.png", "04-prayer-detail.png", "05-prayers-prayed-for.png", "06-verse-of-the-day.png"]:
    expected[f"google-play/screenshots/phone/{name}"] = ((1080, 1920), "RGB", False, None)
results = []
ok = True
for rel, (size, mode, alpha_required, max_bytes) in expected.items():
    path = ROOT / "store-assets" / rel
    image = Image.open(path)
    alpha = "A" in image.getbands()
    alpha_range = image.getchannel("A").getextrema() if alpha else None
    expected_format = "JPEG" if path.suffix.lower() in {".jpg", ".jpeg"} else "PNG"
    valid = image.size == size and image.format == expected_format and image.mode == mode and alpha == alpha_required
    if max_bytes is not None:
        valid = valid and path.stat().st_size <= max_bytes
    if alpha_range is not None:
        valid = valid and alpha_range == (255, 255)
    results.append({"file": rel, "dimensions": list(image.size), "format": image.format,
                    "mode": image.mode, "alpha": alpha, "alpha_range": alpha_range,
                    "bytes": path.stat().st_size, "valid": valid})
    ok &= valid

class LocalRefs(HTMLParser):
    def __init__(self):
        super().__init__(); self.refs = []
    def handle_starttag(self, tag, attrs):
        for key, value in attrs:
            if key in {"src", "href"} and value and not re.match(r"^(https?:|#|mailto:)", value):
                self.refs.append(value)

board = ROOT / "store-assets/review/index.html"
parser = LocalRefs(); parser.feed(board.read_text())
broken = [ref for ref in parser.refs if not (board.parent / ref).resolve().exists()]
ok &= not broken

text_files = list((ROOT / "store-assets").rglob("*.md")) + list((ROOT / "store-assets").rglob("*.html")) + list((ROOT / "store-assets").rglob("*.py"))
emdash = sum(p.read_text().count("\u2014") for p in text_files)
ok &= emdash == 0
sensitive_patterns = [r"[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}", r"\buid\b\s*[:=]", r"AIza[0-9A-Za-z_-]{20,}"]
sensitive_hits = []
for path in (ROOT / "store-assets").rglob("*"):
    if path.suffix.lower() in {".md", ".html", ".py", ".json"}:
        text = path.read_text()
        for pattern in sensitive_patterns:
            if re.search(pattern, text, re.I): sensitive_hits.append([str(path.relative_to(ROOT)), pattern])
# The capture guide names email and UID generically as prohibited fields, so exclude those known instructions.
sensitive_hits = [hit for hit in sensitive_hits if hit[0] not in {"store-assets/screenshots/CAPTURE_GUIDE.md", "store-assets/STORE_ASSET_MANIFEST.md", "store-assets/validation/validate_assets.py"}]
ok &= not sensitive_hits

raw_ipad = ROOT / "store-assets/screenshots/raw/ios-ipad"
duplicate_ipad = (raw_ipad / "02-create-request.jpeg").read_bytes() == (raw_ipad / "03-anonymous-choice.jpeg").read_bytes()
ok &= duplicate_ipad

raw_counts = {
    "android-phone": len(list((ROOT / "store-assets/screenshots/raw/android-phone").glob("*.png"))),
    "ios-iphone": len(list((ROOT / "store-assets/screenshots/raw/ios-iphone").glob("*.png"))),
    "ios-ipad": len(list((ROOT / "store-assets/screenshots/raw/ios-ipad").glob("*.jpeg"))),
}
ok &= raw_counts == {"android-phone": 7, "ios-iphone": 8, "ios-ipad": 7}

report = {"status": "PASS" if ok else "FAIL", "assets": results, "broken_review_board_paths": broken,
          "sensitive_text_hits": sensitive_hits, "unicode_em_dash_count": emdash,
          "raw_capture_counts": raw_counts, "ipad_duplicate_confirmed": duplicate_ipad}
(ROOT / "store-assets/validation/validation-report.json").write_text(json.dumps(report, indent=2) + "\n")
print(json.dumps(report, indent=2))
raise SystemExit(0 if ok else 1)
