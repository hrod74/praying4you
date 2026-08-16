# Praying For You: Age Rating and Target Audience Worksheet (v0.1, Approved)

## 1. Title

Praying For You: Age Rating and Target Audience Worksheet (v0.1, Approved)

## 2. Status and Approval Boundary

**Status: APPROVED: AGE RATING AND TARGET AUDIENCE WORKSHEET v0.1.**

- This worksheet recorded recommendations and evidence for owner review. The owner has since reviewed
  it and approved it as v0.1 for controlled beta planning (Section 16).
- Approval of this worksheet does not authorize App Store Connect or Google Play Console
  configuration, account creation, app submission, publication, changes to
  `docs/privacy-safety-copy.md` or the live website policies, or any change to application code or
  configuration. Those remain separate, future actions.
- Nothing in this worksheet modifies the approved Store Listing Copy v0.1
  (`docs/store/Store_Listing_Copy_Draft.md`). That document is referenced here only as evidence.
- Six distinct concepts appear throughout this worksheet and must not be collapsed into one another:
  (1) the intended beta audience, (2) the Apple age-rating questionnaire's calculated result,
  (3) an optional Apple owner-selected higher rating override, (4) the Google Play target-audience
  declaration, (5) the Google IARC content rating, and (6) the future public-release audience
  decision. Sections 7 and 8 keep each concept in its own labeled subsection rather than treating
  them as one outcome.
- This worksheet does not predict a guaranteed Apple calculated rating or a guaranteed Google IARC
  rating. Both are produced only when the actual questionnaire is completed inside App Store Connect
  or Google Play Console. What follows are evidence-based answers to prepare for that questionnaire,
  not a substitute for completing it.
- Approving this worksheet approves its recommendations for controlled beta planning purposes. It
  does not resolve or waive the pre-external-beta implementation blockers in Section 10a. Those, and
  the UGC Compliance Blocker task in Section 10d that must close them, remain outstanding and must be
  completed before external beta testing begins.

## 3. Owner-Approved Beta Direction

Recorded exactly as provided by the owner:

> Praying For You's initial beta audience is limited to adults age 18 and older. This is a temporary
> risk-management decision for a controlled learning period. It is not a permanent product-positioning
> decision. Eligibility for younger users will be reconsidered before public release after reviewing
> beta behavior, moderation needs, privacy requirements, and user-safety controls.

Clarifications that apply to this decision:

- The 18+ decision applies to the controlled beta only. It is a temporary, risk-management posture
  for this specific testing period, not a statement about who the finished product is for.
- It does not permanently exclude younger Christians, or other younger users, from the product
  vision. The product vision itself is unchanged by this beta-scoped decision.
- Beta testers must be 18 or older. This is an eligibility requirement for participation in the
  controlled beta, not a store-enforced age gate (see Section 7 and Section 8 for how each platform's
  own tools do, and do not, enforce this).
- The public-release audience remains a future owner decision, to be made after the beta using the
  evidence described in Section 13.
- The store listing should not market the app as an "adults-only Christian app." The approved Store
  Listing Copy v0.1 (`docs/store/Store_Listing_Copy_Draft.md`) was reviewed for this worksheet and
  contains no age-restriction or "adults-only" language anywhere in the app name, subtitle,
  promotional text, keywords, or full description. No change to that document is needed on this
  point; see Section 12.
- Christianity and the use of King James Version Bible content are not, by themselves, the reasons
  for the adult beta audience. Nothing about the app's faith content, verse content, or religious
  positioning drives this decision.
- The actual reasons for the adult beta audience are: user-generated prayer-request content that can
  include sensitive personal topics (see Section 6); unresolved minor-specific privacy requirements
  (the live Privacy Policy and Terms of Use both state that a final minimum age and store age rating
  have not been established, and that parental-consent handling for a minor is not yet built; see
  Section 12); moderation needs that are not yet fully built out for a general audience (see
  Section 9); and the controlled, small-group learning purpose of this specific beta period.

## 4. Why the Beta Is Limited to Adults

This section restates Section 3's reasons with the supporting evidence cited alongside each one, so
the reasoning is auditable rather than asserted.

| Reason | Evidence |
|---|---|
| User-generated prayer-request content can include sensitive personal topics | `docs/product-requirements.md` §10 ("Prayer requests frequently contain sensitive personal information: health diagnoses, family conflict, grief, mental health struggles, financial hardship"); the nine prayer categories in `mobile-app/src/models/types.ts` (Health, Family, Finances, Relationships, Grief, Work, Guidance, Praise / Answered Prayer, Other) confirm these topics are structurally expected, not incidental |
| Minor-specific privacy requirements are unresolved | Live Privacy Policy, "Children and age eligibility": "The product is being designed for adults, but a final age threshold and store age rating have not been established... A parent or guardian should contact us if they believe a child has provided information." (verified live 2026-08-15; see Section 12a) |
| Moderation needs are not yet fully built for a general audience | `docs/reviews/Beta_Readiness_Assessment.md` §7 (Operations): moderation depends on one person manually reviewing a Firestore console, a single point of failure the team has already flagged; §6 lists an admin dashboard and user-blocking as items intentionally deferred past beta |
| Controlled, small-group learning purpose of this specific beta | `docs/beta-feedback-plan.md` and `docs/product-requirements.md` §17 (Phase 4.5, "Alpha Testing") describe a deliberately staged rollout: 3-4 known accounts, then a small trusted group, before any broader distribution |

Explicitly not reasons for the adult beta audience:

- Christian content or positioning. `docs/product-requirements.md` §4 (Target Users) describes people
  with prayer needs generally, "may or may not be churchgoers," with no age-based faith framing.
- King James Version Bible content. The verses in `mobile-app/src/data/mockVerses.ts` are short,
  non-graphic scripture text with no content that independently suggests an adult-only audience.

## 5. Evidence Reviewed

**Official platform sources** (all accessed 2026-08-15; full citations in Section 17):

- Apple: Age ratings values and definitions; Set an app age rating; App Review Guidelines
  (Section 1.2, User-Generated Content); Invite external testers (TestFlight).
- Google: Manage target audience and app content settings; Content rating requirements for apps,
  games, and the ads served on both (IARC); User Generated Content policy; Google Play Families
  Policies; App testing requirements for new personal developer accounts (testing tracks).

**Product and requirements documentation**

- `docs/product-requirements.md`
- `docs/privacy-safety-copy.md`
- `docs/design-direction.md`
- `docs/beta-feedback-plan.md`
- `docs/agents/legal-compliance-advisor.md`

**Implementation documentation**

