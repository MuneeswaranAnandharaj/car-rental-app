from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.db.models import Sum, Count, Q
from .models import Car, Booking
from .serializers import CarSerializer, BookingSerializer, UserSerializer, UserListSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated

User = get_user_model()


class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff


class IsSuperUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_superuser


class CarViewSet(viewsets.ModelViewSet):
    queryset = Car.objects.all()
    serializer_class = CarSerializer
    permission_classes = [IsAdminOrReadOnly]
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        return context
    
    @action(detail=False, methods=['get'])
    def available(self, request):
        available_cars = Car.objects.filter(is_available=True)
        serializer = self.get_serializer(available_cars, many=True)
        return Response(serializer.data)


class BookingViewSet(viewsets.ModelViewSet):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        pickup_address = self.request.data.get('pickup_address', '')
        pickup_latitude = self.request.data.get('pickup_latitude')
        pickup_longitude = self.request.data.get('pickup_longitude')
        phone = self.request.data.get('phone', '')
        driver_license = self.request.data.get('driver_license', '')
        payment_method = self.request.data.get('payment_method', 'CREDIT_CARD')
        payment_status = self.request.data.get('payment_status', 'PENDING')
        payment_details = self.request.data.get('payment_details')
        transaction_id = self.request.data.get('transaction_id', '')
        
        serializer.save(
            user=self.request.user,
            pickup_address=pickup_address,
            pickup_latitude=pickup_latitude,
            pickup_longitude=pickup_longitude,
            phone=phone,
            driver_license=driver_license,
            payment_method=payment_method,
            payment_status=payment_status,
            payment_details=payment_details,
            transaction_id=transaction_id,
        )
    
    def destroy(self, request, *args, **kwargs):
        booking = self.get_object()
        if booking.user != request.user:
            return Response({'error': 'You can only cancel your own bookings'}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    old = request.data.get('old_password')
    new = request.data.get('new_password')
    if not old or not new:
        return Response({'error': 'Old and new password required'}, status=400)
    if not request.user.check_password(old):
        return Response({'error': 'Current password is incorrect'}, status=400)
    if len(new) < 6:
        return Response({'error': 'New password must be at least 6 characters'}, status=400)
    request.user.set_password(new)
    request.user.save()
    return Response({'message': 'Password changed successfully'})


@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password(request):
    username = request.data.get('username')
    new_password = request.data.get('new_password')
    if not username or not new_password:
        return Response({'error': 'Username and new password required'}, status=400)
    if len(new_password) < 6:
        return Response({'error': 'Password must be at least 6 characters'}, status=400)
    try:
        user = User.objects.get(username=username)
        user.set_password(new_password)
        user.save()
        return Response({'message': 'Password reset successfully! Please sign in.'})
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)


@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        user.set_password(request.data.get('password'))
        user.save()
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user_id': user.id,
            'username': user.username,
            'email': user.email,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser,
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_dashboard(request):
    total_cars = Car.objects.count()
    total_users = User.objects.count()
    total_bookings = Booking.objects.count()
    total_revenue = Booking.objects.filter(payment_status='COMPLETED').aggregate(s=Sum('total_price'))['s'] or 0
    pending_bookings = Booking.objects.filter(payment_status='PENDING').count()
    active_cars = Car.objects.filter(is_available=True).count()

    return Response({
        'total_cars': total_cars,
        'total_users': total_users,
        'total_bookings': total_bookings,
        'total_revenue': float(total_revenue),
        'pending_bookings': pending_bookings,
        'active_cars': active_cars,
    })


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_bookings(request):
    bookings = Booking.objects.select_related('user', 'car').all().order_by('-created_at')
    serializer = BookingSerializer(bookings, many=True)
    return Response(serializer.data)


@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def admin_update_booking(request, pk):
    try:
        booking = Booking.objects.get(pk=pk)
    except Booking.DoesNotExist:
        return Response({'error': 'Booking not found'}, status=404)
    payment_status = request.data.get('payment_status')
    if payment_status:
        booking.payment_status = payment_status
        booking.save()
    return Response(BookingSerializer(booking).data)


@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def admin_delete_booking(request, pk):
    try:
        booking = Booking.objects.get(pk=pk)
    except Booking.DoesNotExist:
        return Response({'error': 'Booking not found'}, status=404)
    booking.delete()
    return Response({'message': 'Booking deleted'})


@api_view(['GET'])
@permission_classes([IsSuperUser])
def admin_users(request):
    users = User.objects.all().order_by('-date_joined')
    serializer = UserListSerializer(users, many=True)
    return Response(serializer.data)


@api_view(['PATCH'])
@permission_classes([IsSuperUser])
def admin_update_user(request, pk):
    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)
    is_staff = request.data.get('is_staff')
    if is_staff is not None:
        if int(pk) == request.user.id and is_staff is False:
            return Response({'error': 'You cannot revoke your own admin'}, status=400)
        user.is_staff = is_staff
        user.save()
    return Response(UserListSerializer(user).data)


@api_view(['DELETE'])
@permission_classes([IsSuperUser])
def admin_delete_user(request, pk):
    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)
    if user.is_superuser:
        return Response({'error': 'Cannot delete superuser'}, status=400)
    user.delete()
    return Response({'message': 'User deleted'})


@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    user = authenticate(username=username, password=password)
    if user:
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user_id': user.id,
            'username': user.username,
            'email': user.email,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser,
        })
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)



