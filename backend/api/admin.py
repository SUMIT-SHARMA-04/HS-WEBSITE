from django.contrib import admin
from .models import Customer, HotelTab, Bill, MenuItem, Booking, Contact, Review

@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ('name', 'phone', 'created_at')

@admin.register(HotelTab)
class HotelTabAdmin(admin.ModelAdmin):
    list_display = ('room_number', 'guest_name', 'is_active', 'created_at')
    list_filter = ('is_active',)

@admin.register(Bill)
class BillAdmin(admin.ModelAdmin):
    list_display = ('id', 'order_type', 'total_amount', 'status', 'created_at')
    list_filter = ('status', 'order_type')

@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'price', 'is_available')
    list_filter = ('is_available', 'category')

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('customer_name', 'date', 'time', 'guests', 'status')
    list_filter = ('status', 'date')

@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'created_at')

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('name', 'rating', 'is_approved', 'created_at')
    list_filter = ('is_approved', 'rating')