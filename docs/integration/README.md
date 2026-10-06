# Backend integration — start here

This folder is the plan for connecting the BenchQ frontend to the Python backend, one module at a
time. Each module has its own file with everything needed to do it: the endpoints, the response
shape, a field-by-field mapping, the known gaps, a task checklist, and how to know it's done.

**If you are a Claude session:** read this file, then the module file you were assigned, then
`CLAUDE.md`. Do only the module you were assigned. If the module file and the code disagree, or a
mapping needs a product decision, stop and ask.

---

## First day — from clone to your first module

**You need:** Git, Docker Desktop (running), and Node 22+. On an Apple-silicon Mac,
`node -p process.arch` must print `arm64`. If it prints `x64`, install an arm64 build first (see
"Known setup pitfalls" in `00-foundation.md`).

```bash
# 1. Get the code. Until it's merged, all integration work starts from this branch.
git clone https://github.com/samad-012/BenchQ.git && cd BenchQ
git checkout integration/backend-foundation

# 2. Frontend dependencies
nvm use                      # reads .nvmrc (Node 22)
corepack enable && pnpm install

# 3. Env files (both git-ignored; the defaults work for local development)
cp .env.example .env.local
cp backend/.env.example backend/.env

# 4. Backend + database. The first build takes several minutes (Playwright).
docker compose up -d --build db backend
curl http://localhost:8000/health        # {"status":"ok","service":"JobNavigator",...}

# 5. Frontend
pnpm dev                                 # http://localhost:3000
```

**Check it works:**

- `http://localhost:3000/health` shows the backend's health JSON. That means the frontend → backend
  proxy works.
- `http://localhost:3000/dashboard` renders. Every screen still runs on mock data until a module is
  switched on.
- `pnpm typecheck && pnpm lint && pnpm test` all pass.

**Then pick up a module:**

