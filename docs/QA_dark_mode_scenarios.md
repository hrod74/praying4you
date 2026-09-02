# QA Dark Mode Scenarios

## Current status

**IMPLEMENTED, AUTOMATED QA IN PROGRESS, PHYSICAL-DEVICE QA PENDING, 2026-09-02.**

Prayer Table follows the operating system's Light or Dark appearance automatically. There is no
in-app appearance control or stored preference, and appearance does not change the user's account,
Firebase data, prayer data, or privacy posture.

Automated regression coverage verifies both the system-appearance resolution and the integration
contract that every themed UI module subscribes to live device-mode changes. The suite also fails
if Expo is configured to force a single appearance.

## Before you start

- [x] Run the branch `feat/dark-mode` with `npx expo start -c`
- [x] Use an account that can open the feed, create form, verse, Settings, prayer detail, and report
- [x] If possible, test once on iOS and once on Android before the combined tester build

## Scenario 1: Device appearance

- [x] With the app open, change the phone appearance to **Dark** and confirm the app follows immediately
- [x] Change the phone appearance to **Light** and confirm the app follows immediately
- [x] Close and reopen the app in each appearance and confirm it starts in the device's current mode
- [x] Confirm Settings does not contain a separate appearance control

## Scenario 2: Isolation

- [x] Sign out and sign back in; confirm the app continues to follow the device appearance
- [x] Confirm changing appearance does not modify the profile, requests, prayer counts, reports, or hidden accounts
- [x] Confirm no Firebase document or network write occurs solely from changing appearance

## Scenario 3: Full-screen visual regression

Check each screen in Light and Dark. Text must remain readable, borders and controls must remain
distinguishable, and no screen should retain a light-theme panel on a dark canvas.

- [x] Welcome
- [x] Create account
- [x] Sign in and password-reset states
- [x] Feed, filters, loading, empty, and error states
- [x] Prayer detail, including prayed, owner, Safety and privacy, and reported states
- [x] Create and edit prayer forms, including validation and content-filter errors
- [x] Report form and report confirmation
- [x] My prayer requests and Prayers I've prayed for
- [x] Verse
- [x] Settings profile, activity, privacy, hidden accounts, password, sign-out, and deletion sections
- [x] Top headers, modal headers, bottom navigation, status bar, and feedback banners

## Scenario 4: Functional regression

- [x] Create a prayer in Dark; confirm it appears normally
- [x] Pray for another request; confirm state and count update normally
- [x] Submit a report; confirm private-review behavior is unchanged
- [x] Change feed sorting/filtering; confirm behavior is unchanged
- [x] Edit profile and sign out/in; confirm behavior is unchanged
- [x] Confirm keyboard focus, scrolling, and modal navigation still work in both appearances

## Scenario 5: Accessibility and comfort

- [x] Confirm primary and secondary text are comfortably readable in Dark
- [x] Confirm error and success states retain text/icon meaning, not color-only meaning
- [x] Test large text in both Light and Dark for clipping or overlap
- [x] Confirm the dark canvas is deep navy-charcoal rather than pure black and does not feel glaring

## QA notes

Record device, OS, result, and any visual issue here before approving the combined tester build.

```text
- Pending owner physical-device QA.
```
