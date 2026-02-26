# PowerShell script to install project dependencies (Composer + npm)
[CmdletBinding()]
param (
    # Omit development dependencies for a production-like installation.
    [switch]$Production
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

Write-Host 'Installing PHP dependencies with Composer...'
if (Get-Command composer -ErrorAction SilentlyContinue) {
    $composerArgs = @(
        'install', '--no-interaction', '--prefer-dist', '--optimize-autoloader'
    )
    if ($Production.IsPresent) {
        $composerArgs += '--no-dev'
    }
    composer @composerArgs
} else {
    Write-Error "Composer not found. Install Composer first: https://getcomposer.org/download/"
    exit 1
}

if (Test-Path -Path "package.json") {
    if (Get-Command npm -ErrorAction SilentlyContinue) {
        Write-Host 'Installing Node dependencies...'
        if ($Production.IsPresent) {
            Write-Host 'Production flag detected, setting NODE_ENV=production for npm.'
            $env:NODE_ENV = 'production'
        }
        if (Test-Path -Path "package-lock.json") {
            npm ci
        } else {
            npm install
        }
        Write-Host 'Building front-end assets if present...'
        npm run build --if-present
    } else {
        Write-Error "npm not found. Install Node.js/npm first: https://nodejs.org/"
        exit 1
    }
} else {
    Write-Host 'No package.json found - skipping Node/npm steps.'
}

Write-Host 'All done.'