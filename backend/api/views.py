import logging
import json
import re
import traceback # ADDED FOR TRACING 500 ERRORS
from datetime import date
from django.db import transaction
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

def send_background_notification(task_name, details):
    logger.info(f"[MOCK TASK QUEUE] Executing {task_name} for {details}...")

def trigger_admin_websocket(event_type):
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        "admin_notifications",
        {"type": "admin_alert", "event": event_type}
    )

class CheckoutView(APIView):
    permission_classes = [AllowAny] 

    @transaction.atomic 
    def post(self, request):
        try:
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
                menu_item = MenuItem.objects.filter(name=item.get('name')).first()
                
                if not menu_item:
                    return Response({"error": f"Item '{item.get('name')}' not found on the menu."}, status=status.HTTP_400_BAD_REQUEST)
                if not menu_item.is_available:
                    return Response({"error": f"'{menu_item.name}' is out of stock and cannot be ordered."}, status=status.HTTP_400_BAD_REQUEST)
                
                try:
                    quantity = int(item.get('quantity', 1))
                    if quantity <= 0:
                        return Response({"error": "Quantity must be at least 1."}, status=status.HTTP_400_BAD_REQUEST)
                except ValueError:
                    return Response({"error": "Invalid quantity format."}, status=status.HTTP_400_BAD_REQUEST)

                calculated_total += float(menu_item.price) * quantity
            
            true_total_amount = calculated_total
            order_type = data.get('order_type', 'Standard')

            if order_type == 'Hotel':
                room_number = str(data.get('room_number'))
                
                VALID_ROOMS = ['101', '102', '103', '104', '105', '106', '107', '108']
                if room_number not in VALID_ROOMS:
                    return Response({"error": f"Invalid Room Number '{room_number}'. Valid rooms are {', '.join(VALID_ROOMS)}."}, status=status.HTTP_400_BAD_REQUEST)

                if Bill.objects.filter(hotel_tab__room_number=room_number, status='Pending').exists():
                    return Response({"error": "This room already has a pending order. Please wait for the kitchen to accept it before placing another."}, status=status.HTTP_429_TOO_MANY_REQUESTS)

                guest_name = data.get('guest_name', '').strip()
                guest_phone = data.get('guest_phone', '').strip()
                
                if len(guest_name) < 3 or not re.match(r'^[A-Za-z\s]+$', guest_name):
                    return Response({"error": "Please provide a valid guest name containing only letters."}, status=status.HTTP_400_BAD_REQUEST)
                if not re.match(r'^[6-9]\d{9}$', guest_phone):
                    return Response({"error": "Please provide a valid 10-digit mobile number."}, status=status.HTTP_400_BAD_REQUEST)

                active_tab = HotelTab.objects.filter(room_number=room_number, is_active=True).first()

                if not active_tab:
                    active_tab = HotelTab.objects.create(room_number=room_number, guest_name=guest_name, guest_phone=guest_phone, is_active=True)
                else:
                    if active_tab.guest_name.lower() != guest_name.lower() or active_tab.guest_phone != guest_phone:
                        return Response({"error": "Verification failed. This room is currently registered to a different guest or the details do not match."}, status=status.HTTP_403_FORBIDDEN)

                bill = Bill.objects.create(
                    hotel_tab=active_tab, order_type='Hotel', items_json=data.get('items_json'),
                    total_amount=true_total_amount, status='Pending', idempotency_key=idempotency_key
                )
                
                Contact.objects.create(
                    name=f"Room {room_number} ({guest_name})",
                    email="hotel-system@highspirits.local",
                    message=f"Room service order #{bill.id} placed for ₹{bill.total_amount}. Please check Live Orders."
                )

                trigger_admin_websocket('order')
                trigger_admin_websocket('message') 
                return Response({"order_id": bill.id, "status": bill.status}, status=status.HTTP_201_CREATED)

            else:
                customer_phone = data.get('customer_phone', '').strip()
                
                if Bill.objects.filter(customer__phone=customer_phone, status='Pending').exists():
                    return Response({"error": "You already have a pending order. Please wait for the kitchen to accept it before placing another."}, status=status.HTTP_429_TOO_MANY_REQUESTS)

                customer_name = data.get('customer_name', '').strip()
                
                if len(customer_name) < 3 or not re.match(r'^[A-Za-z\s]+$', customer_name):
                    return Response({"error": "Please provide a valid full name containing only letters."}, status=status.HTTP_400_BAD_REQUEST)
                if not re.match(r'^[6-9]\d{9}$', customer_phone):
                    return Response({"error": "Please provide a valid 10-digit mobile number."}, status=status.HTTP_400_BAD_REQUEST)

                customer, _ = Customer.objects.get_or_create(phone=customer_phone, defaults={'name': customer_name})
                
                bill = Bill.objects.create(
                    customer=customer, order_type='Standard', items_json=data.get('items_json'),
                    total_amount=true_total_amount, status='Pending', idempotency_key=idempotency_key
                )
                trigger_admin_websocket('order')
                send_background_notification("SMS_ORDER_CONFIRMATION", customer.phone)
                return Response({"order_id": bill.id, "status": bill.status}, status=status.HTTP_201_CREATED)
        except Exception as e:
            print("--- CRITICAL CHECKOUT ERROR ---")
            traceback.print_exc()
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class OrderListDetailView(APIView):
    permission_classes = [IsAuthenticated] 
    
    def get(self, request, pk=None):
        if pk:
            try:
                bill = Bill.objects.get(pk=pk)
                return Response(BillSerializer(bill).data)
            except Bill.DoesNotExist:
                return Response(status=status.HTTP_404_NOT_FOUND)
        
        bills = Bill.objects.all().order_by('-created_at')[:200]
        return Response(BillSerializer(bills, many=True).data)

