---
inclusion: manual
---

# TaskFlow — API Standards

Related steering: reference `#architecture` for the layer pipeline that produces these responses, `#structure` for where each file lives, `#product` for the domain vocabulary and enum values, `#tech-stack` for the libraries.

This is the contract between `frontend/` and `backend/`. Both sides must match it exactly.

## Conventions

- Base path `/api`. Every endpoint sits under it.
- URL paths are kebab-case with plural resource names. Path params are Mongo ObjectId strings.
- JSON fields are camelCase. Request and response bodies are always JSON.
- Dates are ISO 8601 UTC strings, for example `2026-03-14T09:00:00.000Z`. Never epoch numbers, never local-formatted strings.
- Enum values on the wire are the lowercase forms from `#product`: task status `todo | in_progress | completed`, priority `low | medium | high`, project status `active | completed | archived`. Display labels never cross the API.
- Entity IDs are exposed as `id`, a string. `_id` and `__v` are never present in a response.
- `createdAt` and `updatedAt` are present on every project and task, set by Mongoose `timestamps: true`.
- `PATCH` is a partial update: only the fields present in the body change, and omitting a field leaves it untouched. There is no `PUT`.
- To clear an optional field, send `null` explicitly. Omitting it is not the same as clearing it.

## Response envelopes

Success always wraps the payload in `data`. List responses add `meta`.

Single resource:

```json
{
  "data": {
    "id": "6613f2a1c4d3b21f88e5a901",
    "name": "Website Redesign",
    "description": "Marketing site refresh",
    "status": "active",
    "taskCount": 12,
    "completedTaskCount": 5,
    "createdAt": "2026-03-01T10:15:00.000Z",
    "updatedAt": "2026-03-12T08:42:11.000Z"
  }
}
```

Collection:

```json
{
  "data": [ { "id": "…" }, { "id": "…" } ],
  "meta": { "total": 42, "page": 1, "limit": 50, "totalPages": 1 }
}
```

Failure always wraps in `error`, and never includes `data`:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      { "field": "title", "message": "Title is required" },
      { "field": "priority", "message": "Priority must be one of: low, medium, high" }
    ]
  }
}
```

`details` is present only for `VALIDATION_ERROR`. Each entry names one field, using the same field name the client sent, so React Hook Form can map it straight onto the offending input. Nested paths use dots, for example `labels.0`.

A `204` response has no body at all.

## Status codes

| Code | Used for |
|---|---|
| 200 | Successful read, successful update, successful status change |
| 201 | Resource created. Body contains the created resource |
| 204 | Successful delete. No body |
| 400 | Request failed validation, or a path or query param is malformed, including a non-ObjectId id |
| 404 | Route does not exist, or the addressed resource does not exist |
| 500 | Unexpected server-side failure, including database failures |

No other status codes. There is no auth in this version, so no 401 or 403. Uniqueness is not enforced on project names, so no 409.

## Error codes

| `code` | Status | Meaning | Client presentation |
|---|---|---|---|
| `VALIDATION_ERROR` | 400 | Body, params, or query failed the Zod schema. Covers missing required fields, wrong types, and invalid status or priority values | Map `details` onto form fields; show remaining messages at form level |
| `INVALID_ID` | 400 | A path param is not a valid Mongo ObjectId | "That project or task link is not valid" |
| `NOT_FOUND` | 404 | The requested project or task does not exist, or the route is unknown | Inline not-found state with a way back to the list |
| `INTERNAL_ERROR` | 500 | Anything unexpected: a bug, a Mongoose failure, a lost database connection | Generic "Something went wrong, please try again" plus a retry action |

Client-side conditions that never reach the server get handled by `apiClient`, not by an error code: a fetch that rejects with no response is presented as a connection problem, distinct from any server rejection.

A 500 body never leaks internals. The stack trace and the original message are logged server-side; the client receives only the generic message.

Mapping from the failure cases the PRD calls out:

| PRD failure case | Status and code |
|---|---|
| Invalid form data | 400 `VALIDATION_ERROR` |
| Invalid project or task ID | 400 `INVALID_ID` |
| Project not found | 404 `NOT_FOUND` |
| Task not found | 404 `NOT_FOUND` |
| Invalid status or priority | 400 `VALIDATION_ERROR` |
| Network failure | No response; handled in `apiClient` as a connection error |
| Server error | 500 `INTERNAL_ERROR` |
| Database error | 500 `INTERNAL_ERROR` |

## Endpoints

```
GET    /api/health

GET    /api/projects
POST   /api/projects
GET    /api/projects/:id
PATCH  /api/projects/:id
DELETE /api/projects/:id
GET    /api/projects/:id/tasks

GET    /api/tasks?search=&projectId=&status=&priority=&sortBy=&sortOrder=&page=&limit=
POST   /api/tasks
GET    /api/tasks/:id
PATCH  /api/tasks/:id
DELETE /api/tasks/:id
PATCH  /api/tasks/:id/status

