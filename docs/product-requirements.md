# Product Requirements Document: Praying For You Mobile App

**Version:** 1.0
**Date:** 2026-05-26
**Author:** TainoTech
**Status:** Draft — Pending Review

---

## 1. Product Overview

Praying For You is a community prayer app that allows people to post prayer requests and pray for the requests of others. The app centers on a simple and meaningful idea: you share what you are carrying, and strangers will lift it up in prayer.

The original app was built as an Advanced JavaScript class project — a single-page web app running on jQuery, Bootstrap 3, and Firebase Realtime Database. That version demonstrated the concept but was never production-ready. It lacked user accounts, moderation, mobile optimization, and reliable core features.

This rebuild targets iOS and Android as a React Native mobile app built with Expo. Mobile is the right platform for this product: prayer is personal, quiet, and often happens on a phone. People check prayer requests in the morning, during a commute, or before bed. A card-based, touch-friendly feed serves this use case far better than a web table viewed in a browser.

The mobile app will support email-based accounts, public and anonymous posting, a community prayer feed, prayer interaction tracking, a Verse of the Day feature, and basic content reporting. It will be built with a clean Firebase Firestore backend, strict security rules, and an architecture that can support ongoing improvements without a rewrite.

---

## 2. Problem Statement

The legacy web app identifies the following problems that the mobile rebuild must solve:

**No user accounts or identity.** The original app accepted any username string with no verification. Anyone could impersonate anyone. There was no way to associate a prayer request with a returning user. Users could not see their own past submissions. The rebuild must use Firebase Authentication from day one.

**No mobile experience.** The app was built with a Bootstrap 3 table layout. Tables do not adapt gracefully on small screens. There were no touch-optimized interactions. The app was designed for a desktop browser and was never intended for mobile use — but a prayer app's most natural home is a phone.

**No moderation.** Anyone could post any content, including spam, hate speech, or harmful material. There was no reporting mechanism, no way for users to flag content, and no way for an admin to remove it. Both Apple and Google require user-generated content apps to have moderation capability. This is a launch blocker.

**Broken and unreliable core features.** The vote counter was broken — the update logic attempted to overwrite the entire database on every tap, which could corrupt all records. The success confirmation message after submitting a prayer was never displayed due to a CSS error in the JavaScript. The Verse of the Day API used plain HTTP and displayed a browser `alert()` with a typo on failure.

**No form validation.** Empty prayer requests could be submitted without any warning. There was no character minimum, no limit, and no user feedback on what went wrong.

**Outdated and insecure technology.** The app ran on Firebase SDK v3 (released approximately 2016), jQuery 1.9, and Bootstrap 3. The database rules allowed fully open, unauthenticated read and write access to all data. Any person with the database URL could delete every prayer request in the system.

**No privacy or safety design.** Prayer requests contain sensitive personal content — health struggles, grief, relationship difficulties. The legacy app stored this data with no privacy policy, no data retention approach, no ability for users to delete their own posts, and no protections against stored XSS attacks from malicious input.

The mobile rebuild solves all of these problems at the foundation. This is not a cosmetic upgrade — it is a ground-up rebuild that preserves the core mission while addressing every structural failure of the original.

---

## 3. Product Goals

### Prayer Request Submission
Users should be able to post a prayer request in under sixty seconds from opening the app. The submission flow must include input validation, a character counter, an anonymous posting toggle, and a clear confirmation screen that the request was received. Submitting a prayer should feel like a meaningful act, not a form fill.

### Community Prayer Engagement
The core loop of the app — post a request, pray for someone else's — must work reliably. Prayer counts must reflect real interactions and persist correctly. Users should feel that their request was seen and prayed over by other real people.

### User Trust and Safety
Every user must have an authenticated account. Anonymous posting is a display-layer option, not an absence of identity. All posts must be reportable. Content that violates community standards must be removable. Users must be able to delete their own requests. No one's email address should appear publicly.

### Mobile-First Usability
The app is designed for phone use. Navigation, card sizing, tap targets, scroll behavior, and typography must all be optimized for mobile screens. The app should feel native and fast, not like a web page inside a shell.

### Future Monetization
The app should be built with an ad placement architecture in mind, even if ads are not enabled in the initial launch. Ad placements must not interrupt prayer actions or appear on sensitive confirmation screens. The long-term option to offer a paid ad-free tier should be kept open.

