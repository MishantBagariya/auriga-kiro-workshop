# TaskFlow — Implementation Plan

## 0. Kiro Setup (.kiro Boilerplate)

Before any code is written, set up the `.kiro` folder to guide AI-assisted development.

### Steering Files (`.kiro/steering/`)

Steering files provide always-on context and standards for every Kiro interaction.

```
.kiro/
└── steering/
    ├── product.md             # Product context — entities, features, UX requirements, constraints
    ├── tech.md                # Tech stack — Next.js, PostgreSQL, Prisma, Tailwind, shadcn/ui
    ├── structure.md           # Project directory layout, naming conventions, file responsibilities
    ├── frontend-standards.md  # TypeScript, React, API routes, forms, state management, a11y
    └── css-standards.md       # Tailwind usage, responsive design, colors, spacing, typography
```

All steering files use `inclusion: always` (loaded into every conversation automatically).

### Hooks (`.kiro/hooks/`)

Hooks automate quality checks during development.

```
.kiro/
└── hooks/
    ├── lint-on-save.json          # Runs ESLint when .ts/.tsx files are saved
    ├── validate-prisma.json       # Validates Prisma schema on save
    ├── review-api-routes.json     # Agent reviews API route conventions on save
    ├── build-check.json           # Runs tsc --noEmit after spec task completion
    └── review-writes.json         # Agent verifies naming/placement before writing files
```

### Hook File Format

```json
{
  "name": "Hook Name",
  "version": "1.0.0",
  "description": "What this hook does",
  "when": {
    "type": "fileEdited | fileCreated | fileDeleted | userTriggered | promptSubmit | agentStop | preToolUse | postToolUse | preTaskExecution | postTaskExecution",
    "patterns": ["glob patterns (for file events)"],
    "toolTypes": ["read | write | shell | web | spec | * (for tool events)"]
  },
  "then": {
    "type": "askAgent | runCommand",
    "prompt": "instruction for agent (askAgent only)",
    "command": "shell command (runCommand only)"
  }
}
```

### When to Create Each

| Item | When | Why |
|------|------|-----|
| Steering files | **Phase 0 — before coding** | Sets standards so all generated code is consistent from day one |
| Hooks (lint, build) | **Phase 1 — once project is scaffolded** | Needs package.json and tooling to exist first |
| Hooks (review) | **Phase 1 — immediately** | Guides agent behavior from first file write |

**Deliverable:** `.kiro/` folder with steering files and hooks ready before scaffolding begins.

---

> **Note:** The authoritative stack and structure are defined in `.kiro/steering/tech.md` and `.kiro/steering/structure.md`. This plan is aligned to those files: a single Next.js (App Router) application with API route handlers and PostgreSQL via Prisma — **not** a separate Express/Vite/SQLite setup. Where this document and the steering files ever diverge, the steering files win.

## 1. Tech Stack Selection

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Framework | Next.js (App Router) + TypeScript | Unified full-stack app; Server Components + route handlers |
| UI Library | Tailwind CSS + shadcn/ui | Utility-first styling, accessible components |
| State Management | TanStack Query (React Query) v5 | Server-state caching, loading/error states built-in |
| Routing | Next.js App Router | File-based routing, layouts, Server Components |
| Backend | Next.js route handlers (`app/api/...`) | No separate server; colocated with frontend |
| Database | PostgreSQL 16+ | Robust relational store, source of truth |
| ORM | Prisma | Type-safe queries, migrations, schema management |
| Validation | Zod | Shared validation schemas between API routes and forms |
| Forms | React Hook Form + `@hookform/resolvers/zod` | Ergonomic forms with Zod validation |
| Notifications | Sonner | Toast feedback |
| Icons | Lucide React | Icon set |
| Date utilities | date-fns | Formatting and date math |
| Build Tool | Next.js (Turbopack/webpack) | Built-in bundling and HMR |

---

## 2. Project Structure

Single Next.js application (see `.kiro/steering/structure.md` for the full layout and file responsibilities).

```
taskflow/
├── app/
│   ├── layout.tsx                  # Root layout (sidebar + main content)
│   ├── page.tsx                    # Dashboard page
│   ├── globals.css                 # Tailwind imports + CSS variables
│   ├── projects/                   # Project list + [id] details pages
│   ├── tasks/                      # Task list + board (Kanban) pages
│   └── api/                        # Route handlers (projects, tasks, dashboard)
├── components/                     # UI by domain (ui, layout, projects, tasks, dashboard, shared)
├── lib/
│   ├── db.ts                       # Prisma client singleton
│   ├── validations/                # Zod schemas (project, task)
│   └── utils.ts                    # cn() helper, formatters
├── hooks/                          # TanStack Query hooks (use-projects, use-tasks)
├── types/                          # Shared TypeScript types
├── prisma/
│   ├── schema.prisma               # Database schema
│   ├── migrations/                 # Database migrations
│   └── seed.ts                     # Optional seed data
├── public/                         # Static assets
├── .env / .env.example             # DATABASE_URL (env not committed)
└── package.json                    # Dependencies and scripts
```

---

## 3. Implementation Phases

### Phase 1 — Foundation (Dependencies + Database)

1. Install project dependencies (Prisma, Zod, TanStack Query, React Hook Form, shadcn/ui, Sonner, Lucide, date-fns)
2. Initialize shadcn/ui and the `cn()` helper (`lib/utils.ts`)
3. Define Prisma schema (Project, Task models with relationships) and `lib/db.ts` singleton
4. Configure `.env` / `.env.example` with `DATABASE_URL`
5. Run initial migration and generate the Prisma client
6. Define shared Zod validation schemas (`lib/validations/`) and the consistent API response helpers

