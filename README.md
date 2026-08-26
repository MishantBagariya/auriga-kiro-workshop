# TaskFlow

A full-stack task management application. Create projects, create tasks inside them, track each task through To Do → In Progress → Completed, and search, filter, sort, and view tasks as either a list or a Kanban board. A dashboard summarizes progress. All data persists in MongoDB.

Single user, no authentication. See `docs/product-requirements.md` for the full requirements and acceptance criteria.

**Stack:** React + TypeScript + Vite + Tailwind CSS on the frontend, Node.js + Express + Mongoose + TypeScript on the backend, MongoDB for storage. One repo, two npm workspaces: `frontend/` and `backend/`.

Nothing is scaffolded yet. The steering documents below define the conventions the implementation must follow.

## Steering documents

These live in `.kiro/steering/` and all use `inclusion: manual`, which means **none of them load automatically**. Reference the ones you need by name in your prompt, for example:

```
#product #api-standards  Add a labels filter to the task list
```

| File | Reference it as | What it covers | Reach for it when |
|---|---|---|---|
| `product.md` | `#product` | What TaskFlow is, the single-user constraint, in-scope and out-of-scope lists, domain vocabulary with the canonical enum values and their display labels, UX principles, the seven required flows | Deciding whether something is in scope, naming a domain concept, or working on any user-facing behaviour, empty state, or validation message |
| `tech-stack.md` | `#tech-stack` | The locked library choices and why, npm workspace commands, environment variable names, Tailwind 4 and Express 5 setup gotchas, the "do not use" list | Adding a dependency, setting up either workspace, wiring configuration, or picking how to solve something |
| `architecture.md` | `#architecture` | The three layers, the request lifecycle end to end, boundary rules for each layer, state ownership, the query key hierarchy and per-mutation cache invalidation, error propagation | Adding a feature that spans frontend and backend, deciding where logic belongs, or working out what needs to refresh after a change |
| `structure.md` | `#structure` | The full folder tree for root, `backend/`, and `frontend/`, naming conventions, feature folder anatomy, and a "where do I put a new thing" table | Creating any new file, or trying to find where something should live |
| `api-standards.md` | `#api-standards` | Every endpoint, the success and error envelopes, status and error codes, the Zod validation contract, task query params and sorting rules, cascade delete behaviour, CORS, worked `curl` examples | Building or calling an endpoint, handling an error, or writing an API test |

Rough guide to which combinations are useful:

- Backend endpoint work: `#api-standards` `#architecture` `#structure`
- Frontend feature work: `#architecture` `#structure` `#product`
- Project setup or dependency decisions: `#tech-stack` `#structure`
- Scope or product behaviour questions: `#product`

Because these files load only on request, a conversation that does not reference them will not know the stack, the folder layout, or the API contract. If Kiro starts inventing conventions, that is the signal you forgot the reference.

## Repository layout

```
.kiro/steering/     the five documents above
docs/               product requirements
backend/            Express API (not yet scaffolded)
frontend/           React SPA (not yet scaffolded)
```

## Getting started

Once the workspaces exist:

```bash
npm install          # installs both workspaces from the root
npm run dev          # runs backend and frontend together
npm test             # runs both test suites once
npm run lint         # lints both workspaces
```

MongoDB must be reachable at the `MONGODB_URI` in `backend/.env`. Copy each `.env.example` to `.env` and fill it in; `.env` files are never committed.
