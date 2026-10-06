# 07 — Routes, UI completion, then RBAC

**Project:** BenchQ · **Status:** plan approved, Phase A not started · **Decisions:** recorded 2026-10-06 (see end)

The sequence:

| Phase | What | Why this order |
|---|---|---|
| **A** | **Route foundation** — one route registry, every specified route present, access screens, client route guard | RBAC needs a single list of routes and who may see them. Today that list is scattered and incomplete |
| **B** | **UI completion** — audit every route × role against the spec and close the gaps | "Perfect UI" needs a checklist; the registry from A is that checklist |
| **C** | **Frontend RBAC** — one permission policy replaces every inline role check | Built on A's registry and B's verified screens |
| **D** | **Real enforcement** — server session, `proxy.ts`, backend checks | Needs real users and roles in the backend (decision D2 in `docs/integration/06-open-decisions.md`) |

Phases A–C are frontend-only and don't depend on backend integration. They can run alongside the
module work in `docs/integration/`.

---

## 1. Current state

### Routes that exist today

| Route | Shell | Who can reach it today |
|---|---|---|
| `/` | — | redirects to `/dashboard` |
| `/sign-in`, `/welcome` | auth (no sidebar) | anyone |
| `/dashboard` | app | every role (different composition per role) |
| `/candidates`, `/candidates/new`, `/candidates/[id]` | app | every role, by URL |
| `/jobs`, `/jobs/capture`, `/jobs/[id]` | app | every role, by URL |
| `/applications`, `/applications/[id]` | app | every role, by URL |
| `/resumes` | app | every role, by URL |
| `/resumes/[id]` (incl. `new`) | studio (full screen) | every role, by URL |
| `/outreach`, `/followups`, `/analytics`, `/ledger`, `/settings` | app | every role, by URL |
| `/focus` | focus (full screen) | every role, by URL |
| `/design-system` | app | every role — and it's in the sidebar for everyone |
| `@modal/(.)candidates/new`, `@modal/(.)jobs/capture` | modal over app | same as the full routes |

### Problems

1. **No single source of truth for routes.** Route data is repeated in four places that already
   disagree:
   - `src/components/layout/sidebar.tsx` hides Follow-ups from VIEWER and Analytics from BDE;
   - the command palette's Navigation group (`src/components/command/command-palette.tsx`) shows
     every route to every role;
   - `g`-shortcuts live in `src/lib/hooks/use-keyboard-shortcuts.ts`;
   - the root redirect in `src/app/page.tsx` always goes to `/dashboard`.
2. **The sidebar hides links, but URLs aren't protected.** Any role can open any route directly:
   - a BDE opening `/analytics` gets a soft "this is a manager view" empty state;
   - a BDE opening `/settings` sees the firm and team settings;
   - a VIEWER can open `/followups`;
   - a BDE can open any `/candidates/[id]`, not just their assigned candidates.
3. **Routes in the spec (`docs/04-SCREENS.md`) that don't exist:** `/sign-up`, `/invite/[token]`,
   `/settings/team`, `/settings/templates`, `/settings/preferences` (one `/settings` page today),
   `/admin`, and the "you don't have access" screen (§12).
4. **No Next.js special files:** there is no `not-found.tsx`, `error.tsx`, `loading.tsx` or
   `global-error.tsx` anywhere in `src/app`, so unknown URLs and crashes fall back to Next's
   defaults.
5. **Role rules are inline and duplicated.** There are 11 `user.role !== "VIEWER"` checks (one in
   each of 11 files) and 8 BDE data filters (`assignedUserIds.includes`,
   `submittedByUserId === user.id`) spread across pages and components. The spec's "BDE sees own actions" on the ledger isn't implemented.
6. **Dev-only screens ship to everyone:** `/design-system` (and its Interactive lab) is in the
   production sidebar.
7. **The role is client-only.** The session is a Zustand store (`src/lib/stores/session-store.ts`)
   switched by the dev RoleSwitcher. The server can't know the role, so Next's server-side tools
   (`proxy.ts`, `forbidden()`) can't be used yet. Guards must be client-side until Phase D.

---

## 2. Target route map