**Deliverable:** Next.js app connected to PostgreSQL via Prisma, with validation schemas ready.

---

### Phase 2 — API Route Handlers

Implemented as Next.js route handlers under `app/api/`.

#### Projects API
- `POST /api/projects` — Create project
- `GET /api/projects` — List all projects (with task counts)
- `GET /api/projects/[id]` — Get project details (with tasks)
- `PUT /api/projects/[id]` — Update project
- `DELETE /api/projects/[id]` — Delete project (cascade tasks)

#### Tasks API
- `POST /api/tasks` — Create task
- `GET /api/tasks` — List tasks (search, filter, sort, paginate)
- `GET /api/tasks/[id]` — Get task details
- `PUT /api/tasks/[id]` — Update task
- `PATCH /api/tasks/[id]/status` — Update task status
- `DELETE /api/tasks/[id]` — Delete task

#### Dashboard API
- `GET /api/dashboard` — Project/task statistics, recent tasks, upcoming tasks

**Deliverable:** Fully functional REST API (route handlers) with validation and error handling.

---

### Phase 3 — Frontend Foundation

1. Replace the create-next-app boilerplate (`layout.tsx`, `page.tsx`, `globals.css`)
2. Set up shadcn/ui base components and the full theme token set in `globals.css`
3. Build the root layout (sidebar + main content area) with App Router navigation
4. Set up the TanStack Query provider (client component wrapping the app)
5. Create TanStack Query hooks (`hooks/use-projects.ts`, `hooks/use-tasks.ts`) calling the route handlers
6. Build shared UI components (loading spinner, empty state, confirm dialog, error message)

**Deliverable:** App shell with navigation, layout, and API connectivity.

---

### Phase 4 — Dashboard

1. Build summary cards (total projects, active, task stats)
2. Build recent tasks list
3. Build upcoming tasks list
4. Connect to dashboard API
5. Add loading and empty states

**Deliverable:** Functional dashboard page.

---

### Phase 5 — Project Management

1. Project list page (cards with name, description, status, task counts)
2. Create project form (modal or page) with validation
3. Project details page (info + task list)
4. Edit project functionality
5. Delete project with confirmation dialog
6. Success/error feedback (toast notifications)

**Deliverable:** Full project CRUD with persistence.

---

### Phase 6 — Task Management

1. Task list page (table/list with title, project, status, priority, due date)
2. Create task form with validation (project selector, status, priority, labels)
3. Task details view
4. Edit task functionality
5. Delete task with confirmation
6. Status change (inline or from details)
7. Success/error feedback

**Deliverable:** Full task CRUD with persistence.

---

### Phase 7 — Search, Filter, and Sort

1. Search bar component (debounced text input)
2. Filter controls (project, status, priority dropdowns)
3. Sort controls (field + direction)
4. Wire filters/sort/search to API query params
5. Empty state for no results

**Deliverable:** Fully functional search, filtering, and sorting.

---

### Phase 8 — Kanban Board View

1. Board layout with three columns (To Do, In Progress, Completed)
2. Task cards within columns
3. Status change mechanism (dropdown or drag-and-drop)
4. Persist status changes via API
5. Responsive layout (horizontal scroll on mobile)

**Deliverable:** Working Kanban board with status updates.

---

### Phase 9 — Polish and Responsiveness

1. Responsive sidebar (collapse to hamburger on mobile)
2. Responsive forms and modals
3. Responsive board view
4. Consistent loading states across all pages
5. Consistent empty states
6. Keyboard accessibility review
7. Final visual polish

**Deliverable:** Production-ready UI across all screen sizes.

---

## 4. API Design Conventions

- RESTful JSON APIs
- Consistent response envelope: `{ data, error, message }`
- HTTP status codes: 200 (OK), 201 (Created), 400 (Validation Error), 404 (Not Found), 500 (Server Error)
- Query params for filtering: `?status=in_progress&priority=high&project=<id>&search=<term>`
- Query params for sorting: `?sortBy=createdAt&order=desc`
- Validation errors return field-level messages

---

## 5. Database Schema (Prisma)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Project {
  id          String   @id @default(uuid())
  name        String
  description String?
  status      String   @default("active") // active, completed, archived
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  tasks       Task[]
}

model Task {
  id          String   @id @default(uuid())
  title       String
  description String?
  status      String   @default("todo") // todo, in_progress, completed
  priority    String   @default("medium") // low, medium, high
  dueDate     DateTime?
  labels      String?  // JSON array stored as string
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  projectId   String
}
```

---

## 6. Key Implementation Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Labels storage | JSON string in DB | Simple for v1, avoids extra table |
| "Upcoming" window | Next 7 days | Reasonable default for dashboard |
| Default sort | Created date, descending | Most recent first |
| Board status change | Dropdown on card | Simpler than drag-and-drop for v1 |
| Pagination | Offset-based, 20 per page | Simple, sufficient for single-user |
| Project updated date | Only on direct project edits | Task changes don't cascade |

---

## 7. Risk & Mitigation

| Risk | Mitigation |
|------|-----------|
| Scope creep | Strict adherence to PRD, no extra features |
| Data loss on delete | Confirmation dialogs, cascade clearly communicated |
| Performance with large datasets | Pagination, indexed queries |
| Responsive complexity | Mobile-first approach, progressive enhancement |

---

## 8. Definition of Done

Each phase is complete when:
- All features in the phase work end-to-end (frontend → API → database → response → UI update)
- Validation works on both client and server
- Error states are handled gracefully
- Loading states are displayed
- Empty states are shown where appropriate
- The UI is responsive
