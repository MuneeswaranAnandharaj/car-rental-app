"""
Script to populate the database with sample cars and matching images
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'car_rental.settings')
django.setup()

from cars.models import Car

def populate_cars():
    # Delete existing cars
    Car.objects.all().delete()
    
    # Sample cars with matching image URLs
    cars_data = [
        {
            'make': 'Toyota',
            'model': 'Camry',
            'year': 2023,
            'category': 'SEDAN',
            'price_per_day': 65.00,
            'is_available': True,
        },
        {
            'make': 'Honda',
            'model': 'CR-V',
            'year': 2022,
            'category': 'SUV',
            'price_per_day': 85.00,
            'is_available': True,
        },
        {
            'make': 'Ford',
            'model': 'Mustang',
            'year': 2023,
            'category': 'COUPE',
            'price_per_day': 120.00,
            'is_available': True,
        },
        {
            'make': 'Toyota',
            'model': 'Corolla',
            'year': 2022,
            'category': 'SEDAN',
            'price_per_day': 55.00,
            'is_available': True,
        },
        {
            'make': 'BMW',
            'model': '3 Series',
            'year': 2023,
            'category': 'SEDAN',
            'price_per_day': 150.00,
            'is_available': True,
        },
        {
            'make': 'Tesla',
            'model': 'Model 3',
            'year': 2023,
            'category': 'SEDAN',
            'price_per_day': 130.00,
            'is_available': True,
        },
        {
            'make': 'Jeep',
            'model': 'Wrangler',
            'year': 2022,
            'category': 'SUV',
            'price_per_day': 110.00,
            'is_available': True,
        },
        {
            'make': 'Chevrolet',
            'model': 'Tahoe',
            'year': 2023,
            'category': 'SUV',
            'price_per_day': 125.00,
            'is_available': True,
        },
    ]
    
    for car_data in cars_data:
        Car.objects.create(**car_data)
        print(f"Created: {car_data['make']} {car_data['model']}")
    
    print(f"\nTotal cars in database: {Car.objects.count()}")

if __name__ == '__main__':
    populate_cars()