1. Choose the next free module on the [module board](#module-board) — respect **Depends on** — and
   put your name in **Owner**.
2. Read that module's file end to end.
3. Create your branch from `integration/backend-foundation`: `git checkout -b integrate/<module>`.
4. Follow [the workflow for one module](#the-workflow-for-one-module). If you use Claude, start it
   with the prompt in [Briefing a Claude session](#briefing-a-claude-session).
5. Open your PR **into `integration/backend-foundation`** (or the main branch, once that's merged).

The database starts empty apart from a few seeded companies. To get real data, add companies or
jobs through the backend's API docs at `http://localhost:8000/docs` (e.g. `POST /api/jobs/manual`).
To look inside the database, see [`database-viewer.md`](./database-viewer.md).

---

## The backend

The backend is **JobNavigator** (FastAPI + SQLAlchemy + PostgreSQL, MIT licence, upstream
`github.com/vesaias/JobNavigator`). It lives in `backend/` once Module 00 is done. Its endpoint
reference is `docs/archive/BACKEND_API_FEATURES.md`; when the server runs, the live contract is at
`http://localhost:8000/docs`.

**It was built for one job-seeker, not a staffing firm.** It covers jobs, companies, applications,
resumes and AI tailoring well. It has no concept of candidates, BDEs, firms, roles, claim states,
evidence, follow-up tasks, documents or per-candidate inboxes. Those screens stay on mock data until
a decision is made — see [`06-open-decisions.md`](./06-open-decisions.md).

---

## How data flows

```
Screen / component
   │  uses
   ▼
src/lib/hooks/use-<x>.ts        TanStack Query. Caching, loading/error state, invalidation.
   │  calls
   ▼
src/lib/api/<module>.ts         The adapter. The ONLY file that decides mock vs. real.
   │                    │
   │ isLive(module)?    │ otherwise
   ▼                    ▼
src/lib/api/http.ts     src/mocks/<module>.ts + src/mocks/data/<module>.json
   │                    (temporary — deleted as each module goes live)
   ▼
next.config.ts rewrite  /api/* → BACKEND_URL/api/*   (same origin, so the session cookie works)
   ▼
FastAPI backend
```

Rules that keep this clean:

- **Screens never change during integration.** They consume frontend types (`src/lib/schemas/`).
  If a screen needs to change, that's a product decision — raise it.
- **The backend's shape never leaks past the adapter.** Backend JSON is parsed by a DTO schema and
  converted by a mapper in `src/lib/api/dto/<module>.ts`. Nothing else imports a DTO type.
- **Never edit `src/lib/schemas/` to match the backend.** Those are the frontend's contract. Map to
  them. If a field truly can't be produced, document it in your module file's "Gaps" section and
  ask.

---

## Files you will touch in every module

| File | What you do |
|---|---|
| `src/lib/api/dto/<module>.ts` | **Create.** `Backend<Thing>Schema` (Zod, snake_case, mirrors the backend serializer exactly) + `to<Thing>()` mapper. |
| `src/lib/api/dto/<module>.test.ts` | **Create.** Mapper tests, fed by a real response saved in `src/lib/api/dto/__samples__/<module>.json`. |
| `src/lib/api/<module>.ts` | **Edit.** Add the live branch (template below), then remove the mock branch when done. |
| `src/mocks/<module>.ts`, `src/mocks/data/<module>.json` | **Delete** in the final step. |
| `docs/integration/README.md` | **Edit** the status board below. |

Shared files you should **not** need to edit: `http.ts`, `config.ts` (every module name is
already listed), `client.ts`, `dto/shared.ts`. If you do, say so in the PR.

### Adapter template

```ts
// src/lib/api/analytics.ts — the ledger, as an example
import type { LedgerEntry } from "@/lib/schemas/analytics";
import { arrayOf } from "./client";
import { isLive } from "./config";
import { http } from "./http";
import { BackendActivitySchema, toLedgerEntry } from "./dto/ledger";

const mock = () => import("@/mocks/ledger").then((m) => m.ledgerMock);

export const ledgerApi = {
  list: async (params?: { limit?: number; offset?: number }): Promise<LedgerEntry[]> => {
    if (!isLive("ledger")) return (await mock()).list(params);
    const rows = await http.get("/api/activity-log", arrayOf(BackendActivitySchema), { query: params });
    return rows.map(toLedgerEntry);
  },
};
```

When the module is finished, the `isLive` check, the `mock` import and the mock files all go.

### DTO + mapper template

```ts
// src/lib/api/dto/ledger.ts
import { z } from "zod";
import type { LedgerEntry } from "@/lib/schemas/analytics";
import { toIso } from "./shared";

export const BackendActivitySchema = z.object({
  id: z.string(),
  type: z.string(),
  message: z.string(),
  company: z.string().nullable(),
  details: z.record(z.string(), z.unknown()).nullable(),
  created_at: z.string(),            // timestamps are ALWAYS z.string() here — see below
});
export type BackendActivity = z.infer<typeof BackendActivitySchema>;

export function toLedgerEntry(row: BackendActivity): LedgerEntry { /* … */ }
```

**Timestamps:** FastAPI sends `2026-10-03T10:00:00+00:00` or a zone-less value, and the frontend
schemas reject both. Declare every backend timestamp as `z.string()` and convert with `toIso` /
`toIsoOrNull` from `src/lib/api/dto/shared.ts`.

---

## The workflow for one module

1. **Branch** `integrate/<module>` from `integration/backend-foundation` (from the main branch
   once that branch has been merged).
2. **Run both apps** (see "Running locally" below) and confirm `GET /health` through the proxy.
3. **Capture real responses** from the backend for each endpoint you need, by browser or
   `curl -b cookies.txt`, and save them to `src/lib/api/dto/__samples__/<module>.json`. Trim to a few
   rows. Write the DTO schema from the backend serializer named in your module file, then check it
   parses the sample.
4. **Write the mapper and its tests** against the sample. Every frontend field must be produced;
   anything the backend can't supply gets the default your module file specifies.
5. **Add the live branch** to the adapter. Set `NEXT_PUBLIC_LIVE_MODULES=<module>` (plus any
   dependencies listed in your module file) and click through every screen listed in your module
   file.
6. **Check the states:** loading skeleton shows, an empty backend shows the empty state, and
   stopping the backend shows the error state (not a crash). There must be no `SCHEMA_MISMATCH` in
   the browser console.
7. **Delete the mock:** remove the `isLive` branch, the `mock` import, `src/mocks/<module>.ts` and
   its JSON file. Fix anything that imported them, such as `src/lib/derive/derive.test.ts`.
8. **Update the status board** below and open a PR. The checks must pass.

### Definition of done (per module)

- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test` all clean (Node 22 — see `.nvmrc`)
- [ ] Mapper has tests built from a real backend sample
- [ ] Every screen in the module file works against the real backend, in light and dark mode
- [ ] Skeleton, empty and error states verified with the backend running, empty and stopped
- [ ] No `SCHEMA_MISMATCH` in the console
- [ ] Mock code and JSON for the module deleted; no `isLive("<module>")` left
- [ ] Gaps you hit are written into the module file's "Gaps" section

---

## Module board

Order matters: later modules reference IDs from earlier ones. Work in parallel where the
**Can start** column allows — writing the DTO, mapper and tests never needs the dependency to be
live; only step 5 does.

| # | Module | Difficulty | Depends on | Can start | Owner | Status |
|---|---|---|---|---|---|---|
| 00 | [Foundation: monorepo, connection, auth](./00-foundation.md) | Easy | — | Now | | In progress — Part A done (backend in repo, runs, proxy verified); B/C open |
| 01 | [Ledger (activity log)](./01-ledger.md) | Easy | 00 | After 00 | | Not started |
| 02 | [Jobs (+ companies)](./02-jobs.md) | Medium | 00 | After 00 | | Not started |
| 03 | [Applications](./03-applications.md) | Medium–hard | 02 live | After 00 (live after 02) | | Not started |
| 04 | [Resumes + AI tailoring](./04-resumes-and-tailoring.md) | Hard | 02 live | After 00 (live after 02) | | Not started |
| 05 | [Analytics](./05-analytics.md) | Easy | 03 live | After 03 | | Not started |
| 06 | [Open decisions](./06-open-decisions.md) | — | Product decision | — | Product owner | Waiting |

Status values: `Not started` → `In progress` → `Live behind flag` → `Done (mock deleted)`.

**Why this order:** Module 01 is a read-only list on one screen, so it proves the whole pipeline
(proxy, auth cookie, `http.ts`, DTO, mapper, error states) with the least risk. Jobs come next
because applications and resumes reference job IDs. Mixing a live module with a mocked module it
references breaks joins, because mock IDs (`job_0001`) don't match backend UUIDs.

---

## Running locally

**Requirements:** Node 22+ (`nvm use`), pnpm via corepack, Docker. Python 3.12 only if you run
the backend outside Docker.

| Task | Command |
|---|---|
| Env files (once) | `cp .env.example .env.local` and `cp backend/.env.example backend/.env` |
| Start backend + database | `docker compose up -d db backend` (add `--build` after backend code changes) |
| Backend health | `curl http://localhost:8000/health` |
| Backend logs | `docker compose logs -f backend` |
| Stop backend + database | `docker compose stop` (data is kept in the `pgdata` volume) |
| Frontend | `pnpm dev`, then `http://localhost:3000/health` shows the backend's JSON |
| Switch a module to the backend | add it to `NEXT_PUBLIC_LIVE_MODULES` in `.env.local`, restart `pnpm dev` |
| Backend tests | see "Run it" in [`00-foundation.md`](./00-foundation.md) |
| Look inside the database | [`database-viewer.md`](./database-viewer.md) (Adminer at `http://localhost:8081`) |

The env variables are documented inside `.env.example` (frontend) and `backend/.env.example`
(backend). Restart `pnpm dev` whenever `.env.local` changes, because `NEXT_PUBLIC_*` values are
baked in at start.

---

## Briefing a Claude session

Paste this, changing the module:

> Read `docs/integration/README.md`, then `docs/integration/02-jobs.md`, then `CLAUDE.md`.
> Integrate the Jobs module following the workflow in the README. The backend is running at
> `BACKEND_URL` from `.env.local`. Work only on files the module doc lists. Stop and ask me before
> changing any file in `src/lib/schemas/`, any screen, or any shared file in `src/lib/api/`.
> When done, report against the module's acceptance criteria.