### Portfolio and Project Value
This app is a real-world demonstration of a full production mobile build: React Native, Expo, Firebase Auth, Firestore, App Store and Google Play submission, analytics, monetization integration, and UGC compliance. The architecture and code quality should reflect professional standards.

---

## 4. Target Users

**People with prayer needs.** These users are looking for a low-barrier way to share something they are carrying — a health struggle, a family concern, a difficult decision. They may or may not be churchgoers. They want to feel heard and supported. They may post anonymously because the request is private. The app must feel safe and compassionate for this user.

**People who pray for others.** These users open the feed to see what others need and to pray over those requests. They tap "I prayed for this" as an act of acknowledgment. They may return daily, especially if the Verse of the Day gives them a reason to open the app even when they are not submitting their own request.

**Returning users tracking their own requests.** Once an account exists, users gain a history. They can see the requests they have submitted and the prayer counts those requests have received. This gives the app longitudinal value and a reason to return beyond the initial post.

**Admin and moderator role (future).** Someone must be able to review reported content, remove posts that violate community standards, and manage edge cases. For MVP, this can be handled via the Firebase console by the developer. A future admin UI or admin-flagged account role should be accounted for in the data model from the beginning, even if the UI is not built in v1.

---

## 5. MVP Scope

The following features must be present in the version 1 release. Nothing listed here is optional for launch.

**Account creation and sign in.** Email and password registration via Firebase Authentication. Email verification is recommended. Sign in with persistent session across app restarts. Password reset via email.

**User profile with display name and email.** After registration, users set a display name that appears on their public posts. Email is stored but never displayed publicly. Users can update their display name from settings.

**Submit prayer request.** A form with a text input for the prayer request body. Required field with a minimum of ten characters and a maximum of five hundred characters. Character count displayed in real time. A submit button that is disabled until validation passes. A clear success screen after submission.

**Public anonymous posting option.** A toggle on the submission form that allows the user to post without their display name visible to others. When toggled on, the post appears in the feed attributed to "Anonymous." The user's account is always privately associated with the post in the database.

**Prayer request feed.** A scrollable, paginated card-based feed of active prayer requests ordered by most recent first. Each card displays: a subtle category tag, date posted, display name or "Anonymous," the prayer request text, and the current prayer count.

**Prayer detail view.** Tapping a prayer card opens a full detail screen with the complete prayer text, the prayer count, and the "I prayed for this" button.

**"I prayed for this" interaction.** A button on the detail view that lets an authenticated user indicate they prayed for a request. Each user can only register one prayer interaction per request. The prayer count increments atomically. The button state updates immediately in the UI.

**Prayer count.** Displayed on both the feed card and the detail view. Updated in real time via Firestore. The count is an atomic server-side integer, not a client-calculated value.

**Verse of the Day.** A featured card at the top of the feed or on a dedicated home screen section. Displays a Bible verse with book, chapter, verse number, and text. Rotates daily. Sourced from a reliable HTTPS API or a curated in-app dataset.

**Report inappropriate content.** A "Report" option accessible from each prayer card (via a long-press or a menu icon). Presents a reason selector (spam, inappropriate, harmful, other) and an optional note field. Writes a report record to Firestore. Does not immediately hide the post for other users, but flags it for review.

**Basic settings screen.** Allows the user to update their display name, view their account email, sign out, and delete their account. Account deletion must remove or anonymize the user's personal data in compliance with App Store and Google Play requirements.

---

## 6. Out of Scope for MVP

The following features are explicitly excluded from version 1. They should be designed for but not built in the initial release.

**Groups and church communities.** The ability to create or join a private prayer group (a church, a small group, a family) is a meaningful future feature but adds significant complexity to the data model, permissions, and UI. It will not ship in v1.

**Comments on prayer requests.** Replies and conversation threads on prayer posts are a high-engagement feature but also a significant moderation surface. The MVP supports only the "I prayed for this" interaction. Comments are post-MVP.

**Direct messaging.** One-to-one messaging between users is out of scope for v1.

**Paid subscriptions.** A subscription tier (for example, ad-free access or premium features) is a future monetization path. The MVP will either have no ads or lightweight banner ads only.

**Advanced admin dashboard.** A dedicated moderation interface inside the app is post-MVP. Moderation in v1 is handled by the developer directly in the Firebase console.

**Push notifications.** Notifications for prayer count milestones, new requests, or daily verse reminders are post-MVP. The architecture should not prevent adding this later, but it will not be built for v1.

