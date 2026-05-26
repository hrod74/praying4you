# Legacy App Audit: Praying 4 You

**Audit Date:** 2026-05-26
**Audited By:** Claude Code (claude-sonnet-4-6)
**Source Directory:** `legacy-web-app/`

---

## 1. Executive Summary

Praying 4 You is a simple, single-page web app built as an Advanced JavaScript class project. Its core purpose is to allow anonymous users to post prayer requests and for other visitors to acknowledge them with a thumbs-up vote. There is no authentication, no user accounts, and no moderation.

The app is built on jQuery, Bootstrap 3, and Firebase Realtime Database using the Firebase JavaScript SDK v3.0 — a version that is now severely outdated (current major version is v9/modular). The app is deployed (or intended to be deployed) via Firebase Hosting.

The planned rebuild is a React Native / Expo mobile app targeting iOS and Android. The legacy app serves as a product reference and data origin point. The mobile rebuild should preserve the core mission — community prayer sharing — while addressing authentication, moderation, safety, and modern architecture patterns that the legacy app entirely lacks.

---

## 2. Current App Functionality

### Prayer Request Submission
- The user fills in a **Username** text field (`#inputUser`) and a **Prayer Request** textarea (`#inputPrayer`).
- Clicking the **Submit** button fires a `save()` function that reads both fields and pushes a new record to the Firebase Realtime Database under the `prayers/` path.
- The record stores: a date string, the username, the prayer text, and an initial vote count of `0`.
- **There is no form validation.** Empty or whitespace-only submissions will be pushed to the database without any warning.

### Prayer Request Display
- The app listens for `child_added` events on the `prayers/` Firebase ref. Every time a new record arrives (including all existing records on load), a new table row is prepended to `#prayer-list`.
- The table has four columns: **Date**, **Usernames**, **Prayers**, and an action column with a thumbs-up icon and vote badge.
- Rows are prepended (newest first in practice as records arrive), but ordering depends on Firebase's key order, not a timestamp sort.

### Username Behavior
- Username is a free-text field with no length limit, no uniqueness enforcement, and no authentication. Any user can enter any name — including another user's name. There is no identity verification of any kind.

### Prayer Request Text Behavior
- The prayer text is also a free-text field with no character limit, no profanity filter, and no content moderation. Any text can be submitted.

### Verse of the Day
- On page load, `bibleApiCall()` fires an AJAX JSONP request to `http://labs.bible.org/api/?passage=votd&type=json` (plain HTTP, not HTTPS).
- On success, it populates the `#randomVerse` container with the book name, chapter, verse number, and text.
- On error, it calls `alert("opps something went wrong!")` — a browser `alert()` with a typo.
- A hardcoded fallback verse (John 3:16) is present in the HTML and is visible until the API call completes or fails.

### Voting / "Pray for This" Behavior
- Each prayer row has a Font Awesome thumbs-up icon with an `onClick` attribute that calls `vote(key)`.
- `vote()` increments `data[k].votes` in the local in-memory `data` object, then calls `conn.update(data)` — which attempts to overwrite the entire `prayers/` node with the local snapshot. This is a broken pattern (see Section 8).
- After voting, `location.reload()` is called, which forces a full page reload.
- There is no per-user vote tracking. A user can vote any number of times.

### Cancel / Reset Behavior
- The form has a `type="reset"` Cancel button. This clears both fields using native browser form reset behavior. No JavaScript is involved.

### Success Alert Behavior (Broken)
- `index.html` contains a Bootstrap success alert div (`alert-success`) with the class `hide-display` (which sets `display: none`).
- **No JavaScript ever removes this class or shows the alert.** The "God Bless! Your prayer request has been sent" message is never displayed to the user after submitting.

---

## 3. File and Folder Structure

