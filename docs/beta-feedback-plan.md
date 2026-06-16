# Beta Feedback Plan: Praying For You

**Lens:** Growth / Beta Research Advisor (`agents/growth-beta-research-advisor.md`).
**Status:** planning only. No Firebase project, EAS project, code, dependencies, or secrets exist yet. This plan is used once the Firebase MVP is built and an installable beta can be shared (see `firebase-mvp-plan.md` §16, §17 J.7).
**Principle:** a beta exists to learn, not to grow numbers. The goal is honest answers about clarity, trust, emotional fit, and safety, not vanity metrics or early revenue.

---

## 1. Purpose of beta testing

The beta answers a small set of questions before more people are invited:

- Is the core prayer loop clear? Can a first-time user post a prayer and pick up someone else's prayer without help?
- Does it feel safe to post something vulnerable?
- Is anonymity understood, and is it trusted?
- Does the app feel calm and respectful, or does it drift toward feeling like social media?
- Is private data (email) understood to be private?

If those are true, the core is trustworthy. Everything else (themes, notifications, AI assistance, monetization) is a later question.

## 1.5 Alpha testing (controlled accounts) before beta

**CTO feedback incorporated.** Before inviting any external beta testers, run a small **alpha**
with controlled accounts the owner sets up, then start with people the owner personally knows.
This catches broken flows and privacy leaks before anyone outside is involved.

**Setup:**

- Create **3 to 4 controlled test accounts** the owner owns and can sign into.
- Run the scenarios below across those accounts.
- Only after the alpha passes, begin with **people the owner knows**, then widen to the broader
  beta in section 2.

**Scenarios to validate (each should behave correctly):**

1. **Requester / account owner** — sign up, post a request, see it in the feed and in "my requests."
2. **Another signed-in user prays** for a request — the prayer count increments; the prayer is recorded once.
3. **A user reports a request** — the report is stored for manual console review.
4. **Anonymous request** — shows "Anonymous" to other users; the request is still owned by the account in the backend (editable/removable by its owner).
5. **Named request** — shows the display name; email is still never shown.
6. **Edit/remove own request** — the owner can edit and remove their own request.
7. **Blocked edit/remove on others' requests** — a user cannot edit or remove someone else's request.
8. **Duplicate prayed interaction blocked** — praying twice for the same request does not double-count.
9. **Duplicate report blocked** — reporting the same request twice by the same user is prevented.
10. **Aggregate-only / data minimization** — other users see prayer **counts** only (never who prayed), and no raw user IDs or owner identifiers leak in the feed/detail.

A scenario failing here is a blocker: fix it before external testers are invited.

## 2. Ideal first beta testers

A small, trusted group (roughly 8 to 15 people) who:

- Actually pray or journal, so their reactions are real and not hypothetical.
- Span a range of comfort with technology, including people who are not power users.
- Span a range of comfort with sharing vulnerable content (some private, some open).
- Include both iOS and Android users.
- Will give honest, kind, specific feedback rather than only encouragement.

Keep it intentionally small. Early testers are extending emotional trust; treat them and their content with care.

## 3. Tester selection criteria

- Mix of iOS and Android devices.
- Range of ages and tech comfort.
- At least a few people who would describe themselves as private or cautious about posting personal things.
- People who will use it for real, not just click through once.
- Avoid an all-insider group (not only developers or close family) so feedback is not overly polite.

## 4. What we want to learn

- Onboarding clarity: is the purpose obvious quickly?
- Posting comfort: would they actually post a real request?
- Anonymity comprehension: do they understand what "Anonymous" shows and does not show?
- Privacy comprehension: do they understand email is private and never shown?
- Emotional fit: does "I prayed for this" feel meaningful and sincere?
- Calm vs. social-media feel: does anything feel like likes, follower counts, or pressure?
- Trust: what would make them trust the app more or less?
- Friction: where do they hesitate, get confused, or stop?

## 5. What feedback matters most

In priority order:

1. Trust and safety reactions (would they post, do they feel respected).
2. Clarity of the core loop and of privacy/anonymity.
3. Emotional fit of the prayer interactions.
4. Confusion points and friction.

Lower priority this early: cosmetic preferences, feature wishlists, and performance nitpicks on a pre-release build (note them, do not steer the product by them yet).

## 6. Suggested tester instructions

Keep instructions short and calm. Suggested wording to give testers:

> Thank you for helping test Praying For You. This is an early beta, so some things may change.
>
> Please use it the way you naturally would. Post a prayer request or two (with your name or as Anonymous, your choice), read the shared feed, and tap "I prayed for this" on requests that move you.
>
> Because this is a test build, please avoid posting highly sensitive personal details for now.
>
> When you are done, we will send a few short questions. Honest feedback helps more than polite feedback.

## 7. Suggested survey / interview questions

Mix of quick-reaction and open-ended. Keep them non-leading.

**Comfort and trust**
- Would you feel comfortable posting a prayer request here? Why or why not?
- Would you post with your name or anonymously? What made you choose that?
- What would make you trust the app more?
- Did the app feel respectful of prayer requests?

**Understanding privacy and anonymity**
- Did you understand that your email is private?
- Did you understand what "Anonymous" means and what others can see?

**The core experience**
- Does "I prayed for this" feel meaningful?
- What felt confusing?
- What feature would make you come back?
- Did anything feel too much like social media?

**A future feature (gauge interest, do not promise)**
- Would a notification when someone prays for your request feel helpful or intrusive?

Use open-ended phrasing in interviews and let people talk. The quick-reaction versions work well in a short survey.

