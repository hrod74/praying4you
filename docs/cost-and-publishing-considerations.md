# Cost and Publishing Considerations: Praying For You

## 1. Summary

Most of the React Native / Expo rebuild can be done with little to no upfront cost during development. The core tools — React Native, Expo, and Firebase — all have free tiers that are sufficient for active development and early MVP testing. No paid accounts are required to write code, run the app on personal devices, or test with a small group of users.

Publishing to the iOS App Store and Google Play Store does require paid developer accounts, but both can be deferred until the app is actually ready for release. There is no benefit to paying for store accounts while the app is still in active development. The one-time cost for Google Play ($25) is low enough that it can be paid whenever Android testing on a real device beyond Expo Go becomes necessary, but the Apple Developer Program fee ($99/year) should be treated as a launch-gate expense, not an early development cost.

---

## 2. Costs Likely Required for Public Release

### Apple Developer Program

- Required to distribute any app on the iOS App Store, including TestFlight public betas.
- Current cost: approximately $99/year (USD).
- Must be renewed annually. If the membership lapses, the app is removed from the App Store until renewed.
- The annual renewal is the only recurring hard cost associated with keeping the iOS app live.
- Recommendation: defer this purchase until the app is feature-complete, tested, and genuinely close to submission. Paying early provides no development benefit — Expo Go on a personal device is sufficient for iOS development without an Apple Developer account.

### Google Play Console

- Required to publish any app on the Google Play Store, including internal testing tracks.
- Current cost: approximately $25 one-time registration fee (not annual).
- Once the account is created, there is no annual renewal fee to maintain it or keep published apps live.
- The lower cost and one-time nature make Android a strong candidate for the first public release of Praying For You.
- Recommendation: this fee is low enough to pay whenever the team is ready for a real-device distribution test beyond Expo Go — but it is still not required during local development.

---

## 3. Costs That Can Likely Be Avoided During Early Development

### React Native

- Free and open source (MIT license).
- No licensing cost at any scale.

### Expo

- Free to start and sufficient for most of the build.
- **Expo Go**: the free companion app for iOS and Android that allows testing a development build without any account or build pipeline. This is the primary development tool during early phases.
- **Local development builds (expo-dev-client)**: free to build and run on personal devices when native modules are needed beyond what Expo Go supports.
- **EAS Build**: Expo's cloud build service has a free tier that includes a limited number of builds per month. For a solo developer or small team building infrequently, the free tier will likely be sufficient for early development.
- Paid EAS tiers exist for higher build volumes and priority queuing, but these are not needed until the app is being built and released frequently.
- No cost is incurred simply by using Expo locally.

### Firebase

- Firebase offers a free **Spark plan** that covers all services needed for development and low-traffic MVP testing.
- The Spark plan is sufficient for:
  - Firebase Authentication (email/password) — free up to 10,000 authentications per month, which is well above MVP scale.
  - Firestore reads, writes, and storage — the free tier allows 50,000 reads and 20,000 writes per day, which is generous for a development and early testing environment.
  - Firebase Hosting (if used for any companion web content).
- Costs begin to appear if:
  - Firestore reads or writes exceed the Spark plan's daily free limits under real user load.
  - Cloud Functions are used — Cloud Functions require upgrading to the **Blaze plan**, which is pay-as-you-go. There is no fixed monthly fee on Blaze; charges only accrue for usage above the free tier thresholds.
  - Storage use grows significantly (not expected at MVP scale for a text-based prayer app).
- For a small MVP with a limited user base, Firebase costs are realistically $0 or near $0.
- The Blaze plan's pay-as-you-go structure means there is no risk of a surprise large bill at MVP scale — usage is text-heavy and low-bandwidth by nature.
- Note: if Cloud Functions are used (for example, to schedule a Verse of the Day update or to handle moderation triggers), upgrading to Blaze is required. The upgrade itself is free; costs only apply to actual function invocations above the free tier, which at MVP scale will likely remain at $0.

### AdMob (Google)

- Free to set up and integrate.
- AdMob is revenue-generating for the app, not a direct cost to the developer.
- Integration does not incur any fees — it only requires creating an AdMob account and registering the app.
- Should be treated as a later-phase feature, not an early development priority. Building and testing ads before the core prayer experience is stable adds complexity without meaningful benefit.

