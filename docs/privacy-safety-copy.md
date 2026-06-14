# Privacy and Safety Copy: Praying For You

**Lenses:** Legal / Compliance Advisor (`agents/legal-compliance-advisor.md`), Product Owner, UI/UX Designer.
**Status:** planning and product copy only. No Firebase project, EAS project, code, dependencies, or secrets exist yet.

**What this is:** plain-language, product-ready copy that can later be used in the app, beta instructions, onboarding, settings, and as raw material for policy drafts.

**What this is not:** this is **not** a full legal privacy policy or terms of service. It is product copy and policy-prep language. Formal public-launch policies (privacy policy, terms of use, monetization terms) should be reviewed by a qualified attorney or appropriate legal resource before they are published.

**Tone:** calm, plain, sincere, faith-aware without being heavy-handed, not corporate, not legalistic in app-facing copy. No social-media wording.

---

## 1. Email privacy

> Your email is private. We use it so you can sign in and keep access to your account.
>
> Your email is never shown on prayer requests. It is not shown when you pray for someone. It is not shown in reports. Other people using the app cannot see it.

## 2. Anonymous posting

> You can post a prayer request as Anonymous. When you do, other people see "Anonymous" instead of your name.
>
> Even when you post anonymously, the app still privately connects the request to your account. This is what lets you edit or remove your own request, and it lets us keep everyone safe and handle reports.
>
> Anonymous means your name is hidden from other users. It does not mean the request is invisible to the app's backend or to the people who keep the app safe.

## 3. Named posting

> You can choose to show your display name on a prayer request instead of posting as Anonymous.
>
> Your email stays private either way. Only your display name is shown, never your email.
>
> You can change your display name later in Settings.

## 4. Remove request

> If you no longer want a prayer request to be shown, you can remove it. Look for "Remove request."
>
> Removing a request takes it out of the prayer feed so others no longer see it.
>
> In the future Firebase version, a removed request may be kept privately for a time for safety, support, and review reasons rather than erased instantly. It still leaves the feed right away.

*(Design note: the user-facing word is always "Remove request," never "Delete." Keep the wording calm; avoid harsh phrasing like "permanently destroy.")*

## 5. Report request

> If a prayer request feels unsafe, harmful, inappropriate, or like spam, you can report it.
>
> During this early period, reports are reviewed by a person, not automatically. Reporting helps keep this a safe and respectful space.
>
> Reporting is not about punishing anyone. It is a quiet way to flag something that may need a closer look.

## 6. Account deletion

> You can delete your account. This is offered before the app is opened to wider testing.
>
> Deleting your account removes or anonymizes your personal account information, following the app's privacy approach.
>
> The exact details of what deletion removes and what may be kept in an anonymized form will be defined and clearly stated before beta and public launch.

*(Note: "Delete" is the correct word here because this is account and data removal, which is different from the "Remove request" content control. The exact content-handling rule, anonymize authored requests vs. soft-remove them, is decided during Firebase implementation; see `firebase-mvp-plan.md` §5.)*

## 7. Beta disclaimer

> This is a beta version. Some features and behavior may still change.
>
> Because it is still being tested, please avoid posting highly sensitive personal details for now.
>
> Your feedback is welcome and genuinely helps shape the app.

## 8. Prayer content safety

> A few gentle reminders as you share:
>
> Please avoid sharing private information about other people without their permission.
>
> Please avoid using prayer requests for emergencies or crisis situations that need immediate professional help. This app is not an emergency service.
>
> If you or someone else is in immediate danger, please contact your local emergency services or a trusted local resource right away.

## 9. Notifications future copy (not in the first MVP)

Draft copy for a future push-notification feature. Not built yet; push is deferred (`firebase-mvp-plan.md` §9.5).

> Notify me when someone prays for my request.
>
> You can turn notifications off at any time.
>
> Notifications are meant to be a quiet encouragement, never overwhelming.

## 10. AI assistance future copy (not in the first MVP)

Draft copy for a possible future AI assistance feature. Not built yet; AI verse matching and AI assistance are future-only.

> AI can help you clarify or gently organize your prayer request.
>
> It is here to help you say what you mean, not to replace your own words or intent.
>
> You always review and approve your request before it is posted.
>
> AI will never make up Scripture. Any verse shown comes from an approved, trusted source.

