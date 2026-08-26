---
inclusion: auto
description: Express + TypeScript + Mongoose backend conventions for TaskFlow
---

# Backend Conventions

## Technology

- **Framework:** Express.js
- **Language:** TypeScript (strict mode)
- **ODM:** Mongoose
- **Database:** MongoDB
- **Validation:** express-validator
- **Environment:** dotenv

## Folder Structure

```
server/src/
├── config/
│   ├── database.ts         # MongoDB connection setup
│   └── environment.ts      # Environment variable validation
├── controllers/
│   ├── project.controller.ts
│   ├── task.controller.ts
│   └── dashboard.controller.ts
├── middleware/
│   ├── error-handler.ts    # Centralized error handling middleware
│   ├── validate.ts         # Validation middleware wrapper
│   └── not-found.ts        # 404 handler
├── models/
│   ├── project.model.ts
│   └── task.model.ts
├── routes/
│   ├── index.ts            # Route aggregator
│   ├── project.routes.ts
│   ├── task.routes.ts
│   └── dashboard.routes.ts
├── services/
│   ├── project.service.ts
│   ├── task.service.ts
│   └── dashboard.service.ts
├── types/
│   ├── project.types.ts
│   ├── task.types.ts
│   └── common.types.ts
├── utils/
│   ├── app-error.ts        # Custom error class
│   └── response.ts         # Response helper functions
├── validators/
│   ├── project.validator.ts
│   └── task.validator.ts
├── app.ts                  # Express app configuration
└── server.ts               # Server entry point (listen)
```

## Layered Architecture

```
Request → Route → Controller → Service → Model → Database
                                                ↓
Response ← Controller ← Service ← Model ← Database
```

### Routes

- Define HTTP method + path + middleware chain + controller method
- Group by resource
- Apply validation middleware before controller

### Controllers

- Thin layer — handle req/res only
- Extract data from request (params, body, query)
- Call the appropriate service method
- Send the response using helper functions
- Never contain business logic or direct database calls

### Services

- Contain all business logic
- Interact with Mongoose models
- Throw `AppError` for known error conditions (not found, validation, etc.)
- Return plain data objects (not Mongoose documents when possible)

### Models

- Define Mongoose schemas
- Include schema-level validation
- Export typed model instances

## Error Handling

Use a custom `AppError` class:

```typescript
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public details?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }
}
```

Centralized error middleware catches all errors and returns consistent responses:

```typescript
// All errors go through this middleware
app.use(errorHandler);
```

## Response Format

All API responses use a consistent envelope:

```typescript
// Success response
{
  "success": true,
  "data": { ... }
}

// Success with pagination
{
  "success": true,
  "data": [...],
  "meta": { "total": 50, "page": 1, "limit": 20, "totalPages": 3 }
}

// Error response
{
  "success": false,
  "error": {
    "message": "Project not found",
    "details": []
  }
}
```

## Request Validation

- Use `express-validator` to validate incoming requests
- Define validators in `/validators/` as arrays of validation chains
- Apply the `validate` middleware after validators to check for errors
- Return 422 with detailed validation error messages

```typescript
// Route with validation
router.post("/", createProjectValidators, validate, projectController.create);
```

## Middleware Stack

Applied in this order in `app.ts`:

1. `cors()` — allow frontend origin
2. `express.json()` — parse JSON bodies
3. `morgan` — request logging (dev mode)
4. Routes
5. `notFound` — 404 handler for unmatched routes
6. `errorHandler` — centralized error handler

## Environment Variables

Required variables (validated at startup):

- `PORT` — server port (default: 3001)
- `MONGODB_URI` — MongoDB connection string (default: mongodb://localhost:27017/taskflow)
- `NODE_ENV` — environment (development/production)
- `CORS_ORIGIN` — allowed CORS origin (default: http://localhost:5173)

## TypeScript Conventions

- Define interfaces for request bodies: `CreateProjectBody`, `UpdateTaskBody`
- Define interfaces for query params: `TaskQueryParams`
- Use generics for the response wrapper type
- Extend Express Request type where needed via declaration merging
- No `any` — use `unknown` and narrow with type guards

## CORS Configuration

```typescript
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type"],
  }),
);
```
