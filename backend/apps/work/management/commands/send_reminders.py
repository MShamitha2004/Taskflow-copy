from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta, datetime
from django.contrib.auth.models import User
from apps.work.models import Task, Notification, ProjectMembership
from apps.work.notification_service import create_notification


class Command(BaseCommand):
    help = 'Send deadline reminder notifications'

    def add_arguments(self, parser):
        parser.add_argument(
            '--hours',
            type=int,
            default=24,
            help='Hours before deadline to send reminder (default: 24)'
        )

    def handle(self, *args, **options):
        hours = options['hours']
        now = timezone.now()
        reminder_time = now + timedelta(hours=hours)
        
        self.stdout.write(f'Checking for tasks due in {hours} hours...')
        
        # Find tasks due in the specified time window
        tasks_due = Task.objects.filter(
            due_at__isnull=False,
            due_at__gte=now,
            due_at__lte=reminder_time,
            status__in=['TO_DO', 'IN_PROGRESS', 'REVIEW']
        ).select_related('assignee', 'project')
        
        notifications_sent = 0
        
        for task in tasks_due:
            # Send reminder to task assignee
            if task.assignee:
                create_notification(
                    user=task.assignee,
                    notification_type='TASK_DEADLINE_REMINDER',
                    message=f'Reminder: Task {task.title} deadline in {hours} hours ({task.due_at.strftime("%B %d, %Y at %I:%M %p")})',
                    payload={
                        'task_id': task.id,
                        'task_title': task.title,
                        'project_id': task.project.id,
                        'project_name': task.project.name,
                        'due_at': task.due_at.isoformat(),
                        'hours_until_due': hours
                    }
                )
                notifications_sent += 1
            
            # Send reminder to multiple assignees
            for assignee in task.assignees.all():
                if assignee != task.assignee:  # Avoid duplicates
                    create_notification(
                        user=assignee,
                        notification_type='TASK_DEADLINE_REMINDER',
                        message=f'Reminder: Task {task.title} deadline in {hours} hours ({task.due_at.strftime("%B %d, %Y at %I:%M %p")})',
                        payload={
                            'task_id': task.id,
                            'task_title': task.title,
                            'project_id': task.project.id,
                            'project_name': task.project.name,
                            'due_at': task.due_at.isoformat(),
                            'hours_until_due': hours
                        }
                    )
                    notifications_sent += 1
            
            # Send reminder to project owner/scrum master
            project_owner = task.project.created_by
            if project_owner != task.assignee and project_owner not in task.assignees.all():
                create_notification(
                    user=project_owner,
                    notification_type='TASK_DEADLINE_REMINDER',
                    message=f'Reminder: Task {task.title} deadline in {hours} hours ({task.due_at.strftime("%B %d, %Y at %I:%M %p")})',
                    payload={
                        'task_id': task.id,
                        'task_title': task.title,
                        'project_id': task.project.id,
                        'project_name': task.project.name,
                        'due_at': task.due_at.isoformat(),
                        'hours_until_due': hours
                    }
                )
                notifications_sent += 1
        
        # Check for idle tasks (in Review status for more than 3 days)
        idle_threshold = now - timedelta(days=3)
        idle_tasks = Task.objects.filter(
            status='REVIEW',
            updated_at__lte=idle_threshold
        ).select_related('assignee', 'project')
        
        for task in idle_tasks:
            # Send idle reminder to project owner/scrum master
            project_owner = task.project.created_by
            Notification.objects.create(
                user=project_owner,
                type='REMINDER_IDLE',
                message=f'Task {task.title} has been idle in "Review" for 3 days',
                payload={
                    'task_id': task.id,
                    'task_title': task.title,
                    'project_id': task.project.id,
                    'project_name': task.project.name,
                    'status': task.status,
                    'days_idle': 3
                }
            )
            notifications_sent += 1
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully sent {notifications_sent} reminder notifications')
        )
