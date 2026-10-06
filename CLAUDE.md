# CLAUDE.md — BenchQ Frontend

Visual update (September 23, 2026): `design.md` v3 supersedes earlier visual
specifications. Use the compact frosted shell, white workspace, monospace tags,
and subtly raised gradient primary buttons shown at `/design-system`.

Instructions for Claude Code working in this repository. Read this before any task.

---

## Scope — read this first

**The frontend is built; the work now is connecting it to the backend, one module at a time.**
The backend is JobNavigator (FastAPI, Python) and lives in `backend/` once
`docs/integration/00-foundation.md` is done. Each module is served either by its mock
(`src/mocks/`) or by the backend, decided only in its adapter (`src/lib/api/<module>.ts`).

**Integration tasks start at `docs/integration/README.md`** — the data flow, the per-module
workflow, the module board and the definition of done. Each module has its own file there.

Swapping a module to the backend must never require rewriting a screen: map the backend's
response to the frontend types in a DTO mapper (`src/lib/api/dto/`). If a screen must change,
that's a product decision — stop and ask.

**Do not build in the frontend:** database code · Next.js API route handlers (the backend is
FastAPI, reached through the `next.config.ts` proxy) · LLM calls (the backend owns AI) ·
background workers · Stripe.

**Backend changes** belong to the backend owner. Make one only when your module file says so, or
after asking.

---

## What BenchQ is

A multi-tenant B2B SaaS for US-focused IT staffing firms. The daily user is a **bench-sales
recruiter (BDE)** working **6:30 PM – 12:30 AM IST** to overlap US business hours, managing 5–10
candidates and submitting 20–30 applications per candidate per day — today, all by hand.

Two core features drive every design decision:

1. **Time compression.** Cut the BDE's manual work. Every extra click is a real cost at 11pm on
   application forty.
2. **Total transparency.** The owner and manager can see exactly how many BDEs are working on how
   many applications, for how many candidates, at what stage, at any moment.

`product.md` has the full picture — the user, his night, the vocabulary, the constraints, the
principles for judgment calls. **Read it once at the start of a session.** When a spec doesn't
cover a case, it's the file that decides.

---

## Before you start any task

1. **Backend integration task?** Read `docs/integration/README.md`, then your module's file.
   Otherwise read `docs/06-IMPLEMENTATION-PLAN.md` and find which **phase** the task belongs to.
2. Read the doc that owns the area:
   - Connecting a module to the backend → `docs/integration/`
   - Why, who for, vocabulary, judgment calls → `product.md`
   - Stack, folders, routing → `docs/01-FRONTEND-ARCHITECTURE.md`
   - Types and shapes → `docs/02-DATA-CONTRACTS.md`
   - Fixtures → `docs/03-MOCK-DATA.md`
   - Layouts and states → `docs/04-SCREENS.md`
   - Components and props → `docs/05-COMPONENTS.md`
   - Colour, type, spacing, motion → `design.md`
3. **Do not work ahead into a later phase.** If a task needs something from a later phase, say so
   and stop.

---

## Non-negotiable rules

### Design tokens
`design.md` is the single source of truth for colour, type, spacing and motion.
**Never hardcode a hex value, a px font size, or a raw spacing number.** Everything comes from the
Tailwind theme tokens. If a token you need doesn't exist, propose adding it — don't inline a value.

### Light is the default
Light theme renders first; dark is the option the user turns on. Both must work, always — and
because the product is used at night for six hours, dark will see heavy use even though it isn't
the default. Test every component in both before reporting done.

### The three claim states
`VERIFIED` / `UNVERIFIED` / `CONTRADICTED` are the product's core concept and they appear across many screens.

- Always render **label + icon + colour**, never colour alone.
- `VERIFIED` uses the brand colour — evidence-backed, cleared to send.
- `UNVERIFIED` is grey with a dashed border — drafted, no evidence yet, needs review.
- `CONTRADICTED` is red with a line-through — contradicts the evidence, never ships.
- A resume with any `UNVERIFIED` claim **cannot be exported.** The export button is blocked with a
  message naming the count and a jump-to-claim link.

