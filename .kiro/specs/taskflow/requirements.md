# Requirements Document

## Introduction

TaskFlow is a single-user, full-stack task management application built on Next.js (App Router) with PostgreSQL via Prisma. It lets the user create projects, manage tasks within those projects, track progress across everything, and view work in list and Kanban formats. This spec covers the remaining build after the Phase 1 foundation (dependencies, Prisma schema/client, shared types, Zod schemas, API response helpers) is already in place.

The source of truth for stack and conventions is `.kiro/steering/` (product, tech, structure, frontend-standards, css-standards). The full product definition lives in `doc/Product Requirements Document (PRD).md` and the phased plan in `doc/plan.md`.

## Glossary

- **Project status:** `active`, `completed`, `archived`
- **Task status:** `todo`, `in_progress`, `completed`
- **Task priority:** `low`, `medium`, `high`
- **API envelope:** success `{ data, message? }`, error `{ error, details? }`

## Requirements

### Requirement 1: Project API

**User Story:** As the user, I want backend endpoints to manage projects, so that project data is validated and persisted in the database.

#### Acceptance Criteria

1. WHEN a POST request is sent to `/api/projects` with a valid body THEN the system SHALL create a project and respond 201 with the created project in `{ data }`.
2. WHEN a POST request is sent with an invalid body THEN the system SHALL respond 400 with field-level messages in `{ error, details }` and SHALL NOT create a project.
3. WHEN a GET request is sent to `/api/projects` THEN the system SHALL respond 200 with all projects, each including `totalTasks` and `completedTasks`.
4. WHEN a GET request is sent to `/api/projects/[id]` for an existing project THEN the system SHALL respond 200 with the project, its task counts, and its task list.
5. WHEN a request targets `/api/projects/[id]` with a non-UUID id THEN the system SHALL respond 400.
6. WHEN a request targets `/api/projects/[id]` for a non-existent project THEN the system SHALL respond 404.
7. WHEN a PUT request is sent to `/api/projects/[id]` with a valid partial body THEN the system SHALL update only the provided fields, refresh `updatedAt`, and respond 200 with the updated project.
8. WHEN a DELETE request is sent to `/api/projects/[id]` for an existing project THEN the system SHALL delete the project and all its tasks (cascade) and respond 200.
9. WHEN any project endpoint encounters an unexpected error THEN the system SHALL log it server-side and respond 500 with a generic message.

### Requirement 2: Task API

**User Story:** As the user, I want backend endpoints to manage tasks with search, filter, and sort, so that I can retrieve exactly the tasks I need.

#### Acceptance Criteria

1. WHEN a POST request is sent to `/api/tasks` with a valid body THEN the system SHALL create a task and respond 201 with the created task.
2. WHEN a task is created or updated with a `projectId` that does not exist THEN the system SHALL respond 404 (or 400 with a field message) and SHALL NOT persist the task.
3. WHEN a POST/PUT request has an invalid body THEN the system SHALL respond 400 with field-level messages.
4. WHEN a GET request is sent to `/api/tasks` THEN the system SHALL respond 200 with a paginated list of tasks, each including its project's id and name.
5. WHEN `/api/tasks` receives a `search` query THEN the system SHALL return only tasks whose title matches (case-insensitive, partial).
6. WHEN `/api/tasks` receives `projectId`, `status`, or `priority` query params THEN the system SHALL filter by them, and multiple filters SHALL combine (AND).
7. WHEN `/api/tasks` receives `sortBy` and `order` params THEN the system SHALL sort accordingly; the default SHALL be `createdAt desc`.
8. WHEN a GET request is sent to `/api/tasks/[id]` for an existing task THEN the system SHALL respond 200 with full task details including its project.
9. WHEN a PUT request is sent to `/api/tasks/[id]` with a valid partial body THEN the system SHALL update only the provided fields and respond 200.
10. WHEN a PATCH request is sent to `/api/tasks/[id]/status` with a valid status THEN the system SHALL update only the status and respond 200.
11. WHEN a DELETE request is sent to `/api/tasks/[id]` for an existing task THEN the system SHALL delete it and respond 200.
12. WHEN a task path targets a non-UUID id THEN the system SHALL respond 400; for a valid but non-existent id THEN 404.

### Requirement 3: Dashboard API

**User Story:** As the user, I want a dashboard data endpoint, so that I can see an overview of my projects and tasks.

#### Acceptance Criteria

1. WHEN a GET request is sent to `/api/dashboard` THEN the system SHALL respond 200 with a summary containing totalProjects, activeProjects, totalTasks, todoTasks, inProgressTasks, and completedTasks.
2. WHEN the dashboard endpoint responds THEN it SHALL include recent tasks (by most recently updated) each with project, status, and priority.
3. WHEN the dashboard endpoint responds THEN it SHALL include upcoming tasks (due within the next 7 days, not completed) each with project, due date, and priority.
4. WHEN there is no data THEN the system SHALL respond 200 with zeroed counts and empty lists.

### Requirement 4: App Shell and Navigation

**User Story:** As the user, I want a consistent layout with navigation, so that I can move between Dashboard, Projects, and Tasks.

#### Acceptance Criteria