```
legacy-web-app/
├── index.html                  # Main app page — the actual working app
├── database.rules.json         # Firebase Realtime Database security rules
├── firebase.json               # Firebase project config (hosting + DB rules)
├── .firebaserc                 # Firebase project alias (project ID)
├── gulpfile.js                 # Gulp build file — effectively empty (1 line)
├── README.md                   # Generic Bitbucket-template README, unfilled
│
├── js/
│   ├── app.js                  # Primary application JavaScript
│   └── app-scratch.js          # Exact duplicate of app.js — scratch/dev artifact
│
├── styles/
│   ├── style.css               # Custom app styles (minimal: logo, footer, hide-display)
│   ├── normalize.css           # CSS reset
│   ├── bootstrap.css           # Bootstrap 3 full CSS
│   ├── bootstrap.min.css       # Bootstrap 3 minified CSS (both loaded — redundant)
│   ├── font-awesome.css        # Font Awesome full CSS
│   └── font-awesome.min.css    # Font Awesome minified CSS (both loaded — redundant)
│
├── fonts/                      # Font Awesome icon font files (.otf, .eot, .svg, .ttf, .woff, .woff2)
│
├── images/
│   ├── phicon.png              # Favicon (praying hands icon)
│   ├── prayinghands.png        # Navbar logo image
│   └── praying-hands-emoji.png # Unused image asset
│
└── public/
    └── index.html              # Default Firebase Hosting welcome page (not the app)
```

### Key Structural Note

The `firebase.json` hosting config points `"public": "public"`, meaning the Firebase Hosting deployment serves the contents of the `public/` folder. The `public/index.html` is the generic Firebase default page — **not the actual app**. The actual app lives in the root `index.html` and `js/app.js`. These were never moved into the `public/` directory, so the hosted version of the site would have shown the Firebase welcome page, not the Praying 4 You app.

---

## 4. Technology Stack

| Technology | Version | Notes |
|---|---|---|
| HTML5 | — | Single-page, no build pipeline |
| CSS3 | — | Minimal custom styles |
| JavaScript | ES5 | No modules, no transpilation |
| jQuery | 1.9.1 | Loaded from Google CDN; EOL and very outdated |
| Bootstrap | 3.3.6 | Loaded from MaxCDN; Bootstrap 3 is end-of-life |
| Font Awesome | ~4.x | Icon fonts, self-hosted in `fonts/` |
| Firebase JS SDK | 3.0 (live channel) | Severely outdated; current stable is v9+ modular |
| Firebase Realtime Database | — | Used for all data storage |
| Firebase Hosting | — | Configured but misconfigured (see Section 3) |
| Gulp | Unknown | `gulpfile.js` exists but is empty; never configured |
| labs.bible.org API | — | Third-party JSONP API for verse of the day (HTTP only) |

**No package.json, no node_modules, no module bundler.** All dependencies are loaded via CDN links or vendor-copied files. This is a pure vanilla HTML/JS project.

---

## 5. Firebase Usage

### SDK Version
The app loads Firebase via:
```html
<script src="https://www.gstatic.com/firebasejs/live/3.0/firebase.js"></script>
```
This is **Firebase SDK v3.0**, loaded from a `live` CDN channel. This version is approximately 8–9 years old. The current Firebase SDK is v9+ (modular). Firebase v3 uses the legacy namespaced API (`firebase.database()`, `firebase.initializeApp()`, etc.).

### Firebase Project References
- The app references a specific Firebase project by URL and ID.
- A Firebase API key is hardcoded directly in `js/app.js` and duplicated in `js/app-scratch.js`.
- The project ID is also present in `.firebaserc`.
- **Important:** Firebase web API keys are not secret in the traditional sense — they are public identifiers used to locate a Firebase project. However, with fully open database rules (see below), this API key combined with the open rules means anyone can read and write all data. The key should not be considered sensitive on its own, but the open rules make it dangerous in combination.

