# Stop all Car Rental App servers

Write-Host "Stopping Car Rental Application..." -ForegroundColor Cyan

# Kill processes on port 8000 (Django)
$port8000 = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
if ($port8000) {
    $processId = $port8000.OwningProcess
    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
    Write-Host "Django server stopped (port 8000)" -ForegroundColor Green
}

# Kill processes on port 3000 (React)
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($port3000) {
    $processId = $port3000.OwningProcess
    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
    Write-Host "React server stopped (port 3000)" -ForegroundColor Green
}

# Kill any remaining python manage.py processes
Get-Process python -ErrorAction SilentlyContinue | Where-Object {$_.CommandLine -like "*manage.py*"} | Stop-Process -Force -ErrorAction SilentlyContinue

# Kill any remaining node processes (React)
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host "All servers stopped!" -ForegroundColor Green
Start-Sleep -Seconds 2
