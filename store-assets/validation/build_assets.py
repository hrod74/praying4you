from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "mobile-app/assets/icon.png"
FOREGROUND = ROOT / "mobile-app/assets/android-icon-foreground.png"
APPLE = ROOT / "store-assets/apple/app-icon-1024.png"
GOOGLE_ICON = ROOT / "store-assets/google-play/app-icon-512.png"
FEATURE = ROOT / "store-assets/google-play/feature-graphic-1024x500.png"
RAW = ROOT / "store-assets/screenshots/raw"
APPLE_IPHONE = ROOT / "store-assets/apple/screenshots/iphone-6.3"
APPLE_IPAD = ROOT / "store-assets/apple/screenshots/ipad-11"
GOOGLE_PHONE = ROOT / "store-assets/google-play/screenshots/phone"

for path in (APPLE.parent, GOOGLE_ICON.parent, APPLE_IPHONE, APPLE_IPAD, GOOGLE_PHONE):
    path.mkdir(parents=True, exist_ok=True)

source = Image.open(SOURCE).convert("RGBA")
background = Image.new("RGBA", source.size, "#F5EFE3")
background.alpha_composite(source)
flat = background.convert("RGB")
flat.resize((1024, 1024), Image.Resampling.LANCZOS).save(APPLE, "PNG", optimize=True)

# Google requires a 32-bit PNG. Preserve a fully opaque alpha channel so Play can
# process the square itself without exposing unpredictable UI background colors.
play = flat.resize((512, 512), Image.Resampling.LANCZOS).convert("RGBA")
play.putalpha(255)
play.save(GOOGLE_ICON, "PNG", optimize=True)

canvas = Image.new("RGB", (1024, 500), "#EDE3D1")
draw = ImageDraw.Draw(canvas)
for x in range(1024):
    t = x / 1023
    color = tuple(round(a * (1 - t) + b * t) for a, b in zip((245, 239, 227), (225, 204, 166)))
    draw.line((x, 0, x, 500), fill=color)

# Use the current adaptive foreground as a restrained identity extension, not a new mark.
foreground = Image.open(FOREGROUND).convert("RGBA")
box = foreground.getchannel("A").getbbox()
art = foreground.crop(box).resize((420, 420), Image.Resampling.LANCZOS)
alpha = art.getchannel("A").point(lambda p: int(p * 0.92))
art.putalpha(alpha)
canvas.paste(art, (580, 40), art)

def font(size: int, bold: bool = False):
    candidates = [
        "/System/Library/Fonts/Supplemental/Georgia Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Georgia.ttf",
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf",
    ]
    for candidate in candidates:
        if Path(candidate).exists():
            return ImageFont.truetype(candidate, size)
    return ImageFont.load_default()

draw = ImageDraw.Draw(canvas)
draw.text((82, 157), "Prayer Table", font=font(55, True), fill="#2B2118")
draw.text((85, 235), "Share prayer. Pray together.", font=font(27), fill="#5F4B3A")
draw.rounded_rectangle((84, 290, 380, 296), radius=3, fill="#B58A3B")
canvas.save(FEATURE, "PNG", optimize=True)

# Store screenshots remain faithful, full-frame exports of the owner-provided
# authentic captures. Apple PNG exports are flattened because App Store Connect
# disallows alpha. The duplicate iPad anonymous-choice capture is retained in raw
# sources but intentionally omitted from the five-image production set.
iphone_sources = [
    ("01-feed.png", "01-shared-prayer-feed.png"),
    ("02-create-request.png.png", "02-create-prayer-request.png"),
    ("03-anonymous-choice.png", "03-anonymous-display-choice.png"),
    ("04-prayer-detail.png", "04-prayer-detail.png"),
    ("05-prayed-for.png", "05-prayers-prayed-for.png"),
    ("06-verse-of-day.png", "06-verse-of-the-day.png"),
]
ipad_sources = [
    ("01-feed.jpeg", "01-shared-prayer-feed.jpg"),
    ("02-create-request.jpeg", "02-create-request-and-anonymous-choice.jpg"),
    ("04-prayer-detail.jpeg", "03-prayer-detail.jpg"),
    ("05-prayed-for.jpeg", "04-prayers-prayed-for.jpg"),
    ("06-verse-of-day-prayer-table.jpeg", "05-verse-of-the-day.jpg"),
]
android_sources = [
    ("01-feed.png", "01-shared-prayer-feed.png"),
    ("02-create-request.png", "02-create-prayer-request.png"),
    ("03-anonymous-choice.png", "03-anonymous-display-choice.png"),
    ("04-prayer-detail.png", "04-prayer-detail.png"),
    ("05-prayed-for.png", "05-prayers-prayed-for.png"),
    ("06-verse-of-day-prayer-table.png", "06-verse-of-the-day.png"),
]

for source_name, output_name in iphone_sources:
    image = Image.open(RAW / "ios-iphone" / source_name).convert("RGB")
    image.save(APPLE_IPHONE / output_name, "PNG", optimize=True)

for source_name, output_name in ipad_sources:
    image = Image.open(RAW / "ios-ipad" / source_name).convert("RGB")
    image.save(APPLE_IPAD / output_name, "JPEG", quality=95, optimize=True)

for source_name, output_name in android_sources:
    image = Image.open(RAW / "android-phone" / source_name).convert("RGB")
    image.save(GOOGLE_PHONE / output_name, "PNG", optimize=True)
