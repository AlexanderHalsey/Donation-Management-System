# Quick Start

Follow these steps to get the project running quickly. For detailed instructions, see the relevant sections below.

## 1. Set Node Version

Use Node version manager (nvm) to select the correct version:

```bash
nvm use
```

> Requires Node >=18.0.0

## 2. Install Dependencies

Install all workspace dependencies:

```bash
npm install
```

## 3. Set Up Environment Variables

- Create `.env` files for [dms-api/](../dms-api/) and [dms-frontend/](../dms-frontend/).
- Refer to [Configuration](06_configuration.md) for required variables.

## 4. Google Cloud Service Account

- Download `serviceAccount.json` from Google Cloud Console.
- Set the `GOOGLE_APPLICATION_CREDENTIALS` variable to its path.
- See [Configuration](06_configuration.md) for details.

## 5. Generate Prisma Client

Generate Prisma client for the backend:

```bash
cd dms-api && npx prisma generate --sql
```

## 6. Available Root Scripts

- `npm run dev` — Start backend, worker, and frontend for development
- `npm run build` — Build backend and frontend
- `npm run lint` — Lint all code
- `npm run test` — Run all tests

---

[← Previous: Introduction](01_introduction.md) | [Next: Project Structure →](03_project-structure.md)
