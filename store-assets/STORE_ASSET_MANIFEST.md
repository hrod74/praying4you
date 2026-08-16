# Praying For You Store Asset Manifest v0.1

Status: APPROVED BY OWNER

Prepared and validated: 2026-08-15

## Completed graphics

| File | Platform | Dimensions | Format | Mode | Alpha | Bytes | Source | Result |
|---|---|---:|---|---|---|---:|---|---|
| `apple/app-icon-1024.png` | Apple | 1024 x 1024 | PNG | RGB | None | 154,115 | Current `mobile-app/assets/icon.png` | PASS |
| `google-play/app-icon-512.png` | Google Play | 512 x 512 | PNG | RGBA | Opaque only | 49,963 | Current `mobile-app/assets/icon.png` | PASS |
| `google-play/feature-graphic-1024x500.png` | Google Play | 1024 x 500 | PNG | RGB | None | 105,717 | Current adaptive icon, palette, approved name and subtitle | PASS |

## Completed Apple iPhone screenshots

All six are authentic current-app captures supplied on 2026-08-15 at Apple's accepted 1179 x 2556 portrait size. Export processing only flattened the original opaque alpha channel.

| File | Format, mode, alpha | Bytes | Raw source | Result |
|---|---|---:|---|---|
| `apple/screenshots/iphone-6.3/01-shared-prayer-feed.png` | PNG, RGB, none | 259,673 | `screenshots/raw/ios-iphone/01-feed.png` | PASS |
| `apple/screenshots/iphone-6.3/02-create-prayer-request.png` | PNG, RGB, none | 172,225 | `screenshots/raw/ios-iphone/02-create-request.png.png` | PASS |
| `apple/screenshots/iphone-6.3/03-anonymous-display-choice.png` | PNG, RGB, none | 177,059 | `screenshots/raw/ios-iphone/03-anonymous-choice.png` | PASS |
| `apple/screenshots/iphone-6.3/04-prayer-detail.png` | PNG, RGB, none | 262,201 | `screenshots/raw/ios-iphone/04-prayer-detail.png` | PASS |
| `apple/screenshots/iphone-6.3/05-prayers-prayed-for.png` | PNG, RGB, none | 254,036 | `screenshots/raw/ios-iphone/05-prayed-for.png` | PASS |
| `apple/screenshots/iphone-6.3/06-verse-of-the-day.png` | PNG, RGB, none | 253,463 | `screenshots/raw/ios-iphone/06-verse-of-day.png` | PASS |

## Completed Apple iPad screenshots

These five are authentic current-app captures supplied on 2026-08-15 at Apple's accepted 1640 x 2360 portrait size. Apple states that accepted smaller iPad screenshots are scaled for the required 13-inch display if native 13-inch screenshots are not provided. The raw create-request and anonymous-choice files are byte-for-byte identical, so the production set includes that view once and retains both originals.

| File | Format, mode, alpha | Bytes | Raw source | Result |
|---|---|---:|---|---|
| `apple/screenshots/ipad-11/01-shared-prayer-feed.jpg` | JPEG, RGB, none | 209,925 | `screenshots/raw/ios-ipad/01-feed.jpeg` | PASS |
| `apple/screenshots/ipad-11/02-create-request-and-anonymous-choice.jpg` | JPEG, RGB, none | 307,764 | `screenshots/raw/ios-ipad/02-create-request.jpeg` | PASS |
| `apple/screenshots/ipad-11/03-prayer-detail.jpg` | JPEG, RGB, none | 135,182 | `screenshots/raw/ios-ipad/04-prayer-detail.jpeg` | PASS |
| `apple/screenshots/ipad-11/04-prayers-prayed-for.jpg` | JPEG, RGB, none | 176,547 | `screenshots/raw/ios-ipad/05-prayed-for.jpeg` | PASS |
| `apple/screenshots/ipad-11/05-verse-of-the-day.jpg` | JPEG, RGB, none | 146,391 | `screenshots/raw/ios-ipad/06-verse-of-day.jpeg` | PASS |

## Completed Google Play phone screenshots

All six are authentic Pixel 2 Android Emulator captures from Android 16, API 36, supplied on 2026-08-15 at 1080 x 1920 portrait. Export processing only flattened the original opaque alpha channel.

