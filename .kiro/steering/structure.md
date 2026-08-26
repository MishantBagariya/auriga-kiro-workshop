---
inclusion: manual
---

# TaskFlow — Project Structure

Related steering: reference `#architecture` for why the layers are separated this way, `#tech-stack` for the tooling, `#api-standards` for the endpoints the api modules call, `#product` for the domain vocabulary.

This is the target layout. When adding a file, put it where this document says, even if the surrounding folder is still sparse.

## Repository root

```
auriga-kiro-workshop/
├── .kiro/
│   └── steering/
│       ├── product.md
│       ├── tech-stack.md
│       ├── architecture.md
│       ├── structure.md
│       └── api-standards.md
├── docs/
│   └── product-requirements.md      copy of the PRD, authority on scope
├── backend/
├── frontend/
├── .gitignore
├── package.json                     npm workspaces, root scripts only
└── README.md
```

The root `package.json` declares `workspaces: ["backend", "frontend"]` and holds only cross-workspace scripts and tooling. No application dependency belongs at the root.

## Backend

```
backend/
├── src/
│   ├── server.ts                    entry point: connect to DB, then listen
│   ├── app.ts                       builds the Express app; exported for tests
│   ├── config/
│   │   └── env.ts                   Zod-validated env; the only process.env reader
│   ├── db/
│   │   └── connect.ts               Mongoose connection and disconnection
│   ├── models/
│   │   ├── project.model.ts
│   │   └── task.model.ts
│   ├── modules/
│   │   ├── projects/
│   │   │   ├── project.routes.ts
│   │   │   ├── project.controller.ts
│   │   │   ├── project.service.ts
│   │   │   └── project.validation.ts
│   │   ├── tasks/
│   │   │   ├── task.routes.ts
│   │   │   ├── task.controller.ts
│   │   │   ├── task.service.ts
│   │   │   └── task.validation.ts
│   │   └── dashboard/
│   │       ├── dashboard.routes.ts
│   │       ├── dashboard.controller.ts
│   │       └── dashboard.service.ts
│   ├── middleware/
│   │   ├── validate.ts              runs a Zod schema over body, params, query
│   │   ├── errorHandler.ts          last middleware; produces the error envelope
│   │   ├── notFound.ts              unmatched routes to 404 NOT_FOUND
│   │   └── asyncHandler.ts          wraps async handlers
│   ├── errors/
│   │   └── AppError.ts              status + code + message, thrown by services
│   ├── types/
│   │   └── index.ts                 shared backend types
│   └── utils/
│       └── pagination.ts            page and limit parsing, meta construction
├── tests/
│   ├── setup.ts                     mongodb-memory-server lifecycle
│   ├── projects.test.ts
│   ├── tasks.test.ts
│   └── dashboard.test.ts
├── .env.example
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

Notes that matter:

- `app.ts` builds and returns the Express app without listening. `server.ts` does the listening. Supertest imports `app.ts`, which is why the split exists.
- Every module is one resource. A module's four files always play the same roles: routes wire, validation declares Zod schemas, controller adapts HTTP, service holds logic and database access. `dashboard` has no validation file because it takes no input beyond optional query params with defaults; add one if that changes.
- `notFound.ts` is registered after all routes and before `errorHandler.ts`. Order is load-bearing.

## Frontend

```
frontend/
├── src/
│   ├── main.tsx                     mounts React, installs providers
│   ├── App.tsx                      router outlet inside the app shell
│   ├── index.css                    @import "tailwindcss" and @theme customisation
│   ├── routes/
│   │   ├── index.tsx                route definitions
│   │   ├── DashboardPage.tsx
│   │   ├── ProjectsPage.tsx
│   │   ├── ProjectDetailPage.tsx
│   │   ├── TasksPage.tsx
│   │   └── TaskDetailPage.tsx
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Textarea.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Spinner.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── ErrorState.tsx
│   │   │   ├── ConfirmDialog.tsx
│   │   │   └── Toast.tsx
│   │   └── layout/
│   │       ├── AppShell.tsx          sidebar plus main content area
│   │       ├── Sidebar.tsx           dashboard, projects, tasks; active highlight
│   │       └── TopBar.tsx            mobile nav toggle, page title
│   ├── features/
│   │   ├── dashboard/
│   │   │   ├── api/dashboard.api.ts
│   │   │   ├── hooks/useDashboard.ts
│   │   │   └── components/
│   │   │       ├── StatCard.tsx
│   │   │       ├── RecentTasks.tsx
│   │   │       └── UpcomingTasks.tsx
│   │   ├── projects/
│   │   │   ├── api/projects.api.ts
│   │   │   ├── hooks/
│   │   │   │   ├── useProjects.ts
│   │   │   │   ├── useProject.ts
│   │   │   │   ├── useCreateProject.ts
│   │   │   │   ├── useUpdateProject.ts
│   │   │   │   └── useDeleteProject.ts
│   │   │   ├── components/
│   │   │   │   ├── ProjectList.tsx
│   │   │   │   ├── ProjectCard.tsx
│   │   │   │   ├── ProjectForm.tsx
│   │   │   │   ├── ProjectFormDialog.tsx
│   │   │   │   └── ProjectStatusBadge.tsx
│   │   │   └── types.ts              form and view-model types only
│   │   └── tasks/
│   │       ├── api/tasks.api.ts
│   │       ├── hooks/
│   │       │   ├── useTasks.ts
│   │       │   ├── useTask.ts
│   │       │   ├── useTaskFilters.ts       reads and writes URL search params
│   │       │   ├── useCreateTask.ts
│   │       │   ├── useUpdateTask.ts
│   │       │   ├── useUpdateTaskStatus.ts
│   │       │   └── useDeleteTask.ts
│   │       ├── components/
│   │       │   ├── TaskList.tsx
│   │       │   ├── TaskRow.tsx
│   │       │   ├── TaskBoard.tsx
│   │       │   ├── TaskBoardColumn.tsx
│   │       │   ├── TaskCard.tsx
│   │       │   ├── TaskFilterBar.tsx       search, project, status, priority, sort
│   │       │   ├── TaskForm.tsx
│   │       │   ├── TaskFormDialog.tsx
│   │       │   ├── TaskStatusBadge.tsx
│   │       │   ├── TaskPriorityBadge.tsx
│   │       │   └── ViewToggle.tsx           list or board
│   │       └── types.ts
│   ├── lib/
│   │   ├── apiClient.ts             the only place that speaks HTTP
│   │   ├── queryClient.ts           TanStack Query client and defaults
│   │   ├── queryKeys.ts             the key hierarchy in one place
│   │   ├── labels.ts                status and priority display labels and variants
│   │   └── format.ts                date formatting, relative dates, due-date logic
│   ├── types/
│   │   ├── project.ts               Project, ProjectStatus
│   │   ├── task.ts                  Task, TaskStatus, TaskPriority
│   │   └── api.ts                   envelope types, ApiError, list params, meta
│   └── hooks/
│       ├── useToast.ts
│       └── useDebounce.ts           for the search input
├── tests/
│   └── setup.ts
├── .env.example
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts                   includes the @tailwindcss/vite plugin
```

Notes that matter:

- `routes/` holds page components. A page composes feature components and owns no data logic of its own beyond reading route params.
- `components/ui` is domain-free. `Badge` takes a `variant`; it does not know that `high` means red. The mapping from a domain value to a variant lives in `lib/labels.ts`, and `TaskPriorityBadge` is the domain-aware wrapper in the tasks feature.
- `types/` holds server-shaped domain types, shared across features. A feature's local `types.ts` is for form shapes and view models only. Never redeclare `Task` there.
- `lib/queryKeys.ts` is the single definition of the key hierarchy described in `#architecture`. Hooks import from it rather than writing array literals inline.
- `useTaskFilters.ts` is the bridge between the URL and the query. Filters live in search params; this hook is where they are read, written, and typed.

