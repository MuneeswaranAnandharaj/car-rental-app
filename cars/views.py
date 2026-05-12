from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from .models import Car, Booking
from .serializers import CarSerializer, BookingSerializer, UserSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny

User = get_user_model()


class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff


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
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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
        })
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)



