import logging
import json
import re
import os
import traceback
import threading
import requests
from datetime import date
from django.db import transaction
from django.core.mail import send_mail
from django.conf import settings
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.exceptions import ValidationError
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from .models import Customer, HotelTab, Bill, MenuItem, Booking, Contact, Review
from .serializers import BillSerializer, MenuItemSerializer, BookingSerializer, ContactSerializer, HotelTabSerializer, ReviewSerializer

logger = logging.getLogger(__name__)

# ==============================================================================
# TELEGRAM & EMAIL NOTIFICATION ENGINE (ASYNCHRONOUS)
# ==============================================================================
def send_email_async(subject, body, from_email, recipient_list):
    try:
        send_mail(subject=subject, message=body, from_email=from_email, recipient_list=recipient_list, fail_silently=True)
    except Exception as e:
        logger.error(f"Email Delivery Failed: {e}")

def send_telegram_async(text):
    bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
    chat_id = os.environ.get('TELEGRAM_CHAT_ID')
    if not bot_token or not chat_id:
        return
    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    try:
        requests.post(url, json={"chat_id": chat_id, "text": text, "parse_mode": "HTML"}, timeout=5)
    except Exception as e:
        logger.error(f"Telegram Delivery Failed: {e}")

def notify_owner(event_type):
    OWNER_EMAIL = os.environ.get('OWNER_EMAIL', 'your-restaurant-email@gmail.com')
    
    email_alerts = {
        'order': {'subject': '🚨 ACTION REQUIRED: New Food Order', 'body': 'A new food order has just been placed.'},
        'booking': {'subject': '📅 ACTION REQUIRED: New Table Reservation', 'body': 'A customer has requested a table reservation.'},
        'message': {'subject': '✉️ New Customer Message', 'body': 'You have received a new message via the website contact form.'},
        'review': {'subject': '⭐ New Review Pending Approval', 'body': 'A customer submitted a new review pending approval.'}
    }
    
    telegram_alerts = {
        'order': '🚨 <b>NEW ORDER RECEIVED</b>\nA customer has placed an order. Open the Admin Panel.',
        'booking': '📅 <b>NEW RESERVATION</b>\nA new table booking is waiting for your approval.',
        'message': '✉️ <b>NEW MESSAGE</b>\nYou have a new message in your Contact Inbox.',
        'review': '⭐ <b>NEW REVIEW</b>\nA new customer review is pending approval.'
    }
    
    if event_type in email_alerts:
        threading.Thread(target=send_email_async, args=(email_alerts[event_type]['subject'], email_alerts[event_type]['body'], settings.EMAIL_HOST_USER, [OWNER_EMAIL])).start()
    
    if event_type in telegram_alerts:
        threading.Thread(target=send_telegram_async, args=(telegram_alerts[event_type],)).start()

def trigger_admin_websocket(event_type):
    try:
        channel_layer = get_channel_layer()
        if channel_layer:
            async_to_sync(channel_layer.group_send)("admin_notifications", {"type": "admin_alert", "event": event_type})
    except Exception as e:
        logger.warning(f"Admin WebSocket skipped: {e}")
    notify_owner(event_type)