## Naming conventions

| Kind | Convention | Example |
|---|---|---|
| React component file and export | PascalCase, matching each other | `TaskCard.tsx` exports `TaskCard` |
| Page component | PascalCase ending in `Page` | `ProjectDetailPage.tsx` |
| Hook file and export | camelCase starting with `use` | `useCreateTask.ts` exports `useCreateTask` |
| Frontend non-component module | camelCase | `apiClient.ts`, `queryKeys.ts` |
| Backend module file | `<resource>.<role>.ts`, singular resource | `task.service.ts` |
| Mongoose model file | `<resource>.model.ts` | `project.model.ts` |
| Type and interface | PascalCase, no `I` prefix | `Task`, `TaskStatus`, `ApiError` |
| Constant | `SCREAMING_SNAKE_CASE` for true constants | `DEFAULT_PAGE_SIZE` |
| Test file | `*.test.ts` or `*.test.tsx` | `tasks.test.ts` |
| Folder | lowercase, plural for collections of like things | `components/`, `hooks/`, `modules/` |
| URL path | kebab-case, plural resource | `/api/projects` |
| JSON field | camelCase | `dueDate`, `projectId` |

Backend tests live in `backend/tests/` because they exercise the API through Supertest rather than a single unit. Frontend component tests sit next to the component as `Component.test.tsx`.

## Feature folder anatomy

Every folder under `features/` uses the same four slots. Nothing else goes in a feature folder.

```
features/<feature>/
├── api/          endpoint calls, typed, one file per resource
├── hooks/        one file per query or mutation, owns cache invalidation
├── components/   UI specific to this feature
└── types.ts      form shapes and view models for this feature only
```

Features do not import from each other. If the tasks feature needs a project name, it gets it from the task payload or from a shared hook, not from `features/projects`.

## Where do I put a new thing

| I'm adding... | It goes in |
|---|---|
| A new page or URL | `frontend/src/routes/`, registered in `routes/index.tsx` |
| A generic, reusable, domain-free UI element | `frontend/src/components/ui/` |
| Sidebar, header, page chrome | `frontend/src/components/layout/` |
| A component only tasks use | `frontend/src/features/tasks/components/` |
| The task filter bar | `frontend/src/features/tasks/components/TaskFilterBar.tsx` |
| A call to a new endpoint | the matching `features/<feature>/api/*.api.ts` |
| A data fetch or mutation for components to use | `features/<feature>/hooks/use*.ts` |
| A new query key | `frontend/src/lib/queryKeys.ts` |
| A display label or badge colour for a status or priority | `frontend/src/lib/labels.ts` |
| A date or number formatter | `frontend/src/lib/format.ts` |
| A type describing something the API returns | `frontend/src/types/` |
| A type describing a form's fields | that feature's `types.ts` |
| A hook with no domain knowledge, used across features | `frontend/src/hooks/` |
| A new endpoint | the matching `backend/src/modules/<resource>/*.routes.ts` |
| A Zod schema for a request | that module's `*.validation.ts` |
| A business rule, query, or aggregation | that module's `*.service.ts` |
| A new field on a stored entity | `backend/src/models/*.model.ts`, plus the validation schema and the frontend type |
| Cross-cutting request handling | `backend/src/middleware/` |
| A new error kind | `backend/src/errors/AppError.ts`, and document the code in `#api-standards` |
| An environment variable | `backend/src/config/env.ts` and `.env.example` |
| An API test | `backend/tests/` |

If the answer is not on this list, the closest row wins. Do not create a new top-level folder without a decision from the user.
