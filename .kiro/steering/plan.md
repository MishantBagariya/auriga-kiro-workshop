---
inclusion: always
---

# TaskFlow — Workshop Build Plan

## Phase 1 — Backend Setup
- Initialize Node.js + Express + TypeScript project
- Install all dependencies (Express, Prisma, Zod, cors, dotenv, ts-node, nodemon)
- Set up folder structure: src/routes, src/controllers, src/middleware, src/lib
- Configure TypeScript (tsconfig.json)
- Set up Prisma and connect to SQLite
- Create .env file for DATABASE_URL (file:./dev.db)
- Verify server starts successfully

## Phase 2 — Database Schema
- Define Project model (id, name, description, status, createdAt, updatedAt)
- Define Task model (id, title, description, projectId, status, priority, dueDate, labels, createdAt, updatedAt)
- Project status values: Active, Completed, Archived
- Task status values: Todo, InProgress, Completed
- Task priority values: Low, Medium, High
- Set up Project → Tasks relation (one project, many tasks)
- Configure cascade delete: deleting a project deletes all its tasks
- Run Prisma migration
- Verify tables are created (SQLite file: prisma/dev.db)

## Phase 3 — Projects API
- POST   /api/projects         — create project (validate: name required)
- GET    /api/projects         — get all projects (include task counts: total + completed)
- GET    /api/projects/:id     — get project details (include tasks)
- PUT    /api/projects/:id     — update project (name, description, status)
- DELETE /api/projects/:id     — delete project (cascades to tasks)
- Zod validation on create and update
- Consistent { data } / { error } response format
- Test all endpoints

## Phase 4 — Tasks API
- POST   /api/tasks            — create task (validate: title, projectId, status, priority required; verify project exists)
- GET    /api/tasks            — get all tasks across all projects (support search, filter, sort)
- GET    /api/tasks/:id        — get task details
- PUT    /api/tasks/:id        — update task (title, description, projectId, status, priority, dueDate, labels)
- DELETE /api/tasks/:id        — delete task
- PATCH  /api/tasks/:id/status — update task status only
- Query param support:
  - search: by task title
  - filter: projectId, status, priority (combinable)
  - sort: createdAt, updatedAt, dueDate, priority (asc/desc)
- Labels field: stored as array/JSON
- Zod validation on all inputs
- Test all endpoints

## Phase 5 — Dashboard API
- GET /api/dashboard/stats    — total projects, active projects, total tasks, todo/inprogress/completed task counts
- GET /api/dashboard/recent   — recently created or updated tasks (title, project, status, priority)
- GET /api/dashboard/upcoming — tasks with upcoming due dates (title, project, dueDate, priority)
- Test all endpoints

---

## Phase 6 — Frontend Setup
- Initialize React + Vite + TypeScript project
- Install dependencies (Tailwind CSS, React Router, Axios)
- Configure Tailwind
- Set up folder structure: src/pages, src/components, src/api, src/types
- Define shared TypeScript interfaces (Project, Task, DashboardStats)
- Set up base layout component (sidebar + main content area)
- Sidebar links: Dashboard, Projects, Tasks (highlight active route)
- Set up React Router routes for all pages
- Configure Axios base URL pointing to backend
- Verify app loads and navigation works

## Phase 7 — Dashboard Page
- Call dashboard API endpoints
- Summary cards: Total Projects, Active Projects, Total Tasks, To Do, In Progress, Completed
- Recent tasks list (title, project, status, priority) — clickable to task detail
- Upcoming tasks list (title, project, due date, priority)
- Loading state, error state, empty states

## Phase 8 — Projects Pages
- Projects list page:
  - Show all projects (name, description, status, total tasks, completed tasks)
  - Empty state with create project action
  - Loading and error states
  - Click project → project detail page
- Create project:
  - Form: name (required), description (optional), status (optional)
  - Frontend validation before submit
  - Disable submit while request in progress
  - Success feedback, error handling
  - New project appears in list after creation
- Project detail page:
  - Show name, description, status, total tasks, completed tasks
  - List of project tasks
  - Actions: edit project, delete project, create new task
- Edit project:
  - Pre-filled form (name, description, status)
  - Save → updates in database → reflected throughout app
- Delete project:
  - Confirmation dialog before deletion
  - Deletes project and all associated tasks
  - Redirect to projects list after deletion

## Phase 9 — Tasks Pages
- Tasks list page (all tasks across all projects):
  - Show title, project, status, priority, due date
  - Search by task title
  - Filter by project, status, priority (combinable)
  - Sort by createdAt, updatedAt, dueDate, priority (asc/desc)
  - Empty state for no tasks, no search results, no filter results
  - Loading and error states
  - Click task → task detail page
- Create task:
  - Form: title (required), project (required), status (required), priority (required), description, due date, labels
  - Frontend validation before submit
  - Disable submit while request in progress
  - Success feedback, error handling
- Task detail page:
  - Show all fields: title, description, project, status, priority, due date, labels, createdAt, updatedAt
  - Actions: edit task, delete task, change status
- Edit task:
  - Pre-filled form (all fields editable)
  - Save → updates in database → reflected throughout app
- Delete task:
  - Confirmation dialog before deletion
  - Task removed from all views after deletion

## Phase 10 — Kanban Board
- Board view with 3 columns: To Do | In Progress | Completed
- Each task card shows: title, priority, project, due date
- Priority visually distinguishable on cards
- User can change task status directly from the board card
- Status change → sent to backend → persisted in database
- Board updates to reflect new status immediately
- Loading and empty states per column

## Phase 11 — Final Polish
- Confirmation dialogs on all delete operations (project + task)
- Success/error toast or feedback messages for all actions:
  - Project created / updated / deleted
  - Task created / updated / deleted / status changed
- Loading states on all data-fetching pages and during form submissions
- Empty states on all list views with helpful messages and actions
- Responsive layout:
  - Desktop: sidebar navigation
  - Tablet/Mobile: adapted navigation
  - Kanban board: horizontal scroll on small screens
- Final check: all 7 required user flows from PRD work end-to-end
- Final check: all acceptance criteria from PRD section 29 are met
