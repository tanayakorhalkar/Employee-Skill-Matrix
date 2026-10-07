param(
    [switch]$SeedOnly
)

$ErrorActionPreference = "Stop"

$postgresUser = "postgres"
$databaseName = "employeeskilllmatrix"
$postgresPassword = Read-Host "Enter the local PostgreSQL password for '$postgresUser'" -AsSecureString
$env:POSTGRES_PASSWORD = [System.Net.NetworkCredential]::new("", $postgresPassword).Password
$env:PGPASSWORD = $env:POSTGRES_PASSWORD
$postgresPassword.Dispose()

$env:POSTGRES_SERVER = "localhost"
$env:POSTGRES_PORT = "5432"
$env:POSTGRES_USER = $postgresUser
$env:POSTGRES_DB = $databaseName
Remove-Item Env:DATABASE_URL -ErrorAction SilentlyContinue

$psql = (Get-Command psql -ErrorAction SilentlyContinue).Source
if (-not $psql) {
    $psql = "C:\Program Files\PostgreSQL\18\bin\psql.exe"
}

try {
    if (-not (Test-Path $psql)) {
        throw "psql was not found. Add PostgreSQL's bin directory to PATH or install PostgreSQL command-line tools."
    }

    $authResult = & $psql -h $env:POSTGRES_SERVER -p $env:POSTGRES_PORT -U $postgresUser -d postgres -w -tAc "SELECT 1"
    if ($LASTEXITCODE -ne 0 -or $authResult.Trim() -ne "1") {
        throw "Could not authenticate to local PostgreSQL as '$postgresUser'. Check the password and ensure the PostgreSQL service is running."
    }

    $databaseExists = & $psql -h $env:POSTGRES_SERVER -p $env:POSTGRES_PORT -U $postgresUser -d postgres -w -tAc "SELECT 1 FROM pg_database WHERE datname = '$databaseName'"
    if ($LASTEXITCODE -ne 0) {
        throw "Could not check whether database '$databaseName' exists."
    }
    if ("$databaseExists".Trim() -ne "1") {
        & $psql -h $env:POSTGRES_SERVER -p $env:POSTGRES_PORT -U $postgresUser -d postgres -w -c "CREATE DATABASE $databaseName"
        if ($LASTEXITCODE -ne 0) {
            throw "Could not create database '$databaseName'."
        }
    }
    Remove-Item Env:PGPASSWORD

    Set-Location $PSScriptRoot
    $python = Join-Path $PSScriptRoot ".venv\Scripts\python.exe"
    if (-not (Test-Path $python)) {
        throw "Backend dependencies are not installed. Create backend\.venv and install requirements.txt first."
    }

    & $python -m alembic upgrade head
    if ($LASTEXITCODE -ne 0) {
        throw "Database migrations failed."
    }
    & $python -m app.database.seed
    if ($LASTEXITCODE -ne 0) {
        throw "Database seeding failed."
    }

    if ($SeedOnly) {
        Write-Host "Database migrations and seed completed for '$databaseName'."
        return
    }

    Write-Host "Connected to PostgreSQL database '$databaseName'. API is starting at http://localhost:8000."
    & $python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
}
finally {
    Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
    Remove-Item Env:POSTGRES_PASSWORD -ErrorAction SilentlyContinue
}
