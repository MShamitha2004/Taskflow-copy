# Deployment Guide for Django + React Application

This guide explains how to use the Docker and CI/CD setup for your full-stack application.

## 📁 Files Created

### 1. `Dockerfile`
A multi-stage Docker build that:
- **Stage 1**: Builds the React frontend using Node.js
- **Stage 2**: Sets up Django backend with Python and serves the React build files
- Automatically runs `collectstatic` and `migrate` commands
- Exposes port 8000 for the application

### 2. `.github/workflows/deploy.yml`
A GitHub Actions CI/CD pipeline that:
- Triggers on pushes to the `main` branch
- Sets up Python and Node.js environments
- Installs dependencies for both frontend and backend
- Runs Django tests
- Builds the React frontend
- Creates and tests a Docker image
- Includes a placeholder for future deployment steps

### 3. `.dockerignore`
Optimizes Docker builds by excluding unnecessary files like:
- `node_modules/` (will be installed fresh)
- Python cache files
- IDE files
- Documentation files

## 🚀 How to Use

### Local Development with Docker

1. **Build the Docker image:**
   ```bash
   docker build -t taskflow-app .
   ```

2. **Run the container:**
   ```bash
   docker run -p 8000:8000 taskflow-app
   ```

3. **Access your application:**
   - Open http://localhost:8000 in your browser
   - The Django backend will serve both API endpoints and the React frontend

### Using GitHub Actions

1. **Push to main branch:**
   ```bash
   git add .
   git commit -m "Add deployment configuration"
   git push origin main
   ```

2. **Check the workflow:**
   - Go to your GitHub repository
   - Click on the "Actions" tab
   - You'll see the CI/CD pipeline running automatically

3. **Monitor the build:**
   - Click on the running workflow to see detailed logs
   - The pipeline will test your application and build the Docker image

## 🔧 What Happens During Build

### Docker Build Process:
1. **Frontend Stage**: Installs Node.js dependencies and builds React app
2. **Backend Stage**: Installs Python dependencies and copies React build files
3. **Final Setup**: Runs Django migrations and collects static files
4. **Ready to Run**: Starts Django development server on port 8000

### CI/CD Pipeline Process:
1. **Setup**: Installs Python 3.11 and Node.js 18
2. **Dependencies**: Installs all required packages
3. **Testing**: Runs Django unit tests
4. **Building**: Creates React production build
5. **Docker**: Builds and tests Docker image
6. **Deployment**: Placeholder for future deployment steps

## 🎯 Learning Benefits

This setup helps you learn:
- **Containerization**: How to package applications with Docker
- **CI/CD**: Automated testing and building
- **Multi-stage builds**: Optimizing Docker images
- **Production readiness**: Preparing apps for deployment

## 🔍 Troubleshooting

### Common Issues:

1. **Port already in use:**
   ```bash
   # Use a different port
   docker run -p 8001:8000 taskflow-app
   ```

2. **Build fails:**
   - Check that all dependencies are in `requirements.txt` and `package.json`
   - Ensure all files are properly copied in the Dockerfile

3. **Static files not loading:**
   - Verify `STATIC_ROOT` and `STATICFILES_DIRS` in Django settings
   - Check that React build files are copied to the correct location

## 🚀 Next Steps for Production

When you're ready for real deployment, you can:

1. **Add environment variables** for production settings
2. **Use a production database** (PostgreSQL, MySQL)
3. **Add a reverse proxy** (Nginx) for better performance
4. **Deploy to cloud platforms** like:
   - AWS (ECS, Elastic Beanstalk)
   - Google Cloud (Cloud Run, App Engine)
   - Azure (Container Instances)
   - Heroku, Render, or DigitalOcean

## 📚 Development vs Production

- **Current setup**: Uses Django's development server (good for learning)
- **Production**: Should use WSGI servers like Gunicorn or uWSGI
- **Database**: Currently uses SQLite (good for development)
- **Production**: Should use PostgreSQL or MySQL

## 🎓 Learning Path

1. **Start here**: Use Docker locally to understand containerization
2. **Practice**: Push code to GitHub and watch CI/CD pipeline run
3. **Experiment**: Modify Dockerfile and see how it affects builds
4. **Advance**: Add real deployment steps when ready

This setup gives you a solid foundation for learning deployment concepts while keeping things simple and beginner-friendly! 🎯
