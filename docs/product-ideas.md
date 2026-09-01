# Product Idea Backlog: Praying For You Community

Document type: Living idea backlog (feeds the living roadmap; does not itself commit anything)
Product: Praying For You Community (working name; store-facing name in current repo artifacts is still "Praying For You," see the 2026-08-31 evidence review, Section 9)
Owner: Eddie / Heriberto Rodriguez (Product Spark Studio)
Prepared by: PSS sub-agent (idea-system and documentation), grounded in `docs/reviews/2026-08-31-product-state-evidence-review.md`
Date created: 2026-08-31
Status: Living document. Append and update, do not silently rewrite history. See the Decision History field on each record and Section 5 for the change log.
Format reference: `Playbooks/Product_Lifecycle/Templates/Living_Product_Idea_Backlog_Template.md` (this file is the first live product using that format)
Related documents: `docs/product-roadmap.md` (owned by a separate PSS sub-agent; ideas here are referenced there by title, not by ID, so titles are stable), `docs/reviews/2026-08-31-product-state-evidence-review.md`, `docs/beta-feedback-plan.md`, `docs/product-requirements.md`

---

## 0. How to read this document (under a minute)

Ideas move through stages of maturity. This backlog tracks every stage honestly, including the early and uncertain ones, so nothing gets lost and nothing gets overstated.

- **Raw idea.** Someone said or noticed something. Not yet examined.
- **Observed problem.** A specific difficulty or gap, grounded in evidence (a QA note, tester feedback, a repo fact), not yet a proposed fix.
- **Opportunity.** A problem judged worth solving, sized roughly against the mission.
- **Hypothesis.** A specific, falsifiable guess about what would help and why, stated so it could be wrong.
- **Candidate solution.** A concrete shape for a fix or feature, not yet built or validated.
- **Validated bet.** Evidence (real usage, real feedback, a real test) supports the hypothesis enough to justify committing resources.
- **Roadmap commitment.** The owner has approved moving this into a horizon on `product-roadmap.md` with a stated outcome. This backlog does not perform this step; it only supplies the evidence.
- **Delivered capability.** Built, shipped, and verified in the product.

**Every idea record below states its current stage inside its Status field.** An idea sitting in "Inbox" or "Needs clarification" is not a commitment or even a validated bet; it is a candidate worth remembering and eventually examining.

**A rule for AI collaborators working in this backlog:** never mark an idea "Promoted to roadmap" or "Evidence supported" without evidence that meets that bar, and never make the promotion decision itself. Promotion into a roadmap commitment requires real evidence and the owner's approval. When in doubt, use the lower-maturity status and say why.

---

## 1. Idea record format

Every full idea record uses this field set. Not every consideration sub-field applies to every idea; use only the ones that are actually relevant, but consider all of them before deciding which apply.

- **ID:** `IDEA-XXX`, zero-padded, sequential, permanent once assigned (never reused, even if the idea is declined).
- **Title:** short, stable. Other PSS documents (including the roadmap) may reference ideas by title, so avoid renaming a title once it is referenced elsewhere; add a note instead.
- **Date added:**
- **Source:** where the idea came from (a document, a conversation, a QA note, an owner observation, a tester comment).
- **User or stakeholder:** whose need this serves or who raised it.
- **Original feedback or observation:** verbatim where available, in quotes, with its source cited. If exact wording is not available, write "Paraphrase:" before the text and say so explicitly. Never invent a quote.
- **Underlying problem:** the difficulty, not the fix.
- **Intended user:** who benefits.
- **Desired outcome:** what "better" looks like from the user's side.
- **Idea or possible solution:** one or more candidate shapes for a fix. Not a commitment.
- **Mission and differentiation fit:** how this connects to feeling calm, sincere, private, and trustworthy, and to the product's differentiation from conventional social apps and from adjacent prayer apps.
- **Evidence supporting it:** what actually points this direction, with a source.
- **Evidence against it or uncertainty:** what is unknown, unproven, or cuts the other way. State this honestly even when it is thin ("no evidence gathered yet" is a valid, honest answer).
- **Considerations:** use only the sub-fields that apply.
  - Privacy
  - Safety / moderation
  - Emotional impact
  - Accessibility
  - Legal
  - Technical
- **Dependencies:** other ideas, decisions, or infrastructure this needs first.
- **Rough effort or complexity:** only when reasonably knowable from evidence on hand. Otherwise write "Not yet knowable."
- **Validation method:** how this would actually be tested before being trusted (survey question, interview probe, usage data once analytics exist, a small experiment).
- **Success signal:** what result would count as validation.
- **Status:** one of the values in Section 2.
- **Disposition:** a one-line plain-language statement of where this stands and what happens next.
- **Related roadmap item:** the horizon name and exact outcome/problem title on `product-roadmap.md` this idea is expected to map to, if any. Left blank if no roadmap mapping exists yet.
- **Decision history:** a dated, appended log of status changes and why. Never overwritten.

## 2. Status values

`Inbox` -> `Needs clarification` -> `Researching` -> `Testing` -> `Evidence supported` -> `Promoted to roadmap` -> `Delivered`

An idea can also land in `Parked` (deliberately set aside, not declined) or `Declined` (considered and rejected, kept for the record) from any point in that path.

- **Inbox:** captured, not yet examined.
- **Needs clarification:** the idea or the problem it solves is not yet specific enough to evaluate.
- **Researching:** actively being examined against evidence, mission fit, and considerations.
- **Testing:** a validation method is running (a survey question, a small experiment, a usability probe).
- **Evidence supported:** validation produced a real, positive signal, but the idea has not yet been reviewed for a roadmap commitment.
- **Parked:** deliberately set aside for now, with a stated reason; not declined.
- **Declined:** considered and rejected, with a stated reason; kept for institutional memory, never deleted.
- **Promoted to roadmap:** the owner has approved moving this to a horizon on `product-roadmap.md`. Only the owner (or an agent acting on explicit owner approval, recorded in the decision history) can set this status.
- **Delivered:** built, shipped, and verified.

---

## 3. Idea records

### IDEA-001: Answered-prayer updates and testimony

