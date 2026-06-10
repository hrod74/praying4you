# Design Direction: Praying 4 You Mobile Prototype

**Status:** Lightweight design direction for the functional local prototype
(milestone 1). It guides the look, feel, and flow of the React Native / Expo screens
built in Phases B–H. It is intentionally *direction*, not a full design system — it
favors clear principles over pixel-exact specs.

**Related docs:** [`prototype-roadmap.md`](prototype-roadmap.md),
[`implementation-plan.md`](implementation-plan.md),
[`product-requirements.md`](product-requirements.md),
[`legacy-app-audit.md`](legacy-app-audit.md), and the UI/UX Designer role in
[`agents/ui-ux-designer.md`](agents/ui-ux-designer.md). The prototype's current theme
tokens live in `mobile-app/src/theme/theme.ts`.

---

## 1. Design Goal

Create a **calm, trustworthy, mobile-first prayer experience** that feels **polished
enough for a portfolio demo** while staying **simple enough for a functional
prototype**. Every screen should feel quiet, focused, and respectful — easy to use on a
phone in a sensitive moment — without over-building branding, animation, or a full
design system the prototype does not yet need.

The redesign deliberately moves away from the legacy app's dense Bootstrap-3 table
layout toward a warm, card-based, touch-first mobile feel.

## 2. Brand Personality

The product should feel:

- **Calm** — quiet layouts, soft spacing, nothing loud or urgent.
- **Hopeful** — gently encouraging, light rather than heavy.
- **Respectful** — mindful that prayer content can involve grief, illness, and fear.
- **Simple** — one clear purpose per screen; no cognitive overload.
- **Trustworthy** — predictable, honest, privacy-aware; no surprises.
- **Supportive** — community-oriented; "we're with you," not "perform for us."
- **Non-performative** — no vanity metrics, streaks, or pressure to engage; prayer is
  not a popularity contest.

## 3. Visual Direction

A lightweight, restrained visual style:

- **Clean, mobile-first interface** — vertical flow, thumb-reachable primary actions.
- **Soft spacing** — generous padding and breathing room; let content rest.
- **Card-based prayer feed** — each request is a calm, self-contained card.
- **Gentle contrast** — readable but not harsh; soft surfaces over stark white/black.
- **Clear primary actions** — one obvious primary button per screen; secondary actions
  are visibly secondary (outline/text style).
- **Minimal visual clutter** — only what the moment needs; hide advanced options.
- **Avoid overly ornate religious styling** — no heavy iconography, gilded frames, or
  decorative flourishes; the tone is welcoming and non-denominational.
- **Avoid dark/heavy emotional design** — no somber, oppressive palettes; the mood is
  light and hopeful even around hard topics.

## 4. Suggested Color Direction

A soft, accessible palette **direction** (final values can be tuned later; values below
are illustrative and align with the current prototype theme):

- **Warm neutral background** — a soft off-white/cream rather than pure white, for a
  calm, warm base (e.g., approx. `#FBF8F4`).
- **Deep readable text** — a dark, slightly warm near-black/charcoal for high
  legibility without harsh pure-black (e.g., approx. `#2A2A33`); muted gray for
  secondary/metadata text.
- **Soft blue or muted purple** for **trust / reflection** — the primary action and
  brand accent (e.g., a muted indigo/purple around `#6C63FF`, or a calm blue). This
  carries primary buttons and links.
- **Muted gold or warm accent** for **hope / encouragement** — a gentle warm tone for
  positive moments (e.g., a confirmed prayer, encouragement highlights); used sparingly.
- **Clear but non-alarming error color** — a soft, desaturated red/terracotta that
  signals a problem calmly, never a harsh "danger" red; always paired with text/icon.
- **Accessible contrast expectations** — aim for **WCAG AA**: ≥ 4.5:1 for body text and
  ≥ 3:1 for large text and meaningful UI elements. Verify primary buttons, links, and
  error text against their backgrounds.

Use color sparingly: a warm neutral canvas, one trust-tone primary, and small accents.
Avoid large saturated fills.

## 5. Typography Direction

