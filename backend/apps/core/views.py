from django.http import JsonResponse, HttpResponse
from django.shortcuts import render
from django.conf import settings
import os


def health(request):
    return JsonResponse({"status": "ok"})


def serve_react_app(request):
    """Serve the React app for all non-API routes"""
    try:
        # Read the index.html file
        with open(os.path.join(settings.STATIC_ROOT, 'index.html'), 'r') as f:
            content = f.read()
        
        # Replace asset paths to use absolute URLs
        content = content.replace('/static/', 'https://taskflow-copy.onrender.com/static/')
        
        return HttpResponse(content)
    except FileNotFoundError:
        return HttpResponse("React app not found. Please build the frontend.", status=404)


