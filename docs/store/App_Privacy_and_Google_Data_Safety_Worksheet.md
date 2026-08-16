# Praying For You: Apple App Privacy and Google Play Data Safety Worksheet

## 1. Title

Praying For You: Apple App Privacy and Google Play Data Safety Worksheet, v0.1

**STATUS: OWNER APPROVED v0.1**

## 2. Status and approval boundary

This evidence-based worksheet was approved by the owner as v0.1 on 2026-08-15. The approval adopts
the proposed disclosure direction and records the open decisions and blockers that must be resolved
before console entry. It does not mean any answer is final, submission-ready, configured, submitted,
or published.

- This approval does not authorize entry of answers in App Store Connect or Google Play Console.
  Console work remains a separate future action after the open decisions and final binary checks.
- Approval of the Store Listing Copy v0.1 and Age Rating and Target Audience Worksheet v0.1 does
  not replace this worksheet's separate approval record.
- This review did not log in to Apple, Google, Firebase, Expo, EAS, GitHub, or Porkbun and did not
  build, upload, submit, commit, push, or change application or website behavior.
- Console wording and the shipped binary must be rechecked immediately before submission. A final
  iOS privacy report/privacy-manifest review and a final Android merged-manifest and SDK review
  remain necessary.
- Legal and policy observations are identified separately from proposed console answers. This is
  not legal advice.

## 3. Executive disclosure summary

The production app is not a no-data app. When Firebase configuration is present, it sends account,
authentication, prayer, interaction, and moderation data off the device to Firebase Authentication
and Cloud Firestore. Firebase is used as Product Spark Studio's service provider. Under the current
Google Play definition, that service-provider transfer is proposed as collected but not shared.

The conservative proposed Apple disclosures are:

- Contact Info: Name and Email Address
- Health & Fitness: Health, because users can submit health-related prayer content
- User Content: Other User Content, covering prayer text and optional report notes
- Identifiers: User ID
- Sensitive Info, because prayer content can reveal religious beliefs and other sensitive facts
- Usage Data: Product Interaction, covering prayer actions, reports, request status/category,
  timestamps, and account activity
- Other Data: IP address and user-agent/security data processed automatically by Firebase
  Authentication, pending confirmation of Apple's exact console mapping

All are proposed as linked to identity and not used for tracking. Prayer text, prayer category,
anonymous-display choice, prayer actions, and reports are optional feature use after the required
account setup. Email address, password processing, Firebase user ID, and display name are required
for the current account-based production experience.

The conservative proposed Google disclosures are:

- Personal info: Name, Email address, User IDs, and Other info for religious beliefs or other
  sensitive personal facts users choose to submit
- Health and fitness: Health info when supplied in prayer or report content
- App activity: App interactions and Other user-generated content
- Device or other IDs, or the closest applicable technical-data category, for Firebase
  Authentication user-agent and security processing, subject to final console mapping
- Approximate location should be considered for IP-address processing only if the final form or
  Firebase SDK guidance maps the Auth security IP to that category. Repository evidence does not
  show that the app derives or uses location.

No data is proposed as shared and no data is used for advertising or tracking. Data sent to Firebase
is expected to be encrypted in transit. The app offers in-app account deletion, but deletion is not
complete erasure: authored requests are soft-removed, aggregate prayer counts remain, reports filed
by other users remain, best-effort cleanup can fail, and no Product Spark Studio retention schedule
exists. Firebase also documents service-specific post-deletion retention.

## 4. Evidence reviewed

### Repository and approved documents

Directly reviewed on 2026-08-15:

- `mobile-app/package.json`, `package-lock.json`, `app.json`, and `.env.example`
- `mobile-app/src/config/firebaseConfig.ts`
- Firebase app, Authentication, user-profile, prayer-request, prayer-interaction, and report services
- Mode-aware service seams, `AuthContext`, `PrayerContext`, local `prayerService`, data models, and
  bundled verse/mock data
- `mobile-app/firestore.rules` and the Firebase Rules emulator tests
- Account deletion, password management, profile, prayer request, interaction, report, Firebase
  setup, and rules-test documentation
- `docs/QA_alpha_readiness.md`, account deletion, password, prayer, report, request, and feed QA
  records
- Approved `docs/store/Store_Listing_Copy_Draft.md`
- Approved `docs/store/Age_Rating_Target_Audience_Worksheet.md`
- `docs/privacy-safety-copy.md` and the live Privacy Policy and Terms of Use

### Live URLs

