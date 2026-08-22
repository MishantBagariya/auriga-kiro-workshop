---
inclusion: manual
---

# Skill: Add or Modify a Prisma Model

## When to Use

Use this skill when adding a new database model, modifying an existing model, or creating a new migration for the TaskFlow database.

## Instructions

### 1. Edit the Schema

Update `server/prisma/schema.prisma`:

```prisma
model ModelName {
  id          String   @id @default(cuid())
  name        String
  description String?
  status      Status   @default(ACTIVE)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  tasks Task[]

  @@map("model_names")  // Optional: customize table name
}

enum Status {
  ACTIVE
  COMPLETED
  ARCHIVED
}
```

### 2. Key Prisma Conventions

- **ID fields**: Use `cuid()` for string IDs (preferred for this project)
- **Timestamps**: Always include `createdAt` and `updatedAt`
- **Optional fields**: Mark with `?` (e.g., `description String?`)
- **Enums**: Define as Prisma enum types
- **Relations**: Define on both sides of the relationship
- **Cascade delete**: Use `onDelete: Cascade` where appropriate

### 3. Define Relations

```prisma
model Project {
  id    String @id @default(cuid())
  name  String
  tasks Task[]  // One-to-many
}

model Task {
  id        String  @id @default(cuid())
  title     String
  project   Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  projectId String
}
```

### 4. Run Migration

After modifying the schema:

```bash
cd server
npx prisma migrate dev --name describe-the-change
```

This will:
1. Generate SQL migration
2. Apply it to the database
3. Regenerate the Prisma Client

### 5. Update Prisma Client

If you only need to regenerate the client without migrating:

```bash
npx prisma generate
```

### 6. Seed Data (Optional)

Update `server/prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  await prisma.project.create({
    data: {
      name: 'Sample Project',
      status: 'ACTIVE',
      tasks: {
        create: [
          { title: 'First task', status: 'TODO', priority: 'MEDIUM' },
        ],
      },
    },
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

Run seed:
```bash
npx prisma db seed
```

### 7. Verify with Prisma Studio

```bash
npx prisma studio
```

Opens a web UI at `http://localhost:5555` to inspect your data.

### 8. Update Shared Zod Schema

After modifying the Prisma model, update the corresponding Zod schema in `shared/src/schemas/` to keep validation in sync.

### 9. Checklist

- [ ] Schema updated in `server/prisma/schema.prisma`
- [ ] Migration created and applied (`prisma migrate dev`)
- [ ] Prisma Client regenerated
- [ ] Relations defined correctly (both sides)
- [ ] Cascade deletes configured where needed
- [ ] Corresponding Zod schema updated in `shared/`
- [ ] Seed script updated if needed
- [ ] Verified data in Prisma Studio
