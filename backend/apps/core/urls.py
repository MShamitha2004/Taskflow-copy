from django.urls import path, include
from .views import health, serve_react_app


urlpatterns = [
    path('health/', health, name='health'),
    path('api/', include('apps.accounts.urls')),
    path('api/', include('apps.work.urls')),
    path('', serve_react_app, name='react_app'),  # Catch-all for React app
]