All four URLs resolved with HTTP 200 on 2026-08-15:

- https://productsparkstudio.com/privacy/
- https://productsparkstudio.com/terms/
- https://productsparkstudio.com/support/
- https://productsparkstudio.com/

The live Privacy Policy says the website uses no analytics, advertising technology, cookies, or
tracking tools. It accurately distinguishes the Firebase app from local prototype behavior and
states that no final retention schedule exists.

### Evidence limits

- The repository does not contain real Firebase public configuration values. QA evidence says a
  local, uncommitted Firebase configuration exists and that core Firebase behavior has been tested.
- The package lock contains transitive Firebase analytics, messaging, and storage packages as part
  of the broad Firebase package, but application code does not import or initialize those services.
  Presence in the lockfile alone is not evidence they collect data at runtime.
- No final App Store Connect questionnaire, Google Play form, compiled iOS privacy report, SDK
  privacy manifests, Android merged manifest, or production network capture was inspected.

## 5. Current data architecture

### Production Firebase mode

1. The user creates or accesses an account through Firebase Authentication with email and password.
2. Firebase Authentication owns credential verification, password handling, reset tokens, sessions,
   and the Auth user record. The app reads the Firebase UID, email, display name, and account metadata.
3. Authentication persistence uses React Native AsyncStorage through Firebase's React Native
   persistence adapter. The app does not implement its own password database.
4. Cloud Firestore stores a private `users/{uid}` profile and application collections for prayer
   requests, prayer interactions, and reports.
5. Any signed-in user can read active prayer-request documents. Security rules keep profile,
   interaction, and report records owner-scoped from the client. Manual Firebase Console operators
   can access moderation data under their administrative authority.
6. Daily verses are bundled with the app and selected locally. No Bible API or AI service is called.

### Local/mock fallback

When required Firebase environment variables are absent, no Firebase app is initialized. The app
uses AsyncStorage keys `p4u.profile`, `p4u.signedIn`, `p4u.prayers`, `p4u.interactions`,
`p4u.reports`, `p4u.overrides`, and `p4u.removed`. This data stays on that device according to the
code path reviewed. It is not Apple-collected or Google-collected because it is not transmitted off
device. Local mode has no real password flow.

### Data flow boundary

The production store disclosures must describe the Firebase-configured build, not the fallback.
Local fallback evidence is relevant only to explain why identical-looking fields can be device-only
in one mode and collected in the production mode.

## 6. Complete data inventory

