# Product Roadmap: Praying For You Community

## Document control

**Product name and working-name status.** The working name used in current product conversations is "Praying For You Community." Every store-facing artifact in the repository through 2026-08-29 (app.json, store listing copy, store assets, QA product-name checks) still uses "Praying For You," without "Community." This is a live, unresolved discrepancy, not a settled fact in either direction. This roadmap does not resolve it. See the "App naming, positioning, and competitive differentiation" item in the Now horizon, and the Decision and Change Records section below.

**Owner:** Eddie (Heriberto Rodriguez).

**Last updated:** 2026-08-31.

**Status:** Living document, initial draft.

**Planning horizon:** Rolling. No fixed end date. This roadmap is meant to be revised as evidence changes, not replaced on a calendar.

**Next review trigger:** The next material change to `app.json`, `eas.json`, or any store-facing artifact, or the next owner product review, whichever comes first. Not a fixed date.

**Supporting documents:**
- `Products/praying4you/docs/reviews/2026-08-31-product-state-evidence-review.md` (the evidence base for this roadmap; read this first)
- `Products/praying4you/docs/product-ideas.md` (the idea backlog; a sibling document maintained separately, referenced throughout this roadmap by idea title)
- `Products/praying4you/docs/prototype-roadmap.md` (historical record, predates most Firebase/QA/store work; preserved as-is, not a source for current state)
- `Playbooks/Product_Lifecycle/Competitive_Discovery_and_Differentiation_Workflow.md`
- `Playbooks/Product_Lifecycle/Beta_Readiness_Framework.md`
- `Products/praying4you/docs/naming-and-competitive-discovery-brief.md` (naming discovery in progress, started 2026-09-01)
- `Products/praying4you/docs/naming-decision-and-propagation-audit.md` (decision record and rename checklist, 2026-09-01)

**How to read this roadmap.** Following Product Spark Studio's Modern Roadmapping Principles, this is a decision system, not a delivery inventory. It shows what the product is choosing to focus on, why, with what evidence, and what would change the plan. It is not a feature list and it does not commit to dates the evidence does not support. Certainty decreases with distance: items in "Now" are described with real specificity, items in "Exploring" are described as open questions on purpose.

---

## Product direction

**Vision.** A calm, sincere, and trustworthy place for believers to share prayer requests, pray alongside others, and know they were prayed for. The product's reason for existing is spiritual, not social. It should feel like showing up for someone in prayer, not like checking a feed.

**Target users.** Believers who want to ask for prayer and pray for others in a community setting, without the performance pressure, noise, or manipulative patterns of conventional social apps. Initial audience is a small, beta-scale group of testers; the public audience, category, and age rating are still open decisions (see Decision and Change Records).

**Core problem / job to be done.** When someone is struggling, grieving, hoping, or celebrating, they want people to actually pray for them, and they want to know that happened. Conversely, people who want to pray for others want an easy, sincere way to find real requests and act on them. Existing options are ad hoc (texting a group, a church bulletin, a spreadsheet, doing nothing) or are individual prayer-tracking tools rather than shared, communal prayer.

**Current value proposition.** A shared prayer feed where people can post named or anonymous requests, organized by category, and where others can mark "I prayed for this," so the requester can see that people showed up for them. Daily verse, private account controls, and reporting/blocking round out a first, narrow version of this experience.

**Product principles.**
- Calm over stimulating. The product should never feel like it needs to be checked.
- Sincere over performative. No public "like" counts framed as popularity; "I prayed for this" is a record of care, not a score.
- Private and trustworthy by default. People are sharing vulnerable things; safety and control come first.
- Narrow and intentional scope over feature breadth, especially pre-wide-beta.
- Evidence-led change. Manual QA is real evidence but it is not usage evidence; the roadmap says so explicitly wherever that distinction matters.

**Explicit anti-goals.** The product must not become:
- A conventional social feed optimized for scrolling or time-on-app.
- A popularity contest (no leaderboards, no public follower/like counts framed as status).
- An engagement-maximizing app using vanity metrics as success measures.
- A source of manipulative notification patterns (guilt, streak pressure, fear of missing out) to pull people back in.
- A gamified-streak product ("you prayed 7 days in a row!") that turns prayer into a habit-loop mechanic rather than a sincere act.

Any roadmap item that could drift toward these anti-goals carries an explicit guardrail in its entry below, not just a feature description.

**Current differentiation hypothesis (not yet validated).** The working hypothesis is that this product's edge is shared, communal prayer, praying alongside others in real time around real requests, with an eventual path to closing the loop through answered-prayer updates or testimony, in contrast to the colliding "PrayingForYou" iOS app's apparent individual-prayer-commitment focus. This is stated as a hypothesis on purpose. No completed Competitive Landscape and Differentiation Brief exists yet for this product under PSS's Competitive Discovery and Differentiation Workflow, so this differentiation claim has not been evidence-tested against the actual competitor, its reviews, or its positioning. Treat this paragraph as the reason the naming/positioning work in the Now horizon matters, not as a settled claim to repeat externally. As naming discovery has progressed, a candidate core story has emerged around the leading name candidate "Prayer Table": people leave a prayer request at the table and others pick one up to pray for it. This is a promising narrative frame, not yet a finalized differentiation statement; it should be folded into the Competitive Landscape and Differentiation Brief's formal differentiation statement once the name itself is locked in.

