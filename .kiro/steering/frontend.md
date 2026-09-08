---
inclusion: always
---

# Frontend Rules — React + TypeScript + Tailwind

## Folder Structure
```
frontend/
  src/
    pages/        # One file per route/page
    components/   # Reusable UI components
    api/          # Axios API call functions
    types/        # Shared TypeScript interfaces
```

## Patterns

### API Calls
- All API calls go in the `api/` folder
- Use Axios for all requests
- Never call fetch or axios directly from a component

### State
- Use React useState and useEffect for local state
- No external state management library needed

### Loading / Error / Empty States
- Every page that fetches data must handle:
  - Loading state — show a spinner or message
  - Error state — show a user-friendly error message
  - Empty state — show a helpful message with an action

### Components
- Keep components small and focused
- Use Tailwind classes directly — no custom CSS files
- Use TypeScript interfaces from `types/` for all props and API responses

### Forms
- Validate required fields before submitting
- Show inline validation messages
- Disable the submit button while a request is in progress
