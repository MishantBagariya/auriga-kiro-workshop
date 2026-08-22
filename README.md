# TaskFlow

A Jira/Linear-style task management app — projects, tasks, a dashboard, list and Kanban views, search/filter/sort, and full backend + database persistence. Single-user, no authentication required.

## Tech stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, React Router, TanStack Query
- **Backend:** Node.js, Express, TypeScript, Zod validation
- **Database:** SQLite via Prisma ORM

## Prerequisites

- Node.js 20+

## Setup

```bash
# 1. Server
cd server
npm install
cp .env.example .env
npx prisma migrate dev      # creates dev.db and applies the schema
npx prisma db seed          # optional: adds sample projects/tasks

# 2. Client
cd ../client
npm install
```

## Running in development

**Option A — one command from the project root:**

```bash
npm install               # installs the root `concurrently` helper
npm run dev                # runs both server and client together
```

**Option B — two terminals:**

```bash
# terminal 1
cd server && npm run dev

# terminal 2
cd client && npm run dev
```

- Backend API: http://localhost:4100
- Frontend: http://localhost:5173 (Vite proxies `/api/*` to the backend — no CORS setup needed for the app itself)

If port 4100 is already taken on your machine, change `PORT` in `server/.env` and update the proxy target in `client/vite.config.ts` to match.

## Building for production

```bash
cd server && npm run build   # compiles to server/dist
cd client && npm run build   # outputs static assets to client/dist
```

## Project structure

```
server/
  prisma/         schema, migrations, seed script
  src/
    modules/      projects, tasks, dashboard — routes/controller/service/schema per module
    middleware/   validation, error handling
client/
  src/
    api/          typed fetch wrappers per resource
    hooks/        TanStack Query hooks
    components/   ui primitives, layout, and feature components
    pages/        route-level pages
```

## API overview

| Resource | Endpoints |
|---|---|
| Projects | `GET/POST /api/projects`, `GET/PUT/DELETE /api/projects/:id` |
| Tasks | `GET/POST /api/tasks` (search/filter/sort via query params), `GET/PUT/DELETE /api/tasks/:id`, `PATCH /api/tasks/:id/status` |
| Dashboard | `GET /api/dashboard` — stats, recent tasks, upcoming tasks |

Errors are returned as `{ "error": { "message": "...", "fields"?: { "field": "message" } } }` with the appropriate HTTP status code.

## Useful Prisma commands

```bash
npx prisma studio          # browse/edit the database in a GUI
npx prisma migrate reset   # wipe and reapply migrations + seed
```
