# Authentic Screenshot Capture Record

Status: APPROVED BY OWNER ON 2026-08-15

Authentic, high-resolution app screenshots were supplied by the owner on 2026-08-15. This file preserves the capture specification and provenance for future refreshes. Do not fill screenshot slots with mock UI.

Capture six portrait flows using an owner-controlled adult test account and neutral test data. Capture the raw app UI with no device frame or marketing caption.

| Order | Screen and required state | Safe test content | Raw destinations |
|---|---|---|---|
| 01 | Shared prayer feed with current requests and visible sort or filter controls | Names: Jordan, Eric, Morgan. Topics: job interview, family travel, and a family milestone. | Matching `01-feed` file in each raw device folder |
| 02 | Create prayer request form with body and category populated | Neutral work or family request with the matching category. | Matching `02-create-request` file in each raw device folder |
| 03 | Same create form showing the Anonymous display choice selected | Neutral request text; no account data visible. | Matching `03-anonymous-choice` file in each raw device folder |
| 04 | Prayer detail with shared prayer count visible | Owner-controlled neutral request and small test count. | Matching `04-prayer-detail` file in each raw device folder |
| 05 | Prayers you have prayed for, with neutral requests | Only the safe names and topics listed above. | Matching `05-prayed-for` file in each raw device folder |
| 06 | Verse of the Day | Current bundled KJV verse and app reflection only. | Matching `06-verse-of-day` file in each raw device folder |

Captured native viewports:

- iPhone portrait: 1179 x 2556 px, accepted Apple 6.3-inch class.
- iPad portrait: 1640 x 2360 px, accepted Apple 11-inch class. Apple scales accepted smaller iPad captures for the required 13-inch class.
- Android phone portrait: 1080 x 1920 px, Pixel 2 emulator on Android 16, API 36.

Visual review confirmed no real prayer content, email address, account UID, tester notification, or personal profile data. The iPad `02-create-request.jpeg` and `03-anonymous-choice.jpeg` captures are byte-for-byte identical, so only one is included in the production set. Raw originals remain unchanged.
