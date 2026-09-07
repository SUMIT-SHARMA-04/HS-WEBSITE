import json
from urllib.parse import parse_qs
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken

User = get_user_model()

@database_sync_to_async
def get_user_from_token(token_string):
    try:
        access_token = AccessToken(token_string)
        return User.objects.get(id=access_token['user_id'])
    except Exception:
        return None

class OrderStatusConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.order_id = self.scope['url_route']['kwargs']['order_id']
        self.room_group_name = f'order_{self.order_id}'
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def order_status_message(self, event):
        await self.send(text_data=json.dumps({'status': event['status']}))

# THIS IS THE CLASS YOUR SERVER WAS MISSING
class BookingStatusConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.booking_id = self.scope['url_route']['kwargs']['booking_id']
        self.room_group_name = f'booking_{self.booking_id}'
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def booking_status_message(self, event):
        await self.send(text_data=json.dumps({'status': event['status']}))

class AdminNotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        query_string = self.scope.get('query_string', b'').decode()
        token = parse_qs(query_string).get('token', [None])[0]
        
        user = await get_user_from_token(token)
        if user and user.is_staff:
            await self.channel_layer.group_add("admin_notifications", self.channel_name)
            await self.accept()
        else:
            await self.close() 

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("admin_notifications", self.channel_name)

    async def admin_alert(self, event):
        await self.send(text_data=json.dumps({'event': event['event']}))