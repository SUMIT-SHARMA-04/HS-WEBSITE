from django.urls import re_path
from api import consumers

websocket_urlpatterns = [
    re_path(r'ws/orders/(?P<order_id>\w+)/$', consumers.OrderStatusConsumer.as_asgi()),
    re_path(r'ws/bookings/(?P<booking_id>\w+)/$', consumers.BookingStatusConsumer.as_asgi()),
    re_path(r'ws/admin-notifications/$', consumers.AdminNotificationConsumer.as_asgi()),
]