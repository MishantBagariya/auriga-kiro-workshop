---
inclusion: auto
description: Overall system architecture and monorepo conventions for TaskFlow
---

# TaskFlow — System Architecture

## Overview

TaskFlow is a full-stack task management application for a single user. No authentication or user management is required.

**PRD Reference:** #[[file:Product Requirements Document (PRD) (1).md]]

## Tech Stack

| Layer           | Technology                                       |
| --------------- | ------------------------------------------------ |
| Frontend        | Vite + React 18 + TypeScript + Material UI (MUI) |
| Backend         | Express + TypeScript + Mongoose                  |
| Database        | MongoDB                                          |
| Linting         | ESLint + Prettier                                |
| Package Manager | npm                                              |

## Monorepo Structure

```
auriga-kiro-workshop/
├── client/                 # Frontend application
│   ├── public/
│   ├── src/
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── .eslintrc.cjs
├── server/                 # Backend application
│   ├── src/
│   ├── package.json
│   ├── tsconfig.json
│   └── .eslintrc.cjs
├── package.json            # Root package.json (workspace scripts)
├── .prettierrc
├── .eslintignore
└── .gitignore
```

## Communication Pattern

- Frontend communicates with backend via REST API over HTTP
- Backend communicates with MongoDB via Mongoose ODM
- No WebSocket or real-time features required in v1

## Port Conventions

| Service                    | Port  |
| -------------------------- | ----- |
| Frontend (Vite dev server) | 5173  |
| Backend (Express)          | 3001  |
| MongoDB                    | 27017 |

## Environment Setup

- Each package (`client/`, `server/`) has its own `package.json` and manages its own dependencies
- Root `package.json` contains convenience scripts to run both services:
  - `npm run dev` — starts both client and server concurrently
  - `npm run dev:client` — starts only the frontend
  - `npm run dev:server` — starts only the backend
  - `npm run build` — builds both packages
  - `npm run lint` — lints both packages
  - `npm run format` — formats all files with Prettier

## Key Architectural Decisions

1. **No authentication** — single-user app, all data is accessible
2. **REST API** — standard RESTful endpoints, no GraphQL
3. **Server-side validation** — backend independently validates all requests
4. **MongoDB references** — Tasks reference Projects via ObjectId (not embedded documents)
5. **Cascade delete** — deleting a Project deletes all its Tasks
6. **Centralized error handling** — single error middleware in Express
7. **Typed API responses** — consistent response envelope pattern
