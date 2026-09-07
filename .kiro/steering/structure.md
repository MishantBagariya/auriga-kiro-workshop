---
inclusion: always
---

# Project Structure — TaskFlow

## Directory Layout

```
taskflow/
├── app/
│   ├── layout.tsx                  # Root layout (sidebar + main content area)
│   ├── page.tsx                    # Dashboard page
│   ├── globals.css                 # Global styles + Tailwind imports
│   ├── projects/
│   │   ├── page.tsx                # Project list page
│   │   └── [id]/
│   │       └── page.tsx            # Project details page
│   ├── tasks/
│   │   ├── page.tsx                # Task list page
│   │   └── board/
│   │       └── page.tsx            # Kanban board page
│   └── api/
│       ├── projects/
│       │   ├── route.ts            # GET (list all), POST (create)
│       │   └── [id]/
│       │       └── route.ts        # GET (details), PUT (update), DELETE
│       ├── tasks/
│       │   ├── route.ts            # GET (list with search/filter/sort), POST (create)
│       │   └── [id]/
│       │       ├── route.ts        # GET (details), PUT (update), DELETE
│       │       └── status/
│       │           └── route.ts    # PATCH (update status only)
│       └── dashboard/
│           └── route.ts            # GET (summary, recent, upcoming)
├── components/
│   ├── ui/                         # shadcn/ui base components
│   ├── layout/
│   │   ├── sidebar.tsx             # Navigation sidebar
│   │   └── header.tsx              # Page headers
│   ├── projects/
│   │   ├── project-card.tsx        # Project list card
│   │   ├── project-form.tsx        # Create/edit project form
│   │   └── project-delete-dialog.tsx
│   ├── tasks/
│   │   ├── task-list.tsx           # Task table/list component
│   │   ├── task-card.tsx           # Task card (for board view)
│   │   ├── task-form.tsx           # Create/edit task form
│   │   ├── task-filters.tsx        # Filter controls
│   │   ├── task-search.tsx         # Search input
│   │   ├── task-sort.tsx           # Sort controls
│   │   └── task-delete-dialog.tsx
│   ├── dashboard/
│   │   ├── summary-cards.tsx       # Stats cards
│   │   ├── recent-tasks.tsx        # Recent tasks list
│   │   └── upcoming-tasks.tsx      # Upcoming tasks list
│   └── shared/
│       ├── loading-spinner.tsx     # Loading indicator
│       ├── empty-state.tsx         # Empty state component
│       ├── confirm-dialog.tsx      # Reusable confirmation dialog
│       └── error-message.tsx       # Error display component
├── lib/
│   ├── db.ts                       # Prisma client singleton
│   ├── validations/
│   │   ├── project.ts              # Zod schemas for project
│   │   └── task.ts                 # Zod schemas for task
│   └── utils.ts                    # Utility functions (cn helper, formatters)
├── hooks/
│   ├── use-projects.ts             # TanStack Query hooks for projects
│   └── use-tasks.ts                # TanStack Query hooks for tasks
├── types/
│   └── index.ts                    # Shared TypeScript types/interfaces
├── prisma/
│   ├── schema.prisma               # Database schema
│   ├── migrations/                 # Database migrations
│   └── seed.ts                     # Optional seed data
├── public/                         # Static assets
├── .env                            # Environment variables (not committed)
├── .env.example                    # Example environment variables
├── next.config.ts                  # Next.js configuration
├── tsconfig.json                   # TypeScript configuration
├── postcss.config.mjs              # PostCSS configuration (@tailwindcss/postcss)
├── package.json                    # Dependencies and scripts
└── README.md                       # Project documentation
```

## Naming Conventions

- **Files:** kebab-case (e.g., `task-card.tsx`, `use-projects.ts`)
- **Components:** PascalCase exports (e.g., `export function TaskCard()`)
- **API routes:** RESTful naming in folder structure
- **Types:** PascalCase interfaces/types (e.g., `Project`, `Task`, `CreateProjectInput`)
- **Zod schemas:** camelCase with "Schema" suffix (e.g., `createProjectSchema`)
- **Hooks:** camelCase with "use" prefix (e.g., `useProjects`, `useTasks`)
- **Database fields:** camelCase in Prisma, maps to snake_case in PostgreSQL

## File Responsibilities

- `app/` — Pages and API routes only. Minimal logic, delegate to components and lib.
- `components/` — All UI rendering. Split by domain (projects, tasks, dashboard, shared).
- `lib/` — Business logic, validation schemas, utilities. No React imports.
- `hooks/` — Custom React hooks (primarily TanStack Query wrappers).
- `types/` — Shared TypeScript type definitions.
- `prisma/` — Database schema and migrations.
