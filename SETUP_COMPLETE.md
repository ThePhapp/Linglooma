# Setup status

The canonical setup is documented in:

- [README.en.md](README.en.md) — project and local quick start
- [ENVIRONMENT_SETUP_GUIDE.md](ENVIRONMENT_SETUP_GUIDE.md) — local and Docker modes
- [02-database-postgresql/RUN_MIGRATION.md](02-database-postgresql/RUN_MIGRATION.md) — non-destructive forward migrations
- [SUPABASE_SETUP_GUIDE.md](SUPABASE_SETUP_GUIDE.md) — hosted PostgreSQL
- [DEPLOY_GUIDE.md](DEPLOY_GUIDE.md) — deployment contract

Current runtime contract:

| Component | Version / endpoint |
| --- | --- |
| Node.js | 22 |
| Frontend dev | <http://localhost:4028> |
| Backend API | <http://localhost:3000> |
| PostgreSQL | 15; host `5433`, container `5432` |
| Frontend build output | `00-frontend-react/build` |

Safe verification:

```powershell
cd 01-backend-nodejs
npm test
```

```powershell
cd 00-frontend-react
npm run build
```

The repository contains no usable production credentials. Copy an example environment file, replace every placeholder locally, and rotate any credentials that were ever committed. Listening scores are session-only; analytics currently report saved speaking results rather than all four skills.

`linglooma_update.sql` is not an upgrade migration. It drops tables and is used only when initializing a new development volume. Use the forward migration guide for every existing database.
