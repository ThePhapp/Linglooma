# Deployment contract

Provider dashboards change over time, so configure any host using these repository-level requirements rather than hard-coded UI steps.

## Backend

- Root directory: `01-backend-nodejs`
- Runtime: Node.js 22
- Install: `npm ci`
- Start: `npm start`
- Health check: `/api/health`

Required secrets/configuration:

```dotenv
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
JWT_SECRET=<long random secret>
JWT_EXPIRE=1d
GEMINI_API_KEY=<your key>
AZURE_SPEECH_KEY=<your key>
AZURE_SPEECH_REGION=<your region>
PORT=3000
```

Do not expose provider keys or `JWT_SECRET` to frontend variables. Configure `ALLOWED_ORIGINS` only after adding environment-driven CORS support; the current allowed production origin is defined in `app.js`.

Before deploying application code, back up the database and apply the ordered forward migrations from [RUN_MIGRATION.md](02-database-postgresql/RUN_MIGRATION.md). Never run `linglooma_update.sql` against an existing hosted database.

## Frontend

- Root directory: `00-frontend-react`
- Runtime: Node.js 22
- Install: `npm ci`
- Build: `npm run build`
- Output directory: `build`

Set only the public API origin:

```dotenv
VITE_BACKEND_URL=https://your-api.example.com
```

The host must serve the SPA entry point for unknown client-side routes. Build locally before deployment and verify login, a public catalog read, an authenticated chat request, and one private history request.

## Release checks

```powershell
cd 01-backend-nodejs
npm test
```

```powershell
cd 00-frontend-react
npm run build
```

Also verify:

- `/api/health` reports database connectivity without exposing an internal error.
- Missing/invalid JWTs receive `401` on private routes.
- Provider timeouts fail cleanly and temporary audio files are removed.
- Forward migrations are recorded in `schema_migrations` with unchanged hashes.
- Formerly committed Gemini, Azure, JWT, and database credentials have been rotated.