- **Date added:** 2026-08-31
- **Source:** Product conversation with the owner; consistent in spirit with the existing "Praise / Answered Prayer" category already defined in `docs/product-requirements.md` Section 8 (Prayer Request Creation) and Section 11 (`prayerRequests.category`).
- **User or stakeholder:** The person who created the original prayer request (requester).
- **Original feedback or observation:** Paraphrase (owner conversation, not a verbatim quote, no date recorded in the repo): the requester should be able to later mark a request answered and share an update or testimony with the people who prayed for it.
- **Underlying problem:** Right now a request that gets answered simply sits in the feed indistinguishable from one that never resolved. There is no way for a requester to close the loop with the people who prayed, and no way for prayer partners to witness what happened after they prayed.
- **Intended user:** Requesters who want to share what happened, and the prayer partners who prayed and might want to know.
- **Desired outcome:** The emotional value is not "task completion" (a checkbox, a done state) but the chance for prayer partners to witness, celebrate, and testify alongside the requester. Framed correctly, this deepens the sense that prayer was real and mattered, not that it was a to-do list item resolved.
- **Idea or possible solution:** A requester-initiated update on their own request: mark it answered (or "update," to also allow partial or in-progress updates) and optionally add testimony text, visible to some defined audience of prayer partners.
- **Mission and differentiation fit:** Potentially a strong differentiator (a conventional social app has nothing like sincere testimony-sharing), but only if built with real care. This is exactly the kind of feature that could either deepen trust or, if handled carelessly, feel like manufactured engagement or spiritual pressure. High upside, high sensitivity.
- **Evidence supporting it:** The product already models a "praise / answered prayer" category in the data and requirements, which suggests the underlying need (closure, celebration) was anticipated from the start. No direct tester or user evidence exists yet; the evidence review confirms no aggregated tester feedback log exists in the repo.
- **Evidence against it or uncertainty:** Unvalidated. No survey question, tester interview, or usage data currently probes whether people actually want to share an answered-prayer update, at what rate, or in what form. Whether requesters would actually use it, whether prayer partners would value receiving it, and what audience/privacy model people expect are all open.
- **Considerations:**
  - Privacy / audience: who receives the update. Everyone who prayed? Only some? Can the requester choose? Does an anonymous original request stay anonymous in the update?
  - Emotional impact (flagged explicitly, do not skip): this is genuinely sensitive territory. Prayers are not always answered the way someone hoped, and some are never resolved, or resolve into grief. Copy and product mechanics must never imply a guaranteed outcome from prayer, must never treat an unanswered or painfully-resolved prayer as a failure state, and must give a graceful, honest way to express an ongoing, changed, or painful outcome, not just "answered: yes/no." Handle this with real care; do not write mechanics or copy that could read as promising divine outcomes or minimizing grief.
  - Moderation: testimony text is user-generated content and needs the same reporting/moderation posture as a prayer request.
  - Notifications: an update likely triggers a notification to prayer partners (see IDEA-002), which inherits all of that idea's opt-in and non-manipulative design considerations.
  - Differentiation: worth evaluating explicitly against the mission (see Mission and differentiation fit above) once a concrete design exists.
- **Dependencies:** IDEA-002 (closing the loop for prayer partners) for the notification/visibility side; likely also depends on some notification infrastructure existing at all (see IDEA-003 and IDEA-004).
- **Rough effort or complexity:** Not yet knowable. No design or technical scoping exists yet, and the emotional/product design work (getting the framing right) is likely the harder part, not the engineering.
- **Validation method:** A specific, non-leading beta survey or interview question (extending `docs/beta-feedback-plan.md` Section 7) asking whether testers would want to share what happened with a request, and separately whether they would want to know what happened with a request they prayed for. Qualitative interview probing for the language people use unprompted.
- **Success signal:** A clear, repeated pattern (not one voice) across multiple testers expressing genuine desire for this, with language that confirms the "witness and celebrate" framing rather than a "close the ticket" framing.
- **Status:** Needs clarification / Researching (promising but unvalidated; needs a sharper problem statement and a validation pass before it is evidence supported).
- **Disposition:** Worth researching further through the beta feedback mechanism once that mechanism is operational (see IDEA-008). Not ready for design work until the audience/privacy model and grief-sensitive framing are thought through, ideally with input beyond the owner alone.
- **Related roadmap item:** Later or Exploring horizon, expected outcome/problem title "Let people witness answered prayer, not just log it" (exact title subject to how the roadmap sub-agent frames it; cross-check against `product-roadmap.md`).
- **Decision history:**
  - 2026-08-31: Idea captured and drafted into full record from owner conversation. No prior status.

---

### IDEA-002: Closing the prayer loop for prayer partners

- **Date added:** 2026-08-31
- **Source:** Product conversation with the owner, as the counterpart to IDEA-001.
- **User or stakeholder:** People who prayed for a request ("prayer partners"), not the requester.
- **Original feedback or observation:** Paraphrase (owner conversation, no verbatim quote recorded): prayer partners should have some way to learn that a request they prayed for was later answered or updated. This is distinct from IDEA-001, which is about the requester's action of sharing; this idea is about what the partner experiences afterward.
- **Underlying problem:** Today, once someone taps "I prayed for this," they have no way to ever learn what happened next unless they happen to revisit that specific request. The loop is entirely one-directional and terminates immediately.
- **Intended user:** Anyone who prayed for a request and would value knowing the outcome.
- **Desired outcome:** A prayer partner feels that their act of prayer connected to something real and ongoing, not a one-time tap into a void. This should reinforce sincerity and calm, not create a reason to check the app compulsively.
- **Idea or possible solution:** Some combination of: a notification when a request a person prayed for is updated or marked answered (see IDEA-004, which is the general case of this), and/or a visible marker in the person's own "prayed for" history showing which of those requests have since been updated.
- **Mission and differentiation fit:** Directly supports "know people prayed for them" from the other direction (know that your prayer mattered). Needs the same care as IDEA-001 to avoid becoming an engagement mechanic.
- **Evidence supporting it:** None gathered yet specific to this idea. It is the natural complement to IDEA-001 and to the existing "praise / answered prayer" category, but has not itself been raised by a tester or validated.
- **Evidence against it or uncertainty:** Fully unvalidated. Depends entirely on IDEA-001 existing in some form (there must be an update to surface) and on the notification infrastructure in IDEA-003/IDEA-004.
- **Considerations:**
  - Privacy: must respect whatever audience the requester chose in IDEA-001; a prayer partner should not be able to see an update the requester restricted.
  - Emotional impact: same grief-sensitive framing concerns as IDEA-001 apply on the receiving side; a notification about a request that resolved painfully needs equally careful language.
  - Notification design: must follow the opt-in, low-frequency, non-manipulative guardrails described in IDEA-003 through IDEA-005.
  - Technical: depends on tracking a durable relationship between a user and the requests they prayed for over time, which the `prayerInteractions` collection already supports as a data source per `docs/product-requirements.md` Section 11.
