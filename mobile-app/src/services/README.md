# services/

The **data-access seam** — the only layer that knows where data comes from. Screens
import services, never raw mock data. This is the boundary where Firebase is swapped in
later **without touching the screens**. **Empty in Phase A** (foundation only).

Planned (later phases):

- `prayerService.ts` — reads/writes prayer requests (mock now, Firestore later) (Phase C+).
- `verseService.ts` — returns the day's verse from bundled local data (Phase F).

Rule: nothing in `app/` may import from `src/data/` directly — always go through a service.
