# Demo Readiness Checklist — Praying For You (Local Prototype)

A quick guide for demoing the local prototype and capturing portfolio screenshots. This
is the **local/mock milestone** — everything runs on-device with no backend.

## App run command

```
cd mobile-app
npm install
npx expo start
```

Then open the project in **Expo Go** on an iPhone (scan the QR code). Use
`npx expo start -c` to clear the cache after dependency or SDK changes.

> Requires the public iOS Expo Go app (Expo SDK 54). No login, no build step, no cloud
> project is needed for the demo.

## Recommended demo flow

1. **Open the app.** The Welcome screen introduces the space and notes it is a local
   prototype.
2. **Create a local profile.** Tap "Get started", enter a display name and email, then
   create the profile. (Mention: the email is private and stays on the device.)
3. **View the Feed.** The prayer requests load newest first as calm, journal-style cards.
4. **Open a prayer detail.** Tap any card to read the full request.
5. **Tap "I prayed for this."** The count goes up by one and the card shows you prayed.
   Tapping again does not add another count.
6. **Submit a new prayer.** Tap the **Share** tab (always reachable, even after
   scrolling), write a request, pick a category, choose named or anonymous, and share it.
7. **Confirm it appears at the top of the Feed.** Go back to the Feed; your new request is
   at the top.
8. **Open Verse of the Day.** Tap the **Verse** tab for the day's scripture and a short
   reflection.
9. **Open Settings / About.** Tap the **Settings** tab to show the profile, the privacy
   language, and the About section.
10. **Explain privacy and prototype limits.** Point out that the email is never shown
    publicly, that anonymous posting is a per-request choice, and that this is a local
    prototype (see limitations below). Optional: show "Reset prototype data" in Settings.

> Tip: to show persistence, submit a request and tap "I prayed for this," then fully close
> and reopen the app. Your submitted request and prayed mark are still there. Use "Reset
> prototype data" in Settings to return to a clean starting state before a fresh run.

## Screenshots to capture for portfolio

- **Welcome** screen
- **Feed** (list of prayer requests)
- **Prayer detail** (with the "I prayed for this" action or the "You prayed" state)
- **Submit Prayer** (the Share form)
- **Verse of the Day**
- **Settings / About**

## Known prototype limitations

- Local / mock data only.
- No real accounts yet (the profile is a local simulation, no password).
- No shared prayers across devices yet (everything is on this one device).
- No real moderation backend yet (reporting is recorded locally only).
- No Firebase yet.
- Not app-store-ready yet.

## Recommended next phase after Phase H

**Firebase planning in Plan Mode before any implementation.** Before writing backend code,
plan the Firebase-backed MVP: data model and Firestore security rules (auth-gated reads,
owner-only writes), authentication, the reporting/moderation approach, and how the local
prototype's `prayerService` seam maps onto Firestore. Decide configuration handling using
safe environment/config patterns (never hardcoded secrets), then implement.