**Current lifecycle / beta stage.** Early-stage, small-scale, manually-QA'd beta. Android has a QA-passed EAS preview build; iOS has no build artifact anywhere in the repository. Owner-reported Play Console internal testing and an Apple-approved external TestFlight group exist per product conversation but are not independently verifiable in the repository as of this review (see Evidence Summary). The product has not reached validated, wide-scale distribution, and this roadmap does not assume it has.

---

## Evidence summary

This roadmap is built directly on `docs/reviews/2026-08-31-product-state-evidence-review.md`. That document is the source of truth for current state; this section summarizes how its evidence is used here.

**What is known (observed fact, verified in the repository).** The core experience is functionally rich and owner-QA-passed on a single device or emulator per feature: auth, shared prayer feed with named/anonymous posting and categories, create/edit/soft-remove requests, "I prayed for this" with counts and duplicate-prevention, daily verse, profile/settings, content reporting, hidden accounts/blocking, a pre-publication content filter, a terms-acceptance gate (client-side only), account deletion, feed sort/filter, and Android EAS OTA updates. No behavioral analytics, crash reporting, or monitoring tooling exists anywhere in the app; this was a deliberate, documented deferral. The store-facing name in every repository artifact through 2026-08-29 is "Praying For You," not "Praying For You Community."

**What is based on tester feedback (informal, secondhand, owner-summarized).** Accessibility and larger-text fixes trace back to real tester feedback (source and count unspecified). The sort/filter feature traces back to early alpha feedback. No aggregated feedback log, survey response data, or interview notes exist in the repository. The `docs/beta-feedback-plan.md` survey/interview mechanism is designed but not operational (placeholder links only, no real URLs stored).

**What is owner-reported and not independently verified in-repo.** That the Android build was published to Google Play internal testing with four testers on a "PSS Internal QA" list. That an iOS build was uploaded to App Store Connect and Apple-approved for external TestFlight under a "PSS Beta Testers" group. That the "missing Firebase env vars in production caused 'No profile yet'" incident occurred and was fixed by copying vars and rebuilding (corroborated in spirit, not verbatim, by commit history and the new validation guard). These may all be true; they are simply not things a code repository can prove on its own, and this roadmap treats owner confirmation against the actual consoles as an open action rather than asserting or denying any of them.

**Update, 2026-08-31 (owner-confirmed).** The owner directly confirmed current tester counts: 8 users on iOS via TestFlight, 6 users on Android. This is a stronger signal than the general owner-reported framing above (specific, current, and directly restated in this engagement), though still not independently verified against the App Store Connect or Play Console dashboards themselves. See the evidence review's Section 11 addendum for the full note.

**Important evidence gaps.**
- No behavioral analytics exist at all. There is no usage-pattern evidence anywhere in this product today; every prioritization decision in this roadmap is necessarily based on manual QA notes, secondhand tester feedback, and judgment, not usage data.
- No aggregated qualitative feedback exists. The mechanism to collect it (survey/interview plan) is designed but not live.
- iOS distribution has zero repository evidence (no EAS iOS build, no App Store Connect record, no TestFlight configuration file).
- Android Play Console internal testing has zero repository evidence (console-side facts are simply not visible in a code repo).
- No crash reporting exists, so there is no evidence source for post-install stability beyond what the owner personally observed during manual QA.

---

## Roadmap

### Now: Learn and stabilize

The purpose of this horizon is to make the product trustworthy to build on and to make it possible to actually learn from beta, before adding new user-facing scope. Everything here is either a live risk, a discrepancy that needs to be resolved by decision, or a precondition for evidence the roadmap does not yet have.

---

**1. Beta learning and feedback synthesis**

- **Outcome or problem:** The product currently cannot learn from its own beta. There is no working feedback-collection mechanism and no aggregated feedback log; what "evidence" exists is secondhand and owner-summarized.
- **Why it matters:** Every other prioritization decision on this roadmap, and every future one, depends on having a real signal from real users. Without this, the roadmap stays guesswork dressed up as planning.
- **Evidence:** `docs/beta-feedback-plan.md` defines a survey/interview process but its own text says the links are placeholders with no real URLs stored in the repository. No aggregated tester feedback log, survey response data, or interview notes exist anywhere in the repository.
- **Hypothesis:** A lightweight, low-friction feedback mechanism (a short in-app or emailed survey, or a small number of structured check-ins with current testers) would surface enough signal to inform the next round of decisions without requiring analytics.
- **Possible solution directions (not committed):** Stand up the placeholder survey with a real link and a short question set; schedule brief structured conversations with current testers; add a simple in-app "send feedback" pathway; define a lightweight log format so future feedback doesn't stay scattered across QA docs.
- **Success signal:** A working feedback intake exists and at least one round of real tester input has been collected and written down in one place.
- **Guardrails:** Keep it lightweight, this is not a research program. Do not conflate "positive QA notes" with validated tester sentiment. Do not let this stall on tooling choice.
- **Dependencies:** None blocking; can start immediately with what already exists (current testers).
- **Confidence:** High that this is needed; medium on the specific mechanism.
- **Status:** Not started (mechanism designed, not operational).
- **Owner decision needed:** Whether wider beta recruitment (8-15 testers, referenced in `docs/beta-feedback-plan.md`) has actually started, and if not, when to start it alongside standing up feedback collection.
- **Related idea(s):** "Operationalize the beta feedback survey and interview mechanism" (IDEA-008); also a precondition for evaluating most other ideas, including "Privacy-conscious behavioral analytics" (IDEA-006).

