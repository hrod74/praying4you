# QA Feed Sorting, Filtering, and Performance

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

## Sort scenarios

- [ ] Open the Feed. The default sort is **Newest** and the most recently shared request is at the
      top.
- [ ] Tap **Oldest**. The list reverses: the oldest request is now at the top.
- [ ] Tap **Most prayed**. The request with the highest prayer count is at the top; ties fall back to
      newest first.
- [ ] Tap **Newest** again. The feed returns to newest first.
- [ ] The selected sort pill is clearly highlighted (navy) and the other two are quiet (parchment).

## Filter scenarios

- [ ] Tap a **Category** chip (for example Health). Only requests in that category appear.
- [ ] Tap **All**. Every category appears again.
- [ ] Tap **To pray for**. Only requests you have NOT prayed for appear. Your OWN requests do not
      appear here (you cannot pray for your own).
- [ ] Pray for one of the listed requests. It leaves the "To pray for" list (after the pray
      registers), confirming the filter reflects your own interaction data.
- [ ] Tap **My requests**. Only requests you created appear (matched by account ownership, never by
      display name). An anonymous request you made still appears here for you.
- [ ] While "My requests" is on, confirm no other person's request is shown.

## Combined control scenarios

- [ ] Turn on **Category = Family** and sort **Most prayed**. Only Family requests appear, ordered by
      prayer count. Confirm filtering and sorting work together.
- [ ] Turn on **To pray for** and **Category = Health**. Only Health requests you have not prayed for
      (and are not your own) appear.
- [ ] Turn on **My requests** and change the sort to **Oldest**. Your requests appear oldest first.
- [ ] A clear indication appears when a filter is active: the status line reads "Filters on. N
      requests shown." and a **Reset** button is visible.

## Reset

- [ ] With one or more filters and a non-default sort active, tap **Reset**.
- [ ] The feed returns to the default: Newest first, All categories, no scope filters. The status line
      and Reset button disappear.

## Empty state

- [ ] Apply a filter combination that matches nothing (for example **My requests** + a category none
      of your requests use). A calm empty state appears: "Nothing matches yet ... Try Reset to see the
      whole feed." It is warm and quiet, not an error.
- [ ] Tap **Reset**. The full feed returns.

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

- [ ] Small iPhone (for example iPhone SE / mini): the Sort row, Show toggles, and Category row all
      fit and stay readable. The Category row scrolls horizontally; no chip is clipped. Touch targets
      are comfortable (44pt).
- [ ] Large iPhone (for example Pro Max): the controls do not feel sparse or stretched; the feed
      remains a calm single column.
- [ ] With larger system text (Accessibility text size up), labels remain legible and chips do not
      overlap. Controls still tap reliably.

## Existing flows still work (regression)

- [ ] Create a request still works and it appears in the feed.
- [ ] Edit your request still works; the change shows in the feed/detail.
- [ ] Remove your request still works; it leaves the feed.
- [ ] Pray for another person's request still works (count rises, "Prayed" badge shows).
- [ ] Report another person's request still works.
- [ ] No raw account IDs (UIDs) appear anywhere on the feed or controls.

## Notes / observations

_Use this space to record the device(s) tested, the number of requests in the feed, and anything that
felt slow or off:_