| File | Format, mode, alpha | Bytes | Raw source | Result |
|---|---|---:|---|---|
| `google-play/screenshots/phone/01-shared-prayer-feed.png` | PNG, RGB, none | 153,307 | `screenshots/raw/android-phone/01-feed.png` | PASS |
| `google-play/screenshots/phone/02-create-prayer-request.png` | PNG, RGB, none | 142,265 | `screenshots/raw/android-phone/02-create-request.png` | PASS |
| `google-play/screenshots/phone/03-anonymous-display-choice.png` | PNG, RGB, none | 153,843 | `screenshots/raw/android-phone/03-anonymous-choice.png` | PASS |
| `google-play/screenshots/phone/04-prayer-detail.png` | PNG, RGB, none | 107,117 | `screenshots/raw/android-phone/04-prayer-detail.png` | PASS |
| `google-play/screenshots/phone/05-prayers-prayed-for.png` | PNG, RGB, none | 166,732 | `screenshots/raw/android-phone/05-prayed-for.png` | PASS |
| `google-play/screenshots/phone/06-verse-of-the-day.png` | PNG, RGB, none | 136,002 | `screenshots/raw/android-phone/06-verse-of-day.png` | PASS |

All screenshot table entries use the dimensions stated in their section heading.

## Blocked assets

None. Native 13-inch iPad captures were not supplied, but Apple's specification provides automatic scaling from accepted smaller iPad screenshot sizes. No screenshot was fabricated, cropped, or stretched.

## Authenticity, privacy, and substitutions

- Capture date: 2026-08-15.
- Android source: Pixel 2 Android Emulator, Android 16, API 36, 1080 x 1920 portrait.
- iPhone source: owner device, model not recorded, 1179 x 2556 portrait.
- iPad source: owner device, model not recorded, 1640 x 2360 portrait.
- Owner-controlled test content uses the neutral names Morgan, Jordan, and Eric and ordinary topics involving travel, work, and family.
- No email address, UID, authentication screen, notification, real testimonial, user count, adoption claim, or crisis-service message appears.
- No redaction or test-data substitution was necessary during export.
- Raw originals remain unchanged.

## Official requirements verified

All sources were accessed on 2026-08-15.

- [Apple Human Interface Guidelines, App icons](https://developer.apple.com/design/human-interface-guidelines/app-icons/): 1024 x 1024 square source, no manually baked rounded corners, platform-applied masking.
- [Apple icon asset catalog documentation](https://developer.apple.com/documentation/xcode/configuring-your-app-icon/): single 1024 x 1024 source for iOS and iPadOS variants.
- [Apple App Store Connect screenshot specifications](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications): one to ten JPEG, JPG, or PNG screenshots; no alpha or transparency; accepted 1179 x 2556 iPhone and 1640 x 2360 iPad portrait sizes; 13-inch iPad requirement and platform scaling from accepted smaller iPad sizes.
- [Google Play icon design specifications](https://developer.android.com/distribute/google-play/resources/icon-design-specifications): 512 x 512, 32-bit PNG, sRGB, maximum 1024 KB, no baked shadow or rounded corners, Google-applied masking.
- [Google Play preview asset requirements](https://support.google.com/googleplay/android-developer/answer/9866151?hl=en): 1024 x 500 JPEG or 24-bit no-alpha PNG feature graphic; two to eight phone screenshots; 320 to 3840 pixel dimensions; 1080-pixel 9:16 portrait screenshots recommended for promotional eligibility.

## Multidisciplinary review disposition

- Brand and visual design: PASS. Current identity and warm palette remain consistent.
- UI and composition: PASS. Six phone flows make a clear sequence. Five distinct iPad views avoid a redundant duplicate.
- Accessibility and legibility: PASS. Native UI text is readable and graphic copy has strong contrast.
- Marketing and claim accuracy: PASS. No unsupported claims, testimonials, outcomes, adoption metrics, urgency, or crisis framing.
- Apple and Google policy: PASS for produced files. Confirm Apple's automatically scaled 13-inch iPad preview during upload.
- Privacy and redaction: PASS. Visual inspection found only owner-controlled test content and no direct identifiers.
- Technical validation: PASS. Dimensions, formats, modes, alpha, sizes, raw counts, duplicate provenance, review-board paths, sensitive text patterns, and Unicode em dash count are machine checked in `validation/validation-report.json`.

## Open owner decisions

- Approve or reject the package.
- Confirm the automatically scaled 13-inch iPad preview in App Store Connect. If unacceptable, capture the same five flows natively at 2064 x 2752 or 2048 x 2732 portrait.
- Optionally record exact iPhone and iPad model names for fuller provenance.

## Approval record

Owner name: Heriberto Rodriguez Jr.

Decision: Approved

Date: 2026-08-15

Notes: Store asset package v0.1 approved as presented.

Package approved by the owner on 2026-08-15.
