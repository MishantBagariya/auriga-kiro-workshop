# Product

## What TaskFlow is

TaskFlow is a single-user, Jira/Linear-style task management app: create projects, create tasks within them, track status and priority, and view progress on a dashboard. Full source of truth is a backend + database — nothing depends on browser storage.

Full requirements live in `Product Requirements Document (PRD) (1) (1).md` at the repo root. This file is a summary for quick orientation; the PRD is authoritative for anything not covered here.

## Core entities

- **Project**: id, name (required), description, status (Active | Completed | Archived), createdDate, updatedDate. Has many tasks.
- **Task**: id, title (required), description, projectId (required), status (To Do | In Progress | Completed), priority (Low | Medium | High), dueDate, labels, createdDate, updatedDate. Belongs to exactly one project.

Deleting a project cascades to delete its tasks — this is deliberate, not a bug.

## Required user flows (must keep working end-to-end)

1. Create a project → it appears in the project list.
2. Create a task (from the Tasks page or from a project's detail page) → it appears in both the task list and the owning project's task list.
3. Edit a task → changes reflect everywhere (list, board, project detail, dashboard).
4. Change a task's status to Completed → dashboard stats and project stats update.
5. Search + combine filters (project, status, priority) on the Tasks page → results narrow correctly (AND logic).
6. Delete a task/project → requires a confirmation dialog first, then the deletion persists.
7. Data survives a full refresh or app restart (it's read from SQLite via the API, never from localStorage).

## Views

- **Dashboard** (`/dashboard`): summary stat tiles, recent tasks, upcoming tasks (tasks with a future due date).
- **Projects** (`/projects`, `/projects/:id`): list + per-project detail with its own task list.
- **Tasks** (`/tasks`): toggles between a List view and a Kanban Board view (`?view=list|board`), with search/filter/sort as URL query params.

## Scope boundaries

No authentication, no multi-user support, no notifications/websockets — this is intentionally a single-user, single-tab app. Don't add these unless the user explicitly asks; see [[tech]] for why the current sync approach (invalidate-and-refetch) is sufficient without websockets.
