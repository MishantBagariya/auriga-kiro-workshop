# Structure

## Backend layering (`server/src/`)

Every resource (`projects`, `tasks`, `dashboard`) under `modules/` follows the same four-file pattern — match it for any new resource:

```
modules/<resource>/
  <resource>.routes.ts       # wires HTTP method+path to a controller fn, applies validate middleware
  <resource>.controller.ts   # parses req, calls the service, shapes the response, next(err) on failure
  <resource>.service.ts      # Prisma calls + business rules; throws AppError for domain errors
  <resource>.schema.ts       # Zod schemas for request bodies/queries
```

- `lib/prisma.ts` — the one `PrismaClient` singleton; always import from here, never `new PrismaClient()` elsewhere.
- `errors/AppError.ts` — `(statusCode, message, fields?)`. Throw this from services for anything the client should see a clean message for (validation, not-found, bad reference).
- `middleware/errorHandler.ts` — last-mounted middleware in `app.ts`; converts `AppError` → `{error:{message,fields?}}`, anything else → 500 with a generic message (real error logged server-side, never leaked to the client).
- `middleware/validate.ts` — `validateBody(schema)` / `validateQuery(schema)` factories; validated query params land on `req.validatedQuery` (not `req.query`, which Express doesn't let you overwrite cleanly) — controllers read from there.

## Frontend organization (`client/src/`)

```
api/          one file per resource — thin typed wrappers around fetch (client.ts has the shared error-normalizing wrapper)
hooks/        one file per resource — TanStack Query hooks (useXQuery, useCreateX, useUpdateX, useDeleteX)
types/        shared TS types + the ApiError class, mirrors the backend's JSON shapes exactly
components/
  ui/         generic, app-agnostic primitives (Button, Input, Dialog, Badge, Toast, ...) — no business logic, no data fetching
  layout/     AppShell, Sidebar, MobileNav — the persistent chrome
  projects/   project-specific components (forms, cards, badges)
  tasks/      task-specific components (forms, rows, filters bar, badges)
  board/      Kanban-specific components (board/column/card)
  dashboard/  dashboard-specific components (stat tiles, recent/upcoming lists)
pages/        one file per route, composes hooks + components, owns loading/error/empty branching
```

Conventions to keep consistent when adding to any of these:

- **Forms are shared between create and edit.** `ProjectForm`/`TaskForm` take an optional `initialValues` prop and render the same JSX either way; the *Dialog wrapper (`ProjectFormDialog`/`TaskFormDialog`) decides which mutation to call based on whether `project`/`task` was passed in. Don't fork into separate Create/Edit components.
- **Every list-fetching view follows the same loading → error → empty → content branching order** (see any page in `pages/` for the pattern). New views should match it rather than inventing a new loading treatment.
- **Filters/search/sort on the Tasks page live in the URL** (`useSearchParams`), not component state — `TasksPage.tsx` is the single place that reads/writes them. This is what makes filtered views bookmarkable/shareable and survives back/forward navigation for free; don't move this into local `useState`.
- **Mutations invalidate query keys, they don't manually patch the cache** (except the Kanban board's deliberate optimistic update — see [[tech]]). Follow the pattern in `hooks/useTasks.ts` / `useProjects.ts` for anything new: mutate → invalidate the resource list, the single-item query, `['dashboard']`, and any cross-referenced resource (e.g. a task mutation also invalidates its owning project).
- **Badge color mapping is centralized.** `StatusBadge`, `PriorityBadge`, `ProjectStatusBadge` each just map an enum-like string to a `Badge` `variant` — add new variants to `components/ui/Badge.tsx`'s `VARIANT_CLASSES`, don't inline colors elsewhere.

## Where to look first

- Adding a field to Task or Project → `server/prisma/schema.prisma`, then the relevant `*.schema.ts` (Zod), then `*.service.ts` (serialize/map), then the frontend `types/index.ts`, then the relevant form component.
- Adding a new API endpoint → follow the four-file module pattern above; register the router in `server/src/app.ts`.
- Adding a new page/route → add to `client/src/App.tsx`'s `<Routes>` and to `Sidebar.tsx`/`MobileNav.tsx` if it belongs in primary nav.
