---
inclusion: manual
description: Scaffold a new React component with MUI and TypeScript
---

# Skill: Create React Component

## Inputs

- **componentName** (required): Name of the component in PascalCase (e.g., `TaskList`, `ProjectCard`)
- **componentType** (required): One of `page`, `component`, or `layout`
- **props** (optional): List of props with types

## Steps

### 1. Determine Location

Based on `componentType`:

- `page` → `client/src/pages/{componentName}/{componentName}.tsx`
- `component` → `client/src/components/{componentName}/{componentName}.tsx`
- `layout` → `client/src/components/layout/{componentName}.tsx`

### 2. Create Component File

Create the component file with this structure:

```tsx
import { Box } from '@mui/material';

interface {componentName}Props {
  // Add props here
}

export const {componentName} = ({}: {componentName}Props) => {
  return (
    <Box>
      {/* Component content */}
    </Box>
  );
};
```

### 3. Create Index Export (for pages and components)

Create an `index.ts` file in the component folder:

```typescript
export { {componentName} } from './{componentName}';
```

### 4. Add Route (for page components only)

If the component is a `page`, add a route entry in `client/src/App.tsx`:

```tsx
<Route path="/{routePath}" element={<{componentName} />} />
```

### 5. MUI Patterns

- Use MUI components for all UI elements
- Import from `@mui/material` or `@mui/icons-material`
- Use `sx` prop for styles
- Use `Typography` for text content
- Use `Box`, `Stack`, `Grid` for layout

## Example Usage

"Create a page component called ProjectDetails with props: projectId (string)"

Result:

- Creates `client/src/pages/ProjectDetails/ProjectDetails.tsx`
- Creates `client/src/pages/ProjectDetails/index.ts`
- Adds route in App.tsx

## Conventions

- Functional components only
- Named exports (no default exports)
- Props interface defined in the same file
- MUI imports at the top
- TypeScript strict typing for all props
