# Design Direction: Praying For You Mobile Prototype

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

**Design inspiration — an old-school Bible / prayer journal.** The app should feel like a
worn, treasured Bible or a handwritten prayer journal: **reverent, warm, trustworthy,
calm, and hopeful.** It should *not* feel like a generic social-media app or a bright,
high-energy startup app — no busy feeds, vivid gradients, badges, or engagement bait.
At the same time it must still feel **modern and clean enough for a mobile portfolio
prototype**: the heritage feeling comes from warmth, restraint, and material (paper,
ink, muted metal), not from skeuomorphic clutter or ornate decoration.

## 2. Brand Personality

The product should feel:

- **Reverent** — quietly sacred, like opening a well-loved Bible or prayer journal;
  treats prayer with dignity, never casually or as content to be "engaged with."
- **Warm** — inviting and human, with the warmth of paper, ink, and candlelight rather
  than cold screens or clinical UI.
- **Calm** — quiet layouts, soft spacing, nothing loud or urgent.
- **Hopeful** — gently encouraging, light rather than heavy.
- **Respectful** — mindful that prayer content can involve grief, illness, and fear.
- **Simple** — one clear purpose per screen; no cognitive overload.
- **Trustworthy** — predictable, honest, privacy-aware; no surprises.
- **Supportive** — community-oriented; "we're with you," not "perform for us."
- **Non-performative** — no vanity metrics, streaks, or pressure to engage; prayer is
  not a popularity contest.

Taken together, the personality is **"old-school Bible / prayer journal, made modern":**
reverent and warm in feeling, clean and legible in execution.

## 3. Visual Direction

A lightweight, restrained visual style with a warm, aged-paper heritage feel:

- **Clean, mobile-first interface** — vertical flow, thumb-reachable primary actions.
- **Aged-paper / parchment foundation** — backgrounds evoke warm parchment, cream, or
  ivory (see §4); surfaces feel like paper, not glossy cards. The warmth carries the
  "Bible / prayer journal" feeling without literal textures becoming clutter.
- **Soft spacing** — generous padding and breathing room; let content rest, like margins
  around a printed verse.
- **Journal-style prayer cards** — each request reads like a simple journal card, a Bible
  page note, or a paper prayer card: calm surface, soft hairline border, gentle (low)
  shadow, comfortable padding; whole card tappable.
- **Gentle contrast** — readable but never harsh; warm off-white surfaces and deep warm
  ink, not stark pure-white-on-black or high-glare contrast.
- **Clear primary actions** — one obvious primary button per screen; secondary actions
  are visibly secondary (outline/text style).
- **Minimal visual clutter** — only what the moment needs; hide advanced options.
- **Avoid overly ornate religious styling** — no heavy iconography, gilded frames,
  stained-glass motifs, or decorative flourishes; the tone is welcoming and
  non-denominational. Heritage comes from material and restraint, not ornament.
- **Avoid harsh contrast and anything theatrical** — no dramatic spotlights, heavy
  vignettes, or somber/oppressive palettes; the mood stays light, warm, and hopeful even
  around hard topics.
- **Don't look like social media or a bright startup** — no vivid gradients, neon
  accents, badges, like-counts styled as engagement, or busy multi-column feeds.

## 4. Suggested Color Direction

A soft, accessible, **aged-paper-inspired** palette **direction** (final values can be
tuned later; values below are illustrative). The palette should feel like ink and muted
metal on warm paper:

- **Warm parchment / cream / ivory background** — an aged-paper-inspired warm off-white,
  never pure white (e.g., approx. `#FBF8F4`, or a touch warmer toward `#F5EFE4`). This is
  the canvas that carries the Bible / prayer-journal feeling.
- **Deep, readable "ink" text** — dark **warm brown**, **warm charcoal**, or near-black
  for high legibility without harsh pure-black (e.g., a warm charcoal around `#2A2A33`,
  or a deep espresso brown such as `#3A2E25`); a muted warm gray/taupe for
  secondary/metadata text.
- **Muted, heritage accents — used sparingly** for trust, reflection, and hope. Draw from
  a restrained, slightly antique set: **muted gold / bronze** (hope, encouragement,
  confirmed prayer), **burgundy / deep wine** (warm emphasis), **deep navy** (calm,
  trust), or **muted purple** (reflection). Pick a small accent family — ideally one
  primary accent plus one or two supporting tones — rather than using all of them.
- **Clear but non-alarming error color** — a soft, desaturated terracotta/clay that
  signals a problem calmly, never a harsh "danger" red; always paired with text/icon.