- **Prioritize readability** above all — comfortable body size, ample line height.
- **Avoid decorative fonts for body text** — use a clean, friendly system or sans-serif
  typeface (the platform default is fine for the prototype). Decorative styling, if any,
  is reserved for a single brand moment, never body or form text.
- **Clear hierarchy** across four consistent levels:
  - **Screen title** — largest, used once per screen.
  - **Card title / section heading** — medium, distinguishes cards and sections.
  - **Body text** — the readable default for prayer content and descriptions.
  - **Metadata** — smaller, muted (dates, counts, "Anonymous", helper text).
- **Support larger mobile text sizes where practical** — respect OS Dynamic
  Type / font scaling; avoid fixed heights that clip when text grows; test a larger
  text setting on key screens.

## 6. Core UI Patterns

Reusable patterns the prototype should standardize (build as simple shared components
when they first appear, not all up front):

- **Prayer request cards** — display name or "Anonymous", relative date, prayer text
  (truncated in feed), and prayer count; calm surface, soft border/shadow, comfortable
  padding; whole card tappable to detail.
- **Primary & secondary buttons** — one primary (filled, trust-tone) per screen;
  secondary as outline/text; large tap targets; clear pressed/disabled states.
- **Form fields** — visible label above the field, gentle placeholder, appropriate
  keyboard, inline validation, and a character counter where length matters.
- **Anonymous posting toggle** — a clear switch on the submit screen with a one-line
  explanation ("Your name won't be shown publicly"); never implies the post is
  untracked.
- **"I prayed for this" action** — a warm, satisfying primary action on detail; obvious
  confirmed state after tapping; hidden/disabled on the user's own post.
- **Prayer count display** — quiet metadata (e.g., "12 prayed"), framed as support, not
  a competitive score.
- **Empty states** — friendly illustration/text + a suggested next action (see §7).
- **Error states** — calm inline messages (see §3 color guidance); recoverable.
- **Settings rows** — simple list rows with a label, optional value, and chevron;
  grouped sensibly; sign-out clearly but not alarmingly styled.
- **Verse card** — a gentle, slightly distinct card for the verse of the day with
  reference, text, and translation; display-only, restful.

## 7. Screen-Level UX Notes

- **Welcome screen** — one or two warm sentences explaining the concept; a single clear
  primary action to continue; uncluttered and inviting. Sets the calm tone immediately.
- **Create profile / sign-in** — minimal fields (name, email); clearly communicate that
  **email is private** and never shown publicly; plain-language labels; for the
  prototype, make the simulated nature unobtrusive but honest. Easy path between sign-in
  and create-profile.
- **Prayer feed** — scrollable list of calm cards, newest first; comfortable spacing
  between cards; obvious entry point to submit a request; friendly empty state when no
  requests exist; pull-to-refresh feels natural.
- **Prayer detail** — full prayer text with room to breathe; the **"I prayed for this"**
  action is the clear focus; prayer count shown quietly; report action available but
  understated (e.g., overflow menu), never visually aggressive.
- **Submit prayer request** — single focused compose screen; large text area with a
  character counter and gentle min/max guidance; the **anonymous toggle** with a short
  explanation; one clear primary "Share" action; calm success confirmation that returns
  to the feed. No ads or interruptions anywhere in this flow (see §10).
- **Verse of the day** — a single restful verse card; display-only; a quiet, hopeful
  moment, not a feature-heavy screen.
- **Settings / about** — simple grouped rows: edit display name, sign out, and a short
  "about this app" section; placeholders for future privacy/terms links; nothing
  exposes private profile details publicly.

## 8. Accessibility Principles

- **Strong color contrast** — meet WCAG AA (§4); verify text, buttons, links, errors.
- **Large tap targets** — ≈ 44pt minimum, well-spaced so nothing is easily mis-tapped.
- **Plain language** — clear, kind, jargon-free copy throughout.
- **Form labels** — every input has a visible, associated label (not placeholder-only).
- **Avoid relying on color alone** — pair color with text, icon, or shape for state and
  meaning (e.g., errors, toggles, confirmed prayer).
- **Readable text sizes** — comfortable defaults; respect OS font scaling; avoid clipping
  at larger sizes.
