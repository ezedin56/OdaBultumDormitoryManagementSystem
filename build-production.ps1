# OBUDMS Production Build Script (Windows)
# This script prepares the application for production deployment

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "OBUDMS Production Build" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the project root
if (-not (Test-Path "frontend") -or -not (Test-Path "backend")) {
    Write-Host "❌ Error: Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

# Backend Build
Write-Host "📦 Installing backend dependencies..." -ForegroundColor Yellow
Set-Location backend
npm install --production
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Backend dependency installation failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Backend dependencies installed" -ForegroundColor Green
Set-Location ..

# Frontend Build
Write-Host ""
Write-Host "📦 Building frontend..." -ForegroundColor Yellow
Set-Location frontend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend dependency installation failed" -ForegroundColor Red
    exit 1
}

npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend build failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Frontend built successfully (output in frontend/dist)" -ForegroundColor Green
Set-Location ..

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "✅ Production build completed!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Configure environment variables (.env files)"
Write-Host "2. Deploy backend to your hosting platform"
Write-Host "3. Deploy frontend/dist to static hosting"
Write-Host "4. Update API URLs in frontend code if needed"
Write-Host ""
Write-Host "See deployment_guide.md for detailed instructions" -ForegroundColor Cyan
