TaskFlow — Behavior-Driven Task Management

Overview
TaskFlow is a Jira/Trello-style task manager with integrated behavioral analytics. It helps teams visualize work, measure how work actually flows, and receive actionable suggestions to improve focus and throughput.

Key Features (MVP)
- Auth: Email/password (Google sign-in later), role-based access (Scrum Master, Employee)
- Projects & Memberships: Create projects, invite members, manage roles
- Kanban Board: To Do → In Progress → Review → Done with drag-and-drop
- Tasks: Title, description, due date, assignee, comments, @mentions, attachments
- Activity History: Auto-logged timeline of changes
- Views: Kanban, List, Calendar, Dashboard
- Analytics: Tasks completed per week, cycle/lead time, time-in-column, staleness
- Notifications: Mentions, task updates, invitations

Advanced (Planned)
- Behavioral analytics event stream, productivity/focus windows, load balancing, coaching tips

Tech Stack
- Frontend: React
- Backend: Python (Django + DRF)
- Database: PostgreSQL
- Jobs/Realtime: Celery + Redis (planned), WebSockets (channels)
- Charts: Chart.js (initial)

Getting Started (Development)
Prerequisites
- Python 3.10+
- Node.js 18+ and npm (for frontend)
- Git

Setup
1. Clone repository
2. Backend: see `backend/README.md` (to be added)
3. Frontend: see `frontend/README.md` (to be added)

Repository Structure
```
backend/           # Django project (APIs, auth, analytics)
frontend/          # React app (Kanban, dashboards)
docs/              # Documentation and diagrams
.github/           # Issue/PR templates, workflows
```

Documentation
- docs/overview.md — problem, objectives, scope, roles
- docs/architecture.md — system design, diagrams, ERD
- docs/analytics.md — events, metrics, dashboards, suggestions

Contributing
- Branching: feature/<name>, fix/<name>
- Commits: Conventional Commits (e.g., feat:, fix:, chore:)
- PRs: small, descriptive, linked to issue

License
MIT (to confirm)


