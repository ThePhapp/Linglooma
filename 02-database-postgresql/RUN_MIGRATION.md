# PostgreSQL schema workflow

Use `run-migration.bat` on Windows, or `pwsh -File run-migration.ps1`. This is the single forward migration entry point for an empty database or an existing canonical database. The scripts under `migrations/` run in filename order, preserve existing rows, and are recorded with SHA-256 hashes in `public.schema_migrations`. A changed applied file stops the runner. Add a new numbered SQL file for later changes; do not edit a migration already applied to a database. Each migration must be additive, replayable, and manage its own transaction, because a connection failure between its commit and the ledger insert can cause a replay.

`linglooma_update.sql` is a **development-only reset and sample-data script**. It starts with `DROP TABLE ... CASCADE` and deletes user data. Never run it against an existing or production database. Docker Compose mounts it under `/docker-entrypoint-initdb.d/`, so it runs automatically only when the PostgreSQL data volume is first created. Do not discard that volume to perform an upgrade. The forward runner can be used after Docker initialization to stamp and check the schema; its baseline and reading migration are replayable against that development schema.

`reading_migration.sql` and `writing_migration.sql` are archived designs using obsolete singular tables. They deliberately abort before making changes. Their data is **not** automatically converted to the current plural tables. If a database has only those legacy tables, export and map the data before adopting the canonical schema. Historical `reading_answers` rows with no known submission boundary are preserved with `attempt_id = NULL` and excluded from attempt history.

## Connection

Install `psql` and put it on `PATH`. The runner uses `DATABASE_URL` when set. Otherwise it reads libpq `PGHOST`, `PGPORT`, `PGUSER`, `PGDATABASE`, `PGPASSWORD`; unset values fall back to matching `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_NAME`, `DB_PASSWORD`, then `localhost:5433`, `postgres`, and `linglooma`. Supply the password through the environment or a PostgreSQL password file. Do not put it in the script.

The repository's Docker Compose PostgreSQL 15 service exposes port **5433 on the host** and uses `DB_PASSWORD` for `postgres`. From a host terminal, set `DB_PASSWORD` to the same value used by Compose, then run:

```powershell
cd 02-database-postgresql
.\run-migration.bat
```

For a separately installed local PostgreSQL server, set `DB_PORT=5432` (and other `DB_*` values as needed). For a hosted database, set `DATABASE_URL` to its connection URI and run the same launcher. Back up the database and arrange a maintenance window before applying migrations to a live deployment. The reading attempt migration notes that old submit writers should be paused during rollout.

The runner stops on the first SQL error, refuses a legacy-only reading/writing schema, refuses unknown or modified ledger entries, and checks the canonical tables, columns, and reading attempt constraint at the end. It does not copy sample data. For a read-only schema check after migration with local `PG*` connection settings:

```powershell
psql -X -v ON_ERROR_STOP=1 -f .\check-migration.sql
```

For a hosted database, add `-d $env:DATABASE_URL` to that `psql` command. If a prior interrupted run applied a migration but failed before recording it, inspect the schema and rerun the runner; the current migrations are safe to replay. Do not manually edit `schema_migrations` to hide a failure.

Static checks that need no database:

```powershell
pwsh -NoProfile -File .\test-migrations.ps1
```

The schema still needs validation against a disposable PostgreSQL 15 database and the actual target database before deployment. The repository also contains older setup guides and backend launchers outside this folder that reference the reset or archived scripts; those are outside this task's write scope and must not be used for upgrades.