| Data element | Source and destination | Stored or displayed | Required or optional | Deletion and retention | Evidence-based classification |
|---|---|---|---|---|---|
| Email address | User to Firebase Authentication | Private Auth record; returned to signed-in app; never placed in Firestore prayer/report data or public UI | Required for production account | Auth user is deleted in account flow; Firebase says non-IP Auth information is removed from live and backup systems within 180 days after customer-initiated user deletion | Contact info; linked account data |
| Password/current and new password | User to Firebase Authentication | Processed by Firebase for sign-up, sign-in, reauthentication, reset, and change; not stored or logged by Product Spark Studio code | Required for production account; reset/change only when used | Firebase owns credential deletion and documented Auth retention; reset activity/token retention is not independently defined in repository | Authentication information, not a Product Spark Studio password store |
| Password-reset email/activity | Email submitted to Firebase Auth; Firebase sends reset email | Auth service request and security activity | Optional account-recovery action | Exact request/token/log retention unresolved; do not call ephemeral without Firebase proof | Account management and security activity |
| Firebase UID | Firebase Authentication to app and Firestore | Auth account ID; `users.uid`, prayer `authorUid`, interaction `userUid`, report `reporterUid` and `requestAuthorUid`; hidden from UI | Automatic and required | Profile and own interaction/report records are targeted for deletion; UID remains on soft-removed requests and may remain in reports filed by others | User ID; linked, pseudonymous but re-associable |
| Display name | User to Auth and private Firestore profile; copied to named requests | Public on named requests; literal `Anonymous` stored and displayed on anonymous request docs | Required account field; public display on each post is optional | Auth/profile deleted; named soft-removed request can retain cached display name unless later purged; anonymous request never stores real name on request doc | Name; public when chosen, otherwise private account data |
| Profile/account timestamps and status | Firebase/Auth and app to private profile | Creation time, `createdAt`, `updatedAt`, `lastSignedInAt`, profile version, `accountStatus` | Automatic and required | Private profile deleted in critical deletion step; Auth metadata follows Firebase retention | Product/account interaction and status metadata |
| Prayer body text | User to Firestore | Displayed to all signed-in users while active; retained privately when soft-removed | Optional feature content | User removal and account deletion soft-remove, not hard-delete; no purge period | Other user content; can also be Sensitive Info and Health |
| Prayer category | User to Firestore | Public with active request; retained on soft-removed doc | Required when submitting a request, but submitting a request is optional | Same as request | Product interaction and content metadata; `health` can reinforce health inference |
| Anonymous-display choice | User to Firestore | `isAnonymous` plus public `displayName`; public effect is Anonymous | Optional choice per request | Retained on soft-removed request | Privacy/content setting linked internally to UID |
| Request timestamps/status | App/server to Firestore | `createdAt`, `updatedAt`, optional `removedAt`, `removedReason`, `status`, schema version; active timestamp/status visible through UI | Automatic when request feature is used | Soft-removed record retained for undefined period | Product interaction and operational metadata |
| Prayer interaction | User action to Firestore | Private record with UID, request ID, timestamp, schema version; aggregate count public | Optional feature action | Own interaction docs deleted best-effort on account deletion; failures can leave orphan records | App/product interaction linked to identity |
| Aggregate prayer count | Derived from interactions and stored on request | Public aggregate | Automatic after optional prayer action | Preserved when actor deletes account; no decrement or purge schedule | Aggregate product interaction, not anonymous at collection stage |
| Report reason | User to Firestore | Private moderation record | Required if a user files a report; reporting is optional | Deleting reporter's own report is best-effort; other users' reports remain | Other user-generated content or app interaction, linked |
| Optional report notes | User to Firestore | Private moderation record, manually reviewable | Optional | Same report retention; no schedule | Other user content; may contain sensitive or health data |
| Report identifiers/status/timestamp | App/user/server to Firestore | Reporter UID, request ID, request-owner UID, open status, creation time, schema version | Automatic when reporting | Other users' reports against deleting user's content remain; exact retention unresolved | User IDs and product/moderation interaction |
| IP address and user-agent string | Device/network to Firebase Authentication | Used for security and abuse prevention; Firebase says logged Auth IP addresses are kept for a few weeks | Automatic for Auth use | Firebase-defined IP retention; no app control shown | Technical/security data; final Apple/Google category mapping requires owner confirmation |
| Firebase/Cloud service operational data | SDK and service operation | Firebase describes service usage, app/package identifiers, technical and operational details, including IP addresses, as Firebase Service Data | Automatic where generated | Governed by applicable Firebase/Google terms; exact app-level records and retention vary | Conservatively assess in final SDK/binary review; do not infer analytics |
| Firebase Auth session persistence | Firebase Auth SDK to AsyncStorage | Local Auth session/token state | Automatic and required for persistent login | Cleared by Firebase sign-out/delete behavior and app local-key cleanup where applicable; exact SDK key detail not inventoried | Device-only storage, unless transmitted as part of Auth requests |
| Local fallback profile/session | User/app to AsyncStorage | Name, email, local ID, creation time, sign-in flag | Required only in fallback | Account deletion removes profile/session keys best-effort | Device-only, not collected in fallback |
| Local fallback requests/interactions/reports/overrides/removals | User/app to AsyncStorage | Local user content, IDs, timestamps, choices, counts, notes | Optional feature use | Local reset helper exists in service code; account deletion soft-removes own requests and clears profile/session, but complete cleanup of all content keys is not guaranteed by the account flow | Device-only, not collected in fallback |
| Support email content | User's email client to Product Spark Studio, outside app flow | Email and whatever the user sends | Optional | Not defined in app repository | Privacy-policy data practice, but not app-collected through the binary |

## 7. Public, private, linked, and device-only distinctions

### Public within the signed-in community

- Active prayer body, category, request timestamp, status as implied by availability, and aggregate
  prayer count
- Display name on named requests, or the literal `Anonymous` on anonymous requests

This is public display to authenticated community members, not publication to the open web. Public
display does not make the underlying collection unlinked. Each request retains `authorUid`.

### Private from ordinary users but linked

- Email, password/Auth data, UID, private profile timestamps/status
- Individual prayer-interaction records
- Reporter identity, request-owner identity, reasons, notes, status, and timestamps
- Real account identity behind an anonymous request, available through the request's ownership UID
  and administrative systems even though not shown in the app

### Aggregate but derived from linked activity

