---
inclusion: always
---

# Tech Stack — TaskFlow

## Core Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.x (installed: 16.3.2) |
| Language | TypeScript | 5+ |
| Database | PostgreSQL | 16+ |
| ORM | Prisma | Latest |
| Styling | Tailwind CSS | 4.x (installed: 4.3.3) |
| UI Components | shadcn/ui (Radix UI based) | Latest |
| Validation | Zod | Latest |
| Forms | React Hook Form + @hookform/resolvers/zod | Latest |
| Data Fetching | TanStack Query (React Query) | v5 |
| Notifications | Sonner | Latest |
| Icons | Lucide React | Latest |
| Date Utilities | date-fns | Latest |

## Development Tools

- Package manager: npm
- Linting: ESLint (Next.js config)
- Formatting: Prettier (if configured)
- Database management: Prisma CLI (migrate, generate, studio)

## Key Technical Decisions

- **Next.js App Router** — use Server Components for data loading, Client Components for interactive UI
- **API Routes** — use Next.js route handlers (`app/api/...`) instead of a separate backend server
- **Prisma** — single source of truth for DB schema, generates TypeScript types
- **Zod** — shared validation schemas used in both API routes and client forms
- **TanStack Query** — handles caching, loading states, refetching, and mutations
- **shadcn/ui** — copy-paste components (not a dependency), customizable via Tailwind

## Conventions

- Use `"use client"` directive only on components that need interactivity
- Prefer Server Components for data fetching where possible
- API routes return consistent JSON: `{ data?, error?, message? }`
- Use HTTP status codes correctly: 200, 201, 400, 404, 500
- Environment variables for database URL in `.env` (not committed)
- Prisma client instantiated once in `lib/db.ts` (singleton pattern for dev)

## Database Connection

```
DATABASE_URL="postgresql://user:password@localhost:5432/taskflow"
```

PostgreSQL runs locally via Docker or native install.
