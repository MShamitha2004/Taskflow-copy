from django.http import JsonResponse, HttpResponse
from django.shortcuts import render
from django.conf import settings
import os


def health(request):
    return JsonResponse({"status": "ok"})


def serve_react_app(request):
    """Serve the React app for all non-API routes"""
    # Don't serve React app for static files
    if request.path.startswith('/static/') or request.path.startswith('/assets/'):
        return HttpResponse("Static file not found", status=404)
    
    try:
        with open(os.path.join(settings.STATIC_ROOT, 'index.html'), 'r') as f:
            return HttpResponse(f.read())
    except FileNotFoundError:
        return HttpResponse("React app not found. Please build the frontend.", status=404)


