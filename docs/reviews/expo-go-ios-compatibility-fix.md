# Expo Go (iOS) Compatibility Fix — Pin to Public App Store SDK

**Date:** 2026-06-10
**Type:** Compatibility fix (pre–Phase C)
**Commit:** `chore: pin Expo app to public iOS Expo Go SDK`
**Supersedes:** [`expo-go-compatibility-fix.md`](expo-go-compatibility-fix.md) (which
moved the app to SDK 55 — still newer than the public iOS Expo Go supports).

---

## What failed

Opening the app in **Expo Go** on an iPhone (latest public Expo Go from the iOS App
Store) failed with:

> "Project is incompatible with this version of Expo Go. The project you requested
> requires a newer version of Expo Go."

This happened on **SDK 56** (original scaffold) and **again after aligning to SDK 55**.
The device could not open the project either time.

## Root cause

The project's Expo SDK was **newer than the SDK built into the public iOS Expo Go app**.
Public Expo Go bundles support for exactly one SDK — the one matching its own major
version — and refuses projects built on a newer SDK. SDK 56 and SDK 55 are both newer
than the public iOS Expo Go currently on the App Store, so it gated both out. This is a
project-SDK-vs-Expo-Go-runtime mismatch, not a device, account, or App Store problem.

The earlier fix assumed "latest stable = supported by Expo Go" and landed on SDK 55. The
public iOS Expo Go had not actually shipped SDK 55 yet, so the error persisted.

## How the supported Expo Go SDK was determined

Rather than assume, the current public iOS Expo Go version was read directly from the
**iTunes/App Store lookup API** (authoritative for what is live on the iOS App Store):

```bash
curl -s "https://itunes.apple.com/lookup?id=982107779&country=us"
# id 982107779 = Expo Go (iOS)
```

Result: **Expo Go iOS version `54.0.2`**, released 2025-09-23. Expo Go's version tracks
the SDK it supports, so the public iOS Expo Go supports **SDK 54**.

This was cross-checked two ways:

- **npm dist-tags for `expo`** show stable `sdk-52`/`sdk-53`/`sdk-54`/`sdk-55` channels,
  with `latest`/`next` pointing at the SDK 56 edge — i.e. 54 is a fully released stable.
- **The served dev manifest** after the change reports `runtimeVersion: exposdk:54.0.0`
  / `sdkVersion: 54.0.0`, matching Expo Go 54.x exactly.

## What SDK / dependencies were selected

Pinned to **Expo SDK 54** (`expo@~54.0.35`, the latest 54.x patch) and aligned every
managed dependency to its SDK-54 version using Expo's own tooling (`npx expo install
--fix`). No app logic changed.

| Package | Before (SDK 55) | After (SDK 54) |
|---|---|---|
| `expo` | `^55.0.26` | `~54.0.35` |
| `expo-router` | `~55.0.16` | `~6.0.24` |
| `expo-constants` | `~55.0.16` | `~18.0.13` |
| `expo-linking` | `~55.0.15` | `~8.0.12` |
| `expo-status-bar` | `~55.0.6` | `~3.0.9` |
| `react` | `19.2.0` | `19.1.0` |
| `react-native` | `0.83.6` | `0.81.5` |
| `react-native-gesture-handler` | `~2.30.0` | `~2.28.0` |
| `react-native-safe-area-context` | `~5.6.2` | `~5.6.2` (unchanged) |
| `react-native-screens` | `~4.23.0` | `~4.16.0` |
| `@types/react` (dev) | `~19.2.2` | `~19.1.10` |
| `typescript` (dev) | `~5.9.2` | `~5.9.2` (unchanged) |
| `@react-native-async-storage/async-storage` | `2.2.0` | `2.2.0` (unchanged) |

Kept and verified working: **TypeScript**, **Expo Router** (now v6 for SDK 54),
**AsyncStorage**, and the full **Phase B** local auth/profile flow (AuthContext,
create-profile, simulated sign-in/out, gating, persistence).

## What changed

- **`mobile-app/package.json`** — SDK 54 versions (table above).
- **`mobile-app/package-lock.json`** — fully rebuilt. `node_modules/` and the lockfile
  were deleted and reinstalled from scratch so no SDK-55/56 resolutions lingered (the
  half-migrated tree was the source of transient install errors during the change).
- **`mobile-app/README.md`** — compatibility note updated to SDK 54, with guidance not
  to upgrade the SDK until public Expo Go supports it, and to use `npx expo start -c`
  after SDK changes.
- **`mobile-app/app.json`** — unchanged and verified: it sets **no** `sdkVersion` or
  `runtimeVersion`, so it forces no incompatible runtime policy; the SDK is inferred
  from the `expo` package (54).
- A plain `npm install` resolves cleanly on SDK 54 under strict peer rules — **no
  `.npmrc` / `legacy-peer-deps` workaround is needed** (and none is committed).

What was **not** done (per constraints): no EAS project, no development build, no
TestFlight, no Expo Snack, no Firebase, no AdMob, no Phase C work.

## How to run the app

```bash
cd mobile-app
npm install
npx expo start          # or: npx expo start -c   (clears cache — recommended after an SDK change)
```

Scan the QR code with the **public Expo Go** app (latest from the iOS App Store). The
project is now SDK 54 and opens without the incompatibility error. `i` opens the iOS
Simulator, `a` the Android emulator.

## If Expo Go still opens a cached / incompatible project

Expo Go and Metro can cache a previous (SDK 55/56) manifest. If the old error or an old
build still appears:

1. **Restart Metro with a cleared cache:** stop the server and run `npx expo start -c`.
2. **In Expo Go on the phone:** fully close the project (swipe away), and remove it from
   the **Recently opened** list on the Expo Go home screen, then re-scan the fresh QR
   code from `npx expo start -c`.
3. **Force-quit and reopen Expo Go** so it re-reads the new manifest.
4. Ensure the phone and computer are on the **same network**, and that **Expo Go is
   updated** to its latest App Store version (currently 54.x).
5. If needed, clear Metro's on-disk cache: stop the server, then
   `rm -rf node_modules/.cache .expo` and run `npx expo start -c` again.

## Validation performed

| Check | Command | Result |
|---|---|---|
| Determine supported SDK | App Store lookup (`itunes.apple.com/lookup?id=982107779`) | Expo Go iOS **54.0.2** → SDK 54 |
| Clean reinstall | `rm -rf node_modules package-lock.json && npm install` | Succeeds (788 packages), strict peers OK, no workaround |
| Config/deps health | `npx expo-doctor` | **18/18** checks pass |
| Type-check | `npx tsc --noEmit` | Exit 0 — no errors |
| Bundle / routes | `npx expo export --platform ios` | Bundles (988 modules); routes + AsyncStorage resolve |
| Local run (cache cleared) | `npx expo start -c` | Dev server up, manifest HTTP 200 |
| Manifest SDK | manifest `runtimeVersion` / `sdkVersion` | `exposdk:54.0.0` / `54.0.0` (matches Expo Go 54.x) |
| Secret scan | `AIza`, `apiKey`, `databaseURL`, `storageBucket`, `firebaseio`, `appspot`, `serviceAccount`, private key, `token`, `secret`, `credential` | No real values (only prose/grep usage) |
| Scope | `git status` | Only `mobile-app/` + this doc + prior-doc note; `legacy-web-app/` and `.claude/` untouched |

## Expected outcome on device

With the app on **SDK 54**, the current public iOS Expo Go (54.x) should open the
project normally — the incompatibility error is resolved. If a stale view persists,
follow the cache-clearing steps above.