Access levels: **full** — everything · **assigned** — only the BDE's assigned candidates ·
**own** — only records the user created or acted on · **read** — view, no actions rendered ·
**—** — no access (shows the Forbidden screen).

| Route | Shell | OWNER | MANAGER | BDE | VIEWER | Exists? |
|---|---|---|---|---|---|---|
| `/sign-in`, `/sign-up` | auth | public | public | public | public | sign-up **new** |
| `/invite/[token]` | auth | public | public | public | public | **new** |
| `/welcome` | auth | full (first run) | — | — | — | yes (Q4) |
| `/` | — | → landing | → landing | → landing | → landing | yes (landing per role from registry) |
| `/dashboard` | app | full | full | full | read | yes |
| `/candidates` | app | full | full | assigned | read | yes |
| `/candidates/new` | app / modal | full | full | full | — | yes |
| `/candidates/[id]` | app | full | full | assigned | read | yes |
| `/jobs`, `/jobs/[id]` | app | full | full | full | read | yes |
| `/jobs/capture` | app / modal | full | full | full | — | yes |
| `/applications`, `/applications/[id]` | app | full | full | own | read | yes |
| `/resumes` | app | full | full | assigned | read | yes |
| `/resumes/[id]` | studio | full | full | assigned | read (view mode) | yes |
| `/outreach` | app | full | full | own | read | yes |
| `/followups` | app | full | full | own | — | yes |
| `/focus` | focus | full | full | full | — | yes (Q3) |
| `/analytics` | app | full | full | — | read | yes |
| `/ledger` | app | full | full | own | read | yes (BDE "own" **missing**) |
| `/settings` | app | → first allowed section | → first allowed section | → first allowed section | → first allowed section | becomes index (Q1) |
| `/settings/firm` | app | full | — | — | — | **new** |
| `/settings/team` | app | full | full | — | — | **new** |
| `/settings/templates` | app | full | full | — | — | **new** |
| `/settings/preferences` | app | full | full | full | full | **new** |
| `/admin` | app | PLATFORM_ADMIN only | | | | deferred (Q5) |
| `/design-system` | app | dev builds only | | | | yes (gate it) |

Modal intercepts follow the access of the full route they intercept.

---

## Phase A — Route foundation

### A1. The route registry

Create `src/lib/routes/registry.ts`, the **only** place a route is described:

```ts
type Access = "full" | "assigned" | "own" | "read" | "none";

interface RouteDef {
  id: string;                         // "candidates.detail"
  path: string;                       // "/candidates/[id]" — same syntax as the app folder
  title: string;                      // document title and palette label
  shell: "auth" | "app" | "studio" | "focus";
  access: Record<FirmRole, Access> | "public";
  nav?: { section: "workspace" | "preferences"; order: number; icon: LucideIcon };
  shortcut?: string;                  // "g c"
  palette?: boolean;                  // appears in ⌘K Navigation
  parent?: string;                    // route id, for breadcrumbs and "back"
  devOnly?: boolean;                  // hidden and 404 unless NEXT_PUBLIC_SHOW_DEV_ROUTES=true
}
```

Helpers in the same folder: `matchRoute(pathname)`, `accessFor(route, role)`, `navFor(role)`,
`paletteRoutesFor(role)`, `landingFor(role)`, `hrefFor(id, params)`.

