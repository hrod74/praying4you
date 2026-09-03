# QA: Correct an accidental prayer

## Current status

**IMPLEMENTED, AUTOMATED QA IN PROGRESS, PHYSICAL-DEVICE QA PENDING, 2026-09-02.**

The correction flow removes only the signed-in user's private interaction and decrements the
request's aggregate prayer count by exactly one in the same transaction. It never exposes who
prayed and never permits the count to fall below zero.

## Scenario 1: Immediate Undo

- [x] From the feed, tap **Pray** on another person's request
- [x] Confirm the count increases by one and a brief confirmation offers **Undo**
- [x] Tap **Undo** and confirm the card returns to Pray and the count decreases by one
- [x] Repeat from prayer detail and confirm the same behavior
- [x] Let the confirmation expire and confirm the prayer remains recorded

## Scenario 2: Persistent correction

- [x] Open a request already marked as prayed
- [x] Confirm the quiet **Undo prayer** link appears beneath the prayed confirmation
- [x] Tap it, cancel the confirmation, and confirm nothing changes
- [x] Confirm the correction; verify the prayed state clears and the count decreases by one
- [x] Confirm the request disappears from **Prayers I've prayed for**

## Scenario 3: Retry and consistency

- [x] Rapidly tap the correction action and confirm only one decrement occurs
- [x] After correcting, revisit the request and confirm no correction action remains
- [x] Close and reopen the app and confirm the corrected state persists
- [x] In airplane mode, attempt a Firebase-backed correction and confirm safe error copy appears
- [x] Restore connectivity and confirm the correction can be retried

## Scenario 4: Regression and accessibility

- [x] Confirm a user still cannot pray for their own request
- [x] Confirm praying remains one-per-user-per-request
- [x] Confirm other users' prayer marks are never shown
- [ ] With VoiceOver/TalkBack, confirm both Undo actions are announced as buttons
- [x] Confirm Light and Dark appearance changes do not interrupt or corrupt the correction flow

## Automated coverage

- Local correction removes only the caller's matching interaction and is idempotent
- Firestore permits only an exact `-1` tied to deletion of the caller's matching interaction
- Firestore rejects a bare decrement, a decrement larger than one, another user's deletion, and a
  decrement from zero
- Existing interaction, privacy, request, report, account, appearance, and environment regressions
  remain part of the full release suite

## QA notes

```text
- Pending owner physical-device QA.
```
