import hashlib
import hmac
import json
import logging
import os
import re
import threading
from datetime import date

import razorpay
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.conf import settings
from django.core.mail import send_mail
from django.db import IntegrityError, transaction
from rest_framework import status, viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Bill, Booking, Contact, Customer, HotelTab, MenuItem, Review
from .serializers import (
    BillSerializer,
    BookingSerializer,
    ContactSerializer,
    HotelTabSerializer,
    MenuItemSerializer,
    ReviewSerializer,
)

logger = logging.getLogger(__name__)


def get_razorpay_client():
    if not (settings.RAZORPAY_KEY_ID and settings.RAZORPAY_KEY_SECRET):
        return None
    return razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))


def send_email_task(subject, body, from_email, recipient_list):
    if not from_email:
        logger.error("Email Delivery Skipped: DEFAULT_FROM_EMAIL is not configured in environment.")
        return

    try:
        sent_count = send_mail(
            subject=subject,
            message=body,
            from_email=from_email,
            recipient_list=recipient_list,
            fail_silently=False, 
        )
        if sent_count:
            logger.info(f"Email successfully sent to {recipient_list}")
        else:
            logger.error(f"Email NOT sent to {recipient_list} (send_mail returned 0)")
    except Exception as e:
        logger.error(f"Email Delivery Failed: {e}")

