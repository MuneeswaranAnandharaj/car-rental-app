# Car Rental App - Auto Start Script
# This script starts both Django and React servers automatically

Write-Host "Starting Car Rental Application..." -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

# Check if database needs to be populated (first run)
$dbFile = "D:\New folder\New folder (2)\carz\db.sqlite3"
if (-not (Test-Path $dbFile)) {
    Write-Host "First run detected. Setting up database..." -ForegroundColor Yellow
    cd "D:\New folder\New folder (2)\carz"
    .\venv\Scripts\Activate.ps1
    python manage.py migrate
    python populate_cars.py
    python manage.py createsuperuser --username admin --email admin@example.com --password admin123
}

# Start Django Backend in a new window
Write-Host "Starting Django Backend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'D:\New folder\New folder (2)\carz'; .\venv\Scripts\Activate.ps1; Write-Host 'Django Server Starting on port 8000...' -ForegroundColor Green; python manage.py runserver 8000"

# Wait a moment for Django to start
Start-Sleep -Seconds 3

# Start React Frontend in a new window
Write-Host "Starting React Frontend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'D:\New folder\New folder (2)\carz\frontend'; Write-Host 'React Server Starting on port 3000...' -ForegroundColor Green; npm start"

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Both servers are starting!" -ForegroundColor Green
Write-Host "Django: http://localhost:8000" -ForegroundColor White
Write-Host "React: http://localhost:3000" -ForegroundColor White
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Press any key to close this window..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