### Database Usage
- The app uses **Firebase Realtime Database** (not Firestore).
- It connects to the `prayers/` node at the root of the database.
- It uses `conn.on("child_added", ...)` for real-time listening (live updates as records are added).
- It uses `conn.push(...)` to create new records.
- It uses `conn.update(data)` for voting — but this is a buggy implementation (see Section 8).

### Firebase Hosting Configuration
- `firebase.json` configures hosting with `"public": "public"` and a catch-all rewrite to `/index.html`.
- As noted, the actual app files are not in `public/`, making this deployment misconfigured.

### Database Security Rules
```json
{
  ".read": true,
  ".write": true
}
```
**This is the most critical risk in the entire application.** These rules grant unrestricted read and write access to the entire database for any unauthenticated user. Anyone with the database URL can read all data, write new data, overwrite existing data, or delete all records — without authentication of any kind.

### Risks and Outdated Patterns
- **Open database rules** are a critical security vulnerability.
- **Firebase SDK v3 is unsupported.** It receives no security patches.
- **API key hardcoded in source code** — while not a secret by Firebase design, it is bad practice and will be committed to version control.
- **No Firebase Authentication** is used or configured.
- The `live/3.0` CDN channel is no longer maintained; behavior is unpredictable.

---

## 6. Data Model

### Current Structure (Inferred)

**Database path:** `prayers/` (Firebase Realtime Database)

Each child of `prayers/` is a Firebase auto-generated push key (e.g., `-Lxyz123abc`), containing:

| Field | Type | Source | Notes |
|---|---|---|---|
| `date` | string | `today()` function | Format: `M/D/YYYY` (e.g., `5/25/2026`) |
| `user` | string | `#inputUser` field | Free text, no validation, no uniqueness |
| `prayer` | string | `#inputPrayer` field | Free text, no validation, no length limit |
| `votes` | integer | Hardcoded `0` on create | Incremented via broken local-update pattern |

### How Records Are Created
`conn.push({ date, user, prayer, votes: 0 })` — Firebase generates a unique key and writes the object.

### How Records Are Displayed
`conn.on("child_added", ...)` fires for every existing child on load, then again for each new child in real time. Each event builds an HTML string via concatenation and prepends it to the `#prayer-list` table body.

### Missing Fields for the Mobile Rebuild
The following fields are absent from the current model and will be needed:

- `userId` — to associate a prayer with an authenticated account
- `isAnonymous` — boolean flag for display-layer anonymity
- `displayName` — the name shown publicly (could differ from account name)
- `createdAt` — a proper server timestamp, not a client-formatted date string
- `updatedAt` — for tracking edits
- `status` — e.g., `active`, `removed`, `flagged`
- `reportCount` — for moderation
- `prayerCount` — a proper server-side counter replacing the broken `votes` field
- `platform` — to distinguish web vs. mobile submissions if data is migrated

---

## 7. UX and Product Observations

### What Works Well
- The core concept is clear and compelling: post a prayer request, pick up someone else's.
- The flow is extremely simple — no login barrier, no friction to submit.
- The thumbs-up voting mechanic is an intuitive "I prayed for this" signal.
- A Verse of the Day adds spiritual context and gives the page life beyond the list.

### What Feels Outdated
- Bootstrap 3 UI is visually dated (2014-era design language).
- The table layout for prayer requests is utilitarian but cold — a card-based layout would feel warmer and more personal.
- The navbar is minimal with no navigation or purpose.
- The hardcoded John 3:16 fallback is always briefly visible on load.

### Friction Points
- No feedback when a prayer is submitted (the success alert is broken and never shows).
- No input validation — easy to accidentally submit an empty request.
- No way to see your own past submissions.
- The vote count does not persist properly across sessions due to the broken update logic.
- `location.reload()` on every vote is jarring and resets the scroll position.
- No character count or limit on prayer text.