The prayer count is shown without a who-prayed list, but it is produced from individual UID-linked
interaction records. It should not be treated as unlinked collection merely because only the
aggregate is public.

### Device-only

Bundled verses, feed sort/filter state that is computed from already-loaded data, and the entire
local/mock dataset remain on-device in the reviewed fallback path. Firebase Auth persistence also
uses device storage, although Auth requests themselves are transmitted.

## 8. Apple App Privacy proposed answers

Apple defines collection as transmitting data off device and storing it in readable form longer
than needed to service the request. Data processed only on device is outside that definition.
Apple requires developers to account for third-party SDK behavior. The table intentionally
understates neither sensitive UGC nor Firebase Auth technical processing.

| Apple data type | Collected? | Purpose | Linked to identity? | Tracking? | Required or optional | Evidence and rationale |
|---|---|---|---|---|---|---|
| Contact Info: Name | Yes, proposed | App Functionality; Account Management | Yes | No | Display name required for account; named post display optional per request | Stored in Auth/profile and copied to named requests |
| Contact Info: Email Address | Yes, proposed | App Functionality; Account Management; Fraud Prevention, Security and Compliance | Yes | No | Required | Firebase Auth account and recovery identifier; never public |
| Health & Fitness: Health | Yes, conservative proposal | App Functionality | Yes | No | Optional | Users may submit health prayer content and select Health; Apple's definition includes user-provided health or medical data |
| User Content: Other User Content | Yes, proposed | App Functionality; Other Purposes for moderation/safety if console wording requires | Yes | No | Optional | Prayer bodies and optional report notes are stored, prayer text is community-visible while active, reports are private |
| Identifiers: User ID | Yes, proposed | App Functionality; Account Management; Fraud Prevention, Security and Compliance | Yes | No | Required/automatic | Firebase UID keys ownership, interactions, reports, and profile |
| Sensitive Info | Yes, conservative proposal | App Functionality; Other Purposes for moderation/safety | Yes | No | Optional | Prayer content inherently can reveal religious beliefs and can include health, grief, finances, relationships, or other sensitive facts |
| Usage Data: Product Interaction | Yes, proposed | App Functionality; Analytics is not selected | Yes | No | Optional for feature actions; automatic metadata after action | Requests, categories, timestamps/status, prayer actions, reports, and sign-in/profile activity describe interaction with the app; no analytics SDK use is shown |
| Other Data: IP address/user-agent security data | Yes, conservative placeholder pending exact Apple mapping | Fraud Prevention, Security and Compliance; App Functionality | Yes, safest proposal | No | Automatic with Firebase Authentication | Firebase officially says Auth processes user agents and IPs and retains logged IPs for weeks; Apple's current taxonomy has no plain IP-address row, so owner must confirm the console mapping and current Firebase SDK disclosure guidance |
| Diagnostics: Crash Data | No, based on current build evidence | Not applicable | Not applicable | No | Not applicable | No Crashlytics, Sentry, or other crash SDK is imported or initialized. OS/store diagnostics outside developer collection require separate platform treatment |
| Diagnostics: Performance Data | No, based on current build evidence | Not applicable | Not applicable | No | Not applicable | No Firebase Performance Monitoring or equivalent initialized |
| Location | No in app behavior; review IP mapping separately | Not applicable | Not applicable | No | Not applicable | No location permission/API or location feature. Firebase Auth IP use is for security, not a repository location feature |
| Purchases, Financial Info, Contacts, Photos/Videos, Audio, Browsing History, Search History | No | Not applicable | Not applicable | No | Not applicable | No related feature, permission, dependency use, or storage found |

### Proposed Apple purpose selections

- Select **App Functionality** for account data, prayer content, user IDs, interactions, and reports.
- Select **Account Management** for name, email, UID, credentials/account metadata where offered.
- Select **Fraud Prevention, Security and Compliance** for Firebase Auth IP/user-agent processing and
  authentication data used for abuse prevention.
- Do not select **Third-Party Advertising**, **Developer's Advertising or Marketing**, or tracking.
- Do not select **Analytics** merely because Firebase libraries are present transitively. No
  Analytics service is imported or initialized.

### Apple interpretation decisions still open

1. Whether prayer text must be declared in both Other User Content and Sensitive Info, and in Health
   whenever health content is possible. The conservative proposal is yes because Apple's fields are
   not mutually exclusive and the definitions cover user-provided health and sensitive data.
2. Whether prayer/report activity should be mapped to Product Interaction in addition to content.
   The conservative proposal is yes because identity-linked actions and timestamps are stored.