1. WHEN the app loads THEN the system SHALL render a sidebar with links to Dashboard, Projects, and Tasks, plus a main content area.
2. WHEN a navigation section is active THEN the system SHALL visually highlight it.
3. WHEN the viewport is `lg` or wider THEN the sidebar SHALL be visible; on smaller screens it SHALL collapse to a toggleable menu.
4. WHEN the app renders THEN it SHALL replace the create-next-app boilerplate (layout metadata, page, global theme tokens) with TaskFlow branding and the shadcn/ui token set.
5. WHEN any client component uses server state THEN it SHALL do so through a TanStack Query provider mounted in the layout.

### Requirement 5: Dashboard Page

**User Story:** As the user, I want a dashboard page, so that I can see stats, recent tasks, and upcoming tasks at a glance.

#### Acceptance Criteria

1. WHEN the dashboard page loads THEN the system SHALL display summary cards for the six required stats.
2. WHEN dashboard data is loading THEN the system SHALL show a loading state; on error it SHALL show an error message.
3. WHEN there are recent tasks THEN the system SHALL list them with title, project, status, and priority; each item SHALL link to the task.
4. WHEN there are upcoming tasks THEN the system SHALL list them with title, project, due date, and priority.
5. WHEN a section has no data THEN the system SHALL show an appropriate empty state.

### Requirement 6: Project Management (UI)

**User Story:** As the user, I want to create, view, edit, and delete projects, so that I can organize my work.

#### Acceptance Criteria

1. WHEN the projects page loads THEN the system SHALL display all projects as cards showing name, description, status, total tasks, and completed tasks.
2. WHEN there are no projects THEN the system SHALL show an empty state with a create action.
3. WHEN the user submits the create-project form THEN client-side validation SHALL run; on success the project SHALL be created via the API and appear in the list, and a success toast SHALL show.
4. WHEN the user edits a project THEN the change SHALL persist via the API and reflect across the app.
5. WHEN the user deletes a project THEN a confirmation dialog SHALL appear; on confirm the project and its tasks SHALL be deleted and a toast SHALL show.
6. WHEN the user opens a project's details THEN the system SHALL show project info, task counts, and its task list, with actions to edit, delete, and create a task in that project.
7. WHEN a form field is invalid THEN the system SHALL show a field-level message; WHEN the API returns validation errors THEN they SHALL be surfaced too.

### Requirement 7: Task Management (UI)

**User Story:** As the user, I want to create, view, edit, delete, and re-status tasks, so that I can track progress.

#### Acceptance Criteria

1. WHEN the tasks page loads THEN the system SHALL display all tasks with title, project, status, priority, and due date.
2. WHEN the user submits the create-task form THEN it SHALL require title, project, status, and priority, allow optional description/due date/labels, persist via the API, and show a success toast.
3. WHEN the user opens a task THEN the system SHALL show full details (title, description, project, status, priority, due date, labels, created/updated dates) with edit, delete, and change-status actions.
4. WHEN the user edits a task THEN the change SHALL persist via the API and reflect across list, board, dashboard, and project views.
5. WHEN the user deletes a task THEN a confirmation dialog SHALL appear; on confirm it SHALL be deleted and a toast SHALL show.
6. WHEN the user changes a task's status THEN the change SHALL persist and update all relevant views and statistics.
7. WHEN priority is displayed THEN it SHALL be visually distinguishable using both color and text/icon (not color alone).

### Requirement 8: Search, Filter, and Sort (UI)

**User Story:** As the user, I want to search, filter, and sort tasks, so that I can find what I need.

#### Acceptance Criteria

1. WHEN the user types in the task search field THEN the system SHALL query tasks by title (debounced) and update the list.
2. WHEN the user selects project, status, or priority filters THEN the system SHALL apply them combinably via API query params.
3. WHEN the user selects a sort field and order THEN the system SHALL reorder the list accordingly.
4. WHEN no tasks match the search THEN the system SHALL show a "no results" empty state distinct from the "no tasks" empty state.
5. WHEN no tasks match the active filters THEN the system SHALL show a "no matching filters" empty state.

### Requirement 9: Kanban Board (UI)

**User Story:** As the user, I want a board view grouped by status, so that I can see and change task progress visually.

#### Acceptance Criteria

1. WHEN the board page loads THEN the system SHALL display three columns: To Do, In Progress, Completed.
2. WHEN a task is shown on the board THEN its card SHALL display title, priority, project, and due date.
3. WHEN the user changes a task's status from the board THEN the change SHALL persist via the API and the card SHALL move to the correct column.
4. WHEN the viewport is small THEN the board SHALL remain usable via horizontal scroll or an equivalent responsive layout.

### Requirement 10: Cross-Cutting UX Quality

**User Story:** As the user, I want consistent feedback and resilience, so that the app feels reliable.

#### Acceptance Criteria

1. WHEN any async operation is in progress THEN the system SHALL show a loading state.
2. WHEN a mutation succeeds THEN the system SHALL show a success toast and invalidate/refresh affected queries.
3. WHEN a network or server error occurs THEN the system SHALL show a user-friendly error (toast for mutations, inline/error component for reads).
4. WHEN a destructive action is triggered THEN the system SHALL require confirmation before proceeding.
5. WHEN the app is viewed on desktop, tablet, or mobile THEN the layout SHALL adapt appropriately.
6. WHEN interactive elements are used THEN they SHALL be keyboard accessible with proper labels and semantics.