class CheckoutView(APIView):
    permission_classes = [AllowAny] 

    @transaction.atomic 
    def post(self, request):
        data = request.data
        idempotency_key = data.get('idempotency_key')

        if idempotency_key:
            existing_bill = Bill.objects.filter(idempotency_key=idempotency_key).first()
            if existing_bill:
                return Response({"message": "Order already processed", "order_id": existing_bill.id, "status": existing_bill.status}, status=status.HTTP_200_OK)

        try:
            items = json.loads(data.get('items_json', '[]'))
        except json.JSONDecodeError:
            return Response({"error": "Invalid items format."}, status=status.HTTP_400_BAD_REQUEST)
            
        calculated_total = 0
        for item in items:
            menu_item = MenuItem.objects.filter(id=item.get('id')).first()
            
            if not menu_item:
                return Response({"error": f"Item '{item.get('name')}' not found on the menu."}, status=status.HTTP_400_BAD_REQUEST)
            if not menu_item.is_available:
                return Response({"error": f"'{menu_item.name}' is out of stock and cannot be ordered."}, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                quantity = int(item.get('quantity', 1))
                if quantity <= 0: return Response({"error": "Quantity must be at least 1."}, status=status.HTTP_400_BAD_REQUEST)
            except ValueError: return Response({"error": "Invalid quantity format."}, status=status.HTTP_400_BAD_REQUEST)

            calculated_total += float(menu_item.price) * quantity
        
        true_total_amount = calculated_total
        order_type = data.get('order_type', 'Standard')

        if order_type == 'Hotel':
            room_number = str(data.get('room_number'))
            VALID_ROOMS = ['101', '102', '103', '104', '105', '106', '107', '108']
            if room_number not in VALID_ROOMS:
                return Response({"error": f"Invalid Room Number. Valid rooms are {', '.join(VALID_ROOMS)}."}, status=status.HTTP_400_BAD_REQUEST)

            if Bill.objects.filter(hotel_tab__room_number=room_number, status='Pending').exists():
                return Response({"error": "This room already has a pending order."}, status=status.HTTP_429_TOO_MANY_REQUESTS)

            guest_name = data.get('guest_name', '').strip()
            guest_phone = data.get('guest_phone', '').strip()
            
            # FIX: Updated regex to allow hyphens and dots in names
            if len(guest_name) < 3 or not re.match(r'^[A-Za-z\s\-\.]+$', guest_name):
                return Response({"error": "Please provide a valid guest name (letters, spaces, hyphens)."}, status=status.HTTP_400_BAD_REQUEST)
            
            # Note: Hotel guests might not have a phone number depending on your front desk flow, but if they do, validate it.
            if guest_phone and not re.match(r'^[6-9]\d{9}$', guest_phone):
                return Response({"error": "Please provide a valid 10-digit mobile number."}, status=status.HTTP_400_BAD_REQUEST)

            active_tab, created = HotelTab.objects.get_or_create(
                room_number=room_number, is_active=True, defaults={'guest_name': guest_name, 'guest_phone': guest_phone}
            )

            if not created and (active_tab.guest_name.lower() != guest_name.lower() or active_tab.guest_phone != guest_phone):
                return Response({"error": "Verification failed. Details do not match."}, status=status.HTTP_403_FORBIDDEN)

            bill = Bill.objects.create(hotel_tab=active_tab, order_type='Hotel', items_json=data.get('items_json'), total_amount=true_total_amount, status='Pending', idempotency_key=idempotency_key)
            Contact.objects.create(name=f"Room {room_number} ({guest_name})", email="hotel@highspirits.local", message=f"Room service order #{bill.id} placed.")

            trigger_admin_websocket('order')
            return Response({"order_id": bill.id, "status": bill.status}, status=status.HTTP_201_CREATED)

        else:
            customer_phone = data.get('customer_phone', '').strip()
            if customer_phone != '0000000000' and Bill.objects.filter(customer__phone=customer_phone, status='Pending').exists():
                return Response({"error": "You already have a pending order."}, status=status.HTTP_429_TOO_MANY_REQUESTS)

            customer_name = data.get('customer_name', '').strip()
            
            # FIX: Updated regex to allow hyphens (like "Walk-in Customer")
            if len(customer_name) < 3 or not re.match(r'^[A-Za-z\s\-\.]+$', customer_name):
                return Response({"error": "Please provide a valid name (letters, spaces, hyphens)."}, status=status.HTTP_400_BAD_REQUEST)
            
            if customer_phone != '0000000000' and not re.match(r'^[6-9]\d{9}$', customer_phone):
                return Response({"error": "Please provide a valid 10-digit mobile number."}, status=status.HTTP_400_BAD_REQUEST)

            customer, _ = Customer.objects.get_or_create(phone=customer_phone, defaults={'name': customer_name})
            bill = Bill.objects.create(customer=customer, order_type='Standard', items_json=data.get('items_json'), total_amount=true_total_amount, status='Pending', idempotency_key=idempotency_key)
            
            trigger_admin_websocket('order')
            return Response({"order_id": bill.id, "status": bill.status}, status=status.HTTP_201_CREATED)


class OrderListDetailView(APIView):
    permission_classes = [IsAuthenticated] 
    def get(self, request, pk=None):
        if pk:
            try: return Response(BillSerializer(Bill.objects.get(pk=pk)).data)
            except Bill.DoesNotExist: return Response(status=status.HTTP_404_NOT_FOUND)
        return Response(BillSerializer(Bill.objects.all().order_by('-created_at')[:200], many=True).data)


class OrderStatusView(APIView):
    permission_classes = [AllowAny]
    def get(self, request, pk):
        try: return Response({"status": Bill.objects.get(pk=pk).status})
        except Bill.DoesNotExist: return Response(status=status.HTTP_404_NOT_FOUND)

    def put(self, request, pk):
        try:
            bill = Bill.objects.get(pk=pk)
            new_status = request.data.get('status')
            if not request.user.is_authenticated:
                if not (bill.status == 'Accepted' and new_status == 'Paid & Preparing'):
                    return Response({"error": "Unauthorized status transition."}, status=status.HTTP_403_FORBIDDEN)

            bill.status = new_status
            bill.save()
            try:
                channel_layer = get_channel_layer()
                if channel_layer: async_to_sync(channel_layer.group_send)(f"order_{bill.id}", {"type": "order_status_message", "status": bill.status})
            except Exception as e: logger.warning(f"WebSocket skipped: {e}")
            return Response({"status": bill.status})
        except Bill.DoesNotExist: return Response(status=status.HTTP_404_NOT_FOUND)
        except Exception as e: return Response({"error": f"Backend Crash: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all().order_by('-date', '-time')
    serializer_class = BookingSerializer
    
    def get_permissions(self): 
        return [AllowAny()] if self.action in ['create', 'retrieve'] else [IsAuthenticated()]
        
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        return Response(self.get_serializer(instance).data) if request.user.is_authenticated else Response({"status": instance.status})
    
    def perform_create(self, serializer):
        if serializer.validated_data.get('date') < date.today(): raise ValidationError({"error": "Cannot book in the past."})
        serializer.save(status='Pending')
        trigger_admin_websocket('booking')

    def perform_update(self, serializer):
        booking = serializer.save()
        try:
            channel_layer = get_channel_layer()
            if channel_layer: async_to_sync(channel_layer.group_send)(f"booking_{booking.id}", {"type": "booking_status_message", "status": booking.status})
        except Exception: pass

    def perform_destroy(self, instance):
        booking_id = instance.id
        super().perform_destroy(instance)
        try:
            channel_layer = get_channel_layer()
            if channel_layer: async_to_sync(channel_layer.group_send)(f"booking_{booking_id}", {"type": "booking_status_message", "status": "Rejected"})
        except Exception: pass


class ContactViewSet(viewsets.ModelViewSet):
    queryset = Contact.objects.all().order_by('-created_at')
    serializer_class = ContactSerializer
    def get_permissions(self): return [AllowAny()] if self.request.method == 'POST' else [IsAuthenticated()]
    def perform_create(self, serializer):
        serializer.save()
        trigger_admin_websocket('message')


class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    def get_permissions(self): return [AllowAny()] if self.action in ['create', 'list'] else [IsAuthenticated()]
    def get_queryset(self):
        return Review.objects.all().order_by('-created_at') if self.request.user.is_staff else Review.objects.filter(is_approved=True).order_by('-created_at')
    def perform_create(self, serializer):
        serializer.save(is_approved=False)
        trigger_admin_websocket('review')


class HotelTabViewSet(viewsets.ModelViewSet):
    queryset = HotelTab.objects.all().order_by('-created_at')
    serializer_class = HotelTabSerializer
    permission_classes = [IsAuthenticated] 

class MenuItemViewSet(viewsets.ModelViewSet):
    queryset = MenuItem.objects.all()
    serializer_class = MenuItemSerializer
    def get_permissions(self): return [AllowAny()] if self.request.method == 'GET' else [IsAuthenticated()]