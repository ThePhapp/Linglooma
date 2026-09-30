# Static safety and wiring checks; does not connect to a database.
$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$migrations = @(Get-ChildItem -LiteralPath (Join-Path $root 'migrations') -Filter '*.sql' -File | Sort-Object Name)
if ($migrations.Count -lt 2) { throw 'Expected baseline and reading attempt migrations.' }
if ($migrations[0].Name -ne '20260930_0001_canonical_baseline.sql') { throw 'Baseline migration is not first.' }
if ($migrations[1].Name -ne '20260930_t08_reading_attempts.sql') { throw 'Reading attempt migration is not second.' }

foreach ($migration in $migrations) {
    $sql = Get-Content -LiteralPath $migration.FullName -Raw
    if ($sql -match '(?im)^\s*(DROP\s+(TABLE|SCHEMA|DATABASE)|TRUNCATE\b|DELETE\s+FROM\b|INSERT\s+INTO\s+users\b)') {
        throw "Destructive or seed statement in $($migration.Name)"
    }
    if ($sql -notmatch '(?im)^\s*BEGIN\s*;' -or $sql -notmatch '(?im)^\s*COMMIT\s*;') {
        throw "Migration must manage its own transaction: $($migration.Name)"
    }
}

$baseline = Get-Content -LiteralPath $migrations[0].FullName -Raw
foreach ($table in @('reading_passages', 'reading_questions', 'reading_answers', 'reading_attempts', 'writing_tasks', 'writing_submissions')) {
    if ($baseline -notmatch "(?im)^CREATE TABLE IF NOT EXISTS $table\s*\(") { throw "Canonical table absent from baseline: $table" }
}
foreach ($name in @('reading_migration.sql', 'writing_migration.sql')) {
    $legacy = Get-Content -LiteralPath (Join-Path $root $name) -Raw
    if ($legacy -notmatch '(?s)^-- ARCHIVED:.*?BEGIN;\s*DO \$\$ BEGIN RAISE EXCEPTION') {
        throw "Archived migration lacks fail-fast transaction guard: $name"
    }
}

$runner = Get-Content -LiteralPath (Join-Path $root 'run-migration.ps1') -Raw
$batch = Get-Content -LiteralPath (Join-Path $root 'run-migration.bat') -Raw
if ($runner -notmatch 'schema_migrations' -or $runner -notmatch 'Get-FileHash' -or $runner -notmatch 'ON_ERROR_STOP=1') { throw 'Runner lacks ledger, hash, or SQL error handling.' }
if ($batch -notmatch 'run-migration.ps1' -or $batch -match 'linglooma_update.sql') { throw 'Batch launcher is not using the forward runner.' }
if (-not (Test-Path -LiteralPath (Join-Path $root 'check-migration.sql'))) { throw 'Missing schema check.' }
Write-Host 'Static migration checks passed.'
