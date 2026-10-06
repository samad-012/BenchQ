# Module 01 — Ledger (activity log)

**Difficulty:** Easy · **Depends on:** 00 · **Module name:** `ledger` · **Pick this first**

## Why first

It's read-only and used by one screen, one hook and one endpoint, with no IDs that other modules
reference. Getting it live proves the whole chain (proxy → cookie → `http.ts` → DTO → mapper →
screen states) before anyone touches the harder modules.

## Frontend surface

| Kind | Path |
|---|---|
| Screen | `src/app/(app)/ledger/page.tsx` — calls `useLedger({ limit: 100 })`, filters by `actorType` on the client |
| Hook | `src/lib/hooks/use-ledger.ts` (no change expected) |
| Adapter | `src/lib/api/analytics.ts` → `ledgerApi.list` |
| Frontend type | `LedgerEntrySchema` in `src/lib/schemas/analytics.ts` |
| Mock to delete | `src/mocks/ledger.ts`, `src/mocks/data/ledger.json` |

## Backend endpoint

`GET /api/activity-log?limit=<0..1000>&offset=<n>&type=<exact>&company=<substring>`
Source: `get_activity_log` in `backend/main.py`. Returns a **bare array**, newest first:

```json
[
  {
    "id": "6f1c…",
    "type": "scrape",
    "message": "Scraped 14 new jobs from Stripe",
    "company": "Stripe",
    "details": { "...": "free-form, varies by type" },
    "created_at": "2026-10-03T10:00:00+00:00"
  }
]
```

`type` values written by the backend today (`log_activity("<type>", …)` calls): `scrape` (most
common), `cv_score`, `email`, `telegram`, `persona`. `company` and `details` may be `null`.

## Field mapping → `LedgerEntry`

| Frontend field | Source | Rule |
|---|---|---|
| `id` | `id` | as is |
| `actorUserId` | — | `null` (backend has no users) |
| `actorType` | `type` | `cv_score` → `"AGENT"`; everything else → `"SYSTEM"` |
| `actorName` | `type` | `cv_score` → `"Scoring agent"`; `scrape` → `"Scraper"`; `email` → `"Inbox monitor"`; `telegram` → `"Notifier"`; else `"System"` |
| `entityType` | `type` | `scrape` → `"company"`; `cv_score` → `"job"`; `email` → `"application"`; `persona` → `"persona"`; else the raw `type` |
| `entityId` | `details` | `details.job_id ?? details.company_id ?? details.application_id ?? id` (check real `details` keys in your sample and adjust) |
| `entityLabel` | `company` | `company ?? type` |
| `action` | `type` | `cv_score` → `"AI_GENERATE"`; `email` → `"STATE_CHANGE"`; else `"UPDATE"` |
| `summary` | `message` | as is |
| `modelId` | `details` | `details.model` if it's a string, else `null` |
| `promptVersion` | — | `null` |
| `evidenceIds` | — | `[]` |
| `claimState` | — | `null` |
| `createdAt` | `created_at` | `toIso(created_at)`. If the backend ever sends `null`, drop the row and log it in dev |

These category mappings are judgment calls. Write them as one lookup table at the top of
`dto/ledger.ts` so they're easy to change.

## Tasks

- [ ] Capture a real `/api/activity-log?limit=20` response into `src/lib/api/dto/__samples__/ledger.json`
      (run a scrape or score first so it isn't empty)
- [ ] `src/lib/api/dto/ledger.ts`: `BackendActivitySchema` + `toLedgerEntry` (template in the README)
- [ ] `src/lib/api/dto/ledger.test.ts`: every sample row maps and passes `LedgerEntrySchema.parse`;
      one test per `type` mapping
- [ ] Live branch in `ledgerApi.list`, passing `limit` / `offset` through as query params
- [ ] With `NEXT_PUBLIC_LIVE_MODULES=ledger`: the ledger screen renders, actor filter works,
      paging works
- [ ] Delete the mock and JSON, remove the `isLive` branch

## Gaps (write new ones here)

- **No user actors.** Every row is SYSTEM/AGENT. The "USER" filter will be empty until the backend
  records who did what — see `06-open-decisions.md` → "Users, roles and firms".
- **No claim states or evidence** on backend events, so that column shows "—".
- **AI runs are logged elsewhere.** Tailoring and scoring runs live in `GET /api/monitor/history`
  (`JobRun` rows: `job_type`, `status`, `started_at`, `meta`). Merging them into the ledger as
  `AI_GENERATE` rows is a good follow-up once this module is done. Keep it out of the first PR.
- The screen renders `modelId · promptVersion`; with `promptVersion: null` it shows a dangling
  "·". Flag it to the UI owner instead of faking a version.

## Acceptance criteria

- [ ] Ledger shows backend activity, newest first, with correct actor / action tags
- [ ] Empty backend → the ledger's empty state, not a blank table
- [ ] Backend stopped → error state with retry; restarting the backend and retrying recovers
- [ ] No `SCHEMA_MISMATCH` in the console; mock deleted; checks green