- **Accessible contrast expectations** — aim for **WCAG AA**: ≥ 4.5:1 for body text and
  ≥ 3:1 for large text and meaningful UI elements. Warm parchment + deep ink should
  comfortably clear AA; verify accent-colored buttons, links, and error text against
  their backgrounds (muted gold especially needs checking on light parchment).

Use color sparingly: a warm parchment canvas, deep ink text, and small muted-metal /
deep-jewel accents. Avoid large saturated fills, bright primaries, and anything neon.

> **Note on current theme tokens.** `mobile-app/src/theme/theme.ts` is an early baseline
> that already leans warm (parchment-ish `#FBF8F4` background, warm-charcoal text, a
> `gold` token). Its current primary is a brighter muted purple (`#6C63FF`); a Phase C /
> polish pass should **shift the primary and accents toward this warmer heritage palette**
> (e.g., muted gold/bronze, burgundy, or deep navy). This document updates the
> *direction* only — it does not change code; the token refinement is a future task.

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

- **Prayer request cards** — styled like a **simple journal card / paper prayer card**:
  warm paper surface, soft hairline border, gentle low shadow, comfortable padding.
  Show display name or "Anonymous", relative date, prayer text (truncated in feed), and
  prayer count; whole card tappable to detail. Calm and readable first — never a dense,
  social-media-style row.
- **Primary & secondary buttons** — one primary (filled, trust-tone) per screen;
  secondary as outline/text; large tap targets; clear pressed/disabled states.
- **Form fields** — visible label above the field, gentle placeholder, appropriate
  keyboard, inline validation, and a character counter where length matters.
- **Anonymous posting toggle** — a clear switch on the submit screen with a one-line
  explanation ("Your name won't be shown publicly"); never implies the post is
  untracked.
- **Category tag** — a small, **understated** chip (soft parchment-tinted, muted text)
  showing the prayer's category on cards and detail. It helps users frame and scan
  requests; keep it quiet — never a loud colored badge or a row of competing tags.
- **Anonymous / named display** — clear but **understated**: the display name or
  "Anonymous" sits as quiet metadata on the card/detail, never a bold byline or avatar
  that turns the post into a social profile.
- **"I prayed for this" action** — a warm, sincere primary action on detail; obvious
  confirmed state after tapping; hidden/disabled on the user's own post. It should feel
  like *joining someone in prayer*, not "liking" a post.
- **Prayer count display** — quiet, **encouraging** metadata (e.g., "12 people prayed"),
  framed as companionship and support — **never gamified**: no leaderboards, streaks,
  trophies, trending, or counts styled as engagement metrics.
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
- **Prayer detail** — should feel **reflective, like reading a prayer card or a journal
  entry**: full prayer text centered and given room to breathe on warm paper, generous
  margins, comfortable line height; the **"I prayed for this"** action is the clear,
  quiet focus; prayer count shown gently as companionship; report action available but
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
- [ ] **Heritage feel holds:** warm parchment/ink palette, journal-style cards; reads as
      an old-school Bible / prayer journal made modern — **not** social media or a bright
      startup app, and **not** ornate/theatrical.
- [ ] Accents are muted and sparing (gold/bronze, burgundy, deep navy, or muted purple);
      no neon, vivid gradients, or large saturated fills.
- [ ] Prayer count reads as encouragement/companionship, never gamified (no streaks,
      leaderboards, or engagement-style metrics).
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

## 13. Brand Mark / Splash Concept — Two-Nail Cross (future)

A future brand mark / splash idea to explore — **not** a Phase C deliverable and not
required for the prototype:

- **Concept:** a subtle cross formed from **two old iron nails** (one vertical, one
  horizontal), suggesting the cross simply and symbolically — aged metal on warm paper.
- **Tone:** **symbolic and reverent**, quiet and restrained. It should feel like a small
  pressed emblem on a journal cover, not an illustration.
- **Avoid:** anything **graphic, bloody, violent, gory, or overly detailed**; no dripping,
  wounds, dramatic lighting, or hyper-realistic rendering. Keep it minimal and calm.
- **Usage:** suitable later as a **loading/splash mark or small brand emblem** (e.g., a
  muted bronze/iron mark on parchment). It must **never distract from the prayer
  experience** — small, secondary, and absent from content-heavy or emotional moments.
- **Scope note:** this is a forward concept only. Custom logo/illustration work and any
  splash animation are deferred per §11 (Prototype Design Constraints) and should be
  done well after the core screens, ideally toward portfolio polish or the later
  milestones.

## 14. Phase C UI Direction (Feed & Detail)

Concrete guidance for the upcoming Phase C screens (mock prayer **feed** and **detail**),
so they embody the heritage direction from day one. (Design *polish* remains a later
phase; these are the principles to build against now.)

