# Implementation Plan — TaskFlow

## Overview

Foundation (Phase 1) is complete: dependencies, Prisma v7 client (`lib/db.ts`), shared types (`types/index.ts`), Zod schemas (`lib/validations/`), and API helpers (`lib/api.ts`). These tasks cover Phases 2–9: the API route handlers, frontend foundation, and all pages/features through polish.

## Tasks

- [x] 1. Add serialization + fetch utilities
  - Create `lib/serializers.ts` with `serializeProject` (with optional counts) and `serializeTask` (with optional project include), converting dates to ISO strings and `labels` JSON string to `string[]`.
  - Create `lib/fetcher.ts` client wrapper that unwraps `{ data }` and throws an `ApiClientError` carrying `error`/`details`.
  - _Requirements: 1.3, 1.4, 2.4, 2.8, 10.3_

- [x] 2. Implement Projects API
- [x] 2.1 List and create (`app/api/projects/route.ts`)
  - GET: return all projects with `totalTasks` and `completedTasks`.
  - POST: validate with `createProjectSchema`, persist, return 201.
  - _Requirements: 1.1, 1.2, 1.3, 1.9_
- [x] 2.2 Detail, update, delete (`app/api/projects/[id]/route.ts`)
  - Validate id with `isUuid` (400) and existence (404).
  - GET: project + counts + task list. PUT: partial update via `updateProjectSchema`. DELETE: cascade delete.
  - _Requirements: 1.4, 1.5, 1.6, 1.7, 1.8, 1.9_

- [x] 3. Implement Tasks API
- [x] 3.1 List and create (`app/api/tasks/route.ts`)
  - GET: parse `taskListQuerySchema`, build Prisma `where` (search/filter), `orderBy` (with priority rank map), paginate; return `Paginated<TaskWithProject>`.
  - POST: validate with `createTaskSchema`, verify project exists (404), persist, return 201.
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_
- [x] 3.2 Detail, update, delete (`app/api/tasks/[id]/route.ts`)
  - Validate id + existence. GET: details with project. PUT: partial update (re-verify project if `projectId` changes). DELETE.
  - _Requirements: 2.8, 2.9, 2.11, 2.12_
- [x] 3.3 Status update (`app/api/tasks/[id]/status/route.ts`)
  - PATCH: validate with `updateTaskStatusSchema`, update status only, return 200.
  - _Requirements: 2.10_

- [x] 4. Implement Dashboard API (`app/api/dashboard/route.ts`)
  - GET: compute summary counts, recent tasks (by `updatedAt desc`), upcoming tasks (dueDate within 7 days, not completed); return `DashboardData`.
  - Handle empty-data case with zeroed counts/empty lists.
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 5. Verify the API end-to-end
  - With local PostgreSQL running and migration applied, exercise each endpoint via a temporary runtime script (create/list/get/update/delete for projects and tasks, status patch, cascade delete, dashboard). Remove the script after.
  - _Requirements: 1.1-1.9, 2.1-2.12, 3.1-3.4_

- [x] 6. Frontend foundation
- [x] 6.1 Replace boilerplate + theme
  - Update `app/layout.tsx` (TaskFlow metadata) and `app/globals.css` (full shadcn/ui token set in `@theme`); remove starter `page.tsx` content.
  - _Requirements: 4.4_
- [x] 6.2 shadcn/ui base components
  - Initialize shadcn/ui for Tailwind v4 and add: button, input, textarea, label, select, card, dialog, badge, dropdown-menu, skeleton, form, sonner.
  - _Requirements: 4.4, 10.6_
- [x] 6.3 Providers + shared components
  - Add `components/providers/query-provider.tsx` and mount it + Sonner `<Toaster />` in the layout.
  - Add `components/shared/`: `loading-spinner`, `empty-state`, `confirm-dialog`, `error-message`.
  - _Requirements: 4.5, 10.1, 10.2, 10.3, 10.4_
- [x] 6.4 Sidebar + navigation
  - Build `components/layout/sidebar.tsx` with active highlight (`usePathname`) and responsive collapse; wire into layout.
  - _Requirements: 4.1, 4.2, 4.3, 10.5_
