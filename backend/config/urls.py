from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from api.views import (
    BookingViewSet,
    CheckoutView,
    ContactViewSet,
    CreatePaymentOrderView,
    HealthCheckView,
    HotelTabViewSet,
    MenuItemViewSet,
    OrderListDetailView,
    OrderStatusView,
    RazorpayWebhookView,
    ReviewViewSet,
    VerifyPaymentView,
)

router = DefaultRouter()
router.register(r'menu', MenuItemViewSet)
router.register(r'bookings', BookingViewSet)
router.register(r'contact', ContactViewSet)
router.register(r'hotel-tabs', HotelTabViewSet)

# basename is required here because ReviewViewSet builds its queryset
# dynamically in get_queryset() rather than declaring a static `queryset`
router.register(r'reviews', ReviewViewSet, basename='reviews')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('health/', HealthCheckView.as_view()),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('orders/checkout/', CheckoutView.as_view()),
    path('orders/', OrderListDetailView.as_view()),
    path('orders/<uuid:pk>/', OrderListDetailView.as_view()),
    path('orders/<uuid:pk>/status/', OrderStatusView.as_view()),
    path('orders/<uuid:pk>/create-payment/', CreatePaymentOrderView.as_view()),
    path('orders/<uuid:pk>/verify-payment/', VerifyPaymentView.as_view()),
    path('payments/razorpay/webhook/', RazorpayWebhookView.as_view()),
    path('', include(router.urls)),
]