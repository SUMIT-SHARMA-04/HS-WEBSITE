import logging
import json
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
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
            try:
                menu_item = MenuItem.objects.get(name=item.get('name'))
                if not menu_item.is_available:
                    return Response({"error": f"'{menu_item.name}' is out of stock and cannot be ordered."}, status=status.HTTP_400_BAD_REQUEST)
                calculated_total += float(menu_item.price) * item.get('quantity', 1)
            except MenuItem.DoesNotExist:
                return Response({"error": f"Item '{item.get('name')}' not found on the menu."}, status=status.HTTP_400_BAD_REQUEST)
        
        true_total_amount = calculated_total
        order_type = data.get('order_type', 'Standard')

        if order_type == 'Hotel':
            room_number = data.get('room_number')
            guest_name = data.get('guest_name', '').strip()
            guest_phone = data.get('guest_phone', '').strip()
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
            customer, _ = Customer.objects.get_or_create(phone=data.get('customer_phone'), defaults={'name': data.get('customer_name')})
            bill = Bill.objects.create(
                customer=customer, order_type='Standard', items_json=data.get('items_json'),
                total_amount=true_total_amount, status='Pending', idempotency_key=idempotency_key
            )
            trigger_admin_websocket('order')
            send_background_notification("SMS_ORDER_CONFIRMATION", customer.phone)
            return Response({"order_id": bill.id, "status": bill.status}, status=status.HTTP_201_CREATED)

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
    # FIXED: Allow public customers to confirm their orders via PUT
    permission_classes = [AllowAny]
        
    def get(self, request, pk):
        try: return Response({"status": Bill.objects.get(pk=pk).status})
        except Bill.DoesNotExist: return Response(status=status.HTTP_404_NOT_FOUND)

    def put(self, request, pk):
        try:
            bill = Bill.objects.get(pk=pk)
            bill.status = request.data.get('status')
            bill.save()
            async_to_sync(get_channel_layer().group_send)(f"order_{bill.id}", {"type": "order_status_message", "status": bill.status})
            return Response({"status": bill.status})
        except Bill.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all().order_by('-date', '-time')
    serializer_class = BookingSerializer
    
    def get_permissions(self): 
        if self.action in ['create', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]
    
    def perform_create(self, serializer):
        booking = serializer.save()
        trigger_admin_websocket('booking')
        send_background_notification("EMAIL_BOOKING_RECEIVED", booking.email)

    def perform_update(self, serializer):
        booking = serializer.save()
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"booking_{booking.id}",
            {"type": "booking_status_message", "status": booking.status}
        )

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
        serializer.save()
        trigger_admin_websocket('review')

class HotelTabViewSet(viewsets.ModelViewSet):
    queryset = HotelTab.objects.all().order_by('-created_at')
    serializer_class = HotelTabSerializer
    permission_classes = [IsAuthenticated] 

class MenuItemViewSet(viewsets.ModelViewSet):
    queryset = MenuItem.objects.all()
    serializer_class = MenuItemSerializer
    def get_permissions(self): return [AllowAny()] if self.request.method == 'GET' else [IsAuthenticated()]