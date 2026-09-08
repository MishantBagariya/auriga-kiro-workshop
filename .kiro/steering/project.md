# TaskFlow — Project Steering File

## Product Requirements
#[[file:Requirements/Product Requirements Document (PRD) (1).md]]

## Project
- Name: TaskFlow
- Type: Full-stack Task Management Application
- Single-user, no authentication required

## Tech Stack

### Frontend
- React (with Vite)
- TypeScript
- Tailwind CSS
- React Router (navigation)
- Axios (API calls)

### Backend
- Node.js
- Express
- TypeScript
- Zod (request validation)

### Database
- SQLite (file-based, no server required)
- Prisma (ORM)

## Key Rules
- Stick strictly to the PRD — do not add features not listed
- No browser local storage as the source of truth for projects or tasks
- All project and task operations must go through the backend API and persist in the database
- Backend must independently validate all incoming requests
- Deleting a project must cascade and delete all associated tasks
- No authentication or user management needed

## Project Structure (planned)
- `/frontend` — React + Vite app
- `/backend` — Node.js + Express API