---

**2. App naming, positioning, and competitive differentiation**

- **Outcome or problem:** The product's permanent name is unresolved, and the working name used in current conversations ("Praying For You Community") does not match any store-facing artifact in the repository ("Praying For You"). A naming collision with an existing "PrayingForYou" iOS app was discovered only after this product reached beta distribution, meaning store copy and assets were approved before the collision was found. No completed Competitive Landscape and Differentiation Brief exists yet for this product.
- **Why it matters:** Store listing copy, approved store assets, app.json, EAS/store bundle identifiers, and an explicit QA "product name" check are all currently built around "Praying For You." If the name is meant to change, none of the approved materials reflect that. This is a discovery and evidence gap, not a cosmetic rename decision, and it is explicitly flagged in the evidence review as belonging at the top of this product's punch list.
- **Evidence:** Evidence review Sections 3, 5, 8, and 9 (full timeline reconstruction); PSS's own `Competitive_Discovery_and_Differentiation_Workflow.md` and `Beta_Readiness_Framework.md` v0.2, both of which record that this exact collision drove the creation of PSS's competitive-discovery process.
- **Hypothesis:** The two products are not identical (the working differentiation hypothesis is shared/communal prayer versus the colliding app's apparent individual-prayer-commitment focus), but this has not been evidence-tested through a real teardown, and naming/identity confusion risk has not been formally screened per PSS's own workflow.
- **Possible solution directions (not committed):** Run the Competitive Discovery and Differentiation Workflow's Phase 3 naming and identity check (exact/spacing/spelling/phonetic variants, App Store and Google Play results, domain and social handle availability, a basic trademark database search) and Phase 4 focused teardown of the colliding app; complete the Competitive Landscape and Differentiation Brief; then decide whether to keep, adjust, or change the name and how to propagate that decision into app.json, EAS/store configuration, approved store copy, approved store assets, and QA checks.
- **Success signal:** A completed Competitive Landscape and Differentiation Brief exists for this product, the naming and identity collision check has been run and recorded, and the owner has made and recorded a naming decision consistent with the Concept Validation Gate.
- **Guardrails:** A preliminary trademark database search is an early collision screen, not a legal clearance opinion; do not treat it as one. Do not let this roadmap, or any other document, assert that the name has already changed to "Praying For You Community," because no repository evidence supports that as of 2026-08-29. Do not disrupt the current small-scale beta to force this decision faster than the evidence supports.
- **Dependencies:** None blocking the discovery work itself. A name change, if decided, has downstream dependencies on Production readiness (app.json, EAS/store identifiers) and Store Readiness artifacts.
- **Confidence:** High that discovery work is needed now; low on what the eventual naming decision should be (correctly so, it is not this roadmap's job to resolve it).
- **Status:** Decided and partially propagated. Owner locked in "Prayer Table" as the permanent name on 2026-09-01, after four rounds of screening and a deep check found no collision anywhere and strong positive cultural resonance. A formal trademark search, a direct social-handle check, and a domain decision remain the owner's to complete. Group 3 of the propagation audit (the `app.json` display name and the six in-app source-code text spots) was executed 2026-09-01; `tsc --noEmit` passes clean, and the change is not yet committed to git, pending owner review of the app running as "Prayer Table" and approval to commit. Group 4 (store listing copy, store assets and screenshots, App Privacy/Age Rating/Reviewer Account worksheets) and Group 5 (documentation) remain outstanding; see `docs/naming-decision-and-propagation-audit.md` for the full, risk-grouped checklist and recommended order.
- **Owner decision needed:** Whether to approve committing the Group 3 in-app text change to git; whether and when to proceed with Group 4 (store assets require recapturing screenshots of the running app under the new name); a formal trademark search, social-handle check, and domain decision remain outstanding; separately, whether and when to run the fuller Phase 2/4 competitive teardown work.
- **Related idea(s):** "Permanent product naming and positioning" (IDEA-007).

---

**3. Production readiness (release-environment safety net and release gate)**

- **Outcome or problem:** A real production incident already happened (missing Firebase environment variables in production caused "No profile yet" on sign-in). The fix that would prevent a recurrence (`validate-release-env.mjs` and related `eas.json`/`package.json` changes) exists but is uncommitted as of this review. The newly added "mandatory release gate" checklist item is itself currently unchecked for the next release. No crash reporting exists ahead of any wider distribution.
- **Why it matters:** This is a live risk to the next release, not a hypothetical one. The exact class of bug that already caused a production incident is currently unprotected outside the owner's own working tree.
- **Evidence:** Evidence review Section 1 (uncommitted working-tree changes) and Section 7 (risks); commit history shows a Firebase-config fix immediately preceding the corrected Android preview build, consistent with (though not verbatim proof of) the owner's account.
- **Hypothesis:** Committing the existing safety net and completing the release gate checklist substantially reduces the risk of a repeat incident on the next build, without requiring new feature work.
- **Possible solution directions (not committed):** Commit `validate-release-env.mjs`, its test file, and the related `app.json`/`eas.json`/`package.json` changes; complete and check off the mandatory release-gate checklist in `docs/QA_eas_android_standalone_scenarios.md` before the next EAS build; consider a minimal crash-reporting tool as a follow-on (see Reliability and performance below) so post-install issues are visible without the owner personally observing them.
- **Success signal:** The safety net is committed to the branch that produces release builds, and the next EAS build passes the release gate with the checklist genuinely completed, not just present.
- **Guardrails:** Do not treat "the script exists in the working tree" as equivalent to "the risk is mitigated." Do not ship another build from a clean checkout or from origin until this is committed.
- **Dependencies:** None; this is ready to do today.
- **Confidence:** High.
- **Status:** Done. Committed 2026-09-01 (commit `e47e8b8`, branch `feat/feed-scale-readiness`, tests passing) and pushed to `origin/feat/feed-scale-readiness` the same day. The mandatory release-gate checklist in `docs/QA_eas_android_standalone_scenarios.md` should still be walked and checked off before the next actual EAS build, since committing the guard is not the same as having run a release through it yet.
- **Owner decision needed:** None remaining on this item.
- **Related idea(s):** "Commit the release-environment safety net" (IDEA-012).

---

**4. Trust, privacy, safety, and moderation**

- **Outcome or problem:** People share vulnerable, personal content on this product. Reporting and hidden-accounts/blocking exist, but terms-acceptance is enforced client-side only (Firestore does not independently enforce it), and there is no defined backup moderator if the owner is unavailable.
- **Why it matters:** This directly touches the product's core promise of feeling private and trustworthy. A client-side-only enforcement gap and a single point of failure on moderation are both the kind of risk that gets more expensive to fix the more users are on the product.
- **Evidence:** Evidence review Section 2 (client-side-only terms gate, documented as a deferred hardening item) and Section 4 (moderation-backup question listed among unresolved product questions).
- **Hypothesis:** Server-side (Firestore rules) enforcement of terms acceptance, and a named backup or escalation path for moderation, close the two clearest gaps without requiring new user-facing features.
- **Possible solution directions (not committed):** Add Firestore-rule-level enforcement of terms acceptance rather than relying on the client; document (even informally) who handles a report if the owner is unavailable, even if the answer for now is "no one yet, and that is a known gap."
- **Success signal:** Terms acceptance cannot be bypassed by a client that skips the UI gate; a moderation backup/escalation answer exists in writing, even if the answer is currently "none."
- **Guardrails:** This is a trust and safety hardening item, not an excuse to add new moderation tooling or automated content moderation the product does not need yet at this scale.
- **Dependencies:** None blocking.
- **Confidence:** Medium-high on the terms-enforcement fix being straightforward; low on moderation-backup, since that is an owner staffing decision, not an engineering one.
- **Status:** Not started.
- **Owner decision needed:** Who is responsible for moderation if the owner is unavailable (evidence review Section 4 and Section 8).
- **Related idea(s):** "Terms-acceptance hardening (server-side enforcement)" (IDEA-010), "Moderation coverage if the owner is unavailable" (IDEA-011); touches "Privacy-conscious behavioral analytics" (IDEA-006) only insofar as any future analytics work must not weaken this posture.

---

### Next: Validate the strongest product bets

This horizon holds the product's most promising but least-validated ideas: things worth real design and technical investigation once Now-horizon stabilization is underway, but not yet committed to build, because the questions they raise (do people want this, how would it work safely, what does it do to notification behavior) are not yet answered.

---

**5. Closing the prayer loop through updates or answered-prayer testimony**

- **Outcome or problem:** Right now, once someone prays for a request, there is no way to later learn whether the prayer was "answered," whether the situation resolved, or whether the requester wants to share an update. The loop opens (a request is posted, people pray) but never visibly closes.
- **Why it matters:** This is the product's most promising and most distinguishing hypothesis. It is also its riskiest, because handling of unanswered, ongoing, or painful outcomes badly could feel dismissive, presumptuous, or spiritually tone-deaf, exactly what the product must never feel like.
- **Evidence:** No direct evidence yet; this is a hypothesis, not something tester feedback has specifically asked for or rejected, per the evidence review's evidence-gap findings (no aggregated feedback exists at all).
- **Hypothesis:** People who post a prayer request want a low-pressure, optional way to share what happened later (an update, or a note that a prayer was answered), and people who prayed for that request want to know the outcome, without the product implying prayer guarantees an outcome or pressuring anyone to report one.
- **Possible solution directions (not committed):** An optional "share an update" action on a request's own timeline, visible only to those who prayed or to the requester's chosen audience; a way to mark an update as "answered," "ongoing," or "no update," explicitly including non-guaranteeing language so the product never implies a causal promise; audience and privacy controls scoped as tightly as the original request (named/anonymous posting already exists and should extend here); consider whether updates should generate a notification at all, and if so how gently.
- **Success signal:** A validated design (through feedback synthesis in the Now horizon, not through building first) that testers describe wanting, without prompting, and that does not feel presumptuous when someone's prayer situation does not resolve positively.
- **Guardrails:** Never imply prayer guarantees an outcome. Never require an update. Keep unanswered or painful outcomes handled with the same care as answered ones; no "streak" or "success rate" framing of any kind. Any notification tied to this must follow the Respectful push notifications guardrails below.
- **Dependencies:** Depends on the Beta learning and feedback synthesis item (Now) actually producing a working feedback channel first, so this can be validated with real testers before design investment.
- **Confidence:** Medium on the underlying human need; low on the specific mechanism, intentionally, since none has been tested.
- **Status:** Not started; concept only.
- **Owner decision needed:** None yet; this needs validation, not a build decision.
- **Related idea(s):** "Answered-prayer updates and testimony" (IDEA-001), "Closing the prayer loop for prayer partners" (IDEA-002).

---

**6. Respectful push notifications**

- **Outcome or problem:** The product has no notification system today. Adding one is an obvious way to increase re-engagement, and also the single easiest way to accidentally turn this into the manipulative, engagement-maximizing app it is explicitly not supposed to become.
- **Why it matters:** Notifications are usually where "engagement" products cross from useful to manipulative. This item exists on the roadmap specifically to put guardrails in place before any notification is built, not after.
- **Evidence:** No notification system currently exists (evidence review Section 2). This entry is anticipatory, based on the product's stated anti-goals rather than a specific incident.
- **Hypothesis:** A small number of opt-in, low-frequency, clearly-controllable notifications (for example, someone prayed for your request, or a request you prayed for has an update) add real value without becoming pressure, if and only if they are opt-in by default posture, easy to turn off, and never framed to create guilt, urgency, or streak pressure.
- **Possible solution directions (not committed):** Two candidate notification types surfaced by current thinking are "someone prayed for your request" and "there's an update on a request or an answered prayer" (see related ideas below); both should be designed opt-in, low-frequency, and separately controllable, not bundled into a single all-or-nothing toggle.
- **Success signal:** Any shipped notification type can be individually disabled, is not sent more than a sensible low frequency, and testers describe it as welcome rather than intrusive when asked directly.
- **Guardrails (these are the point of this roadmap item): opt-in, controllable per-type, low-frequency, no emotional pressure, no urgency language, no streaks, no "you haven't prayed in a while" nudges, no dark patterns in the opt-out flow.**
- **Dependencies:** Depends on "Closing the prayer loop" reaching a validated design if update-related notifications are in scope; otherwise can be scoped independently for prayer-received notifications alone.
- **Confidence:** Medium that some notification is worth building; the guardrails are high-confidence regardless of which notification ships first.
- **Status:** Not started; concept only.
- **Owner decision needed:** None yet.
- **Related idea(s):** "Notifications when someone prays for your request" (IDEA-003), "Notifications for prayer updates or answered prayers" (IDEA-004), "Optional prayer reminders" (IDEA-005) (this last one carries the highest anti-goal risk of the three and should be scrutinized hardest against the streak/habit-loop anti-goal before any design work begins).

---

**7. Onboarding and activation**

- **Outcome or problem:** There is no dedicated, recent QA verification of the first-time experience as its own subject; core flows are QA-passed individually, but "can a new person understand what this is and post or pray within their first session" has not been evaluated as a distinct question.
- **Why it matters:** The product's value proposition depends on people understanding, quickly and without explanation, that this is a sincere prayer space and not another social app. A confusing or generic-feeling first session undermines that positioning regardless of how good the underlying features are.
- **Evidence:** No direct onboarding-specific QA or feedback evidence exists in the repository; this is inferred from the evidence review's general finding that most feedback evidence is feature-specific (sort/filter, accessibility) rather than first-session-specific.
- **Hypothesis:** A short, sincerity-setting first-run experience (what this is, what it is not, how privacy and anonymity work) meaningfully improves whether new testers understand and trust the product quickly.
- **Possible solution directions (not committed):** A brief first-run explanation of named versus anonymous posting and how "I prayed for this" works; explicit reassurance about privacy and reporting/blocking early, since trust is the product's core promise.
- **Success signal:** New testers, observed or surveyed through the Beta learning and feedback synthesis item, report understanding the product's purpose and completing a first post or prayer without confusion.
- **Guardrails:** Keep onboarding short and sincere; do not use onboarding to sell engagement mechanics (streak setup, notification opt-in pressure) ahead of core value.
- **Dependencies:** Benefits from the Beta learning and feedback synthesis item being operational so onboarding friction can actually be observed rather than guessed at.
- **Confidence:** Low to medium; no direct evidence exists yet, this is a reasoned inference.
- **Status:** Not started.
- **Owner decision needed:** None yet.
- **Related idea(s):** none in the canonical list provided; may warrant its own idea entry.

---

**8. Lightweight, privacy-conscious product analytics**

- **Outcome or problem:** There is currently zero usage-pattern evidence for this product. Every roadmap and prioritization decision, including this one, is made without knowing which features are actually used, how often, or by whom. This was a deliberate deferral, not an oversight, but it now blocks evidence-based prioritization at any real scale.
- **Why it matters:** PSS's own roadmapping principles call for evidence-based investment decisions and a learning loop. Right now that loop has no usage-data leg at all, only manual QA and secondhand feedback.
- **Evidence:** Evidence review Sections 2 and 6 confirm no analytics SDK is initialized anywhere in the app, and that this was deliberate and documented (`docs/store/App_Privacy_and_Google_Data_Safety_Worksheet.md`). A prior analytics event taxonomy was planned in `docs/product-requirements.md` section 12 but never implemented.
- **Hypothesis:** A minimal, privacy-respecting analytics setup (feature-level usage counts, not individual behavioral profiling) would materially improve prioritization confidence without compromising the product's privacy posture.
- **Possible solution directions (not committed):** Revisit the previously planned event taxonomy in `docs/product-requirements.md` section 12 as a starting point, but re-scope it explicitly around privacy; consider a privacy-first analytics approach (aggregated, minimal-retention, no cross-app tracking) rather than a general-purpose behavioral analytics SDK by default.
- **Success signal:** A small, clearly-scoped analytics implementation exists whose data collection is fully described in the app's own privacy disclosures, and which changes at least one subsequent roadmap decision with real evidence.
- **Guardrails (explicit, non-negotiable): must never collect or transmit prayer request text or any sensitive prayer content; must never collect more personal data than the specific product question requires; must be disclosed accurately in the app's privacy policy and data-safety materials before it ships, not after.**
- **Dependencies:** Should follow, not precede, the naming/positioning and production-readiness work in the Now horizon, since analytics implementation touches store privacy disclosures that are already in flux.
- **Confidence:** Medium that this is needed eventually; low on timing and exact scope, hence placement in Next rather than Now.
- **Status:** Not started; explicitly deferred previously.
- **Owner decision needed:** Whether and when to introduce any analytics, advertising, subscriptions, donations, or in-app purchases (evidence review Section 4 lists this as an open product question generally; analytics is the narrower piece addressed here).
- **Related idea(s):** "Privacy-conscious behavioral analytics" (IDEA-006).

---

### Later: Scale what evidence supports

This horizon is intentionally sparse. Nothing here is committed; each item depends on evidence this product does not yet have (real usage data, validated feedback, a resolved name and distribution posture). Their presence here signals direction, not a build order.

---

**9. Reliability and performance at scale**

- **Outcome or problem:** The product has been validated on a single device or emulator per QA pass, not under real concurrent multi-user load or over sustained real-world usage. No crash reporting exists, so stability beyond the owner's manual observation is unknown.
- **Why it matters:** Before any wider distribution (public beta, broader Play/TestFlight rollout, eventual public release), the product needs a real signal for how it behaves outside a single controlled test.
- **Evidence:** Evidence review Section 2 ("Verified as NOT implemented: ... crash reporting") and Section 6 ("No crash reporting or monitoring tooling exists ... so there is no evidence source for post-install stability beyond what the owner personally observed").
- **Hypothesis:** A minimal crash-reporting tool, added ahead of wider distribution, would surface real stability issues that manual QA cannot.
- **Possible solution directions (not committed):** Add a lightweight crash-reporting tool before expanding beyond the current small tester group; treat sustained multi-user feed-scale testing as a precondition for any public release decision (the current git branch name, `feat/feed-scale-readiness`, suggests this is already an area of active engineering attention).
- **Success signal:** Crash reporting is live and has produced at least one real signal used to fix or deprioritize something.
- **Guardrails:** Do not let this become a blocker for the current small-scale beta; it is a precondition for wider distribution, not for continuing the existing beta.
- **Dependencies:** Logically follows Production readiness (Now); benefits from any analytics work if that ships first, though it does not require it.
- **Confidence:** Medium that this matters before wider distribution; low on timing.
- **Status:** Not started.
- **Owner decision needed:** None yet.
- **Related idea(s):** none in the canonical list; may warrant its own idea entry.

---

**10. Retention based on spiritual value, not addictive engagement**

- **Outcome or problem:** Once the product has real usage evidence (via the analytics and feedback work above), there will be a natural temptation to optimize for conventional retention metrics (daily active use, session length, return frequency). Those are exactly the wrong metrics for this product's stated purpose.
- **Why it matters:** This entry exists to put a stake in the ground before that temptation arrives, consistent with the product's explicit anti-goals.
- **Evidence:** No evidence yet exists to act on, since analytics and structured feedback are not yet live; this is a forward-looking principle, not a response to a finding.
- **Hypothesis:** The right retention signal for this product is closer to "did this person feel their prayer mattered, or feel moved to pray for someone else," not "did they open the app today."
- **Possible solution directions (not committed):** When usage evidence exists, define retention success around meaningful actions (a request prayed for, a prayer loop closed, a testimony shared) rather than session frequency; explicitly reject streaks, daily-open badges, or "come back" notification patterns as retention levers.
- **Success signal:** Whatever retention definition the product eventually adopts is stated as spiritual-value-based and can be pointed to when evaluating future feature or notification proposals.
- **Guardrails: no gamified streaks, no vanity metrics, no "you haven't opened the app" nudges, no framing of return visits as the goal.**
- **Dependencies:** Depends on Lightweight, privacy-conscious product analytics (Next) and Beta learning and feedback synthesis (Now) existing first; there is nothing to measure retention against yet.
- **Confidence:** High on the principle; not applicable to rate confidence on implementation, since none is proposed yet.
- **Status:** Principle stated; no implementation proposed.
- **Owner decision needed:** None yet.
- **Related idea(s):** none directly; this is a standing guardrail against several ideas above, particularly "Optional prayer reminders" (IDEA-005).

---

**11. Accessibility**

- **Outcome or problem:** Real accessibility and larger-text fixes have already shipped in response to tester feedback, but no recent, dedicated QA document verifies the current build's accessibility posture as its own subject.
- **Why it matters:** Accessibility work already has real, tester-driven momentum behind it; the gap is verification and continuity, not a cold start.
- **Evidence:** `docs/reviews/phase-h3-accessibility-theme-foundation-review.md` references real fixes triggered by actual tester feedback, per the evidence review Section 6, but is flagged there as "documented-only or partial" for current-build verification.
- **Hypothesis:** A refreshed, dedicated accessibility QA pass against the current build would confirm whether prior fixes still hold and surface any regressions.
- **Possible solution directions (not committed):** Re-run or extend the accessibility QA documented in the phase-h3 review against the current build; fold accessibility checks into whatever release-gate checklist comes out of the Production readiness item.
- **Success signal:** A current, dated accessibility QA document exists and confirms (or corrects) the prior fixes.
- **Guardrails:** None specific beyond standard QA rigor.
- **Dependencies:** Light dependency on the Production readiness release-gate work, since accessibility checks fit naturally into that checklist.
- **Confidence:** Medium; work already exists, this is continuity rather than a new bet.
- **Status:** Partially done (prior fixes shipped); verification pass not scheduled.
- **Owner decision needed:** None yet.
- **Related idea(s):** none in the canonical list; may warrant its own idea entry if not already covered.

---

### Exploring: Uncommitted opportunities

Nothing in this horizon is a plan. These are open questions worth naming now so they are not forgotten, and so that no roadmap reader mistakes their presence here for a commitment.

---

**12. Future monetization guardrails**

- **Outcome or problem:** Whether the product will ever use advertising, subscriptions, donations, or in-app purchases is an explicitly open question (evidence review Section 4 and Section 8). No monetization model exists today, and none is proposed here.
- **Why it matters:** Given the product's anti-goals (no engagement-maximizing patterns, no manipulative mechanics), whatever monetization path is eventually chosen needs to be evaluated against those anti-goals before it is chosen, not fitted to them afterward.
- **Evidence:** No monetization has been implemented or specified anywhere in the repository. This entry is purely anticipatory.
- **Hypothesis:** None stated. This is deliberately guardrails-first, model-agnostic.
- **Possible solution directions (not committed):** None proposed. If and when monetization is considered, it should be evaluated against, at minimum: does it create pressure to check the app more; does it create pressure to post more or post more publicly; does it monetize or exploit sensitive prayer content in any way; does it compromise the "I prayed for this" record's sincerity by turning it into a paid or gamified mechanic.
- **Success signal:** Not applicable; no work is proposed for this horizon.
- **Guardrails (the entire point of this entry): no monetization approach should be considered that increases pressure to engage, monetizes or exposes sensitive prayer content, or turns any existing sincere interaction (posting, praying, "I prayed for this") into a paid or gamified mechanic.**
- **Dependencies:** None; explicitly not started, not scheduled.
- **Confidence:** Not applicable, no proposal exists to rate.
- **Status:** Open question only.
- **Owner decision needed:** Whether the product will ever use analytics-driven advertising, subscriptions, donations, or in-app purchases (evidence review Section 4).
- **Related idea(s):** none in the canonical list.

---

**13. White-label / organization ("Church edition") concept**

- **Outcome or problem:** Whether a white-label or organization-scoped edition of the product (for a specific church or ministry) should ever be pursued is explicitly parked as future-only and not started.
- **Why it matters:** Named here only so it is not lost, consistent with the evidence review's own framing.
- **Evidence:** Evidence review Section 4 lists this as an unresolved product question, explicitly parked as future-only.
- **Hypothesis:** None stated.
- **Possible solution directions (not committed):** None proposed.
- **Success signal:** Not applicable.
- **Guardrails:** Any such concept would need to be evaluated against the same anti-goals as the core product; an organizational or institutional framing must not become a backdoor to engagement-maximizing mechanics either.
- **Dependencies:** None; not started.
- **Confidence:** Not applicable.
- **Status:** Parked, future-only, explicitly not started.
- **Owner decision needed:** None yet; this is a someday question, not a current one.
- **Related idea(s):** "White-label church / organization edition concept" (IDEA-013).

---

## Decision and change records

### Current decisions (already settled)

- The beta stays on its current small tester group; this roadmap does not propose expanding or disrupting the current beta ahead of the Now-horizon stabilization work above.
- No rename is decided or implied by this roadmap. The working name "Praying For You Community" and the store-facing name "Praying For You" both remain in use until the owner makes and records a naming decision through the Competitive Discovery and Differentiation Workflow.
- `docs/prototype-roadmap.md` remains untouched as a historical record and is not used as a current-state source.

### Open decisions (owner must decide)

Pulled forward from the evidence review, Section 8:

- Whether "Praying For You Community" is the adopted store-facing name going forward, and if so, when and how it gets propagated into app.json, EAS/store configuration, approved store copy, approved store assets, and QA checks (none currently reflect it).
- ~~Whether the Google Play internal testing track and iOS TestFlight submission described in current conversation have actually occurred outside what the repository shows.~~ **Resolved 2026-08-31:** owner confirmed 8 iOS TestFlight users and 6 Android users. See evidence review Section 11.
- Public-release age rating and target audience (the current 18+ posture is explicitly beta-only).
- Whether and when to run the Pre-Beta Competitive Refresh for this product.
- Whether to commit the currently-uncommitted release-environment safety net before any further EAS builds.
- Business bank account and D-U-N-S number status.
- Support email / support webpage stand-up (currently placeholder-only).
- Whether wider beta recruitment (8-15 testers) has started.
- Who is responsible for moderation if the owner is unavailable.
- Final data-retention/anonymization wording for deleted accounts.
- Whether the hosted Privacy Policy/Terms pages reflect beta-specific 18+ language.
- Tablet support decision.
- Whether a white-label/organization ("Church edition") concept should ever be pursued.

### Assumptions

- The current small-scale, manually-QA'd beta is an acceptable state to remain in while the Now-horizon items are addressed; nothing here assumes urgency to exit beta on any particular timeline.
- Owner-reported Play Console and TestFlight activity is treated as plausible but unverified in-repo; this roadmap neither asserts nor denies it and recommends owner confirmation against the actual consoles.
- The differentiation hypothesis (shared/communal prayer versus individual prayer-commitment) is treated as a working hypothesis pending a real competitive teardown, not as a claim to use externally yet.

### Risks

Reframed from the evidence review's Section 7 for roadmap use:

- **Technical:** The release-environment safety net that would have prevented the known production incident is uncommitted and would not protect a build from a clean checkout or origin until committed. The mandatory release-gate checklist is currently unchecked for the next release. No crash reporting exists ahead of wider distribution. Terms acceptance is enforced client-side only.
- **Product:** Approved store listing copy, approved store assets, and an explicit QA product-name check are all built around "Praying For You," not "Praying For You Community." If the store-facing name has changed in intent but not in artifacts, that is a real submission-consistency risk. No behavioral analytics means every prioritization decision, including this roadmap's, relies on manual QA notes and informal feedback rather than usage evidence. The beta 18+ age-rating posture is explicitly temporary and the public-release audience decision remains open, which could change scope, store category, and required protections.
- **Process:** The naming collision was discovered only after this product reached beta distribution, meaning brand production, store asset capture, and store copy were completed under "Praying For You" before PSS's collision-driven review process existed. A name change now touches app.json, EAS/store bundle identifiers, approved store copy, approved store assets, and QA product-name checks, a wide blast radius for a decision not yet made. Several core status documents (`.local/APP_DISTRIBUTION_TRACKER.md`, the top line of `Beta_Readiness_Assessment.md`) are stale by their own admission and have not been reconciled.

### Roadmap change log

- **v1.0 (2026-08-31):** Initial roadmap drafted from the 2026-08-31 product-state evidence review and PSS's Modern Roadmapping Principles, Roadmap Maturity Model, Strategy-to-Delivery Model, and related Product Ops Playbook and Product Lifecycle guidance. Establishes the Now / Next / Later / Exploring structure and the initial horizon placements described above. No prior roadmap version existed for this product beyond the historical `docs/prototype-roadmap.md`, which predates this document and is not superseded by it in scope (that document remains a historical record; this document is the current living roadmap).

Future changes to this roadmap should be appended below this line as new dated entries, not made by silently overwriting the entries above.

- **v1.1 (2026-08-31):** Lead-agent reconciliation pass. Cross-referenced every roadmap item's "Related idea(s)" field against the final `docs/product-ideas.md` idea IDs (the roadmap and idea backlog were drafted in parallel by separate sub-agents from a shared evidence base, so exact idea IDs were not available when the roadmap was first drafted). Added idea IDs alongside existing title references and filled in four previously-unlinked items (Beta learning and feedback synthesis, Production readiness, Trust/privacy/safety/moderation, and the White-label/organization concept) with their matching idea records. No roadmap content, horizon placement, evidence, or owner-decision language was changed in this pass, only cross-reference links.

- **v1.2 (2026-08-31):** Owner confirmed current beta tester counts directly in conversation: 8 iOS TestFlight users, 6 Android users. Updated the Evidence Summary and resolved the corresponding Open Decision bullet above. No other roadmap content changed.

- **v1.3 (2026-09-01):** Owner approved committing the release-environment safety net (timing still open). Owner selected four naming candidates and asked to prioritize naming discovery; a first-pass naming and identity collision check ran the same day, documented in the new `docs/naming-and-competitive-discovery-brief.md`. Updated the "App naming, positioning, and competitive differentiation" and "Production readiness" items above to reflect both.

- **v1.4 (2026-09-01):** Committed the release-environment safety net locally (commit `e47e8b8`, tests passing). Push to GitHub is a pending owner action since this session cannot authenticate to the remote.

- **v1.5 (2026-09-01):** Owner pushed commit `e47e8b8` to GitHub from their own machine. Production readiness item's safety-net sub-task is now fully closed; only the pre-next-build release-gate checklist walkthrough remains open.

- **v1.6 (2026-09-01):** Naming discovery continued through a third round of candidates. "Prayer Table" emerged as the strongest candidate screened to date (no collision found, best domain signal of any candidate across all rounds). Updated the "App naming, positioning, and competitive differentiation" item's status accordingly.

- **v1.7 (2026-09-01):** Deep check completed on "Prayer Table": trademark search, four domain variants, and social handles all clear or clean-signal. Found that "prayer table" is an existing devotional practice, which supports rather than undermines the name. Owner proposed a core product story built around it (leaving and picking up prayers at the table). "Prayer Table" is now the leading naming candidate, pending a formal trademark search, a direct social-handle check, and a domain-strategy decision, all owner actions outside this session's scope.

- **v1.8 (2026-09-01):** Owner locked in "Prayer Table" as the product's permanent name. Created `docs/naming-decision-and-propagation-audit.md`, a risk-grouped checklist of every place the old name appears (technical identifiers not to touch, app text to update, store materials to rework, documentation to batch-update later) and a recommended execution order. No renaming has been executed yet.

- **v1.9 (2026-09-01):** Owner approved executing Group 3 of the propagation audit now, while still in beta with a small user set. Changed `app.json` display name and six in-app source-code text spots from "Praying For You" to "Prayer Table" (`_layout.tsx` splash title, `index.tsx` welcome title, `settings.tsx` About heading/paragraph/footer, `verse.tsx` reflection note, plus cosmetic comment updates in `contentFilter.ts` and `firestore.rules`). Verified no unintended files changed and `tsc --noEmit` passes clean. Not yet committed to git; committing and Group 4 (store assets and copy) remain pending owner review and approval.
