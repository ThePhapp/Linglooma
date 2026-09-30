# Linglooma IELTS

English: [full setup guide](README.en.md) · 日本語: [セットアップガイド](README.ja.md) · [Frontend guide](00-frontend-react/README.md)

Linglooma is an IELTS practice app built with React 19, Vite 6, Express 5, Node.js 22, and PostgreSQL. Azure Speech supports speaking assessment; Gemini supports writing evaluation and authenticated text chat. Reading submissions and speaking results are stored per account. Listening exercises run in the browser; listening progress is not persisted. Analytics show recorded speaking results only.

## Local setup / ローカル環境

Use Node.js 22 and Docker Compose with PostgreSQL 15. From the repository root in PowerShell:

```powershell
$env:DB_PASSWORD = "<choose a local database password>"
docker compose up -d db
Copy-Item 01-backend-nodejs/.env.local.example 01-backend-nodejs/.env
# Set DB_PASSWORD to the same value and configure JWT_SECRET in the copied file.
```

Then, in separate terminals:

```powershell
cd 01-backend-nodejs
npm ci
npm run dev
```

```powershell
cd 00-frontend-react
Copy-Item .env.example .env
npm ci
npm run dev
```

Frontend: <http://localhost:4028> · API: <http://localhost:3000> · PostgreSQL host port: **5433** (container port 5432). Set `GEMINI_API_KEY` and `AZURE_SPEECH_KEY` in the backend environment to use their features. Obtain a JWT by signing in before using chat or private results/submission APIs.

For schema upgrades, follow [the forward migration guide](02-database-postgresql/RUN_MIGRATION.md) and run its `run-migration.bat` or `run-migration.ps1` entry point. `linglooma_update.sql` drops tables and is only a **destructive development reset**; Compose uses it automatically when a new database volume is initialized. Never run it as an upgrade against existing data.

## Checks / 検証

Run `npm test` from `01-backend-nodejs`, and `npm run build` from `00-frontend-react`. Frontend browser tests use Cypress (`npx cypress run`) and require a working browser/runtime.

For full Docker startup, copy `01-backend-nodejs/.env.docker.example` to `01-backend-nodejs/.env`, set private credentials, and run `docker compose up --build` from the root. The containerized frontend is served at <http://localhost/>.