def notify_owner(event_type):
    OWNER_EMAIL = os.environ.get('OWNER_EMAIL', settings.DEFAULT_FROM_EMAIL)
    
    email_alerts = {
        'order': {'subject': '🚨 ACTION REQUIRED: New Food Order', 'body': 'A new food order has just been placed. Open the Admin Panel to review.'},
        'booking': {'subject': '📅 ACTION REQUIRED: New Table Reservation', 'body': 'A customer has requested a table reservation.'},
        'message': {'subject': '✉️ New Customer Message', 'body': 'You have received a new message via the website contact form.'},
        'review': {'subject': '⭐ New Review Pending Approval', 'body': 'A customer submitted a new review pending approval.'}
    }
    
    if event_type in email_alerts:
        threading.Thread(
            target=send_email_task,
            args=(
                email_alerts[event_type]['subject'], 
                email_alerts[event_type]['body'], 
                settings.DEFAULT_FROM_EMAIL, 
                [OWNER_EMAIL]
            )
        ).start()

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

    def _price_items(self, items_raw):
        try:
            items = json.loads(items_raw or '[]')
        except json.JSONDecodeError:
            return None, None, Response({"error": "Invalid items format."}, status=status.HTTP_400_BAD_REQUEST)

        if not items:
            return None, None, Response({"error": "Your order has no items."}, status=status.HTTP_400_BAD_REQUEST)

        total = 0
        for item in items:
            item_id = item.get('id')
            if item_id:
                menu_item = MenuItem.objects.filter(id=item_id).first()
            else:
                menu_item = MenuItem.objects.filter(name=item.get('name')).first()

            if not menu_item:
                return None, None, Response({"error": f"Item '{item.get('name')}' not found on the menu."}, status=status.HTTP_400_BAD_REQUEST)
            if not menu_item.is_available:
                return None, None, Response({"error": f"'{menu_item.name}' is out of stock and cannot be ordered."}, status=status.HTTP_400_BAD_REQUEST)

            try:
                quantity = int(item.get('quantity', 1))
            except (TypeError, ValueError):
                return None, None, Response({"error": "Invalid quantity format."}, status=status.HTTP_400_BAD_REQUEST)
            if quantity <= 0:
                return None, None, Response({"error": "Quantity must be at least 1."}, status=status.HTTP_400_BAD_REQUEST)

            total += float(menu_item.price) * quantity

        return items, total, None

    def _checkout_hotel(self, data, items, total, idempotency_key):
        room_number = str(data.get('room_number'))
        VALID_ROOMS = ['101', '102', '103', '104', '105', '106', '107', '108']
        if room_number not in VALID_ROOMS:
            return Response({"error": f"Invalid Room Number. Valid rooms are {', '.join(VALID_ROOMS)}."}, status=status.HTTP_400_BAD_REQUEST)

        if Bill.objects.filter(hotel_tab__room_number=room_number, status='Pending').exists():
            return Response({"error": "This room already has a pending order."}, status=status.HTTP_429_TOO_MANY_REQUESTS)

        guest_name = data.get('guest_name', '').strip()
        guest_phone = data.get('guest_phone', '').strip()

        if len(guest_name) < 3 or not re.match(r'^[A-Za-z\s\-\.]+$', guest_name):
            return Response({"error": "Please provide a valid guest name (letters, spaces, hyphens)."}, status=status.HTTP_400_BAD_REQUEST)

        if not guest_phone or not re.match(r'^[6-9]\d{9}$', guest_phone):
            return Response({"error": "Please provide a valid 10-digit mobile number for room verification."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                active_tab, created = HotelTab.objects.get_or_create(
                    room_number=room_number, is_active=True, defaults={'guest_name': guest_name, 'guest_phone': guest_phone}
                )
        except IntegrityError:
            active_tab = HotelTab.objects.get(room_number=room_number, is_active=True)
            created = False

        if not created and (active_tab.guest_name.lower() != guest_name.lower() or active_tab.guest_phone != guest_phone):
            return Response({"error": "Verification failed. Name and Phone do not match the registered room folio."}, status=status.HTTP_403_FORBIDDEN)

        try:
            with transaction.atomic():
                bill = Bill.objects.create(hotel_tab=active_tab, order_type=Bill.OrderType.HOTEL, items_json=items, total_amount=total, status='Pending', idempotency_key=idempotency_key)
        except IntegrityError:
            existing_bill = Bill.objects.get(idempotency_key=idempotency_key)
            return Response({"message": "Order already processed", "order_id": existing_bill.id, "status": existing_bill.status}, status=status.HTTP_200_OK)

        Contact.objects.create(name=f"Room {room_number} ({guest_name})", email="hotel@highspirits.local", message=f"Room service order #{bill.id} placed.")

        trigger_admin_websocket('order')
        return Response({"order_id": bill.id, "status": bill.status}, status=status.HTTP_201_CREATED)

    def _checkout_standard(self, data, items, total, idempotency_key):
        customer_phone = data.get('customer_phone', '').strip()
        if customer_phone != '0000000000' and Bill.objects.filter(customer__phone=customer_phone, status='Pending').exists():
            return Response({"error": "You already have a pending order."}, status=status.HTTP_429_TOO_MANY_REQUESTS)

        customer_name = data.get('customer_name', '').strip()
        if len(customer_name) < 3 or not re.match(r'^[A-Za-z\s\-\.]+$', customer_name):
            return Response({"error": "Please provide a valid name (letters, spaces, hyphens)."}, status=status.HTTP_400_BAD_REQUEST)

        if customer_phone != '0000000000' and not re.match(r'^[6-9]\d{9}$', customer_phone):
            return Response({"error": "Please provide a valid 10-digit mobile number."}, status=status.HTTP_400_BAD_REQUEST)

        customer, _ = Customer.objects.get_or_create(phone=customer_phone, defaults={'name': customer_name})

        try:
            with transaction.atomic():
                bill = Bill.objects.create(customer=customer, order_type=Bill.OrderType.STANDARD, items_json=items, total_amount=total, status='Pending', idempotency_key=idempotency_key)
        except IntegrityError:
            existing_bill = Bill.objects.get(idempotency_key=idempotency_key)
            return Response({"message": "Order already processed", "order_id": existing_bill.id, "status": existing_bill.status}, status=status.HTTP_200_OK)

        trigger_admin_websocket('order')
        return Response({"order_id": bill.id, "status": bill.status}, status=status.HTTP_201_CREATED)

    @transaction.atomic
    def post(self, request):
        data = request.data
        idempotency_key = data.get('idempotency_key')

        if idempotency_key:
            existing_bill = Bill.objects.filter(idempotency_key=idempotency_key).first()
            if existing_bill:
                return Response({"message": "Order already processed", "order_id": existing_bill.id, "status": existing_bill.status}, status=status.HTTP_200_OK)

        items, total, error_response = self._price_items(data.get('items_json'))
        if error_response:
            return error_response

        order_type = data.get('order_type', Bill.OrderType.STANDARD)
        if order_type == Bill.OrderType.HOTEL:
            return self._checkout_hotel(data, items, total, idempotency_key)
        return self._checkout_standard(data, items, total, idempotency_key)


class OrderPagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 200


class OrderListDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk=None):
        if pk:
            try: return Response(BillSerializer(Bill.objects.get(pk=pk)).data)
            except Bill.DoesNotExist: return Response(status=status.HTTP_404_NOT_FOUND)

        queryset = Bill.objects.all().order_by('-created_at')
        paginator = OrderPagination()
        page = paginator.paginate_queryset(queryset, request, view=self)
        return paginator.get_paginated_response(BillSerializer(page, many=True).data)


class OrderStatusView(APIView):
    permission_classes = [AllowAny]
    def get(self, request, pk):
        try: return Response({"status": Bill.objects.get(pk=pk).status})
        except Bill.DoesNotExist: return Response(status=status.HTTP_404_NOT_FOUND)

    def put(self, request, pk):
        if not request.user.is_authenticated:
            return Response({"error": "Authentication required to change order status."}, status=status.HTTP_401_UNAUTHORIZED)
        try:
            bill = Bill.objects.get(pk=pk)
        except Bill.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        bill.status = request.data.get('status')
        bill.save()
        try:
            channel_layer = get_channel_layer()
            if channel_layer: async_to_sync(channel_layer.group_send)(f"order_{bill.id}", {"type": "order_status_message", "status": bill.status})
        except Exception as e: logger.warning(f"WebSocket skipped: {e}")
        return Response({"status": bill.status})


class CreatePaymentOrderView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, pk):
        client = get_razorpay_client()
        if not client:
            return Response({"error": "Online payments are not configured yet."}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        try:
            bill = Bill.objects.get(pk=pk)
        except Bill.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        if bill.order_type != 'Standard':
            return Response({"error": "Online payment isn't used for this order type."}, status=status.HTTP_400_BAD_REQUEST)
        if bill.status != 'Accepted':
            return Response({"error": f"Order must be Accepted before payment (current status: {bill.status})."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            razorpay_order = client.order.create({
                "amount": int(bill.total_amount * 100),  
                "currency": "INR",
                "receipt": str(bill.id),
                "payment_capture": 1,
            })
        except Exception as e:
            logger.error(f"Razorpay order creation failed for bill {bill.id}: {e}")
            return Response({"error": "Could not start payment. Please try again."}, status=status.HTTP_502_BAD_GATEWAY)

        bill.razorpay_order_id = razorpay_order['id']
        bill.save(update_fields=['razorpay_order_id'])

        return Response({
            "razorpay_order_id": razorpay_order['id'],
            "amount": razorpay_order['amount'],
            "currency": razorpay_order['currency'],
            "key": settings.RAZORPAY_KEY_ID,
        })


class VerifyPaymentView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, pk):
        client = get_razorpay_client()
        if not client:
            return Response({"error": "Online payments are not configured yet."}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        try:
            bill = Bill.objects.get(pk=pk)
        except Bill.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        razorpay_order_id = request.data.get('razorpay_order_id')
        razorpay_payment_id = request.data.get('razorpay_payment_id')
        razorpay_signature = request.data.get('razorpay_signature')

        if not all([razorpay_order_id, razorpay_payment_id, razorpay_signature]):
            return Response({"error": "Missing payment verification fields."}, status=status.HTTP_400_BAD_REQUEST)

        if bill.razorpay_order_id != razorpay_order_id:
            return Response({"error": "This payment doesn't match this order."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            client.utility.verify_payment_signature({
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature,
            })
        except razorpay.errors.SignatureVerificationError:
            logger.error(f"Razorpay signature verification failed for bill {bill.id}")
            return Response({"error": "Payment verification failed."}, status=status.HTTP_400_BAD_REQUEST)

        bill.razorpay_payment_id = razorpay_payment_id
        bill.status = 'Paid & Preparing'
        bill.save(update_fields=['razorpay_payment_id', 'status'])

        try:
            channel_layer = get_channel_layer()
            if channel_layer: async_to_sync(channel_layer.group_send)(f"order_{bill.id}", {"type": "order_status_message", "status": bill.status})
        except Exception as e:
            logger.warning(f"WebSocket skipped: {e}")

        return Response({"status": bill.status})


class RazorpayWebhookView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        if not settings.RAZORPAY_WEBHOOK_SECRET:
            return Response(status=status.HTTP_503_SERVICE_UNAVAILABLE)

        signature = request.headers.get('X-Razorpay-Signature', '')
        expected = hmac.new(
            settings.RAZORPAY_WEBHOOK_SECRET.encode(),
            request.body,
            hashlib.sha256,
        ).hexdigest()

        if not hmac.compare_digest(expected, signature):
            logger.warning("Razorpay webhook: invalid signature")
            return Response(status=status.HTTP_400_BAD_REQUEST)

        payload = json.loads(request.body)
        if payload.get('event') == 'payment.captured':
            entity = payload.get('payload', {}).get('payment', {}).get('entity', {})
            bill = Bill.objects.filter(razorpay_order_id=entity.get('order_id')).first()
            if bill and bill.status != 'Paid & Preparing':
                bill.razorpay_payment_id = entity.get('id')
                bill.status = 'Paid & Preparing'
                bill.save(update_fields=['razorpay_payment_id', 'status'])
                try:
                    channel_layer = get_channel_layer()
                    if channel_layer: async_to_sync(channel_layer.group_send)(f"order_{bill.id}", {"type": "order_status_message", "status": bill.status})
                except Exception as e:
                    logger.warning(f"WebSocket skipped: {e}")

        return Response(status=status.HTTP_200_OK)


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


class HealthCheckView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        from django.db import connection
        try:
            connection.ensure_connection()
            db_ok = True
        except Exception as e:
            logger.error(f"Health check: database unreachable: {e}")
            db_ok = False

        return Response(
            {"status": "ok" if db_ok else "degraded", "database": db_ok},
            status=status.HTTP_200_OK if db_ok else status.HTTP_503_SERVICE_UNAVAILABLE,
        )