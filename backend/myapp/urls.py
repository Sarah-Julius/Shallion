from django.contrib import admin
from django.urls import include, path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.routers import DefaultRouter
from core.views import ApplicationViewSet, BookingViewSet, CreatePaymentIntentView, HealthView, MatchView, MeView, MessageViewSet, PaymentHistoryView, RegisterView, ReviewViewSet, ServiceRequestViewSet, StripeWebhookView

router = DefaultRouter()
router.register('requests', ServiceRequestViewSet, basename='request')
router.register('applications', ApplicationViewSet, basename='application')
router.register('bookings', BookingViewSet, basename='booking')
router.register('messages', MessageViewSet, basename='message')
router.register('reviews', ReviewViewSet, basename='review')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/register/', RegisterView.as_view()),
    path('api/health/', HealthView.as_view()),
    path('api/auth/login/', TokenObtainPairView.as_view()),
    path('api/auth/refresh/', TokenRefreshView.as_view()),
    path('api/auth/me/', MeView.as_view()),
    path('api/payments/create-intent/', CreatePaymentIntentView.as_view()),
    path('api/payments/webhook/', StripeWebhookView.as_view()),
    path('api/payments/', PaymentHistoryView.as_view()),
    path('api/matches/', MatchView.as_view()),
    path('api/', include(router.urls)),
]
