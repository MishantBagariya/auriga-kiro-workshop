---
inclusion: manual
description: Scaffold a new Express REST API endpoint with controller, service, and validation
---

# Skill: Create API Endpoint

## Inputs

- **resourceName** (required): Name of the resource in singular form (e.g., `project`, `task`)
- **operations** (required): List of CRUD operations needed — any combination of: `create`, `getAll`, `getById`, `update`, `delete`

## Steps

### 1. Create Route File

Create `server/src/routes/{resourceName}.routes.ts`:

```typescript
import { Router } from 'express';
import { {resourceName}Controller } from '../controllers/{resourceName}.controller';
import { {resourceName}Validators } from '../validators/{resourceName}.validator';
import { validate } from '../middleware/validate';

const router = Router();

// GET /api/v1/{resourceName}s
router.get('/', {resourceName}Controller.getAll);

// POST /api/v1/{resourceName}s
router.post('/', {resourceName}Validators.create, validate, {resourceName}Controller.create);

// GET /api/v1/{resourceName}s/:id
router.get('/:id', {resourceName}Controller.getById);

// PUT /api/v1/{resourceName}s/:id
router.put('/:id', {resourceName}Validators.update, validate, {resourceName}Controller.update);

// DELETE /api/v1/{resourceName}s/:id
router.delete('/:id', {resourceName}Controller.delete);

export { router as {resourceName}Routes };
```

### 2. Create Controller

Create `server/src/controllers/{resourceName}.controller.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';
import { {ResourceName}Service } from '../services/{resourceName}.service';

export const {resourceName}Controller = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await {ResourceName}Service.getAll(req.query);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await {ResourceName}Service.getById(req.params.id);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await {ResourceName}Service.create(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await {ResourceName}Service.update(req.params.id, req.body);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await {ResourceName}Service.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
```

### 3. Create Service

Create `server/src/services/{resourceName}.service.ts`:

```typescript
import { {ResourceName} } from '../models/{resourceName}.model';
import { AppError } from '../utils/app-error';
import { Create{ResourceName}Dto, Update{ResourceName}Dto } from '../types/{resourceName}.types';

export const {ResourceName}Service = {
  async getAll(query: Record<string, unknown>) {
    // Implement filtering, sorting, pagination
    return {ResourceName}.find();
  },

  async getById(id: string) {
    const item = await {ResourceName}.findById(id);
    if (!item) throw new AppError('{ResourceName} not found', 404);
    return item;
  },

  async create(data: Create{ResourceName}Dto) {
    return {ResourceName}.create(data);
  },

  async update(id: string, data: Update{ResourceName}Dto) {
    const item = await {ResourceName}.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!item) throw new AppError('{ResourceName} not found', 404);
    return item;
  },

  async delete(id: string) {
    const item = await {ResourceName}.findByIdAndDelete(id);
    if (!item) throw new AppError('{ResourceName} not found', 404);
  },
};
```

### 4. Create Validators

Create `server/src/validators/{resourceName}.validator.ts`:

```typescript
import { body, param } from 'express-validator';

export const {resourceName}Validators = {
  create: [
    // Add field validations
    body('name').notEmpty().withMessage('Name is required').trim(),
  ],
  update: [
    param('id').isMongoId().withMessage('Invalid ID format'),
    // Add field validations
  ],
};
```

### 5. Create Types

Create `server/src/types/{resourceName}.types.ts`:

```typescript
export interface Create{ResourceName}Dto {
  // Define create fields
}

export interface Update{ResourceName}Dto {
  // Define update fields (all optional)
}
```

### 6. Register Route

Add the route to `server/src/routes/index.ts`:

```typescript
import { {resourceName}Routes } from './{resourceName}.routes';

router.use('/{resourceName}s', {resourceName}Routes);
```

## Conventions

- Controller methods are thin — delegate to service layer
- Service contains business logic and model interaction
- Validators use express-validator chains
- All async errors forwarded via next(error) to centralized handler
- Consistent response envelope: `{ success, data, error }`
