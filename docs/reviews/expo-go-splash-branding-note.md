# Dev Note: Splash / Launch Branding in Expo Go (Phase H.4b)

**Status:** prototype branding only. No Firebase, EAS project, code dependencies, or secrets
were added. Local/mock prototype.

## What was branded

The launch experience now uses **Praying For You** branding on the warm parchment theme,
wherever the project configuration allows it:

- **App icon** (`assets/icon.png`): folded hands (🙏) centered on warm parchment
  (`#F5EFE3`), replacing the default Expo template icon (the blue chevron).
- **Native splash** (`app.json` → `expo.splash`): `assets/splash.png` (folded hands + the
  words "Praying For You" in warm ink) on a warm parchment `backgroundColor` (`#F5EFE3`),
  `resizeMode: "contain"`. Replaces the default Expo splash placeholder.
- **Android adaptive icon** (`app.json` → `expo.android.adaptiveIcon`): warm parchment
  `backgroundColor` and a folded-hands foreground, replacing the default Expo blue
  background and logo. (The unused default `android-icon-background.png` reference was
  removed; the solid `backgroundColor` is used instead.)
- **In-app loading screen** (`app/_layout.tsx`): while the saved local profile/session
  hydrates, a fully controlled branded screen shows 🙏, "Praying For You", and the calm
  line "Preparing your prayer space…" on the warm theme. The emoji is decorative; the
  visible text carries the meaning for screen readers.

The product name remains **Praying For You** everywhere. No Expo logo is used in the
configured assets.

## What is still unavoidable in Expo Go

Some of the launch experience in **Expo Go cannot be fully controlled**, and that is
expected for a prototype run inside the Expo Go host app:

- When a project is opened in Expo Go, Expo Go shows its **own** loading/download UI (the
  Expo Go host screen and a progress/bundling indicator) while it fetches and builds the JS
  bundle. This belongs to the Expo Go app, not to Praying For You, so the app cannot brand
  it away while running inside Expo Go.
- The configured native `splash` (parchment + folded hands) and app icon show most cleanly
  in a **standalone / development build, TestFlight, or an EAS build** of the app, where the
  app owns the full launch window rather than running as a guest inside Expo Go.

**Takeaway:** the brand assets and the in-app branded loading screen are in place now. The
brief Expo Go host loading screen seen during development is a limitation of running in Expo
Go and will not appear in a standalone/TestFlight/EAS build, which uses the configured
splash and icon directly.

## How to verify

```bash
cd mobile-app
npx expo start -c
```

Open in Expo Go: confirm the app name is **Praying For You**, the in-app loading screen
shows 🙏 + "Praying For You" + "Preparing your prayer space…", and the app icon / configured
splash use the warm parchment branding (no Expo blue logo) where the platform shows them.
