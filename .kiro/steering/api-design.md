---
inclusion: auto
description: REST API design patterns and conventions for TaskFlow
---

# API Design

## Base URL

All API endpoints are prefixed with:

```
/api/v1
```

## Endpoints

### Projects

| Method | Path                   | Description                           |
| ------ | ---------------------- | ------------------------------------- |
| GET    | `/api/v1/projects`     | List all projects                     |
| POST   | `/api/v1/projects`     | Create a new project                  |
| GET    | `/api/v1/projects/:id` | Get project details (with task stats) |
| PUT    | `/api/v1/projects/:id` | Update a project                      |
| DELETE | `/api/v1/projects/:id` | Delete project and its tasks          |

### Tasks

| Method | Path                       | Description                                          |
| ------ | -------------------------- | ---------------------------------------------------- |
| GET    | `/api/v1/tasks`            | List tasks (supports search, filter, sort, paginate) |
| POST   | `/api/v1/tasks`            | Create a new task                                    |
| GET    | `/api/v1/tasks/:id`        | Get task details                                     |
| PUT    | `/api/v1/tasks/:id`        | Update a task                                        |
| DELETE | `/api/v1/tasks/:id`        | Delete a task                                        |
| PATCH  | `/api/v1/tasks/:id/status` | Update task status only                              |

### Dashboard

| Method | Path                               | Description                    |
| ------ | ---------------------------------- | ------------------------------ |
| GET    | `/api/v1/dashboard/stats`          | Project and task statistics    |
| GET    | `/api/v1/dashboard/recent-tasks`   | Recently created/updated tasks |
| GET    | `/api/v1/dashboard/upcoming-tasks` | Tasks with upcoming due dates  |

## HTTP Status Codes

| Code | Usage                                          |
| ---- | ---------------------------------------------- |
| 200  | Successful GET, PUT, PATCH                     |
| 201  | Successful POST (resource created)             |
| 204  | Successful DELETE (no content)                 |
| 400  | Bad request (malformed JSON, invalid params)   |
| 404  | Resource not found                             |
| 422  | Validation error (valid JSON but invalid data) |
| 500  | Internal server error                          |

## Response Format

### Success — Single Resource

```json
{
  "success": true,
  "data": {
    "_id": "64f...",
    "name": "Website Redesign",
    "status": "active",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

### Success — Collection with Pagination

```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "total": 45,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

### Error — Validation

```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "details": [
      { "field": "title", "message": "Title is required" },
      {
        "field": "priority",
        "message": "Priority must be low, medium, or high"
      }
    ]
  }
}
```

### Error — Not Found

```json
{
  "success": false,
  "error": {
    "message": "Project not found"
  }
}
```

## Query Parameters for Task Listing

`GET /api/v1/tasks?search=redesign&project=64f...&status=in-progress&priority=high&sortBy=dueDate&sortOrder=asc&page=1&limit=20`

| Parameter   | Type   | Description                                                 | Default     |
| ----------- | ------ | ----------------------------------------------------------- | ----------- |
| `search`    | string | Search tasks by title (partial match)                       | —           |
| `project`   | string | Filter by project ID                                        | —           |
| `status`    | string | Filter by status: `todo`, `in-progress`, `completed`        | —           |
| `priority`  | string | Filter by priority: `low`, `medium`, `high`                 | —           |
| `sortBy`    | string | Sort field: `createdAt`, `updatedAt`, `dueDate`, `priority` | `createdAt` |
| `sortOrder` | string | Sort direction: `asc`, `desc`                               | `desc`      |
| `page`      | number | Page number (1-indexed)                                     | `1`         |
| `limit`     | number | Items per page (max 100)                                    | `20`        |

Filters are combinable — all specified filters are applied with AND logic.

## Request Body Format

### Create Project

```json
{
  "name": "Website Redesign",
  "description": "Redesign the company website",
  "status": "active"
}
```

### Create Task

```json
{
  "title": "Design homepage mockup",
  "description": "Create wireframes and visual design for the homepage",
  "projectId": "64f...",
  "status": "todo",
  "priority": "high",
  "dueDate": "2024-02-15",
  "labels": ["design", "homepage"]
}
```

### Update Task Status

```json
{
  "status": "in-progress"
}
```

## Validation Rules

### Project

- `name`: required, string, max 100 characters
- `description`: optional, string, max 500 characters
- `status`: optional on create (defaults to "active"), must be one of: active, completed, archived

### Task

- `title`: required, string, max 200 characters
- `projectId`: required, valid MongoDB ObjectId, must reference existing project
- `status`: required, one of: todo, in-progress, completed
- `priority`: required, one of: low, medium, high
- `description`: optional, string, max 2000 characters
- `dueDate`: optional, valid ISO date string
- `labels`: optional, array of strings

## Error Handling Patterns

- Invalid MongoDB ObjectId → 400 Bad Request
- Resource not found → 404 Not Found
- Validation failures → 422 Unprocessable Entity with field-level details
- Referenced project doesn't exist (on task creation) → 422 with message
- Database errors → 500 Internal Server Error (don't expose internals)
