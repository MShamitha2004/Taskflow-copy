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
            # Look for CSS files in the static directory
            static_dir = os.path.join(settings.STATIC_ROOT, 'static')
            if os.path.exists(static_dir):
                for file in os.listdir(static_dir):
                    if file.endswith('.css'):
                        css_path = os.path.join(static_dir, file)
                        with open(css_path, 'r') as f:
                            css_content = f.read()
                        # Replace the CSS link with inline styles
                        css_link_pattern = f'<link rel="stylesheet" crossorigin href="/static/{file}">'
                        content = content.replace(css_link_pattern, f'<style>{css_content}</style>')
                    
                    elif file.endswith('.js'):
                        js_path = os.path.join(static_dir, file)
                        with open(js_path, 'r') as f:
                            js_content = f.read()
                        # Replace the JS script with inline script
                        js_script_pattern = f'<script type="module" crossorigin src="/static/{file}"></script>'
                        content = content.replace(js_script_pattern, f'<script type="module">{js_content}</script>')
        except Exception as e:
            # If inlining fails, just return the original content
            pass
        
        return HttpResponse(content)
    except FileNotFoundError:
        return HttpResponse("React app not found. Please build the frontend.", status=404)


