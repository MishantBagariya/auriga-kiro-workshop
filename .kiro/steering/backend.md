---
inclusion: always
---

# Backend Rules — Node.js + Express + TypeScript

## Folder Structure
```
backend/
  src/
    routes/       # Express route definitions
    controllers/  # Business logic functions
    middleware/   # Error handler, validation middleware
    lib/          # Prisma client instance
  prisma/
    schema.prisma # Database schema
    dev.db        # SQLite database file (auto-generated)
```

## Patterns

### Route → Controller
- Routes only define the path and HTTP method
- All logic lives in the controller

### Validation
- Use Zod to validate all incoming request bodies
- Validate before calling the database
- Return 400 with a clear message if validation fails

### Error Handling
- Wrap all controller logic in try/catch
- Pass errors to a central error handler middleware
- Never expose stack traces to the client

### Response Format
Always return consistent JSON:
```json
// Success
{ "data": { ... } }

// Error
{ "error": "Clear message here" }
```

### Status Codes
- 200 — success
- 201 — created
- 400 — validation error
- 404 — not found
- 500 — server error
