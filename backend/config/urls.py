from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from api.views import CheckoutView, VerifyPaymentView, OrderListDetailView, OrderStatusView, HotelTabViewSet, MenuItemViewSet, BookingViewSet, ContactViewSet, ReviewViewSet

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
    path('orders/verify-payment/', VerifyPaymentView.as_view()), # <--- NEW ENDPOINT ADDED HERE
    path('orders/', OrderListDetailView.as_view()),
    path('orders/<int:pk>/', OrderListDetailView.as_view()),
    path('orders/<int:pk>/status/', OrderStatusView.as_view()),
    path('', include(router.urls)),
]