3. The exact Apple category for Firebase Auth IP address and user-agent strings. Do not omit them
   without current Firebase Apple disclosure guidance or a validated build/network review.

## 9. Google Play Data Safety proposed answers

Google defines collected as data transmitted off device, including transmission by SDKs. It defines
shared as transfer to a third party, with an exception for a service provider processing on the
developer's behalf. Firebase states that customers generally act as controller/business and Google
generally acts as processor/service provider. On current evidence, Firebase processing is therefore
proposed as collected and not shared. This conclusion must be revisited if Firebase terms,
configuration, or data use changes.

### Form-level proposed answers

- Does the app collect or share required user data types? **Yes, collects.**
- Is any data shared? **No, proposed**, because Firebase is used as a service provider and no other
  third-party transfer is evidenced.
- Is all collected user data encrypted in transit? **Yes, proposed**, based on HTTPS/TLS Firebase
  service transport. Reconfirm for every network path in the final binary.
- Can users request deletion? **Yes, with qualifications.** There is an in-app Delete account action
  and a policy contact route, but retained soft-removed and moderation records must be described
  accurately in the policy and owner review.
- Is data processed ephemerally? **Generally no.** Core Auth and Firestore data is retained. Do not
  use the ephemeral exception for IP addresses because Firebase says logged Auth IPs persist for a
  few weeks.

| Google data type | Collected? | Shared? | Required/optional | Ephemeral/retained | Purpose | Evidence and rationale |
|---|---|---|---|---|---|---|
| Personal info: Name | Yes | No, service-provider processing | Required for account; optional public display per request | Retained | App functionality; Account management | Auth/profile and named request behavior |
| Personal info: Email address | Yes | No | Required | Retained | App functionality; Account management; Fraud prevention, security, compliance | Firebase Auth and recovery |
| Personal info: User IDs | Yes | No | Required/automatic | Retained | App functionality; Account management; Fraud prevention, security, compliance | Firebase UID throughout data model |
| Personal info: Other info | Yes, conservative proposal | No | Optional | Retained | App functionality; moderation/safety | Prayer/report text may reveal religious beliefs, grief, finances, relationships, or other sensitive personal facts |
| Health and fitness: Health info | Yes, conservative proposal | No | Optional | Retained | App functionality | User can submit health-related prayer content and Health category |
| App activity: App interactions | Yes | No | Optional actions; automatic event metadata | Retained | App functionality; Fraud prevention, security, compliance where applicable | Prayer actions, reports, request state/category/timestamps, sign-in and profile timestamps |
| App activity: Other user-generated content | Yes | No | Optional | Retained | App functionality; moderation/safety | Prayer text, report reason, optional notes |
| Device or other IDs / applicable technical identifier | Yes, conservative pending mapping | No | Automatic with Auth | Retained for service-specific periods | Fraud prevention, security, compliance; App functionality | Firebase Auth user-agent and operational identifiers; final SDK guidance must determine exact Play row |
| Approximate location | Undecided, conservative review item | No | Automatic only if Play maps Auth IP processing here | Auth IP logs retained for weeks | Fraud prevention, security, compliance | Firebase processes IP for Auth security, but repository shows no location derivation or feature. Confirm current Play/Firebase classification before owner approval |
| Diagnostics | No app-specific diagnostics proposal at present | No | Not applicable | Not applicable | Not applicable | No crash/performance SDK use. Recheck final binary and Firebase SDK guidance for automatic operational telemetry |

### Required versus optional

For Google, a data type is optional only if all users can choose whether to provide it and can use
the app without it. The account requires name, email, password processing, and a UID. Prayer
content, health/sensitive details, prayer interactions, and reports are optional because users can
use other app functionality without submitting each type. A category is required only when the
optional act of submitting a prayer request occurs.

### Deletion availability answer

The proposed answer is that users can request deletion, not that every record is immediately and
completely erased. The in-app flow and `admin@productsparkstudio.com` contact path support requests.
The console and privacy policy must not imply hard deletion of all content or immediate removal from
backups.

## 10. Third-party SDK and Firebase assessment

### SDKs actually used

- Firebase JavaScript SDK 12.15.0, specifically App initialization, Authentication, and Cloud
  Firestore
- React Native/Expo runtime and UI/navigation packages
- React Native AsyncStorage

