import stripe
from django.conf import settings
from django.db import transaction
from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Application, Booking, Message, Payment, Review, ServiceRequest, UserProfile
from .serializers import ApplicationSerializer, BookingSerializer, MessageSerializer, PaymentSerializer, RegistrationSerializer, ReviewSerializer, ServiceRequestSerializer, UserProfileSerializer

stripe.api_key = settings.STRIPE_SECRET_KEY


def current_profile(request):
    try:
        return request.user.userprofile
    except UserProfile.DoesNotExist as exc:
        raise ValidationError('Complete your profile before using this feature.') from exc


class RegisterView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = RegistrationSerializer


class HealthView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def get(self, request):
        return Response({'status': 'ok'})


class MeView(APIView):
    def get(self, request):
        return Response(UserProfileSerializer(current_profile(request), context={'request': request}).data)

    def patch(self, request):
        profile = current_profile(request)
        serializer = UserProfileSerializer(profile, data=request.data, partial=True, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class ServiceRequestViewSet(viewsets.ModelViewSet):
    serializer_class = ServiceRequestSerializer

    def get_queryset(self):
        profile = current_profile(self.request)
        queryset = ServiceRequest.objects.select_related('client').order_by('date_needed', 'time_needed')
        return queryset.filter(client=profile) if profile.role == 'client' else queryset.filter(status='open')

    def perform_create(self, serializer):
        profile = current_profile(self.request)
        if profile.role != 'client':
            raise PermissionDenied('Only clients can create support requests.')
        serializer.save(client=profile)


class ApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = ApplicationSerializer

    def get_queryset(self):
        profile = current_profile(self.request)
        queryset = Application.objects.select_related('request__client', 'volunteer').order_by('-applied_at')
        return queryset.filter(volunteer=profile) if profile.role == 'volunteer' else queryset.filter(request__client=profile)

    def perform_create(self, serializer):
        profile = current_profile(self.request)
        if profile.role != 'volunteer':
            raise PermissionDenied('Only volunteers can apply to support requests.')
        if serializer.validated_data['request'].status != 'open':
            raise ValidationError('This request is no longer open.')
        serializer.save(volunteer=profile)

    @action(detail=True, methods=['post'])
    @transaction.atomic
    def accept(self, request, pk=None):
        application = self.get_object()
        profile = current_profile(request)
        if profile != application.request.client:
            raise PermissionDenied('Only the client can accept an application.')
        if application.request.status != 'open':
            raise ValidationError('This request has already been matched.')
        application.status = 'accepted'
        application.save(update_fields=['status'])
        Application.objects.filter(request=application.request).exclude(pk=application.pk).update(status='rejected')
        application.request.status = 'matched'
        application.request.save(update_fields=['status'])
        booking = Booking.objects.create(client=application.request.client, volunteer=application.volunteer, service_type=application.request.service_type, date=application.request.date_needed, time=application.request.time_needed, notes=application.request.description)
        return Response(BookingSerializer(booking).data, status=status.HTTP_201_CREATED)


class BookingViewSet(viewsets.ModelViewSet):
    serializer_class = BookingSerializer
    http_method_names = ['get', 'patch', 'head', 'options']

    def get_queryset(self):
        profile = current_profile(self.request)
        return Booking.objects.filter(Q(client=profile) | Q(volunteer=profile)).select_related('client', 'volunteer').order_by('date', 'time')


class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    http_method_names = ['get', 'post', 'head', 'options']

    def get_queryset(self):
        profile = current_profile(self.request)
        return Message.objects.filter(Q(sender=profile) | Q(receiver=profile)).select_related('sender', 'receiver').order_by('sent_at')

    def perform_create(self, serializer):
        profile = current_profile(self.request)
        receiver = serializer.validated_data['receiver']
        if not Booking.objects.filter(Q(client=profile, volunteer=receiver) | Q(client=receiver, volunteer=profile)).exists():
            raise PermissionDenied('Messaging is available only between matched clients and volunteers.')
        serializer.save(sender=profile)


class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    http_method_names = ['get', 'post', 'head', 'options']

    def get_queryset(self):
        profile = current_profile(self.request)
        return Review.objects.filter(Q(reviewer=profile) | Q(reviewee=profile)).select_related('reviewer', 'reviewee', 'booking')

    def perform_create(self, serializer):
        profile = current_profile(self.request)
        booking = serializer.validated_data['booking']
        if booking.status != 'completed' or profile not in (booking.client, booking.volunteer):
            raise PermissionDenied('Reviews are available after your completed booking.')
        serializer.save(reviewer=profile, reviewee=booking.volunteer if profile == booking.client else booking.client)


class MatchView(APIView):
    def get(self, request):
        profile = current_profile(request)
        if profile.role != 'client':
            raise PermissionDenied('Only clients can view volunteer matches.')
        interest_ids = profile.userinterest_set.values_list('interest_id', flat=True)
        volunteers = UserProfile.objects.filter(role='volunteer', is_verified=True).prefetch_related('userinterest_set__interest')
        ranked = sorted(volunteers, key=lambda item: item.userinterest_set.filter(interest_id__in=interest_ids).count(), reverse=True)
        return Response(UserProfileSerializer(ranked[:20], many=True, context={'request': request}).data)


class CreatePaymentIntentView(APIView):
    def post(self, request):
        profile = current_profile(request)
        if not settings.STRIPE_SECRET_KEY:
            raise ValidationError('Payments are not configured.')
        amount = settings.MEMBERSHIP_FEE_PENCE
        intent = stripe.PaymentIntent.create(amount=amount, currency='gbp', automatic_payment_methods={'enabled': True}, metadata={'profile_id': profile.id, 'user_id': request.user.id})
        Payment.objects.update_or_create(stripe_payment_intent_id=intent.id, defaults={'user': profile, 'amount': amount, 'currency': 'gbp', 'status': intent.status})
        return Response({'clientSecret': intent.client_secret, 'amount': amount, 'currency': 'gbp'})


class StripeWebhookView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        signature = request.headers.get('Stripe-Signature', '')
        try:
            event = stripe.Webhook.construct_event(request.body, signature, settings.STRIPE_WEBHOOK_SECRET)
        except (ValueError, stripe.error.SignatureVerificationError):
            return Response(status=status.HTTP_400_BAD_REQUEST)
        if event['type'] in {'payment_intent.succeeded', 'payment_intent.payment_failed'}:
            intent = event['data']['object']
            payment = get_object_or_404(Payment, stripe_payment_intent_id=intent['id'])
            payment.status = intent['status']
            payment.save(update_fields=['status', 'updated_at'])
            if intent['status'] == 'succeeded':
                payment.user.has_paid = True
                payment.user.save(update_fields=['has_paid'])
        return Response(status=status.HTTP_200_OK)


class PaymentHistoryView(generics.ListAPIView):
    serializer_class = PaymentSerializer

    def get_queryset(self):
        return Payment.objects.filter(user=current_profile(self.request)).order_by('-created_at')
