# Product State Evidence Review, Praying For You Community

Document type: Evidence review (source-of-truth input to the living roadmap and idea backlog)
Product: Praying For You Community (working name; store-facing name in current repo artifacts is still "Praying For You", see Section 9)
Prepared by: PSS lead agent, with analysis from an evidence-analyst sub-agent
Date: 2026-08-31
Method: Read-only inspection of the praying4you repository and PSS Product_Lifecycle playbooks via the device bridge. No files were modified during this review. All paths are relative to `Products/praying4you/` unless otherwise noted.
Status: Living reference document. Superseded portions should be dated and appended, not silently deleted. Review again the next time app.json, eas.json, store artifacts, or major QA docs change materially.
Related documents: `docs/product-roadmap.md`, `docs/product-ideas.md`, `docs/prototype-roadmap.md` (historical, preserved as-is), `Playbooks/Product_Lifecycle/`

---

## 1. Verified Current Product State

- Stack (confirmed): React Native 0.81.5 / React 19.1.0, Expo SDK ~54.0.35, TypeScript ~5.9.2, Expo Router ~6.0.24, Firebase JS SDK ^12.15.0 (Auth + Firestore), EAS CLI >=13.2.0. Source: `mobile-app/package.json`, `mobile-app/eas.json`.
- App identity: `expo.name` is "Praying For You" (not "...Community"), slug `praying4you`, iOS bundle ID / Android package `com.productsparkstudio.prayingforyou`, `version: 1.0.0`, no fixed `ios.buildNumber` or `android.versionCode` (delegated to EAS remote versioning). Source: `mobile-app/app.json`.
- EAS project linked to `@product-spark-studio/praying4you` with EAS Update configured (`runtimeVersion.policy: appVersion`). Source: `mobile-app/app.json`, commits `9c0ee5b` (2026-08-16) and `5dcac29` (2026-08-17).
- Data model (Firestore, confirmed): `users/{uid}`, `prayerRequests/{id}`, `prayerInteractions/{id}`, `reports/{id}`, `hiddenAccounts/{id}`. Source: `mobile-app/firestore.rules`.
- Uncommitted working-tree changes exist that materially affect release configuration: `app.json` adds `ios.infoPlist.ITSAppUsesNonExemptEncryption: false`; `eas.json` adds `environment` keys per build profile; `package.json` adds `validate:release-env` / `test:release-env` scripts and an `eas-build-pre-install` hook; new untracked files `mobile-app/scripts/validate-release-env.mjs` and `.test.mjs`; `docs/QA_alpha_readiness.md` and `docs/QA_eas_android_standalone_scenarios.md` were edited to add a "Store-release boundary" / "Mandatory release gate" note dated 2026-08-28. This is the environment-variable safety net that would have caught the missing-Firebase-env-vars incident. It is not committed to git as of this review.
- Current git branch: `feat/feed-scale-readiness`, up to date with its remote; a separate `main` branch exists. Most recent committed work: `02b533f docs: approve reviewer account strategy` (2026-08-17). Most recent file activity by modification time is 2026-08-29 (the uncommitted release-gate work above), which is newer than the latest commit. Git log alone understates recent activity.

## 2. Implemented Capabilities