- **Dependencies:** IDEA-001 (there must be something to surface); IDEA-003 and IDEA-004 (notification infrastructure).
- **Rough effort or complexity:** Not yet knowable.
- **Validation method:** Beta survey/interview question asking whether knowing a prayed-for request was later answered would feel meaningful, and at what frequency or form they would want to learn it.
- **Success signal:** Repeated, unprompted interest across multiple testers, without language suggesting they would want a running feed or tally (which would cut against the calm, non-social-media mission).
- **Status:** Needs clarification.
- **Disposition:** Track alongside IDEA-001; do not design in isolation from it.
- **Related roadmap item:** Later or Exploring horizon, likely paired with IDEA-001's outcome title on `product-roadmap.md`.
- **Decision history:**
  - 2026-08-31: Idea captured and drafted into full record from owner conversation. No prior status.

---

### IDEA-003: Notifications when someone prays for your request

- **Date added:** 2026-08-31
- **Source:** `docs/beta-feedback-plan.md` Section 7 ("A future feature" probe: "Would a notification when someone prays for your request feel helpful or intrusive?") and `docs/workflows.md` (push notifications recorded as "a documented future post-MVP phase").
- **User or stakeholder:** Requesters, who want to know their request was seen and prayed over.
- **Original feedback or observation:** Verbatim from `docs/beta-feedback-plan.md` Section 7: "Would a notification when someone prays for your request feel helpful or intrusive?" This is a planned beta survey question, not yet an actual tester response; no tester has answered it in the repo.
- **Underlying problem:** A requester currently has no signal, beyond manually revisiting the app and checking the count, that anyone prayed for their request.
- **Intended user:** Requesters.
- **Desired outcome:** A requester feels supported and seen without feeling nudged back into the app.
- **Idea or possible solution:** An opt-in notification, likely batched or throttled rather than one-per-prayer, informing a requester that someone prayed for their request.
- **Mission and differentiation fit:** High risk of drifting toward social-media mechanics (a "like" notification) if built without care. Must read as sincere acknowledgment, not a dopamine ping.
- **Evidence supporting it:** The idea already exists as a planned, non-leading beta survey question, which suggests the team anticipated real interest without presupposing an answer. `docs/product-requirements.md` Section 6 (Out of Scope for MVP) and `docs/workflows.md` both explicitly defer push notifications as a documented future post-MVP phase, meaning this was a deliberate, not accidental, exclusion.
- **Evidence against it or uncertainty:** No actual tester response exists in the repo yet (the survey/interview mechanism itself is still placeholder-only per the evidence review, Section 6). Desirability is unmeasured.
- **Considerations:**
  - Privacy: a notification must not reveal who prayed (aggregate-only design is already a hard requirement per `docs/product-requirements.md` Section 8, "Aggregate-only to other users"); the notification content must respect that.
  - Emotional impact / engagement-manipulation guardrail: opt-in required, user-controllable, low-frequency. Must not create emotional pressure or engagement-manipulation patterns: no streaks, no guilt-based copy, no red badges designed to compel opens.
  - Technical: requires push notification infrastructure that does not currently exist (no Cloud Messaging is initialized anywhere in the app per the evidence review, Section 2).
- **Dependencies:** General push notification infrastructure (shared with IDEA-004 and IDEA-005); likely a single underlying build rather than three separate builds.
- **Rough effort or complexity:** Not yet knowable (no push infrastructure exists at all yet, so even a rough estimate would be speculative).
- **Validation method:** Run the existing planned survey question from `docs/beta-feedback-plan.md` Section 7 once the beta feedback mechanism is operational (see IDEA-008).
- **Success signal:** A clear majority preference for "helpful" over "intrusive," and interview language that does not describe it in social-media terms (likes, notifications-as-validation).
- **Status:** Inbox / Needs clarification (question is designed, mechanism to ask it is not operational yet).
- **Disposition:** Wait for the beta feedback mechanism (IDEA-008) to become operational before spending more design effort here.
- **Related roadmap item:** Next or Later horizon, expected outcome/problem title "Let requesters know their request was prayed for, without it feeling like a like."
- **Decision history:**
  - 2026-08-31: Idea captured from an existing planned survey question and the PRD's deliberate MVP deferral. No prior status.

---

### IDEA-004: Notifications for prayer updates or answered prayers

- **Date added:** 2026-08-31
- **Source:** Derived from IDEA-001/IDEA-002 and the general push-notification deferral in `docs/product-requirements.md` Section 6 and `docs/workflows.md`.
- **User or stakeholder:** Prayer partners who prayed for a request that is later updated or marked answered.
- **Original feedback or observation:** Paraphrase (no verbatim tester quote exists): prayer partners should be notified when a request they prayed for is updated or answered. This is the notification mechanism that would carry IDEA-002.
- **Underlying problem:** Same as IDEA-002: no way for a prayer partner to learn what happened after they prayed, without a notification channel this idea provides the delivery mechanism for.
- **Intended user:** Prayer partners.
- **Desired outcome:** A meaningful, occasional signal that a prayer mattered, not a running feed of activity.
- **Idea or possible solution:** An opt-in notification tied to IDEA-001's update mechanism, sent to people who prayed for that specific request.
- **Mission and differentiation fit:** Same sensitivity as IDEA-001 and IDEA-002; the notification copy itself carries the grief-sensitive framing risk described there.
- **Evidence supporting it:** Logical complement to IDEA-001/IDEA-002 and to the deliberate post-MVP push-notification deferral; no direct tester evidence.
- **Evidence against it or uncertainty:** Fully unvalidated; depends on IDEA-001 shipping in some form first.
- **Considerations:**
  - Privacy: same audience-respecting rule as IDEA-002.
  - Emotional impact: notification copy for a painfully-resolved or ongoing prayer needs the same care as IDEA-001's in-app copy; a badge or push alert is a worse place to get grief-sensitive framing wrong than an in-app screen, because it arrives unbidden.
  - Opt-in required, user-controllable, low-frequency: must not create emotional pressure or engagement-manipulation patterns. No streaks, no guilt-based copy, no red badges designed to compel opens.
  - Technical: shares infrastructure with IDEA-003 and IDEA-005.
- **Dependencies:** IDEA-001, IDEA-002, general push infrastructure.
- **Rough effort or complexity:** Not yet knowable.
- **Validation method:** Same beta mechanism as IDEA-001/IDEA-002.
- **Success signal:** Same as IDEA-002.
- **Status:** Inbox / Needs clarification.
- **Disposition:** Sequenced behind IDEA-001 and IDEA-002; do not build the notification before the underlying update feature has a validated shape.
- **Related roadmap item:** Paired with IDEA-001/IDEA-002's roadmap mapping.
- **Decision history:**
  - 2026-08-31: Idea captured. No prior status.

---

### IDEA-005: Optional prayer reminders