---

## 4. Recommended Cost-Controlled Build Plan

### Phase 0: Planning (Current)

- Produce foundational documents: README, legacy app audit, product requirements, cost and publishing considerations.
- No tooling, accounts, or infrastructure required at this stage.
- Cost: $0

### Phase 1: Build Without Spending Money

- Initialize the Expo project locally using the managed workflow.
- Use Firebase Spark free tier for Firestore, Firebase Auth, and any other Firebase services needed.
- Test exclusively using Expo Go on personal iOS and Android devices. No developer accounts required.
- Do not integrate real ads — skip AdMob entirely or use test ad unit IDs that serve placeholder ads without any account approval.
- All core features (authentication, prayer feed, submit prayer, "I prayed for this" action, reporting) should be built and functionally verified in this phase.
- Cost: $0

### Phase 2: Android-First Release Consideration

- When the MVP is stable and the team is confident in the core experience, pay the $25 Google Play Console registration fee.
- Set up an internal testing track on Google Play to distribute the app to a small group of real testers outside of Expo Go.
- Use this phase to gather real user feedback on the core prayer experience before investing in iOS distribution.
- Fix issues surfaced by real users. Confirm moderation, reporting, and privacy basics are working.
- Cost: $25 (one-time)

### Phase 3: iOS Release Consideration

- Pay the Apple Developer Program fee (~$99/year) when the app is polished, stable, and genuinely ready to be maintained as a live product.
- Use TestFlight to distribute the app to a wider beta test group before submitting for App Store review.
- Prepare for App Store review requirements: privacy policy, content moderation documentation, age rating, and screenshots.
- Budget for the annual renewal as a recurring operating cost from this point forward.
- Cost: ~$99/year (ongoing)

### Phase 4: Monetization

- Integrate Google AdMob after the core prayer experience is stable and confirmed to be working well for real users.
- Begin with banner ads only, in non-sensitive locations (see Section 5).
- Verify AdMob account approval and ad serving before counting on any revenue.
- Evaluate whether the ad experience degrades the app's mission, and adjust placement or frequency accordingly.
- Consider offering an ad-free tier or a one-time support purchase as an alternative revenue path.
- Cost: $0 to integrate; revenue-generating if approved

---

## 5. Important Product Considerations

### Do Not Let Monetization Hurt the Prayer Experience

The core purpose of Praying For You is communal spiritual support. Users are sharing personal, often emotionally vulnerable requests. Every product decision — including where and when ads appear — should be evaluated against whether it serves or undermines that purpose.

### Do Not Show Ads During Sensitive Moments

Ads must not appear during emotionally sensitive interactions. Specific moments to keep entirely ad-free:

