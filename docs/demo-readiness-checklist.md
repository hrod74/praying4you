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
10. **Notice the confirmation feedback.** Each key action (creating the profile, signing
    in, sharing a request, praying, resetting data) shows a quiet confirmation banner near
    the top, so nothing completes silently.
11. **Show Your prayer activity.** In Settings, the "Your prayer activity" section shows
    "Requests shared" and "Prayers lifted." Tap into **My prayer requests** and **Prayers
    I've prayed for** to see those lists; open any card to read its detail.
12. **Show owner controls.** Open one of your own requests (for example from My prayer
    requests). On the detail you can **Edit request** (update the text, category, or
    named/anonymous choice) and **Remove request** (a calm confirmation, then it leaves the
    feed). These controls appear only on requests you created.
13. **Edit your profile.** In Settings, tap "Edit profile" to change your display name or
    email, then "Save profile." A confirmation banner appears. The email stays private and is
    never shown publicly. (On iOS, the keyboard return/done key does not save the form; saving
    is always an intentional tap on the button.)
14. **Explain privacy and prototype limits.** Point out that the email is never shown
    publicly, that anonymous posting is a per-request choice, and that this is a local
    prototype (see limitations below). Optional: show "Reset prototype data" in Settings.

> Phase H.2 mobile UX notes: sharing a prayer request returns you to the Feed (with your new
> request at the top), the bottom-nav icons and labels are a little larger, and forms behave
> well with the iOS keyboard (drag to dismiss; the name field's "next" key moves to email;
> the email "done" key just closes the keyboard).

> Phase H.3 accessibility note: to show larger-text support, set a larger system text size
> (iOS: Settings > Accessibility > Display & Text Size > Larger Text) and relaunch the app.
> The feed, prayer detail, forms, and screens stay readable and scroll instead of clipping;
> the bottom-nav labels stay on one line. Color themes are not built yet, but the theme is
> token-based so future themes (including accessibility themes that are never paywalled) can
> be added cleanly. See `design-direction.md` §15–§16.

> Tip: to show persistence, submit a request and tap "I prayed for this," then fully close
> and reopen the app. Your submitted request and prayed mark are still there. Editing and
> removing a request also persist across restarts. Use "Reset prototype data" in Settings to
> return to a clean starting state before a fresh run.

## Screenshots to capture for portfolio

- **Welcome** screen
- **Feed** (list of prayer requests)
- **Prayer detail** (with the "I prayed for this" action or the "You prayed" state)
- **Submit Prayer** (the Share form)
- **Verse of the Day**
- **Settings / About** (including the "Your prayer activity" summary)
- **My prayer requests** list (with the owner Edit / Remove controls visible on a detail)
- A **confirmation banner** after an action (for example "Prayer request shared.")

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
