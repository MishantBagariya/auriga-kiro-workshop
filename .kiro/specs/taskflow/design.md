# Design — TaskFlow

## Overview

TaskFlow is a single Next.js (App Router) application: the frontend, API layer, and data access all live in one project. API route handlers under `app/api/` own business logic and validation; Server Components load pages; Client Components handle interactivity via TanStack Query. PostgreSQL is the source of truth, accessed through a Prisma v7 client (driver adapter) instantiated once in `lib/db.ts`.

This design builds on the completed Phase 1 foundation:
- `lib/db.ts` — Prisma client singleton (PostgreSQL via `@prisma/adapter-pg`)
- `types/index.ts` — shared types + `as const` value sets
- `lib/validations/{project,task}.ts` — Zod schemas (create/update/status/query)
- `lib/api.ts` — response helpers (`success`, `created`, `error`, `notFound`, `validationError`, `handleUnexpected`, `isUuid`)
- `lib/utils.ts` — `cn()` helper

## Architecture

```
Browser (Client Components)
   │  TanStack Query (hooks/use-projects.ts, hooks/use-tasks.ts)
   ▼
Next.js Route Handlers (app/api/**)
   │  Zod validation (lib/validations) + response envelope (lib/api)
   ▼
Prisma Client (lib/db.ts)  ──►  PostgreSQL
```

- **Server Components** render page shells and can pass initial data.
- **Client Components** (`"use client"`) own forms, dialogs, filters, and mutations, wired through TanStack Query hooks that call the route handlers.
- **Route handlers** are the only place that touch Prisma; they validate input, enforce existence checks, and return the consistent envelope.

## Data Serialization

Prisma returns `Date` objects and stores `labels` as a JSON string. A single mapper normalizes DB rows into the API/type shapes:

- `dueDate`, `createdAt`, `updatedAt` → ISO strings (`toISOString()`).
- `labels` → parsed from the stored JSON string into `string[]` (empty array if null/invalid).

Mappers live in `lib/serializers.ts`:
- `serializeProject(project, counts?)`
- `serializeTask(task, { includeProject })`

This keeps route handlers thin and guarantees the frontend always receives the `Project`/`Task`/`TaskWithProject` shapes from `types/index.ts`.

## Data Models

Prisma models (already defined in `prisma/schema.prisma`) and their serialized API shapes (in `types/index.ts`):

- **Project** (`projects` table): `id` (uuid), `name`, `description?`, `status` (`active|completed|archived`), `createdAt`, `updatedAt`, `tasks[]`.
  - API shape `Project` serializes dates to ISO strings; `ProjectWithCounts` adds `totalTasks`/`completedTasks`; `ProjectWithTasks` adds `tasks: Task[]`.
- **Task** (`tasks` table): `id` (uuid), `title`, `description?`, `status` (`todo|in_progress|completed`), `priority` (`low|medium|high`), `dueDate?`, `labels?` (JSON string), `projectId` (FK, cascade delete), `createdAt`, `updatedAt`.
  - API shape `Task` serializes dates to ISO strings and `labels` to `string[]`; `TaskWithProject` adds `project: { id, name }`.
- **Relationship:** Project 1—N Task; deleting a project cascades to its tasks (`onDelete: Cascade`).
- **Dashboard shapes:** `DashboardSummary`, `DashboardData` (summary + `recentTasks` + `upcomingTasks`).
- **List shapes:** `TaskListParams`, `Paginated<T>`.

## Components and Interfaces

### API Layer

All handlers follow the same skeleton:

```ts
export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = createTaskSchema.safeParse(json);
    if (!parsed.success) return validationError(parsed.error);
    // ... existence checks (e.g., project exists) -> notFound()
    const row = await db.task.create({ ... });
    return created(serializeTask(row));
  } catch (err) {
    return handleUnexpected(err);
  }
}
```

### Endpoints

