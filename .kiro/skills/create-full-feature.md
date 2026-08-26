---
inclusion: manual
description: Scaffold a complete full-stack feature (model + API + frontend components)
---

# Skill: Create Full Feature

## Inputs

- **featureName** (required): Name of the feature/resource in singular PascalCase (e.g., `Project`, `Task`)
- **fields** (required): List of fields with name, type, required flag, and any constraints
- **operations** (required): CRUD operations to support (create, read, update, delete, list)

## Overview

This skill orchestrates the creation of a complete feature across the full stack:

1. Database model (Mongoose)
2. Backend API (Express routes, controller, service, validators)
3. Frontend components (pages, forms, services)
4. Integration (routing, navigation)

## Steps

### Phase 1: Backend — Model

1. Create TypeScript interfaces in `server/src/types/{feature}.types.ts`
   - `I{Feature}` interface for the document
   - `Create{Feature}Dto` for creation input
   - `Update{Feature}Dto` for update input

2. Create Mongoose model in `server/src/models/{feature}.model.ts`
   - Schema with all fields, types, validation
   - Indexes for common queries
   - Enable timestamps

### Phase 2: Backend — API

3. Create validators in `server/src/validators/{feature}.validator.ts`
   - Validation chains for create and update operations
   - Check required fields, types, enum values

4. Create service in `server/src/services/{feature}.service.ts`
   - Business logic for each CRUD operation
   - Error handling (throw AppError for not-found, validation)
   - Query building for list endpoint (filters, sort, pagination)

5. Create controller in `server/src/controllers/{feature}.controller.ts`
   - Thin request/response handlers
   - Extract params, body, query from request
   - Call service methods
   - Send consistent response format

6. Create routes in `server/src/routes/{feature}.routes.ts`
   - Map HTTP methods + paths to controller methods
   - Apply validation middleware

7. Register routes in `server/src/routes/index.ts`

### Phase 3: Frontend — API Service

8. Create API service in `client/src/services/{feature}.service.ts`
   - Functions for each API call (getAll, getById, create, update, delete)
   - Typed request/response using interfaces from `client/src/types/`

9. Create frontend types in `client/src/types/{feature}.ts`
   - Mirror backend types for the frontend
   - Include types for form data

### Phase 4: Frontend — Components

10. Create list page in `client/src/pages/{Feature}s/{Feature}List.tsx`
    - Fetch and display all items
    - Loading state (Skeleton/CircularProgress)
    - Empty state with CTA
    - Search/filter UI (if applicable)

11. Create detail view in `client/src/pages/{Feature}s/{Feature}Details.tsx`
    - Display all fields
    - Edit and Delete actions
    - Back navigation

12. Create form component in `client/src/pages/{Feature}s/{Feature}Form.tsx`
    - MUI form fields for all editable fields
    - Client-side validation
    - Submit handler (create or edit mode)
    - Loading state on submit button

### Phase 5: Integration

13. Add routes in `client/src/App.tsx`
    - `/{features}` — list page
    - `/{features}/:id` — detail page
    - `/{features}/new` — create form
    - `/{features}/:id/edit` — edit form

14. Add navigation entry in sidebar component

15. Add success/error notifications (Snackbar)

## File Checklist

After completion, these files should exist:

**Backend:**

- [ ] `server/src/types/{feature}.types.ts`
- [ ] `server/src/models/{feature}.model.ts`
- [ ] `server/src/validators/{feature}.validator.ts`
- [ ] `server/src/services/{feature}.service.ts`
- [ ] `server/src/controllers/{feature}.controller.ts`
- [ ] `server/src/routes/{feature}.routes.ts`

**Frontend:**

- [ ] `client/src/types/{feature}.ts`
- [ ] `client/src/services/{feature}.service.ts`
- [ ] `client/src/pages/{Feature}s/{Feature}List.tsx`
- [ ] `client/src/pages/{Feature}s/{Feature}Details.tsx`
- [ ] `client/src/pages/{Feature}s/{Feature}Form.tsx`
- [ ] `client/src/pages/{Feature}s/index.ts`

## Conventions

- Follow all project steering files for naming, structure, and patterns
- Backend validates independently of frontend
- Frontend shows loading, empty, and error states
- All operations persist to MongoDB via the backend API
- Consistent response format across all endpoints
- MUI components for all UI elements