**Image uploads.** Allowing users to attach photos to prayer requests (for example, a photo of a loved one) is not part of v1.

**Complex social features.** Following other users, liking profiles, leaderboards, or any social graph features are not part of v1.

**Editing submitted prayer requests.** Allowing users to edit a posted request after submission adds version-control complexity. Users can delete and repost in v1.

---

## 7. User Stories

**New account creation.**
As a new user, I want to create an account with my email and a password, so that I can post prayer requests and track my history.

**Signing in.**
As a returning user, I want to sign in with my email and password and have my session persist, so that I do not have to log in every time I open the app.

**Creating a prayer request.**
As a signed-in user, I want to write and submit a prayer request with a minimum of ten characters, so that I can share what I am going through with the community.

**Posting anonymously.**
As a signed-in user, I want to toggle my prayer request to post anonymously, so that my name is not visible on sensitive or private requests while still being associated with my account.

**Viewing prayer requests.**
As any signed-in user, I want to scroll through a feed of recent prayer requests, so that I can find requests to pray over and feel connected to others in the community.

**Praying for a request.**
As a signed-in user, I want to tap "I prayed for this" on a prayer request, so that the person who posted it knows their request was lifted up and feels supported.

**Viewing a verse of the day.**
As any signed-in user, I want to see a daily Bible verse when I open the app, so that I have spiritual context and encouragement as I use the app.

**Reporting a request.**
As a signed-in user, I want to report a prayer request that seems harmful, spammy, or inappropriate, so that it can be reviewed and removed if necessary.

**Managing basic settings.**
As a signed-in user, I want to update my display name, sign out of my account, and delete my account if I choose, so that I have control over my identity and data.

**Resetting a forgotten password.**
As a user who forgot their password, I want to request a password reset email, so that I can regain access to my account without contacting support.

---

## 8. Functional Requirements

### Authentication
- Email and password registration using Firebase Authentication.
- Email verification sent on account creation. The app should communicate that verification improves account recovery.
- Sign in with email and password. Session persists across app restarts using Firebase Auth's built-in persistence.
- Password reset email triggered from the sign-in screen.
- All protected screens (feed, submission, settings) require an authenticated session. Unauthenticated users see only the sign-in and registration screens.
- Sign out terminates the local session and returns the user to the sign-in screen.
- **Future-backend note (registration vs. existing account).** When real authentication is added, the registration flow must check whether the entered email is already in use. If it is, do not create a duplicate account; instead surface a calm message and route the user to sign in with that email (Firebase Auth returns `auth/email-already-in-use`, which the UI should handle this way). The local prototype already offers an "Already have a profile? Sign in" link on the create-profile screen as the placeholder for this path; the local flow does not yet verify email uniqueness.

### User Profile
- On first sign-in after registration, the user is prompted to set a display name before accessing the feed.
- Display name is stored in the `users` Firestore collection under the authenticated user's UID.
- Display name is the only public-facing identity. Email is never displayed in the app.
- Display name can be updated from the settings screen. The update writes to the `users` document. Existing prayer requests retain the display name cached at post time.
- Account deletion removes or anonymizes personal data: the `users` document is deleted, email is removed from Firebase Auth, and prayer requests authored by the user have their `displayName` replaced with "Deleted User" and their `userId` cleared or pseudonymized.

### Prayer Request Creation
- Submission form requires a text input for the prayer body.
- Minimum length: 10 characters. Maximum length: 500 characters.
- Character count displayed in real time below the text input.
- Submit button is disabled until the minimum length is met.
- An anonymous toggle allows the user to choose whether their display name appears publicly. Default is non-anonymous (name shown).
- The submit form includes a category selector (a small controlled set: Health, Family, Finances, Relationships, Grief, Work, Guidance, Praise / Answered Prayer, Other). Default is "Other".
- On submit, the request is written to the `prayerRequests` Firestore collection with: `userId`, `isAnonymous`, `displayName` (or "Anonymous" if toggled), `body`, `category`, `createdAt` (server timestamp), `status: "active"`, `prayerCount: 0`, `reportCount: 0`.
- A success screen is shown after submission. It confirms the request was received and offers a return-to-feed button.
- Firebase write errors are caught and displayed as an in-app error message. The form is not cleared if the write fails.

