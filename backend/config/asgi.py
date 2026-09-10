import os
from django.core.asgi import get_asgi_application

# 1. Set the settings module first
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# 2. Initialize Django ASGI application next
# This crucial step loads all the settings and apps BEFORE any models are imported
django_asgi_app = get_asgi_application()

# 3. NOW it is safe to import Channels and your routing
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
import config.routing

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AllowedHostsOriginValidator(
        URLRouter(
            config.routing.websocket_urlpatterns
        )
    ),
})