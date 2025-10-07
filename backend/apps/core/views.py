from django.http import JsonResponse, HttpResponse
from django.shortcuts import render
from django.conf import settings
import os


def health(request):
    return JsonResponse({"status": "ok"})


def serve_react_app(request):
    """Serve the React app for all non-API routes"""
    try:
        # Try multiple possible locations for index.html
        possible_paths = [
            os.path.join(settings.STATIC_ROOT, 'index.html'),
            os.path.join(settings.BASE_DIR, 'frontend', 'dist', 'index.html'),
            os.path.join(settings.BASE_DIR, 'index.html'),
        ]
        
        content = None
        for path in possible_paths:
            if os.path.exists(path):
                with open(path, 'r') as f:
                    content = f.read()
                break
        
        if not content:
            return HttpResponse("React app not found. Please build the frontend.", status=404)
        
        # Try to inline CSS and JS to avoid static file serving issues
        try:
            # Look for CSS and JS files in multiple locations
            static_dirs = [
                os.path.join(settings.STATIC_ROOT, 'static'),
                os.path.join(settings.BASE_DIR, 'frontend', 'dist', 'static'),
            ]
            
            for static_dir in static_dirs:
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
    except Exception as e:
        return HttpResponse(f"Error serving React app: {str(e)}", status=500)