### Prayer Feed
- Displays a scrollable list of `prayerRequests` documents where `status == "active"`, ordered by `createdAt` descending.
- Feed is paginated (load more on scroll) using Firestore cursor-based pagination. Initial page size: 20 records.
- Each card displays: the `category` (as a subtle tag), date posted (formatted, e.g., "May 26"), display name or "Anonymous," the first 200 characters of the prayer body (truncated with ellipsis if longer), and the current `prayerCount`.
- A report option is accessible on each card via a long-press or a three-dot menu icon.
- Tapping a card navigates to the prayer detail view.
- The Verse of the Day card is pinned above the feed list.
- Pull-to-refresh reloads the feed from the top.

### Prayer Detail
- Displays the `category` (as a subtle tag), the full prayer request text, display name or "Anonymous," the full date and time posted, and the current prayer count.
- Shows the "I prayed for this" button.
- If the current user has already prayed for this request, the button is shown in a completed/active state and cannot be tapped again.
- A report option is accessible from this screen.

### Prayer Interaction ("I prayed for this")
- Tapping "I prayed for this" creates a `prayerInteractions` document (with compound ID `{userId}_{requestId}` or as a subcollection) and atomically increments `prayerCount` on the parent `prayerRequests` document using a Firestore transaction or `FieldValue.increment()`.
- Before writing, the app checks whether a `prayerInteractions` record already exists for the current user and this request. If it does, the button is disabled and no write occurs.
- The prayer count in the UI updates immediately (optimistic update), with error handling to revert if the write fails.
- A user cannot pray for their own request. The button is hidden or disabled on posts the current user authored.

### Verse of the Day
- A single Bible verse is displayed daily to all users.
- The verse includes: book name, chapter number, verse number, and verse text.
- Source options (in order of preference): a curated `verses` Firestore collection with a `config/verseOfTheDay` document updated daily via a scheduled Cloud Function; or a reliable third-party HTTPS API (not plain HTTP, not JSONP).
- On API or fetch failure, a hardcoded fallback verse is shown silently — no alert dialogs or visible error messages.
- The verse card is not interactive in MVP. It is display-only.

### Reporting and Moderation
- Any authenticated user can report any prayer request they did not author.
- The report flow presents a reason picker: "Spam," "Inappropriate content," "Harmful or dangerous," "Other."
- An optional free-text note field allows the reporter to provide additional context (max 300 characters).
- Submitting a report writes a document to the `reports` Firestore collection and increments `reportCount` on the target `prayerRequests` document.
- The reporting UI confirms submission with a brief in-app message ("Thank you for your report. We will review it.").
- No automated hiding occurs on report submission in MVP. A moderator (the developer, via Firebase console) reviews flagged content and updates the `status` field to "removed" as needed. Requests with `status != "active"` do not appear in the feed.
- Posts with `status == "removed"` also disappear from the submitting user's own history view if that view is added post-MVP.