No application import or initialization was found for Firebase Analytics, Crashlytics, Performance
Monitoring, Cloud Messaging, Storage, App Check, Remote Config, or Firebase AI. Firebase analytics,
messaging, and storage packages appear transitively in `package-lock.json`; they are not evidence of
runtime collection without use.

### Firebase Authentication

Firebase officially identifies passwords, email addresses, phone numbers, user agents, and IP
addresses as possible Authentication end-user data. This app uses email/password, not phone auth.
Firebase says user-agent strings and IP addresses support security and abuse prevention, logged Auth
IP addresses are retained for a few weeks, and other authentication information is retained until
the customer initiates user deletion, then removed from live and backup systems within 180 days.

Passwords must therefore be described as handled by Firebase Authentication. The app transmits them
to Firebase but does not store them in a Product Spark Studio password database or Firestore.

### Cloud Firestore

Firestore stores the customer data inventoried above. Firebase documentation states that Firestore
uses TLS for data in transit. This supports the proposed Google encrypted-in-transit answer. This
worksheet intentionally does not use encryption at rest as a store-form claim because the requested
console fields focus on transit, and no owner verification of the deployed database configuration
was performed.

### Service provider versus sharing

Firebase says customers typically control end-user data and Google generally acts as processor or
service provider. Google Play says a transfer to a service provider that processes on the
developer's behalf is not required to be disclosed as sharing. Proposed result: collected, not
shared. Firebase Service Data and any Google independent-purpose use must be checked against the
exact accepted terms and final SDK guidance before approval; a material independent-purpose use
could change the result.

### Tracking

No advertising SDK, data broker, cross-app profiling, advertising identifier access, or linking of
data across other companies' apps/sites for targeted advertising or ad measurement was found.
Proposed Apple answer: no tracking. Proposed Google advertising purpose: none.

## 11. Account deletion and retention assessment

### Verified deletion sequence in Firebase mode

1. Soft-remove all active authored prayer requests. This critical step must succeed before account
   deletion continues.
2. Delete the user's own prayer-interaction documents, best-effort.
3. Delete reports filed by the user, best-effort.
4. Delete the private Firestore profile document. This critical step must succeed.
5. Delete the Firebase Authentication user. Firebase may require recent login.
6. Clear local fallback profile/session keys and return to signed-out state.

### Records that can remain

- Soft-removed prayer documents, including `authorUid`, prayer text, category, display value,
  timestamps, status, removed reason, and aggregate count
- Aggregate prayer counts on other users' requests after the deleting user's individual interaction
  is removed
- Reports filed by other users, including request-owner UID and report/moderation details
- The deleting user's own interaction or report documents if best-effort cleanup fails
- Firebase Auth data in live/backups for the provider's documented deletion interval and Auth IP
  logs for the documented security period
- Operational or audit records governed by Firebase terms or a future moderation/retention policy

### Unresolved retention

No Product Spark Studio retention period, purge job, anonymization process, moderator disposition
schedule, or automatic permanent-deletion schedule exists in the reviewed evidence. Do not invent
one. The live Privacy Policy correctly says no final schedule is established, but its account
deletion summary is incomplete because it does not expressly describe deletion of the user's own
interaction/report docs, best-effort failure, preserved prayer counts, reports filed by others, or
Firebase's documented provider retention.

## 12. Sensitive and user-generated content assessment

Prayer content is user-generated content and can simultaneously be sensitive information and health
information. Categories explicitly include health, family, finances, relationships, grief, work,
guidance, and praise. Free text can reveal religious belief by context, a diagnosis, mental-health
condition, family details, another person's information, financial hardship, or safety concerns.

An anonymous-display selection changes presentation only. It does not sever the UID association,
does not make collection unlinked, and does not guarantee anonymity from Product Spark Studio or
Firebase administrators. The current code minimizes the public anonymous document by storing the
literal `Anonymous` instead of the account display name, which is a meaningful public-privacy
protection but not de-identification of the backend record.

Reports are private moderation UGC. The reason and optional notes can repeat or add sensitive facts.
Manual Firebase Console review means authorized operators can access them even though other app
users cannot.

Owner review should accept the conservative dual/multiple classification unless current console
help expressly prohibits it: Other User Content plus Sensitive Info, and Health when health-related
content can be submitted.

## 13. Local/mock fallback distinction

In local mode, Firebase is not initialized and the local profile, email, requests, interactions,
reports, overrides, removed IDs, and session flag are stored only in AsyncStorage. Apple and Google
do not treat strictly on-device processing as collected. The daily verse dataset is also local.

