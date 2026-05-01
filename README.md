# Car Rental Application

A full-stack Car Rental Application built with Django (Backend) and React (Frontend).

## Quick Start (One-Click Launch)

### Option 1: Using Batch File (Easiest)
Double-click: **`start-app.bat`**

### Option 2: Using PowerShell
Right-click: **`start-app.ps1`** → "Run with PowerShell"

This will automatically:
- Start Django backend on http://localhost:8000
- Start React frontend on http://localhost:3000
- Open two terminal windows (one for each server)

### To Stop All Servers
Double-click: **`stop-app.bat`**

## Manual Start (If Needed)

### Terminal 1 - Django Backend:
```powershell
cd "D:\New folder\New folder (2)\carz"
.\venv\Scripts\Activate.ps1
python manage.py runserver 8000
```

### Terminal 2 - React Frontend:
```powershell
cd "D:\New folder\New folder (2)\carz\frontend"
npm start
```

## Access URLs

- **React App (Frontend)**: http://localhost:3000
- **Django API (Backend)**: http://localhost:8000/api/
- **Admin Panel**: http://localhost:8000/admin/
  - Username: `admin`
  - Password: `admin123`

## API Endpoints

- `GET /api/cars/` - List all cars
- `GET /api/cars/available/` - List available cars
- `GET /api/cars/{id}/` - Get car details
- `POST /api/bookings/` - Create booking (auth required)
- `GET /api/bookings/` - List user bookings (auth required)

## Project Structure

```
carz/
├── car_rental/          # Django project
│   ├── settings.py      # Django configuration
│   └── urls.py         # Main URL routing
├── cars/               # Django app
│   ├── models.py       # Car, Booking, CustomUser models
│   ├── serializers.py  # DRF serializers
│   ├── views.py        # API views
│   └── urls.py         # App URL routing
├── frontend/           # React app
│   └── src/
│       ├── components/
│       │   ├── common/     # SearchBar, CarCard
│       │   ├── cars/       # CarList
│       │   └── bookings/   # BookingForm
│       ├── services/       # API service (Axios)
│       └── App.js          # Main React component
├── venv/               # Python virtual environment
├── start-app.bat       # One-click startup (batch)
├── start-app.ps1       # One-click startup (PowerShell)
├── stop-app.bat        # Stop all servers (batch)
└── stop-app.ps1        # Stop all servers (PowerShell)
```

## Features

- **Custom User Model** with Django
- **Car Management** (CRUD operations)
- **Booking System** with automatic price calculation
- **Search Functionality** for cars
- **Date Validation** in booking form
- **Stunning UI** with gradients and animations
- **Responsive Design** for all devices
- **Token Authentication** for API security

## Technologies Used

**Backend:**
- Django 6.0.4
- Django REST Framework 3.17.1
- MySQL/SQLite
- Django CORS Headers

**Frontend:**
- React 18
- React Router DOM
- Axios
- Tailwind CSS (optional)

## Notes

- Currently using SQLite for simplicity
- To switch to MySQL, update `DATABASES` in `car_rental/settings.py`
- CORS is enabled for development (`CORS_ALLOW_ALL_ORIGINS = True`)
- Make sure ports 8000 and 3000 are available before starting