### Settings
- Update display name (with a save button and confirmation).
- View account email (read-only display).
- Sign out.
- Delete account (with a confirmation dialog that explains what deletion means for the user's data).
- Links to Privacy Policy and Terms of Service (external links or in-app web views).

### Ads and Monetization Placeholder
- The app architecture should support injecting a banner ad component between feed cards or at the bottom of the feed screen.
- No ads are shown on the prayer submission confirmation screen.
- No interstitial ads anywhere in the prayer flow.
- AdMob integration is a post-MVP feature. In MVP, the ad placement slots exist but are not wired to a real ad network.

---

## 9. Anonymous Posting Requirements

Anonymous posting means that a prayer request appears in the public feed attributed to "Anonymous" rather than to the user's display name. It does not mean that no account is involved.

Every prayer request in this app — whether marked anonymous or not — must be associated with an authenticated user account. The `userId` field is always written to Firestore on submission, regardless of the `isAnonymous` flag. The `isAnonymous` flag controls only what is displayed to other users in the feed and on the detail screen.

This distinction matters for several reasons:

**Moderation.** If a user posts harmful content anonymously, the platform must be able to identify and take action against the account. Without `userId` stored, there is no path to enforcement.

**Ownership.** Users should be able to see their own anonymous requests in their history (if that feature is added post-MVP). Ownership requires a stored association.

**App Store compliance.** Both Apple and Google require that apps with user-generated content have mechanisms to identify users and remove content. A system that genuinely has no account tied to a post cannot meet this requirement.

**Deletion.** If a user deletes their account or a moderator removes a post, the post must be traceable to act on it correctly.

The user-facing language in the submission form should be clear: tapping "Post anonymously" means your name is hidden from other users, not that your account is disconnected from the post. The privacy policy must reflect this accurately.

---

## 10. Trust, Safety, and Moderation Requirements

### No Public Email Display
User email addresses are stored in Firebase Authentication and in the `users` Firestore document. They are never shown in the feed, on prayer cards, on the detail screen, in the settings screen display, or in any other public-facing location. Email is used only for authentication and account recovery.

### Report Content Flow
Any authenticated user may report a prayer request. The flow is: tap report option → select a reason → optionally add a note → confirm. A `reports` document is created and the request's `reportCount` is incremented. The reporter receives a brief confirmation message. Reports are reviewed manually in MVP.

### Content Removal
A moderator can change a prayer request's `status` field to "removed" in the Firebase console. Removed requests are excluded from the public feed query (`status == "active"` filter). Removed requests are not deleted from Firestore, preserving a record for moderation purposes.

### Profanity and Spam Considerations
Automated profanity filtering is post-MVP. For v1, the primary mechanism is user reporting and manual review. If the app scales quickly, a Cloud Function that scans new posts for known profanity patterns can be added without changing the client architecture. The `status` field supports a "flagged" value that can be used by automated checks before manual review.

### App Store and Google Play UGC Compliance
Both Apple App Store Review Guidelines and Google Play Developer Policy require:
- A mechanism for users to report objectionable content.
- A mechanism to remove content and ban users who violate terms.
- A privacy policy that explains data collection.
- Compliance with children's content rules (the app targets adults; age rating should reflect 4+ or 12+ depending on content review).

All four of these requirements must be met before submission. The reporting system addresses the first two. A privacy policy linked in settings addresses the third. Age rating will be assessed at submission time.

### Privacy Expectations for Sensitive Prayer Content
Prayer requests frequently contain sensitive personal information: health diagnoses, family conflict, grief, mental health struggles, financial hardship. The app's design must treat this data with care:
- Prayer requests are readable only to authenticated users.
- Unauthenticated users cannot access the feed.
- The privacy policy must disclose that prayer requests are stored, who can see them, and how users can delete their content.
- Users can delete their own prayer requests (v1 requirement).
- Account deletion must offer to remove or anonymize the user's prayer requests.

---

## 11. Data Requirements

All data is stored in Firebase Firestore. The legacy app used Firebase Realtime Database; the rebuild uses Firestore for its richer querying, per-document security rules, and better offline support.

### `users`
One document per registered user, stored at `users/{userId}` where `userId` matches the Firebase Auth UID.

Fields: `uid` (string), `email` (string, private), `displayName` (string, public), `createdAt` (timestamp), `updatedAt` (timestamp), `isActive` (boolean, for soft-ban without deletion), `prayerCount` (integer, denormalized counter for total requests submitted).

### `prayerRequests`
One document per submitted prayer request, stored at `prayerRequests/{requestId}` with a Firestore auto-generated ID.

Fields: `id` (string), `userId` (string, always present regardless of anonymous flag), `isAnonymous` (boolean), `displayName` (string, cached at post time — "Anonymous" if `isAnonymous` is true), `body` (string, 10–500 characters), `category` (string, one of a controlled set: "health" | "family" | "finances" | "relationships" | "grief" | "work" | "guidance" | "praise" | "other"; helps users frame requests, makes the feed easier to scan, and supports future filtering), `createdAt` (server timestamp), `updatedAt` (server timestamp), `status` (string: "active" | "flagged" | "removed"), `prayerCount` (integer, atomic server-side counter), `reportCount` (integer).

### `prayerInteractions`
One document per unique user-request prayer interaction. Document ID convention: `{userId}_{requestId}`. Alternatively implemented as a subcollection at `prayerRequests/{requestId}/interactions/{userId}`.

Fields: `userId` (string), `requestId` (string), `prayedAt` (timestamp).

The existence of this document is the source of truth for whether a given user has prayed for a given request. The `prayerCount` on the parent `prayerRequests` document is a denormalized integer maintained by `FieldValue.increment()` for efficient display.

### `reports`
One document per report filed, stored at `reports/{reportId}` with an auto-generated ID.

Fields: `requestId` (string, the reported prayer request), `reportedBy` (string, UID of reporting user), `reason` (string: "spam" | "inappropriate" | "harmful" | "other"), `notes` (string, optional), `createdAt` (timestamp), `status` (string: "pending" | "reviewed" | "dismissed" | "actioned").

### `verses`
Optional collection for curated Verse of the Day content, stored at `verses/{verseId}`.

Fields: `book` (string), `chapter` (integer), `verse` (integer), `text` (string), `translation` (string), `tags` (array of strings for themed selection).

A `config/verseOfTheDay` document can hold the current day's verse reference, updated by a scheduled Cloud Function, so clients make a single document read rather than a collection query.

---

## 12. Analytics Requirements

The following events should be tracked on first launch. Analytics can be implemented via Firebase Analytics (bundled with the Firebase SDK) or an alternative provider. Events should be logged with relevant properties where noted.

- **`account_created`** — Fired when a new user completes registration. Properties: none.
- **`signed_in`** — Fired on each successful sign-in. Properties: none.
- **`prayer_request_submitted`** — Fired when a prayer request is successfully written to Firestore. Properties: `is_anonymous` (boolean).
- **`prayer_request_viewed`** — Fired when the detail view for a prayer request is opened. Properties: `request_id`.
- **`prayed_button_tapped`** — Fired when a user taps "I prayed for this" and the interaction write succeeds. Properties: `request_id`.
- **`prayer_request_reported`** — Fired when a report is submitted. Properties: `reason`.
- **`verse_viewed`** — Fired when the Verse of the Day card is rendered and visible. Properties: `translation`.
- **`settings_updated`** — Fired when a user saves a change in settings. Properties: `field_updated` (e.g., "display_name").
- **`account_deleted`** — Fired when a user confirms account deletion.
- **`ad_impression`** — Fired when an ad unit renders successfully (post-MVP, when ads are enabled). Properties: `placement` (e.g., "feed_banner").

---

## 13. Monetization Requirements

Monetization in a prayer app requires a careful approach. The product's emotional purpose is compassion, prayer, and community. Ads that feel intrusive or exploitative will damage trust and drive users away. The following rules govern ad integration.

**Banner ads only for MVP monetization.** If ads are enabled at launch, only banner ad units are permitted. Banner ads at the bottom of the feed screen or between feed cards are acceptable placements.

**No ads on prayer submission or confirmation screens.** The moment a user submits a prayer request is a meaningful, potentially vulnerable moment. No ad unit should appear on the submission form screen or the post-submission confirmation screen.

**No interstitial ads anywhere in the prayer flow.** Full-screen interstitial ads (appearing between screens during prayer-related actions) are not permitted. They interrupt the experience and conflict with the app's tone.

**Ads must not interrupt prayer actions.** The detail view and the "I prayed for this" interaction must remain ad-free. A user praying for someone's request should not be interrupted.

**Ad placement review before launch.** AdMob content policies include review criteria for religious content apps. Ad eligibility and placement compliance must be confirmed before the ad integration is built, to avoid building a feature that is rejected at submission or ad review.

**Future ad-free option.** The architecture must not preclude adding a paid tier or a one-time purchase in the future that removes ads. No hardcoded ad unit placement should be buried in shared layout components in a way that makes removal difficult.

---

## 14. Non-Functional Requirements

### iOS and Android Support
The app is built with Expo managed workflow. It must function correctly on iOS 16+ and Android 10+. Expo SDK version selection should prioritize long-term support releases. No native modules that break the managed workflow are permitted in MVP.

### Mobile-First Performance
The feed must scroll smoothly at 60 fps on mid-range devices. Firestore pagination must be implemented to avoid loading the entire `prayerRequests` collection on first load. Images (if any, such as the app icon or onboarding graphics) must be appropriately sized and compressed. Initial app load time from cold start should target under three seconds on a standard mobile data connection.

### Accessibility
- All interactive elements must have accessible labels readable by VoiceOver (iOS) and TalkBack (Android).
- Tap targets must meet the minimum size of 44x44 points.
- Color contrast ratios must meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text).
- Dynamic text size changes (user font size preferences) must not break layouts.
- The prayer feed must use an `aria-live` equivalent (accessibility announcements) when new content loads.
- Form inputs must have properly associated labels — a specific failure in the legacy app.

