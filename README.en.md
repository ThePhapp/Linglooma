# Linglooma IELTS

[Main README](README.md) · [日本語](README.ja.md) · [Frontend guide](00-frontend-react/README.md)

Linglooma provides IELTS speaking, writing, reading, and browser-based listening practice. The stack is React 19, Vite 6, Tailwind CSS 3, Node.js 22, Express 5, and PostgreSQL 15 in Docker Compose. Azure Speech assesses speaking; Gemini evaluates writing and powers text chat. The app stores account-specific speaking, writing, and reading submissions. Listening exercise progress is not persisted. The analytics page reports recorded speaking results, not a combined four-skill dashboard.

## Local development (PowerShell)

Install Node.js 22, npm, and Docker Compose. Set a local database password and start PostgreSQL from the repository root:

```powershell
$env:DB_PASSWORD = "<choose a local database password>"
docker compose up -d db
Copy-Item 01-backend-nodejs/.env.local.example 01-backend-nodejs/.env
```

Edit `01-backend-nodejs/.env`: set `DB_PASSWORD` to the same value, choose a private `JWT_SECRET`, and add your own `GEMINI_API_KEY` and `AZURE_SPEECH_KEY` if using AI features. Do not commit `.env`. For a hosted database, set `DATABASE_URL` instead of the local `DB_*` connection fields.

Start the API in a terminal:

```powershell
cd 01-backend-nodejs
npm ci
npm run dev
```

Start the frontend in another terminal from the repository root:

```powershell
cd 00-frontend-react
Copy-Item .env.example .env
npm ci
npm run dev
```

The frontend runs at <http://localhost:4028>, the API at <http://localhost:3000>, and Compose exposes PostgreSQL 15 on host port **5433** (port 5432 inside Docker). The Vite development server proxies `/api` to the local API. The `.env.example` frontend file sets `VITE_BACKEND_URL` to that same local API. Sign in to obtain a JWT before calling chat, submission, or private history/detail endpoints; public practice catalog reads remain available without one.

## Schema and Docker

For a fresh Compose database volume, PostgreSQL initializes from `02-database-postgresql/linglooma_update.sql`. This script **drops tables and resets development data**. Never run it against an existing database or use it as an upgrade. Existing databases must use the ordered, additive forward migration entry point in [RUN_MIGRATION.md](02-database-postgresql/RUN_MIGRATION.md). From `02-database-postgresql`, run `./run-migration.bat` on Windows or `pwsh -File ./run-migration.ps1`; follow that guide for connection variables and backups.

For all services in Docker, copy `01-backend-nodejs/.env.docker.example` to `01-backend-nodejs/.env`, supply your own secrets, set the root-shell `DB_PASSWORD` to the same database password, and run `docker compose up --build`. The frontend is then at <http://localhost/> and the API at <http://localhost:3000>.

## Verification

```powershell
cd 01-backend-nodejs
npm test
```

```powershell
cd 00-frontend-react
npm run build
npx cypress run
```

`npm run build` writes to `00-frontend-react/build`. Cypress needs a supported browser and a running app for browser tests.
