# Multi-stage Dockerfile for Django + React Application
# This file creates a container that runs both Django backend and React frontend

# ===========================================
# STAGE 1: Build React Frontend
# ===========================================
# Use Node.js 18 as the base image for building React
FROM node:18-alpine AS frontend-builder

# Set working directory for frontend
WORKDIR /app/frontend

# Copy package files first (for better Docker layer caching)
COPY frontend/package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy all frontend source code
COPY frontend/ .

# Build React app for production
# This creates optimized, minified files in 'dist' folder
RUN npm run build

# ===========================================
# STAGE 2: Setup Django Backend
# ===========================================
# Use Python 3.11 as the base image for Django
FROM python:3.11-alpine AS backend

# Set working directory for backend
WORKDIR /app

# Install system dependencies needed for Python packages
RUN apk add --no-cache \
    gcc \
    musl-dev \
    postgresql-dev \
    && rm -rf /var/cache/apk/*

# Copy Django requirements file
COPY backend/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy Django backend code
COPY backend/ .

# Copy React build files from Stage 1 to Django's static directory
# This allows Django to serve the React app
COPY --from=frontend-builder /app/frontend/dist ./staticfiles/

# ===========================================
# STAGE 3: Final Setup and Run
# ===========================================
# Set environment variables for Django
ENV PYTHONPATH=/app
ENV DJANGO_SETTINGS_MODULE=taskflow.settings

# Create a non-root user for security
RUN adduser -D -s /bin/sh appuser && chown -R appuser:appuser /app
USER appuser

# Expose port 8000 (Django's default port)
EXPOSE 8000

# Health check to ensure container is running properly
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD python manage.py check || exit 1

# Default command: Run Django development server
# 0.0.0.0 means listen on all network interfaces (needed for Docker)
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

# ===========================================
# What this Dockerfile does:
# ===========================================
# 1. Builds React frontend with Node.js
# 2. Sets up Django backend with Python
# 3. Copies React build files to Django's static directory
# 4. Runs Django commands (collectstatic, migrate) automatically
# 5. Starts Django server on port 8000
# 6. Serves both API and React frontend from the same container