### Offline and Error States
- The app should display a meaningful error state when there is no network connection, rather than showing an empty feed or hanging indefinitely.
- Failed writes (prayer submission, prayer interaction) must be communicated to the user with an in-app message. The user should be able to retry.
- Firestore offline persistence (enabled by default in the Firestore SDK) means the feed may show cached content when offline. A "you are offline" indicator should make this clear.

### Secure Data Access
- Firebase Firestore security rules must be written and deployed before any public access to the app.
- All `prayerRequests` reads must require authentication (`request.auth != null`).
- Users may only write to their own `users` document.
- Users may only create `prayerRequests` documents where `request.resource.data.userId == request.auth.uid`.
- Users may only create `prayerInteractions` documents where the `userId` field matches their own UID.
- `reports` documents can be created by any authenticated user but read only by admins.
- `status` field on `prayerRequests` can only be updated by admin-role accounts or Cloud Functions, not by regular users.
- No rule may permit unauthenticated reads or writes to any collection.

### Scalable Firestore Structure
- All queries used by the app must be backed by Firestore indexes (composite or single-field).
- The `prayerRequests` feed query (filter `status == "active"`, order by `createdAt` descending) requires a composite index.
- Pagination uses Firestore cursor-based queries (`startAfter`) rather than offset-based pagination.
- Prayer counts use `FieldValue.increment()` for atomic server-side updates rather than client-read-increment-write patterns.

