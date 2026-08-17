# QA Feed Sorting, Filtering, and Performance

## Current Status

**CONTROLLED-BETA SMOKE TEST PASSED, 2026-08-17.** The owner completed the focused seven-check Android standalone-build smoke test below. All seven checks passed and no defect was observed. The exhaustive large-feed performance matrix, multiple-iPhone layout matrix, and every combinatorial checklist item later in this document remain available for future testing and are not represented as completed.

## Focused Android Standalone-Build Execution Record

- Environment: EAS Android preview APK in an Android Studio Pixel 2 emulator
- Backend mode: Firebase
- Result: 7 of 7 checks passed
- Defects found: 0

- [x] Newest sort works.
- [x] Oldest sort works.
- [x] Most prayed sort works.
- [x] Category filtering works.
- [x] To pray for and My requests filtering works.
- [x] Reset restores the complete feed.
- [x] Scrolling and changing filters produce no warning, crash, or obvious lag.

### Explicit controlled-beta deferrals

- The 15-plus-request performance stress setup and detailed warning table were not rerun during this focused pass.
- The small-iPhone, large-iPhone, and enlarged-system-text matrix remains deferred until an iOS build exists.
- The full combinatorial sort/filter checklist below remains a reusable regression suite and is not marked complete by this focused pass.

These deferrals do not block the controlled beta. The primary sort and filter controls were directly exercised in the standalone Android build, and the earlier Alpha provided additional organic feed usage evidence.

A manual checklist for verifying the prayer feed's new sorting and filtering controls and its feed
scale performance hardening, before broader beta testing of Praying For You. It is written for the
owner (not a developer). Tap through each step on a phone running Expo Go, and check the box when the
result matches what is described.

## Purpose

This phase (Feed Scale Readiness) adds two things the early Alpha feedback asked for:

1. Simple sorting and filtering so the feed stays manageable as requests grow.
2. A fix for the React Native warning seen while viewing the feed:
   `VirtualizedList: You have a large list that is slow to update ...`

The sort/filter is DERIVED on the device from the already loaded requests. It never changes stored
data, so trying every sort and filter is safe and reversible with Reset.

What is out of scope here (do not test these, they were intentionally not built):

- No advanced search, no saved filters, no date range filtering.
- No "who prayed" list, and no public list of interactions, anywhere.
- No new monetization, ads, organization accounts, admin tooling, or remote analytics.
- Reports remain local/mock in local mode and a private record in Firebase mode.

## Pagination decision (read this first)

The feed loads the FULL set of active requests and then sorts/filters them on the device. For this
pre-beta phase that is honest: the client-side sort/filter represents the complete active dataset,
not a partial page. We deliberately did NOT add server-side cursor pagination yet, because:

- "Most prayed" and "Oldest" would each need a different Firestore query plus a composite index
  (`status` + `orderBy`), which is real index/architecture work and Console republishing.
- The three filters (category, "to pray for", "my requests") combine on the client. Paginating a
  partial page server-side and then filtering it would show misleading counts and could hide matches
  that live on a later page. We will not pretend a partial page represents the whole database.

Recommended FUTURE server-side work (before the active feed grows large, roughly past a few hundred
active requests): adopt Firestore cursor pagination with a page size (for example 20) and "Load
more", add the composite indexes for each sort, and move filtering server-side where possible. This
is documented in the handoff summary as the next scale step. No index or rules republishing is
required for THIS phase.

## Before You Start

