from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

# FIXED: Removed VerifyPaymentView from the import list
from api.views import CheckoutView, OrderListDetailView, OrderStatusView, HotelTabViewSet, MenuItemViewSet, BookingViewSet, ContactViewSet, ReviewViewSet

router = DefaultRouter()
router.register(r'menu', MenuItemViewSet)
router.register(r'bookings', BookingViewSet)
router.register(r'contact', ContactViewSet)
router.register(r'hotel-tabs', HotelTabViewSet)
router.register(r'reviews', ReviewViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('orders/checkout/', CheckoutView.as_view()),
    path('orders/', OrderListDetailView.as_view()),
    path('orders/<int:pk>/', OrderListDetailView.as_view()),
    path('orders/<int:pk>/status/', OrderStatusView.as_view()),
    # Ensure there is no path('orders/verify/', VerifyPaymentView.as_view()) here
    path('', include(router.urls)),
]