from django.contrib.auth.models import User
from rest_framework import generics, permissions, serializers
from rest_framework.response import Response
from rest_framework.views import APIView
import stripe
from django.conf import settings

stripe.api_key = settings.STRIPE_SECRET_KEY

# ── Serializer ────────────────────────────────────
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)

# ── Auth Views ────────────────────────────────────
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

class MeView(APIView):
    def get(self, request):
        return Response({
            'username': request.user.username,
            'email': request.user.email,
        })

# ── Payment View ──────────────────────────────────
class CreatePaymentIntentView(APIView):
    def post(self, request):
        amount = request.data.get('amount', 2000)  # amount in cents
        intent = stripe.PaymentIntent.create(
            amount=amount,
            currency='usd',
            metadata={'user_id': request.user.id}
        )
        return Response({'clientSecret': intent.client_secret})