---

## Legal / Compliance Advisor Review (advisory, not legal advice)

> **Disclaimer:** This review is provided as an advisory lens. It is **not legal advice** and was **not produced by a lawyer**. It identifies questions and suggests product-copy edits. Formal privacy and terms-of-service policies for public launch should be reviewed by a qualified attorney or appropriate legal resource.

**Summary of review.** The drafted copy above is plain, calm, and consistent with the project's privacy posture (email never public, anonymity-with-private-ownership, "Remove request" not "Delete," manual report review, account deletion before beta). It reads as product copy, not as a binding legal policy, which is appropriate for this stage. A few edits were applied to keep claims accurate and to avoid sounding like a finished legal policy.

**Items that look acceptable as product copy (now):**
- Email privacy (section 1): the claims (used for sign-in, never shown on requests, prayers, or reports) match the planned data model and are safe to state plainly.
- Anonymous posting (section 2): correctly explains that "Anonymous" hides the name from other users but the request is still privately linked to the account. This honesty is important and well-phrased.
- Named posting (section 3): accurate and simple.
- Report request (section 5): calm, safety-focused, not framed as punishment. Good.
- Beta disclaimer (section 7): sets expectations and discourages oversharing sensitive detail during testing.
- Notifications future copy (section 9): clearly future, includes an off switch and a non-overwhelming promise.
- AI assistance future copy (section 10): includes the user-review step and the no-fabricated-Scripture rule. Good.

**Items that need legal review before public launch:**
- The overall privacy policy and terms of use (this doc is not a substitute for them).
- Account deletion (section 6): the exact statement of what is removed vs. anonymized, and any retention period, must be finalized and attorney-reviewed before public launch, because app stores and privacy law treat deletion claims as commitments.
- Crisis and emergency language (section 8): the "not an emergency service" framing is good product practice; the precise wording and any duty-of-care implications should be confirmed before public launch.
- Any future monetization, and any Bible text beyond public-domain (KJV), would need its own licensing and compliance review.

**Suggested edits made (and applied above):**
- Section 4 (Remove request): softened "deleted" language and made clear the request leaves the feed immediately while a private copy may be retained for a time. Avoided harsh wording per the design guardrail.
- Section 6 (Account deletion): changed absolute phrasing to "removes or anonymizes," and explicitly stated that exact behavior will be defined before beta and public launch, so the copy does not over-promise what has not been finalized.
- Section 8 (Prayer content safety): added the explicit "This app is not an emergency service" line and direction to contact local emergency services, rather than implying the app can help in a crisis.
- Section 10 (AI assistance): kept the no-fabricated-Scripture rule and the user-review-before-posting step, so the copy cannot be read as the app speaking for the user or inventing Scripture.
- Throughout: kept everything as product copy and added the top-of-doc note that this is not a legal policy, so nothing here reads as a finished privacy policy or terms of service.

**Specific items reviewed, as requested:**
- Email privacy claims: acceptable as written; consistent with the data model.
- Anonymous posting explanation: acceptable and notably honest about backend traceability.
- Account deletion claims: acceptable as product copy only after softening to "removes or anonymizes" and deferring exact behavior to the final policy.
- Report request language: acceptable; calm and non-punitive.
- Beta disclaimer: acceptable.
- Crisis/emergency language: acceptable as product copy with the emergency-service line added; confirm exact wording before public launch.
- AI assistance future copy: acceptable; the no-fabricated-Scripture and review-before-posting rules are present.
- Bible/verse-related risk: low here because only public-domain (KJV) is used for the MVP and section 10 forbids AI-generated Scripture. Any non-public-domain translation later needs a licensing review.
- Whether anything sounds like a legal policy when it should only be product copy: addressed. The top-of-doc note and the softened account-deletion wording keep this as product copy, not a policy.

**Remaining open questions:**
- Final account-deletion behavior: anonymize authored requests vs. soft-remove them (decided during Firebase implementation; `firebase-mvp-plan.md` §5).
- Whether a short privacy summary should appear in onboarding vs. only in Settings.
- Exact retention window, if any, for removed requests and deleted-account data.
- Where the eventual full privacy policy and terms links will live before external testing.

**Verdict (advisory):** Proceed with these as product copy. Treat the items above as must-resolve-with-attorney-review before public launch. This is not legal advice.
