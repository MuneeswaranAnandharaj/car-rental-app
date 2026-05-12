import datetime
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
import os


class CustomUser(AbstractUser):
    """Custom user model extending Django's AbstractUser"""
    class Meta:
        db_table = 'custom_user'
    
    def __str__(self):
        return self.username


class Car(models.Model):
    CATEGORY_CHOICES = [
        ('SEDAN', 'Sedan'),
        ('SUV', 'SUV'),
        ('TRUCK', 'Truck'),
        ('COUPE', 'Coupe'),
        ('HATCHBACK', 'Hatchback'),
        ('VAN', 'Van'),
    ]
    
    make = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    year = models.IntegerField(validators=[
        MinValueValidator(1900),
        MaxValueValidator(datetime.datetime.now().year + 1)
    ])
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    price_per_day = models.DecimalField(max_digits=10, decimal_places=2)
    is_available = models.BooleanField(default=True)
    image = models.ImageField(upload_to='cars/', blank=True, null=True)
    
    class Meta:
        db_table = 'car'
    
    def __str__(self):
        return f"{self.make} {self.model} ({self.year})"


class Booking(models.Model):
    PAYMENT_METHODS = [
        ('CREDIT_CARD', 'Credit Card'),
        ('DEBIT_CARD', 'Debit Card'),
        ('STRIPE', 'Stripe'),
        ('CASH', 'Cash on Pickup'),
        ('BANK_TRANSFER', 'Bank Transfer'),
    ]
    
    PAYMENT_STATUS = [
        ('PENDING', 'Pending'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
        ('REFUNDED', 'Refunded'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='bookings')
    car = models.ForeignKey(Car, on_delete=models.CASCADE, related_name='bookings')
    start_date = models.DateField()
    end_date = models.DateField()
    total_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    pickup_address = models.CharField(max_length=255, blank=True, null=True)
    pickup_latitude = models.DecimalField(max_digits=10, decimal_places=7, blank=True, null=True)
    pickup_longitude = models.DecimalField(max_digits=10, decimal_places=7, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    driver_license = models.CharField(max_length=50, blank=True, null=True)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS, default='CREDIT_CARD')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='PENDING')
    payment_details = models.JSONField(blank=True, null=True)
    transaction_id = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'booking'
        ordering = ['-created_at']
    
    def save(self, *args, **kwargs):
        if self.start_date and self.end_date and self.car:
            duration_days = (self.end_date - self.start_date).days
            if duration_days > 0:
                self.total_price = duration_days * self.car.price_per_day
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"Booking #{self.id} - {self.user.username} - {self.car.make} {self.car.model}"
