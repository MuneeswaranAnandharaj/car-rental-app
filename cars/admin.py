from django.contrib import admin
from .models import Car, Booking, CustomUser


@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff')
    search_fields = ('username', 'email')


@admin.register(Car)
class CarAdmin(admin.ModelAdmin):
    list_display = ('make', 'model', 'year', 'category', 'price_per_day', 'is_available')
    list_filter = ('category', 'is_available', 'year')
    search_fields = ('make', 'model')
    list_editable = ('price_per_day', 'is_available')
    
    def image_preview(self, obj):
        if obj.image:
            return f'<img src="{obj.image.url}" width="100" />'
        return 'No image'
    image_preview.allow_tags = True


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'car', 'start_date', 'end_date', 'total_price', 'created_at')
    list_filter = ('start_date', 'end_date', 'created_at')
    search_fields = ('user__username', 'car__make', 'car__model')
    raw_id_fields = ('user', 'car')
