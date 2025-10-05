# Optimized Multi-stage Dockerfile for Django + React Application
# This file creates a smaller, more efficient container

# ===========================================
# STAGE 1: Build React Frontend (Optimized)
# ===========================================
FROM node:18-alpine AS frontend-builder

# Set working directory for frontend
WORKDIR /app/frontend

# Copy package files first (for better Docker layer caching)
COPY frontend/package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci && npm cache clean --force

# Copy only necessary source files
COPY frontend/src ./src
COPY frontend/public ./public
COPY frontend/index.html ./
COPY frontend/vite.config.js ./

# Build React app for production and clean up
RUN npm run build && rm -rf node_modules

# ===========================================
# STAGE 2: Setup Django Backend (Optimized)
# ===========================================
FROM python:3.11-slim AS backend

# Set working directory for backend
WORKDIR /app

# Install only essential system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy Django requirements file
COPY backend/requirements.txt .

# Install Python dependencies (optimized)
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt && \
    pip cache purge

# Copy only necessary Django files
COPY backend/apps ./apps
COPY backend/taskflow ./taskflow
COPY backend/manage.py ./

# Copy React build files from Stage 1
COPY --from=frontend-builder /app/frontend/dist/index.html ./staticfiles/
COPY --from=frontend-builder /app/frontend/dist/static ./staticfiles/static

# Collect static files
RUN python manage.py collectstatic --noinput

# ===========================================
# STAGE 3: Final Runtime (Minimal)
# ===========================================
FROM python:3.11-slim AS final

# Set working directory
WORKDIR /app

# Copy Python packages from backend stage
COPY --from=backend /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=backend /usr/local/bin /usr/local/bin

# Copy application files
COPY --from=backend /app .

# Set environment variables
ENV PYTHONPATH=/app
ENV DJANGO_SETTINGS_MODULE=taskflow.settings
ENV PYTHONUNBUFFERED=1

# Create non-root user
RUN useradd --create-home --shell /bin/bash appuser && \
    chown -R appuser:appuser /app
USER appuser

# Expose port 8000
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python manage.py check || exit 1

# Default command
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]