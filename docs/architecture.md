Architecture

High-Level
- Frontend: React SPA
- Backend: Django + DRF; JWT auth; CORS
- Database: PostgreSQL
- Background jobs: Celery + Redis (reminders, summaries)
- Realtime: Django Channels/WebSockets (planned)

Core Models (initial)
- User, Profile
- Project, ProjectMembership(role)
- Task(status, priority, due_at, assignee, tags)
- Comment, Attachment
- ActivityEvent(entity, action, user_id, metadata, at)
- Suggestion, Reminder

APIs
- Auth: register/login/refresh (JWT)
- Projects: CRUD, invite, membership
- Tasks: CRUD, transitions, comments, attachments
- Analytics: metrics (completed per week, cycle time, time-in-column)

Diagrams
- Include sequence: drag card → update status → log event → analytics rollup.
- Include ERD of the above models.

Deployment
- Dev: local Docker (optional) or native
- Prod (later): Render/Heroku/AWS; Postgres managed service


