---
inclusion: auto
description: Shared coding standards for TaskFlow (ESLint, Prettier, naming, conventions)
---

# Coding Standards

## Linting — ESLint

### Shared Rules (both client and server)

- Extend: `eslint:recommended`, `plugin:@typescript-eslint/recommended`
- No unused variables (warn)
- No explicit `any` (error)
- Consistent return types on functions
- No console.log in production (warn) — use proper logger in server

### Frontend Additional Rules

- Extend: `plugin:react/recommended`, `plugin:react-hooks/recommended`
- React in JSX scope not required (React 18 automatic JSX runtime)
- Exhaustive deps for hooks

### Backend Additional Rules

- No floating promises (must be awaited or handled)
- Consistent type assertions

## Formatting — Prettier

Configuration (`.prettierrc` at project root):

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

## File Naming

| Type             | Convention                       | Example                           |
| ---------------- | -------------------------------- | --------------------------------- |
| React components | PascalCase `.tsx`                | `TaskList.tsx`, `ProjectCard.tsx` |
| Hooks            | camelCase with `use` prefix      | `useProjects.ts`, `useTasks.ts`   |
| Services         | kebab-case with `.service.ts`    | `project.service.ts`              |
| Controllers      | kebab-case with `.controller.ts` | `project.controller.ts`           |
| Models           | kebab-case with `.model.ts`      | `project.model.ts`                |
| Routes           | kebab-case with `.routes.ts`     | `project.routes.ts`               |
| Validators       | kebab-case with `.validator.ts`  | `project.validator.ts`            |
| Types            | kebab-case with `.types.ts`      | `project.types.ts`                |
| Utils            | kebab-case                       | `format-date.ts`, `response.ts`   |
| Config           | kebab-case                       | `database.ts`, `environment.ts`   |
| Test files       | same name with `.test.ts` suffix | `project.service.test.ts`         |

## Variable & Type Naming

| Item                  | Convention                      | Example                             |
| --------------------- | ------------------------------- | ----------------------------------- |
| Variables & functions | camelCase                       | `getProjects`, `taskCount`          |
| Constants             | UPPER_SNAKE_CASE                | `MAX_TITLE_LENGTH`, `API_BASE_URL`  |
| Types & Interfaces    | PascalCase                      | `Project`, `CreateTaskDto`          |
| Interface prefix      | I-prefix for Mongoose docs only | `IProject`, `ITask`                 |
| DTOs                  | PascalCase with Dto suffix      | `CreateProjectDto`, `UpdateTaskDto` |
| Enums                 | PascalCase                      | `TaskStatus`, `TaskPriority`        |
| React components      | PascalCase                      | `TaskBoard`, `ProjectList`          |
| Custom hooks          | camelCase with `use` prefix     | `useProjects`, `useTaskFilters`     |

## Import Ordering

Organize imports in this order with blank lines between groups:

```typescript
// 1. External packages
import express from "express";
import mongoose from "mongoose";

// 2. Internal modules (absolute paths / aliases)
import { AppError } from "../utils/app-error";
import { ProjectService } from "../services/project.service";

// 3. Relative imports (same feature/module)
import { validateProject } from "./project.validator";

// 4. Types (if separate)
import type { CreateProjectDto } from "../types/project.types";
```

## Error Handling

- Always use try/catch in async controller methods
- Never swallow errors — always log or rethrow
- Throw typed errors (`AppError`) with appropriate HTTP status codes
- Frontend: display user-friendly messages, log technical details to console in dev only

## TypeScript Rules

- **Strict mode enabled** in both client and server tsconfig
- No `any` — use `unknown` if type cannot be determined, then narrow
- Prefer `const` over `let`, never use `var`
- Use `interface` for object shapes, `type` for unions/intersections
- Prefer named exports over default exports
- Define return types on public/exported functions
- Use generics for reusable utilities

## Git Commit Messages

Follow Conventional Commits format:

```
<type>(<scope>): <description>

Types:
- feat: new feature
- fix: bug fix
- chore: maintenance, dependencies
- docs: documentation
- refactor: code restructuring without behavior change
- test: adding or fixing tests
- style: formatting, whitespace (no logic change)

Examples:
- feat(tasks): add task filtering by priority
- fix(api): handle invalid ObjectId in project routes
- chore(deps): update mongoose to v8
- refactor(services): extract pagination logic to utility
```

## General Rules

- Keep functions short and focused (< 40 lines preferred)
- One responsibility per file
- DRY — extract repeated logic into utilities or shared functions
- YAGNI — don't add features or abstractions not yet needed
- Prefer composition over inheritance
- Comment "why", not "what" — code should be self-documenting
- Remove dead code — don't leave commented-out blocks
