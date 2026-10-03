from unittest.mock import patch

from django.contrib.auth.models import User
from django.test import override_settings
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Bill, Customer, HotelTab, MenuItem


class HighSpiritsBackendTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_superuser('admin_test', 'admin@test.com', 'TestPass123!')

        self.active_tab = HotelTab.objects.create(
            room_number='101',
            guest_name='Smith',
            guest_phone='9876543210',
            is_active=True
        )

        # CheckoutView looks up every ordered item against MenuItem (it never
        # trusts a client-sent price), so these have to exist for any of the
        # checkout tests below to get past item validation.
        MenuItem.objects.create(name="Paneer Butter Masala", category="Sabji", price=280.00, img="https://example.com/pbm.jpg")
        MenuItem.objects.create(name="Cold Brew Mocha", category="Beverage", price=180.00, img="https://example.com/cbm.jpg")
        MenuItem.objects.create(name="Cold Brew", category="Beverage", price=180.00, img="https://example.com/cb.jpg")

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
            "guest_phone": "9876543210",
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
            "guest_phone": "9876543210",
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

    def test_order_status_forgery_now_blocked(self):
        # This used to be the vulnerability: an unauthenticated request could
        # move a bill straight to "Paid & Preparing" with no real payment.
        bill = Bill.objects.create(
            customer=Customer.objects.create(name="Jane", phone="9123456789"),
            order_type='Standard', items_json=[], total_amount=100, status='Accepted'
        )
        response = self.client.put(f'/orders/{bill.id}/status/', {"status": "Paid & Preparing"}, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        bill.refresh_from_db()
        self.assertEqual(bill.status, 'Accepted')

    @override_settings(RAZORPAY_KEY_ID='rzp_test_fake', RAZORPAY_KEY_SECRET='fake_secret')
    def test_create_payment_order_requires_accepted_standard_bill(self):
        bill = Bill.objects.create(
            customer=Customer.objects.create(name="Jane", phone="9123456790"),
            order_type='Standard', items_json=[], total_amount=100, status='Pending'
        )
        response = self.client.post(f'/orders/{bill.id}/create-payment/')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @override_settings(RAZORPAY_KEY_ID='rzp_test_fake', RAZORPAY_KEY_SECRET='fake_secret')
    @patch('razorpay.resources.order.Order.create')
    def test_create_payment_order_success(self, mock_create):
        mock_create.return_value = {"id": "order_fake123", "amount": 10000, "currency": "INR"}
        bill = Bill.objects.create(
            customer=Customer.objects.create(name="Jane", phone="9123456791"),
            order_type='Standard', items_json=[], total_amount=100, status='Accepted'
        )
        response = self.client.post(f'/orders/{bill.id}/create-payment/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['razorpay_order_id'], 'order_fake123')
        bill.refresh_from_db()
        self.assertEqual(bill.razorpay_order_id, 'order_fake123')

    @override_settings(RAZORPAY_KEY_ID='rzp_test_fake', RAZORPAY_KEY_SECRET='fake_secret')
    @patch('razorpay.utility.utility.Utility.verify_payment_signature')
    def test_verify_payment_rejects_bad_signature(self, mock_verify):
        import razorpay as razorpay_module
        mock_verify.side_effect = razorpay_module.errors.SignatureVerificationError("bad sig")
        bill = Bill.objects.create(
            customer=Customer.objects.create(name="Jane", phone="9123456792"),
            order_type='Standard', items_json=[], total_amount=100, status='Accepted',
            razorpay_order_id='order_fake123'
        )
        response = self.client.post(f'/orders/{bill.id}/verify-payment/', {
            "razorpay_order_id": "order_fake123",
            "razorpay_payment_id": "pay_fake456",
            "razorpay_signature": "not_a_real_signature",
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        bill.refresh_from_db()
        self.assertEqual(bill.status, 'Accepted')  # unchanged — forged signature must not flip status

    @override_settings(RAZORPAY_KEY_ID='rzp_test_fake', RAZORPAY_KEY_SECRET='fake_secret')
    @patch('razorpay.utility.utility.Utility.verify_payment_signature')
    def test_verify_payment_success(self, mock_verify):
        mock_verify.return_value = True
        bill = Bill.objects.create(
            customer=Customer.objects.create(name="Jane", phone="9123456793"),
            order_type='Standard', items_json=[], total_amount=100, status='Accepted',
            razorpay_order_id='order_fake123'
        )
        response = self.client.post(f'/orders/{bill.id}/verify-payment/', {
            "razorpay_order_id": "order_fake123",
            "razorpay_payment_id": "pay_fake456",
            "razorpay_signature": "a_valid_looking_signature",
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        bill.refresh_from_db()
        self.assertEqual(bill.status, 'Paid & Preparing')
        self.assertEqual(bill.razorpay_payment_id, 'pay_fake456')

    def test_duplicate_active_hotel_tab_blocked_at_db_level(self):
        # Backs the UniqueConstraint added to HotelTab: two active tabs for
        # the same room can no longer both exist.
        from django.db import IntegrityError
        with self.assertRaises(IntegrityError):
            HotelTab.objects.create(room_number='101', guest_name='Someone Else', is_active=True)

    def test_hotel_checkout_survives_tab_creation_race(self):
        # Simulates two concurrent first-orders for a brand-new room hitting
        # get_or_create at the same instant: the second one should fall
        # back cleanly to the winner's tab (via the IntegrityError handler)
        # instead of the request blowing up with a 500.
        from django.db import IntegrityError
        with patch('api.views.HotelTab.objects.get_or_create') as mock_get_or_create:
            mock_get_or_create.side_effect = IntegrityError("duplicate key value violates unique constraint")
            HotelTab.objects.create(room_number='102', guest_name='Winner', guest_phone='9111111111', is_active=True)

            response = self.client.post('/orders/checkout/', {
                "order_type": "Hotel",
                "room_number": "102",
                "guest_name": "Winner",
                "guest_phone": "9111111111",
                "items_json": '[{"name": "Cold Brew", "price": 180, "quantity": 1}]',
                "total_amount": 180.00
            }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_health_check(self):
        response = self.client.get('/health/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'ok')
        self.assertTrue(response.data['database'])

    def test_error_shape_is_consistent_across_error_sources(self):
        # A manually-raised error in a view...
        r1 = self.client.post('/orders/checkout/', {"order_type": "Standard", "items_json": "[]"}, format='json')
        self.assertIn('error', r1.data)

        # ...and a DRF serializer validation error both end up under the
        # same top-level "error" key, so a frontend only checks one shape.
        r2 = self.client.post('/bookings/', {
            "customer_name": "Big Party", "email": "party@test.com", "customer_phone": "9999999999",
            "date": "2026-10-10", "time": "7:00 PM", "guests": 15
        }, format='json')
        self.assertIn('error', r2.data)

    def test_checkout_rejects_empty_item_list(self):
        response = self.client.post('/orders/checkout/', {
            "order_type": "Standard", "customer_name": "John Doe", "customer_phone": "9876543210",
            "items_json": "[]", "total_amount": 0
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('items', response.data['error'].lower())

    def test_checkout_rejects_non_numeric_quantity(self):
        # item.get('quantity') can come back as None, a list, etc. from a
        # malformed client payload — int(None) raises TypeError, not
        # ValueError, and the original code only caught ValueError.
        response = self.client.post('/orders/checkout/', {
            "order_type": "Standard", "customer_name": "John Doe", "customer_phone": "9876543210",
            "items_json": '[{"name": "Paneer Butter Masala", "price": 280, "quantity": null}]',
            "total_amount": 280.00
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_orders_list_is_paginated(self):
        for _ in range(3):
            Bill.objects.create(
                customer=Customer.objects.create(name="Repeat", phone=None),
                order_type='Standard', items_json=[], total_amount=100, status='Pending'
            )
        token = self.client.post('/api/token/', {"username": "admin_test", "password": "TestPass123!"}, format='json').data['access']
        response = self.client.get('/orders/', HTTP_AUTHORIZATION=f'Bearer {token}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        for key in ('count', 'next', 'previous', 'results'):
            self.assertIn(key, response.data)
        self.assertEqual(response.data['count'], 3)