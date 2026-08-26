---
inclusion: manual
---

# TaskFlow — Product

Related steering: reference `#tech-stack` for the technology choices, `#architecture` for how the layers fit together, `#structure` for where code lives, `#api-standards` for the HTTP contract. Full acceptance criteria live in `docs/product-requirements.md`.

## What TaskFlow is

TaskFlow is a full-stack task management application. A user creates projects, creates tasks inside those projects, and tracks each task through to completion. Tasks carry a status and a priority, can be searched, filtered, and sorted, and are viewable as either a list or a Kanban board. A dashboard summarizes progress across everything. All project and task data lives in a database, so it survives a refresh or a restart.

The product should feel like a small but complete project-management tool, not a set of disconnected screens and not a frontend-only demo. Every core operation goes through the backend and lands in the database.

## The single-user constraint

The initial version has exactly one user. There is no sign-up, no login, no user records, and no ownership of data. Every project and every task in the database belongs to that one implicit user, so nothing is scoped by user ID.

What this removes from the build:

- No authentication or authorization layer
- No user model, session handling, tokens, or password storage
- No permission checks on any endpoint
- No "assigned to" field on tasks, and no member lists on projects
- No per-user filtering anywhere in the data access layer

Do not add these speculatively. Endpoints are open by design in this version. If the product later becomes multi-user, that is a deliberate future change with its own requirements, not something to pre-build.

## In scope

Everything below is required for the product to be considered complete:

| Area | What must work |
|---|---|
| Dashboard | Summary counts, recent tasks, upcoming tasks, all derived from persisted data |
| Project management | Create, view list, view details, edit, delete |
| Task management | Create, view list, view details, edit, delete |
| Task status management | Move a task between To Do, In Progress, and Completed; changes persist |
| Task priority | Set and display Low, Medium, High; visually distinguishable |
| Task search | Search tasks by title |
| Task filtering | Filter by project, status, and priority; filters combine |
| Task sorting | Sort by created date, updated date, due date, priority; both directions |
| Task list view | Table/list of all tasks across projects |
| Task board / Kanban view | Three status columns; status changeable from the board |
| Backend APIs | Full CRUD for projects and tasks, plus dashboard data |
| Database persistence | Database is the source of truth; data survives refresh |
| Form validation | Required fields validated before submit |
| Backend validation | Server independently validates every request |
| Error handling | Graceful, user-readable handling of every failure path |
| Empty states | Distinct states for no projects, no tasks, no search results, no filter results |
| Loading states | Visible progress indication for every fetch and every mutation |
| Responsive UI | Works on desktop, tablet, and mobile |

## Out of scope

Explicitly not part of this version. Do not build, and do not add fields or tables in anticipation of:

- Authentication, login, registration, password reset
- Multi-user support, user accounts, roles, permissions
- Collaboration: task assignment, comments, mentions, activity feeds, sharing
- File attachments or image uploads
- Notifications: email, push, in-app inbox, reminders
- Subtasks, checklists, or task dependencies
- Recurring tasks
- Time tracking, estimates, or timesheets
- Custom fields, custom statuses, or custom workflows
- Reporting beyond the dashboard summary, exports, charts over time
- Real-time sync between sessions or websockets
- Offline mode
- Internationalization and localization
- Third-party integrations (calendar, Slack, Git providers)

## Domain vocabulary

These are the only terms the product uses. Use them consistently in code, in UI copy, and in conversation.

| Term | Meaning |
|---|---|
| Project | A named container for tasks. Has a name, optional description, and a status. A project may hold many tasks. |
| Task | A single unit of work. Always belongs to exactly one project. Has a title, optional description, a status, a priority, an optional due date, and optional labels. |
| Status | Where something sits in its lifecycle. Projects and tasks have separate, non-overlapping status sets. |
| Priority | How urgent a task is. Tasks only; projects have no priority. |
| Label | A free-text tag on a task. Optional, zero or more per task. Labels are not a managed entity: there is no label table, no label CRUD, no colour assignment. |

### Task status

| Wire value | Display label |
|---|---|
| `todo` | To Do |
| `in_progress` | In Progress |
| `completed` | Completed |

### Task priority

| Wire value | Display label |
|---|---|
| `low` | Low |
| `medium` | Medium |
| `high` | High |

### Project status

| Wire value | Display label |
|---|---|
| `active` | Active |
| `completed` | Completed |
| `archived` | Archived |

Rules for these values:

- The wire value is what crosses the API and what is stored in the database. Always lowercase snake_case.
- The display label is presentation only. It comes from a single label map in the frontend. Never hardcode a display string like `"In Progress"` inside a component, and never send a display label to the API.
- These sets are closed. Adding a fourth status or priority is a product change, not an implementation detail.
- Task status and project status share the value `completed` but are different fields with different meanings. Do not share a type or an enum between them.

## Required user flows

Each of these must work end to end, frontend through backend to database and back:

1. Create a project, and see it appear in the project list.
2. Create a task inside a project, and see it appear in both the project view and the global task list.
3. Open a task, edit it, save, and see the updated values.
4. Mark a task completed, and see it move in the board and see dashboard and project statistics update.
5. Search and filter tasks together, and see only matching tasks.
6. Delete a task after confirming, and see it disappear.
7. Create data, refresh the browser, and see the data still there.

## UX principles

These apply to every screen. They are requirements, not polish.

**Every data view handles four states.** Loading, empty, error, and populated. No screen may render a bare blank area while a request is in flight, and no screen may silently render nothing when a request fails.

**Empty states are specific and actionable.** "No projects yet" offers a create button. "No tasks yet" offers a create button. "No tasks match your search" and "No tasks match these filters" are distinct messages, and neither should offer a create button as the primary action, because creating a task is not the fix for an over-narrow filter.

**Every mutation shows progress.** Create, update, delete, and status change all disable their trigger and show an in-progress indication until the server responds. A user must never be able to double-submit a form.

**Every mutation confirms its outcome.** Success produces a short toast: project created, project updated, project deleted, task created, task updated, task deleted, task status updated. Failure produces a readable error message, never a raw stack trace, status code, or JSON blob.

**Destructive actions require confirmation.** Deleting a project or a task opens a confirmation dialog first. The project delete dialog must state plainly that the project's tasks will be deleted too, and should say how many.

**Validation is helpful, not cryptic.** Required fields are validated before submit. Server-side validation errors map back to the specific field that caused them. Messages say what to correct, not that something is invalid.

**Status and priority are visually distinct.** A user should be able to distinguish status and priority at a glance in lists, in details, and on board cards, without reading carefully. Colour alone is not sufficient: pair it with text so the distinction survives colour-blindness and greyscale.

**Mobile-first and responsive.** The layout works from small phone widths up. On desktop the navigation is a persistent sidebar; on small screens it collapses behind a toggle. The Kanban board stays usable on narrow screens through horizontal scrolling of its three columns, never by squeezing columns until cards are unreadable.

**Usability beats visual complexity.** Prefer a plain, legible, consistent interface over decoration. Consistent typography, spacing, buttons, forms, cards, lists, and dialogs throughout.

## Definition of done

The product is complete when all seven flows above work, every in-scope area behaves as described, data survives a restart, and the acceptance criteria in `docs/product-requirements.md` §29 all pass. That document is the authority on scope; this file is the summary you should read first.
