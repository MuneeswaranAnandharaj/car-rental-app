from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CarViewSet, BookingViewSet, register_user, login_user, change_password, admin_dashboard, admin_bookings, admin_update_booking, admin_delete_booking, admin_users, admin_update_user, admin_delete_user


router = DefaultRouter()
router.register(r'cars', CarViewSet, basename='car')
router.register(r'bookings', BookingViewSet, basename='booking')


urlpatterns = [
    path('', include(router.urls)),
    path('register/', register_user),
    path('api-token-auth/', login_user),
    path('change-password/', change_password),
    path('admin/dashboard/', admin_dashboard),
    path('admin/bookings/', admin_bookings),
    path('admin/bookings/<int:pk>/', admin_update_booking),
    path('admin/bookings/<int:pk>/delete/', admin_delete_booking),
    path('admin/users/', admin_users),
    path('admin/users/<int:pk>/', admin_update_user),
    path('admin/users/<int:pk>/delete/', admin_delete_user),
]
