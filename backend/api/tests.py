from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth.models import User
from .models import Bill, Customer, HotelTab, Booking

class HighSpiritsBackendTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_superuser('admin_test', 'admin@test.com', 'TestPass123!')
        
        self.active_tab = HotelTab.objects.create(
            room_number='101',
            guest_name='Smith',
            is_active=True
        )

    def test_standard_guest_checkout(self):
        url = '/orders/checkout/'
        payload = {
            "order_type": "Standard",
            "customer_name": "John Doe",
            "customer_phone": "9876543210",
            "items_json": '[{"name": "Paneer Butter Masala", "price": 280, "quantity": 1}]',
            "total_amount": 280.00
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Bill.objects.filter(order_type='Standard').count(), 1)

    def test_hotel_room_verification_success(self):
        url = '/orders/checkout/'
        payload = {
            "order_type": "Hotel",
            "room_number": "101",
            "guest_name": "Smith",
            "items_json": '[{"name": "Cold Brew Mocha", "price": 180, "quantity": 1}]',
            "total_amount": 180.00
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Bill.objects.filter(order_type='Hotel').count(), 1)

    def test_hotel_room_verification_wrong_lastname(self):
        url = '/orders/checkout/'
        payload = {
            "order_type": "Hotel",
            "room_number": "101",
            "guest_name": "WrongName",
            "items_json": '[{"name": "Cold Brew", "price": 180}]',
            "total_amount": 180.00
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_booking_guest_limit_validation(self):
        url = '/bookings/'
        payload = {
            "customer_name": "Big Party",
            "email": "party@test.com",
            "customer_phone": "9999999999",
            "date": "2026-10-10",
            "time": "7:00 PM",
            "guests": 15
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_admin_order_list_unauthorized_without_token(self):
        url = '/orders/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)