GET    /api/dashboard/summary
```

### Projects

| Endpoint | Notes |
|---|---|
| `GET /api/projects` | Returns every project. Each entry includes `taskCount` and `completedTaskCount`, computed server-side, because the project list must show both. Sorted by `createdAt` descending. |
| `POST /api/projects` | Body: `name` required; `description` and `status` optional. `status` defaults to `active`. Returns 201 with the created project. |
| `GET /api/projects/:id` | Returns one project including its counts. 404 `NOT_FOUND` if absent. |
| `PATCH /api/projects/:id` | Partial update of `name`, `description`, `status`. Returns 200 with the updated project. |
| `DELETE /api/projects/:id` | Deletes the project and all of its tasks. Returns 204. |
| `GET /api/projects/:id/tasks` | Tasks belonging to one project. Accepts the same query params as `GET /api/tasks` except `projectId`, which is taken from the path. 404 if the project does not exist. |

Project create and update never accept `taskCount`, `completedTaskCount`, `createdAt`, `updatedAt`, or `id`. Those are server-owned; sending them is a validation error.

### Tasks

| Endpoint | Notes |
|---|---|
| `GET /api/tasks` | Searchable, filterable, sortable, paginated. See the query params below. Each task embeds a minimal project reference so lists can show the project name without a second request. |
| `POST /api/tasks` | Body: `title`, `projectId`, `status`, `priority` required; `description`, `dueDate`, `labels` optional. The service verifies the project exists before inserting, and returns 404 `NOT_FOUND` if it does not. Returns 201. |
| `GET /api/tasks/:id` | One task with the full field set plus its project reference. |
| `PATCH /api/tasks/:id` | Partial update of `title`, `description`, `projectId`, `status`, `priority`, `dueDate`, `labels`. If `projectId` changes, the new project is verified to exist. |
| `DELETE /api/tasks/:id` | Returns 204. |
| `PATCH /api/tasks/:id/status` | Body: `{ "status": "in_progress" }` and nothing else. Exists so the board and list can change status without sending a whole task. Returns 200 with the updated task. |

A task response:

```json
{
  "data": {
    "id": "6613f5b7c4d3b21f88e5a933",
    "title": "Audit landing page copy",
    "description": "Check tone and length against the style guide",
    "projectId": "6613f2a1c4d3b21f88e5a901",
    "project": { "id": "6613f2a1c4d3b21f88e5a901", "name": "Website Redesign" },
    "status": "in_progress",
    "priority": "high",
    "dueDate": "2026-03-20T00:00:00.000Z",
    "labels": ["copy", "seo"],
    "createdAt": "2026-03-05T14:02:00.000Z",
    "updatedAt": "2026-03-13T09:31:47.000Z"
  }
}
```

`projectId` is the writable field. `project` is a read-only convenience projection; sending it is a validation error.

### Task query params

All optional. All validated and coerced by Zod, so the service receives typed values.

| Param | Values | Default | Behaviour |
|---|---|---|---|
| `search` | free text | none | Case-insensitive partial match on task title only. Trimmed; an empty string is treated as absent. |
| `projectId` | ObjectId | none | Restricts to one project. Absent means all projects. |
| `status` | `todo`, `in_progress`, `completed` | none | Absent means all statuses. |
| `priority` | `low`, `medium`, `high` | none | Absent means all priorities. |
| `sortBy` | `createdAt`, `updatedAt`, `dueDate`, `priority` | `createdAt` | Any other value is a `VALIDATION_ERROR`. |
| `sortOrder` | `asc`, `desc` | `desc` | |
| `page` | integer ≥ 1 | `1` | |
| `limit` | integer 1–100 | `50` | |

Filters combine with AND. Project `Website Redesign` + status `in_progress` + priority `high` returns only tasks matching all three. Search combines with the filters the same way.

Two sorting details the implementation must get right:

**Priority sorts semantically, not alphabetically.** `high | low | medium` is the alphabetical order, which is meaningless to a user. Sorting by priority uses an aggregation stage that projects a numeric weight — `high` 3, `medium` 2, `low` 1 — and sorts on that, descending by default so the most urgent work is first.

**Tasks with no due date sort last** when sorting by `dueDate`, in both directions. A missing due date is not "earliest"; it is "unscheduled". Add `_id` as a final tiebreaker on every sort so pagination is stable and a page boundary never drops or repeats a row.

### Dashboard

`GET /api/dashboard/summary` returns everything the dashboard needs in one request:

```json
{
  "data": {
    "stats": {
      "totalProjects": 6,
      "activeProjects": 4,
      "totalTasks": 42,
      "todoTasks": 18,
      "inProgressTasks": 12,
      "completedTasks": 12
    },
    "recentTasks": [ { "id": "…", "title": "…", "project": { "id": "…", "name": "…" }, "status": "todo", "priority": "high", "updatedAt": "…" } ],
    "upcomingTasks": [ { "id": "…", "title": "…", "project": { "id": "…", "name": "…" }, "dueDate": "…", "priority": "medium" } ]
  }
}
```

- `stats` is computed with aggregation, never by loading every document and counting in JavaScript.
- `recentTasks` is the most recently created or updated tasks, sorted by `updatedAt` descending. Default 5, adjustable with `recentLimit`.
- `upcomingTasks` is tasks that have a due date, are not `completed`, and are due from today onward, sorted by `dueDate` ascending. Default 5, adjustable with `upcomingLimit`.
- Overdue incomplete tasks are included and flagged client-side by comparing `dueDate` to now. The API does not compute an `isOverdue` field.

`GET /api/health` returns `{ "data": { "status": "ok", "database": "connected" } }` for smoke checks. It is not part of the product UI.

## Validation middleware contract

One `validate` middleware, given an object of up to three Zod schemas:

```ts
router.patch(
  '/:id',
  validate({ params: taskIdParamSchema, body: updateTaskSchema }),
  asyncHandler(taskController.update),
);
```

Rules:

- The middleware parses `body`, `params`, and `query`, and replaces each with the parsed result, so coercions such as string-to-number for `page` are visible downstream.
- A Zod failure becomes 400 `VALIDATION_ERROR`, with one `details` entry per issue, `field` taken from the issue path joined with dots.
- ObjectId params are validated by a shared schema that produces `INVALID_ID` rather than the generic validation code, because the client presents a bad link differently from a bad form.
- Schemas use `.strict()` on bodies so unknown fields are rejected instead of silently ignored. That is what makes sending `project` or `taskCount` an error.
- Update schemas require at least one field, so an empty `PATCH` body is a validation error rather than a no-op success.
- Validation messages are written for a person: "Title is required", "Due date must be a valid date". Never "Invalid input".
- Every schema lives in the module's `*.validation.ts`. Controllers never re-validate.

## Cascade delete

`DELETE /api/projects/:id` removes the project and every task pointing at it. The project service performs this in one place, in this order:

1. Confirm the project exists, or throw 404 `NOT_FOUND`.
2. Delete the project's tasks with a single `deleteMany({ projectId })`.
3. Delete the project.

Tasks go first so a failure cannot leave tasks orphaned behind a missing project. The frontend must invalidate both the task and project caches afterwards, per `#architecture`.