---

## 15. Success Metrics

The following metrics define early success for the app and should be tracked from day one.

**Account creation completion rate.** The percentage of users who begin registration and complete it including setting a display name. A completion rate below 60% suggests friction in the onboarding flow.

**Prayer request submissions per week.** The raw number of prayer requests submitted weekly. This is the primary engagement signal. Growth in this metric indicates the core loop is working.

**Feed views per active user.** How often users open the feed without submitting a request. High feed views relative to submissions indicates healthy "praying for others" behavior.

**Prayer interactions per request.** The average number of "I prayed for this" taps per prayer request. A higher average indicates that the community is actively engaging with requests. A target of 2–5 interactions per request in the first 30 days would be a positive early signal.

**Report rate.** The number of reports filed divided by total prayer requests submitted. A healthy moderation system has a low report rate. A sudden spike indicates either a spam attack or a moderation failure.

**Day-7 retention.** The percentage of users who return to the app 7 days after their first session. Prayer apps may have high day-1 engagement (a user posts in a crisis) and drop off. Retention is a signal of habitual use.

**Day-30 retention.** The percentage of users active 30 days after first session. This measures whether the app becomes a habit.

**Ad impressions (if ads enabled).** Total ad impressions per day and per session, tracked via AdMob. Used to monitor monetization performance and ensure ad placements are not suppressing user engagement.

---

## 16. Risks and Open Questions

### Moderation Workload
In v1, flagged content is reviewed manually by the developer via the Firebase console. As the user base grows, this is not scalable. An early decision is needed: at what content volume does a lightweight admin UI become necessary? Who is responsible for moderation if the developer is unavailable?

### Privacy Sensitivity of Prayer Content
Prayer requests contain some of the most personal content a user may share digitally. A data breach or unauthorized access could cause real harm. Firebase security rules and authentication must be in place before any public launch. The privacy policy must be accurate and written by or reviewed by a qualified person before submission.

### Firebase Security Rules Must Be Enforced Before Launch
The legacy app ran with fully open database rules. This cannot be repeated. Security rules must be written, tested, and deployed before the app is available to any external users — including beta testers. Testing security rules with the Firebase emulator suite is strongly recommended before production deployment.

### App Store Review Risks
Apple App Store review for apps with user-generated content related to religion can be unpredictable. Review rejection reasons may include: lack of a privacy policy, insufficient moderation mechanisms, content concerns, or age rating mismatches. Plan for at least one round of revisions. Submit to TestFlight first and gather feedback before public submission.

### Monetization Fit
Running ads in a prayer app is a legitimate but delicate choice. Some users will find any advertising presence incongruous with the app's purpose. The placement rules in Section 13 are designed to minimize this friction. Community feedback after soft launch should inform whether ads are enabled, where they appear, and what size and frequency is acceptable.

### Legacy Data Migration
The legacy Firebase Realtime Database likely contains real prayer requests from real users (submitted during the original class project). Before the mobile app launch, a decision must be made: migrate this data to Firestore, archive it separately, or leave it in the legacy database untouched. Migration requires schema transformation (adding `userId`, `isAnonymous`, `status`, `createdAt` from a date string, etc.) and a decision on how to handle anonymous legacy records that have no associated account.

