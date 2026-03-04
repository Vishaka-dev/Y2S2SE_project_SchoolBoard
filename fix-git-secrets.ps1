# Fix Git Secrets - Amend the last commit to remove secrets from application.properties
# This script will update the commit with the cleaned application.properties file

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Fix Git Secrets" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "This will amend your last commit to remove hardcoded secrets." -ForegroundColor Yellow
Write-Host "The application.properties file has been updated to use environment variables only." -ForegroundColor Green
Write-Host ""

# Stage the updated application.properties
Write-Host "Staging fixed application.properties..." -ForegroundColor Cyan
git add backend/src/main/resources/application.properties

# Amend the last commit
Write-Host "Amending the last commit..." -ForegroundColor Cyan
git commit --amend --no-edit

Write-Host ""
Write-Host "✓ Commit amended successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Now you can push with:" -ForegroundColor Cyan
Write-Host "  git push -u origin SCRUM-85-Landing-page-creation --force-with-lease" -ForegroundColor White
Write-Host ""
Write-Host "Note: --force-with-lease is used because we amended the commit." -ForegroundColor Yellow
Write-Host ""
