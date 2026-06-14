# Firebase Setup Instructions: Praying For You

**Status:** docs only (Phase J.1). These are the concrete, step-by-step instructions the owner
follows **later**, when it is time to create the new Firebase project. **This document does not
create the project, write code, or add config.** No project is created by reading or committing
this file.

**Audience:** the owner (non-developer friendly), with enough detail to hand to a developer or
to Claude when implementation begins.

**Related:** `firebase-setup-checklist.md` (the checklist this expands), `firebase-mvp-plan.md`
(the full plan), `firebase-review-brief.md` (reviewer summary), `cost-and-publishing-considerations.md`.

---

## 1. Purpose and safety rules

- This document tells the owner **how to create and prepare** the Firebase project later.
- **It does not require creating the project right now.** Create it only when you are ready and
  the go/no-go gate in `firebase-setup-checklist.md` §16 is met.
- **Never commit secrets to GitHub:** no keys, config values, project IDs, Firebase URLs, bucket
  names, tokens, or credentials belong in this repo. Names are fine; values are not.
- **Do not paste private Firebase config into ChatGPT, Claude, Discord, screenshots shared
  publicly, or any public doc.** Treat the config block and any key file as private.
- **Leave the old legacy Firebase project untouched.** Do not open, edit, or delete it unless a
  deliberate future review/migration/archive is decided.
- **The rebuilt app uses a NEW Firebase project** (confirmed owner decision), not the legacy
  `praying4you` project.

> Quick rule of thumb: if it looks like a long random string, a URL ending in a Firebase domain,
> or a downloaded `.json`/`.plist` config file, it is private. Keep it out of git and out of
> chat tools.

---

## 2. Before you start

Confirm each of these before touching the console.

- [ ] You are signed into the **long-term Firebase/Google account** (the one that already owns
      the original app), not a throwaway.
- [ ] New project display name will be **Praying For You**.
- [ ] Project ID will be chosen during setup, preferably something clean and mobile/MVP-oriented
      like **praying-for-you-mobile** if available. (You will record the final ID privately.)
- [ ] Beta targets are **iOS and Android**.
- [ ] **Account deletion is required before beta.**
- [ ] **The feed requires sign-in to read.**
- [ ] **Push notifications are out of scope** for the first Firebase MVP.
- [ ] **Verses remain local** for the MVP.
- [ ] **Reports use manual Firebase console review** for early beta.

---

## 3. Create the Firebase project

Do this only when ready. Stop after creation and ask for review (see §16).

1. Open the **Firebase console** (the Firebase web console in your browser).
2. Click **Create a project** (also called "Add project").
3. Enter the project name: **Praying For You**.
4. **Decide the Google Analytics setting intentionally.** The recommended MVP default is to
   **disable Google Analytics initially.** It is not needed for the backend MVP and can be added
   later at the beta-build phase if you decide you want it.
5. Confirm and finish project creation.
6. **Record the project name and the final project ID privately** (a password manager or a
   private note), **not** in any committed doc in this repo.
7. **Do not copy the app config block into the repo yet.** You will not wire config until the
   implementation phase, and even then it goes through safe environment patterns, not git.

---

## 4. Project ownership and access

- Confirm the project is owned by the **long-term account** from §2.
- **Do not add collaborators casually.** Keep the member list small.
- If developer friends need to review, give **least-privilege access later** (the minimum role
  needed, for the shortest time needed), not owner access.
- **Document privately who has access** (kept out of this repo).
- **Revisit individual vs. company/LLC ownership before public launch.** Individual ownership is
  confirmed fine for planning and early setup.

---

## 5. Authentication setup

1. In the console, go to **Authentication**.
2. Enable the **Email/Password** provider.
3. **Keep all other sign-in providers disabled** for the MVP unless deliberately changed
   (Apple/Google sign-in can be added later).
4. Review the **email verification** options. Verification is **recommended**; the decision on
   whether it **blocks beta access** or is only required before wider/public launch is still
   open and can be made later.
5. Note that **duplicate email detection is handled by Firebase Auth** (it returns
   `auth/email-already-in-use`). A user cannot create or change to an email already attached to
   another account. Do not try to enforce uniqueness with a database query.
