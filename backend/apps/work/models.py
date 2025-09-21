from django.db import models
from django.contrib.auth.models import User


class Project(models.Model):
    name = models.CharField(max_length=200)
    key = models.CharField(max_length=16, unique=True)
    description = models.TextField(blank=True)
    team = models.CharField(max_length=255, blank=True)
    start_date = models.DateField(null=True, blank=True)
    due_date = models.DateField(null=True, blank=True)
    reporter = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reported_projects')
    attachment = models.FileField(upload_to='project_attachments/', null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='projects_created')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"{self.key}: {self.name}"


class ProjectMembership(models.Model):
    ROLE_CHOICES = (
        ('OWNER', 'Project Owner'),
        ('SCRUM_MASTER', 'Scrum Master'),
        ('EMPLOYEE', 'Employee'),
    )
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('ACCEPTED', 'Accepted'),
        ('DECLINED', 'Declined'),
    )
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='memberships')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='memberships')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='EMPLOYEE')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACCEPTED')
    invited_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='invitations_sent')
    invited_at = models.DateTimeField(null=True, blank=True)
    responded_at = models.DateTimeField(null=True, blank=True)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('project', 'user')


class Task(models.Model):
    STATUS_CHOICES = (
        ('TO_DO', 'To Do'),
        ('IN_PROGRESS', 'In Progress'),
        ('REVIEW', 'Review'),
        ('DONE', 'Done'),
    )
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='tasks')
    sequence = models.IntegerField(null=True, blank=True, help_text="Per-project sequence starting at 1")
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='TO_DO')
    assignee = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_tasks')
    assignees = models.ManyToManyField(User, blank=True, related_name='tasks_assigned')
    priority = models.CharField(max_length=16, default='MEDIUM')
    due_at = models.DateTimeField(null=True, blank=True)
    tags = models.CharField(max_length=255, blank=True, help_text="Comma-separated tags")
    points = models.IntegerField(null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tasks_created')
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return self.title


class Comment(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)


class Attachment(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='attachments')
    filename = models.CharField(max_length=255)
    url = models.URLField()
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)


class ActivityEvent(models.Model):
    ENTITY_CHOICES = (
        ('TASK', 'Task'),
        ('PROJECT', 'Project'),
    )
    ACTION_CHOICES = (
        ('CREATED', 'Created'),
        ('UPDATED', 'Updated'),
        ('MOVED', 'Moved'),
        ('COMMENTED', 'Commented'),
        ('ASSIGNED', 'Assigned'),
        ('COMPLETED', 'Completed'),
    )
    actor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    entity_type = models.CharField(max_length=16, choices=ENTITY_CHOICES)
    entity_id = models.IntegerField()
    action = models.CharField(max_length=16, choices=ACTION_CHOICES)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['entity_type', 'entity_id']),
            models.Index(fields=['created_at']),
        ]


class Notification(models.Model):
    NOTIF_TYPES = (
        ('MENTION', 'Mention'),
        ('TASK_UPDATE', 'Task Update'),
        ('PROJECT_INVITATION', 'Project Invitation'),
        ('PROJECT_INVITATION_ACCEPTED', 'Project Invitation Accepted'),
        ('PROJECT_INVITATION_DECLINED', 'Project Invitation Declined'),
        ('PROJECT_INVITE', 'Project Invite'),
        ('PROJECT_INVITE_RESPONSE', 'Project Invite Response'),
        ('TASK_ASSIGNED', 'Task Assigned'),
        ('TASK_COMPLETED', 'Task Completed'),
        ('COMMENT_MENTION', 'Comment Mention'),
        ('PROJECT_REPORTER_ASSIGNED', 'Project Reporter Assigned'),
        # Project-Level Notifications
        ('PROJECT_DEADLINE_CHANGED', 'Project Deadline Changed'),
        ('PROJECT_DELETED', 'Project Deleted'),
        ('PROJECT_REMOVED', 'Project Removed'),
        # Task-Level Notifications
        ('TASK_DEADLINE_REMINDER', 'Task Deadline Reminder'),
        ('TASK_STATUS_CHANGED', 'Task Status Changed'),
        ('TASK_REMOVED', 'Task Removed'),
        # Collaboration/Comments
        ('COMMENT_ADDED', 'Comment Added'),
        ('ATTACHMENT_UPLOADED', 'Attachment Uploaded'),
        # Reminders & Productivity Alerts
        ('REMINDER_24H', '24 Hour Reminder'),
        ('REMINDER_IDLE', 'Idle Task Reminder'),
        ('DAILY_SUMMARY', 'Daily Summary'),
        ('WEEKLY_UPDATE', 'Weekly Update'),
        # System/General
        ('PASSWORD_CHANGED', 'Password Changed'),
        ('APP_UPDATE', 'App Update'),
        ('NOTIFICATIONS_SNOOZED', 'Notifications Snoozed'),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    type = models.CharField(max_length=32, choices=NOTIF_TYPES)
    message = models.TextField(blank=True, help_text="Formatted notification message")
    payload = models.JSONField(default=dict, blank=True)
    read_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['user', 'created_at']),
        ]



class ProjectChatMessage(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='chat_messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='project_chat_messages')
    text = models.TextField(blank=True)
    file = models.FileField(upload_to='project_chat/', null=True, blank=True)
    file_name = models.CharField(max_length=255, blank=True, null=True)
    pinned = models.BooleanField(default=False)
    pinned_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='pinned_messages')
    pinned_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['project', 'created_at']),
        ]

    def __str__(self) -> str:
        return f"{self.project_id} by {self.sender_id} @ {self.created_at:%Y-%m-%d %H:%M}"

