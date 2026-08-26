---
inclusion: manual
---

# TaskFlow — Tech Stack

Related steering: reference `#product` for what we're building and the domain vocabulary, `#architecture` for how these pieces interact, `#structure` for the folder layout, `#api-standards` for the HTTP contract.

This stack is decided. Do not introduce an alternative to anything listed here without an explicit decision from the user.

## Shape of the repo

A single git repository containing two applications, wired together with npm workspaces:

- `frontend/` — the React single-page application
- `backend/` — the Express API server

MongoDB runs separately, either locally or as a hosted cluster. It is not part of the repo.

## Frontend

| Concern | Choice | Why |
|---|---|---|
| UI library | React | Chosen. Function components and hooks only; no class components. |
| Language | TypeScript | Chosen. Strict mode on. |
| Build tool / dev server | Vite | Chosen. Fast HMR, native ESM, first-class TS. |
| Styling | Tailwind CSS | Chosen. Utility classes in JSX. |
| Routing | React Router | Needed for the dashboard / projects / tasks sections, project detail and task detail routes, and for keeping filter state in the URL. |
| Server state | TanStack Query | Fetching, caching, loading and error state, and cache invalidation after mutations. This is what makes "every view handles loading and error" cheap instead of manual. |
| Forms | React Hook Form | Uncontrolled-by-default form state, low re-render cost, straightforward field-level error display. |
| Schema validation | Zod | One schema shape used for client-side validation, and the same library used on the server, so validation rules read the same on both sides. |
| Icons | lucide-react | Consistent icon set, tree-shakeable. Optional but preferred over ad-hoc SVGs. |

## Backend

| Concern | Choice | Why |
|---|---|---|
| Runtime | Node.js | Chosen. Current LTS. ESM modules. |
| Language | TypeScript | Chosen. Strict mode on. |
| HTTP framework | Express | Chosen. Minimal, well understood, middleware model fits the validate → controller → error handler pipeline. |
| Database | MongoDB | Chosen. Document model suits projects with embedded-free task references. |
| Data access | Mongoose | Schemas give us required-field and enum enforcement at the data layer, plus `timestamps` and a `toJSON` transform in one place. |
| Validation | Zod | Request body, params, and query validation in middleware, before any controller runs. |
| CORS | cors | The Vite dev server runs on a different origin than the API in development. |
| Logging | morgan | Request logging in development. |
| Dev reload | tsx watch | Runs TypeScript directly with reload, no separate build step during development. |

## Testing and quality

| Concern | Choice | Notes |
|---|---|---|
| Test runner | Vitest | Same runner both sides of the repo, shares Vite's TS handling. |
| API testing | Supertest | Drives the Express app in-process; no need to bind a port. |
| Test database | mongodb-memory-server | Real MongoDB semantics per test run, no shared state, no fixture cleanup between suites. |
| Component testing | React Testing Library | Query by role and label, not by class name or test ID where a role exists. |
| Linting | ESLint | With `typescript-eslint`. |
| Formatting | Prettier | Including `prettier-plugin-tailwindcss` so class order is deterministic. |

## Versions

Write code against the current majors: React 19, Vite 7, Tailwind CSS 4, Express 5, Mongoose 8, TypeScript 5.

Exact versions are pinned in `package.json` at scaffold time, not here. This document must not carry version numbers that will drift out of date.

Two of those majors changed setup in ways that will bite if you follow older guidance:

**Tailwind CSS 4 is CSS-first.** Install `@tailwindcss/vite` and register it as a Vite plugin. Pull Tailwind in from the main stylesheet with a single `@import "tailwindcss";`. There is no `tailwind.config.js`, no `postcss.config.js`, and no `@tailwind base/components/utilities` triple. Theme customisation (colours, spacing, fonts) happens in CSS via `@theme`. If you find yourself creating a JS config file, you are following v3 instructions.

