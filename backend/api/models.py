from django.db import models
from django.core.validators import MaxValueValidator

class Customer(models.Model):
    name = models.CharField(max_length=150)
    phone = models.CharField(max_length=20, unique=True, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.phone})"

class HotelTab(models.Model):
    room_number = models.CharField(max_length=3)
    guest_name = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [models.Index(fields=['room_number', 'is_active'])]

    def __str__(self):
        return f"Room {self.room_number} ({self.guest_name}) - {'Active' if self.is_active else 'Closed'}"

class Bill(models.Model):
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Accepted', 'Accepted'),
        ('Paid & Preparing', 'Paid & Preparing'),
        ('Completed', 'Completed'),
        ('Rejected', 'Rejected'),
    )
    customer = models.ForeignKey(Customer, related_name='bills', on_delete=models.CASCADE, null=True, blank=True)
    hotel_tab = models.ForeignKey(HotelTab, related_name='room_charges', on_delete=models.CASCADE, null=True, blank=True)
    order_type = models.CharField(max_length=20, default='Standard') 
    items_json = models.JSONField() 
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    idempotency_key = models.CharField(max_length=255, unique=True, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [models.Index(fields=['status', 'created_at'])]

    def __str__(self):
        return f"Bill #{self.id} - {'Room '+self.hotel_tab.room_number if self.order_type == 'Hotel' else self.customer.name}"

class MenuItem(models.Model):
    name = models.CharField(max_length=150)
    category = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=6, decimal_places=2)
    img = models.URLField(max_length=500)
    is_available = models.BooleanField(default=True)

    def __str__(self):
        return self.name

class Booking(models.Model):
    customer_name = models.CharField(max_length=150)
    email = models.EmailField()
    customer_phone = models.CharField(max_length=20)
    date = models.DateField()
    time = models.CharField(max_length=20)
    guests = models.IntegerField(validators=[MaxValueValidator(12)])
    special_requests = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, default='Pending')

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