from rest_framework import serializers
from django.db.models import Sum
from .models import Customer, HotelTab, Bill, MenuItem, Booking, Contact, Review

class HotelTabSerializer(serializers.ModelSerializer):
    class Meta:
        model = HotelTab
        fields = '__all__'

class BillSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    customer_phone = serializers.CharField(source='customer.phone', read_only=True)
    hotel_tab = HotelTabSerializer(read_only=True)

    class Meta:
        model = Bill
        fields = '__all__'

class MenuItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuItem
        fields = '__all__'

class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = '__all__'

    def validate(self, attrs):
        date = attrs.get('date')
        time = attrs.get('time')
        guests = attrs.get('guests')
        
        existing_guests = Booking.objects.filter(date=date, time=time, status__in=['Pending', 'Accepted']).aggregate(Sum('guests'))['guests__sum'] or 0
        if existing_guests + guests > 50:
            raise serializers.ValidationError({"guests": f"Capacity full. Only {50 - existing_guests} seats remain at {time}."})
        return attrs

class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = '__all__'

class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = '__all__'