Tests in `src/lib/routes/registry.test.ts`:
- every `page.tsx` under `src/app` has a registry entry, and every entry has a page (the test
  walks the folder, so the two can't drift);
- every non-public route defines access for all four roles;
- `landingFor(role)` returns a route that role can open.

### A2. Derive everything from the registry

- Sidebar items, order, icons and visibility → `navFor(role)`. Delete `PRIMARY` / `SECONDARY` /
  `hiddenFor` in `sidebar.tsx`.
- Command palette Navigation group → `paletteRoutesFor(role)`. Delete its hardcoded list.
- `g`-shortcuts → `shortcut` fields.
- Document titles (`<title>`) → `title`.
- Root redirect → `landingFor(role)`.

### A3. Access and error screens

| File / component | Shows |
|---|---|
| `src/components/app/forbidden-state.tsx` | "You don't have access to this page" + the current role + a link to the role's landing route. Not a redirect (spec §12: no redirect loops) |
| `src/app/not-found.tsx` | unknown URL → not-found screen with a link home |
| `src/app/(app)/error.tsx`, `src/app/(studio)/error.tsx`, `src/app/global-error.tsx` | a crash → error card with retry, never a blank page |
| `src/app/(app)/loading.tsx` | route-level skeleton while a segment loads |

### A4. Client route guard

`<RouteGuard>` wraps the content of every shell (app, studio, focus, auth). It matches the
current path in the registry, reads the role from the session store, and renders
`<ForbiddenState>` instead of the page when access is `none`. It re-evaluates when the role
changes; per spec §12, a role switch mid-flight refetches rather than leaving stale data.

### A5. Record-level scope on detail routes

For `assigned` / `own` access, a detail page also checks the record itself:
- `/candidates/[id]` — candidate is assigned to the BDE;
- `/applications/[id]` — submitted by the BDE;
- `/resumes/[id]` — belongs to an assigned candidate.

A record outside scope renders the **not-found** state (Q6), so a BDE can't confirm that a
record exists. Use one helper (`useScopedRecord`), not a check pasted into each page.

### A6. Missing routes

Add them with real layouts and all three states. Full polish is Phase B.
- `/sign-up` and `/invite/[token]` per spec §2.1, including the expired-token state.
- Split settings into `/settings/firm`, `/settings/team`, `/settings/templates` and
  `/settings/preferences` with a settings sub-nav. Move the sections of today's `/settings` page
  into them; `/settings` redirects to the first section the role may open.
- `/admin` is deferred (Q5): not built in this plan.

### A7. Dev-only routes

`/design-system` gets `devOnly: true`: it's absent from nav and the palette, and returns not-found
unless `NEXT_PUBLIC_SHOW_DEV_ROUTES=true`. Default that to `true` in `.env.example` comments for
local work and leave it unset in production.

### Exit criteria for Phase A

- [ ] Registry tests pass; no hardcoded route lists remain in the sidebar, palette or shortcuts
- [ ] For every route × role in §2, a direct URL shows the page, a read-only page, or the
      Forbidden screen exactly as the table says (checked with the RoleSwitcher)
- [ ] BDE opening an unassigned candidate / someone else's application → not-found
- [ ] Unknown URL → not-found; a thrown error → error card with retry
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test` clean; both themes; 1440 / 1024 / 390

---

## Phase B — UI completion

The registry from Phase A becomes the audit list. Every route is checked for every role that can
open it, against `docs/04-SCREENS.md`, `design.md` and `CLAUDE.md`'s definition of done.

### Per-route checklist

- [ ] Matches its section in `docs/04-SCREENS.md` (layout, content, actions)
- [ ] Skeleton, empty, error states; detail routes also not-found
- [ ] Permission rendering: controls the role can't use are **not rendered** (only the export gate
      may show disabled)
- [ ] Keyboard map from 04 §1.3 works; `?` sheet lists exactly what works on this route
- [ ] Light and dark; 1440 / 1024 / 390; `axe` clean; `prefers-reduced-motion` respected
- [ ] No hardcoded colour, size or spacing; no `any`

### Audit board

| Route | OWNER | MANAGER | BDE | VIEWER | Notes |
|---|---|---|---|---|---|
| `/dashboard` | | | | | |
| `/candidates` · `/new` · `/[id]` | | | | | |
| `/jobs` · `/capture` · `/[id]` | | | | | |
| `/applications` · `/[id]` | | | | | |
| `/resumes` · `/resumes/[id]` | | | | | |
| `/outreach` | | | | — | |
| `/followups` | | | | — | |
| `/focus` | | | | — | |
| `/analytics` | | | — | | |
| `/ledger` | | | | | BDE "own actions" filter missing |
| `/settings/*` | | | | | new in Phase A |
| `/sign-in` · `/sign-up` · `/invite/[token]` · `/welcome` | public | | | | |

Mark each cell ✅, ⚠ (with a note), or — (no access by design).

### Known gaps to close in Phase B

- Ledger: BDE sees only their own actions; filters for actor, entity type, action and date range;
  and the diff expander (spec §8.4).
- Ledger shows a dangling `·` when `promptVersion` is null.
- Analytics: its BDE empty-state branch becomes unreachable once Phase A guards the route — delete
  it.
- `/settings/*` sections get their own full UI (member table, invite flow, templates with preview).

---

## Phase C — Frontend RBAC

### C1. One permission policy

Create `src/lib/auth/permissions.ts`:

```ts
type Action =
  | "candidate.create" | "candidate.edit"
  | "application.move" | "application.create"
  | "resume.edit" | "resume.verifyClaim" | "resume.export"
  | "outreach.send" | "followup.complete"
  | "job.capture" | "job.tailor"
  | "team.invite" | "team.changeRole" | "firm.edit" | "templates.edit";

can(user: SessionUser, action: Action, resource?: { assignedUserIds?: string[]; ownerUserId?: string }): boolean
```

The role × action matrix sits at the top of the file as a table. "Assigned" and "own" scope is
decided here from the resource and never repeated in components.

### C2. Replace every inline check

- `useCan(action, resource?)` hook and `<Can action=…>` wrapper. Missing permission → the control
  isn't rendered.
- Replace the 11 `user.role !== "VIEWER"` checks in the `followups`, `candidates`,
  `candidates/[id]`, `applications`, `applications/[id]`, `jobs`, `jobs/[id]`, `outreach` and
  `resumes` pages and in `resume-studio/new-resume.tsx` / `open-resume.tsx`. The candidate tab
  components receive the result as a `canAct` prop; switch them to `useCan` too.
- Grep must return nothing for `role ===` / `role !==` outside `src/lib/auth/` and the registry
  when this phase ends.

### C3. One place for data scoping

`scopeCandidates(user, list)`, `scopeApplications(user, list)`, `scopeLedger(user, list)` replace
the 8 inline BDE filters (`jobs`, `jobs/[id]`, `focus`, `candidates`, `applications`, `outreach`,
`followups`, `resume-studio/new-resume.tsx`). When the backend gains users (D2), these move server-side and the client versions
are deleted.

### C4. Routes use the policy

Route access in the registry becomes a policy rule (`can(user, "route.view", route)`), so the
sidebar, the guard and the controls all answer from one place.

### C5. Tests

A table test covering every role × action, plus the assigned/own cases.

---

## Phase D — Real enforcement (after D2)

Frontend checks are user experience, not security. Real enforcement needs:

1. **Real users and roles in the backend** — `06-open-decisions.md` D2. Every endpoint checks the
   user, their firm and their role, and scopes data server-side. The frontend's `scope*` helpers
   then go away.
2. **A server-readable session** (cookie) instead of the client-only store.
3. **`src/proxy.ts`** (Next.js 16's name for middleware) for *optimistic* redirects only, e.g.
   signed-out → `/sign-in`. Next's docs are explicit: Proxy is not an authorization layer.
4. **`forbidden()` + `src/app/forbidden.tsx`** (experimental `authInterrupts` in Next 16) to return
   a real 403 from server components, replacing the client `RouteGuard` where possible.
5. **Ledger entries** for role changes, invites and permission denials (`ADMIN_ACCESS`, `LOGIN`).

---

## Decisions (recorded 2026-10-06)

All six went with the recommendation. Change a decision here first, then the tables above.

| # | Question | Decision |
|---|---|---|
| Q1 | Settings URL structure | Split into `/settings/firm`, `/settings/team`, `/settings/templates`, `/settings/preferences`; `/settings` redirects to the first section the role may open |
| Q2 | Forbidden route: screen in place or redirect? | Forbidden screen in place (spec §12), no redirect |
| Q3 | Who can use Focus mode? | OWNER, MANAGER and BDE; not VIEWER |
| Q4 | Who sees `/welcome` onboarding? | OWNER only, on first run; everyone else goes to their landing route |
| Q5 | `/admin` and `PLATFORM_ADMIN` | Deferred — outside this plan |
| Q6 | Record outside a BDE's scope | Not-found state, so the record's existence isn't confirmed |
