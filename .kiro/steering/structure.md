---
inclusion: always
---

# Project Structure & Conventions

## Folder Layout

```
auriga-kiro-workshop/
├── .kiro/                    # Kiro workspace configuration
│   ├── steering/             # Always-included context files
│   ├── skills/               # Reusable task templates
│   └── settings/             # MCP and other settings
├── client/                   # React frontend application
│   ├── public/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── ui/          # shadcn/ui primitives (Button, Dialog, etc.)
│   │   │   ├── layout/      # App shell: Sidebar, MainLayout
│   │   │   ├── projects/    # Project-specific components
│   │   │   ├── tasks/       # Task-specific components
│   │   │   └── dashboard/   # Dashboard widgets
│   │   ├── pages/           # Route-level page components
│   │   ├── hooks/           # Custom hooks (useProjects, useTasks, etc.)
│   │   ├── lib/             # Utilities: api client, constants, helpers
│   │   ├── types/           # Frontend-only TypeScript types
│   │   ├── App.tsx          # Root component (providers + router)
│   │   └── main.tsx         # Entry point
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.ts
├── server/                   # Express backend application
│   ├── src/
│   │   ├── routes/          # Express router definitions
│   │   ├── controllers/     # HTTP request handlers
│   │   ├── services/        # Business logic + Prisma queries
│   │   ├── middleware/      # Error handler, validation, cors
│   │   ├── validators/      # Zod schemas for request validation
│   │   └── app.ts          # Express app setup + middleware
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   ├── migrations/     # Migration history
│   │   └── seed.ts         # Seed script
│   ├── package.json
│   └── tsconfig.json
├── shared/                   # Shared code between client and server
│   ├── src/
│   │   ├── schemas/         # Zod validation schemas
│   │   └── types/           # Shared TypeScript interfaces
│   ├── package.json
│   └── tsconfig.json
├── package.json              # Root workspace configuration
├── tsconfig.base.json        # Shared TypeScript config
└── README.md
```

## Naming Conventions

### Files
- **kebab-case** for all file names: `project-list.tsx`, `task-service.ts`
- **PascalCase** for component files when they export a single component: `ProjectList.tsx` (either convention is acceptable, pick one and be consistent — we use kebab-case)

### Code
- **PascalCase** for components: `ProjectList`, `TaskCard`, `DashboardStats`
- **camelCase** for hooks: `useProjects`, `useTasks`, `useDashboard`
- **camelCase** for services/controllers: `projectService`, `taskController`
- **UPPER_SNAKE_CASE** for constants: `API_BASE_URL`, `TASK_STATUSES`
- **camelCase** for database fields (Prisma convention)

### API Routes
- Plural nouns: `/api/projects`, `/api/tasks`
- Nested resources for relationships: `/api/projects/:id/tasks` (optional)
- Actions as sub-paths: `/api/tasks/:id/status`

## Patterns

### Backend
- **Controller** — Handles HTTP (parse request, call service, send response)
- **Service** — Contains business logic and Prisma database calls
- **Validator** — Zod schema defining valid request shape
- **Middleware** — Reusable Express middleware (validation, error handling)
- **One file per resource** in routes, controllers, services

### Frontend
- **Pages** — Route-level components, orchestrate data fetching
- **Components** — Reusable, presentational where possible
- **Hooks** — Encapsulate TanStack Query calls (useQuery, useMutation)
- **API Client** — Centralized fetch wrapper in `lib/api.ts`

### TanStack Query
- Query keys follow `[resource, ...params]` pattern:
  - `['projects']` — all projects
  - `['projects', id]` — single project
  - `['tasks', { search, status, priority, projectId, sortBy }]` — filtered tasks
  - `['dashboard']` — dashboard data
- Mutations invalidate related query keys on success

### Error Handling
- Backend returns: `{ error: { message: string, code: string } }` with appropriate HTTP status
- Frontend catches errors and displays toast notifications
- Form validation errors shown inline next to fields

## Imports

### Order (enforced by convention)
1. External packages (`react`, `express`, `@tanstack/react-query`)
2. Shared packages (`shared/schemas`, `shared/types`)
3. Internal absolute (`@/components/...`, `@/hooks/...`)
4. Relative (`./ChildComponent`, `../utils`)

### Path Aliases
- Client: `@/` maps to `client/src/`
- Server: uses relative imports (no alias needed for flat structure)
- Shared: imported as `shared` workspace package

## Git Conventions

- Branch naming: `feature/description`, `fix/description`
- Commit messages: imperative mood, concise (`Add project CRUD endpoints`, `Fix task filter query`)
- One logical change per commit