6. Confirm the requirement that **user-facing error messages are calm and non-leaky** (never
   reveal which field was wrong, never show raw error codes or stack traces). This is an
   implementation requirement to honor later.
7. **Do not implement app code yet.** This step only configures the provider in the console.

---

## 6. Firestore setup

1. In the console, go to **Firestore Database**.
2. Click **Create database**.
3. **Mode:** choose **production mode** only if security rules are ready. If rules are not yet
   drafted and tested, do **not** connect app code to this database yet. Document what must
   happen first: draft the rules (§7), test them in the emulator (§8), and pass the go/no-go
   gate. Do not leave the database open in test mode with real users.
4. **Choose the region carefully.** This **cannot be changed later**, so pick one appropriate to
   your expected users.
5. **Do not seed production user data manually.**
6. Collections planned (created by the app later, not hand-built now):
   - `users`
   - `prayerRequests`
   - `prayerInteractions`
   - `reports`
   - `auditLogs` (only if used later)
7. **Verses remain local** for the MVP (no `verses` collection needed).
8. **Do not paste real collection documents into public docs** or chat tools.

---

## 7. Security rules preparation

- **Do not connect the app to Firestore until security rules are drafted and tested.** Open
  rules were the legacy app's fatal flaw; never repeat that.
- Security rules must enforce:
  - **Sign-in requirements** (no signed-out reads or writes).
  - **Owner-only edit/remove** (only the author can edit or soft-remove their request).
  - **Email privacy** (no email in shared docs; no cross-user reads of `users`).
  - **Blocked spoofed `userId`** (identity always from the authenticated user).
  - **Duplicate prayed-interaction prevention** (one interaction per user per request).
  - **Prayer count protection** (counter changes only by +1, only with a matching new
    interaction; no free client writes).
  - **Report restrictions** (no reporting your own request; reports are admin-read only).
  - **Duplicate report prevention** (one report per user per request).
- **Security-rule emulator tests are a go/no-go gate before beta.** All allow and deny cases must
  pass before any external tester gets a build.

---

## 8. Firebase Emulator Suite preparation

These are future steps for the implementation phase. The owner does **not** need to run them now.

- Install/use the **Firebase CLI** later if needed.
- Set up the **emulator for Auth and Firestore** (and the Rules emulator).
- **Run the security-rule tests before connecting beta users.**
- Do not require the owner to run these yet unless the implementation phase has started. A
  developer (or Claude) handles the emulator and tests during implementation.

---

## 9. App platform registration planning

- The app will eventually need **platform registration** for iOS and Android (registering an
  iOS app and an Android app inside the Firebase project).
- **Do not register the apps until the implementation phase confirms the app identifiers.**
  - iOS needs a **bundle identifier**.
  - Android needs a **package name**.
- **EAS / build decisions affect this** (an installable beta likely needs an EAS build, since
  Expo Go does not carry native Firebase modules).
- **Do not download or commit config files yet** (`google-services.json`,
  `GoogleService-Info.plist`). They are private and come later, handled safely.

---

## 10. Config and secrets handling

Strong rules. Read before any config touches your machine.

- The **Firebase web config** (apiKey, authDomain, projectId, etc.) is **not** the same as a
  **private service account key**, but it should still be **handled carefully** and kept out of
  git and out of chat tools.
- **Never commit service account keys** (the downloaded admin `.json`). These are highly
  sensitive.
- **Never commit `.env` files with real values.**
- Use a **`.env.example` with placeholder values only** later, if helpful (names, never real
  values).
- Confirm **`.gitignore` protects local config files** (`.env*`, `google-services.json`,
  `GoogleService-Info.plist`, `serviceAccountKey.json`). Names only here, no values.
- **Run a secret scan before committing any config-related change.**
- **Do not paste config into ChatGPT, Claude, Discord, public screenshots, or public docs.**

---

## 11. Account deletion setup planning

- **Account deletion is required before beta with real testers.**
- The deletion behavior must be **defined before beta**:
  - What happens to the **user profile** (`users/{uid}` doc)?
  - What happens to the **email** (removed from Auth and the user doc)?
  - What happens to **authored prayer requests**?
  - Are requests **removed, anonymized, or retained under policy**? (Recommended: anonymize
    authored requests so prayer counts and others' interactions stay coherent. Confirm during
    implementation.)
  - What happens to **reports** the user filed and to **audit logs** (if used)?