**Express 5 handles async errors itself.** A rejected promise from an async route handler propagates to the error-handling middleware automatically, so a `catch` that only calls `next(err)` is redundant. We still keep a small `asyncHandler` wrapper for explicitness and consistency across handlers; see `#architecture`. Note also that Express 5 dropped some v4 route-path patterns and changed a few method signatures, so v4 snippets are not guaranteed to work as-is.

## Commands

Root `package.json` declares the workspaces and the scripts a developer actually types:

| Command | Effect |
|---|---|
| `npm install` | Installs both workspaces from the root. Never install from inside `frontend/` or `backend/`. |
| `npm run dev` | Runs backend and frontend together, via `concurrently`. |
| `npm run dev --workspace backend` | Backend alone. |
| `npm run dev --workspace frontend` | Frontend alone. |
| `npm run build` | Type-checks and builds both workspaces. |
| `npm test` | Runs both test suites once, non-watch. |
| `npm run lint` | Lints both workspaces. |

Add a dependency with `npm install <pkg> --workspace frontend` or `--workspace backend`. Root dependencies are for tooling that spans both, nothing else.

Long-running processes (`npm run dev`, any `--watch` mode) are for the developer's own terminal. Use `--run` with Vitest for one-shot test runs.

## Environment variables

Names only. Never commit real values.

Backend, read from `backend/.env`:

| Variable | Purpose |
|---|---|
| `PORT` | Port the API listens on. |
| `MONGODB_URI` | MongoDB connection string. |
| `CORS_ORIGIN` | Allowed browser origin for API requests. |
| `NODE_ENV` | `development`, `test`, or `production`. |

Frontend, read from `frontend/.env`. Vite only exposes variables prefixed `VITE_`:

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | Base URL of the API. |

Rules:

- Every workspace that reads env vars ships a committed `.env.example` listing every variable with a safe placeholder value.
- `.env` and `.env.*` (except `.env.example`) are gitignored. Never commit one.
- The backend validates its environment with Zod at startup, in `src/config/env.ts`, and exits with a clear message if a required variable is missing. No `process.env` access anywhere else in the codebase.
- Never put a secret in a `VITE_`-prefixed variable. Those are compiled into the client bundle and are public.

## Do not use

Each of these is ruled out for a reason. Treat them as errors in review.

**Browser storage as a source of truth.** `localStorage` and `sessionStorage` must not hold projects or tasks. The database is the source of truth, and every core operation goes through the API. Storing a UI preference such as list-vs-board is acceptable; storing domain data is not.

**`any`.** TypeScript strict mode, no `any`, no non-null assertion (`!`) used to silence a real possibility of null. Use `unknown` plus narrowing at genuine boundaries such as caught errors. Do not disable type errors with `@ts-ignore`; use `@ts-expect-error` with a comment if truly unavoidable.

**CSS-in-JS and per-component CSS files.** No styled-components, no Emotion, no CSS modules, no `Component.css` next to `Component.tsx`. Styling is Tailwind utilities in the markup. Global styles and `@theme` customisation live in exactly one stylesheet.

**Redux, MobX, Zustand, or any global store.** Server data belongs to TanStack Query, form data to React Hook Form, filter and view state to the URL, everything else to local `useState`. See the state ownership table in `#architecture`. Adding a global store means one of those four homes is being bypassed.

**The raw MongoDB driver alongside Mongoose.** All database access goes through Mongoose models so schema rules, timestamps, and the `id` transform apply uniformly. Mongoose aggregation pipelines are fine; a second parallel client is not.

**Business logic in controllers.** Controllers read the validated request, call one service function, and shape the response. Validation lives in middleware, business rules and database work live in services. A controller that builds a query or computes a statistic is in the wrong place.

**Fetching with bare `fetch` scattered through components.** All HTTP goes through the shared API client and per-feature api modules, so the base URL, headers, error envelope unwrapping, and error typing are handled once.

**A UI component library.** No MUI, Chakra, Ant, or Bootstrap. Shared primitives are hand-built in `components/ui` on top of Tailwind, so they stay small and consistent. Headless, unstyled primitives for genuinely hard accessibility problems (focus-trapped dialogs, comboboxes) are acceptable if the need arises, but check first.
