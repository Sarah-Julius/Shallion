from django.contrib.auth.models import User
from django.db import transaction
from rest_framework import serializers

from .models import Application, Availability, Booking, Interest, Message, Payment, Review, ServiceRequest, UserInterest, UserProfile


class InterestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Interest
        fields = ('id', 'name')


class AvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Availability
        fields = ('id', 'day', 'time_slot')


class UserProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    interests = serializers.SerializerMethodField()
    availability = AvailabilitySerializer(source='availability_set', many=True, read_only=True)

    class Meta:
        model = UserProfile
        fields = ('id', 'username', 'email', 'role', 'full_name', 'phone', 'location', 'bio', 'profile_photo', 'is_verified', 'registrant_type', 'carer_name', 'carer_relationship', 'gp_certificate', 'has_paid', 'pvg_number', 'interests', 'availability', 'created_at')
        read_only_fields = ('is_verified', 'has_paid', 'created_at')

    def get_interests(self, obj):
        return InterestSerializer(Interest.objects.filter(userinterest__user=obj).order_by('name'), many=True).data


class RegistrationSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    role = serializers.ChoiceField(choices=UserProfile.ROLE_CHOICES)
    full_name = serializers.CharField(max_length=200)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    location = serializers.CharField(max_length=200, required=False, allow_blank=True)
    bio = serializers.CharField(required=False, allow_blank=True)
    registrant_type = serializers.ChoiceField(choices=UserProfile.REGISTRANT_CHOICES, required=False, allow_blank=True)
    carer_name = serializers.CharField(required=False, allow_blank=True)
    carer_relationship = serializers.CharField(required=False, allow_blank=True)
    pvg_number = serializers.CharField(required=False, allow_blank=True)
    interests = serializers.ListField(child=serializers.CharField(max_length=100), required=False, default=list)

    def validate_email(self, value):
        value = value.lower().strip()
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError('An account with this email already exists.')
        return value

    @transaction.atomic
    def create(self, validated_data):
        interests = validated_data.pop('interests', [])
        email = validated_data.pop('email')
        password = validated_data.pop('password')
        user = User.objects.create_user(username=email, email=email, password=password)
        profile = UserProfile.objects.create(user=user, **validated_data)
        for name in interests:
            interest, _ = Interest.objects.get_or_create(name=name.strip())
            UserInterest.objects.get_or_create(user=profile, interest=interest)
        return profile

    def to_representation(self, instance):
        return UserProfileSerializer(instance, context=self.context).data


class ServiceRequestSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.full_name', read_only=True)
    client_location = serializers.CharField(source='client.location', read_only=True)
    class Meta:
        model = ServiceRequest
        fields = '__all__'
        read_only_fields = ('client', 'status', 'created_at')


class ApplicationSerializer(serializers.ModelSerializer):
    volunteer_name = serializers.CharField(source='volunteer.full_name', read_only=True)
    request_details = ServiceRequestSerializer(source='request', read_only=True)
    class Meta:
        model = Application
        fields = '__all__'
        read_only_fields = ('volunteer', 'status', 'applied_at')


class BookingSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.full_name', read_only=True)
    volunteer_name = serializers.CharField(source='volunteer.full_name', read_only=True)
    class Meta:
        model = Booking
        fields = '__all__'
        read_only_fields = ('client', 'volunteer', 'created_at')


class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.full_name', read_only=True)
    receiver_name = serializers.CharField(source='receiver.full_name', read_only=True)
    class Meta:
        model = Message
        fields = '__all__'
        read_only_fields = ('sender', 'sent_at', 'is_read')


class ReviewSerializer(serializers.ModelSerializer):
    reviewer_name = serializers.CharField(source='reviewer.full_name', read_only=True)
    reviewee_name = serializers.CharField(source='reviewee.full_name', read_only=True)
    class Meta:
        model = Review
        fields = '__all__'
        read_only_fields = ('reviewer', 'reviewee', 'created_at')


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ('id', 'amount', 'currency', 'status', 'created_at', 'updated_at')