- **Date added:** 2026-08-31
- **Source:** Owner conversation; general category of post-MVP notification work referenced in `docs/product-requirements.md` Section 6 and `docs/workflows.md`.
- **User or stakeholder:** Any user who wants a gentle nudge to open the app and pray or check in.
- **Original feedback or observation:** Paraphrase (no verbatim source): some users might want an optional, gentle reminder to come back and pray, distinct from any notification tied to a specific request's activity.
- **Underlying problem:** A user who wants to build a habit of praying through the app currently has no supported way to be reminded; they must remember on their own.
- **Intended user:** Users who want a devotional rhythm and would welcome a gentle nudge.
- **Desired outcome:** A calm, optional reminder that supports a devotional habit without ever feeling like an engagement hook.
- **Idea or possible solution:** An opt-in, user-configurable reminder (e.g., a daily or weekly time the user chooses), most likely tied to the existing Verse of the Day feature rather than to any social/interaction signal.
- **Mission and differentiation fit:** Lowest-risk of the notification ideas in this backlog precisely because it need not reference any other user's activity at all; still must be handled carefully so it never reads as a growth/retention mechanic.
- **Evidence supporting it:** None gathered from testers yet. Consistent with the deliberate, documented post-MVP deferral of all push notifications.
- **Evidence against it or uncertainty:** Fully unvalidated; desirability, frequency preference, and framing are all open questions.
- **Considerations:**
  - Opt-in required, user-controllable, low-frequency: must not create emotional pressure or engagement-manipulation patterns. No streaks, no guilt-based copy, no red badges designed to compel opens.
  - Technical: shares push infrastructure with IDEA-003 and IDEA-004.
- **Dependencies:** General push notification infrastructure.
- **Rough effort or complexity:** Not yet knowable.
- **Validation method:** Beta survey/interview question on whether an optional reminder would feel welcome, and at what frequency.
- **Success signal:** Clear preference for opt-in, low-frequency framing; no pattern of testers wanting streaks or daily-open pressure.
- **Status:** Inbox.
- **Disposition:** Lowest priority of the three notification ideas to research first, since it does not depend on IDEA-001/IDEA-002 shipping.
- **Related roadmap item:** Not yet mapped.
- **Decision history:**
  - 2026-08-31: Idea captured. No prior status.

---

### IDEA-006: Privacy-conscious behavioral analytics

- **Date added:** 2026-08-31
- **Source:** `docs/reviews/2026-08-31-product-state-evidence-review.md` Sections 2 and 6 (confirmed total absence of any analytics SDK); `docs/product-requirements.md` Section 12 (planned analytics event taxonomy, never implemented).
- **User or stakeholder:** The product team (the owner), who currently has no usage evidence to prioritize with; indirectly, users, whose trust depends on how any future analytics is scoped.
- **Original feedback or observation:** Not a user-sourced idea; an evidence gap identified in the review. Quoting the evidence review directly: "Behavioral analytics gap is confirmed: no analytics SDK is initialized anywhere in the app... this was a deliberate, documented deferral, not an oversight... No usage or behavioral data source exists for this product today."
- **Underlying problem:** Every roadmap and idea-prioritization decision today relies entirely on manual QA notes, the owner's own use, and small amounts of informal tester feedback. There is no usage-based evidence source at all.
- **Intended user:** The product team's own decision-making process, ultimately serving users through better-prioritized product decisions.
- **Desired outcome:** Enough lightweight usage signal to know which parts of the product are actually used and how, without collecting anything that would compromise the trust the product depends on.
- **Idea or possible solution:** A minimal, privacy-conscious analytics implementation (for example, screen views, button taps on non-sensitive actions, aggregate feature usage) that stops well short of anything content-related.
- **Mission and differentiation fit:** Directly in tension with the calm, private, trustworthy positioning if done carelessly; done carefully, it is table stakes for basically any product and does not have to conflict with the mission.
- **Evidence supporting it:** The evidence review's own framing of this as "the current total absence of any analytics" being "the evidence gap driving this idea." The PRD already planned an analytics event taxonomy (Section 12: `account_created`, `prayer_request_submitted`, `prayed_button_tapped`, etc., all structural/behavioral events with no content payloads) that was never implemented, indicating this was already thought through once at a design level.
- **Evidence against it or uncertainty:** No urgency signal exists yet (the product has not needed usage data to make its decisions so far, per the evidence review); implementing analytics is itself a scope and trust decision that has not been brought to the owner.
- **Considerations:**
  - Privacy (critical, explicit): analytics must never collect prayer text, sensitive prayer content, private profile data, or other unnecessary personal information. Any implementation must be scoped to structural/behavioral events only (what screen, what button, not what content).
  - Legal: analytics collection needs to be reflected accurately in the privacy policy and the Google Data Safety / App Privacy worksheets referenced in the evidence review, which currently describe zero analytics collection.
  - Technical: no analytics SDK currently exists in the app at all; this is a from-scratch integration, not an extension of something already partially wired up.