- `docs/firebase-auth-implementation.md`
- `docs/firebase-prayer-requests-implementation.md`
- `docs/firebase-prayer-interactions-implementation.md`
- `docs/firebase-reports-implementation.md`
- `docs/firebase-account-deletion-implementation.md`
- `docs/firebase-user-profile-implementation.md`

**QA and readiness documentation**

- `docs/QA_alpha_readiness.md`
- `docs/QA_prayer_interaction_scenarios.md`
- `docs/QA_prayer_request_scenarios.md`
- `docs/QA_report_scenarios.md`
- `docs/QA_delete_scenarios.md`
- `docs/reviews/Beta_Readiness_Assessment.md`
- `docs/reviews/Pre_Developer_Account_Readiness_Plan.md`

**Repository code**

- `mobile-app/app.json` (bundle identifier, package name)
- `mobile-app/eas.json` (build profile configuration)
- `mobile-app/firestore.rules` (server-enforced content and ownership rules)
- `mobile-app/src/models/types.ts` (prayer category list)
- `mobile-app/src/data/mockVerses.ts` (verse content and sourcing note)
- `mobile-app/package.json` (dependency list, checked for ads, in-app purchase, location, and AI
  SDKs)
- `mobile-app/app/(auth)/create-profile.tsx` (checked for any age-collection or age-gate field: none
  found)
- `mobile-app/app/(app)/settings.tsx` (checked for in-app Privacy Policy, Terms of Use, or support
  links: none found)
- `mobile-app/src` and `mobile-app/app` (repository-wide search for location, web-browsing, ads,
  purchase, and AI-generation code: none found beyond the ad-placement architecture placeholder
  described in the product requirements)

**Approved store copy and live website**

- `docs/store/Store_Listing_Copy_Draft.md` (v0.1, approved; read only, not modified)
- `https://productsparkstudio.com/privacy/`, `https://productsparkstudio.com/terms/`,
  `https://productsparkstudio.com/support/`, and `https://productsparkstudio.com/`, verified live by
  direct browser navigation on 2026-08-15, all returning HTTP 200 (see Section 12a)

**Access date for this evidence review:** 2026-08-15.

## 6. Current Product-Content Profile

This is a factual inventory of what the app currently contains and does, verified against the
sources above. It is the shared basis for both the Apple and Google worksheets in Sections 7 and 8.

| Content or capability | Present today | Evidence |
|---|---|---|
| User accounts, email and password authentication | Yes | `docs/firebase-auth-implementation.md`: `createUserWithEmailAndPassword` / `signInWithEmailAndPassword`; no social login, no anonymous Firebase auth |
| Display name, chosen by the user | Yes | `docs/product-requirements.md` §8 (User Profile); confirmed in `mobile-app/app/(app)/settings.tsx` |
| Public prayer-request display (display name shown) | Yes | `docs/product-requirements.md` §5, §8 |
| Anonymous prayer-request display ("Anonymous" shown; account still privately linked) | Yes | `docs/privacy-safety-copy.md` §2; `docs/firebase-prayer-requests-implementation.md` |
| User-generated prayer-request text, 10 to 500 characters | Yes | `docs/product-requirements.md` §8; length bounds are enforced client-side in the submission form, not by `mobile-app/firestore.rules`, which validates field types and ownership but not string length |
| Nine prayer categories (Health, Family, Finances, Relationships, Grief, Work, Guidance, Praise / Answered Prayer, Other) | Yes | `mobile-app/src/models/types.ts` |
| Prayer interactions ("I prayed for this") with an aggregate, server-side count | Yes | `docs/firebase-prayer-interactions-implementation.md`; individual interaction records are owner-private, never a public "who prayed" list |
| Content reporting (spam, inappropriate, harmful, other reasons) | Yes | `docs/firebase-reports-implementation.md`; manual Firebase Console review only |
| Automated or keyword-based content filtering before a post goes live | No | `docs/product-requirements.md` §10: "Automated profanity filtering is post-MVP... the primary mechanism is user reporting and manual review" *(Update 2026-08-16)*: implemented since this worksheet's approval, for prayer creation, prayer editing, account-creation display names, and Settings display-name edits; see `docs/content-filter-implementation.md`. Automated tests pass. *(Further update 2026-08-16)*: physical-device manual QA has since passed, 21 of 21 scenarios, 0 defects, in both Firebase mode and local/mock mode; see `docs/QA_content_filter_scenarios.md`. This closes the evidence gap for this specific safeguard; whether App Store or Google Play review treats it as sufficient remains for their own review process to determine, not this worksheet. This annotation does not alter the worksheet's approved answers or reasoning as of 2026-08-15. |
| Ability for one user to block another user | No | `docs/reviews/Beta_Readiness_Assessment.md` §5: "no user-blocking feature confirmed to exist"; `docs/firebase-reports-implementation.md`: "no admin UI, notifications, AI moderation, email, or auto-removal/blocking" |
| Editing and removing one's own request | Yes | `docs/product-requirements.md` §19 (Owner-Only Edit, Owner-Only Remove); soft-remove, not hard delete |
| Account deletion | Yes | `docs/firebase-account-deletion-implementation.md`: soft-removes active requests, deletes the profile document, deletes the Firebase Auth user |
| Manual, developer-only moderation workflow | Yes, with a documented single-point-of-failure risk | `docs/reviews/Beta_Readiness_Assessment.md` §7 |
| Comments, direct messaging, groups, or other user-to-user social interaction beyond the aggregate prayer count | No | `docs/product-requirements.md` §6 (Out of Scope for MVP): groups, comments, and direct messaging are all explicitly excluded |
| Location collection | No | No location, geolocation, or `expo-location` code found anywhere in `mobile-app/src` or `mobile-app/app`; not listed in `mobile-app/package.json` dependencies |
| Advertising | Architecture only, not live | `docs/product-requirements.md` §13: ad placement slots exist in the architecture but are "not wired to a real ad network"; no AdMob or ad SDK present in `mobile-app/package.json` |
| In-app purchases | No | No purchase, IAP, or StoreKit code or dependency found |
| AI-generated content | No | The Verse of the Day "reflection" text is static, developer-written seed data (`mobile-app/src/data/mockVerses.ts`), not generated at runtime; `docs/privacy-safety-copy.md` §10 describes AI assistance only as a documented future feature, not built; no AI/LLM SDK dependency found |
| Unrestricted or embedded web access | No | No WebView, in-app browser, or general-purpose `Linking.openURL` navigation found in `mobile-app/src` or `mobile-app/app` |
| King James Version Bible verse content | Yes | `mobile-app/src/data/mockVerses.ts`: short, curated, non-graphic scripture text, `translation: 'KJV'` |
| Health, medical, crisis, self-harm, violence, sexual, or substance-use content, as authored content from the app itself | No | The app does not author, prompt for, or feature such content; the live Terms of Use "Acceptable use" section explicitly prohibits content that promotes self-harm, is sexually exploitative, or is violent |
| The same categories of content, as something a user could freely type into a prayer request | Possible, not preventable by any current filter | Free-text prayer-request bodies are unmoderated at submission time (see the "content filtering" row above); a user could reference a health crisis, grief, a family member's substance-use struggle, or similar topics as part of a genuine prayer request; this is the central reason UGC-specific safeguards matter (Section 9), independent of the age-rating questionnaire |
| Age-verification or age-gate mechanism inside the app | No | No age, birthdate, or date-of-birth field found in `mobile-app/app/(auth)/create-profile.tsx` or elsewhere; the 18+ beta restriction is currently enforced only through invitation practice, not through in-app mechanism (see Section 11) |

