---
inclusion: always
---

# Tech Stack Reference

## Frontend (client/)

### Core
- **React 18** — UI library with functional components and hooks
- **TypeScript** — Strict mode enabled, no `any` types
- **Vite** — Build tool and dev server

### Styling & Components
- **Tailwind CSS** — Utility-first CSS framework
- **shadcn/ui** — Copy-pasted component primitives (not installed as a dependency)
- **Lucide React** — Icon library
- **class-variance-authority (cva)** — Component variant management
- **clsx + tailwind-merge** — Conditional class composition

### State & Data
- **TanStack Query (React Query v5)** — Server state management, caching, refetching
- **React Hook Form** — Form state management with controlled/uncontrolled inputs
- **Zod** — Schema validation (resolvers for React Hook Form)

### Routing
- **React Router v6** — Client-side routing with nested routes

### Feedback
- **Sonner** — Toast notifications for success/error feedback

## Backend (server/)

### Core
- **Node.js 20+** — Runtime
- **Express 4** — HTTP framework
- **TypeScript** — Strict mode, compiled with tsx for dev

### Database & ORM
- **Prisma** — Type-safe ORM with migration support
- **PostgreSQL 15+** — Relational database

### Middleware & Utilities
- **cors** — Cross-origin resource sharing
- **helmet** — Security headers
- **Zod** — Request body/query validation
- **dotenv** — Environment variable loading

### Dev Tools
- **tsx** — TypeScript execution for development (watch mode)
- **nodemon** — Alternative dev server with file watching

## Shared (shared/)

- **Zod schemas** — Validation schemas used by both client and server
- **TypeScript interfaces** — Shared type definitions
- No runtime dependencies beyond Zod

## Database

- **PostgreSQL 15+** — Primary data store
- **Prisma Migrate** — Schema migrations
- **Prisma Studio** — Database GUI for development

## Testing

- **Vitest** — Unit and integration testing
- **supertest** — HTTP assertion library for API tests
- **Playwright** — End-to-end browser testing
- **@testing-library/react** — Component testing utilities

## Package Management

- **npm** — Package manager
- **npm workspaces** — Monorepo workspace management (client, server, shared)

## Development Ports

- Frontend dev server: `http://localhost:5173`
- Backend API server: `http://localhost:3001`
- PostgreSQL: `localhost:5432`

## Environment Variables

### server/.env
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/taskflow
PORT=3001
NODE_ENV=development
```

### client/.env
```
VITE_API_URL=http://localhost:3001/api
```