- [ ] Expo is running with `npx expo start -c`
- [ ] Testing uses throwaway accounts
- [ ] Enough requests exist to scroll (aim for 15+ active requests across several categories; mix of
      your own and other accounts', with varied prayer counts and a few you have already prayed for)
- [ ] If testing in Firebase mode, the current rules are already published (this phase did NOT change
      `mobile-app/firestore.rules`, so nothing new needs republishing)

> Tip: to exercise sorting and filtering well, seed a spread: at least one very old request, one very
> new, one with a high prayer count, a couple in the same category, one of your own, and one you have
> already prayed for.

## Compact toolbar (new layout)

The Sort, Show, and Category sections are no longer permanently expanded. The feed now shows ONE
compact toolbar below the description: a **Filters** button on the left and the current sort value
(for example **Newest**) on the right. Tapping either opens a bottom sheet.

- [ ] Open the Feed. Below the title and one line of description there is a single short row: a
      **Filters** button and a sort button reading **Newest**.
- [ ] The first prayer card is visible high on the screen (roughly where the old Category row used to
      be). Compare to the old build: the first card is significantly higher.
- [ ] With no filters active, there is no chip row and no count badge. The toolbar is one row only.

## Sort scenarios

- [ ] Open the Feed. The default sort is **Newest** (the sort button reads Newest) and the most
      recently shared request is at the top.
- [ ] Tap the sort button. A bottom sheet titled **Sort** slides up with Newest, Oldest, and Most
      prayed. The current choice has a checkmark.
- [ ] Tap **Oldest**. The sheet closes, the button now reads Oldest, and the oldest request is at the
      top.
- [ ] Open the sort sheet again and tap **Most prayed**. The request with the highest prayer count is
      at the top; ties fall back to newest first.
- [ ] Tap the sort button, choose **Newest**. The feed returns to newest first.
- [ ] In the sort sheet, the selected option is clearly indicated (bold navy text plus a checkmark).
- [ ] Tap outside the sheet (on the dimmed area). It closes without changing the sort.

## Filter scenarios

All filters live in the **Filters** bottom sheet. Open it by tapping **Filters**.

- [ ] Tap **Filters**. A bottom sheet titled **Filters** slides up with a **Show** group (All
      requests, To pray for, My requests) and a **Category** group (All plus every category). The
      category chips WRAP onto multiple lines; none is cut off at the screen edge.
- [ ] In **Category**, tap Health, then tap **Apply filters**. The sheet closes and only Health
      requests appear.
- [ ] Open **Filters**, set **Category** back to All, Apply. Every category appears again.
- [ ] Open **Filters**, choose **Show: To pray for**, Apply. Only requests you have NOT prayed for
      appear. Your OWN requests do not appear here (you cannot pray for your own).
- [ ] Pray for one of the listed requests. It leaves the "To pray for" list (after the pray
      registers), confirming the filter reflects your own interaction data.
- [ ] Open **Filters**, choose **Show: My requests**, Apply. Only requests you created appear (matched
      by account ownership, never by display name). An anonymous request you made still appears here
      for you. No other person's request is shown.
- [ ] Confirm **Show** is single choice: selecting My requests clears To pray for, and vice versa.

## Combined control scenarios

- [ ] Open **Filters**, set **Category: Family**, Apply, then open the sort sheet and choose **Most
      prayed**. Only Family requests appear, ordered by prayer count. Filtering and sorting work
      together.
- [ ] Open **Filters**, set **Show: To pray for** and **Category: Health**, Apply. Only Health
      requests you have not prayed for (and are not your own) appear.
- [ ] Set **Show: My requests** and sort **Oldest**. Your requests appear oldest first.
- [ ] When filters are active, the **Filters** button shows a small count (for example a badge of 2),
      and removable chips appear below the toolbar (for example "To pray for" and "Health"), each with
      an x.

## Active filter chips

- [ ] With one or more filters active, confirm a chip appears below the toolbar for each active filter
      (the Show scope and the Category), and NO chips appear when nothing is filtered.
- [ ] Tap the x on a chip (for example Health). That single filter is removed immediately and the feed
      updates; other active filters remain.
- [ ] The Filters count badge decreases as chips are removed, and disappears at zero.

## Reset

- [ ] With one or more filters and a non-default sort active, open **Filters** and tap **Reset**.
- [ ] The sheet closes and the feed returns to the default: Show All requests, Category All, Sort
      Newest. The count badge and all active chips disappear.

## Empty state

- [ ] Apply a filter combination that matches nothing (for example **Show: My requests** plus a
      category none of your requests use). A calm empty state appears: "Nothing matches yet ... Try
      Reset to see the whole feed." It is warm and quiet, not an error.
- [ ] Open **Filters** and tap **Reset**. The full feed returns.

## Removed requests

- [ ] Remove one of your own requests (open it, Remove request). It disappears from the feed.
- [ ] Try every sort and every filter. The removed request NEVER reappears under any control.

## Feed refresh behavior

- [ ] Pull down to refresh. The feed reloads. Your current sort and filter selections are preserved
      (Reset is still the way to clear them).
- [ ] Create a new request (Share tab). Return to the feed. With the default Newest sort it appears at
      the top.

## Prayer count update behavior

- [ ] On the Feed, tap **Pray** on a request. Its count rises and it shows the "Prayed" badge.
- [ ] The rest of the feed does NOT visibly flicker or reorder (unless you are on the Most prayed sort,
      where a higher count may move that one card). Only the card you prayed for changes.
- [ ] No "who prayed" information appears anywhere. The count is the only shared signal.

## Scrolling responsiveness

- [ ] Scroll the full feed up and down quickly. Scrolling stays smooth; cards do not blank out or
      flash (especially watch the top and bottom of the screen).
- [ ] Tap a card mid-scroll. It opens its detail reliably. Back returns to the same scroll position.
- [ ] Tapping **Pray** on a card during or right after scrolling responds promptly.

## VirtualizedList warning check

The warning to watch for in the Metro/Expo terminal (and the in-app LogBox) is:
`VirtualizedList: You have a large list that is slow to update ...`

Reproduce the BEFORE/AFTER honestly with a long feed (15+ requests):

- [ ] Initial feed render: no VirtualizedList warning appears.
- [ ] Changing sort (Newest / Oldest / Most prayed): no warning.
- [ ] Changing filters (category, To pray for, My requests): no warning.
- [ ] Praying for a request: no warning, and only the affected card updates.
- [ ] Scrolling through the whole feed: no warning.

Record the result in the table below. Do not mark the warning resolved unless it was actually
retested on a device with a large enough feed.

| Action          | Warning before fix | Warning after fix |
| --------------- | ------------------ | ----------------- |
| Initial render  |                    |                   |
| Change sort     |                    |                   |
| Change filters  |                    |                   |
| Pray            |                    |                   |
| Scroll          |                    |                   |

## Small and large iPhone checks

- [ ] Small iPhone (for example iPhone SE / mini): the toolbar is one row and both buttons fit. The
      Filters and Sort bottom sheets open from the bottom, respect the home-indicator safe area, and
      the category chips wrap (no chip is clipped). If the filter sheet content is tall, it scrolls
      inside the sheet while Reset and Apply stay reachable. Touch targets are comfortable (44pt).
- [ ] Large iPhone (for example Pro Max): the toolbar does not feel sparse or stretched; the feed
      remains a calm single column; the sheet sits at the bottom within reach.
- [ ] With larger system text (Accessibility text size up), labels remain legible, chips wrap rather
      than overlap, and the sheets still scroll. Controls still tap reliably.

## Existing flows still work (regression)

- [ ] Create a request still works and it appears in the feed.
- [ ] Edit your request still works; the change shows in the feed/detail.
- [ ] Remove your request still works; it leaves the feed.
- [ ] Pray for another person's request still works (count rises, "Prayed" badge shows).
- [ ] Report another person's request still works.
- [ ] No raw account IDs (UIDs) appear anywhere on the feed or controls.

## UI/UX review findings (compact toolbar refactor)

Reviewed against the goal of keeping prayer requests the primary content. Findings from the code-level
review (to be confirmed on a device):

- **Vertical space usage:** the old layout stacked three labeled groups of 44pt pills plus a status
  row above the feed (roughly 260 to 290pt of controls). The new closed state is a single 44pt
  toolbar row (about 44pt, around 68pt including its bottom margin). That is roughly a 200pt
  reduction, so the first prayer card moves up by close to the height of one full card on a small
  iPhone.
- **Hierarchy:** title (large) then one quiet description line then a low-emphasis outlined toolbar
  then the cards. The cards keep the only elevated/shadowed surface, so they stay the visual priority;
  the toolbar reads as secondary chrome.
- **Discoverability:** the left control is labeled "Filters" with a funnel icon; the right control
  shows the current sort value with a down chevron, signaling it is tappable. Both open standard
  bottom sheets.
- **Small iPhone layout:** toolbar is two short buttons with space between, comfortably fitting SE
  width ("Most prayed" is the longest label and still short). The filter sheet wraps categories and
  scrolls internally under an 85 percent height cap, with Reset and Apply pinned below, so it works on
  small screens and respects the bottom safe area.
- **Active filter clarity:** a count badge appears on the Filters button and removable chips appear
  below the toolbar, each labeled (for example "Health", "To pray for") with an x. Chips never show
  when nothing is filtered.
- **Ease of resetting:** two paths. Remove a single filter by tapping its chip x, or clear everything
  (Show, Category, Sort) in one tap with Reset inside the filter sheet.
- **First card appears quickly enough:** yes. With the toolbar collapsed, the first card sits just
  below one description line and the toolbar, much higher than the previous three-section layout.

Open considerations (acceptable for this phase, noted for future polish):

- Show is presented as a single choice (All / To pray for / My requests); the two underlying booleans
  can no longer be enabled at once from the UI. That combination previously yielded an empty list
  anyway, so no useful capability was lost, and all sort/filter logic is unchanged.
- The Filters count badge uses a number badge rather than the literal "Filters · 2" text. Same meaning,
  cleaner at small sizes; revisit if the text form is preferred.

## Notes / observations

_Use this space to record the device(s) tested, the number of requests in the feed, and anything that
felt slow or off:_
