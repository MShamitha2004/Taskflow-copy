from django.urls import path, include
from .views import health


urlpatterns = [
    path('health/', health, name='health'),
    path('', include('apps.accounts.urls')),
    path('', include('apps.work.urls')),
]


