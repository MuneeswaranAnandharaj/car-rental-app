# WheelWise - Car Rental Application

Full-stack car rental app built with Django + MySQL backend and React frontend.

## Prerequisites

- Python 3.10+
- Node.js 18+
- MySQL 8.0+

## Setup

### 1. Database

Create a MySQL database:

```sql
CREATE DATABASE wheelwise_db CHARACTER SET utf8mb4;
CREATE USER 'wheelwise_user'@'localhost' IDENTIFIED BY 'admin1';
GRANT ALL PRIVILEGES ON wheelwise_db.* TO 'wheelwise_user'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Backend

```bash
# Create virtual environment
python -m venv venv
venv\Scripts\activate   # Windows
# source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Seed car data (15 cars with images)
python populate_cars.py

# Create admin user
python manage.py createsuperuser

# Start Django server
python manage.py runserver
```

### 3. Frontend

```bash
cd frontend
npm install
npm start
```

The app will be available at:
- **Frontend:** http://localhost:3000
- **API:** http://localhost:8000/api
- **Admin:** http://localhost:8000/admin

## Credentials

- **Admin:** `admin` / `admin123`
- **Test user:** `testuser` / `test123`

## Tech Stack

- **Backend:** Django, Django REST Framework, MySQL
- **Frontend:** React, Axios, Leaflet, CSS Variables
- **Auth:** Token-based authentication
