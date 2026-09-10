from rest_framework import serializers
from django.db.models import Sum
from .models import Customer, HotelTab, Bill, MenuItem, Booking, Contact, Review

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = '__all__'

class HotelTabSerializer(serializers.ModelSerializer):
    class Meta:
        model = HotelTab
        fields = '__all__'

class BillSerializer(serializers.ModelSerializer):
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

    def validate(self, data):
        is_update = self.instance is not None
        check_date = data.get('date', self.instance.date if is_update else None)
        check_time = data.get('time', self.instance.time if is_update else None)
        check_guests = data.get('guests', self.instance.guests if is_update else None)

        if not all([check_date, check_time, check_guests]): return data
        qs = Booking.objects.filter(date=check_date, time=check_time, status='Accepted')
        if is_update: qs = qs.exclude(pk=self.instance.pk)
            
        existing_guests = qs.aggregate(Sum('guests'))['guests__sum'] or 0
        if existing_guests + check_guests > 80:
            raise serializers.ValidationError({"guests": "Not enough capacity for this time slot."})

        return data

class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = '__all__'

class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = '__all__'