| Method | Path | Purpose | Success |
|--------|------|---------|---------|
| POST | `/api/projects` | Create project | 201 |
| GET | `/api/projects` | List projects with counts | 200 |
| GET | `/api/projects/[id]` | Project details + tasks | 200 |
| PUT | `/api/projects/[id]` | Update project | 200 |
| DELETE | `/api/projects/[id]` | Delete project (cascade) | 200 |
| POST | `/api/tasks` | Create task | 201 |
| GET | `/api/tasks` | List tasks (search/filter/sort/paginate) | 200 |
| GET | `/api/tasks/[id]` | Task details | 200 |
| PUT | `/api/tasks/[id]` | Update task | 200 |
| PATCH | `/api/tasks/[id]/status` | Update status only | 200 |
| DELETE | `/api/tasks/[id]` | Delete task | 200 |
| GET | `/api/dashboard` | Summary + recent + upcoming | 200 |

### Task list querying

`taskListQuerySchema` parses `searchParams` (coercing `page`/`pageSize`). Prisma query:
- `where`: `title contains search (mode insensitive)`, plus optional `projectId`, `status`, `priority`.
- `orderBy`: `{ [sortBy]: order }`. Priority sort maps `low/medium/high` to an order — since priority is stored as a string, sort by a computed rank using a `CASE` is overkill for v1; instead store-agnostic sort uses the string, and a follow-up can add a numeric rank if needed. For v1, priority sort orders alphabetically-adjusted via an in-handler rank map applied after fetch OR by ordering on a derived field. Chosen approach for v1: fetch with DB-level `orderBy` for date fields; for `priority`, order in the handler using a rank map (`{low:0, medium:1, high:2}`) because the dataset is single-user and small.
- Pagination: `skip = (page-1)*pageSize`, `take = pageSize`; total via `count`.

### Project counts

List and detail include `totalTasks` and `completedTasks`. Use Prisma `_count` with a filtered relation where available; otherwise compute via `task.groupBy` or a `count` per status. Chosen approach: `include: { _count: { select: { tasks: true } } }` for total, and a separate `count` for completed, or `groupBy` on status for detail pages.

### Existence and validation rules

- Path ids validated with `isUuid()` → 400 if malformed.
- Project/task lookups that miss → `notFound()` (404).
- Task create/update verifies `projectId` exists → 404 if not.
- Delete on a missing resource → 404.

### Frontend

#### Layout and providers

- `app/layout.tsx` — root layout: `<Sidebar />` + main content, mounts `<Toaster />` (Sonner) and a `<QueryProvider />` client component wrapping `children`.
- `components/providers/query-provider.tsx` — `"use client"`, creates a `QueryClient` (memoized) and wraps children in `QueryClientProvider`.
- `components/layout/sidebar.tsx` — nav links (Dashboard `/`, Projects `/projects`, Tasks `/tasks`, Board `/tasks/board`), active highlight via `usePathname`, responsive collapse on `<lg`.
- `globals.css` — full shadcn/ui token set (`--background`, `--foreground`, `--primary`, `--secondary`, `--muted`, `--accent`, `--destructive`, `--border`, `--input`, `--ring`, radius) in `@theme`.

#### shadcn/ui components

Base components generated into `components/ui/`: `button`, `input`, `textarea`, `label`, `select`, `card`, `dialog`, `badge`, `dropdown-menu`, `sonner` (toaster), `skeleton`, `form`. Installed via the shadcn CLI configured for Tailwind v4.

#### Data hooks (TanStack Query)

`hooks/use-projects.ts` and `hooks/use-tasks.ts` expose query + mutation hooks with consistent keys:
- `["projects"]`, `["projects", id]`
- `["tasks", filters]`, `["tasks", id]`
- `["dashboard"]`

Mutations invalidate related keys (e.g., creating a task invalidates `["tasks"]`, `["projects"]`, the project detail, and `["dashboard"]`). A tiny fetch wrapper (`lib/fetcher.ts`) unwraps the `{ data }` envelope and throws an `ApiClientError` carrying `error`/`details` for the UI.

#### Domain components

Organized per `structure.md`:
- `components/dashboard/` — `summary-cards`, `recent-tasks`, `upcoming-tasks`
- `components/projects/` — `project-card`, `project-form`, `project-delete-dialog`
- `components/tasks/` — `task-list`, `task-card`, `task-form`, `task-filters`, `task-search`, `task-sort`, `task-delete-dialog`, `task-status-select`
- `components/shared/` — `loading-spinner`, `empty-state`, `confirm-dialog`, `error-message`

