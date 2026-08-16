# Content Filter Implementation (Pre-Publication Objectionable-Content Filtering)

**Status: IMPLEMENTATION COMPLETE. AUTOMATED TESTS PASSING. MANUAL PHYSICAL-DEVICE QA PASSED,
2026-08-16, 21 of 21 scenarios, 0 defects.**

This document records the completed implementation of pre-publication content filtering for
public prayer-request text and public display names. Manual QA against the checklist in
`docs/QA_content_filter_scenarios.md` was completed on 2026-08-16: all 21 scenarios passed, in
both Firebase mode and local/mock mode, with 0 defects found. See that document for the full
execution record.

## Purpose and controlled-beta scope

Praying For You is a controlled-beta, adult-only, Christian prayer-community app. Users submit
public prayer requests, including Anonymous requests, and choose a public display name.
Legitimate prayers routinely discuss suicide, self-harm, abuse, addiction, illness, violence,
grief, and mental health, and this filter must never block those topics for being sensitive.

This is a narrow, on-device, deterministic filter for a small set of high-confidence categories
where there is essentially no legitimate use of the matched language in a prayer request or a
display name: explicit sexual solicitation, child sexual exploitation language, direct
identity-based slurs, explicit first-person threats of harm to another person, and clear targeted
harassment phrases. Everything else, including all merely sensitive or difficult subject matter,
is intentionally left allowed and handled through user reporting and human moderation, as it
already was before this feature existed.

## Apple and Google UGC-policy rationale

The repository's source of record for this rationale is the owner-approved
`docs/store/Age_Rating_Target_Audience_Worksheet.md` (v0.1, Approved). Section 9 of that worksheet
is a dedicated User-Generated-Content Compliance Review, separate from the age-rating
questionnaire itself, and quotes both platforms directly:

- Apple App Review Guidelines, Section 1.2 (User-Generated Content), quoted in Section 9a: "To
  prevent abuse, apps with user-generated content or social networking services must include: A
  method for filtering objectionable material from being posted to the app; A mechanism to report
  offensive content and timely responses to concerns; The ability to block abusive users from the
  service; Published contact information so users can easily reach you."
- Google Play User Generated Content policy, quoted in Section 9b: apps with UGC must "require
  users to accept your app's terms of use and/or user policy before users can create or upload
  UGC," "define objectionable content and behaviors... in the app's terms of use or user
  policies," "conduct UGC moderation... including providing an in-app system for reporting and
  blocking objectionable UGC and users."

Section 9a's safeguard table records "A method for filtering objectionable material from being
posted" as "Not present" at the time of the worksheet's approval, and Section 10a lists "A method
for filtering objectionable material before publication" as one of three pre-external-beta
implementation blockers (alongside user blocking and Terms-of-Use acceptance), each tracked
separately from this feature. This implementation is the code-level response to that specific
blocker item. It does not by itself close the whole UGC Compliance Blocker task described in
Section 10d of the worksheet, since the other two blocker items (user blocking, Terms-of-Use
acceptance) are separate work, and because Apple's and Google's own review teams, not this
document, make the final determination of whether a given safeguard is sufficient. This document
does not claim store approval is guaranteed.

## Public API and result types

### `mobile-app/src/utils/contentFilter.ts`

```ts
export type ContentFilterReason =
  | 'sexualSolicitation'
  | 'childSexualExploitation'
  | 'identitySlur'
  | 'threatOfHarm'
  | 'targetedHarassment'
  | 'internalError';

export type ContentFilterResult =
  | { allowed: true }
  | { allowed: false; reason: ContentFilterReason; message: string };

export const CONTENT_FILTER_MESSAGE =
  'This contains language that cannot be shared with the community. Please revise it and try again.';

export function filterProhibitedContent(text: string): ContentFilterResult;
```

`ContentFilterResult` is a discriminated union: an allowed result carries only `allowed: true`,
with no `reason` or `message` field at all. A blocked result always carries both a stable internal
`reason` (used for tests and internal branching, never shown to the user) and a `message`, which
is always the single shared `CONTENT_FILTER_MESSAGE` regardless of category, so the copy itself
never hints at which word or pattern triggered the block.

### `mobile-app/src/utils/prayerSubmissionGate.ts`

```ts
export type PrayerSubmissionGateResult =
  | { status: 'blockedByValidation'; message: string }
  | { status: 'blockedByFilter'; message: string }
  | { status: 'ready' };

export function evaluatePrayerSubmission(body: string): PrayerSubmissionGateResult;
```

### `mobile-app/src/utils/displayNameSubmissionGate.ts`

