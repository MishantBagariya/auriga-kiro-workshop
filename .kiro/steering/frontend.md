---
inclusion: auto
description: React + TypeScript + Material UI frontend conventions for TaskFlow
---

# Frontend Conventions

## Technology

- **Build Tool:** Vite
- **Framework:** React 18 with functional components
- **Language:** TypeScript (strict mode)
- **UI Library:** Material UI (MUI) v5
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **State Management:** React Context + useReducer for global state, useState for local

## Folder Structure

```
client/src/
├── components/         # Reusable UI components (buttons, cards, dialogs, etc.)
│   ├── common/         # Generic shared components (LoadingSpinner, EmptyState, etc.)
│   └── layout/         # Layout components (Sidebar, MainContent, AppLayout)
├── pages/              # Page-level components mapped to routes
│   ├── Dashboard/
│   ├── Projects/
│   └── Tasks/
├── hooks/              # Custom React hooks
├── services/           # API service functions (axios calls)
├── types/              # TypeScript interfaces and types
├── utils/              # Utility/helper functions
├── context/            # React context providers (AppContext, etc.)
├── theme.ts            # MUI theme configuration
├── App.tsx             # Root component with routing
└── main.tsx            # Entry point
```

## Component Conventions

- Use functional components exclusively — no class components
- One component per file
- Props interface defined above the component in the same file (or in `types/` for shared types)
- Use named exports, not default exports
- Component file name matches the component name in PascalCase: `TaskList.tsx` exports `TaskList`

```tsx
// Example component structure
import { Box, Typography } from "@mui/material";

interface TaskCardProps {
  title: string;
  status: "todo" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
}

export const TaskCard = ({ title, status, priority }: TaskCardProps) => {
  return (
    <Box>
      <Typography variant="h6">{title}</Typography>
    </Box>
  );
};
```

## MUI Usage

- Use MUI components over custom HTML elements (Button, TextField, Card, Dialog, Table, etc.)
- Define theme in `client/src/theme.ts` — customize palette, typography, spacing
- Use the `sx` prop for one-off styles, `styled()` for reusable styled components
- Use MUI's `Grid` and `Box` for layout
- Use `CircularProgress` and `Skeleton` for loading states
- Use `Snackbar` + `Alert` for toast notifications
- Use `Dialog` for confirmation modals (delete actions)

## Routing

- Define all routes in `App.tsx` using React Router v6
- Use `<Outlet>` for nested layouts
- Routes:
  - `/` — Dashboard
  - `/projects` — Project list
  - `/projects/:id` — Project details
  - `/tasks` — Task list (with board/list toggle)
  - `/tasks/:id` — Task details

## API Services

- All API calls live in `client/src/services/`
- One service file per resource: `project.service.ts`, `task.service.ts`, `dashboard.service.ts`
- Use axios with a configured base instance pointing to `http://localhost:3001/api/v1`
- Return typed responses
- Handle errors at the service level and re-throw with user-friendly messages

```tsx
// Example service
import { api } from "./api";
import { Project, CreateProjectDto } from "../types";

export const projectService = {
  getAll: () => api.get<Project[]>("/projects"),
  getById: (id: string) => api.get<Project>(`/projects/${id}`),
  create: (data: CreateProjectDto) => api.post<Project>("/projects", data),
  update: (id: string, data: Partial<Project>) =>
    api.put<Project>(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
};
```

## State Management

- **Global state:** App-wide data (projects list, notifications) via React Context + useReducer
- **Local state:** Component-specific UI state (form inputs, toggles) via useState
- **Server state:** Fetch on mount, refetch after mutations. Consider a simple cache-invalidation pattern.
- Avoid prop drilling deeper than 2 levels — use context or composition instead

## Form Handling

- Use controlled components with MUI TextField, Select, etc.
- Validate required fields before submission
- Display validation errors using MUI's `error` and `helperText` props
- Disable submit button while submitting (loading state)
- Show success/error feedback via Snackbar after submission

## Error Handling

- Wrap page components in an Error Boundary
- Display user-friendly error messages (not raw error strings)
- Use Snackbar/Alert for transient errors (network issues, validation failures)
- Show inline error states for failed data fetches

## Loading States

- Show `CircularProgress` centered for full-page loads
- Show `Skeleton` components for content that's loading within a page
- Disable interactive elements during async operations

## Empty States

- Show a descriptive message and a call-to-action button
- Examples: "No projects yet — Create your first project", "No tasks match your filters"

## Environment Variables

- Prefix all env vars with `VITE_` (Vite requirement)
- `VITE_API_BASE_URL=http://localhost:3001/api/v1`
- Access via `import.meta.env.VITE_API_BASE_URL`
