# Web Frontend (Vue)

This folder contains the Vue 3 + Vite web app shell aligned to the backend contract in:

- `/Users/portavion/code/tasklisp/docs/web-v1-backend-contract.org`

## Stack

- Vue 3
- Vue Router
- `@tanstack/vue-query`
- `vite-plugin-pwa`

## Run

```bash
npm install
npm run dev
```

Set `VITE_API_BASE_URL` only if API is not same-origin.

## App shell coverage

- Session bootstrap (`GET /api/v1/auth/session`)
- Provider links (`GET /api/v1/auth/providers`)
- Workspaces list (`GET /api/v1/workspaces`)
- Task views (`GET /api/v1/tasks` for inbox/today/upcoming/search)
- Quick add (`POST /api/v1/tasks/quick-add`)
- Conflicts list (`GET /api/v1/conflicts`)

## Notes

- This is a shell scaffold, not feature-complete UI.
- Task editing, filters CRUD UI, move/reorder UI, and settings forms are planned next.
