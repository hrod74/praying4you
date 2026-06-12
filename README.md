# Praying For You

Praying For You began as a simple Advanced JavaScript class project hosted on Firebase. The original web app allowed users to submit and view prayer requests.

This repository preserves the original Firebase web version in `/legacy-web-app` and will be used to rebuild the app as a cross-platform React Native mobile application for iOS and Android.

## Project Goals

- Rebuild the app using React Native and Expo
- Support user accounts with email-based authentication
- Allow users to post prayer requests publicly or anonymously
- Let users browse and pray for submitted requests
- Add prayer counts and engagement features
- Add reporting and moderation support for user-generated content
- Prepare the app for iOS and Android deployment
- Explore lightweight monetization through mobile ads

## Repository Structure

```text
praying4you/
  legacy-web-app/
    Original Advanced JavaScript / Firebase web app

  mobile-app/
    React Native / Expo mobile app (in progress)

  docs/
    Planning, requirements, roadmap, and AI development-team reviews
```

## Mobile App (Prototype)

The new React Native / Expo app lives in [`mobile-app/`](mobile-app/). It is being
built mock-data-first as a functional local prototype (no Firebase, ads, or app-store
config yet — those are later milestones).

To run it locally:

```bash
cd mobile-app
npm install
npx expo start
```

Then open it in **Expo Go** (scan the QR code), or press `i` for the iOS simulator or
`a` for the Android emulator. See [`mobile-app/README.md`](mobile-app/README.md) for
full setup and run details.

## Documentation

Planning and process docs live in [`docs/`](docs/): the
[implementation plan](docs/implementation-plan.md), the
[prototype roadmap](docs/prototype-roadmap.md), the
[product requirements](docs/product-requirements.md), and phase
[reviews](docs/reviews/) produced by the project's AI development-team roles
([`docs/agents/`](docs/agents/)).
