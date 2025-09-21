<<<<<<< HEAD
# TaskFlow Management System

A comprehensive task management platform inspired by Jira/Trello with integrated behavioral analytics. Built with React frontend and Django REST API backend.

## 🚀 Overview

TaskFlow is a modern task management system that helps teams visualize work, measure productivity, and receive actionable insights to improve focus and throughput. It combines the best features of project management tools with advanced analytics capabilities.

## ✨ Key Features

### 🔐 Authentication & User Management
- **Email/Password Login** with secure JWT tokens
- **Google OAuth Integration** for seamless sign-in
- **Role-based Access Control** (Scrum Master, Employee)
- **User Profile Management** with notification preferences
- **Account Security** with password reset and account deletion

### 📋 Project & Task Management
- **Project Creation** with team member invitations
- **Kanban Board** with drag-and-drop functionality (To Do → In Progress → Review → Done)
- **Rich Task Details** including descriptions, due dates, assignees, tags
- **File Attachments** and project document management
- **Activity Timeline** with automatic change logging

### 💬 Collaboration Features
- **Comments System** with @mention notifications
- **Real-time Notifications** with smart filtering
- **Notification Settings** with Do Not Disturb mode
- **Team Invitations** with email validation

### 📊 Analytics & Insights
- **Dashboard Analytics** with task completion metrics
- **Cycle Time Analysis** and productivity tracking
- **Project Progress** visualization
- **Team Performance** insights

### 🎨 User Experience
- **Responsive Design** for desktop and mobile
- **Dark/Light Theme** switching
- **Modern UI/UX** with smooth animations
- **Intuitive Navigation** with breadcrumbs

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Modern CSS
- **Backend**: Django 5.2, Django REST Framework
- **Database**: SQLite (development), PostgreSQL (production ready)
- **Authentication**: JWT tokens, Google OAuth
- **File Storage**: Local media handling
- **Deployment**: Docker ready

## 📋 Prerequisites

- **Python 3.10+**
- **Node.js 18+** and npm
- **Git**
- **Modern web browser**

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/taskflow-management-system.git
cd taskflow-management-system
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **Admin Panel**: http://localhost:8000/admin

## 📖 Usage Guide

### Getting Started
1. **Register** a new account or use Google OAuth
2. **Create** your first project
3. **Invite** team members via email
4. **Add tasks** and organize them on the Kanban board
5. **Track progress** using the analytics dashboard

### Key Workflows
- **Project Management**: Create → Invite → Organize → Track
- **Task Lifecycle**: To Do → In Progress → Review → Done
- **Team Collaboration**: Assign → Comment → Notify → Complete
- **Analytics Review**: Dashboard → Insights → Improvements

### User Roles
- **Scrum Master**: Full project control, analytics access
- **Employee**: Task management, project participation

## 🏗️ Project Structure

```
taskflow-management-system/
├── backend/                 # Django REST API
│   ├── apps/
│   │   ├── accounts/        # User authentication & profiles
│   │   ├── core/           # Core utilities
│   │   └── work/           # Projects, tasks, notifications
│   ├── taskflow/           # Django settings
│   └── manage.py
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Main application pages
│   │   └── App.jsx         # Main application component
│   └── package.json
├── docs/                   # Documentation
│   ├── overview.md
│   ├── architecture.md
│   └── analytics.md
└── README.md
```

## 🔧 Development

### Backend Development
```bash
cd backend

# Run tests
python manage.py test

# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Start development server
python manage.py runserver
```

### Frontend Development
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint
```

### Environment Variables
Create `.env` files for configuration:

**Backend (.env)**:
```
SECRET_KEY=your-secret-key
DEBUG=True
DATABASE_URL=sqlite:///db.sqlite3
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

**Frontend (.env)**:
```
VITE_API_BASE_URL=http://localhost:8000/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Development Workflow
1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'feat: add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Code Standards
- **Backend**: Follow PEP 8, use type hints, write tests
- **Frontend**: Use ESLint, follow React best practices
- **Commits**: Use conventional commits (feat:, fix:, docs:, etc.)
- **PRs**: Keep them small, descriptive, and linked to issues

### Branch Naming
- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring

### Pull Request Guidelines
- **Title**: Clear, descriptive title
- **Description**: Explain what, why, and how
- **Tests**: Include tests for new features
- **Documentation**: Update docs if needed
- **Screenshots**: For UI changes

## 🐛 Bug Reports

Found a bug? Please create an issue with:
- **Description**: Clear description of the bug
- **Steps to Reproduce**: Detailed steps
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Environment**: OS, browser, versions
- **Screenshots**: If applicable

## 🚀 Future Improvements

### Planned Features
- **Email Server Integration**: SMTP configuration for OTP and password reset
- **Real-time Notifications**: WebSocket implementation
- **Advanced Analytics**: Behavioral insights and productivity metrics
- **Mobile App**: React Native mobile application
- **API Documentation**: Swagger/OpenAPI documentation
- **Docker Deployment**: Containerized deployment setup
- **CI/CD Pipeline**: Automated testing and deployment

### Technical Enhancements
- **Database Migration**: PostgreSQL for production
- **Caching**: Redis for improved performance
- **Background Tasks**: Celery for async processing
- **File Storage**: AWS S3 for scalable file handling
- **Monitoring**: Application performance monitoring

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Developer**: M Shamitha
- **Organization**: K.S School of Engineering and Management

## 🙏 Acknowledgments

- Django and React communities for excellent documentation
- Jira and Trello for UI/UX inspiration
- Open source contributors and maintainers

---

**Built with ❤️ for better team productivity**


=======
# Taskflow-Management-System
A comprehensive task management system with Kanban boards, behavioral analytics, and smart notifications. Built with React frontend and Django REST API backend.
>>>>>>> dd2b365464ca853e6517ecd2eb03ed83bb5a5c44
