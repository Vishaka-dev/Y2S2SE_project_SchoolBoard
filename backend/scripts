# Run SchoolBoard Application with environment variables
# Usage: .\run.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SchoolBoard Application Launcher" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Load environment variables if .env exists
if (Test-Path .env) {
    Write-Host "Loading environment variables from .env..." -ForegroundColor Green
    
    Get-Content .env | ForEach-Object {
        if ($_ -match '^([^#].+?)=(.+)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            Set-Item -Path "env:$name" -Value $value
        }
    }
    
    Write-Host "✓ Environment variables loaded" -ForegroundColor Green
} else {
    Write-Host "⚠ No .env file found, using defaults from application.properties" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Starting application..." -ForegroundColor Cyan
Write-Host ""

# Run the application
.\mvnw.cmd spring-boot:run
