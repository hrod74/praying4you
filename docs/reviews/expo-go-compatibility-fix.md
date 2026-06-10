# Expo Go Compatibility Fix

**Date:** 2026-06-10
**Type:** Compatibility fix (pre–Phase C)
**Commit:** `chore: align Expo app with Expo Go compatibility`

> **⚠️ Superseded.** This change moved the app to **SDK 55**, but the public iOS Expo Go
> only supports **SDK 54**, so the incompatibility error persisted. The app was
> subsequently pinned to SDK 54 — see
> [`expo-go-ios-compatibility-fix.md`](expo-go-ios-compatibility-fix.md) for the
> verified fix. This document is kept for history.

---

## What failed

Opening the Phase B app in **Expo Go** on an iPhone (latest public Expo Go from the App
Store) failed with:

> "Project is incompatible with this version of Expo Go. The project you requested
> requires a newer version of Expo Go."

The project could not be opened on the device at all.

## Root cause

The app had been scaffolded on **Expo SDK 56** (the `create-expo-app@latest` default in
this environment), which pulled bleeding-edge runtime versions: `react-native@0.85.x`,
`react@19.2.3`, `expo-router@56.x`.

The public Expo Go app ships support for **one** SDK at a time — the current *stable*
SDK — and SDK 56 is not yet that stable release. The npm dist-tags for `expo` confirm
this:

- `sdk-52`, `sdk-53`, `sdk-54`, **`sdk-55`** → released SDKs with a stable channel
  (Expo Go-supported).
- **There is no `sdk-56` tag.** SDK 56 exists only as `latest` / `next` / `canary-sdk-56`
  (and `canary` already points at 57). In other words, `expo@latest` (56.0.9) is the
  edge release, not the Expo Go–blessed stable.

So the device's Expo Go (built for the current stable SDK, 55) correctly refused to open
a 56 project. This is a project/runtime SDK mismatch, not a device or App Store problem.

## What changed

Downgraded the app to **Expo SDK 55** — the latest stable SDK supported by the current
public Expo Go — and realigned every managed dependency to SDK-55-compatible versions
using Expo's own tooling (`npx expo install --fix`). No app logic was changed; this is a
dependency/runtime alignment only.

Dependency changes (`mobile-app/package.json`):

| Package | Before (SDK 56) | After (SDK 55) |
|---|---|---|
| `expo` | `~56.0.9` | `^55.0.26` |
| `expo-router` | `~56.2.9` | `~55.0.16` |
| `expo-constants` | `~56.0.17` | `~55.0.16` |
| `expo-linking` | `~56.0.13` | `~55.0.15` |
| `expo-status-bar` | `~56.0.4` | `~55.0.6` |
| `react` | `19.2.3` | `19.2.0` |
| `react-native` | `0.85.3` | `0.83.6` |
| `react-native-gesture-handler` | `~2.31.1` | `~2.30.0` |
| `react-native-safe-area-context` | `~5.7.0` | `~5.6.2` |
| `react-native-screens` | `4.25.2` | `~4.23.0` |
| `typescript` (dev) | `~6.0.3` | `~5.9.2` |
| `@react-native-async-storage/async-storage` | `2.2.0` | `2.2.0` (unchanged) |
| `@types/react` (dev) | `~19.2.2` | `~19.2.2` (unchanged) |

Also:

- **Removed `mobile-app/.npmrc`** (`legacy-peer-deps=true`). It existed only to work
  around a SDK-56 web-only `react-dom` peer mismatch. On SDK 55 a plain `npm install`
  resolves cleanly under strict peer rules, so the workaround is gone and the lockfile
  was normalized.
- **Updated `mobile-app/README.md`:** added an Expo SDK / Expo Go compatibility note
  (targets SDK 55) and removed the now-obsolete `.npmrc` references.

What did **not** change: TypeScript, Expo Router, AsyncStorage, and the entire Phase B
local auth/profile flow (AuthContext, create-profile, simulated sign-in/out, gating,
persistence) — all retained and verified working. No EAS project, no dev build, no
Firebase, no AdMob.

## How to run the app in Expo Go

```bash
cd mobile-app
npm install
npx expo start
```

Then scan the QR code with the **Expo Go** app on your iPhone/Android (latest public
version from the App Store / Play Store). The project now targets SDK 55 and opens
without the incompatibility error. You can also press `i` (iOS Simulator) or `a`
(Android Emulator).

## Validation performed

| Check | Command | Result |
|---|---|---|
| Reinstall after SDK change | `npm install` (no `--legacy-peer-deps`) | Succeeds; strict peer resolution clean |
| Config/deps health | `npx expo-doctor` | 19/19 checks pass |
| Type-check | `npx tsc --noEmit` | Exit 0 — no errors |
| Bundle / routes | `npx expo export --platform ios` | Bundles (1044 modules); routes + AsyncStorage resolve |
| Local run | `npx expo start` | Dev server up, manifest HTTP 200 on `:8081` |
| Secret scan | real-value patterns over `mobile-app/` source/config | No matches |
| Scope | `git status` | Only `mobile-app/` + this doc; `legacy-web-app/` and `.claude/` untouched |

## Expected outcome on device

With the app now on SDK 55, the current public **Expo Go** should open the project
normally (the incompatibility error is resolved). Confirm on-device by scanning the QR
code; if Expo Go still reports a mismatch, ensure Expo Go is updated to its latest App
Store version.

## Follow-ups

- Stay on the Expo Go–supported **stable** SDK going forward; only move to SDK 56+ once
  it is the public Expo Go stable (or switch to a dev build, which is out of scope now).
- Phases C–H continue on SDK 55.
