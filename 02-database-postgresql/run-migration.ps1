# Canonical forward migration runner. Requires psql on PATH.
$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$migrationDirectory = Join-Path $root 'migrations'

if (-not (Get-Command psql -ErrorAction SilentlyContinue)) {
    throw 'psql was not found on PATH. Install PostgreSQL client tools first.'
}

# DATABASE_URL is the production convention; DB_* and PG* support local/Docker.
if (-not $env:DATABASE_URL) {
    if (-not $env:PGHOST) { $env:PGHOST = if ($env:DB_HOST) { $env:DB_HOST } else { 'localhost' } }
    if (-not $env:PGPORT) { $env:PGPORT = if ($env:DB_PORT) { $env:DB_PORT } else { '5433' } }
    if (-not $env:PGUSER) { $env:PGUSER = if ($env:DB_USER) { $env:DB_USER } else { 'postgres' } }
    if (-not $env:PGDATABASE) { $env:PGDATABASE = if ($env:DB_NAME) { $env:DB_NAME } else { 'linglooma' } }
    if (-not $env:PGPASSWORD -and $env:DB_PASSWORD) { $env:PGPASSWORD = $env:DB_PASSWORD }
}

$connection = @()
if ($env:DATABASE_URL) { $connection = @('-d', $env:DATABASE_URL) }

function Invoke-Psql {
    param([string[]] $Arguments)
    $output = & psql -X -v ON_ERROR_STOP=1 @connection @Arguments
    if ($LASTEXITCODE -ne 0) { throw 'psql failed; migration stopped. Inspect the error above.' }
    return $output
}

$schemaKind = Invoke-Psql -Arguments @('-q', '-At', '-c', "SELECT CASE WHEN (to_regclass('public.reading_passage') IS NOT NULL AND to_regclass('public.reading_passages') IS NULL) OR (to_regclass('public.writing_prompt') IS NOT NULL AND to_regclass('public.writing_tasks') IS NULL) THEN 'legacy-only' ELSE 'canonical-or-empty' END")
if ($schemaKind -eq 'legacy-only') {
    throw 'Only obsolete singular reading or writing tables exist. Export and map legacy data before adopting the canonical plural schema.'
}

$files = @(Get-ChildItem -LiteralPath $migrationDirectory -Filter '*.sql' -File | Sort-Object Name)
if ($files.Count -eq 0) { throw 'No canonical forward migrations found.' }
foreach ($file in $files) {
    if ($file.Name -notmatch '^\d{8}_[a-zA-Z0-9_]+\.sql$') { throw "Invalid migration filename: $($file.Name)" }
}

Invoke-Psql -Arguments @('-q', '-c', 'CREATE TABLE IF NOT EXISTS public.schema_migrations (filename text PRIMARY KEY, sha256 char(64) NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())') | Out-Null
$applied = @{}
foreach ($line in @(Invoke-Psql -Arguments @('-q', '-At', '-F', '|', '-c', 'SELECT filename, sha256 FROM public.schema_migrations ORDER BY filename'))) {
    if ($line) {
        $fields = $line -split '\|', 2
        $applied[$fields[0]] = $fields[1].Trim()
    }
}
$known = @($files | ForEach-Object Name)
foreach ($name in $applied.Keys) {
    if ($name -notin $known) { throw "Database records an unknown migration: $name" }
}

foreach ($file in $files) {
    $hash = (Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
    if ($applied.ContainsKey($file.Name)) {
        if ($applied[$file.Name] -ne $hash) { throw "Applied migration changed: $($file.Name)" }
        Write-Host "Already applied: $($file.Name)"
        continue
    }
    Write-Host "Applying: $($file.Name)"
    Invoke-Psql -Arguments @('-q', '-f', $file.FullName) | Out-Null
    # Each SQL file commits itself. If stamping fails, rerunning is safe because
    # canonical migrations are additive and replayable.
    Invoke-Psql -Arguments @('-q', '-c', "INSERT INTO public.schema_migrations (filename, sha256) VALUES ('$($file.Name)', '$hash')") | Out-Null
}

Invoke-Psql -Arguments @('-q', '-f', (Join-Path $root 'check-migration.sql')) | Out-Null
Write-Host 'Canonical schema checks passed.'
