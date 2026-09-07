---
inclusion: always
---

# Frontend Standards — TaskFlow

## TypeScript

- Strict mode enabled
- No `any` types — use proper typing or `unknown` with type guards
- Prefer interfaces for object shapes, types for unions/intersections
- Export types from `types/index.ts` for shared use
- Use `as const` for constant arrays (status values, priority values)

## React / Next.js

- Use Server Components by default; add `"use client"` only when needed (event handlers, hooks, browser APIs)
- Keep page components thin — delegate to domain components
- Colocate related components in domain folders (projects/, tasks/, dashboard/)
- Use `Suspense` boundaries for loading states where appropriate
- Prefer named exports over default exports for components

## Component Patterns

- File naming: kebab-case (e.g., `task-card.tsx`, `project-form.tsx`)
- Component naming: PascalCase exports (e.g., `export function TaskCard()`)
- Props: define as interface above the component (e.g., `interface TaskCardProps {}`)
- Keep components focused — one responsibility per component
- Extract reusable logic into custom hooks in `hooks/` folder

## API Routes

- Always validate request body with Zod before processing
- Return consistent response shape:
  ```ts
  // Success
  { data: T, message?: string }
  
  // Error
  { error: string, details?: Record<string, string[]> }
  ```
- Use appropriate HTTP status codes:
  - 200: Success (GET, PUT, PATCH)
  - 201: Created (POST)
  - 400: Validation error
  - 404: Not found
  - 500: Server error
- Wrap route handlers in try/catch for unexpected errors
- Validate path params (check UUID format for IDs)

## Forms and Validation

- Use React Hook Form for all forms
- Connect Zod schemas via `@hookform/resolvers/zod`
- Show field-level error messages below inputs
- Disable submit button while submitting
- Show loading state on submit button during API call
- Clear form or navigate away on success

## State Management

- TanStack Query for all server state (projects, tasks, dashboard)
- Use query keys consistently: `["projects"]`, `["projects", id]`, `["tasks", filters]`
- Invalidate related queries after mutations (e.g., after creating a task, invalidate project details too)
- Use optimistic updates sparingly — prefer invalidation for data consistency

## Error Handling

- API routes: catch errors, log them, return user-friendly messages
- Frontend: use TanStack Query's error state, display via error components
- Network errors: show toast with "Something went wrong, please try again"
- Validation errors: show inline field messages
- Not found: show appropriate empty/error state

## Accessibility

- All interactive elements must be keyboard accessible
- Use semantic HTML (headings hierarchy, landmarks, lists)
- Form inputs must have associated labels
- Color is not the only indicator (use icons/text alongside color for priority/status)
- Modal dialogs must trap focus and support Escape to close
- shadcn/ui provides good a11y defaults — don't override them