Verified in code and QA-passed: email/password sign-up-in-out; forgot/change password; shared prayer-request feed with named/anonymous posting and categories; create/edit/soft-remove own requests; "I prayed for this" with aggregate counts and duplicate-prevention; daily Bible verse; profile/settings with display-name edit and propagation; content reporting; hidden accounts (block/hide a user's posts); pre-publication content filter; terms-acceptance gate (client-side only, Firestore does not independently enforce it, a documented deferred hardening item); account deletion with Firestore cleanup; feed sort/filter; EAS OTA updates (Android verified, iOS unverified, no iOS build exists yet).

Documented-only or partial: accessibility/larger-text support (real fixes shipped from tester feedback, but no recent dedicated QA doc verifies the current build).

Verified as NOT implemented: behavioral analytics (no Firebase Analytics/Crashlytics/Performance Monitoring/Cloud Messaging/Storage/App Check/Remote Config initialization found anywhere; confirmed in `docs/store/App_Privacy_and_Google_Data_Safety_Worksheet.md`); monetization/ads (deliberately deferred); crash reporting (deliberately deferred).

iOS + Android support: Android has a QA-passed EAS preview build. iOS runs under Expo Go only (per `docs/reviews/expo-go-ios-compatibility-fix.md`); no repo evidence exists of a signed EAS iOS build, an App Store Connect submission, or TestFlight configuration.

## 3. Beta and Distribution Status

Android: an EAS preview-distribution APK was built and passed owner QA on an Android emulator on 2026-08-16 (EAS build `05a3a8ed-5a31-4cfe-9a36-9ef5655cf694`, source commit `75a53db`). No repo evidence was found of a Google Play Console internal-testing-track upload, a "PSS Internal QA" tester list, or a tester count, these are console-side facts not visible in a code repository, so the owner-reported figures should be treated as owner-reported, not independently verified here, and can be confirmed directly against the Play Console.

iOS: no EAS iOS build, App Store Connect record, or TestFlight configuration was found anywhere in the repository. `.local/APP_DISTRIBUTION_TRACKER.md` (last touched 2026-08-06) explicitly lists "TestFlight release, Not started." The owner-reported Apple-approved external TestFlight group "PSS Beta Testers" is not verifiable from repository evidence and should be confirmed directly against App Store Connect.

Versioning: app version 1.0.0 throughout; build numbers are delegated to EAS remote versioning and are not tracked in-repo.

Store readiness artifacts exist and are owner-approved (store listing copy, full store asset package, age-rating worksheet, app-privacy/data-safety worksheet, reviewer-account strategy) but these are pre-submission planning artifacts, not evidence of an actual store submission or review outcome.

Store-facing product name in every repository artifact inspected through 2026-08-29 is "Praying For You," not "Praying For You Community." No file anywhere in the repository uses the string "Praying For You Community." See Section 9.

*Update, 2026-08-31: the owner directly confirmed current tester counts in the product-strategy conversation that produced this review. See Section 11 for the details; this section is left as originally written to preserve what was and was not verifiable in the repository at the time of the original review.*

## 4. Unresolved Product Questions (pulled from the repo's own open-questions lists)

Permanent app name (provisional per the new competitive-discovery workflow; no completed Pre-Beta Competitive Refresh exists for this product yet). Whether the app will use analytics, advertising, subscriptions, donations, or in-app purchases. Final minors/age-rating decision for public release (current 18+ posture is explicitly beta-only). Final data-retention/anonymization wording for deleted accounts. Who is responsible for moderation if the owner is unavailable. Support email / support webpage stand-up (currently placeholder-only). Whether the hosted Privacy Policy/Terms pages reflect beta-specific 18+ language. Tablet support decision. D-U-N-S number status for Apple/Google org enrollment. Whether a white-label/organization ("Church edition") concept should ever be pursued (explicitly parked as future-only, not started).

## 5. Stale or Conflicting Documentation

Root `README.md` (Jun 12): says Firebase, ads, and app-store config are "later milestones." Firebase is now fully implemented and store prep is far along. Treat as historical/stale.

`docs/prototype-roadmap.md` (Jun 16): predates almost all Firebase/QA/store work. Preserve as historical; do not overwrite; do not use for current-state claims.

`.local/APP_DISTRIBUTION_TRACKER.md` (last full update 2026-08-06): still shows "TestFlight release, Not started" and "no EAS config," superseded by the Aug 16-17 Android/EAS work and the Aug 28-29 uncommitted release-gate work. Needs a reconciliation pass; treat as stale until updated.

`docs/reviews/Beta_Readiness_Assessment.md`: the top-line "Overall Assessment" verdict is contradicted by the document's own later dated addenda (through 2026-08-17), which record the Android standalone build succeeding. Read the dated addenda, not just the original verdict. No post-2026-08-17 reconciliation exists.

`docs/beta-feedback-plan.md` (2026-08-06 note): states wider beta recruitment (8-15 testers) "has not started," predating the Android EAS build; not reconciled against any later activity either way.

`mobile-app/app.json` name field vs. the "Praying For You Community" framing used in current product conversations: every store-facing artifact in the repo through 2026-08-29 (store copy, asset manifest, and an explicit QA checklist item confirming the product name) uses "Praying For You." This is a live discrepancy, not just staleness, see Section 9.

`docs/QA_alpha_readiness.md`: the base checklist is Alpha-scoped (Expo Go, mock local mode); a 2026-08-28 addendum clarifies it is not sufficient as a store-release gate on its own. Current, but read the addendum.

## 6. Known Evidence and Evidence Gaps

Behavioral analytics gap is confirmed: no analytics SDK is initialized anywhere in the app (`docs/store/App_Privacy_and_Google_Data_Safety_Worksheet.md`); this was a deliberate, documented deferral, not an oversight. The PRD's planned analytics event taxonomy (`docs/product-requirements.md` section 12) was never implemented. No usage or behavioral data source exists for this product today.

Qualitative feedback sources that do exist: `docs/reviews/phase-h3-accessibility-theme-foundation-review.md` references real accessibility fixes triggered by actual tester feedback (source/count unspecified); `docs/QA_feed_sort_filter_performance.md` references early Alpha feedback as the origin of the shipped sort/filter feature; `docs/beta-feedback-plan.md` defines a survey/interview process, but its own text says the survey and scheduling links are placeholders with no real URLs stored in the repo, the collection mechanism is designed but not yet operational. No aggregated tester feedback log, survey response data, or interview notes exist in the repository; all qualitative "evidence" found is secondhand and owner-summarized, not raw feedback artifacts.

All "QA passed" documentation reflects the owner personally completing a checklist on one device or emulator on one date, not independent tester validation at scale. Treat "QA passed" as "personally verified once," not "validated broadly in the field."

No crash reporting or monitoring tooling exists (deliberately deferred), so there is no evidence source for post-install stability beyond what the owner personally observed during manual QA.

## 7. Important Risks

Technical: the EAS release-environment safety net (the exact kind of guard that would have prevented the missing-Firebase-env-vars incident) is currently uncommitted and would not protect a build from a clean checkout or from origin until committed. The newly added "mandatory release gate" checklist in `docs/QA_eas_android_standalone_scenarios.md` is itself currently unchecked for the next release. No crash reporting exists ahead of wider external distribution. Terms acceptance is enforced client-side only.

Product: the approved store listing copy, approved store assets, and an explicit QA "product name" check are all built around "Praying For You," not "Praying For You Community", if the store-facing name has in fact changed, none of the approved store materials reflect that yet, which is a real submission-consistency risk. No behavioral analytics means any future roadmap prioritization will rely on manual QA notes and unstructured feedback rather than usage evidence. The beta 18+ age-rating posture is explicitly temporary; the public-release audience decision is unresolved and could change scope, store category, and required protections.

Process: PSS's own new playbook documents that the naming collision was discovered only after reaching beta distribution, meaning brand production, store asset capture, and store copy were all completed under "Praying For You" before the collision-driven review process existed. A name change now touches `app.json`, EAS/store bundle identifiers, approved store copy, approved store assets, and QA "product name" checks. Several core status documents (`.local/APP_DISTRIBUTION_TRACKER.md`, the top line of `Beta_Readiness_Assessment.md`) are stale by their own admission and have not been reconciled since 2026-08-06/08-17 respectively.

## 8. Decisions That Require Owner Confirmation

Whether "Praying For You Community" is the adopted store-facing name going forward, and if so when it gets propagated into app.json, EAS/store configuration, approved store copy, approved store assets, and QA checks (none currently reflect it). Whether the Google Play internal testing track and iOS TestFlight submission described in current conversation have actually occurred outside what this repository shows (repo shows an Android EAS preview build and QA, and zero iOS build or submission artifacts). Public-release age rating and target audience. Whether and when to run the new mandatory Pre-Beta Competitive Refresh for this product. Whether to commit the currently-uncommitted release-environment safety net before any further EAS builds. Business-bank-account and D-U-N-S status. Support email / support webpage stand-up. Whether wider beta recruitment (8-15 testers) has started.

## 9. Naming Collision and Competitive-Discovery Findings

What happened, per PSS's own record: `Playbooks/Product_Lifecycle/Competitive_Discovery_and_Differentiation_Workflow.md` states in its closing origin note that the practice was adopted after PSS reached beta distribution for Praying For You and then discovered an existing iOS app using the same name, serving an adjacent prayer-management need. The products are not identical, but the collision should have been identified during discovery and re-checked before store materials were approved. `Playbooks/Product_Lifecycle/Beta_Readiness_Framework.md` (v0.2, dated August 25, 2026) corroborates the same story: the pre-beta competitive refresh was added as required evidence after a name collision was discovered during beta distribution for Praying For You.

Timeline reconstruction from file evidence: 2026-08-15, store listing copy and the full store asset package (icons, screenshots, feature graphic) were approved under the name "Praying For You." 2026-08-16 to 17, the Android EAS build, EAS Update, and remaining beta-readiness QA were completed, still under "Praying For You." 2026-08-25, three new PSS playbook/template documents were created in response to the collision: `Competitive_Discovery_and_Differentiation_Workflow.md`, `Templates/Competitive_Landscape_and_Differentiation_Brief_Template.md`, and `Templates/Pre_Beta_Competitive_Refresh_Template.md`, alongside a v0.2 revision of `Beta_Readiness_Framework.md`. These are studio-level process assets, not a one-off product fix, consistent with the collision having driven a PSS-wide process change.

What is not evidenced in the repo: no completed competitive-discovery brief or differentiation document exists yet for praying4you itself. The template exists; its application to this product does not. No document names the colliding app in detail or records discovery evidence (screenshot, listing link, date). As of the most recent file activity in the repo (2026-08-29), every store-facing artifact still uses "Praying For You," not "Praying For You Community." Either the rename has not yet been propagated into any repo artifact, or it remains a considered-but-unimplemented option. This discrepancy belongs at the top of this product's punch list.

## 10. Source Classification

Observed fact (verified directly in code, config, or docs): the tech stack and data model listed in Section 1; the full core-experience capability list in Section 2 with the QA documents cited; that no behavioral analytics SDK is initialized anywhere in the app; that an Android EAS preview APK was built and passed owner QA on 2026-08-16; that a commit fixing inline Firebase config in EAS bundles immediately precedes the corrected Android preview build, corroborating (without spelling out verbatim) the owner's account of a Firebase-config defect being found and fixed; that an uncommitted `validate:release-env` guard checking six `EXPO_PUBLIC_FIREBASE_*` variables now exists; that the store-facing name in every repo artifact through 2026-08-29 is "Praying For You," not "...Community"; the naming-collision origin story recorded in the two PSS playbook documents; that no iOS EAS build, App Store Connect record, or TestFlight artifact exists anywhere in the repository.

Owner-reported (stated in product conversations, not independently found in the repo): the Android build being published to Google Play internal testing with four testers on a "PSS Internal QA" list; the iOS build being uploaded to App Store Connect and Apple-approved for external TestFlight under a "PSS Beta Testers" group; the specific "six Firebase env vars not copied from preview to production, causing 'No profile yet,' fixed by copying vars and rebuilding" incident narrative (corroborated in spirit, not verbatim, by the commit history and the new validation guard); recent manual beta test scenarios generally passing (consistent with, though broader than, the specific dated QA docs in the repo); that the store-facing name has already been changed to "Praying For You Community" (contradicted by every dated artifact currently in the repo).

Unresolved assumption (neither verified nor clearly stated): whether wider 8-15 person beta recruitment has begun; whether hosted Privacy Policy/Terms pages have been updated with beta-specific 18+ language; whether the uncommitted release-environment safety net will be committed before the next EAS build; actual current tester engagement, retention, or satisfaction (no qualitative data source exists beyond owner-summarized QA notes); whether the naming collision has received any legal or trademark assessment (the new workflow explicitly frames its own check as an early collision screen, not a legal clearance opinion).


## 11. Owner Confirmation Addendum (2026-08-31, post-review)

This section records information the product owner confirmed directly in the product-strategy conversation that produced this review, after the original review (Sections 1 through 10) was completed. It is appended, not merged into the sections above, so the original review still accurately reflects what repository evidence alone could and could not show.

- **iOS distribution:** 8 users have downloaded and opened the app through TestFlight. This updates the Section 3 / Section 10 treatment of iOS distribution from "no repository evidence, owner-reported and unverified" to "owner-confirmed directly, with a specific current count." It is still not independently verified against App Store Connect itself (no repository artifact can show that), but it is a direct, specific, current owner statement rather than a general claim.
- **Android distribution:** 6 users are on Android (previously discussed as approximately 4 on a "PSS Internal QA" list; the owner's 2026-08-31 figure of 6 is the current, authoritative count and should be treated as superseding the earlier figure).
- **Classification:** these two figures are best classified as **owner-confirmed (dated, specific)**, a step more reliable than the general **owner-reported** classification used in Section 10, but still short of **observed fact (repository-verified)** since a code repository cannot independently confirm console-side tester counts. Treat them as current and actionable; reconfirm against the actual consoles only if a decision hinges on exact precision (for example, a decision gated on a specific tester-count threshold).

This addendum should be read alongside `docs/product-roadmap.md`'s v1.2 change-log entry, which reflects the same update.
