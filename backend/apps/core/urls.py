from django.urls import path, include
from .views import health, serve_react_app


urlpatterns = [
    path('health/', health, name='health'),
    path('', include('apps.accounts.urls')),
    path('', include('apps.work.urls')),
    path('', serve_react_app, name='react_app'),  # Catch-all for React app
]


