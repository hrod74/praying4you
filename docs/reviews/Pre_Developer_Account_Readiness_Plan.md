# Pre-Developer-Account Readiness Plan: Praying For You

**Date:** 2026-08-06
**Companion to:** `Beta_Readiness_Assessment.md` (revised 2026-08-06)
**Type:** Planning only. No code changes, no fixes implemented, no developer accounts created, nothing published, nothing committed or pushed.

**Purpose:** Define the smallest set of work that should be completed before Product Spark Studio pays for Apple Developer Program and Google Play Console access. The target state this plan builds toward:

> Once the developer accounts are created and fees are paid, the immediate next work is generating signed iOS and Android builds, uploading them, and completing store submission, instead of scrambling to finish unrelated prerequisites.

**Current company facts assumed throughout:** Product Spark Studio LLC (Georgia, formed 2026-07-27), EIN obtained, domain `productsparkstudio.com`, Google Workspace Business Starter, business email `admin@productsparkstudio.com`. The business bank account is intentionally deferred and is out of scope for this plan; it does not gate beta or store submission.

---

## 1. Repository Accuracy

The repository contains documentation written before company formation and before parts of the Firebase implementation were finished. None of this is a product defect, but it needs correcting so the team (and anyone else who reads the repo) is working from an accurate picture rather than a stale one.

**Status (2026-08-06): the three "should complete" items below are done.** See the change-log note added to each corrected file, and the new Activity Log entry in `.local/APP_DISTRIBUTION_TRACKER.md` §18, for exactly what changed.

| Item | Priority | Status |
|---|---|---|
| `.local/APP_DISTRIBUTION_TRACKER.md` framed "pre-business-formation" as the current blocking issue (last updated 2026-06-21); needed to reflect the LLC, EIN, domain, and business email as done | Should complete before developer fees | **Done (2026-08-06).** Header, Master Status Dashboard, Phase A/B/C status, open questions, and both Immediate Next Actions lists updated to reflect confirmed formation; a dated Activity Log entry records the change. |
| `mobile-app/README.md` described a "local/mock only, no backend" state, well behind the actual Firebase-backed implementation | Should complete before developer fees | **Done (2026-08-06).** A status-correction banner was added at the top of the file, and the most directly misleading "no backend" claims were corrected inline. The detailed feature walkthrough further down the file was left as-is and is now explicitly labeled as describing the original local-prototype milestone, not current state; it has not been individually re-verified screen by screen. |
| `docs/QA_prayer_interaction_scenarios.md` contained stale language claiming reports are "still local/mock and are not in Firestore"; no longer true | Should complete before developer fees | **Done (2026-08-06).** Corrected to state reports are Firestore-backed and simply out of scope for that checklist (covered by `docs/QA_report_scenarios.md` instead). No scenario checkboxes were touched; the prayer-interaction scenarios themselves are still 0 of 64 verified (see Section 2). |
| `docs/beta-feedback-plan.md` and `docs/privacy-safety-copy.md` status lines both said "no Firebase project/code exist yet," which predated the Firebase MVP build | Not previously listed; found during this pass | **Done (2026-08-06).** Both status lines corrected to reflect the Firebase MVP is built; `beta-feedback-plan.md` now also notes the wider beta hasn't started (only the smaller Alpha has run). |
| `docs/firebase-setup-checklist.md` is a largely-unchecked pre-implementation planning checklist that doesn't reflect what's since been built | **Can wait until after the first beta build**: internal planning artifact, doesn't affect submission or trust | Not started; deliberately deferred, consistent with its original priority |
| No completion review exists for the J.2 Firebase implementation phases, breaking the otherwise-consistent phase-review trail in `docs/reviews/` | **Can wait until after the first beta build**: nice for traceability, not required for readiness | Not started; deliberately deferred, consistent with its original priority |

