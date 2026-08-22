---
inclusion: manual
---

# Skill: Implement Form Validation

## When to Use

Use this skill when building a form that needs client-side and server-side validation — for creating or editing projects and tasks.

## Instructions

### 1. Define the Shared Zod Schema

Create the validation schema in `shared/src/schemas/`:

```typescript
// shared/src/schemas/project.schema.ts
import { z } from 'zod'

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100, 'Name too long'),
  description: z.string().max(500).optional(),
  status: z.enum(['ACTIVE', 'COMPLETED', 'ARCHIVED']).default('ACTIVE'),
})

export const updateProjectSchema = createProjectSchema.partial()

export type CreateProjectInput = z.infer<typeof createProjectSchema>
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>
```

### 2. Client-Side: React Hook Form + Zod

```tsx
// client/src/components/projects/project-form.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createProjectSchema, CreateProjectInput } from 'shared/schemas/project.schema'

export function ProjectForm({ onSubmit }: { onSubmit: (data: CreateProjectInput) => void }) {
  const form = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: '',
      description: '',
      status: 'ACTIVE',
    },
  })

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="name">Project Name *</label>
        <input id="name" {...form.register('name')} />
        {form.formState.errors.name && (
          <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="description">Description</label>
        <textarea id="description" {...form.register('description')} />
      </div>

      <button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? 'Saving...' : 'Save'}
      </button>
    </form>
  )
}
```

### 3. Server-Side: Validation Middleware

```typescript
// server/src/middleware/validate.ts
import { Request, Response, NextFunction } from 'express'
import { ZodSchema } from 'zod'

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }))

      return res.status(400).json({
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: errors,
        },
      })
    }

    req.body = result.data  // Use parsed/transformed data
    next()
  }
}
```

### 4. Server-Side: Apply in Route

```typescript
// server/src/routes/project.routes.ts
import { validate } from '../middleware/validate'
import { createProjectSchema } from 'shared/schemas/project.schema'

router.post('/', validate(createProjectSchema), projectController.create)
```

### 5. Client-Side: Handle Server Validation Errors

```tsx
const mutation = useMutation({
  mutationFn: (data: CreateProjectInput) => api.post('/projects', data),
  onError: (error: ApiError) => {
    if (error.code === 'VALIDATION_ERROR' && error.details) {
      // Set server-side errors on the form
      error.details.forEach(({ field, message }) => {
        form.setError(field as keyof CreateProjectInput, { message })
      })
    } else {
      toast.error(error.message)
    }
  },
  onSuccess: () => {
    toast.success('Project created!')
    queryClient.invalidateQueries({ queryKey: ['projects'] })
  },
})
```

### 6. Validation Rules for TaskFlow

#### Project
- `name`: Required, 1-100 characters
- `description`: Optional, max 500 characters
- `status`: Must be one of ACTIVE, COMPLETED, ARCHIVED

#### Task
- `title`: Required, 1-200 characters
- `description`: Optional, max 2000 characters
- `projectId`: Required, must reference existing project
- `status`: Must be one of TODO, IN_PROGRESS, COMPLETED
- `priority`: Must be one of LOW, MEDIUM, HIGH
- `dueDate`: Optional, must be valid ISO date string
- `labels`: Optional, array of strings

### 7. Checklist

- [ ] Zod schema defined in `shared/` package
- [ ] TypeScript types inferred from schema (`z.infer<>`)
- [ ] React Hook Form uses `zodResolver` with the shared schema
- [ ] Form shows inline error messages per field
- [ ] Submit button disabled during submission
- [ ] Server-side validate middleware applied to route
- [ ] Server returns structured validation errors
- [ ] Client handles and displays server validation errors
- [ ] Same schema used on both client and server