- The prayer submission confirmation screen (the moment after a user submits a prayer request is a moment of hope or vulnerability — an ad here is inappropriate).
- The prayer detail view (reading someone's prayer request deserves full attention).
- The "I prayed for this" confirmation (the moment a user taps to say they prayed for someone is an act of care — do not interrupt it with an ad).

Appropriate ad placement would be limited to neutral moments: the main feed screen between cards, a banner at the bottom of the feed, or a non-intrusive placement on a profile or settings screen.

### Privacy and Moderation Take Priority Over Revenue

Both the iOS App Store and Google Play require apps with user-generated content to have active moderation capabilities and a publicly accessible privacy policy. An app that handles sensitive personal content (prayer requests about health, grief, family, mental health) has a higher ethical obligation than a typical social feed app. These requirements are not optional and should be completed before any monetization work begins:

- A privacy policy that clearly states what data is collected, how it is used, and how users can request deletion of their account and data.
- A content reporting mechanism so users can flag inappropriate posts.
- A moderation path — at minimum, an admin-accessible way to remove flagged content.

### Treat Ads as a Small-Support Feature

AdMob should be framed internally as a way to offset operating costs (Firebase, developer accounts), not as the primary business model. This framing helps keep ad placement decisions principled: ads stay in neutral locations, are limited in frequency, and are never the reason a product decision is made.

### Review App Store and Ad Network Content Policies Early

Both Apple and Google have content policies that apply specifically to religious and spiritual apps. Additionally, Google AdMob has content policies that govern which categories of apps can serve which categories of ads. Before building the AdMob integration, confirm:

- The app's content category is eligible for AdMob ad serving.
- The types of ads that will be served are appropriate for an audience that includes people in distress.
- The app meets App Store and Google Play guidelines for user-generated content, moderation, and privacy for the religion and spirituality category.

Discovering a policy conflict after building the monetization layer is a waste of development time. A 30-minute review of these policies during Phase 1 can prevent a significant rework in Phase 4.

---

## 6. Open Questions

The following questions should be decided by the developer or team before or during the build. These are not blockers to starting development, but they affect architectural and timeline decisions.

- **Android before iOS?** Should Android launch first, given the $25 vs. $99 first-year cost difference? The answer is likely yes for a solo or small-team project with a limited launch budget, but this should be confirmed as a deliberate choice.
- **When to purchase the Apple Developer account?** Is the $99 fee worth paying now for development access (e.g., physical device builds without Expo Go limitations), or should it wait until the app is release-ready? For most developers, Expo Go and local builds defer this cost until needed.
- **AdMob in v1.0 or v1.1?** Should the initial public release include ads, or should v1.0 focus entirely on the prayer experience and add monetization in a follow-on update? Deferring ads to v1.1 reduces submission complexity and lets users trust the app before ads are introduced.
- **Ad-free support option?** Should the app offer a way for users to support the project without ads — such as a one-time in-app purchase to remove ads permanently? This is a common model for utility and spiritual apps, but in-app purchases add App Store complexity and require additional review.
- **Firebase free tier headroom for MVP:** How much Firebase usage can realistically stay within the Spark plan's free tier given the expected MVP user base? For a small launch, the answer is almost certainly "all of it," but this should be monitored after public launch and the team should know how to read Firebase usage in the console.
- **Legacy data migration:** Should existing prayer requests from the legacy Firebase Realtime Database be migrated to the new Firestore data model, or should the mobile app start fresh with a clean database? Migration requires data transformation, decisions about handling anonymous records with no user ID, and sanitization of potentially unsafe legacy content (the legacy app had a stored XSS vulnerability). Starting fresh is simpler and avoids inheriting the legacy app's data quality problems.
- **Cloud Functions and Blaze upgrade timing:** If Cloud Functions are needed (for Verse of the Day scheduling, moderation triggers, or atomic operations), when is the right time to upgrade from Spark to Blaze? This is low-stakes — the upgrade is free and pay-as-you-go — but it should be a deliberate decision, not a surprise.

---

## 7. Current Recommendation

The following is a clear, direct recommendation for how to proceed:

**Continue with planning and local development now, at $0 cost.** There is nothing blocking the start of active development. Initialize the Expo project, set up Firebase with the Spark free tier, and begin building authentication and the prayer feed using personal devices and Expo Go.

**Do not purchase Apple Developer or Google Play accounts yet.** Neither is required for local development or Expo Go testing. Purchase the Google Play account ($25) when the MVP is stable enough for a real-device beta outside Expo Go. Purchase the Apple Developer account (~$99/year) when the app is genuinely release-ready and the team is committed to maintaining it as a live iOS product.

**Use Firebase Spark free tier for all development and early testing.** The Spark plan is more than sufficient for the full development phase and a small-scale public MVP. Upgrade to Blaze only if Cloud Functions are needed, and only at the point they are actively being built.

**Defer AdMob until after core features, authentication, reporting, and privacy basics are working.** The prayer experience must be solid and trustworthy before ads are introduced. Ads added too early create distraction during development and risk a poor first impression with early users.

**Consider an Android-first release when MVP quality is reached.** The $25 Google Play Console fee vs. the $99/year Apple Developer fee makes Android the lower-risk first public release. An Android launch also provides real user feedback and the opportunity to refine the app before investing in the iOS review process.

**Revisit this document before each phase transition** to confirm that cost assumptions are still accurate. Firebase pricing, Expo EAS tiers, and App Store fees are subject to change. The estimates in this document reflect publicly known pricing as of early 2026.