This is not atomic. MongoDB multi-document transactions require a replica set, and a standalone local instance does not have one, so a crash between steps 2 and 3 can leave a project with no tasks. That is the accepted tradeoff for this version, and the ordering above makes the worst case a project that looks empty rather than tasks stranded without a parent. Do not write code that claims transactional guarantees here.

The confirmation dialog must tell the user how many tasks will be deleted, which is why `taskCount` is part of the project payload.

## CORS

The API allows exactly one browser origin, read from `CORS_ORIGIN`. In development that is the Vite dev server origin, `http://localhost:5173` by default. Methods allowed: `GET`, `POST`, `PATCH`, `DELETE`, `OPTIONS`. No credentials, since there is no auth. Do not use a wildcard origin.

## Worked examples

Create a task:

```bash
curl -i -X POST http://localhost:3000/api/tasks \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "Audit landing page copy",
    "projectId": "6613f2a1c4d3b21f88e5a901",
    "status": "todo",
    "priority": "high",
    "dueDate": "2026-03-20T00:00:00.000Z",
    "labels": ["copy", "seo"]
  }'
```

Expected `201`, body `{ "data": { … } }` with the created task including `id`, `project`, `createdAt`, and `updatedAt`.

The same call missing `title` and with a bad priority returns `400`:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      { "field": "title", "message": "Title is required" },
      { "field": "priority", "message": "Priority must be one of: low, medium, high" }
    ]
  }
}
```

Combined search, filter, and sort — high-priority in-progress tasks in one project, most recently updated first:

```bash
curl -G http://localhost:3000/api/tasks \
  --data-urlencode 'search=landing' \
  --data-urlencode 'projectId=6613f2a1c4d3b21f88e5a901' \
  --data-urlencode 'status=in_progress' \
  --data-urlencode 'priority=high' \
  --data-urlencode 'sortBy=updatedAt' \
  --data-urlencode 'sortOrder=desc' \
  --data-urlencode 'limit=20'
```

Expected `200`, body `{ "data": [ … ], "meta": { "total": …, "page": 1, "limit": 20, "totalPages": … } }`. A query matching nothing returns `200` with `data: []` and `total: 0`, not a 404. An empty list is a successful result, and the frontend distinguishes "no tasks at all" from "no matches" by whether any filter or search term is active.

Move a task to completed:

```bash
curl -i -X PATCH http://localhost:3000/api/tasks/6613f5b7c4d3b21f88e5a933/status \
  -H 'Content-Type: application/json' \
  -d '{"status":"completed"}'
```

Expected `200` with the updated task. A malformed id returns `400` `INVALID_ID`; a well-formed id that does not exist returns `404` `NOT_FOUND`.