## 7. Apple Worksheet

### 7a. Relevant Questionnaire Topics

Apple's age-rating questionnaire (accessed via "Set an app age rating," App Store Connect Help,
2026-08-15) is organized into In-App Controls, Capabilities, Mature Themes, Medical or Wellness,
Sexuality or Nudity, Violence, and Chance-Based Activities. Based on the content profile in Section 6,
the topics genuinely relevant to Praying For You are:

- Capabilities: User-Generated Content, Social Media, Messaging and Chat, Advertising, Unrestricted
  Web Access.
- Mature Themes: Profanity or Crude Humor; Alcohol, Tobacco, or Drug Use or References.
- Medical or Wellness: Medical or Treatment Information; Health or Wellness Topics.
- In-App Controls: Age Assurance (relevant to answer accurately as "not present," not to imply one
  is needed).

The remaining questionnaire categories (Sexuality or Nudity beyond "none," Violence beyond "none,"
Chance-Based Activities) have no supporting evidence of relevant content anywhere in the app and
should be answered as absent, consistent with the Terms of Use's explicit prohibition on that content.

### 7b. Owner-Decided Answers

The answers below were open recommendations in the first draft of this worksheet. The owner has since
reviewed them and recorded decisions for each, superseding the earlier "recommend" framing. These are
the answers to enter into the actual App Store Connect questionnaire.

| Topic | Owner-decided answer | Reasoning |
|---|---|---|
| User-Generated Content | Yes | The prayer feed is built entirely from user-authored text (Section 6). |
| Social Media | Yes | The shared public feed, user-authored content, discovery through sorting and filtering (newest, or most prayed for), and the visible aggregate prayer-interaction count together make "Yes" the safer and more accurate answer, even though the app has no likes, comments, reposts, or algorithmic ranking beyond simple sort order. This supersedes the first draft's "No, flagged as a judgment call" recommendation; see Section 7d for the resulting effect on the calculated rating. |
| Messaging and Chat | No | No direct messaging, comments, or user-to-user chat exists (Section 6). |
| Advertising | No, today | No ad SDK is integrated and no ads are live (Section 6). This answer must be revisited the moment ads are wired to a real network. |
| Unrestricted Web Access | No | No embedded browser or general web navigation exists (Section 6). |
| Profanity or Crude Humor | Infrequent | There is no automated filter (Section 6, "content filtering" row), and free-text UGC cannot be guaranteed profanity-free before manual review catches it. Answering "None" would overstate what the current safeguards actually prevent. *(Update 2026-08-16)*: a narrow, high-confidence content filter is now implemented and has passed manual QA (see the Section 6 annotation above), but it deliberately does not block general profanity or crude humor, only a small set of high-confidence categories (sexual solicitation, child exploitation language, identity slurs, direct threats, targeted harassment). Free-text UGC still cannot be guaranteed profanity-free before manual review catches it, so the "Infrequent" answer and this reasoning are unchanged by the new filter. |
| Alcohol, Tobacco, or Drug Use or References | Infrequent | A prayer request could reference a family member's substance-use struggle as legitimate, non-promotional content. The Terms of Use prohibits promoting substance use, not mentioning it. |
| Medical or Treatment Information | Infrequent | A user asking for prayer over a diagnosis is not strictly providing treatment guidance, but the owner has decided to answer Infrequent rather than None, for the same reason as Profanity and Alcohol/Tobacco/Drug References above: free-text UGC cannot be guaranteed free of this topic before manual review catches it. This resolves the first draft's open "None or Infrequent, pending beta content review" item. |
| Health or Wellness Topics | Infrequent | The Health prayer category (`mobile-app/src/models/types.ts`) makes this a structurally expected topic, even though the app does not itself provide wellness guidance. |
| Age Assurance (In-App Control) | Not present | Section 6 confirms no age-verification mechanism exists in the app today. This should be answered accurately as absent; it is not, by itself, a requirement Apple imposes on every app. |

### 7c. User-Generated-Content Disclosures

Apple's questionnaire treats "User-Generated Content" as a capability declaration, separate from the
Section 1.2 UGC safeguard requirements reviewed in Section 9. Declaring "Yes" to User-Generated
Content in the questionnaire does not by itself satisfy Section 1.2; the two are evaluated separately
by App Review. This worksheet treats them separately as well, and Section 9 should be read alongside
this subsection, not as a substitute for it.

### 7d. Potential Calculated Rating

Based on the owner-decided answers in 7b, and Apple's published rating-value definitions ("Age
ratings values and definitions," accessed 2026-08-15):

- Social Media = Yes places the app at Apple's **13+** tier at minimum, since Social Media is listed
  among the 13+-level capabilities, not the 4+-level ones.
- The four Infrequent-level descriptors decided in 7b (Profanity or Crude Humor; Alcohol, Tobacco, or
  Drug Use or References; Medical or Treatment Information; Health or Wellness Topics) each fall
  within Apple's published 9+ or 13+ definitions and do not, on their own or together, push the
  calculated rating past 13+, since none of the owner-decided answers reaches a "Frequent" level and
  Unrestricted Web Access remains "No."
- Combining these, the most defensible planning assumption is a calculated rating of **13+**.

This worksheet still does not claim Apple's own App Store Connect calculation is guaranteed to match
this expectation. The literal result is produced only when the questionnaire is completed there, and
Apple's internal logic may weigh combinations of answers in ways not fully documented publicly. 13+
is presented here as the well-evidenced planning expectation based on the owner-decided answers, not
a guarantee of Apple's actual output.

### 7e. Whether an Owner-Selected Higher Rating May Be Appropriate