### Every number is derived
Counters on dashboards and stat blocks are computed from the mock event arrays, never stored as a
literal in a fixture. If a fixture says `applicationsSubmitted: 42`, that's a bug — it must be
`applications.filter(...).length`. This mirrors the real backend contract and catches drift early.

### No mouse required
Every primary action has a keyboard path. `⌘K` opens the command palette. `J`/`K` move through
lists, `Enter` opens, `Esc` goes back. The full map is in `docs/04-SCREENS.md`.

### Three states, always
Every list, panel and data surface ships with **skeleton**, **empty** and **error** states. A
component that only handles the happy path is incomplete.

---

## Conventions

**TypeScript** — `strict: true`. No `any`. No `@ts-ignore`. Zod schemas in
`src/lib/schemas/` are the source of truth; infer types from them, don't write parallel interfaces.

**React** — Server Components by default; `'use client'` only for state, effects or browser APIs.
Data through TanStack Query hooks (`src/lib/hooks/`) against the adapters in `src/lib/api/` —
never call an adapter, `fetch`, a mock or a JSON fixture from a component. The only `fetch` in the
app is in `src/lib/api/http.ts`.

**Naming** — files `kebab-case.tsx`, components `PascalCase`, hooks `use-thing.ts`. Booleans read
as assertions: `isActive`, `hasEvidence`, `canExport`.

**Styling** — Tailwind v4 utility classes. `cn()` from `src/lib/utils.ts` for conditional classes.
No CSS modules, no styled-components, no inline `style` except for computed dimensions.

**Components** — shadcn/ui primitives live in `src/components/ui/` and are edited in place.
Domain components go in `src/components/app/`. A component over ~200 lines should be split.

**Accessibility** — WCAG 2.1 AA. Visible focus ring on everything interactive. `axe` clean.
Respect `prefers-reduced-motion`.

---

## Commands

Node 22+ (`.nvmrc`); Vitest won't start on older Node.

```bash
pnpm dev          # dev server (reads .env.local — see docs/integration/README.md)
pnpm build        # production build
pnpm typecheck    # tsc --noEmit
pnpm lint         # eslint
pnpm test         # vitest
```

---

## Definition of done

- [ ] `pnpm typecheck` clean
- [ ] `pnpm lint` clean
- [ ] Renders correctly in **both** themes
- [ ] Fully keyboard operable
- [ ] Skeleton, empty and error states all present
- [ ] No hardcoded colours, sizes or spacing
- [ ] No `any`, no `@ts-ignore`
- [ ] Works at 1440px, 1024px and 390px widths
- [ ] `axe` reports no violations

---

## Things you must not do

- Do not make a network call outside `src/lib/api/http.ts`, or let a backend (snake_case) shape
  escape `src/lib/api/dto/`.
- Do not edit `src/lib/schemas/` to fit the backend — map to it, or stop and ask.
- Do not call an LLM from the frontend. AI comes from the backend; mocked modules simulate it.
- Do not hardcode AI-generated text inside a component.
- Do not hardcode a colour, a font size, or a spacing value.
- Do not produce a `VERIFIED` claim — in mock data or in a backend mapper — without an attached
  `evidenceId`.
- Do not bypass the export gate on resumes with unverified claims.
- Do not store a derived counter as a literal.
- Do not add a dependency without checking it against `docs/01-FRONTEND-ARCHITECTURE.md §3`.
- Do not use emoji as UI iconography — use the icon set named in `docs/05-COMPONENTS.md`.

---

## When you're unsure

Stop and ask. Especially for: changes to the claim-state model, changes to the data contracts,
anything listed in `docs/integration/06-open-decisions.md`, a change to the backend, or a
contradiction between two docs.

A stopped task with a clear question beats a confident wrong implementation.

---

## Current phase

> **Update this line as you progress.**

**Backend integration.** All UI stages (1–4 in `plan.md`) are built and render on mocks;
typecheck and lint are clean. The frontend is prepared for integration: HTTP client, backend
proxy, per-module live switch and per-module mocks are in place. Module status lives on the board
in `docs/integration/README.md` — the next step is Module 00 (bring `backend/` in, connect, auth).
