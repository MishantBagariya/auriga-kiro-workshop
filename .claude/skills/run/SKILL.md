---
name: run
description: Launch and drive the TaskFlow app (Express API + Vite/React client) to see a change working. Use when asked to run, start, or screenshot TaskFlow, or to confirm a change works in the real app rather than just in tests/typecheck.
---

# Running TaskFlow

Two independent npm packages (`server/`, `client/`), no workspaces. A root `package.json` runs both together via `concurrently`.

## Dev command + ports + stop

```bash
# from the repo root — starts server (4100) and client (5173, or next free port) together
npm run dev
```

- Backend: `http://localhost:4100` (Express + Prisma/SQLite)
- Frontend: `http://localhost:5173` — Vite proxies `/api/*` to `localhost:4100` (see `client/vite.config.ts`), so hit the frontend origin for `/api/...` calls in a browser context and you won't need CORS.
- **Port 4100, not 4000** — 4000 is occupied by an unrelated project on this machine (`ipru-translator`). If you ever see `EADDRINUSE` on 4000, that's not TaskFlow; don't kill it. Check what's actually listening before killing anything: `lsof -nP -iTCP:<port> -sTCP:LISTEN`.
- If a prior run of *this* app is still bound to the ports, free them before relaunching (background npm doesn't forward signals to the child it spawns, so you have to kill by port, not by the shell PID):
  ```bash
  lsof -ti:4100 -sTCP:LISTEN | xargs -r kill
  lsof -ti:5173 -sTCP:LISTEN | xargs -r kill
  ```

Running only one side (e.g. while iterating on the backend alone):
```bash
cd server && npm run dev   # tsx watch src/index.ts, port 4100
cd client && npm run dev   # vite, port 5173+
```

First time on a fresh checkout, the database won't exist yet:
```bash
cd server
npm install
cp .env.example .env
npx prisma migrate dev
npx prisma db seed        # optional: 3 sample projects, 7 sample tasks
cd ../client && npm install
```

## Backend smoke test (no browser needed)

```bash
curl -s localhost:4100/health                       # {"status":"ok"}
curl -s localhost:4100/api/dashboard | node -pe 'JSON.parse(require("fs").readFileSync(0)).stats'
```

If you changed an endpoint, the fuller checklist that caught real bugs during initial development:
```bash
curl -s -X POST localhost:4100/api/projects -H 'Content-Type: application/json' -d '{}'
# -> 400 {"error":{"message":"Validation failed","fields":{"name":"Required"}}}

curl -s -X POST localhost:4100/api/tasks -H 'Content-Type: application/json' -d '{"title":"x","projectId":"nope"}'
# -> 400, fields.projectId: "No project exists with this id"

curl -s "localhost:4100/api/tasks?sortBy=priority&sortOrder=asc" | node -pe 'JSON.parse(require("fs").readFileSync(0)).map(t=>t.priority)'
# -> should read Low...Low, Medium...Medium, High...High (priority sort is done in app code, not SQL — see .claude/steering/tech.md)
```

## Driving it in a browser

`chromium-cli` is not installed in this environment. Use Playwright directly instead — it's not a project dependency, so install it into a scratch directory rather than `client/` or `server/`:

```bash
mkdir -p /tmp/taskflow-pw && cd /tmp/taskflow-pw
npm init -y >/dev/null 2>&1
npm install playwright
npx playwright install chromium   # usually a no-op; the browser is commonly already cached at ~/Library/Caches/ms-playwright
```

Then drive it with a small script (`chromium.launch({ args: ["--no-sandbox"] })`, `browser.newPage()`, `page.goto(...)`, `page.screenshot({ path })`). One representative path that proves the app is actually working end-to-end, not just rendering a shell:

1. `goto http://localhost:5173/dashboard`, wait for `text=Total Projects`, screenshot.
2. `goto /tasks`, click `button:has-text("Board")`, wait for `h3:has-text('To Do')`, screenshot.
3. Change a card's status via its `select[aria-label^="Change status for"]` dropdown (or drag — the board also supports native HTML5 drag-and-drop).
4. `page.reload()` and confirm the new status is still there — this is the check that actually matters, since it proves the change round-tripped through the API and SQLite rather than only updating client state.
5. `page.on('console', ...)` collecting `type() === 'error'` — check it's empty before declaring success. A page can render its shell while every fetch fails.

## Gotchas specific to this app

- Search input placeholder uses a real unicode ellipsis (`Search tasks by title…`), not three ASCII dots — an exact-text Playwright selector with `...` will silently never match.
- `text=` locators can match hidden elements (e.g. the desktop sidebar nav link, which is `hidden md:flex` — present in the DOM, invisible below the `md` breakpoint) and Playwright's strict-mode "first match" pick can be the wrong one. Prefer a scoped selector (`h1:has-text(...)`) over a bare `text=` locator when the same string could appear in nav/chrome too.
- The Kanban board's per-card status `<select>` also renders the literal status strings ("To Do" text appears inside `<option>` elements) — a bare `text=To Do` locator will match those before the column heading. Scope to `h3:has-text('To Do')` for the column, not the option.
