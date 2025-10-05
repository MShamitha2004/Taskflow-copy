from django.http import JsonResponse, HttpResponse, FileResponse
from django.shortcuts import render
from django.conf import settings
import os
import mimetypes


def health(request):
    return JsonResponse({"status": "ok"})


def serve_static_file(request, file_path):
    """Serve static files directly"""
    full_path = os.path.join(settings.STATIC_ROOT, file_path)
    if os.path.exists(full_path):
        content_type, _ = mimetypes.guess_type(full_path)
        return FileResponse(open(full_path, 'rb'), content_type=content_type)
    return HttpResponse("File not found", status=404)


def serve_react_app(request):
    """Serve the React app for all non-API routes"""
    try:
        with open(os.path.join(settings.STATIC_ROOT, 'index.html'), 'r') as f:
            return HttpResponse(f.read())
    except FileNotFoundError:
        return HttpResponse("React app not found. Please build the frontend.", status=404)