- [x] 6.5 Data hooks
  - Build `hooks/use-projects.ts` and `hooks/use-tasks.ts` (queries + mutations, consistent keys, invalidation) plus a `useDashboard` query.
  - _Requirements: 10.1, 10.2, 10.3_

- [x] 7. Dashboard page (`app/page.tsx` + `components/dashboard/*`)
  - Summary cards, recent tasks, upcoming tasks; loading/empty/error states; items link to task details.
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 8. Project management UI
- [x] 8.1 Project list + create (`app/projects/page.tsx`, `project-card`, `project-form`)
  - List cards with counts; empty state; create dialog with RHF+Zod, toast, list refresh.
  - _Requirements: 6.1, 6.2, 6.3, 6.7, 10.1, 10.2_
- [x] 8.2 Project detail + edit + delete (`app/projects/[id]/page.tsx`, `project-delete-dialog`)
  - Info + counts + task list; edit dialog; delete confirmation (cascade) with toast; create-task action scoped to project.
  - _Requirements: 6.4, 6.5, 6.6, 6.7, 10.4_

- [x] 9. Task management UI
- [x] 9.1 Task list + create (`app/tasks/page.tsx`, `task-list`, `task-form`)
  - List with title/project/status/priority/due date; create dialog (required title/project/status/priority; optional description/dueDate/labels); toast.
  - _Requirements: 7.1, 7.2, 7.7, 10.1, 10.2_
- [x] 9.2 Task detail + edit + delete + status (`task-delete-dialog`, `task-status-select`)
  - Full details view; edit dialog; delete confirmation; status change persists and refreshes all views.
  - _Requirements: 7.3, 7.4, 7.5, 7.6, 10.2, 10.4_

- [x] 10. Search, filter, sort (`task-search`, `task-filters`, `task-sort`)
  - Debounced title search; combinable project/status/priority filters; sort field+order; wire to query params/hook.
  - Distinct empty states for "no results" vs "no matching filters".
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 11. Kanban board (`app/tasks/board/page.tsx`, `task-card`)
  - Three status columns; cards show title/priority/project/due date; status change via dropdown persists and moves the card; horizontal scroll on small screens.
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [x] 12. Polish, responsiveness, accessibility pass
  - Consistent loading/empty/error states across pages; responsive sidebar/forms/board; keyboard accessibility and labels; priority/status use icon+text alongside color.
  - Run `tsc --noEmit` and `next build`; fix any issues.
  - _Requirements: 7.7, 10.1, 10.3, 10.5, 10.6_

## Task Dependency Graph

Tasks are grouped into waves; each wave can begin once the previous wave's tasks it depends on are complete. Tasks within a wave are largely parallelizable.

```json
{
  "waves": [
    {
      "wave": 1,
      "tasks": ["1"],
      "dependsOn": []
    },
    {
      "wave": 2,
      "tasks": ["2", "2.1", "2.2", "3", "3.1", "3.2", "3.3", "4", "6", "6.1", "6.2", "6.3", "6.4", "6.5"],
      "dependsOn": ["1"]
    },
    {
      "wave": 3,
      "tasks": ["5", "7", "8", "8.1", "8.2", "9", "9.1", "9.2"],
      "dependsOn": ["2", "3", "4", "6"]
    },
    {
      "wave": 4,
      "tasks": ["10", "11"],
      "dependsOn": ["9"]
    },
    {
      "wave": 5,
      "tasks": ["12"],
      "dependsOn": ["7", "8", "9", "10", "11"]
    }
  ]
}
```

- Backend tasks (1–5) can proceed independently of the frontend foundation (6).
- All page/feature tasks (7–11) require both their API (2/3/4) and the frontend foundation (6).
- Task 12 is the final integration/polish pass.

## Notes

- Tasks 5 and 12 (verification/build) require local PostgreSQL running and the migration applied (`npm run db:migrate`).
- The build-check hook runs `tsc --noEmit` after each task completes; keep the tree compiling.
- Temporary verification scripts must be removed after use (not committed).
- Follow `.kiro/steering/` conventions throughout (structure, naming, frontend, css standards).