This does not reduce the production disclosures because the Firebase-configured production build
transmits equivalent account and application data off device. Account deletion in local mode clears
the profile and sign-in keys and soft-removes owned requests, but it does not clearly guarantee
removal of every local interaction, report, or content key. Removing the app or clearing app storage
may affect those records, as the live policy states.

## 14. Verified absent data and capabilities

Based on code, configuration, dependencies in use, documentation, and live policy review:

- No advertising, ad SDK, advertising identifier use, or cross-app tracking
- No analytics initialization or custom analytics events
- No Firebase Crashlytics, Performance Monitoring, or other crash-reporting service
- No location feature or location permission
- No purchases, subscriptions, payment information, or financial transaction processing
- No contacts/address-book access
- No photo library, camera, avatar, file upload, or Firebase Storage use
- No microphone, audio recording, or speech processing
- No push notifications or Firebase Cloud Messaging use
- No AI feature, model call, AI moderation, or external Bible API
- No social sign-in, phone authentication, or anonymous Firebase Authentication
- No cookies, analytics, advertising, or tracking on the production website

These are current-state findings, not permanent promises. A new SDK, permission, Firebase product,
support form, notification feature, media upload, analytics, AI, or advertising feature requires a
fresh disclosure review before release.

## 15. Potential disclosure or policy inconsistencies

1. **Live policy deletion summary is incomplete.** It mentions request soft-removal, profile/Auth
   deletion, and local session clearing but not own interaction/report cleanup, best-effort failure,
   preserved counts, reports filed by others, or Firebase's provider retention.
2. **Live policy says provider technical and account information may be processed but is not
   specific.** Firebase Auth officially identifies email, password, user agent, and IP address and
   supplies retention details that should be considered for a future policy revision.
3. **Retention remains unresolved.** Store deletion answers must not be phrased as total or immediate
   erasure.
4. **Soft-removed named requests can retain display names and sensitive text.** The phrase “minimal
   removed record” in the live policy may overstate minimization because current code updates status
   fields but does not strip body, category, cached display name, author UID, or counts.
5. **Account cleanup QA is incomplete for later scenarios.** Core deletion passed, but the checklist
   for active-request soft-removal, interaction cleanup, report cleanup, and boundary checks remains
   unchecked in `docs/QA_delete_scenarios.md`.
6. **Sensitive-data mapping requires console confirmation.** Prayer text should not be hidden only
   under generic UGC if Apple/Google definitions also call for health or sensitive personal info.
7. **SDK/binary evidence is not final.** Transitive Firebase modules exist. A compiled binary and
   privacy-manifest/merged-manifest review is needed to confirm that unused modules do not introduce
   additional disclosure.
8. **Age wording is not synchronized with the approved controlled-beta direction.** The live Privacy
   Policy and Terms say a final minimum age has not been established, while the controlled beta is
   owner-approved for 18 and older. The approved age worksheet already flags this external-beta
   blocker.
9. **UGC compliance remains a scheduled blocker.** Reporting exists, but the approved readiness
   sequence places the UGC Compliance Blocker immediately after Blocker 5 and before external beta.

   *(Update 2026-08-16)*: all three functional UGC requirements are now implemented and manually
   verified: account-level user hiding, versioned Terms acceptance before account creation or prayer
   submission, and pre-publication content filtering. The blocker remains open only for the approved
   commitment to synchronize the live Privacy Policy and Terms with the 18-and-older controlled-beta
   direction. This update does not resolve the separate privacy, retention, console-mapping, or final
   binary-review items in this worksheet.

   *(Further update 2026-08-16)*: the live Privacy Policy and Terms now contain the approved
   private-beta 18-and-older language and passed a post-deployment smoke test. The UGC Compliance
   Blocker is closed. The separate privacy, retention, console-mapping, and binary-review items remain
   unchanged.

## 16. Open owner decisions

- Approve or revise every proposed Apple data type, purpose, linked status, and no-tracking answer.
- Decide the exact Apple console category for Firebase Auth IP address and user-agent processing.
- Decide whether Apple Product Interaction is selected for prayer/report/account event metadata.
- Approve conservative multiple classification of prayer/report text as UGC, Sensitive Info, and
  Health when applicable.
- Decide the exact Google mapping for Firebase Auth IP/user-agent data, including whether
  Approximate location and/or Device or other IDs is required under the current form.
- Confirm Firebase qualifies solely as a service provider under the terms actually accepted for the
  production project, supporting the proposed not-shared answer.
