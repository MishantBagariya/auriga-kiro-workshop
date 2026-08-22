---
inclusion: always
---

# TaskFlow — Task Management Application

## Overview

TaskFlow is a full-stack single-user task management application for creating projects, managing tasks, tracking progress, and viewing data in list and kanban views.

## Goals

- Create and manage projects with status tracking
- Create and manage tasks with status, priority, due dates, and labels
- Dashboard with summary statistics, recent tasks, and upcoming tasks
- Task board (Kanban) view with three status columns
- Search, filter, and sort tasks
- Persistent data storage via PostgreSQL
- Clean, responsive, modern UI

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS + shadcn/ui |
| State | TanStack Query (React Query) |
| Routing | React Router v6 |
| Forms | React Hook Form + Zod |
| Backend | Node.js + Express + TypeScript |
| ORM | Prisma |
| Database | PostgreSQL |
| Validation | Zod (shared client/server) |
| Icons | Lucide React |
| Notifications | Sonner (toast) |
| Testing | Vitest + Playwright |

## Architecture

```
Frontend (React + Vite)
    ↓ HTTP REST
Backend (Express + TypeScript)
    ↓ Prisma Client
Database (PostgreSQL)
```

- Monorepo structure: `client/`, `server/`, `shared/`
- REST API pattern with JSON request/response
- Single-user — no authentication required
- Database is the source of truth (no localStorage for application data)

## Key Design Decisions

- Cascade delete: deleting a project deletes all its tasks
- Task statuses: To Do, In Progress, Completed
- Task priorities: Low, Medium, High
- Project statuses: Active, Completed, Archived
- All validation shared via Zod schemas in `shared/` package
- API response format: `{ data }` on success, `{ error: { message, code } }` on failure
- TanStack Query handles caching, refetching, and optimistic updates on the frontend

## Constraints

- No authentication or multi-user support in v1
- No browser storage (localStorage/sessionStorage) as primary data source
- All CRUD operations must round-trip through the backend API
- Forms must validate on client AND server independently