class OrderStatusView(APIView):
    permission_classes = [AllowAny]
        
    def get(self, request, pk):
        try: 
            return Response({"status": Bill.objects.get(pk=pk).status})
        except Bill.DoesNotExist: 
            return Response(status=status.HTTP_404_NOT_FOUND)

    def put(self, request, pk):
        try:
            bill = Bill.objects.get(pk=pk)
            new_status = request.data.get('status')

            if not request.user.is_authenticated:
                if bill.status == 'Accepted' and new_status == 'Paid & Preparing':
                    pass 
                else:
                    return Response({"error": "Unauthorized status transition."}, status=status.HTTP_403_FORBIDDEN)

            bill.status = new_status
            bill.save()
            async_to_sync(get_channel_layer().group_send)(f"order_{bill.id}", {"type": "order_status_message", "status": bill.status})
            return Response({"status": bill.status})
            
        except Exception as e:
            print("--- CRITICAL ORDER STATUS ERROR ---")
            traceback.print_exc()
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all().order_by('-date', '-time')
    serializer_class = BookingSerializer
    
    def get_permissions(self): 
        if self.action in ['create', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]
        
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        if request.user.is_authenticated:
            serializer = self.get_serializer(instance)
            return Response(serializer.data)
        return Response({"status": instance.status})
    
    def perform_create(self, serializer):
        booking_date = serializer.validated_data.get('date')
        if booking_date and booking_date < date.today():
            raise ValidationError({"error": "Cannot book a table in the past."})
        
        booking = serializer.save(status='Pending')
        
        trigger_admin_websocket('booking')
        send_background_notification("EMAIL_BOOKING_RECEIVED", booking.email)

    def perform_update(self, serializer):
        try:
            booking = serializer.save()
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f"booking_{booking.id}",
                {"type": "booking_status_message", "status": booking.status}
            )
        except Exception as e:
            print("--- CRITICAL BOOKING UPDATE ERROR ---")
            traceback.print_exc()
            raise e

    def perform_destroy(self, instance):
        booking_id = instance.id
        super().perform_destroy(instance)
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"booking_{booking_id}",
            {"type": "booking_status_message", "status": "Rejected"}
        )

class ContactViewSet(viewsets.ModelViewSet):
    queryset = Contact.objects.all().order_by('-created_at')
    serializer_class = ContactSerializer
    def get_permissions(self): return [AllowAny()] if self.request.method == 'POST' else [IsAuthenticated()]
    
    def perform_create(self, serializer):
        serializer.save()
        trigger_admin_websocket('message')

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all().order_by('-created_at')
    serializer_class = ReviewSerializer
    
    def get_permissions(self): 
        if self.action in ['create', 'list']:
            return [AllowAny()]
        return [IsAuthenticated()]
    
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