## 8. What success looks like

- Most testers understand the purpose without explanation.
- Most testers would post a real request, at least anonymously.
- Anonymity and email privacy are understood correctly with no surprises.
- "I prayed for this" reads as sincere and meaningful, not as a "like."
- Few or no comments that it feels like social media.
- Confusion points are minor and fixable, not fundamental.

## 9. What would block wider beta

- Testers do not trust that email or anonymity work as described.
- People are afraid to post, or post and regret it.
- The core loop is confusing enough that people need hand-holding.
- The app reads as social-media-like in a way that cheapens prayer.
- Any safety gap: a report path that does not work, owner controls that leak, or private data showing where it should not.

## 10. What feedback should not be over-weighted too early

- Requests for more "engagement" features (feeds of activity, streaks, counts, badges). These pull toward social media and away from the mission.
- Monetization reactions. Do not test or weigh monetization until the core prayer loop is trusted.
- Cosmetic theme preferences beyond accessibility needs.
- One loud opinion. Look for patterns across testers, not a single strong voice.
- Performance polish on a pre-release build.

## 11. iOS and Android beta testing notes

- The beta targets both iOS and Android (owner decision; `firebase-mvp-plan.md` §16).
- Distribution paths: TestFlight for iOS and Play internal testing for Android, so testers install without the developer's machine.
- Android-first sequencing is acceptable for cost (Play Console is a one-time $25; Apple Developer is about $99 per year), but plan for both.
- Watch for platform-specific differences in onboarding, text sizing, and any auth or notification permission prompts. Make sure larger-text settings are honored on both.

## 12. Monetization reminder

Do not test monetization until the core prayer loop is trusted. Theme personalization and any optional support are hypotheses to learn about later, never a beta goal. Accessibility themes are always free, and nothing should interrupt prayer moments.

---

## 13. Feedback collection: how to run it

**Two collection options, offered to each tester:**

- **Short survey** (about 5 minutes): the quick-reaction versions of the section 7 questions, mostly multiple choice with one or two open boxes. Good for everyone, low effort.
- **15-minute interview** (optional): a short call for testers willing to talk it through. Use the open-ended versions and let them lead. Best for the most engaged or most cautious testers, where the richest signal usually is.

**Suggested tester follow-up message:**

> Thank you for trying Praying For You. When you have a few minutes, would you share your honest thoughts? You can do whichever is easier for you:
>
> 1. A short 5-minute survey: [link]
> 2. A relaxed 15-minute call, if you would rather talk it through: [scheduling link]
>
> There are no wrong answers. Anything that felt confusing, uncomfortable, or unclear is exactly what helps most. Thank you for trusting this early version.

*(Links are placeholders to fill in at beta time. No real URLs are stored in this repo.)*

## 14. Organizing feedback into themes

Collect raw feedback, then group it into a small set of themes rather than tracking every comment individually. Suggested themes:

- Trust and safety
- Clarity and onboarding
- Privacy and anonymity comprehension
- Emotional fit of the prayer loop
- Confusion and friction
- Calm vs. social-media feel
- Feature requests (parked, not acted on yet)

For each theme, note how many testers raised it and how strongly. Patterns across people matter more than any single quote.

## 15. Deciding what becomes a product priority

A piece of feedback becomes a priority when it meets these tests:

1. **Pattern:** several testers, not one, raised it.
2. **Mission fit:** fixing it strengthens trust, clarity, calm, or safety. Trust and safety issues are always top priority.
3. **Blocks trust if ignored:** if leaving it would stop people from posting or trusting the app, it is a must-fix before wider beta.

Things that fail those tests (engagement features, monetization, cosmetic wishes) are parked and revisited only after the core is trusted. Use feedback to reorder later work, not to bolt on social-media mechanics.

---

### Growth / Beta Research Advisor Review

- **Tester selection:** small (8 to 15), trusted but not all-insider, real pray-ers/journalers, iOS + Android, a range of tech comfort and sharing comfort.
- **Beta feedback goals (what to learn):** core-loop clarity, comfort posting, anonymity and email-privacy comprehension, emotional fit of "I prayed for this", calm vs. social-media feel, trust drivers, friction points.
- **Survey / interview questions:** drafted in section 7 (non-leading; quick-reaction and open-ended versions).
- **Must-have before beta:** working and trusted privacy/anonymity, owner-only edit/remove, a working report path, account deletion, no private data leaking. (These are gated by `firebase-mvp-plan.md` J.6/J.7.)
- **Can wait:** push notifications, AI assistance, themes/monetization, any engagement features.
- **Onboarding clarity:** the question to answer in beta is whether a first-time user understands the purpose and the anonymity/privacy model without help. Flagged as a primary learning goal.
- **Positioning:** keep language clear, sincere, and trustworthy, never hype; align with the calm/reverent design direction. A store description is drafted later, not now.
- **Monetization hypotheses to test later:** theme personalization and optional support, framed as future learning only, with guardrails (cosmetic only, accessibility themes always free, never interrupting prayer moments).
- **Push notification value vs. risk (user view):** ask testers whether "someone prayed for your request" would feel caring or intrusive, and what opt-in/frequency they would expect. Assess desirability only; implementation stays deferred (`firebase-mvp-plan.md` §9.5).
- **Learning goals before public launch:** clarity, trust, retention of meaning (not engagement), and safety must be demonstrably true.
- **Verdict (advisory):** OK to proceed with this plan once the Firebase MVP build exists and the J.6 security gate plus account deletion are verified.