### Accessibility Concerns
- `<label for="inputUsername">` references `inputUsername` but the input ID is `inputUser` — the label is not properly associated.
- Font Awesome icons (thumbs up) have no accessible text alternative. The `aria-hidden='true'` attribute hides the icon from screen readers but there is no visible or accessible label for the vote action.
- Color contrast on the footer text is effectively invisible (white text on off-white background).
- No `aria-live` region for the dynamically updated prayer list.

### Mobile-Readiness Concerns
- The viewport meta tag is present, so the page is not completely broken on mobile.
- Bootstrap 3's responsive grid is used, but the table layout does not adapt gracefully on small screens.
- jQuery 1.9.1 and Bootstrap 3 CDN links may be blocked or slow in some mobile contexts.
- There is no touch-optimized interaction for voting.

### Trust and Safety Concerns
- Any user can post any content — including spam, hate speech, or harmful content.
- There is no moderation, flagging, or reporting mechanism.
- No Terms of Service or Community Guidelines are referenced.
- Users cannot delete their own posts.
- Usernames are completely free-form — impersonation is trivial.

### Anonymous Posting and Identity Concerns
- The app is entirely anonymous by default. There is no way to associate a prayer request with a returning user.
- "Anonymous" here means no identity at all — not private-to-public anonymity but genuinely no identity. This is problematic for moderation and for users who want to see their own history.

---

## 8. Code Quality Observations

### Organization
- All logic lives in a single `app.js` file. For its size this is acceptable, but there is no separation between data access, DOM manipulation, and business logic.
- `app-scratch.js` is an exact duplicate of `app.js` and should not be in the repository. It appears to be a development artifact that was committed accidentally.

### Naming
- Variable names are clear (`prayer`, `user`, `votes`, `conn`).
- `conn` as a name for a Firebase database reference is not self-describing; something like `prayersRef` would be better.
- The `today()` function is well-named and appropriately extracted.

### Duplication
- `app.js` and `app-scratch.js` are identical. This is straightforward duplication.
- Both `bootstrap.css` and `bootstrap.min.css` are linked in `index.html` — the same stylesheet loaded twice.
- Same issue with `font-awesome.css` and `font-awesome.min.css`.

### Outdated Syntax
- ES5 throughout: `var` instead of `const`/`let`, no arrow functions, no template literals, no modules.
- JSONP (`dataType: 'jsonp'`) is a legacy cross-origin technique replaced by CORS. The bible.org API call also uses plain HTTP, not HTTPS.
- The `save()` function signature declares parameters `(date, user, prayer, votes)` that are immediately shadowed by `var user = ...` and `var prayer = ...` inside the function body. The parameters are dead code.
- `firebase.initializeApp()` and `firebase.database()` are the legacy Firebase v3 namespaced API, incompatible with the current modular SDK.

### Global Variables
- `data` and `conn` are global variables. `vote()` and the `child_added` listener both depend on the global `data` object being in sync with the database — a fragile approach.
- All functions (`today`, `save`, `vote`, `bibleApiCall`) are in the global scope.
- The `onClick` attribute on the thumbs-up icon calls `vote(...)` as a global function, tightly coupling the HTML to the JS global scope.

### Separation of Concerns
- None. HTML, data access, DOM manipulation, and event handling are all intermingled.
- HTML is built via string concatenation in the `child_added` listener — no templating, no component model.

### Error Handling
- The only error handler is `alert("opps something went wrong!")` in the bible API call — a browser `alert()` with a typo ("opps").
- No error handling exists for Firebase writes or reads. If a prayer fails to save, the user receives no feedback.
- No try/catch anywhere in the code.

### Form Validation
- None. Empty strings are pushed to Firebase without any check.
- There are no minimum length requirements, character limits, or XSS sanitization.

