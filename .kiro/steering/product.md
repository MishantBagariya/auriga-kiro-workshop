---
inclusion: always
---

# Product Context — TaskFlow

## What We're Building

TaskFlow is a single-user, full-stack task management application. It allows the user to create projects, manage tasks within those projects, and track progress across everything.

## Core Entities

### Project
- Fields: id, name, description (optional), status, createdAt, updatedAt
- Status values: active, completed, archived
- A project can have many tasks
- Deleting a project cascades to delete all its tasks

### Task
- Fields: id, title, description (optional), projectId, status, priority, dueDate (optional), labels (optional), createdAt, updatedAt
- Status values: todo, in_progress, completed
- Priority values: low, medium, high
- Labels: stored as JSON array string
- Every task belongs to exactly one project

## Key Features

- Dashboard with summary stats, recent tasks, upcoming tasks
- Project CRUD with details page showing task list
- Task CRUD with status changes and priority
- Task list view and Kanban board view (3 columns by status)
- Search by task title
- Filter by project, status, priority (combinable)
- Sort by created date, updated date, due date, priority (asc/desc)

## UX Requirements

- Form validation on client + independent backend validation
- Loading states on all async operations
- Empty states when no data or no results
- Confirmation dialogs before destructive actions
- Toast notifications for success/error feedback
- Responsive design (desktop, tablet, mobile)

## Constraints

- Single-user — no authentication required
- Database is the source of truth (no localStorage as primary store)
- All mutations go through the backend API
