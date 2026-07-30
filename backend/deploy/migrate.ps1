[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

function Assert-EnvironmentVariable {
    param([Parameter(Mandatory)][string]$Name)

    $value = [Environment]::GetEnvironmentVariable($Name)
    if ([string]::IsNullOrWhiteSpace($value)) {
        throw "La variable de entorno $Name es obligatoria."
    }
}

Assert-EnvironmentVariable -Name 'DB_URL'
Assert-EnvironmentVariable -Name 'DB_USER'
Assert-EnvironmentVariable -Name 'DB_PASS'

$migrationDirectory = [System.IO.Path]::GetFullPath(
    (Join-Path $PSScriptRoot '..\src\main\resources\db\migration')
)

if (-not (Test-Path -LiteralPath $migrationDirectory -PathType Container)) {
    throw "No se encontro el directorio de migraciones: $migrationDirectory"
}

$previousFlywayUrl = $env:FLYWAY_URL
$previousFlywayUser = $env:FLYWAY_USER
$previousFlywayPassword = $env:FLYWAY_PASSWORD

try {
    $env:FLYWAY_URL = $env:DB_URL
    $env:FLYWAY_USER = $env:DB_USER
    $env:FLYWAY_PASSWORD = $env:DB_PASS

    & docker run --rm `
        --env FLYWAY_URL `
        --env FLYWAY_USER `
        --env FLYWAY_PASSWORD `
        --mount "type=bind,source=$migrationDirectory,target=/flyway/sql,readonly" `
        flyway/flyway:9.22.3 `
        -connectRetries=3 `
        -cleanDisabled=true `
        migrate

    if ($LASTEXITCODE -ne 0) {
        throw "Flyway finalizo con codigo $LASTEXITCODE."
    }
}
finally {
    $env:FLYWAY_URL = $previousFlywayUrl
    $env:FLYWAY_USER = $previousFlywayUser
    $env:FLYWAY_PASSWORD = $previousFlywayPassword
}