- The **Legal / Compliance Advisor should review this before beta** (deletion claims are
  commitments under store policy and privacy expectations). This is advisory, not legal advice;
  a qualified attorney reviews policies before public launch.

---

## 12. Reports and moderation setup planning

- Early beta uses **manual Firebase console review** (a human reads reports and updates a
  request's status).
- **No admin dashboard** in the first beta.
- **Prevent duplicate reports** by the same user on the same request.
- **Block self-reporting** (you cannot report your own request).
- Define the **report reasons** (the controlled set: spam, inappropriate, harmful, other) plus
  an optional short note.
- **Do not expose the reporter's email** (or any email) publicly.
- **Define a manual review process before beta:** who reviews, how quickly, and what action
  (flag, remove, or follow up). Keep reports and any quoted notes private.

---

## 13. iOS and Android beta path planning

- The beta should support **both iOS and Android**.
- **iOS** likely requires the **Apple Developer Program (about $99/year)** and **TestFlight**.
- **Android** likely requires the **Google Play Console ($25 one-time) internal testing**, or
  another approved beta path.
- An **Expo / EAS build may be needed** for an installable beta.
- **Do not promise a beta date until the build/distribution path is confirmed.**
- **Create tester install instructions later** (how to join TestFlight / Play internal testing
  without the developer's machine).

---

## 14. Cost and monitoring setup planning

- **Start with Spark (free) where possible.** It is sufficient for development and a small beta.
- If **Blaze (pay-as-you-go)** is ever needed, **add budget alerts first.**
- Monitor **Firestore reads/writes.**
- Monitor **auth usage.**
- Monitor **logs/crashes** if/when enabled.
- **Avoid enabling paid services casually.**
- **Keep push notifications out of the first MVP** (they would require Blaze plus a Cloud
  Function plus messaging setup).

---

## 15. What to screenshot or record privately

Keep these in a **private** place (password manager or private notes), **not** in this repo, and
**not** in any screenshot shared publicly:

- Project name and project ID
- Auth provider settings (which providers are enabled)
- Firestore region
- Security rules version or draft status
- Billing plan (Spark or Blaze)
- Access / collaborator list
- **Do not share screenshots that show keys or config values publicly.**

---

## 16. Stop points

Pause at each of these and get review before continuing.

- **Stop after project creation** and ask for review.
- **Stop before enabling billing** (before any move to Blaze).
- **Stop before connecting app code** to Firebase.
- **Stop before adding config files** to your machine or the repo.
- **Stop before inviting beta testers.**
- **Stop before adding collaborators.**
- **Stop before enabling Analytics, Crashlytics, or push notifications.**

---

## 17. Owner checklist (plain English)

- [ ] I am in the correct Firebase account (the long-term one).
- [ ] I am creating a **new project**, not using the old legacy project.
- [ ] I know the project name (Praying For You) and the project ID.
- [ ] I know whether Analytics is on or off (recommended: off for now).
- [ ] I know whether billing is Spark or Blaze (recommended: Spark).
- [ ] I did **not** copy any secrets into GitHub or ChatGPT/Claude.
- [ ] I know the Firestore region.
- [ ] I have **not** connected app code yet.
- [ ] I know what still needs developer review.

---

## 18. Developer handoff checklist

What to share with a developer or Claude when implementation begins. **Share status, not
secrets.**

- [ ] Project **display name** (not secrets, not the config block).
- [ ] Confirmation that **Auth is enabled** (Email/Password).
- [ ] Confirmation that **Firestore is enabled.**
- [ ] **Region selected** (which region).
- [ ] **Billing plan selected** (Spark or Blaze).
- [ ] Note that a **security rules draft is needed.**
- [ ] Note that **emulator tests are needed** (the go/no-go gate before beta).
- [ ] **App identifiers** still TBD or confirmed (iOS bundle id, Android package name).
- [ ] **Do not give service account keys or private config.** The developer wires config through
      safe environment patterns, not through chat or git.

---

*Reference: `firebase-setup-checklist.md` (the checklist), `firebase-mvp-plan.md` (the full
plan), `firebase-review-brief.md` (reviewer summary). This document is planning only and creates
nothing.*
