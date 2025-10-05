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
        
        # Try to inline CSS and JS to avoid static file serving issues
        try:
            # Read CSS file
            css_path = os.path.join(settings.STATIC_ROOT, 'static', 'index-DCoIFvll.css')
            if os.path.exists(css_path):
                with open(css_path, 'r') as f:
                    css_content = f.read()
                content = content.replace('<link rel="stylesheet" href="/static/index-DCoIFvll.css">', f'<style>{css_content}</style>')
            
            # Read JS file
            js_path = os.path.join(settings.STATIC_ROOT, 'static', 'index-CtHhW0Cc.js')
            if os.path.exists(js_path):
                with open(js_path, 'r') as f:
                    js_content = f.read()
                content = content.replace('<script type="module" src="/static/index-CtHhW0Cc.js"></script>', f'<script type="module">{js_content}</script>')
        except Exception as e:
            # If inlining fails, just return the original content
            pass
        
        return HttpResponse(content)
    except FileNotFoundError:
        return HttpResponse("React app not found. Please build the frontend.", status=404)