```ts
export type DisplayNameSubmissionGateResult =
  | { status: 'blockedByValidation'; message: string }
  | { status: 'blockedByFilter'; message: string }
  | { status: 'ready' };

export function evaluateDisplayNameSubmission(displayName: string): DisplayNameSubmissionGateResult;
```

Both gate functions are pure, side-effect-free, and share the same shape. Each first runs the
existing ordinary validation (`validatePrayerBody` or `validateDisplayName`, both already existing
in `mobile-app/src/utils/validation.ts`, unchanged by this feature) and only calls
`filterProhibitedContent` once that has already passed. Both wrap their entire body in a
try/catch, so any unexpected internal failure, whether from validation or from the filter,
resolves to `blockedByFilter` with the shared `CONTENT_FILTER_MESSAGE`, never to `ready`.

## Normalization behavior

`filterProhibitedContent` never modifies the caller's string. It builds a separate normalized copy
for matching only, in this order:

1. Lower-case, so matching ignores capitalization.
2. A narrow, documented character-substitution set for simple evasion: `@` and `4` to `a`, `3` to
   `e`, `1` to `i`, `0` to `o`, `5` and `$` to `s`, `7` to `t`.
3. Strip everything that is not a lower-case letter, digit, or whitespace. This absorbs
   punctuation inserted inside a single prohibited term (for example `s.e.n.d n.u.d.e.s` becomes
   `send nudes`).
4. Collapse repeated whitespace down to a single space and trim.

Repeated-character evasion (for example `kiiiiill`) is handled at the pattern level, not by
transforming the submitted text. Every reference word compiles into a pattern where each letter
matches itself one or more times in sequence, so a doubled letter in the real spelling of a
reference word (for example the two Gs in a configured slur) still requires at least two of that
letter to match, while a single occurrence of that letter in an unrelated word does not. This
design specifically prevents the country name "Niger" from being treated as equivalent to a
configured slur that happens to contain a doubled letter, a false positive an earlier version of
this filter produced by collapsing repeated letters in the submitted text itself, corrected before
this implementation was approved.

All matching uses word boundaries, so a blocked term inside an unrelated longer word (for example
"class", "assistant", "therapist", "assassin") never matches.

## High-confidence blocked categories

Five categories, each intentionally narrow:

1. **Sexual solicitation** (`sexualSolicitation`): explicit solicitation or promotion phrasing
   only, such as asking for or offering nude images, or soliciting/promoting sexting. Bare words
   like "porn", "sex", or "sexting" alone are never blocked, since they appear in legitimate
   prayers (for example, a prayer for freedom from pornography addiction, or a prayer for a
   teenager being pressured into sexting by someone else).
2. **Child sexual exploitation** (`childSexualExploitation`): a minor-referencing term directly
   adjacent to an explicit pornographic term, in either order, or a small set of merged
   single-token variants. Deliberately does not match general "child sexual abuse" advocacy or
   survivor language, which pairs "child" with "abuse" or "assault", not with "porn", "nude", or
   "naked".
3. **Identity slurs** (`identitySlur`): a short, intentionally non-exhaustive list of unambiguous,
   severe slurs, matched as whole words.
