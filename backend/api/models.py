import uuid

from django.core.validators import MaxValueValidator
from django.db import models


class Customer(models.Model):
    name = models.CharField(max_length=150)
    phone = models.CharField(max_length=20, unique=True, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.phone})"

class HotelTab(models.Model):
    room_number = models.CharField(max_length=3)
    guest_name = models.CharField(max_length=100)
    guest_phone = models.CharField(max_length=20, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [models.Index(fields=['room_number', 'is_active'])]
        constraints = [
            # Stops two concurrent first-time orders for the same room from
            # creating two separate "active" folios for it.
            models.UniqueConstraint(
                fields=['room_number'],
                condition=models.Q(is_active=True),
                name='unique_active_room',
            )
        ]

    def __str__(self):
        return f"Room {self.room_number} ({self.guest_name}) - {'Active' if self.is_active else 'Closed'}"

class Bill(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Accepted', 'Accepted'),
        ('Paid & Preparing', 'Paid & Preparing'),
        ('Completed', 'Completed'),
        ('Rejected', 'Rejected'),
    )

    class OrderType(models.TextChoices):
        STANDARD = 'Standard', 'Standard'
        HOTEL = 'Hotel', 'Hotel'

    customer = models.ForeignKey(Customer, related_name='bills', on_delete=models.CASCADE, null=True, blank=True)
    hotel_tab = models.ForeignKey(HotelTab, related_name='room_charges', on_delete=models.CASCADE, null=True, blank=True)
    order_type = models.CharField(max_length=20, choices=OrderType.choices, default=OrderType.STANDARD)
    items_json = models.JSONField() 
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    idempotency_key = models.CharField(max_length=255, unique=True, null=True, blank=True)
    # Set once a Razorpay order is created for this bill, and once that
    # payment is verified — see CreatePaymentOrderView / VerifyPaymentView.
    razorpay_order_id = models.CharField(max_length=100, null=True, blank=True)
    razorpay_payment_id = models.CharField(max_length=100, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [models.Index(fields=['status', 'created_at'])]

    def __str__(self):
        return f"Bill #{str(self.id)[:8]} - {'Room '+self.hotel_tab.room_number if self.order_type == 'Hotel' else self.customer.name}"

class MenuItem(models.Model):
    name = models.CharField(max_length=150)
    category = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=6, decimal_places=2)
    img = models.URLField(max_length=500)
    is_available = models.BooleanField(default=True)

    def __str__(self):
        return self.name

class Booking(models.Model):
    class Status(models.TextChoices):
        PENDING = 'Pending', 'Pending'
        ACCEPTED = 'Accepted', 'Accepted'
        REJECTED = 'Rejected', 'Rejected'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer_name = models.CharField(max_length=150)
    email = models.EmailField()
    customer_phone = models.CharField(max_length=20)
    date = models.DateField()
    time = models.CharField(max_length=20)
    guests = models.IntegerField(validators=[MaxValueValidator(12)])
    special_requests = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)

class Contact(models.Model):
    name = models.CharField(max_length=150)
    email = models.EmailField()
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

class Review(models.Model):
    name = models.CharField(max_length=100)
    role = models.CharField(max_length=100, blank=True, null=True)
    text = models.TextField()
    rating = models.IntegerField(default=5)
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)