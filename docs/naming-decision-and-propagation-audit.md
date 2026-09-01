# Naming Decision and Propagation Audit: "Prayer Table"

Document type: Decision record and working checklist
Product: praying4you (repo folder name unchanged; product name decided 2026-09-01 as "Prayer Table")
Owner: Eddie (Heriberto Rodriguez)
Date: 2026-09-01
Status: Decision recorded. Propagation not yet executed pending owner confirmation on the items flagged below.
Related documents: `docs/naming-and-competitive-discovery-brief.md` (the full naming discovery trail and decision gate), `docs/product-roadmap.md`, `docs/product-ideas.md` (IDEA-007)

## The decision

The product's permanent name is "Prayer Table." This was decided 2026-09-01 after four rounds of naming discovery and a deep check on this specific candidate (no collision found anywhere checked, a genuinely positive cultural-resonance finding, and a strong founding story: people leave a prayer request at the table, others pick one up to pray for it). Full detail is in `docs/naming-and-competitive-discovery-brief.md`.

This audit lists every place the old name appears across the repository, grouped by risk, so the propagation happens deliberately rather than as a blind find-and-replace. Nothing in this list has been changed yet.

## Group 1: Do not change

These are technical identifiers, not display text. Changing any of them risks real damage: losing your existing App Store Connect and Google Play Console app history, breaking your Firebase backend connection, or orphaning your EAS build pipeline. A display-name rename does not require touching any of these, and the strong recommendation is to leave all of them exactly as they are.

- **iOS bundle identifier and Android package name**, both currently `com.productsparkstudio.prayingforyou` (`mobile-app/app.json`). Changing this creates what Apple and Google treat as a brand new app, not a renamed one. You would lose your current TestFlight group, your Play internal testing track, and any review history. Recommend keeping this exactly as-is regardless of the display name.
- **Firebase project identity.** Nothing in the app's display name needs to touch your Firebase project configuration. Renaming or recreating a Firebase project is a major undertaking (effectively migrating your backend) and is out of scope for a naming decision.
- **EAS `projectId`** (`0d161eba-4631-418c-a437-4e613a87804d` in `app.json`). This is a stable ID, not text tied to the name. No action needed regardless of the rename.

## Group 2: Lower-risk technical identifiers, worth a deliberate decision before touching

- **`slug` and `scheme` in `app.json`**, both currently `praying4you`. The slug affects how the project appears in your EAS dashboard; the scheme is the app's deep-link URL prefix (`praying4you://`). Neither is visible to end users. Recommend leaving both as-is for now, this is invisible plumbing, not part of the product's public identity, and changing it carries a small, avoidable risk this close to a working beta for no user-facing benefit.
- **`package.json` "name" field** (currently `praying4you`, the internal npm package name). Purely internal, zero user visibility, safe to change whenever convenient. Not urgent.

## Group 3: User-facing app text, real but low-risk code changes (DONE, 2026-09-01, not yet committed)

These are places where "Praying For You" is literally hardcoded as visible text inside the app. Changing them is a genuine code change (not just documentation) but carries no store or backend risk, since none of these touch build configuration or identifiers.

- `mobile-app/app.json`, the `"name"` field (the display name shown under the app icon on the home screen and in store listings). Currently "Praying For You."
- `mobile-app/app/_layout.tsx`, line 38: the splash/loading screen title text. **This is the loading screen you asked about,** see the note below.
- `mobile-app/app/index.tsx`, line 52: the welcome/landing screen title.
- `mobile-app/app/(app)/settings.tsx`, lines 560, 563, 608: the "About" section heading, its description text, and the settings-screen footer.
- `mobile-app/app/(app)/verse.tsx`, line 46: a reflection note under the daily Bible verse ("A gentle prompt from Praying For You").
- `mobile-app/src/utils/contentFilter.ts`, line 7: a code comment describing the product, no functional effect either way.
- `mobile-app/firestore.rules`, line 3: a file header comment, no functional effect either way.

## Group 4: Store-facing materials, already owner-approved under the old name

These need real content and creative rework, not a mechanical find-and-replace, since they were written and approved specifically for "Praying For You."

- `docs/store/Store_Listing_Copy_Draft.md`: title, description, and keywords all reference the old name and its positioning.
- `store-assets/STORE_ASSET_MANIFEST.md` and the actual screenshot and icon files under `store-assets/`: screenshots are captures of the running app, so they show the old name inside the UI itself. These need to be recaptured after the in-app text changes (Group 3), not just relabeled.
- `docs/store/App_Privacy_and_Google_Data_Safety_Worksheet.md`, `docs/store/Age_Rating_Target_Audience_Worksheet.md`, `docs/store/Reviewer_Account_Strategy.md`: each references the product by name and should get a review pass, even where the underlying facts they describe do not change.

## Group 5: Documentation, low priority

Roughly fifty additional markdown files across `docs/` (QA scenario docs, Firebase implementation docs, phase reviews, the root README, `product-requirements.md`, `workflows.md`, `design-direction.md`, and others) reference "Praying For You" descriptively. None of these block a store submission or affect app behavior. Recommend a batch update pass later, not file-by-file right now, once the Group 3 and Group 4 work is settled and stable.

## Group 6: Needs a decision before touching at all

- `legacy-web-app/`: appears to be an earlier, likely-deprecated web prototype. Worth confirming whether this is still relevant to anything before spending time renaming it.
- `.claude/settings.local.json`, `.local/APP_DISTRIBUTION_TRACKER.md`: internal tooling and tracking files, not user-facing. Low priority; update opportunistically.

## On the loading screen specifically

The current loading/splash screen (`_layout.tsx`) shows plain text, just the app name, no imagery. Since the name is now "Prayer Table" and the founding story is "leave and pick up prayers at the table," this is a natural moment to move beyond a text-only splash toward something that carries the metaphor visually (a table, a candle, a simple warm illustration, whatever direction fits the product's calm, sincere tone). That is genuinely a design task, not a documentation one, and deserves its own pass once the text-level rename above is settled, so the visual doesn't have to be redone if anything about the name changes again. Recommend capturing it as a design idea now and tackling it as its own piece of work.

## Suggested execution order, once confirmed

1. Confirm Group 1 stays untouched (bundle identifier, Firebase project, EAS projectId).
2. Decide on Group 2 (recommend: leave alone for now).
3. ~~Update Group 3 (`app.json` display name plus the six source-code text spots), test the app still builds and runs correctly.~~ Done 2026-09-01; typecheck passes; awaiting owner review in-app and approval to commit.
4. Recapture Group 4 store assets and rewrite store copy against the updated in-app text.
5. Batch-update Group 5 documentation.
6. Take on the loading-screen visual redesign as its own design task.

## Change record

| Date | Change | Reason |
|---|---|---|
| 2026-09-01 | Audit created following the naming decision | Owner asked to record the decision and audit every place needing an update before executing any renames |
| 2026-09-01 | Group 3 executed: `app.json` display name and the six in-app source-code text spots changed from "Praying For You" to "Prayer Table" (`_layout.tsx` splash title, `index.tsx` welcome title, `settings.tsx` About heading/paragraph/footer, `verse.tsx` reflection note, plus cosmetic comment updates in `contentFilter.ts` and `firestore.rules`). Verified via grep that no other occurrences remain in these files and that no unrelated files changed. `tsc --noEmit` passes clean. Not yet committed to git; committing is pending owner approval. | Owner approved proceeding while still in beta with a small user set, rather than waiting |
