---
inclusion: manual
description: Scaffold a new Mongoose model with TypeScript interface and schema
---

# Skill: Create Mongoose Model

## Inputs

- **modelName** (required): Name of the model in PascalCase singular (e.g., `Project`, `Task`)
- **fields** (required): List of fields with name, type, required flag, and optional default value
- **indexes** (optional): Fields to index
- **relationships** (optional): References to other models (e.g., `projectId → Project`)

## Steps

### 1. Create TypeScript Interface

Create `server/src/types/{modelName-lowercase}.types.ts`:

```typescript
import { Types } from 'mongoose';

export interface I{ModelName} {
  // Define fields based on input
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Create{ModelName}Dto {
  // Fields accepted for creation (without auto-generated fields)
}

export interface Update{ModelName}Dto {
  // Partial of Create DTO (all optional)
}
```

### 2. Create Model File

Create `server/src/models/{modelName-lowercase}.model.ts`:

```typescript
import { Schema, model } from 'mongoose';
import { I{ModelName} } from '../types/{modelName-lowercase}.types';

const {modelName}Schema = new Schema<I{ModelName}>(
  {
    // Define fields from input
    name: {
      type: String,
      required: [true, '{ModelName} name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
{modelName}Schema.index({ /* indexed fields */ });

export const {ModelName} = model<I{ModelName}>('{ModelName}', {modelName}Schema);
```

### 3. Add Schema Validation

For each field:

- `required` fields: add validation message `[true, 'Field is required']`
- `enum` fields: define allowed values with message
- `maxlength`: set appropriate limits
- `ref`: add for ObjectId references

### 4. Add Indexes

Based on common query patterns:

- Single-field indexes for frequently filtered fields
- Compound indexes for common filter combinations
- Text indexes for searchable string fields

### 5. Add Middleware (if needed)

For cascade operations or computed fields:

```typescript
// Pre-remove: clean up related documents
{
  modelName;
}
Schema.pre("findOneAndDelete", async function () {
  // Handle cascade deletes
});
```

### 6. Export

Ensure the model is exported and available for import:

```typescript
export const {ModelName} = model<I{ModelName}>('{ModelName}', {modelName}Schema);
```

## Field Type Mapping

| Input Type       | Mongoose Type                    |
| ---------------- | -------------------------------- |
| string           | String                           |
| number           | Number                           |
| boolean          | Boolean                          |
| date             | Date                             |
| objectId         | Schema.Types.ObjectId (with ref) |
| array of strings | [String]                         |
| enum             | String with enum option          |

## Conventions

- Always enable `timestamps: true`
- Use validation messages for all required fields
- Trim all string fields
- Set sensible maxlength on string fields
- Export the model as a named export
- Interface name uses `I` prefix: `IProject`, `ITask`
- DTO interfaces use `Create` and `Update` prefixes
