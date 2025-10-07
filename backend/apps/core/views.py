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
        found_path = None
        
        for path in possible_paths:
            if os.path.exists(path):
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    found_path = path
                    break
                except Exception as e:
                    print(f"Error reading {path}: {e}")
                    continue
        
        if not content:
            # Return a simple HTML page if React files aren't found
            return HttpResponse("""
            <!DOCTYPE html>
            <html>
            <head>
                <title>TaskFlow - Loading...</title>
                <style>
                    body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                    .loading { color: #666; }
                </style>
            </head>
            <body>
                <h1>TaskFlow Management System</h1>
                <p class="loading">React app is being built. Please refresh the page in a moment.</p>
                <p>If this persists, please check the deployment logs.</p>
            </body>
            </html>
            """, status=200)
        
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
                            try:
                                with open(css_path, 'r', encoding='utf-8') as f:
                                    css_content = f.read()
                                # Replace the CSS link with inline styles
                                css_link_pattern = f'<link rel="stylesheet" crossorigin href="/static/{file}">'
                                content = content.replace(css_link_pattern, f'<style>{css_content}</style>')
                            except Exception as e:
                                print(f"Error reading CSS {css_path}: {e}")
                        
                        elif file.endswith('.js'):
                            js_path = os.path.join(static_dir, file)
                            try:
                                with open(js_path, 'r', encoding='utf-8') as f:
                                    js_content = f.read()
                                # Replace the JS script with inline script
                                js_script_pattern = f'<script type="module" crossorigin src="/static/{file}"></script>'
                                content = content.replace(js_script_pattern, f'<script type="module">{js_content}</script>')
                            except Exception as e:
                                print(f"Error reading JS {js_path}: {e}")
        except Exception as e:
            print(f"Error processing static files: {e}")
            # Continue with original content if inlining fails
        
        return HttpResponse(content, content_type='text/html')
        
    except Exception as e:
        print(f"Error in serve_react_app: {e}")
        return HttpResponse(f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>TaskFlow - Error</title>
            <style>
                body {{ font-family: Arial, sans-serif; text-align: center; padding: 50px; }}
                .error {{ color: #d32f2f; }}
            </style>
        </head>
        <body>
            <h1>TaskFlow Management System</h1>
            <p class="error">Error loading React app: {str(e)}</p>
            <p>Please check the deployment logs or contact support.</p>
        </body>
        </html>
        """, status=500)