- **Dependencies:** A privacy-policy and data-safety-worksheet update before or alongside implementation; likely also depends on the naming/positioning decision (IDEA-007) settling first, since privacy disclosures should describe the final product identity.
- **Rough effort or complexity:** Not yet knowable (no scoping has happened for which SDK, which events, or which platform-side disclosure updates would be required).
- **Validation method:** Not a user-validation question in the usual sense; validation here is really a scoping and privacy-review exercise with the owner (and, given the product's sensitivity, ideally an explicit legal/privacy pass) before any implementation begins.
- **Success signal:** A scoped, owner-approved event list that a privacy-conscious reviewer would sign off on, with corresponding privacy-policy and data-safety-worksheet updates drafted before any SDK is added.
- **Status:** Needs clarification / Researching.
- **Disposition:** Worth scoping deliberately, given how directly it affects every other prioritization decision in this backlog, but must not be rushed given the product's privacy-sensitive positioning.
- **Related roadmap item:** Next or Later horizon, expected outcome/problem title "Give the team real usage evidence without touching prayer content."
- **Decision history:**
  - 2026-08-31: Idea captured from the evidence review's explicit finding. No prior status.

---

### IDEA-007: Permanent product naming and positioning

- **Date added:** 2026-08-31
- **Source:** `docs/reviews/2026-08-31-product-state-evidence-review.md` Sections 3, 5, 7, 8, and 9 (naming collision, live discrepancy between "Praying For You" and "Praying For You Community" across all repo artifacts); `Playbooks/Product_Lifecycle/Competitive_Discovery_and_Differentiation_Workflow.md`.
- **User or stakeholder:** The owner (naming decision-maker); indirectly all future users and the store review process.
- **Original feedback or observation:** Not a user-sourced idea; a factual finding from the evidence review. Quoting it directly: "Store-facing product name in every repository artifact inspected through 2026-08-29 is 'Praying For You,' not 'Praying For You Community.' No file anywhere in the repository uses the string 'Praying For You Community.'"
- **Underlying problem:** The product reached beta distribution under the name "Praying For You" before discovering a naming collision with an existing iOS app serving an adjacent prayer-management need. A new PSS competitive-discovery process now exists in response, but it has not yet been applied to this product: no completed Competitive Landscape and Differentiation Brief or Pre-Beta Competitive Refresh exists for this product per the evidence review.
- **Intended user:** Indirectly every future user (a confusing or colliding name undermines discoverability and trust); directly the owner, who needs a defensible naming decision before further store production work.
- **Desired outcome:** A settled, cleared, consistently-applied product name and positioning that the owner can commit to across app.json, EAS/store configuration, approved store copy, approved store assets, and QA checks, none of which currently reflect "Praying For You Community."
- **Idea or possible solution:** Run the existing Competitive Discovery and Differentiation Workflow (Phase 3, naming and identity checks) formally for this product, using the Competitive Landscape and Differentiation Brief Template, to either clear "Praying For You Community," clear a different name, or identify the smallest necessary response to the known collision.
- **Mission and differentiation fit:** Directly load-bearing. The name is part of how the product signals it is not a conventional social/engagement app; getting the collision-check and the differentiation statement right protects that positioning.
- **Evidence supporting it:** The workflow document's own "Learned origin" section states plainly that this practice exists because of this exact product's collision. The evidence review independently confirms (Section 9) that no completed brief exists yet for this product, meaning the process the studio built for exactly this situation has not yet been applied to the situation that caused it.
- **Evidence against it or uncertainty:** It is unresolved in the repo whether "Praying For You Community" is even the name being pursued, or whether it remains a considered-but-unimplemented option (evidence review Section 9). A preliminary trademark search, even once done, is not legal clearance; it is an early collision screen only, per the workflow's own framing.
- **Considerations:**
  - Legal: must pass app-store, web, domain, social-handle, confusing-similarity, and preliminary-trademark screens per the existing workflow. A preliminary trademark search is explicitly not legal clearance and should not be represented as such to the owner or in any store submission material.
  - Technical: a name change, if it happens, touches app.json, EAS/store bundle identifiers, approved store copy, approved store assets, and QA "product name" checks (per the evidence review, Section 7), which is nontrivial coordinated work, not a text change in one place.
  - Process: the current, live discrepancy is that store artifacts still say "Praying For You," not "Praying For You Community," as of the most recent file activity in the repo. This is the single most visible unresolved item in the current product state and should not be allowed to drift further without an owner decision.
- **Dependencies:** None technical; this is gated entirely on running the existing workflow and getting an owner decision, not on other product work.
- **Rough effort or complexity:** Not yet knowable for the eventual propagation work (depends on the outcome of the naming decision), but the discovery/brief step itself is a single focused working session per the workflow's own design ("This workflow is intentionally lightweight... a single working session," borrowing the Beta Readiness Framework's own stated intent for a comparable review).
- **Validation method:** Complete a Competitive Landscape and Differentiation Brief and the naming/identity collision check (Phase 3 of the workflow) for "Praying For You Community" and any other candidate name under consideration.
- **Success signal:** A completed, owner-reviewed brief with a naming recommendation (Proceed / Revise / Escalate for legal review) and, ultimately, an owner decision recorded in the brief's Concept Validation Gate.
- **Status:** Promoted to roadmap. Owner decided on 2026-09-01: the product's permanent name is "Prayer Table," following four rounds of screening and a deep check (see `docs/naming-and-competitive-discovery-brief.md`).
- **Disposition:** Decided, propagation underway. Group 3 of `docs/naming-decision-and-propagation-audit.md` (the `app.json` display name and six in-app source-code text spots) was executed 2026-09-01. Group 4 (store materials) and Group 5 (documentation) have not yet been executed.
- **Related roadmap item:** Now horizon, "App naming, positioning, and competitive differentiation."
- **Decision history:**
  - 2026-08-31: Idea captured directly from the evidence review's findings. No prior status.
  - 2026-09-01: Owner chose to prioritize this idea ahead of others in the backlog. Owner selected four candidate names for screening. First-pass naming and identity collision check completed the same day; three candidates found to collide, one ("Prayer Together") survived with caveats. Status remains Researching pending the owner's next decision.
  - 2026-09-01 (later same day): Owner did not favor "Prayer Together," asked for "Praying Together" to be screened instead, and requested a second round of candidates. "Praying Together" also cleared the exact-match check (no hard collision found, domain check inconclusive rather than confirmed clear). A second round of 14 candidates was drafted, avoiding "prayer," "pray," "circle," and "together," not yet screened. See `docs/naming-and-competitive-discovery-brief.md`.
  - 2026-09-01 (third pass): Owner rejected the entire second round as too abstract and not spiritual enough, asked for "prayer" to be reintroduced. A third round of "Prayer + [word]" candidates was drafted and the owner ranked nine of them. The top four were screened: "Prayer Table" (owner's #1 pick) cleared with no collision found anywhere and the best domain signal of any candidate screened, "Prayer Hearth" carries a moderate risk (an established adjacent app brand called "Hearth"), "Prayer Vigil" carries a moderate risk (a live plural-variant app, "Prayer Vigils"), and "Prayer Watch" is a hard collision (multiple live products). Status remains Researching; "Prayer Table" is the strongest candidate found to date and is ready for a formal trademark search and direct social-handle check.
  - 2026-09-01 (deep check): Owner asked for a deeper check on "Prayer Table" before locking it in. Trademark-database search, four alternate domain variants, and social handles found no collision. Also surfaced that "prayer table" is an existing, real devotional practice in Catholic and other Christian traditions (a home or classroom prayer space), which grounds the name culturally rather than weakening it. Owner proposed the product's core story as "leave and pick up prayers from the Prayer Table," people leave a request, others pick one up to pray for it, mapping directly onto the existing shared-feed and "I prayed for this" mechanic. Still open: formal TESS/attorney trademark search, direct logged-in social-handle check, domain strategy decision.
  - 2026-09-01 (decided): Owner locked in "Prayer Table" as the permanent name. Status moves to Promoted to roadmap for the naming decision itself; propagation across the app, store materials, and documentation is tracked separately in `docs/naming-decision-and-propagation-audit.md` and has not been executed.
  - 2026-09-01 (propagation, Group 3): Owner approved executing the in-app text change now, while still in beta with a small user set, rather than waiting. Changed `app.json` display name and six in-app source-code text spots from "Praying For You" to "Prayer Table." Verified no unintended files changed and `tsc --noEmit` passes clean. Not yet committed to git; committing, Group 4 (store assets and copy), and Group 5 (documentation) remain open.

---

### IDEA-008: Operationalize the beta feedback survey and interview mechanism

- **Date added:** 2026-08-31
- **Source:** `docs/reviews/2026-08-31-product-state-evidence-review.md` Section 6; `docs/beta-feedback-plan.md` Sections 13 and the closing "Suggested tester follow-up message" note.
- **User or stakeholder:** The product team (the owner), who needs real feedback to prioritize; indirectly, beta testers, who are currently told a survey/call link exists that does not yet function.
- **Original feedback or observation:** Not user-sourced; a process gap identified in the evidence review. Quoting `docs/beta-feedback-plan.md` directly: "Links are placeholders to fill in at beta time. No real URLs are stored in this repo." The evidence review confirms: "the beta-feedback survey/interview mechanism is designed but not operational (placeholder links only)."
- **Underlying problem:** A full, well-designed feedback plan exists (survey questions, interview questions, themes, prioritization criteria), but the actual mechanism to collect it, a real survey tool and a real scheduling link, does not exist yet. Every "tester feedback" reference elsewhere in the repo is secondhand and owner-summarized, not a raw feedback artifact.
- **Intended user:** The product team's decision-making process, and honest treatment of the testers being asked for feedback.
- **Desired outcome:** A working, real survey link and scheduling link that testers can actually use, feeding an aggregated feedback log instead of only informal, unlogged conversations.
- **Idea or possible solution:** Stand up a real survey tool (form) and scheduling link using the questions already drafted in `docs/beta-feedback-plan.md` Section 7, and start an aggregated feedback log organized by the themes already defined in Section 14 of that plan.
- **Mission and differentiation fit:** Not itself a product feature; a process/operations item that improves the quality and honesty of every other prioritization decision, including several ideas in this backlog (IDEA-001 through IDEA-005 all depend on this mechanism to validate).
- **Evidence supporting it:** Directly confirmed as a gap by both the plan document itself and the evidence review. The plan and its questions are otherwise complete and ready to use.
- **Evidence against it or uncertainty:** None; this is a confirmed, unambiguous gap, not a speculative idea.
- **Considerations:**
  - Privacy: any survey tool chosen should not require testers to disclose more than necessary, and responses containing sensitive personal disclosures (per the plan's own emotional/trust questions) should be handled with the same care as prayer content.
  - Technical: standing up a form and scheduling link is lightweight, low-complexity work relative to most items in this backlog.
- **Dependencies:** None; this can proceed independently of naming (IDEA-007) or analytics (IDEA-006), though it is more valuable once wider beta recruitment (still unconfirmed per the evidence review) is underway.
- **Rough effort or complexity:** Low (standing up an external form tool and a scheduling link is a small, well-scoped task; the harder design work, the questions and themes, is already done).
- **Validation method:** Not applicable in the usual sense; this idea's own "validation" is simply whether it gets built and used.
- **Success signal:** A real survey link and scheduling link exist, at least one tester response has been collected through them, and a first aggregated feedback log entry exists.
- **Status:** Needs clarification (specifically: whose responsibility this is to stand up, and what tool to use, are not yet decided).
- **Disposition:** High practical leverage relative to its low cost; several other ideas in this backlog cannot be properly validated until this exists.
- **Related roadmap item:** Now horizon, expected outcome/problem title "Make the beta feedback loop actually collect feedback."
- **Decision history:**
  - 2026-08-31: Idea captured from the evidence review and the beta feedback plan's own stated gap. No prior status.

---

### IDEA-009: Support email and support webpage

- **Date added:** 2026-08-31
- **Source:** `docs/reviews/2026-08-31-product-state-evidence-review.md` Section 4 (open questions) and Section 8 (decisions requiring owner confirmation).
- **User or stakeholder:** Any user who needs help, has a problem, or wants to reach the product team; also a store-review requirement.
- **Original feedback or observation:** Not user-sourced; an operational gap identified in the evidence review. Quoted directly from Section 4: "Support email / support webpage stand-up (currently placeholder-only)."
- **Underlying problem:** There is currently no working support channel a user (or a store reviewer) can actually reach.
- **Intended user:** Users needing help; App Store / Google Play reviewers who expect a working support contact as part of listing requirements.
- **Desired outcome:** A real, monitored support email and a minimal support webpage exist before wider distribution.
- **Idea or possible solution:** Stand up a real support email address and a simple support/contact webpage (even a single static page), and confirm someone (see IDEA-011) is actually monitoring it.
- **Mission and differentiation fit:** Table-stakes operational trust signal; a placeholder support link undermines the "trustworthy" part of the product's positioning if a user ever tries to use it.
- **Evidence supporting it:** Directly confirmed as an unresolved open question and an owner-confirmation item in the evidence review.
- **Evidence against it or uncertainty:** None; this is a confirmed gap.
- **Considerations:**
  - Legal: both Apple and Google's UGC/store-review requirements expect a working support contact (referenced generally in `docs/product-requirements.md` Section 10, App Store and Google Play UGC Compliance).
  - Operations: tightly linked to IDEA-011 (moderation backup); a support channel that nobody monitors is not meaningfully different from no support channel.
- **Dependencies:** IDEA-011 (someone needs to actually own responding).
- **Rough effort or complexity:** Low (a support email and a minimal static page are small, well-understood tasks).
- **Validation method:** Not applicable; this is a confirmed gap to close, not a hypothesis to test.
- **Success signal:** A real support email and support webpage exist, are linked from the app and store listings, and route to someone who actually reads them.
- **Status:** Inbox.
- **Disposition:** Should be closed before wider external distribution; low effort, meaningful trust and compliance value.
- **Related roadmap item:** Now horizon, expected outcome/problem title "Stand up a real support channel before wider distribution."
- **Decision history:**
  - 2026-08-31: Idea captured from the evidence review's open-questions list. No prior status.

---

### IDEA-010: Terms-acceptance hardening (server-side enforcement)

- **Date added:** 2026-08-31
- **Source:** `docs/reviews/2026-08-31-product-state-evidence-review.md` Section 2 and Section 7.
- **User or stakeholder:** The product team, for legal/compliance defensibility; indirectly all users, whose acceptance of terms should be reliably recorded.
- **Original feedback or observation:** Not user-sourced; a technical/legal gap identified in the evidence review. Quoted directly: "Terms acceptance is enforced client-side only." And from Section 7: "Terms acceptance is enforced client-side only," listed as a named risk.
- **Underlying problem:** Because terms-acceptance is enforced only on the client, there is no guarantee (and no server-side record) that a given account actually accepted terms; a client could theoretically be bypassed.
- **Intended user:** The product team, for legal defensibility; the product's overall trust posture.
- **Desired outcome:** Terms acceptance is verifiable and enforced independently of the client, matching the pattern already used for other trust-critical rules (for example, Firestore already independently enforces ownership and duplicate-prevention rules per `docs/product-requirements.md` Section 14).
- **Idea or possible solution:** Extend Firestore security rules and/or a Cloud Function to independently verify and record terms acceptance, so it is not solely a client-side gate. This is close to an already-scoped engineering/QA task (see `docs/QA_terms_acceptance_scenarios.md`) more than a fresh idea, but is included here honestly since the evidence review lists it as a deferred hardening item rather than a resolved one.
- **Mission and differentiation fit:** Not user-facing; a trust and legal-defensibility item rather than a differentiation lever.
- **Evidence supporting it:** Directly confirmed as a named, documented deferred hardening item in the evidence review.
- **Evidence against it or uncertainty:** None on whether the gap exists; open question is only sequencing (when this gets prioritized against other pre-launch work).
- **Considerations:**
  - Legal: terms acceptance is the kind of control that matters most in the event of a dispute or an audit, precisely when it is least useful to discover it was only client-side.
  - Technical: pattern already exists elsewhere in the security rules (ownership checks, duplicate-interaction prevention), so this is likely additive to an existing rules file rather than a new architecture.
- **Dependencies:** None blocking; independent of naming or notification work.
- **Rough effort or complexity:** Likely low to moderate (extends existing Firestore rules patterns), but not yet formally scoped as an estimate.
- **Validation method:** Not applicable; this is a defensibility gap to close, not a hypothesis to test.
- **Success signal:** Firestore rules (or an equivalent server-side check) independently verify terms acceptance, verified by an update to `docs/QA_terms_acceptance_scenarios.md`.
- **Status:** Needs clarification (specifically: whether this is scoped as a QA/engineering task outside this backlog's scope, or a product-prioritization decision; recorded here honestly either way per the instruction to include genuinely idea-shaped items even when they sit close to engineering work).
- **Disposition:** Likely more of an engineering/QA punch-list item than a product idea in the usual sense, but worth keeping visible here since the evidence review flags it as an open risk, not a closed one.
- **Related roadmap item:** Now horizon, likely folded into a broader "pre-wider-beta hardening" outcome rather than a standalone item; cross-check against `product-roadmap.md`.
- **Decision history:**
  - 2026-08-31: Idea captured from the evidence review's named risk. No prior status.

---

### IDEA-011: Moderation coverage if the owner is unavailable

- **Date added:** 2026-08-31
- **Source:** `docs/reviews/2026-08-31-product-state-evidence-review.md` Section 4; `docs/product-requirements.md` Section 16 ("Who is responsible for moderation if the developer is unavailable?").
- **User or stakeholder:** Users who report content and expect it to be reviewed; the product's trust and safety posture overall.
- **Original feedback or observation:** Verbatim from `docs/product-requirements.md` Section 16: "Who is responsible for moderation if the developer is unavailable?" Listed unresolved again in the evidence review Section 4: "Who is responsible for moderation if the owner is unavailable."
- **Underlying problem:** Moderation today is entirely manual, entirely dependent on the owner personally reviewing the Firebase console. There is no backup, no defined response-time expectation, and no coverage plan if the owner is unreachable for any period.
- **Intended user:** Anyone who files a report and expects timely, real review; anyone whose safety depends on harmful content actually being removed promptly.
- **Desired outcome:** A defined, even if lightweight, answer to "what happens to a report if the owner is unavailable for a period of time."
- **Idea or possible solution:** At minimum, a documented backup plan or a designated secondary reviewer; at a more built-out level, a simple alerting mechanism so reports do not sit unseen indefinitely.
- **Mission and differentiation fit:** Directly load-bearing for trust and safety, which is explicitly named as top priority in the beta feedback plan's own prioritization criteria ("Trust and safety issues are always top priority," `docs/beta-feedback-plan.md` Section 15).
- **Evidence supporting it:** Confirmed as an explicitly unresolved question in both the PRD (originally, from the legacy planning document) and the fresh evidence review, meaning it has been an open question for some time without resolution.
- **Evidence against it or uncertainty:** None on whether the gap exists; this is a real, acknowledged open question, not a speculative idea.
- **Considerations:**
  - Safety / moderation: this is the core of the idea; a solo-founder product has an inherent single-point-of-failure risk here that scales with user count.
  - Operations: connects directly to IDEA-009 (a support channel nobody can staff has the same underlying risk).
  - Legal: both app stores expect a functioning moderation response, not just a mechanism that exists on paper (`docs/product-requirements.md` Section 10).
- **Dependencies:** None technical; this is primarily a process/ownership decision for the owner to make, potentially involving a trusted second person.
- **Rough effort or complexity:** Not yet knowable for a built-out solution (e.g., automated alerting); the minimum viable version (a documented backup plan and a designated contact) is low effort.
- **Validation method:** Not applicable; this is a risk-coverage decision, not a hypothesis to validate with users.
- **Success signal:** A documented moderation coverage plan exists and is referenced from the relevant QA/readiness documents.
- **Status:** Inbox.
- **Disposition:** Grows more urgent as the tester base widens; worth resolving before wider beta recruitment, independent of any feature work.
- **Related roadmap item:** Now horizon, expected outcome/problem title "Define moderation coverage before wider beta recruitment."
- **Decision history:**
  - 2026-08-31: Idea captured from a long-standing open question restated in the fresh evidence review. No prior status.

---

### IDEA-012: Commit the release-environment safety net

- **Date added:** 2026-08-31
- **Source:** `docs/reviews/2026-08-31-product-state-evidence-review.md` Section 1 and Section 7.
- **User or stakeholder:** The product team, protecting against a repeat of a known incident; indirectly future beta testers, who would be affected by a broken release.
- **Original feedback or observation:** Not user-sourced; a technical/process gap identified in the evidence review. Quoted directly from Section 1: "This is the environment-variable safety net that would have caught the missing-Firebase-env-vars incident. It is not committed to git as of this review." And from Section 7: "the EAS release-environment safety net... is currently uncommitted and would not protect a build from a clean checkout or from origin until committed."
- **Underlying problem:** A validation guard exists on disk (`mobile-app/scripts/validate-release-env.mjs`, related test files, and QA-doc updates) that was specifically built in response to a real incident (env vars not copied from preview to production, causing a broken build), but it has not been committed. Anyone building from a clean checkout or from origin today would not be protected by it.
- **Intended user:** The product team, protecting release reliability; indirectly every future tester or user of a release.
- **Desired outcome:** The safety net that was already built actually protects every future build, not just the one machine it currently lives on uncommitted.
- **Idea or possible solution:** Commit the existing uncommitted work: `app.json`/`eas.json` changes, `package.json` script additions, the new validation script and its tests, and the related QA-doc "mandatory release gate" notes.
- **Mission and differentiation fit:** Not user-facing; a release-reliability item, included here because it is genuinely idea-shaped in the sense that someone needs to decide to prioritize committing it, not because it is a design idea.
- **Evidence supporting it:** Directly confirmed and dated in the evidence review; the fix already exists and was purpose-built for a real, previously-occurring incident.
- **Evidence against it or uncertainty:** None on whether the gap exists (it is a confirmed fact of the current working tree as of the review date); only open question is sequencing/priority relative to other pre-release work, and whether the new "mandatory release gate" checklist item itself has been checked off for the next release (per the evidence review, it currently has not).
- **Considerations:**
  - Technical: this is close to a pure engineering/process task (commit existing, already-written work) rather than a new idea to design, but is included here per instruction to record honestly rather than omit.
  - Process: connects to the broader pattern noted in the evidence review that several status documents are stale by their own admission and have not been reconciled; committing this work is one concrete piece of that reconciliation.
- **Dependencies:** None; the work already exists uncommitted.
- **Rough effort or complexity:** Low (the work is already written; this is a commit-and-verify task, not new development).
- **Validation method:** Not applicable; this is a confirmed gap to close.
- **Success signal:** The release-environment validation guard is committed to the working branch, and the "mandatory release gate" checklist item in `docs/QA_eas_android_standalone_scenarios.md` is checked for the next release.
- **Status:** Inbox.
- **Disposition:** Low effort, protects against a repeat of a known real incident; worth prioritizing before any further EAS builds per the evidence review's own risk framing.
- **Related roadmap item:** Now horizon, expected outcome/problem title "Commit the release-environment safety net before the next build."
- **Decision history:**
  - 2026-08-31: Idea captured from a confirmed, dated gap in the evidence review. No prior status.

---

### IDEA-013: White-label "church / organization edition" concept

- **Date added:** 2026-08-31
- **Source:** `.local/APP_DISTRIBUTION_TRACKER.md` Section 20 ("Future Opportunity: White-label / Organization Edition").
- **User or stakeholder:** Churches, ministries, faith communities, and other religious organizations that might want a branded version of the product for their own congregation or community.
- **Original feedback or observation:** Verbatim from `.local/APP_DISTRIBUTION_TRACKER.md` Section 20: "Branded versions of Praying For You for churches, ministries, faith communities, and other religious organizations across different faiths and denominations. Each organization would get its own branded prayer experience for its congregation or community, built on the same core prayer-request product." The same document explicitly labels this: "Status: idea captured for the future only. NOT required for Alpha or Beta, and intentionally NOT implemented."
- **Underlying problem:** Not a current problem; a forward-looking market/product-expansion opportunity noted separately from the core consumer product's roadmap.
- **Intended user:** Organizational administrators and moderators at churches/ministries, and their congregants/community members.
- **Desired outcome:** Not yet defined; this idea has not been developed past the concept-capture stage.
- **Idea or possible solution:** A shared multi-tenant platform or separate branded apps per organization, per the tracker's own listed open questions (tenant/data separation, organization admin roles, custom branding, organization-specific privacy and data ownership, custom domains, organization-level reporting, and app-store ownership/publishing model across many branded apps).
- **Mission and differentiation fit:** Potentially significant future differentiation and revenue opportunity, but explicitly out of scope for the current consumer-app focus; pursuing it prematurely would be a significant, deliberate multi-tenancy, billing, and privacy/data-ownership undertaking, not a simple extension.
- **Evidence supporting it:** No user or market validation exists; this is an owner-captured concept note, explicitly framed as "for the future only."
- **Evidence against it or uncertainty:** Entirely unvalidated as a market opportunity; the tracker itself frames it as a private planning note, not a commitment, and explicitly guards against starting it during Alpha or Beta.
- **Considerations:**
  - Legal: multi-tenant data ownership and organization-level privacy questions are substantial (who owns a congregation's prayer data, custom domains, organization-level admin permissions).
  - Technical: shared multi-tenant platform versus separate branded apps per organization is a major architecture decision that would need its own deliberate discovery process, likely including the Competitive Discovery and Differentiation Workflow given it would effectively be a new product category (B2B/organizational) built on the same core.
  - Business: pricing approaches listed in the tracker (setup fee plus subscription, tiers by congregation size, annual license, enterprise pricing) are all unvalidated hypotheses, not decisions.
- **Dependencies:** The core consumer product reaching a stable, validated state first; the tracker itself states this should not start during Alpha or Beta.
- **Rough effort or complexity:** Not yet knowable; the tracker's own open-questions list makes clear this is a significant undertaking, not an incremental feature.
- **Validation method:** Not applicable at this stage; this would need its own discovery process (market sizing, potential organizational customer interviews) before any design or validation-method work begins.
- **Success signal:** Not applicable at this stage.
- **Status:** Parked (explicitly future-only per the tracker; intentionally not started).
- **Disposition:** Correctly parked. Revisit only after the core consumer product is stable and validated, and treat any future move here as a deliberate, separate discovery effort, not a roadmap feature addition.
- **Related roadmap item:** Exploring horizon (if referenced at all on `product-roadmap.md`), expected outcome/problem title "Evaluate a white-label organization edition as a future business line," clearly marked as not committed.
- **Decision history:**
  - 2026-08-31: Idea captured verbatim from the existing tracker note, which itself is dated 2026-06-25 within that document. No prior status; carried forward as Parked, matching the tracker's own framing.

---

## 4. Inbox (quick capture)

Use this section for a one-line idea (title plus one sentence) without filling out the full record immediately. The lead or owner will expand a promising entry into a full record above when there is time to examine it properly. Add new rows at the bottom; do not delete a row once acted on, mark it instead.

| Date | One-line idea | Raised by | Expanded into full record? |
|---|---|---|---|
| 2026-08-31 | (example, remove once real entries exist) Consider a simple "quiet hours" setting so no notification of any kind arrives late at night. | Owner (example) | Not yet |

---

## 5. Change log for this document

- 2026-08-31: Document created. Seeded with IDEA-001 through IDEA-013, all grounded in `docs/reviews/2026-08-31-product-state-evidence-review.md` and the supporting documents cited above. No ideas promoted to roadmap status; that decision belongs to the owner, working from the parallel `product-roadmap.md` document.
- 2026-09-01: IDEA-007 (permanent product naming and positioning) promoted to roadmap. Owner decided the product's permanent name is "Prayer Table" after four rounds of screening; Group 3 propagation (in-app display text) executed the same day. Full history recorded in IDEA-007's own Decision history field. No other idea records changed.