#### Forms

React Hook Form + `@hookform/resolvers/zod` using the existing create/update schemas. Field errors render below inputs; submit is disabled and shows a spinner while pending; API `details` map onto fields via `setError`. Forms live in dialogs (create/edit) invoked from list/detail pages.

#### Pages

- `app/page.tsx` — Dashboard (fetches `/api/dashboard`).
- `app/projects/page.tsx` — project list + create dialog.
- `app/projects/[id]/page.tsx` — project detail + task list + create-task dialog.
- `app/tasks/page.tsx` — task list with search/filter/sort.
- `app/tasks/board/page.tsx` — Kanban board.

## Styling

- Tailwind v4 utility classes only; `cn()` for conditional/merged classes.
- Priority colors with icon/text (not color alone): low = green, medium = amber, high = red.
- Status colors: todo = slate, in_progress = blue, completed = green.
- Cards `rounded-lg border bg-card p-4 shadow-sm`; badges `rounded-full px-2 py-1 text-xs`.
- Mobile-first; sidebar visible `lg:`, board horizontally scrollable on small screens.

## Error Handling

- Route handlers: `try/catch` → `handleUnexpected` (logs + 500); validation → `validationError` (400 + details); missing → `notFound` (404).
- Frontend reads: TanStack Query `error` state → `error-message` component.
- Frontend mutations: `onError` → Sonner toast ("Something went wrong, please try again" for network/500; field messages for 400).

## Correctness Properties

### Property 1: Consistent envelope
Every API response is either `{ data, message? }` (2xx) or `{ error, details? }` (4xx/5xx). No handler returns a bare value or throws to the client.

**Validates: Requirements 1.1, 1.2, 1.9, 2.3, 3.1**

### Property 2: Validation before persistence
No create/update reaches Prisma unless the body passes its Zod schema; malformed path ids never reach Prisma (400 first).

**Validates: Requirements 1.2, 1.5, 2.3, 2.12**

### Property 3: Referential integrity
A task cannot be created or moved to a non-existent project; deleting a project deletes exactly its tasks and no others (cascade).

**Validates: Requirements 1.8, 2.2**

### Property 4: Serialization invariants
API dates are always ISO strings (or null); `labels` is always a `string[]` (never null or a raw JSON string) on the wire.

**Validates: Requirements 2.4, 2.8, 7.3**

### Property 5: Stat consistency
Dashboard and project counts are derived from the database at read time, so any create/update/delete/status change is reflected on the next fetch (queries are invalidated after mutations).

**Validates: Requirements 1.3, 3.1, 7.6, 10.2**

### Property 6: Filter combinability
Applying multiple task filters narrows results (logical AND); an empty result set is a valid, non-error outcome surfaced as an empty state.

**Validates: Requirements 2.6, 8.2, 8.5**

### Property 7: Idempotent reads
GET endpoints never mutate state.

**Validates: Requirements 1.3, 1.4, 2.4, 3.1**

## Testing Strategy

Manual verification per the plan's Definition of Done, plus:
- Type safety via `tsc --noEmit` (enforced by the build-check hook after each spec task).
- API route smoke tests using lightweight runtime scripts against a running dev server + local PostgreSQL (created/removed as temp scripts, not committed), covering: create/list/get/update/delete for projects and tasks, status patch, cascade delete, and dashboard aggregation.
- Schema behavior already verified in Phase 1.

Automated unit/integration tests are out of scope for v1 unless requested; the design keeps logic in testable units (serializers, query builders) should tests be added later.

## Key Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Labels storage | JSON string in DB, `string[]` in API | Matches PRD/plan; simple for v1 |
| Priority sort | In-handler rank map | Priority stored as string; dataset is small/single-user |
| "Upcoming" window | Next 7 days, excludes completed | Plan default |
| Default task sort | `createdAt desc` | Most recent first |
| Board status change | Dropdown on card | Simpler than drag-and-drop for v1 |
| Pagination | Offset-based, 20/page | Simple, sufficient |
| Serialization | Central mappers in `lib/serializers.ts` | Guarantees consistent API shapes |
| Project `updatedAt` | Only on direct project edits | Task changes don't cascade to project timestamp |
