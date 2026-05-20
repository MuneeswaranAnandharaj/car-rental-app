from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework.authtoken.serializers import AuthTokenSerializer
from .models import Car, Booking

User = get_user_model()


class UserListSerializer(serializers.ModelSerializer):
    total_bookings = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_staff', 'date_joined', 'total_bookings']

    def get_total_bookings(self, obj):
        return obj.bookings.count()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'password']
        extra_kwargs = {'password': {'write_only': True}}
    
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )
        return user


class CarSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Car
        fields = ['id', 'make', 'model', 'year', 'category', 'price_per_day', 'is_available', 'image', 'image_url']
        read_only_fields = ['id', 'image_url']
    
    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class BookingSerializer(serializers.ModelSerializer):
    car_details = CarSerializer(source='car', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Booking
        fields = ['id', 'user', 'username', 'car', 'car_details', 'start_date', 'end_date', 'total_price', 'pickup_address', 'pickup_latitude', 'pickup_longitude', 'phone', 'driver_license', 'payment_method', 'payment_status', 'payment_details', 'transaction_id', 'created_at']
        read_only_fields = ['id', 'user', 'total_price', 'payment_status', 'created_at']
    
    def validate(self, data):
        if data['start_date'] >= data['end_date']:
            raise serializers.ValidationError("End date must be after start date")
        return data
