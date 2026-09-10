from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from api.views import CheckoutView, OrderListDetailView, OrderStatusView, HotelTabViewSet, MenuItemViewSet, BookingViewSet, ContactViewSet, ReviewViewSet

router = DefaultRouter()
router.register(r'menu', MenuItemViewSet)
router.register(r'bookings', BookingViewSet)
router.register(r'contact', ContactViewSet)
router.register(r'hotel-tabs', HotelTabViewSet)

# FIXED: Added basename='reviews'
router.register(r'reviews', ReviewViewSet, basename='reviews')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('orders/checkout/', CheckoutView.as_view()),
    path('orders/', OrderListDetailView.as_view()),
    path('orders/<uuid:pk>/', OrderListDetailView.as_view()),
    path('orders/<uuid:pk>/status/', OrderStatusView.as_view()),
    path('', include(router.urls)),
]