**What was deliberately left alone:** the many phase-by-phase completion reviews in `docs/reviews/` (Phase A through H.3), `docs/firebase-review-brief.md`, `docs/firebase-mvp-plan.md`, `docs/firebase-setup-checklist.md`, `docs/firebase-setup-instructions.md`, `docs/implementation-plan.md`, `docs/prototype-roadmap.md`, and `docs/demo-readiness-checklist.md` all still describe "local/mock only" or "no backend" in places. These were not corrected: they are dated, point-in-time planning and review artifacts documenting what was true *at that milestone*, and rewriting them would erase useful historical context rather than restore accuracy. The distinction used throughout this pass: documents meant to be read as **current state** (a live README, the distribution tracker, an active QA checklist, an active beta/privacy planning doc) were corrected; documents that are **historical records of a specific past decision or milestone** were not.

**Why this matters:** the distribution tracker in particular is the document this whole plan extends. If it still said "form the LLC" as the next action, it would actively misdirect whoever picks it up next.

---

## 2. Core QA Verification

**Already confirmed:** authentication (sign-in) and password reset were both manually tested on a physical device on 2026-08-06 and passed. This is recorded in `docs/QA_password_management_scenarios.md` (Manual QA Evidence section) and cross-referenced in `docs/QA_alpha_readiness.md`. No further action needed on these two flows for beta purposes.

The remaining flows, ranked by how much they could damage user trust, privacy, data integrity, or the validity of the beta if left unverified:

| Flow | Current state | Priority |
|---|---|---|
| **"I prayed" interaction / prayer counts** | `docs/QA_prayer_interaction_scenarios.md`: 0 of 64 items checked. This is the app's core loop and the one place tamper-resistant count logic lives. | **Blocker before developer fees**: the single highest-value gap; core feature with zero recorded device verification |
| **Account deletion** | `docs/QA_delete_scenarios.md`: 43 of 113 checked (partial). Directly tied to the deletion claims that will go into the privacy policy. | **Blocker before developer fees**: app-store account-deletion requirements and privacy-policy accuracy both depend on this actually working as documented |
| **Reporting** | `docs/QA_report_scenarios.md`: 43 of 54 checked (mostly complete). | **Should complete before developer fees**: finish the remaining items; this is a trust/safety surface so it shouldn't be left partially open, but the gap is small |
| **Prayer creation** | `docs/QA_prayer_request_scenarios.md`: 63 of 63 checked (complete), including the anonymous-posting and ownership cases. | **Should complete before developer fees**: already verified; a quick spot-check re-confirmation is reasonable given time has passed, not a re-run from scratch |
| **Anonymous posting and ownership** | Covered by the complete prayer-request checklist above for creation; the deeper interaction-level checks (e.g., no "who prayed" leakage) live in the still-unverified interaction checklist. | Tracks with the interaction-checklist item above |
| **Feed sorting/filtering** | `docs/QA_feed_sort_filter_performance.md`: 0 of 56 checked and explicitly labeled a code-level review only ("to be confirmed on a device"). Real Alpha testers already exercised this organically and it held up, per `docs/beta-feedback-plan.md` follow-up notes. | **Should complete before developer fees**: organic Alpha usage is reassuring but isn't a substitute for a recorded device pass |
| **Error, empty, loading, and offline behavior** | Designed and implemented per `docs/product-requirements.md` §14 and confirmed present in component inventory (`EmptyState.tsx`, `FeedbackContext`), but no dedicated exhaustive checklist exists. | **Should complete before developer fees** for a basic spot-check across the core flows above; **can wait** for exhaustive edge-case coverage |

**Recommended approach:** run the prayer-interaction checklist next, the same way authentication and password reset were just verified: physical device, dated evidence recorded in the doc itself. Then close out the remaining ~70 unchecked items across delete/report/feed-filter. None of this requires new code; it's execution of checklists that already exist.

---

## 3. Expo and EAS Build Preparation

Everything in this section can be started immediately; none of it requires a paid developer account.

**Status (2026-08-10): bundle identifiers and `eas.json` are done.** See evidence table below.