- **Feed cards** — calm, readable, journal-style cards (see §6): warm paper surface, soft
  hairline border, gentle low shadow, generous padding; one card per request, comfortable
  vertical spacing between them. Newest first. No dense rows, avatars-as-identity, or
  social-media chrome.
- **Prayer detail** — reflective, like reading a **prayer card or journal entry** (see
  §7): the prayer text is the centerpiece with warm paper, roomy margins, and easy line
  height; supporting metadata stays quiet.
- **Anonymous vs. named** — clear but **understated** quiet metadata (name or
  "Anonymous"); never a prominent byline or profile treatment.
- **Prayer count** — **encouraging, not gamified** (e.g., "12 people prayed"); framed as
  companionship and support, with no streaks, leaderboards, trending, or engagement-style
  emphasis.
- **Overall** — nothing should make prayer feel like social-media engagement. Favor
  stillness and legibility over density, motion, or visual noise. Empty/loading states
  stay warm and calm (a quiet line on parchment, not a spinner-heavy screen).

## 15. Accessibility: Dynamic Type / Larger Text (Phase H.3)

The app is used by people of all ages, including older family members, often in a tender
moment. It must remain readable and usable when the device is set to a larger system text
size (iOS Dynamic Type / Android font scale). Direction and the implemented baseline:

- **Text scales with the OS setting.** React Native scales font sizes by the user's font
  setting by default; the app keeps this on for content. Do not disable font scaling on
  readable content.
- **Line height tracks the text size.** Where an explicit line height is set (body and
  prayer text), it is scaled with the user's font setting (`scaleLineHeight` in
  `theme.ts`) so lines never overlap or clip at larger sizes. Titles/headings/metadata use
  proportional defaults that already scale.
- **No fixed heights that clip text.** Use `minHeight` (which grows), generous padding, and
  scrolling containers; never a fixed `height` around text. Buttons and inputs grow with
  the text; cards and detail screens grow vertically.
- **Screens grow or scroll.** The Welcome and Sign In screens scroll when larger text makes
  their content taller than the screen, so nothing is cut off.
- **Chrome is bounded, content is not.** Tight "chrome" (bottom-nav labels, the category
  chip, the decorative verse quote mark, the confirmation banner) caps its scaling with a
  reasonable `maxFontSizeMultiplier` and stays on one line so the layout does not break.
  Readable content (prayer text, headings, body, form fields) is **not** capped, so users
  who need very large text still get it.
- **Tap targets** stay at least ~44pt and remain comfortably tappable as text grows.

> Note: the prototype reads the font scale at app start; changing the OS text size while the
> app is open takes effect on the next launch. This is acceptable for the local prototype.

## 16. Theme Foundation and Future Themes (Phase H.3)

Color drew positive comments, and a tester suggested that different color themes could be a
future personalization (and, optionally, monetization) opportunity. This phase does **not**
build theme switching, paid themes, in-app purchases, subscriptions, or a marketplace — it
only keeps the foundation clean so themes can be added later without rework.

**Foundation (today).** All colors live as named tokens in `mobile-app/src/theme/theme.ts`
(`colors`, plus `spacing`, `radius`, `typography`), every component reads from these tokens,
and there are no hardcoded hex values in screens (the one shared shadow color is now a
`shadow` token). Because the palette is a single object, a future theme is essentially a
**swap of the palette** (for example via a `ThemeProvider` that supplies the active palette),
with **no component changes**.

**Possible future themes** (illustrative, not built):

- **Classic Prayer Journal** — the current warm parchment / ink / muted-gold heritage look.
- **Soft Morning Light** — a lighter, airier warm palette for daytime reading.
- **Night Prayer** — a calm dark theme (warm dark surfaces, gentle ink-on-dark contrast) for
  low-light/bedtime use.
- **High Contrast** — an accessibility theme that maximizes contrast for low vision.
- **Large Text Friendly** — an accessibility-oriented preset pairing the Dynamic Type
  support above with generous spacing.

**Future monetization note (rules, not a plan):**

- Optional **cosmetic** theme packs *could* be explored later, but they are strictly
  optional and never required for usability.
- **Accessibility themes — High Contrast and Large Text Friendly — must never be paywalled
  or monetized.** Accessibility is a right, not an upsell.
- Any monetization must **never interrupt prayer moments**: no theme upsell on the prayer
  submission, prayer detail, the "I prayed for this" action, or any emotional moment. The
  same guardrails as ads (see §10) apply.
- Theming must stay cosmetic: a theme changes colors only, never the availability of core
  prayer features.
