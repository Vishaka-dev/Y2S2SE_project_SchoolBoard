# Load environment variables from .env file
# Usage: .\load-env.ps1

if (Test-Path .env) {
    Write-Host "Loading environment variables from .env file..." -ForegroundColor Green
    
    Get-Content .env | ForEach-Object {
        if ($_ -match '^([^#].+?)=(.+)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            
            # Set environment variable for current process
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
            
            # Also export to current PowerShell session
            Set-Item -Path "env:$name" -Value $value
            
            Write-Host "  Set: $name" -ForegroundColor Gray
        }
    }
    
    Write-Host "`nEnvironment variables loaded successfully!" -ForegroundColor Green
    Write-Host "Environment variables are set for this session only." -ForegroundColor Yellow
    Write-Host "You can now run: .\mvnw.cmd spring-boot:run" -ForegroundColor Cyan
} else {
    Write-Host "Error: .env file not found!" -ForegroundColor Red
    Write-Host "Please copy .env.example to .env and fill in your credentials" -ForegroundColor Yellow
    exit 1
}