### Security Concerns — XSS Vulnerability
This is a significant issue. The `child_added` listener builds table rows via direct string concatenation:
```js
tr += "<td>" + prayer.user + "</td>";
tr += "<td>" + prayer.prayer + "</td>";
```
Neither `prayer.user` nor `prayer.prayer` is sanitized or escaped before being injected into the DOM. **Any user can store arbitrary HTML or JavaScript in the database and have it execute in other users' browsers.** This is a stored Cross-Site Scripting (XSS) vulnerability.

### Broken Vote Logic
The `vote()` function is fundamentally broken:
```js
data[k].votes++;
conn.update(data);  // attempts to update the ENTIRE prayers/ node
```
`conn` points to `prayers/`. Calling `conn.update(data)` with the entire local `data` object attempts to write the full prayer collection back, which is not the intended behavior and may corrupt or overwrite records depending on the state of `data` at the time of the call. The correct approach would be to use a transaction or update only the specific child: `conn.child(k).update({ votes: data[k].votes })`.

---

## 9. Risks Before Rebuild

### Critical: Open Firebase Security Rules
The database rules (`".read": true, ".write": true`) allow any person with the database URL to read all prayer requests, write arbitrary data, overwrite existing records, or delete everything. This must be addressed before any mobile app points to this Firebase project.

### Critical: Stored XSS in Existing Data
Because the legacy app never sanitized user input before writing to Firebase, the existing `prayers/` collection may contain records with embedded HTML or JavaScript. Any new app that renders this data must treat all legacy values as untrusted and sanitize before display.

### High: No Authentication
The mobile app requires email-based authentication. The legacy Firebase project has no authentication configured. This is a new setup task, not a migration task.

### High: User-Generated Content Moderation
Both iOS App Store and Google Play require apps with user-generated content to have moderation mechanisms. An app with no moderation — especially one dealing with sensitive personal content like prayer requests — will likely fail App Store review or receive reports. A reporting/flagging system and moderation capability are required for launch.

### High: Anonymous Posting vs. App Store UGC Requirements
App stores require that users of apps with UGC can be identified and that content can be removed. Pure anonymous posting (no account at all) conflicts with these requirements. The rebuild must use accounts privately while allowing public-facing anonymity as a display option.

### Medium: Privacy and Sensitive Content
Prayer requests are inherently sensitive personal content. Users may disclose health conditions, family situations, grief, or other private matters. There is no privacy policy, no data retention policy, and no mechanism for users to delete their own requests. These are required for App Store compliance and for ethical product design.

### Medium: Data Migration
The legacy `prayers/` collection likely contains real data from real users. Before rebuilding, decide whether to migrate this data, archive it, or leave it in place. The schema mismatch (no `userId`, no `createdAt` timestamp, no `status` field) means migration requires transformation and decisions about how to handle legacy anonymous records.

### Medium: Firebase SDK and Project Health
The legacy project uses Firebase SDK v3, which is unsupported. The Firebase project itself should be audited in the Firebase console to understand its current state, billing status, and whether the Realtime Database is still active.

### Low: Ads and Monetization
The README mentions exploring lightweight mobile ads. Mobile ad networks (AdMob) have content policies that may affect ad eligibility for a prayer/religion app. This should be reviewed early to avoid building an ad integration that gets rejected at review.

### Low: bible.org API Dependency
The verse-of-the-day feature depends on `labs.bible.org/api`, a third-party service. It serves over plain HTTP and uses JSONP. For the mobile rebuild, consider whether this API is still active, whether it has rate limits, and whether a different verse API or a self-managed verse dataset would be more reliable.

---

## 10. Recommended Rebuild Approach

### What Should Be Preserved
- **The core concept**: post a prayer request, browse others' requests, signal that you prayed.
- **Low barrier to entry**: even authenticated users should be able to post quickly.
- **Verse of the Day**: a meaningful spiritual touchpoint — rebuild with a reliable HTTPS API or curated dataset.
- **Simple, warm tone**: the app's purpose is communal support. Keep the UX compassionate and uncluttered.

