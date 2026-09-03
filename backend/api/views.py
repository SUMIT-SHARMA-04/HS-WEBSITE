import threading
import time
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import Customer, HotelTab, Bill, MenuItem, Booking, Contact, Review
from .serializers import BillSerializer, MenuItemSerializer, BookingSerializer, ContactSerializer, HotelTabSerializer, ReviewSerializer

def send_background_notification(task_name, details):
    def run_task():
        print(f"[ASYNC TASK STARTED] Executing {task_name}...")
        time.sleep(2) 
        print(f"[ASYNC TASK COMPLETED] {task_name} sent for {details}")
    threading.Thread(target=run_task).start()

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

        order_type = data.get('order_type', 'Standard')

        if order_type == 'Hotel':
            room_number = data.get('room_number')
            guest_name = data.get('guest_name', '').strip()
            active_tab = HotelTab.objects.filter(room_number=room_number, is_active=True).first()

            if not active_tab:
                active_tab = HotelTab.objects.create(room_number=room_number, guest_name=guest_name, is_active=True)
            elif active_tab.guest_name.lower() != guest_name.lower():
                return Response({"error": "Name verification failed for this room."}, status=status.HTTP_403_FORBIDDEN)

            bill = Bill.objects.create(
                hotel_tab=active_tab, order_type='Hotel', items_json=data.get('items_json'),
                total_amount=data.get('total_amount'), status='Pending', idempotency_key=idempotency_key
            )
            
            Contact.objects.create(
                name=f"Room {room_number} ({guest_name})",
                email="hotel-system@highspirits.local",
                message=f"Room service order #{bill.id} placed for ₹{bill.total_amount}. Please check the Live Orders tab to accept the order."
            )

            trigger_admin_websocket('order')
            trigger_admin_websocket('message') 
            return Response({"order_id": bill.id, "status": bill.status}, status=status.HTTP_201_CREATED)

        else:
            customer, _ = Customer.objects.get_or_create(phone=data.get('customer_phone'), defaults={'name': data.get('customer_name')})
            bill = Bill.objects.create(
                customer=customer, order_type='Standard', items_json=data.get('items_json'),
                total_amount=data.get('total_amount'), status='Pending', idempotency_key=idempotency_key
            )
            trigger_admin_websocket('order')
            send_background_notification("SMS_ORDER_CONFIRMATION", customer.phone)
            return Response({"order_id": bill.id, "status": bill.status}, status=status.HTTP_201_CREATED)

class OrderListDetailView(APIView):
    permission_classes = [IsAuthenticated] 
    def get(self, request):
        bills = Bill.objects.all().order_by('-created_at')[:200]
        return Response(BillSerializer(bills, many=True).data)

class OrderStatusView(APIView):
    def get_permissions(self): return [AllowAny()] 
    def get(self, request, pk):
        try: return Response({"status": Bill.objects.get(pk=pk).status})
        except Bill.DoesNotExist: return Response(status=status.HTTP_404_NOT_FOUND)

    def put(self, request, pk):
        bill = Bill.objects.get(pk=pk)
        bill.status = request.data.get('status')
        bill.save()
        async_to_sync(get_channel_layer().group_send)(f"order_{bill.id}", {"type": "order_status_message", "status": bill.status})
        return Response({"status": bill.status})

class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all().order_by('-date', '-time')
    serializer_class = BookingSerializer
    def get_permissions(self): return [AllowAny()] if self.request.method == 'POST' else [IsAuthenticated()]
    
    def perform_create(self, serializer):
        booking = serializer.save()
        trigger_admin_websocket('booking')
        send_background_notification("EMAIL_BOOKING_RECEIVED", booking.email)

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
    
    # FIXED: Allow public users to GET reviews, but require Auth to modify them
    def get_permissions(self): 
        if self.request.method in ['GET', 'POST']:
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