### Bible Verse API Licensing and Reliability
The legacy app used `labs.bible.org` over plain HTTP with JSONP — an unreliable pattern for a production app. The rebuild must use a HTTPS endpoint. Open questions: Is labs.bible.org still active and maintained? What are its rate limits? Does using its content in a commercial app (with ads) require attribution or a license agreement? Alternatives include the API.Bible platform, YouVersion API (requires partnership), or a self-managed curated verse dataset in Firestore that avoids third-party API dependency entirely.

---

## 17. Recommended MVP Release Plan

### Phase 0 — Planning and Repo Setup
Finalize and approve the PRD. Confirm Firebase project setup (new project or reconfigure existing). Lock down legacy database security rules. Decide on legacy data fate. Set up the `mobile-app/` directory in the repository with an Expo managed workflow project. Establish TypeScript from day one. Set up `.env` management for Firebase configuration values. Document the project structure in the repo.

### Phase 1 — App Foundation
Initialize the Expo project with Expo Router for file-based navigation. Configure Firebase JS SDK (modular v9+) with Firestore, Firebase Auth, and Firebase Analytics. Build the authentication screens: sign in, register, forgot password. Implement Firebase Auth session persistence. Build the display name setup screen for new users. Write and deploy the initial Firestore security rules (auth-gated reads, owner-only writes). Test auth flow on both iOS simulator and Android emulator.

### Phase 2 — Core Prayer Features
Build the prayer request feed screen with Firestore pagination and card layout. Build the prayer request detail screen. Build the prayer request submission form with validation, character counter, anonymous toggle, and success screen. Implement the "I prayed for this" interaction with `FieldValue.increment()` and duplicate prevention. Add the Verse of the Day card. Test all screens for correct data binding, pagination behavior, and offline states.

### Phase 3 — Trust, Safety, and Analytics
Implement the report content flow (reason picker, note field, Firestore write). Implement content deletion (user deletes their own prayer request). Implement account deletion with data anonymization. Wire up Firebase Analytics events from Section 12. Write and deploy updated Firestore security rules that enforce `status` write restrictions. Review all screens for accessibility issues (label associations, tap targets, contrast). Add offline error states.

### Phase 4 — Ads and Release Readiness
Confirm AdMob content policy eligibility for the app category. If approved, integrate `react-native-google-mobile-ads` with a banner ad unit in the feed. Enforce the placement rules from Section 13. Write or finalize the Privacy Policy and Terms of Service. Link them from the settings screen. Prepare App Store and Google Play assets: icon, screenshots for multiple device sizes, app description, keywords, age rating. Review all screens against App Store Human Interface Guidelines and Google Play Material Design expectations.

### Phase 5 — App Store and Google Play Submission
Distribute a TestFlight beta to a small group of real users. Gather feedback on usability, tone, and performance. Fix critical issues from beta. Submit to Apple App Store review. Submit to Google Play review. Address any review feedback. Upon approval, release to public on both platforms. Monitor analytics and crash reporting in the first week.

---

## 18. Next Steps

The following checklist should be completed after this PRD is reviewed and approved. Items are ordered by dependency and priority.

- [ ] Review and approve this PRD. Identify any open questions in Section 16 that must be resolved before development begins.
- [ ] Audit the Firebase project in the Firebase console: confirm it is active, review current Realtime Database contents, check billing status, and verify no Auth users exist from the legacy project.
- [ ] Immediately update the legacy Realtime Database security rules to restrict unauthenticated writes, regardless of whether the legacy data will be migrated.
- [ ] Decide the fate of legacy prayer request data: migrate, archive, or leave in place. Document the decision.
- [ ] Decide on Verse of the Day source: labs.bible.org HTTPS endpoint, an alternative API, or curated Firestore dataset. Confirm licensing if using external API content in a monetized app.
- [ ] Create the `mobile-app/` Expo project using `npx create-expo-app` with TypeScript template.
- [ ] Set up Firebase project configuration for the mobile app (Firebase project console, add iOS and Android apps, download config files, add to `.gitignore`).
- [ ] Write the initial Firestore security rules based on the intent described in Section 14 and test them with the Firebase emulator suite.
- [ ] Build Phase 1 (auth foundation) and validate on real devices before proceeding to Phase 2.
- [ ] Draft the Privacy Policy before Phase 3 work begins, so it is ready to link before beta testing.
- [ ] Review AdMob content policy for religion-category apps before beginning Phase 4.
- [ ] Create App Store Connect and Google Play Console accounts (if not already active) and reserve the app name and bundle identifier.
