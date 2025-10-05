from django.urls import path, include
from .views import health, serve_react_app, serve_static_file


urlpatterns = [
    path('health/', health, name='health'),
    path('static/<path:file_path>', serve_static_file, name='serve_static'),
    path('api/', include('apps.accounts.urls')),
    path('api/', include('apps.work.urls')),
    path('', serve_react_app, name='react_app'),  # Catch-all for React app
]


