# Tech

## Stack

- **Frontend** (`client/`): React 19 + TypeScript + Vite 8 + Tailwind CSS **v4** + React Router + TanStack Query. Hand-built shadcn-style UI primitives in `client/src/components/ui/` (no shadcn CLI dependency).
- **Backend** (`server/`): Node + Express + TypeScript, layered as routes → controller → service → Prisma. Zod for both body and query validation.
- **Database**: SQLite via Prisma ORM, file at `server/prisma/dev.db`.
- Two independent npm packages (`client/`, `server/`), no workspaces. A root `package.json` with `concurrently` runs both for convenience (`npm run dev` from repo root).

## Gotchas already hit (don't re-derive these)

- **Prisma + SQLite does not support Prisma `enum` types at all** — attempting one throws `P1012` at migrate time. `status`/`priority` on both models are plain `String` columns; validity is enforced only by Zod at the API boundary (see `server/src/modules/*/*.schema.ts`), not by the database. Keep this in mind if the DB provider ever changes — a switch to Postgres could reintroduce real enums, but isn't needed for this app.
- **Task status is stored internally without spaces** (`ToDo` / `InProgress` / `Completed`) but the API always emits/accepts the PRD's display strings (`"To Do"` / `"In Progress"` / `"Completed"`). The mapping lives in `server/src/modules/tasks/task.service.ts` (`STATUS_TO_INTERNAL` / `STATUS_TO_DISPLAY`). Never send the internal identifiers over the wire — always go through `mapStatusToInternal` / `serializeTask`.
- **Sorting by priority can't use Prisma's `orderBy`** — priority is a plain string column, so `orderBy` would sort alphabetically ("High" < "Low" < "Medium"), which is wrong. `task.service.ts`'s `listTasks` fetches unordered and sorts in application code via `PRIORITY_RANK` when `sortBy === "priority"`.
- **Tailwind v4, not v3** — no `tailwind.config.ts`/`postcss.config.js`. Styling is wired via the `@tailwindcss/vite` plugin in `client/vite.config.ts` plus `@import "tailwindcss";` at the top of `client/src/index.css`. Custom tokens (if ever needed) go through Tailwind v4's `@theme` block in CSS, not a JS config object. Don't add a v3-style config file.
- **Labels are a JSON string in SQLite**, not a native array column. `Task.labels` is `String?` in the schema; the service layer always serializes to/from a real `string[]` at the API boundary (`JSON.stringify`/`JSON.parse` in `task.service.ts`). Frontend types (`client/src/types/index.ts`) treat `labels` as `string[]` — that's already true by the time it reaches the client.
- **Port 4000 is occupied by an unrelated project on this machine** (`ipru-translator`). TaskFlow's backend runs on **4100**, not the more conventional 4000. `client/vite.config.ts`'s dev proxy targets `localhost:4100` — keep them in sync if either changes. Client dev server is whatever Vite picks starting from 5173 (falls back to 5174+ if occupied); the app doesn't hardcode a client port anywhere since the proxy only matters server-side.
- **Vite's dev proxy means CORS mostly doesn't matter in dev** — the browser talks to the Vite origin, and Vite forwards `/api/*` server-to-server. `cors()` is still enabled in `server/src/app.ts` (reading `CLIENT_ORIGIN` from `.env`) for direct API access (curl, Postman, a future separately-hosted frontend), but you won't see CORS errors from the app itself in normal dev use.

## Server-state / sync strategy

All server state lives in TanStack Query caches (`client/src/hooks/use*.ts`) — no Redux/Zustand. Mutations invalidate the relevant query keys on success (see `invalidateAfterTaskMutation` in `useTasks.ts` — a status change invalidates the task list, the single task, the dashboard, *and* the owning project, since project stats derive from task status). This invalidate-and-refetch approach is deliberately simple — no websockets — because the app is single-user/single-tab; see [[product]] for scope boundaries.

The Kanban board (`client/src/components/board/KanbanBoard.tsx`) additionally does an **optimistic update** via `queryClient.setQueryData` on drop/status-change, with rollback in `onError`, before the real `PATCH /api/tasks/:id/status` settles.

## Running it

See the `run` skill (`.claude/skills/run/SKILL.md`) for exact commands, ports, and a verification checklist — don't re-derive the dev-server setup from scratch.