- Establish Product Spark Studio retention and purge/anonymization rules for soft-removed requests,
  aggregate counts, moderation reports, orphaned best-effort cleanup records, and support requests.
- Decide whether account deletion should hard-delete or anonymize more fields and whether cleanup
  failures need server-side remediation.
- Revise live policy wording before external beta if owner accepts the inconsistency findings.
- Complete a final compiled iOS privacy report/manifest review, Android merged-manifest/SDK review,
  and production network validation before console entry.
- Complete the scheduled UGC Compliance Blocker before external beta.

## 17. Owner review checklist

- [x] I understand this approval does not configure, submit, or publish any console answer.
- [x] I reviewed the complete inventory, including Firebase automatic Auth processing.
- [x] I reviewed public, private, linked, aggregate, and device-only distinctions.
- [x] I approve the proposed Apple data types, purposes, linked status, and no-tracking direction,
  subject to the open console-mapping decisions and final binary review.
- [x] I approve the proposed Google collected, not-shared, required/optional, retention,
  encryption-in-transit, and deletion answers.
- [ ] I decided how IP address and user-agent data map in each current console. Open before console
  entry.
- [x] I approve the conservative sensitive/health/UGC multiple-classification approach.
- [ ] I confirmed the Firebase service-provider conclusion under the production project's accepted
  terms. Open before console entry.
- [x] I reviewed deletion gaps, retained records, provider retention, and incomplete QA.
- [ ] I established or explicitly deferred a retention schedule without making unsupported claims.
- [x] I reviewed the potential live policy inconsistencies.
- [ ] I assigned and completed any required live policy revisions before external beta.
- [ ] I confirmed the final binary/SDK review will occur before console configuration.
- [x] I confirmed the UGC Compliance Blocker remains required before external beta.

## 18. Approval record

| Field | Record |
|---|---|
| Decision | Approved as worksheet v0.1 |
| Owner approval date | 2026-08-15 |
| Approval source | Owner message: "Approved" |
| Boundary | Approval adopts the proposed disclosure direction for planning. It does not authorize console configuration, submission, or publication. Open decisions and blockers remain in Sections 15 to 17. |

## 19. Official sources

Official sources only, accessed 2026-08-15:

### Apple

- Apple, App Privacy Details, definitions of collection, linked data, tracking, purposes, and data
  types: https://developer.apple.com/app-store/app-privacy-details/
- Apple, User Privacy and Data Use, third-party SDK responsibility and tracking definition:
  https://developer.apple.com/app-store/user-privacy-and-data-use/
- Apple, Manage App Privacy in App Store Connect:
  https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy/
- Apple, Describing Data Use in Privacy Manifests:
  https://developer.apple.com/documentation/BundleResources/describing-data-use-in-privacy-manifests
- Apple, Adding a Privacy Manifest to an App or Third-Party SDK:
  https://developer.apple.com/documentation/bundleresources/adding-a-privacy-manifest-to-your-app-or-third-party-sdk

### Google Play

- Google Play Console Help, Provide Information for Google Play's Data Safety Section, including
  collection, sharing, service-provider exception, required/optional, ephemeral processing, data
  types, purposes, encryption in transit, deletion, and SDK responsibility:
  https://support.google.com/googleplay/android-developer/answer/10787469?hl=en
- Google Play Console Help, Using SDKs Safely and Securely:
  https://support.google.com/googleplay/android-developer/answer/13326895?hl=en
- Google Play Console Help, Best Practices for Prominent Disclosure and Consent:
  https://support.google.com/googleplay/android-developer/answer/11150561?hl=en

### Firebase and Google Cloud

- Firebase, Privacy and Security in Firebase, service roles, end-user data, Authentication IP/user
  agent processing and retention, and processing locations:
  https://firebase.google.com/support/privacy/
- Firebase, Users in Firebase Projects, Auth user properties:
  https://firebase.google.com/docs/auth/users
- Firebase, Firebase Authentication overview:
  https://firebase.google.com/docs/auth
- Firebase, Firebase Data Processing and Security Terms:
  https://firebase.google.com/terms/data-processing-terms/
- Firebase, Terms of Service for Firebase Services:
  https://firebase.google.com/terms/
- Firebase, Cloud Firestore Server-Side Encryption, including TLS in transit:
  https://firebase.google.com/docs/firestore/enterprise/server-side-encryption

This source list records the guidance used to prepare proposed answers. Because platform forms and
SDK behavior can change, the owner must recheck current official guidance at the time of console
configuration.
