# Phase B Device QA — Real iPhone (Expo Go)

**Date:** 2026-06-10
**Type:** Manual device QA (Phase B)
**Device/runtime:** Physical iPhone, public **Expo Go** (iOS App Store, 54.x)
**Build target:** Expo SDK 54 (see
[`expo-go-ios-compatibility-fix.md`](expo-go-ios-compatibility-fix.md))

---

## Summary

Phase B (local auth + profile simulation) was manually tested on a real iPhone using the
public Expo Go app, after pinning the project to **Expo SDK 54**. The core onboarding
flow works on-device. This confirms the earlier automated checks (type-check, bundle,
dev-server, manifest SDK) against a physical device.

## What was verified on device

- ✅ **Expo Go opened the project successfully** after the SDK 54 compatibility fix — the
  previous "Project is incompatible with this version of Expo Go" error no longer
  appears.
- ✅ **Local profile/account creation works** — the user could create a local profile
  (display name + email) and enter the app.
- ✅ **The three app tabs are visible** — after entering, the user could see the **Feed**,
  **Verse**, and **Settings** tabs.

## Known limitations (expected at this stage)

- 🎨 **Design polish is not implemented yet.** The screens are functional but not yet
  visually polished; full application of `../design-direction.md` (visual refinement,
  demo-ready polish) remains a **future phase**, not a Phase B deliverable.
- The Feed, Verse, and Prayer-detail screens are still Phase A placeholders (no real
  prayer data yet).

## Recommendation

- ✅ **Proceed to Phase C.** Build the mock prayer **feed** and **detail** screens
  (read path) using local/mock data via the services layer, replacing the current
  placeholders. Visual/design polish continues to be tracked as a later phase.
