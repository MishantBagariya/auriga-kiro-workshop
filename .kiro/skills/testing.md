---
inclusion: manual
---

# Skill: Write Tests

## When to Use

Use this skill when writing unit tests, integration tests, or end-to-end tests for the TaskFlow application.

## Instructions

### 1. Choose the Right Test Type

| What to Test | Tool | Location |
|-------------|------|----------|
| Utility functions, helpers | Vitest | `*.test.ts` next to file |
| React components | Vitest + Testing Library | `*.test.tsx` next to file |
| API endpoints | Vitest + supertest | `server/src/__tests__/` |
| Full user flows | Playwright | `e2e/` at project root |

### 2. API Integration Tests (Backend)

```typescript
// server/src/__tests__/projects.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import { app } from '../app'
import { prisma } from '../lib/prisma'

describe('Projects API', () => {
  beforeAll(async () => {
    // Clean database before tests
    await prisma.task.deleteMany()
    await prisma.project.deleteMany()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  describe('POST /api/projects', () => {
    it('creates a project with valid data', async () => {
      const res = await request(app)
        .post('/api/projects')
        .send({ name: 'Test Project', description: 'A test' })
        .expect(201)

      expect(res.body.data).toMatchObject({
        name: 'Test Project',
        description: 'A test',
        status: 'ACTIVE',
      })
      expect(res.body.data.id).toBeDefined()
    })

    it('returns 400 for missing name', async () => {
      const res = await request(app)
        .post('/api/projects')
        .send({ description: 'No name' })
        .expect(400)

      expect(res.body.error.code).toBe('VALIDATION_ERROR')
    })
  })

  describe('GET /api/projects', () => {
    it('returns all projects', async () => {
      const res = await request(app)
        .get('/api/projects')
        .expect(200)

      expect(Array.isArray(res.body.data)).toBe(true)
    })
  })
})
```

### 3. React Component Tests (Frontend)

```typescript
// client/src/components/projects/__tests__/project-list.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ProjectList } from '../project-list'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('ProjectList', () => {
  it('shows loading state initially', () => {
    render(<ProjectList />, { wrapper: createWrapper() })
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })
})
```

### 4. End-to-End Tests (Playwright)

```typescript
// e2e/projects.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Project Management', () => {
  test('can create a new project', async ({ page }) => {
    await page.goto('/')
    await page.click('text=Projects')
    await page.click('text=Create Project')

    await page.fill('[name="name"]', 'E2E Test Project')
    await page.fill('[name="description"]', 'Created by E2E test')
    await page.click('button[type="submit"]')

    // Verify project appears in list
    await expect(page.locator('text=E2E Test Project')).toBeVisible()
  })

  test('validates required fields', async ({ page }) => {
    await page.goto('/')
    await page.click('text=Projects')
    await page.click('text=Create Project')
    await page.click('button[type="submit"]')

    await expect(page.locator('text=Project name is required')).toBeVisible()
  })
})
```

### 5. Test Configuration

#### Vitest (server)
```typescript
// server/vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
  },
})
```

#### Vitest (client)
```typescript
// client/vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
})
```

#### Playwright
```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  webServer: [
    { command: 'npm run dev -w server', port: 3001, reuseExistingServer: true },
    { command: 'npm run dev -w client', port: 5173, reuseExistingServer: true },
  ],
  use: { baseURL: 'http://localhost:5173' },
})
```

### 6. Running Tests

```bash
# Unit + integration tests
npm run test -w server      # Backend tests
npm run test -w client      # Frontend tests

# E2E tests
npx playwright test         # All E2E tests
npx playwright test --ui    # Interactive mode
```

### 7. Checklist

- [ ] Test file created in correct location
- [ ] Proper setup/teardown (database cleanup for API tests)
- [ ] Happy path tested
- [ ] Error/edge cases tested
- [ ] Assertions are specific (not just "no error")
- [ ] Tests are independent (don't depend on execution order)
- [ ] Async operations properly awaited
- [ ] Test data cleaned up after tests