Apple allows an "Override to Higher Age Rating" independent of the calculated result ("Set an app
age rating," accessed 2026-08-15), and states that if the app has a EULA with a minimum age
requirement that exceeds Apple's calculated rating, the developer "must override to a rating that
adheres to the requirements."

- **Owner decision: apply an 18+ override during the controlled beta.** Even though the expected
  calculated rating from 7d is 13+, the owner has decided to override the app's age-rating metadata
  to 18+ for the duration of the controlled beta.
- **Why an override, given TestFlight does not check tester age (see 7f).** The override does not
  create a technical enforcement mechanism. TestFlight distribution does not check the App Store's
  official age rating against testers in the first place, so the override changes nothing about who
  can actually accept a beta invitation. Its purpose is to align the app's own metadata with the
  owner-approved 18+ beta audience (Section 3), so the app's own records, and anything Apple's review
  team sees, are consistent with the owner's actual beta decision rather than understating it at 13+.
- **This is a metadata-alignment decision, not a technical gate.** The practical enforcement of the
  18+ requirement for beta testers remains the invitation process and eligibility language in
  Section 11, exactly as described in 7f.
- **Reassess before public release.** This override is scoped to the controlled beta. Section 13's
  public-release reassessment criteria apply to this decision as much as to the underlying audience
  question: before public release, the owner should revisit whether an 18+ override remains
  appropriate, reverts to the calculated rating, or is replaced by a different override, based on the
  public-release audience decision made at that time.

### 7f. TestFlight Implications

Based on "Invite external testers" (App Store Connect Help, accessed 2026-08-15):

- External testers are invited by email or by a shareable public link, with an app-wide cap of
  10,000 external testers.
- When inviting testers using a public link, Apple's own tester-criteria filters are limited to
  device and OS version. There is no Apple-provided age-based filter or age check for TestFlight
  testers.
- Builds submitted for external testing go through TestFlight App Review (a review of the build and
  its metadata), which is a different process from full App Store Review, though it draws on the same
  App Review Guidelines.
- Because Apple's own tooling does not check tester age, the 18+ requirement for this beta must be
  enforced procedurally: invitation-only recruitment restricted to known adults, plus the eligibility
  language in Section 11 stated at the point of invitation. This is a genuine, currently-unclosed gap
  between the owner's decision and any technical enforcement of it; it is not unique to this app, and
  it is consistent with how TestFlight betas are generally run, but the owner should be aware that
  nothing in Apple's tooling will reject an underage tester who was invited or who obtains a public
  link.
- The owner's decision in 7e to apply an 18+ override during the beta does not change this. The
  override affects the app's own age-rating metadata, not what TestFlight itself checks when a tester
  accepts an invitation.

## 8. Google Play Worksheet

### 8a. Target Audience Recommendation

Based on "Manage target audience and app content settings" (Play Console Help, accessed 2026-08-15):

- **Owner-decided selection for the beta: Ages 18 and over, and no other age group.**
- Google's own guidance warns against selecting additional age groups "just because you want your
  app to be available to users of all ages," and states that selecting only "Ages 18 and over" "may
  allow you to specify additional restrictions to your app availability." This aligns with, and gives
  a concrete mechanism for, the owner's 18+ beta decision.
- Selecting only "Ages 18 and over" keeps Praying For You outside Google Play's Families Policy
  Requirements for this beta period, since those requirements are triggered only when children are
  included in the declared target audience ("Manage target audience and app content settings" and
  "Google Play Families Policies," both accessed 2026-08-15).
- This is a target-audience declaration, not a content rating; Section 8c covers the separate IARC
  questionnaire.

### 8b. IARC Questionnaire Topics

Based on "Content rating requirements for apps, games, and the ads served on both" (Play Console
Help, accessed 2026-08-15), content ratings are assigned by independent rating authorities (the
International Age Rating Coalition, IARC, and its regional bodies) from questionnaire answers
entered in Google Play Console, not by Google directly and not by this worksheet. The topics
genuinely relevant to Praying For You, based on Section 6, are:

- User interaction and user-generated content (the shared prayer feed).
- Personal information sharing (display name, and account email handled per the Privacy Policy).
- References to violence, sexual content, profanity, and controlled substances (all only as possible
  incidental content within free-text prayer requests, not as authored or promoted app content).
- Digital purchases (not applicable today; no IAP exists).
- Location sharing (not applicable; no location collection exists).

### 8c. Owner-Decided Answers

The owner has decided that the IARC-related answers must disclose user-generated content, limited
user interaction, personal-information collection, and possible incidental sensitive content, rather
than minimize any of them.

| Topic | Owner-decided answer | Reasoning |
|---|---|---|
| Does the app feature user-generated content? | Yes | Prayer requests are entirely user-authored (Section 6). |
| Does the app allow users to interact with each other? | Yes, in a limited, aggregate-only way | The "I prayed for this" interaction and the shared feed constitute interaction; there is no messaging, no comments, and no public "who prayed" list (Section 6). |
| Does the app share the user's location? | No | Confirmed absent (Section 6). |
| Does the app collect or share personal information? | Yes, for account operation | Email and display name are collected for authentication and display; email is never shown publicly (`docs/privacy-safety-copy.md` §1; live Privacy Policy). |
| References to violence, sexual content, or profanity | Disclose as possible incidental content in unmoderated user text, not "none" | Same reasoning as the Apple answers in 7b: no automated filter exists, so "none" would overstate current safeguards. *(Update 2026-08-16)*: as noted in the Section 7b annotation, a narrow content filter is now implemented and has passed manual QA, but it does not broadly block violence, sexual content, or profanity references; free-text UGC still cannot be guaranteed free of these before manual review catches it, so this disclosure answer is unchanged. |
| References to alcohol, tobacco, or drug use | Disclose as possible incidental content in unmoderated user text, not "none" | Same reasoning as above; a prayer request could reference a loved one's substance-use struggle. |
| Digital purchases | No | Confirmed absent (Section 6). |

Taken together, the required disclosures for this app are: user-generated content (yes), limited
user interaction (yes, aggregate-only), personal-information collection (yes, email and display
name), and possible incidental sensitive content within unmoderated free-text prayer requests
(violence, sexual content, profanity, and substance-use references), consistent with the owner's
decision to disclose these topics rather than minimize them.

### 8d. User-Generated-Content Disclosures

Google's content-rating questionnaire and its separate User Generated Content policy (Section 9)
are, like Apple's, evaluated separately. Answering the IARC questionnaire accurately does not by
itself satisfy the User Generated Content policy's safeguard requirements; both must be addressed.

### 8e. Testing-Track Implications

Based on "App testing requirements for new personal developer accounts" (Play Console Help, accessed
2026-08-15), which by its own title applies specifically to **personal** developer accounts created
after November 13, 2023:

- That page states a closed test with a minimum of 12 testers, opted in continuously for at least
  14 days, is required before applying for production access on Google Play, for accounts in that
  personal-account category. Internal testing (up to 100 testers) can happen first and is optional
  but recommended.
- **Correction (owner-provided).** Product Spark Studio plans to create an **organization** Google
  Play developer account, not a personal account. This worksheet's research covered only the
  personal-account page above; it did not research, and does not claim to know, Google's testing-track
  requirements for organization accounts. The 12-tester, 14-day figure must not be treated as an
  expected Product Spark Studio requirement.
- This worksheet retains the 12-tester, 14-day figure only as reference material, from the specific
  personal-account page actually reviewed (Section 17), not as a stated requirement for Product Spark
  Studio's account type.
- **Owner decision: verify against the actual account when created.** The actual testing-track
  requirements that apply will be verified directly in Google Play Console once the Product Spark
  Studio organization account is created, rather than assumed from this worksheet's research, which
  covered only the personal-account page above. This resolves what was an open question in the
  previous revision of this worksheet (Section 14).
- Google Play's target audience and content declaration (Section 8a) applies to the app listing
  generally, regardless of account type; the "Ages 18 and over" declaration is not a testing-track-
  specific setting, but it must be in place, along with a privacy policy, before the Target Audience
  and Content section can be completed ("Manage target audience and app content settings," accessed
  2026-08-15).
- Google reviews target-audience declarations for accuracy separately from the content rating.
  Misrepresenting the audience (for example, declaring 18+ while store assets or marketing suggest a
  younger audience) is treated as a policy issue in its own right, independent of the age rating
  itself. Section 12b confirms the approved store copy contains no such mismatch.

## 9. User-Generated-Content Compliance Review

This is a serious, separate review, not a restatement of Sections 7 and 8. An 18+ target audience is
not treated as a substitute for these safeguards; both platforms require them independent of the
declared or calculated age rating.

### 9a. Apple App Review Guidelines, Section 1.2 (User-Generated Content)

Quoted from the official guidelines (accessed 2026-08-15): "To prevent abuse, apps with
user-generated content or social networking services must include: A method for filtering
objectionable material from being posted to the app; A mechanism to report offensive content and
timely responses to concerns; The ability to block abusive users from the service; Published contact
information so users can easily reach you."

| Required safeguard | Current status | Verdict |
|---|---|---|
| A method for filtering objectionable material from being posted | Not present. Automated filtering is explicitly deferred (`docs/product-requirements.md` §10); only manual, after-the-fact review exists. *(Update 2026-08-16)*: superseded. A narrow, on-device, pre-publication content filter is now implemented for prayer creation, prayer editing, account-creation display names, and Settings display-name edits, and has passed physical-device manual QA (21 of 21 scenarios, 0 defects); see `docs/content-filter-implementation.md` and `docs/QA_content_filter_scenarios.md`. | **Was a potential beta-review blocker; implemented and QA-passed as of 2026-08-16.** Whether Apple's or Google's own review teams treat this narrow, client-side method as sufficient on its own is still theirs to determine at actual review time, not this worksheet's to predict. |
| A mechanism to report offensive content, with timely responses | Reporting exists and is well-built (`docs/firebase-reports-implementation.md`). The "timely responses" half is now addressed by an owner-decided internal moderation procedure (Section 9d): daily report-queue review during active beta days, safety-first triage, a written action record, and a written escalation procedure for credible immediate-danger content. | Met, via the internal procedure in Section 9d. This is an internal operating procedure, not a published service-level agreement. |
| The ability to block abusive users from the service | Not present. Confirmed absent in both `docs/reviews/Beta_Readiness_Assessment.md` §5 and `docs/firebase-reports-implementation.md`. | **Potential beta-review blocker.** |
| Published contact information so users can easily reach you | Present. The live Support page (`https://productsparkstudio.com/support/`, verified 2026-08-15) publishes `admin@productsparkstudio.com` as a monitored contact, and this address is also the approved Support URL field in the Store Listing Copy. | Met at the store-metadata and public-web level; not yet linked from inside the app itself (see Section 12c). |

*(Update 2026-08-16, user hiding and in-app links)*: the original blocking row is superseded.
"Hide requests from this account" is implemented as the account-level control, its Firestore rules
are published, and physical-device QA passed with zero defects; see
`docs/firebase-hidden-accounts-implementation.md` and `docs/QA_hidden_accounts_scenarios.md`.
Privacy Policy, Terms, and Support links are also now present in account creation and Settings, with
the Terms linked from the posting catch-up flow through `mobile-app/src/components/PolicyLinks.tsx`.

### 9b. Google Play User Generated Content Policy

Quoted from the official policy (accessed 2026-08-15): apps with UGC must "require users to accept
your app's terms of use and/or user policy before users can create or upload UGC," "define
objectionable content and behaviors... in the app's terms of use or user policies," "conduct UGC
moderation... including providing an in-app system for reporting and blocking objectionable UGC and
users," and apps that "provide access to publicly accessible UGC, such as social networking apps...
must implement in-app functionality to report users and content, and to block users."

| Required safeguard | Current status | Verdict |
|---|---|---|
| Require Terms of Use / user-policy acceptance before creating or uploading UGC | Not present. No acceptance step, checkbox, or gate exists anywhere in the sign-up or posting flow (`mobile-app/app/(auth)/create-profile.tsx` and the prayer-request submission flow were both checked). | **Potential beta-review blocker**, specifically flagged as a "Do" in Google's own policy guidance. |
| Define objectionable content and behaviors in the Terms of Use | Present. The live Terms of Use "Acceptable use" section (verified 2026-08-15) explicitly prohibits harassment, hateful or violent content, sexual exploitation, impersonation, exposing others' private information, and promoting self-harm. | Met. |
| In-app reporting for objectionable content and users | Present for content (`docs/firebase-reports-implementation.md`). There is no separate mechanism to report a user independent of reporting a specific request. | Mostly met; reporting is request-scoped, not user-scoped. |
| In-app blocking, required specifically because the feed is publicly accessible UGC (a "social networking"-style app under Google's own example) | Not present. | **Potential beta-review blocker.** |
| Safeguards preventing monetization from encouraging objectionable behavior | Not currently applicable; no monetization is live (Section 6). | Not applicable yet; must be revisited before any ad or purchase feature ships. |

*(Update 2026-08-16, Terms acceptance and user hiding)*: both original "Not present" rows above
are superseded. Versioned Terms acceptance now gates account creation and prayer submission, including
legacy-account catch-up, and owner-confirmed physical-device QA passed with zero defects; see
`docs/terms-acceptance-implementation.md` and `docs/QA_terms_acceptance_scenarios.md`. "Hide requests
from this account" supplies the in-app account-level blocking control and has its own published rules
and passed QA record. Firestore does not independently enforce Terms acceptance on a direct write
from a modified client; that is optional future hardening, not a claimed current safeguard.

### 9c. Summary Judgment

Two safeguards are missing on both platforms, not just one: automated or pre-publication content
filtering (Apple only requires "a method," which manual review before wider distribution may
partially satisfy for a small, invitation-only beta, but this is a judgment call, not a guarantee),
and, more clearly, user-blocking (both platforms name this explicitly and neither treats reporting
alone as a substitute for it). Google also names an explicit Terms of Use acceptance gate that does
not currently exist in the app. These are functional, code-level gaps. This worksheet does not
propose or make the corresponding code change; see Section 10 and the scope restrictions in the task
that produced this worksheet. These three items (content filtering, user-blocking, and Terms-of-Use
acceptance) are recorded as pre-external-beta implementation blockers in Section 10a, per owner
decision, with a planning disposition in Section 10d for how they are expected to be closed.

*(Update 2026-08-16)*: the content-filtering gap named in this paragraph's first sentence is
closed as a code-level and QA-level gap. A narrow, on-device pre-publication filter is implemented
and has passed physical-device manual QA with 0 defects; see `docs/content-filter-implementation.md`
and `docs/QA_content_filter_scenarios.md`. This annotation does not speak to the user-blocking or
Terms-of-Use items in this paragraph, and does not alter the worksheet's original approved
reasoning above; it narrowly updates the content-filtering status only.

*(Further update 2026-08-16)*: the two items excluded by the preceding annotation are now also
implemented and QA-passed. See `docs/QA_hidden_accounts_scenarios.md` for user hiding and
`docs/QA_terms_acceptance_scenarios.md` for versioned Terms acceptance. All three Section 10a
functional gaps are closed. The separate live 18+ website-language commitment in Sections 10d and
12c remains open.

### 9d. Recommended Internal Moderation Procedure (Not a Public SLA)

This is an internal operating recommendation, owner-decided, not a published service-level agreement,
and it is not tester-facing. It addresses the "timely responses to concerns" half of Apple's Section
1.2 requirement (9a) and resolves what was an open question in the first draft of this worksheet.

- Review the report queue at least once each active beta day.
- Prioritize safety-related reports over routine ones (spam, low-severity "inappropriate" flags) when
  triaging the queue.
- Record the action taken on each report (dismissed, content soft-removed, account-level follow-up,
  escalated), so there is a written history available for the moderation-workload review described in
  Section 13.
- Use a written escalation procedure for content that appears to describe credible, immediate danger
  to a person, distinct from routine moderation. This worksheet does not draft that escalation
  procedure; it records that one is recommended to exist, in writing, before external beta testing
  begins.

This procedure is owner-facing and operational. It is not intended to be published to testers or
included in the beta invitation language in Section 11.

## 10. Gaps That Could Block Beta Review

The owner has reviewed the gaps identified in this worksheet and sorted them into dispositions:
pre-external-beta implementation blockers (10a), smaller pre-beta changes (10b), and other tracked
items (10c). A planning disposition for closing the blockers is recorded in 10d. None of these are
fixed by this worksheet itself; each is a candidate for separate, deliberate follow-up work.

### 10a. Pre-External-Beta Implementation Blockers

Owner-decided: these three items must be resolved before TestFlight external testing or Google Play
closed testing begins.

1. **User blocking.** Named explicitly by both Apple ("the ability to block abusive users from the
   service") and Google ("must implement in-app functionality to... block users" for publicly
   accessible UGC apps). This is the clearest, most direct gap against both platforms' published
   requirements.
   *(Update 2026-08-16)*: implemented as "Hide requests from this account," rules published, and
   physical-device QA passed with zero defects. This item is closed for the controlled beta.
2. **Terms of Use / user-policy acceptance before account creation or posting.** Named explicitly by
   Google as a required "Do." The Terms of Use itself now exists and is accurate (Section 12a), but
   nothing in the app requires a user to see or accept it before creating an account or posting.
   *(Update 2026-08-16)*: superseded. Versioned acceptance gates both account creation and prayer
   submission, legacy-account catch-up is implemented, and owner-confirmed physical-device QA passed
   with zero defects. This item is closed for the controlled beta.
3. **A method for filtering objectionable material before publication.** Named by Apple as "a method
   for filtering objectionable material from being posted." Manual, after-the-fact review exists,
   which may be viewed as a partial or proportionate answer for a small invitation-only beta, but it
   is not the same safeguard Apple's guideline describes, and this worksheet does not assume App
   Review will treat it as equivalent. *(Update 2026-08-16)*: implemented and QA-passed. A narrow,
   on-device, pre-publication content filter now runs before a prayer request or display name is
   published, has automated test coverage, and has passed physical-device manual QA (21 of 21
   scenarios, 0 defects) in both Firebase and local/mock mode; see
   `docs/content-filter-implementation.md` and `docs/QA_content_filter_scenarios.md`. This item is
   no longer only "manual, after-the-fact review"; whether it is sufficient for App Review remains
   for Apple's and Google's own review processes to determine, not this worksheet.

### 10b. Smaller Pre-Beta Changes

Owner-decided: tracked as smaller pre-beta changes, not blockers.

1. **In-app Privacy Policy, Terms, and Support links.** The underlying pages are now live and
   accurate (Section 12a), which resolves the "does a live page exist" question, but a user inside
   the app currently has no way to reach any of them without already knowing the URLs. This is
   lower-severity than the items in 10a because the store-listing-level Privacy Policy and Support
   URL fields, which is what both platforms' base submission requirements actually check, are already
   populated with live URLs in the approved Store Listing Copy v0.1.
2. **Visible 18+ beta eligibility language during onboarding or account creation.** The draft
   language in Section 11 exists only in this worksheet today. Placing an eligibility statement
   somewhere a tester actually sees it, before or during onboarding or account creation, is tracked
   here as a smaller pre-beta change; see Section 12c.

### 10c. Other Tracked Items

- **Reporting is request-scoped only, not user-scoped.** A user can report a specific prayer request
  but cannot report a user account directly, independent of a specific post. This is a narrower gap
  than the missing blocking capability in 10a and may be addressed by the same future work.
- **Response time for reviewing reports** is no longer an open gap. Section 9d records an
  owner-decided internal moderation procedure (daily queue review, safety-first triage, a written
  action record, and a written escalation procedure for credible immediate-danger content) that
  addresses Apple's "timely responses to concerns" language operationally, without a published SLA.

### 10d. Planning Disposition

A separate, dedicated task, referred to here as the UGC Compliance Blocker task, must be completed
before TestFlight external testing or Google Play closed testing begins. That task should implement
the three items in Section 10a (user blocking; Terms-of-Use acceptance before account creation or
posting; and a method for filtering objectionable material before publication) as actual application
changes, and should also add beta-specific 18+ eligibility language to the live Privacy Policy and
Terms of Use (Section 12c). This worksheet does not implement that task.

**Owner decision: scheduling and ownership.** The UGC Compliance Blocker is scheduled immediately
after Blocker 5. Product Spark Studio owns completion, supported by the AI implementation and review
team. This resolves what was an open question in the previous revision of this worksheet
(Section 14).

*(Update 2026-08-16)*: all three Section 10a application changes are implemented and QA-passed.
The app also now contains the smaller in-app policy-link and visible 18+ onboarding changes from
Sections 10b and 12c. The blocker remains open only for the approved commitment to add beta-specific
18+ language to the live Privacy Policy and Terms pages before external beta testing.

Explicitly not treated as a blocker in this worksheet: the absence of an in-app age-verification or
age-gate mechanism (Section 6). Neither platform's base UGC or app-review requirements demand an
age gate for an app that declares a standard adult or general audience; this becomes load-bearing
only if the declared or actual audience includes minors, which is not the case for this beta
(Section 3).

## 11. Beta Tester Eligibility and Invitation Language

The owner has approved the language below as this worksheet's recommended draft. It has not been
published and has not been placed in any invitation, email, or other public-facing material; doing
so remains a separate, future action outside this worksheet's scope.

> Praying For You is currently in a private, invitation-only beta limited to adults age 18 and older.
> Participation is by invitation only and is not open to the public.
>
> Because prayer requests are shared with other testers, you may see personal or sensitive content
> that other participants choose to share. Please treat what you read with the same care you would
> want for your own request.
>
> Praying For You is not an emergency, crisis, medical, or mental-health service. If you or someone
> else may be in immediate danger, please contact local emergency services or another appropriate
> resource right away, not this app.
>
> If you see content that feels inappropriate or concerning, please use the in-app reporting option
> so it can be reviewed.
>
> Participating in this beta does not guarantee continued access, a future invitation, or that the
> app will become publicly available.

This language satisfies the six elements requested: 18+ eligibility, invitation-only framing, a
warning about encountering sensitive content, the not-a-crisis-service disclaimer, a pointer to the
reporting process, and a no-guarantee-of-future-access statement. The owner has approved it as the
recommended draft within this worksheet. It still has not been placed in any tester-facing surface
(email template, TestFlight "What to Test" field, Play Console closed-test description, or in-app
text); doing so is a separate, future action.

## 12. Privacy Policy, Terms, Support, and In-App Disclosure Impacts

### 12a. Verified Live-Page Content

Verified by direct browser navigation on 2026-08-15; all four URLs returned HTTP 200 (see Section 5
for the source list).

| Page | Relevant content found |
|---|---|
| `https://productsparkstudio.com/privacy/` | "Children and age eligibility": "The product is being designed for adults, but a final age threshold and store age rating have not been established... A parent or guardian should contact us if they believe a child has provided information." |
| `https://productsparkstudio.com/terms/` | "Eligibility": "Praying For You is being designed for adults, but a final minimum age and store age rating have not been established. If you cannot lawfully agree to these terms, do not create an account or use the app." Also includes an "Acceptable use" section that defines prohibited content, satisfying part of Section 9b. |
| `https://productsparkstudio.com/support/` | Publishes `admin@productsparkstudio.com` as a monitored contact address, satisfying the Apple "published contact information" requirement in Section 9a. |
| `https://productsparkstudio.com/` | Homepage; no age-related claims. |

### 12b. Approved Store Listing Copy

The approved Store Listing Copy v0.1 (`docs/store/Store_Listing_Copy_Draft.md`) was read in full for
this worksheet and was not modified. It contains no age-restriction language, no "adults-only"
framing, and no age-based marketing anywhere in the app name, subtitle, promotional text, keywords,
or full description. This is consistent with the owner's instruction that the store listing should
not market the app as an "adults-only Christian app," and no change to that document is recommended
on this point.

### 12c. Impacts and Recommendations (Not Made in This Task)

- **Privacy Policy and Terms of Use eligibility language is now looser than the owner's beta
  decision.** Both live pages say a "final minimum age... has not been established," which was
  accurate before this worksheet's owner decision and remains not false, but no longer reflects the
  more specific 18+ beta decision recorded in Section 3. **Resolved by owner decision:**
  beta-specific 18+ eligibility language (for example, "During the current private beta,
  participation is limited to testers age 18 and older") will be added to the live Privacy Policy and
  Terms of Use during the UGC Compliance Blocker (Section 10d), before external beta testing begins.
  This worksheet does not make that edit; it remains a website-file change outside this task's scope,
  now scheduled as part of the Blocker.
- **No in-app link to either policy or to the Support contact.** `mobile-app/app/(app)/settings.tsx`
  was checked directly; its "Privacy" section is plain-language guidance text, not a link to the live
  policy pages, and no Support contact appears anywhere in the app. Recommend linking both from
  Settings once a code change is separately authorized. This item is tracked as a smaller pre-beta
  change in Section 10b.
  *(Update 2026-08-16)*: superseded. `PolicyLinks` now exposes Privacy Policy, Terms of Use, and
  Support links from Settings and account creation, and the posting catch-up flow links to the Terms.
- **No in-app disclosure of the beta's 18+ eligibility requirement.** The draft language in Section 11
  is now approved by the owner as this worksheet's recommended draft, but it still needs to be placed
  somewhere a tester actually sees it, before or during onboarding or account creation. This item is
  tracked as a smaller pre-beta change in Section 10b, and is a future code or process change, not
  something this worksheet performs.
  *(Update 2026-08-16)*: superseded in the app. Account creation now displays a controlled-beta
  eligibility notice for invited testers age 18 or older. The separate live Privacy Policy and Terms
  wording update remains open.

## 13. Public-Release Reassessment Criteria

The owner has approved the following as the recommended future decision framework. This is a
framework for a future decision, not a decision made now: consistent with the owner's instruction,
whether to allow users under 18 remains a future call, made after reviewing actual beta behavior
against the criteria below.

- **Actual categories of prayer content observed during beta.** Whether the nine prayer categories
  (Section 6) produce the kinds of sensitive content anticipated in Section 4, at what frequency, and
  whether any category proves disproportionately sensitive in practice versus in the abstract.
- **Report frequency and severity.** The report rate relative to total submissions (a metric already
  defined in `docs/product-requirements.md` §15), and a qualitative review of what testers actually
  reported, not just how often.
- **Moderation workload and response process.** Whether the single-person, manual Firebase Console
  review process (Section 9a) held up under real beta volume, and whether a documented response-time
  standard is needed before a larger or younger audience is considered.
- **Whether user-blocking became necessary in practice**, independent of whether it was required by
  platform policy. Real tester behavior, not just policy language, is the better signal for whether
  this feature is load-bearing for safety, not just for compliance.
- **Privacy and parental-consent requirements**, resolved with qualified legal input. The live Privacy
  Policy already flags this as open (Section 12a); a public release that could include minors would
  need this resolved, not just flagged.
- **Minor-specific safety language**, if minors are included, reviewed by a qualified resource before
  publication, not drafted ad hoc.
- **Store policy requirements specific to a younger audience**, re-checked at that time against
  Google's Families Policy Requirements and Apple's Kids-category and age-assurance guidance (both
  cited in Section 17), since platform policy in this area changes over time and this worksheet's
  2026-08-15 research should not be assumed current for a decision made later.
- **Whether the product should support teens at all**, as a deliberate product decision, not a default
  outcome of removing the 18+ restriction. The owner's original direction (Section 3) treats this as
  genuinely open, not pre-decided in either direction.
- **Whether separate experiences or safeguards would be required** for a mixed-age audience (for
  example, age-appropriate content review, a neutral age screen as Google describes it, or restricting
  certain categories), rather than assuming the current adult-only experience can be opened up
  unchanged.

## 14. Open Questions

All items open in the previous revision of this worksheet have been resolved by owner decision. No
genuinely open question remains in this worksheet as of v0.1 approval (Section 16).

Resolved in the previous revision: the Apple "Social Media" judgment call (decided Yes, Section 7b);
the Apple and IARC "Medical or Treatment Information" answer (decided Infrequent, Section 7b); and
whether to formalize a response-time target for reports (addressed by the internal moderation
procedure in Section 9d, not a public SLA).

Resolved in this revision:

1. **Beta-specific 18+ eligibility language for the live Privacy Policy and Terms of Use** will be
   added during the UGC Compliance Blocker (Section 10d), before external beta testing begins.
   Resolves the Section 12c question.
2. **Timeline and ownership for the UGC Compliance Blocker** (Section 10d): scheduled immediately
   after Blocker 5. Product Spark Studio owns completion, supported by the AI implementation and
   review team.
3. **Google Play's testing-track requirements for an organization account** will be verified against
   the actual Product Spark Studio organization account once it is created (Section 8e), rather than
   assumed from the personal-account page this worksheet cited.

Any new questions that arise during the UGC Compliance Blocker or the beta itself should be tracked
separately, not added retroactively to this record.

## 15. Owner Review Checklist

- [x] The owner-approved beta direction in Section 3 is recorded accurately, word for word.
- [x] The reasons for the adult beta audience in Section 4 are accurate and complete.
- [x] The Apple owner-decided answers in Section 7b, including Social Media = Yes and the
      Infrequent-level Mature Themes and Medical/Wellness answers, are recorded accurately, along
      with the resulting 13+ calculated-rating expectation in Section 7d and the 18+ owner override
      decision in Section 7e.
- [x] The Google owner-decided answers in Section 8c, the target-audience decision in Section 8a, and
      the corrected personal-versus-organization-account testing-track discussion in Section 8e, are
      recorded accurately.
- [x] The gaps in Section 10 are correctly sorted into pre-external-beta implementation blockers
      (10a), smaller pre-beta changes (10b), and other tracked items (10c), with the planning
      disposition in 10d recorded.
- [x] The internal moderation procedure in Section 9d is recorded accurately and is understood as an
      internal operating procedure, not a published service-level agreement.
- [x] The beta invitation language in Section 11 is recorded as owner-approved for use as this
      worksheet's recommended draft, not as published or tester-facing material.
- [x] The Privacy Policy, Terms of Use, and Support impacts in Section 12c are understood as
      recommendations only, not changes already made, and the two smaller pre-beta changes they
      describe are tracked in Section 10b.
- [x] The public-release reassessment criteria in Section 13 are approved as the recommended future
      decision framework.
- [x] The open questions in Section 14 have been read, and all have been resolved by owner decision.
- [x] The owner has approved this worksheet as v0.1 for controlled beta planning (Section 16).

## 16. Approval Record

**Status: APPROVED: AGE RATING AND TARGET AUDIENCE WORKSHEET v0.1.**

| Field | Value |
|---|---|
| Approved by | Heriberto Rodriguez Jr. |
| Date approved | August 15, 2026 |
| Version approved | v0.1 |
| Notes | Approved for controlled beta planning. The 18+ direction applies to the beta only. The UGC Compliance Blocker must be completed before external beta testing. |

Owner decision, recorded verbatim: "I approve the Age Rating and Target Audience Worksheet v0.1 on
August 15, 2026."

This worksheet is approved as of the date above for controlled beta planning purposes. Approval does
not authorize App Store Connect or Google Play Console configuration, account creation, submission,
publication, or any change to application code, website files, or configuration; those remain
separate, future actions. The pre-external-beta implementation blockers in Section 10a, and the UGC
Compliance Blocker task in Section 10d that must close them (scheduled immediately after Blocker 5,
owned by Product Spark Studio with support from the AI implementation and review team), remain
outstanding and are unaffected by this approval. They must be completed before external beta testing
begins, as recorded in the Notes above.

## 17. Official Platform Sources

All sources below were accessed directly on 2026-08-15. No third-party ASO article, blog post, or
unofficial summary was used as authority anywhere in this worksheet; third-party search results were
used only to locate the correct official URL, never as a source of the underlying claim.

**Apple (developer.apple.com), accessed 2026-08-15:**

- Age ratings values and definitions. [App Store Connect Help](https://developer.apple.com/help/app-store-connect/reference/age-ratings/)
- Set an app age rating. [App Store Connect Help](https://developer.apple.com/help/app-store-connect/manage-app-information/set-an-app-age-rating)
- App Review Guidelines, Section 1.2 (User-Generated Content). [Apple Developer](https://developer.apple.com/app-store/review/guidelines/)
- Invite external testers. [App Store Connect Help, Test a beta version](https://developer.apple.com/help/app-store-connect/test-a-beta-version/invite-external-testers/)

**Google (support.google.com), accessed 2026-08-15:**

- Manage target audience and app content settings. [Play Console Help](https://support.google.com/googleplay/android-developer/answer/9867159?hl=en)
- Content rating requirements for apps, games, and the ads served on both. [Play Console Help](https://support.google.com/googleplay/android-developer/answer/9859655?hl=en)
- User Generated Content policy. [Play Console Help](https://support.google.com/googleplay/android-developer/answer/9876937?hl=en)
- Google Play Families Policies. [Play Console Help](https://support.google.com/googleplay/android-developer/answer/9893335?hl=en)
- App testing requirements for new personal developer accounts. [Play Console Help](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en)