| Item | Priority | Status |
|---|---|---|
| Confirm current Expo SDK and dependency health (`expo-doctor`, check for outstanding SDK/package updates since the last documented fix) | Should complete before developer fees | **Done (2026-08-10).** `npx expo-doctor` run: 16/18 checks passed. The 2 failures were both network calls this sandbox couldn't reach (`exp.host`, the React Native Directory API), not configuration or dependency problems. `npx expo config --json` confirms the config resolves cleanly under Expo SDK 54. |
| Choose and configure the iOS bundle identifier in `mobile-app/app.json` | Blocker before developer fees | **Done (2026-08-10).** Set to `com.productsparkstudio.prayingforyou`, the identifier already suggested (but never finalized) in this plan and the distribution tracker. No conflicting identifier or prior EAS project association was found anywhere in the repo before setting it. Real-world availability on App Store Connect can only be confirmed at Apple Developer enrollment, which has not happened. |
| Choose and configure the Android package name (mirrors the bundle identifier convention) | Blocker before developer fees | **Done (2026-08-10).** Set to the same string, `com.productsparkstudio.prayingforyou`, per explicit instruction to use one identifier for both platforms. Same caveat: real-world availability on Google Play Console is unconfirmed until enrollment. |
| Create `eas.json` (does not exist yet) | Blocker before developer fees | **Done (2026-08-10).** Created at `mobile-app/eas.json`; valid JSON, confirmed by direct parse. |
| Define development, preview, and production build profiles in `eas.json` | Blocker before developer fees | **Done (2026-08-10), with two corrections from the 2026-08-10 audit.** Three profiles defined: `development` (internal distribution, Android APK), `preview` (internal/ad-hoc distribution, Android APK), `production` (auto-incrementing build number, default Android App Bundle format required by Play Store). `appVersionSource` set to `remote` so EAS manages build numbers rather than requiring manual bumps in `app.json`. **Correction 1:** `preview` was originally described here as "TestFlight-style." That was inaccurate and has been corrected. EAS `distribution: internal` produces an ad-hoc-style build installed via a direct download link for registered testers/devices; it does not go through App Store Connect and is not TestFlight. Actual TestFlight distribution requires a separate `store`-distribution build submitted via `eas submit`, which has not been configured and is a later, submission-stage step, not part of this pre-account build configuration. **Correction 2:** the `development` profile originally included `developmentClient: true`, but the `expo-dev-client` package that flag depends on is not installed anywhere in the project (confirmed absent from `package.json`, `node_modules`, and `package-lock.json`). The app currently runs entirely on plain Expo Go and has no native modules requiring a custom dev client, so the flag was removed rather than adding the dependency. If a future native-module requirement makes a custom dev client necessary, `expo-dev-client` should be installed and this flag restored at that time. |
| Confirm app name, slug, version, build numbers, icons, splash assets, and environment configuration in `app.json` | Blocker before developer fees | **Partially done.** App name/slug/version were already correct and untouched. Icon and splash asset *files* were confirmed to exist and resolve correctly (`expo config --json`), but whether they meet each store's exact size/format requirements was not verified; that needs a dedicated pass, likely alongside store-listing prep (section 5). Build numbers are now handled by `appVersionSource: remote` in `eas.json` rather than needing manual values in `app.json`. |
| Document the exact commands that will eventually generate the iOS IPA, the Android AAB, and an Android APK or preview build | Blocker before developer fees | **Done (2026-08-10).** `eas build --platform ios --profile production` (IPA), `eas build --platform android --profile production` (AAB), `eas build --platform android --profile preview` (APK, for sideload testing without a store). Profile names match `eas.json` above. |
| Determine which build steps can be tested before Apple Developer enrollment | See note below | Unchanged from the original note below; no new evidence changes this. |

**Note on what can be validated before paying for accounts:** Android preview/internal builds via EAS, and all of the JavaScript/TypeScript bundling, dependency, and configuration validation for both platforms, do not require a paid Apple account and can be dry-run now. A fully signed, installable iOS build for TestFlight does require an active Apple Developer Program membership for provisioning and signing. In practice this means: get the EAS project, `eas.json`, bundle identifiers, and Android builds working and verified first; the iOS build becomes the first thing tried immediately after the Apple fee is paid, which matches the target state this plan is building toward. Confirm current EAS/Apple requirements against Expo's documentation at execution time, since platform requirements can shift.

