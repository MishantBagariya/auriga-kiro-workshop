---
inclusion: manual
---

# Skill: Create an Express API Endpoint

## When to Use

Use this skill when adding a new REST API endpoint to the TaskFlow backend — for any CRUD operation or data retrieval.

## Instructions

### 1. Define the Route

Create or update the route file in `server/src/routes/`:

```typescript
// server/src/routes/resource.routes.ts
import { Router } from 'express'
import { resourceController } from '../controllers/resource.controller'
import { validate } from '../middleware/validate'
import { createResourceSchema, updateResourceSchema } from '../validators/resource.validator'

const router = Router()

router.get('/', resourceController.getAll)
router.get('/:id', resourceController.getById)
router.post('/', validate(createResourceSchema), resourceController.create)
router.put('/:id', validate(updateResourceSchema), resourceController.update)
router.delete('/:id', resourceController.delete)

export { router as resourceRoutes }
```

### 2. Create the Controller

Controllers handle HTTP concerns only — parsing request, calling service, sending response:

```typescript
// server/src/controllers/resource.controller.ts
import { Request, Response, NextFunction } from 'express'
import { resourceService } from '../services/resource.service'

export const resourceController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const items = await resourceService.findAll(req.query)
      res.json({ data: items })
    } catch (error) {
      next(error)
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await resourceService.findById(req.params.id)
      if (!item) {
        return res.status(404).json({ error: { message: 'Not found', code: 'NOT_FOUND' } })
      }
      res.json({ data: item })
    } catch (error) {
      next(error)
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await resourceService.create(req.body)
      res.status(201).json({ data: item })
    } catch (error) {
      next(error)
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await resourceService.update(req.params.id, req.body)
      res.json({ data: item })
    } catch (error) {
      next(error)
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await resourceService.delete(req.params.id)
      res.status(204).send()
    } catch (error) {
      next(error)
    }
  },
}
```

### 3. Create the Service

Services contain business logic and Prisma database operations:

```typescript
// server/src/services/resource.service.ts
import { prisma } from '../lib/prisma'

export const resourceService = {
  async findAll(query?: Record<string, unknown>) {
    return prisma.resource.findMany({
      // Apply filters from query params
      orderBy: { createdAt: 'desc' },
    })
  },

  async findById(id: string) {
    return prisma.resource.findUnique({ where: { id } })
  },

  async create(data: CreateResourceInput) {
    return prisma.resource.create({ data })
  },

  async update(id: string, data: UpdateResourceInput) {
    return prisma.resource.update({ where: { id }, data })
  },

  async delete(id: string) {
    return prisma.resource.delete({ where: { id } })
  },
}
```

### 4. Create the Validator

Use Zod schemas for request validation:

```typescript
// server/src/validators/resource.validator.ts
import { z } from 'zod'

export const createResourceSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
  }),
})

export const updateResourceSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
  }),
})
```

### 5. Register the Route

Add to the main app file:

```typescript
// server/src/app.ts
import { resourceRoutes } from './routes/resource.routes'
app.use('/api/resources', resourceRoutes)
```

### 6. API Response Format

Always follow this consistent format:

```typescript
// Success
{ data: T }              // 200, 201

// No content
(empty body)             // 204 (delete)

// Error
{ error: { message: string, code: string } }  // 400, 404, 500
```

### 7. Checklist

- [ ] Route file created/updated
- [ ] Controller handles HTTP parsing and response
- [ ] Service contains business logic and database calls
- [ ] Zod validation schema defined
- [ ] Route registered in app.ts
- [ ] Error cases handled (not found, validation, server error)
- [ ] Consistent response format used
- [ ] Query params supported where needed (filters, search, sort)