4. **Threat of harm** (`threatOfHarm`): an explicit first-person intent marker immediately followed
   by a harm verb immediately followed by a second- or third-person target (for example "I will
   kill you"), so passive or past-tense victim disclosure (for example "I was hurt by him") does
   not match, since there is no intent marker or harm verb in that order.
5. **Targeted harassment** (`targetedHarassment`): a small set of direct, second-person attack
   phrases (for example telling someone else to harm themselves, or that they are worthless),
   distinct from first-person self-harm disclosure (for example "I want to kill myself"), which
   targets the speaker, not another person, and is never matched by these patterns.

A sixth reason, `internalError`, is not a content category. It is the fail-closed result used only
when evaluation itself throws unexpectedly.

## Legitimate sensitive topics intentionally allowed

Verified by the automated test corpus in `contentFilter.test.ts`, which is intentionally much
larger than the blocked corpus: sincere prayers involving suicidal thoughts and self-harm
recovery, abuse and protection from violence, addiction and substance recovery, cancer and serious
illness, grief and death, depression, anxiety, and mental health, family conflict, a teenager being
pressured into sexting (described, not solicited), and ordinary words that merely contain
character sequences resembling a prohibited fragment (for example "therapist", "class",
"assistant", "classroom"). The word "Niger" and words with normal double letters (for example
"illness") are also explicitly verified allowed, as a direct regression check against the false
positive described above.

## Prayer creation and editing integration

`mobile-app/src/components/PrayerForm.tsx` is the single shared form used by both the "Share a
prayer request" (create) screen (`app/(app)/submit.tsx`) and the owner "Edit request" screen
(`app/(app)/feed/edit.tsx`). Neither screen implements its own validation or filtering; both call
`onSubmit` only after `PrayerForm`'s own `handleSubmit` has already gated the draft, so both are
protected identically without either screen duplicating the check.

`handleSubmit` calls `evaluatePrayerSubmission(body)` after marking the form as submitted. If the
result is `blockedByValidation`, the function returns without further action, exactly as it did
before this feature existed. If the result is `blockedByFilter`, the function sets a `filterError`
state value to the message and returns; `onSubmit` (the only path into the Firebase or local-mock
prayer-request write) is never called. Only when the result is `ready` does the form proceed to
call `onSubmit`.

## Display-name creation and editing integration

`app/(auth)/create-profile.tsx` (account creation) and `app/(app)/settings.tsx` (profile editing)
each call `evaluateDisplayNameSubmission(name)` from their own submit handler, after their
existing multi-field validation (display name, email, and, in create-profile, password) has
already passed.

In `create-profile.tsx`, the gate check sits before the only call to `useAuth().createProfile`,
which is what invokes `firebaseAuthService.signUp` (creating the Firebase Authentication user) in
Firebase mode. If the gate result is not `ready`, `createProfile` is never called, so no Firebase
Authentication user, and no local profile in local/mock mode, is ever created for a blocked name.

In `settings.tsx`, the gate check sits before the only call to `useAuth().updateProfile`, which
is what invokes `firebaseAuthService.updateDisplayName` (or the local AsyncStorage write) in the
respective mode. If the gate result is not `ready`, `updateProfile` is never called, so the stored
profile is never updated for a blocked name.

## Validation ordering

In every integration point, the order is the same and is enforced by the gate functions
themselves: existing required-field, length, and format validation runs first, exactly as it did
before this feature. `filterProhibitedContent` only runs once that validation has already passed.
A too-short, too-long, or empty draft or name always surfaces the ordinary validation message,
never the content-filter message, and is never evaluated by the filter at all.

## Fail-closed behavior

Both `filterProhibitedContent` and both gate functions wrap their logic in a try/catch. Any
unexpected internal failure resolves to a blocked result carrying the shared
`CONTENT_FILTER_MESSAGE`, never to an allowed result. This is proven directly by automated tests
that pass a runtime type violation (for example `null` cast to `string`) through each function and
assert the result is never `allowed: true` or `{ status: 'ready' }`.

## User-facing copy

Every blocked result, in every category, in every integration point, shows the exact same string:

> This contains language that cannot be shared with the community. Please revise it and try again.

This is `CONTENT_FILTER_MESSAGE`, exported once from `contentFilter.ts` and reused everywhere. The
internal `reason` category is never shown to the user, never included in this message, and never
otherwise surfaced in the UI. The message is presented through each form's existing accessible
field-error presentation (`TextField`'s `errorText` prop, which pairs a visible error string with
an `accessibilityLiveRegion="polite"` announcement), not a new UI element.

## Privacy boundary

No rejected text, whether a prayer body or a display name, is ever logged, persisted, transmitted,
or sent to any third party. The filter is entirely on-device and synchronous: it makes no network
request, uses no third-party moderation service, and has no logging or analytics call anywhere in
its implementation. The only artifact of a block visible anywhere is the shared, generic
`CONTENT_FILTER_MESSAGE` shown locally in the form; the rejected text itself never leaves the
user's device and is never written to Firestore, Firebase Authentication, or on-device storage.

## Current test coverage and commands

All commands are run from `mobile-app/`.

| Command | File(s) | Test count |
|---|---|---|
| `npm run test:content-filter` | `src/utils/contentFilter.test.ts` | 49 |
| `npm run test:submission-gate` | `src/utils/prayerSubmissionGate.test.ts` | 10 |
| `npm run test:display-name-gate` | `src/utils/displayNameSubmissionGate.test.ts` | 9 |

That is 68 automated tests directly covering this feature, all currently passing. They cover:
determinism, non-mutation of the input string, the discriminated result shape (no stray fields),
fail-closed behavior on a runtime type violation, validation-precedence ordering, every blocked
category with capitalization, spacing, punctuation, substitution, and repeated-character evasion
variants, the Niger and double-letter regression cases, the narrowed sexting-solicitation rule,
and that the same gate function is used regardless of the anonymous/named choice (for the prayer
gate) or of whether the call site is account creation or Settings editing (for the display-name
gate, which has no separate "context" parameter that could make one path stricter than the other).

`npm run test:hidden-accounts` (18 tests) and `npm run typecheck` also pass and are unaffected by
this feature; they are run alongside this feature's own tests as a standard regression check, not
because this feature changed their behavior.

## Known limitations and intentional beta tradeoffs

Recorded directly in code comments in `contentFilter.ts`, repeated here for the documentation
record:

- This is a word/phrase pattern matcher, not a language model. It does not understand meaning,
  sarcasm, quotation, or context beyond the narrow patterns implemented.
- It does not attempt to detect every threat, every slur, every harassment phrase, or every
  possible spelling variation. The evasion handling covers common simple evasion (case, whitespace,
  in-word punctuation, a small substitution set, repeated characters), not all conceivable evasion.
- A hyphen or other punctuation used to replace a space entirely between two words of a multi-word
  phrase (for example joining "kill" and "you" with a hyphen instead of a space) is not
  reconstructed into a space and can evade a phrase match. Punctuation inserted inside a single
  word is handled, since it is removed rather than replaced with a space.
- The identity-slur list is intentionally short, covering only a handful of unambiguous, severe
  terms. It is not an exhaustive slur dictionary.
- For this controlled beta, an exact configured slur is blocked in every context, including a
  sincere user quoting or describing harassment they experienced using that exact term. That user
  will also be asked to revise their request. This is an intentional beta tradeoff: a deterministic
  pattern matcher cannot reliably distinguish quotation, condemnation, or being the target of a
  slur from targeted use of it, so the beta filter treats all three the same way rather than
  guessing.
- The sexting-solicitation rule is narrow by design: it blocks specific solicitation or promotion
  phrasing, not the bare word "sexting," so a prayer describing sexting happening to someone else
  remains allowed. This means some genuinely solicitation-flavored phrasing not on the specific
  narrow list will not be caught.
- *(2026-08-16 manual QA finding, expected, not a defect)*: the standalone phrase "I want sex" is
  allowed. This is consistent with the narrow, high-confidence scope of the sexualSolicitation
  category described above: the filter blocks solicitation and promotion phrasing, not every bare
  sexual reference, since legitimate prayer contexts can include sexual temptation, recovery,
  marriage, or abuse. Reporting and human moderation remain the safeguards for ambiguous content
  like this that the filter deliberately does not attempt to categorize.

## Why reporting, user hiding, and human moderation remain necessary

This filter is intentionally narrow and does not replace the app's existing reporting flow
(`docs/firebase-reports-implementation.md`), the "Hide requests from this account" user-blocking
control (`docs/firebase-hidden-accounts-implementation.md`), or manual, developer-only moderation
review. Ambiguous content, borderline harassment, evasion techniques not covered by the patterns
above, and any content in a category this filter does not attempt to detect at all all remain
allowed at submission time and depend entirely on those existing human-facing safeguards. This
filter narrows what reaches other users before a human ever looks at it; it does not replace the
need for a human to look.

## Reassessment required before public release

This implementation was scoped and reviewed for the controlled, invitation-only, adult-only beta
described in `docs/store/Age_Rating_Target_Audience_Worksheet.md`. Before any public release, the
owner should reassess: whether the narrow blocked-category list and evasion handling remain
proportionate at a larger scale and a more diverse user base; whether the slur-list quotation
tradeoff described above remains acceptable outside a small controlled group; whether the sexting
and other narrowly-scoped rules need broadening based on real beta reports; and whether Apple's or
Google's own review teams, once an actual build reaches review, treat this client-side safeguard
as sufficient on its own or expect it paired with the still-separate user-blocking and
Terms-of-Use-acceptance blocker items from the same worksheet section. This document does not
predict or guarantee the outcome of that future review.

## Files created or edited by this feature

Recomputed directly from `git status` and `git diff`, separating files this feature actually
created or edited across all of its parts (the pure filtering engine, the prayer-body integration,
the display-name integration, and this documentation) from pre-existing files that happened to
already be modified or untracked for unrelated reasons before this feature began.

**Created by this feature (8):**
1. `mobile-app/src/utils/contentFilter.ts`: the pure filtering engine (`filterProhibitedContent`,
   `ContentFilterResult`, `ContentFilterReason`, `CONTENT_FILTER_MESSAGE`).
2. `mobile-app/src/utils/contentFilter.test.ts`: 49 unit tests.
3. `mobile-app/src/utils/prayerSubmissionGate.ts`: the pure prayer-body submission gate
   (`evaluatePrayerSubmission`).
4. `mobile-app/src/utils/prayerSubmissionGate.test.ts`: 10 unit tests.
5. `mobile-app/src/utils/displayNameSubmissionGate.ts`: the pure display-name submission gate
   (`evaluateDisplayNameSubmission`).
6. `mobile-app/src/utils/displayNameSubmissionGate.test.ts`: 9 unit tests.
7. `docs/content-filter-implementation.md`: this document.
8. `docs/QA_content_filter_scenarios.md`: the manual QA checklist for this feature, executed
   2026-08-16 with all 21 scenarios passed and 0 defects.

**Existing files edited by this feature (7):**
1. `mobile-app/src/components/PrayerForm.tsx`: wired `evaluatePrayerSubmission` into
   `handleSubmit`, added the `filterError` state and its clear-on-edit handler, and combined it
   with the existing field-error display. The file's substantial pre-existing, in-progress
   Terms-acceptance and Cancel-button work was left untouched.
2. `mobile-app/app/(auth)/create-profile.tsx`: wired `evaluateDisplayNameSubmission` into
   `handleSubmit`, before the only call to `createProfile`. The file's pre-existing, in-progress
   Terms-acceptance and beta-eligibility work was left untouched.
3. `mobile-app/app/(app)/settings.tsx`: wired `evaluateDisplayNameSubmission` into
   `handleSaveProfile`, before the only call to `updateProfile`.
4. `mobile-app/package.json`: added the `test:content-filter`, `test:submission-gate`, and
   `test:display-name-gate` scripts.
5. `mobile-app/tsconfig.json`: added `allowImportingTsExtensions: true`. This was required because
   `prayerSubmissionGate.ts` and `displayNameSubmissionGate.ts` are the first non-test source
   files in this repository to import another local `.ts` module at runtime under `node --test`;
   Node's module resolution requires the explicit extension, and this compiler option is what lets
   `tsc --noEmit` accept it. `noEmit` was already set by the inherited Expo base config, so this
   flag has no effect on any build output.
6. `docs/reviews/Beta_Readiness_Assessment.md`: one dated annotation recording that pre-publication
   content filtering is now implemented but manual QA is pending; original historical text
   preserved, not rewritten.
7. `docs/store/Age_Rating_Target_Audience_Worksheet.md`: one narrow, dated correction appended to
   the Section 6 content-filtering inventory row, noting the subsequent implementation; the
   original approved answer and reasoning were preserved, not rewritten.

**Pre-existing, unrelated to this feature, and not attributed to it:** `app/(app)/feed/[id].tsx`,
`app/(app)/feed/index.tsx`, `app/(app)/feed/report.tsx`, `app/(app)/submit.tsx`,
`src/components/PrayerCard.tsx`, `src/components/PolicyLinks.tsx`, `src/context/AuthContext.tsx`,
`src/context/PrayerContext.tsx`, `src/models/types.ts`, `src/services/firebase/contracts.ts`,
`src/services/firebase/userService.ts`, `src/services/firebase/hiddenAccountErrors.ts`,
`src/services/firebase/hiddenAccountService.ts`, `src/services/hiddenAccounts.ts`,
`src/utils/hiddenAccountFilter.ts`, `src/utils/hiddenAccountFilter.test.ts`,
`src/utils/hiddenAccountStorage.ts`, `src/utils/hiddenAccountStorage.test.ts`,
`src/utils/hideAccountCopy.ts`, `mobile-app/firestore.rules`, `mobile-app/README.md`,
`mobile-app/app.json`, `mobile-app/eas.json`, `mobile-app/firebase-tests/tests/helpers.mjs`,
`mobile-app/firebase-tests/tests/users.test.mjs`,
`mobile-app/firebase-tests/tests/hiddenAccounts.test.mjs`,
`mobile-app/firebase-tests/package-lock.json`, several `docs/QA_*.md` files, `docs/beta-feedback-plan.md`,
`docs/privacy-safety-copy.md`, `docs/firebase-hidden-accounts-implementation.md`,
`docs/reviews/Pre_Developer_Account_Readiness_Plan.md`, and `docs/QA_hidden_accounts_scenarios.md`.
All of these were already modified or untracked by other in-progress work before this feature
began, and none of them were touched by it.

## No Firestore rules change required

This feature is entirely client-side. It reads and returns a plain value from a pure function; it
makes no Firestore read or write of its own, and it does not change what data any existing write
contains. `mobile-app/firestore.rules` was not modified by this feature and does not need to be
modified or republished for this feature to function. The existing rules already validate field
types and ownership for prayer requests and profiles exactly as they did before this feature
existed; this filter is an additional client-side gate in front of those same existing writes, not
a replacement for, or a change to, server-side enforcement.