**Still outstanding, requiring an account or credential this pass deliberately did not create:** the EAS project itself is not yet linked (no `extra.eas.projectId` in `app.json`); that requires an Expo account login (`eas login` / `eas init`), which is a real account-creation step and was not performed. `eas config` (EAS's own resolved-config validator) also requires that same login and could not be run; validation here was limited to `expo config`, `expo-doctor`, and direct JSON parsing, all of which are login-free.

*(Update 2026-08-17)*: the outstanding statement above is superseded. The project is linked to the Product Spark Studio Expo organization as `@product-spark-studio/praying4you`, with EAS project ID `0d161eba-4631-418c-a437-4e613a87804d`. Android preview builds have been produced and installed. EAS Update is configured with runtime version `1.0.0`; Android preview OTA delivery and a follow-up cleanup update both passed without reinstalling the APK. See `docs/QA_eas_android_standalone_scenarios.md` and `docs/QA_eas_update_scenarios.md`. No iOS build, production update, store submission, or developer-account enrollment is claimed by this correction.

Explicitly out of scope for this task: no signed production build was created, no account was created or logged into, and no submission occurred.

---

## 4. Privacy, Terms, and Support

**Domain and contact already exist**: `productsparkstudio.com` and `admin@productsparkstudio.com`, so this section is about content and decisions, not infrastructure.

**Minimum public web pages required before store submission:**

| Page | Priority |
|---|---|
| Praying For You privacy policy | **Blocker before developer fees**: both stores require a privacy policy URL for apps that collect account/personal data |
| Praying For You terms of use | **Blocker before developer fees**: recommended given the app has moderation, reporting, and account-deletion claims that benefit from being contractually stated, not just described |
| Support/contact page (can reference `admin@productsparkstudio.com` directly) | **Blocker before developer fees**: both stores require a support URL |
| Product Spark Studio landing page | **Should complete before developer fees**: not because a full marketing site is required (it isn't, and is explicitly out of scope), but because the privacy policy, terms, and support pages need somewhere to live on `productsparkstudio.com`; a minimal single page linking to those three is sufficient |

**Product decisions that must be finalized before drafting accurate policies** (all **Blocker before developer fees**, since the policies above can't be accurate without them):

- Age expectations and minors: currently assumed ("targets adults") but not formally decided; this also feeds the age-rating questionnaires in section 5
- Account deletion: the exact statement of what is removed vs. retained/anonymized (the app already soft-removes authored content on deletion; the policy needs to say so accurately)
- Retention or anonymization of prayer content after deletion or removal
- Anonymous posting: how it's described (anonymous to other users, but not to moderation) needs to match what `docs/privacy-safety-copy.md` already says
- Reports and moderation: that moderation is currently manual, single-person, and console-based should be described honestly rather than implying an automated system
- Analytics and crash diagnostics: none are currently enabled; the policy should say what's collected today, not what might be added later
- Data collected and why: email (private, sign-in only), prayer request content, interaction records; this is already well-documented in `docs/privacy-safety-copy.md` and mainly needs to be carried into the published policy

No legal policies will be drafted during this planning task; this section identifies what's needed, not the text itself.

---

## 5. Store Submission Preparation

Work that can be prepared without developer accounts:

| Item | Priority |
|---|---|
| App description | **Should complete before developer fees** |
| Short description / subtitle | **Should complete before developer fees** |
| Keywords | **Should complete before developer fees**: cheap to prepare now, low risk if refined later |
| App category | **Should complete before developer fees**: quick decision |
| Age-rating questionnaire answers | **Blocker before developer fees**: depends directly on the minors/age decision in section 4 |
| Screenshot plan (device sizes needed, which screens to capture, not the screenshots themselves) | **Should complete before developer fees** |
| Actual screenshots | **Can wait until after the first beta build**: requires a real build to capture from |
| App icon confirmation (icon assets already exist from the design phase; confirm they meet each store's required sizes) | **Should complete before developer fees** |
| Support URL | Tracks with section 4: **Blocker before developer fees** |
| Privacy-policy URL | Tracks with section 4: **Blocker before developer fees** |
| Demo or reviewer-account strategy (sign-in is required to view the feed, so reviewers will need a seeded demo account) | **Should complete before developer fees**: plan and seed-data approach should be decided now; creating the literal account can happen right before submission |
| Tester recruitment and communication materials | **Should complete before developer fees**: the beta plan (`docs/beta-feedback-plan.md`) already has drafted messaging; the placeholder survey/scheduling links just need to be filled in with real links using `admin@productsparkstudio.com` |

---

## 6. Developer-Fee Readiness Gate

**Gate verdict, 2026-08-17: PASSED.** All seven conditions below are satisfied for the controlled beta. Critical QA is recorded with narrow deferrals explicitly accepted; no beta-blocking defect is known; the EAS project, Android standalone build, and Android preview OTA workflow are verified; identifiers are final; the required website pages are live; store copy, age-rating direction, privacy disclosures, and visual assets are approved; and the reviewer-account strategy is approved in `docs/store/Reviewer_Account_Strategy.md`. This verdict authorizes proceeding to Apple Developer Program and Google Play Console organization enrollment. It does not authorize public release or bypass signed-build and store-review QA.

Product Spark Studio should pay for the Apple Developer Program and Google Play Console when **all** of the following are true:

1. **Critical QA has passed.** Authentication and password reset are already confirmed (2026-08-06). The prayer-interaction and account-deletion checklists (section 2) have been run and recorded, and reporting/feed-filter items are closed out or explicitly and knowingly deferred.
2. **No known beta-blocking defects remain.** Anything found during the QA pass above has been triaged, and nothing rises to the level the team's own beta plan defines as a wider-beta blocker (broken anonymity trust, a non-working report path, private data leaking).
3. **EAS configuration is ready.** `eas.json` exists with development/preview/production profiles, bundle identifier and package name are chosen and set in `app.json`, and an Android build has been successfully produced as a dry run.
4. **Required identifiers are selected.** iOS bundle identifier and Android package name are final, not placeholders.
5. **Privacy, terms, and support pages are published or ready to publish.** The pages exist as accurate content (even if simple), hosted or ready to host on `productsparkstudio.com`, and the underlying product decisions in section 4 have been made.
6. **Store metadata is substantially prepared.** Description, short description, keywords, category, and age-rating answers are drafted; the screenshot plan and demo-account strategy are decided.
7. **The team is ready to produce and upload signed builds immediately after account activation.** This means the build commands in section 3 are documented and have been dry-run on Android, so the only new step after paying the Apple fee is actually generating and signing the iOS build.

If all seven are true, paying for the accounts should lead directly into build generation and submission, not into a fresh round of prerequisite work, which is the point of gating the fee this way.

---

## Recommended Execution Order

1. ~~Correct the stale repository documentation~~ (section 1): **done, 2026-08-06.** This step is complete; see the Status note in section 1 above.
2. **Run the prayer-interaction and account-deletion QA checklists** on a physical device (section 2): the two highest-value remaining verification gaps, and both are execution of checklists that already exist. **This is the next executable blocker.**
3. **In parallel with QA:** finalize the product decisions in section 4 (age/minors, deletion statement, retention, moderation description), then draft and publish the privacy policy, terms, and support page on `productsparkstudio.com`, wiring in `admin@productsparkstudio.com`.
4. ~~Set up the EAS project (bundle identifier, package name, `eas.json`, build profiles)~~ (section 3): **done, 2026-08-10** for the config itself (bundle identifier, package name, `eas.json` with three build profiles, validated locally). **Still open:** the EAS project isn't linked yet (needs `eas login`, an account-creation step deliberately not taken this pass), and no dry-run build has been produced (explicitly out of scope for that pass). Producing an actual Android dry-run build is the next concrete step here.
5. **Close out remaining QA items** (reporting, feed-filter device confirmation) and finalize store metadata (section 5): description, keywords, category, age-rating answers, screenshot plan, demo-account strategy, tester communication materials.
6. **Check the Developer-Fee Readiness Gate (section 6).** If all seven conditions hold, enroll in the Apple Developer Program and Google Play Console, then move directly into signed builds and store submission.

This order favors the smallest set of changes that produces a safe, trustworthy beta: it fixes what could actively mislead the team (stale docs), closes the QA gaps that most affect user trust and data integrity, and prepares everything store-related so that paying for developer accounts is followed immediately by real submission work, instead of discovering new prerequisites.

**Deliberately not included in this plan**, per scope: a business bank account (already correctly deferred, doesn't block beta), CI/CD automation, a full marketing website, or a complete brand system. None of these are required for beta submission, and none are recommended here.
