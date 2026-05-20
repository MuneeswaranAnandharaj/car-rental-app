@echo off
echo Starting WheelWise servers...

echo Starting Django backend...
start "Django" cmd /c "call venv\Scripts\activate && python manage.py runserver"

timeout /t 3 /nobreak >nul

echo Starting React frontend...
start "React" cmd /c "cd frontend && npm start"

echo Both servers starting...
echo Django:  http://localhost:8000
echo React:   http://localhost:3000
