# Project Structure & Entry Points

This project is organized into three main folders: backend (`dms-api`), frontend (`dms-frontend`), and shared code (`shared`). Below is an overview of the directory layout and the most important files to start with.

## Backend (`dms-api`)

- `src/main.ts` — Main application entry point
- `src/app.module.ts` — Main app module
- `src/worker.ts` — Worker process entry point
- `src/worker.module.ts` — Worker module (background jobs, async tasks)
- `prisma/` — Database schema, migrations, and models

## Frontend (`dms-frontend`)

- `src/main.ts` — Application entry point
- `src/layouts/MainLayout.vue` — Main authenticated layout page
- `src/router.ts` — Routing configuration
- `src/components/` — UI components
- `src/features` - Business logic split by feature

## Shared (`shared`)

- `models/` — Data models used across backend and frontend

### What to Look at First

- Backend: `main.ts`, `app.module.ts`, `worker.ts`, `worker.module.ts`
- Frontend: `main.ts`, `layouts/MainLayout.vue`, `router.ts`
- Shared: `models/`

This structure provides clear entry points for new contributors and helps orient anyone exploring the codebase.

---

[← Previous: Quick Start](02_quick-start.md) | [Next: Key Concepts & Architecture →](04_architecture.md)
