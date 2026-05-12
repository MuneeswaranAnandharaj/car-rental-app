import os, django, urllib.request, ssl
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'car_rental.settings')
django.setup()

from cars.models import Car
from django.core.files import File

ssl._create_default_https_context = ssl._create_unverified_context
os.makedirs('media/cars', exist_ok=True)

cars_data = [
    ('Toyota', 'Camry', 2023, 'SEDAN', 65.00, 'YPfnvLc3bbQ', 'toyota-camry.jpg', False),
    ('Honda', 'CR-V', 2022, 'SUV', 85.00, 'R8ltKbxMC50', 'honda-crv.jpg', False),
    ('Ford', 'Mustang', 2023, 'COUPE', 120.00, 'N9Pf2J656aQ', 'ford-mustang.jpg', False),
    ('Toyota', 'Corolla', 2022, 'SEDAN', 55.00, '1623869675781-80aa31012a5a', 'toyota-corolla.jpg', True),
    ('BMW', '3 Series', 2023, 'SEDAN', 150.00, 'fiEhVRWA5d0', 'bmw-3series.jpg', False),
    ('Tesla', 'Model 3', 2023, 'SEDAN', 130.00, 'zSeZzS1bCq8', 'tesla-model3.jpg', False),
    ('Jeep', 'Wrangler', 2022, 'SUV', 110.00, 'sBPnD3jzQ7g', 'jeep-wrangler.jpg', False),
    ('Chevrolet', 'Tahoe', 2023, 'SUV', 125.00, 'yt5ddpLFS7Y', 'chevrolet-tahoe.jpg', False),
    ('Mercedes-Benz', 'C-Class', 2023, 'SEDAN', 140.00, '3mdtfret-6o', 'mercedes-cclass.jpg', False),
    ('Audi', 'Q5', 2023, 'SUV', 135.00, 'rX1t3c6Llr8', 'audi-q5.jpg', False),
    ('Nissan', '370Z', 2023, 'COUPE', 115.00, 'mDjCGBNUZK0', 'nissan-370z.jpg', False),
    ('Porsche', '911', 2024, 'COUPE', 250.00, 'Qw8WpzRtI0M', 'porsche-911.jpg', False),
    ('Range Rover', 'Velar', 2023, 'SUV', 180.00, 'wrRhFFTySnc', 'range-rover.jpg', False),
    ('Chevrolet', 'Camaro', 2023, 'COUPE', 130.00, 'OVbxRFNqQuU', 'chevrolet-camaro.jpg', False),
    ('Hyundai', 'Tucson', 2023, 'SUV', 75.00, '9TUHjKs81I8', 'hyundai-tucson.jpg', False),
]

def download(photo_id, dest, use_direct):
    if use_direct:
        url = f'https://images.unsplash.com/photo-{photo_id}?auto=format&fit=crop&w=800&q=80'
    else:
        url = f'https://unsplash.com/photos/{photo_id}/download?force=true&w=800'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=60) as r:
        data = r.read()
        with open(dest, 'wb') as f:
            f.write(data)

# Clean old images
for f in os.listdir('media/cars'):
    os.remove(os.path.join('media/cars', f))

Car.objects.all().delete()

for make, model, year, cat, price, photo_id, fname, use_direct in cars_data:
    dest = f'media/cars/{fname}'
    download(photo_id, dest, use_direct)
    car = Car.objects.create(make=make, model=model, year=year, category=cat, price_per_day=price, is_available=True)
    with open(dest, 'rb') as f:
        car.image.save(fname, File(f))
        car.save()
    print(f'{make} {model}')

print(f'\nTotal: {Car.objects.count()} cars')
