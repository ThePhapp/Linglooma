# Environment setup

Linglooma supports two development modes. Use Node.js 22 and Docker Compose.

## Local app with Docker PostgreSQL

From the repository root in PowerShell:

```powershell
$env:DB_PASSWORD = "<choose a local database password>"
docker compose up -d db
Copy-Item 01-backend-nodejs/.env.local.example 01-backend-nodejs/.env
```

Set the same `DB_PASSWORD` plus a private `JWT_SECRET` in the copied backend `.env`. Add your own Gemini and Azure keys only when testing those features.

Start the API and frontend in separate terminals:

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

Local endpoints:

- Frontend: <http://localhost:4028>
- API: <http://localhost:3000>
- PostgreSQL: `localhost:5433` (`5432` inside the container)

`start-db-only.bat` and `01-backend-nodejs/use-local-env.bat` are convenience wrappers for this mode. They never embed real credentials.

## All services in Docker

```powershell
Copy-Item 01-backend-nodejs/.env.docker.example 01-backend-nodejs/.env
$env:DB_PASSWORD = "<same value used in the backend environment>"
docker compose up --build
```

The containerized frontend is at <http://localhost/>, the API at <http://localhost:3000>, and PostgreSQL remains exposed on host port 5433. Inside the Docker network the backend connects to `db:5432`.

Stop containers without deleting their data volume:

```powershell
docker compose down
```

## Schema changes

A new PostgreSQL volume is initialized once from `02-database-postgresql/linglooma_update.sql`. That file is a destructive development reset. Existing databases must use the ordered forward runner documented in [RUN_MIGRATION.md](02-database-postgresql/RUN_MIGRATION.md):

```powershell
cd 02-database-postgresql
.\run-migration.bat
```

Back up data before production migration. Do not copy or execute the archived singular reading/writing SQL files.

## Checks

```powershell
cd 01-backend-nodejs
npm test
```

```powershell
cd 00-frontend-react
npm run build
```

Use `GET http://localhost:3000/api/health` to check API/database readiness. Chat, submissions, and private history/detail routes require a JWT obtained through login.

## Troubleshooting

- API cannot reach PostgreSQL: verify `docker compose ps`, host port 5433, and matching `DB_PASSWORD` values.
- Vite reports `ECONNREFUSED`: start the API on port 3000 and restart Vite after changing `.env`.
- Migration fails: stop at the first error and follow `RUN_MIGRATION.md`; never substitute the reset SQL.
- Port conflict: `check-port-5433.bat` reports the listener without stopping services.
- Hosted PostgreSQL: set `DATABASE_URL` and follow [SUPABASE_SETUP_GUIDE.md](SUPABASE_SETUP_GUIDE.md).