### What Should Be Redesigned
- **Authentication**: email/password (Firebase Auth) as the baseline. Consider social login later.
- **Anonymous posting**: implement as a display-layer choice (`isAnonymous: true`), not an absence of identity. The account is always tied to the post privately.
- **Prayer list UI**: replace the table with a card-based feed — warmer, more readable, and mobile-native.
- **Voting / prayer interaction**: replace the broken thumbs-up with a proper "I prayed for this" action using Firebase transactions for atomic counts.
- **Form validation**: required fields, character limits, and submission feedback.
- **Success feedback**: clear, in-app confirmation after a prayer request is submitted.

### What Should Not Be Carried Over
- **Firebase SDK v3 patterns**: start fresh with the modular v9+ SDK.
- **jQuery**: not needed in React Native.
- **Global variables and inline event handlers**: replace with React component state and props.
- **Plain HTTP API calls**: HTTPS only.
- **Duplicate files** (`app-scratch.js`): do not migrate.
- **Open database rules**: write strict, auth-based rules from day one.
- **The `public/index.html` Firebase default page**: irrelevant to the mobile build.

### Recommended React Native / Expo Architecture
- **Expo SDK** (managed workflow) for the fastest path to iOS and Android.
- **Expo Router** for file-based navigation.
- **Firebase JS SDK v9+ (modular)** for Auth, Firestore, and optionally Cloud Functions.
- **Firestore** (not Realtime Database) for the new data model — better querying, offline support, and security rules expressiveness.
- **React Query or SWR** (or Expo's built-in data tools) for data fetching and caching.
- **NativeWind or StyleSheet** for styling (avoid bringing in Bootstrap concepts).
- **Expo Notifications** for future push notification features.
- **Google AdMob** via `react-native-google-mobile-ads` for monetization.

### Recommended First MVP Scope
1. User registration and login (email/password via Firebase Auth)
2. Post a prayer request (public or anonymous)
3. Browse the prayer request feed (paginated)
4. "I prayed for this" action with count
5. Delete your own prayer request
6. Verse of the Day (header or dedicated card)
7. Basic content reporting (flag a post)
8. App Store / Play Store submission with privacy policy

---

## 11. Suggested Mobile App Data Model

All collections are in **Firebase Firestore** (not Realtime Database).

---

### `users/{userId}`

Stores the authenticated user's profile.

```
users/{userId}
  uid:            string      // Firebase Auth UID (same as document ID)
  email:          string      // From Firebase Auth (private, not displayed)
  displayName:    string      // Public display name chosen by user
  createdAt:      timestamp   // Account creation time
  updatedAt:      timestamp   // Last profile update
  isActive:       boolean     // For soft-banning without deletion
  prayerCount:    integer     // Total prayer requests submitted (denormalized counter)
```

---

### `prayerRequests/{requestId}`

The primary content collection.

```
prayerRequests/{requestId}
  id:             string      // Firestore auto-generated document ID
  userId:         string      // UID of the author (always stored, even if anonymous)
  isAnonymous:    boolean     // If true, display name is hidden from other users
  displayName:    string      // Cached display name at time of posting (or "Anonymous")
  body:           string      // The prayer request text
  createdAt:      timestamp   // Server timestamp (FieldValue.serverTimestamp())
  updatedAt:      timestamp   // Last edited
  status:         string      // "active" | "removed" | "flagged"
  prayerCount:    integer     // Atomic counter — number of "I prayed for this" taps
  reportCount:    integer     // Number of reports filed against this request
```

---

### `prayerInteractions/{interactionId}`

Tracks which users have prayed for which requests (prevents duplicate counts).

```
prayerInteractions/{interactionId}
  // Document ID convention: {userId}_{requestId}
  userId:         string      // UID of the user who prayed
  requestId:      string      // ID of the prayer request they prayed for
  prayedAt:       timestamp   // When the interaction occurred
```

**Subcollection alternative:** `prayerRequests/{requestId}/interactions/{userId}` — simpler reads, same guarantees.

---

### `reports/{reportId}`

Records user-submitted content reports for moderation.

```
reports/{reportId}
  requestId:      string      // The reported prayer request ID
  reportedBy:     string      // UID of the user filing the report
  reason:         string      // "spam" | "inappropriate" | "harmful" | "other"
  notes:          string      // Optional free-text note from the reporter
  createdAt:      timestamp
  status:         string      // "pending" | "reviewed" | "dismissed" | "actioned"
```

---

### `verses/{verseId}`

Optional: a curated collection of verses for the Verse of the Day feature (avoids third-party API dependency).

```
verses/{verseId}
  book:           string      // e.g., "John"
  chapter:        integer     // e.g., 3
  verse:          integer     // e.g., 16
  text:           string      // The verse text
  translation:    string      // e.g., "NIV", "ESV", "NLT"
  tags:           string[]    // e.g., ["hope", "prayer", "faith"] — for themed selection
```

A daily verse can be selected via a Cloud Function scheduler that writes the current day's verse to a `config/verseOfTheDay` document, avoiding reads of the full collection on every app load.

---

### Security Rules (Firestore — Intent)

- **`users`**: A user can read and write only their own document. Admins can read all.
- **`prayerRequests`**: Anyone authenticated can read `active` requests. Only the author can create or update their own. Only an admin or Cloud Function can change `status`.
- **`prayerInteractions`**: Authenticated users can create an interaction for their own UID. No deletes.
- **`reports`**: Authenticated users can create. Only admins can read or update.
- **`verses`**: Read-only for all authenticated users.

---

## 12. Suggested Next Steps

Prioritized checklist for moving from audit to active rebuild:

- [ ] **1. Review Firebase project in console** — Confirm the Firebase project is active, check current database contents, review billing, and identify any existing Auth users (there likely are none).
- [ ] **2. Lock down database security rules** — Immediately update `database.rules.json` to restrict unauthenticated writes. Even if the legacy database is being deprecated, it should not remain fully open.
- [ ] **3. Decide on legacy data fate** — Determine whether existing prayer requests should be migrated, archived, or left in the legacy Realtime Database. Document this decision.
- [ ] **4. Initialize the Expo project** — Create `mobile-app/` using `npx create-expo-app`. Choose the managed workflow with TypeScript.
- [ ] **5. Set up Firebase project for mobile** — Create a new Firebase project (or configure the existing one) with Firestore, Firebase Auth (email/password), and the new Firestore security rules.
- [ ] **6. Implement Firebase Auth** — Build registration, login, and session persistence screens before any other feature.
- [ ] **7. Build the prayer request feed** — Connect to Firestore `prayerRequests` collection with pagination, displaying cards with date, display name / "Anonymous", prayer text, and prayer count.
- [ ] **8. Build the submit prayer request screen** — Form with validation, anonymous toggle, and success feedback.
- [ ] **9. Implement "I prayed for this"** — Atomic Firestore transaction to increment `prayerCount` and write to `prayerInteractions`. Gate on authentication.
- [ ] **10. Add Verse of the Day** — Decide between the bible.org API (HTTPS endpoint), an alternative API, or a curated in-app dataset. Implement as a card at the top of the feed.
- [ ] **11. Add content reporting** — "Report" option on each prayer card that writes to the `reports` collection.
- [ ] **12. Write a Privacy Policy** — Required by both App Store and Google Play for apps that collect user data. Must cover: what data is collected, how it is used, how users can delete their account and data.
- [ ] **13. Prepare App Store assets** — App icon, screenshots, app description, age rating (likely 4+), content warnings for user-generated religious content.
- [ ] **14. Review AdMob content policy** — Confirm the app and content category are eligible for AdMob ads before building monetization.
- [ ] **15. Beta test with TestFlight / Play Internal Testing** — Before submitting to public review, test with a small group of real users.