- **Screen-reader-friendly structure where practical** — meaningful accessible labels on
  interactive elements; logical reading/focus order; describe icons and actions so
  VoiceOver/TalkBack users can complete the core flow.

## 9. Trust and Privacy Cues

- **Email is private** — collected only for the local profile; **never** displayed in
  the feed, detail, or any public surface. Reinforce this with a small reassurance where
  email is entered.
- **Anonymous means public *display* anonymity, not no accountability** — an anonymous
  post still belongs to its owner internally (for moderation/reporting). UI copy should
  make the display meaning clear without implying the post is untraceable.
- **Prayer content may be sensitive** — treat it gently; avoid surfacing it in
  unexpected places; no aggressive sharing/promotion of user content.
- **Reporting should be easy but not visually aggressive** — discoverable (e.g., an
  overflow/"⋯" menu or a quiet link), with a calm reason picker; never a loud, alarming
  button competing with the prayer action.
- **Avoid public exposure of unnecessary profile details** — show only what a public
  feed needs (display name or "Anonymous"); keep everything else in private settings.

## 10. Monetization Design Guardrails

(Ads are a **later-milestone** concern and are **not** in the prototype — these are
forward guardrails so design choices made now stay compatible with respectful
monetization later.)

- **No ads during emotional or prayer-submission moments** — the compose/submit flow and
  any moment of grief or vulnerability stays ad-free.
- **No interstitials during prayer actions** — never interrupt "I prayed for this",
  submitting, or reading a request with a full-screen ad.
- **Ads should never interrupt the core prayer experience** — if/when ads exist, they
  belong in neutral locations (e.g., a quiet, clearly-labeled banner away from emotional
  moments), never mid-flow or disguised as content.
- **Monetization should feel secondary to support/community** — the product's center of
  gravity is prayer and support; revenue surfaces must feel incidental, honest, and
  non-exploitative. No dark patterns, no manipulation of vulnerable moments.

## 11. Prototype Design Constraints

- **Do not overbuild a full design system yet** — principles and a small set of tokens
  (the existing theme) are enough for the prototype.
- **Use simple reusable components** — introduce shared components (card, button, field)
  when a pattern first repeats, not speculatively.
- **Prioritize screens that demo well** — invest polish where the portfolio walkthrough
  will look: feed, submit (with anonymous toggle), detail (with prayer count), verse.
- **Keep the mock/local-data prototype visually consistent** — even placeholder/mock
  content should look intentional and coherent across screens.
- **Defer advanced animations and custom branding until later** — gentle, default
  transitions are enough now; custom logo work, illustration sets, and motion design are
  later-milestone concerns.

## 12. UI/UX Review Checklist

The UI/UX Designer applies this before each phase/feature is committed (alongside the
role's full checklist in [`agents/ui-ux-designer.md`](agents/ui-ux-designer.md)):

- [ ] Mobile-first: primary actions are thumb-reachable; vertical, phone-first layout.
- [ ] Each screen has one clear purpose and one obvious primary action.
- [ ] Navigation is clear; the user can always orient and go back; no dead ends.
- [ ] Visual style follows this direction and the theme tokens; no drifting one-offs.
- [ ] Spacing is soft and uncluttered; nothing ornate or visually heavy.
- [ ] Forms have visible labels, sensible keyboards, inline validation, and counters
      where length matters.
- [ ] Empty states are warm and guide a next action (no blank/broken screens).
- [ ] Error states are calm, specific, recoverable, and not color-only.
- [ ] Copy is calm, hopeful, plain, and respectful of sensitive content.
- [ ] Contrast meets AA; tap targets ≈ 44pt; meaning is not conveyed by color alone.
- [ ] Text remains readable at larger OS font sizes; interactive elements have
      accessible labels.
- [ ] Email and private details never appear on a public surface.
- [ ] Anonymous reads as "displayed anonymously," not "untracked"; reporting is easy but
      understated.
- [ ] No dark patterns; no ads/interruptions in prayer/submit/emotional moments.
- [ ] Screens that will be shown look polished enough to screenshot/record — without
      over-building for a prototype.
- [ ] Verdict recorded (Proceed / Proceed with changes / Do not proceed) with any
      required changes.
