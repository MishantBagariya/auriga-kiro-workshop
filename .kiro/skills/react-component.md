---
inclusion: manual
---

# Skill: Create a React Component

## When to Use

Use this skill when creating a new React component for the TaskFlow application — whether it's a page component, a feature component, or a reusable UI element.

## Instructions

### 1. Determine Component Type

- **Page component** → Place in `client/src/pages/`
- **Feature component** → Place in `client/src/components/{feature}/` (e.g., `projects/`, `tasks/`, `dashboard/`)
- **Layout component** → Place in `client/src/components/layout/`
- **UI primitive** → Place in `client/src/components/ui/` (shadcn/ui pattern)

### 2. Create the Component File

File name: `kebab-case.tsx` (e.g., `project-list.tsx`, `task-card.tsx`)

```tsx
import { /* hooks, utilities */ } from '@/hooks/...'
import { /* UI components */ } from '@/components/ui/...'

interface ComponentNameProps {
  // Define typed props
}

export function ComponentName({ ...props }: ComponentNameProps) {
  // Component logic

  return (
    // JSX with Tailwind classes
  )
}
```

### 3. Follow These Patterns

- Use **named exports** (not default exports)
- Define a **TypeScript interface** for props
- Use **functional components** with hooks
- Apply **Tailwind CSS** for styling (no inline styles or CSS modules)
- Use **shadcn/ui** primitives (Button, Card, Dialog, etc.) for common elements
- Add **aria attributes** for accessibility
- Handle **loading**, **error**, and **empty** states

### 4. Data Fetching Pattern

For components that fetch data, use a custom hook:

```tsx
// hooks/use-projects.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => api.get('/projects'),
  })
}
```

Then consume in the component:

```tsx
export function ProjectList() {
  const { data, isLoading, error } = useProjects()

  if (isLoading) return <ProjectListSkeleton />
  if (error) return <ErrorMessage error={error} />
  if (!data?.length) return <EmptyState message="No projects yet" />

  return (/* render list */)
}
```

### 5. Responsive Design

- Use Tailwind responsive prefixes: `sm:`, `md:`, `lg:`
- Mobile-first approach: base styles are mobile, add breakpoints for larger
- Test at 375px, 768px, 1024px, 1440px widths

### 6. Checklist

- [ ] Props interface defined with TypeScript
- [ ] Named export used
- [ ] Loading state handled
- [ ] Error state handled
- [ ] Empty state handled
- [ ] Accessible (aria labels, keyboard navigation)
- [ ] Responsive (works on mobile through desktop)
- [ ] Uses shadcn/ui primitives where applicable
- [ ] Uses Tailwind for styling
