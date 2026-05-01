from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CarViewSet, BookingViewSet, register_user, login_user


router = DefaultRouter()
router.register(r'cars', CarViewSet, basename='car')
router.register(r'bookings', BookingViewSet, basename='booking')


urlpatterns = [
    path('', include(router.urls)),
    path('register/', register_user),
    path('api-token-auth/', login_user),
]
