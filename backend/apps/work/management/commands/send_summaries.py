from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta, datetime
from django.contrib.auth.models import User
from django.db.models import Count, Q
from apps.work.models import Task, Notification, ProjectMembership


class Command(BaseCommand):
    help = 'Send daily and weekly summary notifications'

    def add_arguments(self, parser):
        parser.add_argument(
            '--type',
            type=str,
            choices=['daily', 'weekly'],
            default='daily',
            help='Type of summary to send (daily or weekly)'
        )

    def handle(self, *args, **options):
        summary_type = options['type']
        now = timezone.now()
        
        if summary_type == 'daily':
            self.send_daily_summaries(now)
        else:
            self.send_weekly_summaries(now)

    def send_daily_summaries(self, now):
        """Send daily summary notifications to all users"""
        self.stdout.write('Sending daily summary notifications...')
        
        # Get all active users
        users = User.objects.filter(is_active=True)
        notifications_sent = 0
        
        for user in users:
            # Get user's tasks completed today
            today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
            completed_today = Task.objects.filter(
                Q(assignee=user) | Q(assignees=user),
                status='DONE',
                completed_at__gte=today_start
            ).count()
            
            # Get user's overdue tasks
            overdue_tasks = Task.objects.filter(
                Q(assignee=user) | Q(assignees=user),
                due_at__lt=now,
                status__in=['TO_DO', 'IN_PROGRESS', 'REVIEW']
            ).count()
            
            # Get user's tasks due tomorrow
            tomorrow_start = (now + timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
            tomorrow_end = tomorrow_start + timedelta(days=1)
            due_tomorrow = Task.objects.filter(
                Q(assignee=user) | Q(assignees=user),
                due_at__gte=tomorrow_start,
                due_at__lt=tomorrow_end,
                status__in=['TO_DO', 'IN_PROGRESS', 'REVIEW']
            ).count()
            
            # Create daily summary message
            message_parts = []
            if completed_today > 0:
                message_parts.append(f"You completed {completed_today} task{'s' if completed_today != 1 else ''} today")
            
            if due_tomorrow > 0:
                message_parts.append(f"You have {due_tomorrow} task{'s' if due_tomorrow != 1 else ''} due tomorrow")
            
            if overdue_tasks > 0:
                message_parts.append(f"You have {overdue_tasks} overdue task{'s' if overdue_tasks != 1 else ''}")
            
            if not message_parts:
                message_parts.append("No tasks completed today")
            
            message = f"Daily Summary: {', '.join(message_parts)}"
            
            Notification.objects.create(
                user=user,
                type='DAILY_SUMMARY',
                message=message,
                payload={
                    'completed_today': completed_today,
                    'due_tomorrow': due_tomorrow,
                    'overdue_tasks': overdue_tasks,
                    'date': now.date().isoformat()
                }
            )
            notifications_sent += 1
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully sent {notifications_sent} daily summary notifications')
        )

    def send_weekly_summaries(self, now):
        """Send weekly summary notifications to all users"""
        self.stdout.write('Sending weekly summary notifications...')
        
        # Get all active users
        users = User.objects.filter(is_active=True)
        notifications_sent = 0
        
        # Calculate week start (Monday)
        week_start = now - timedelta(days=now.weekday())
        week_start = week_start.replace(hour=0, minute=0, second=0, microsecond=0)
        
        for user in users:
            # Get user's tasks completed this week
            completed_this_week = Task.objects.filter(
                Q(assignee=user) | Q(assignees=user),
                status='DONE',
                completed_at__gte=week_start
            ).count()
            
            # Get user's overdue tasks
            overdue_tasks = Task.objects.filter(
                Q(assignee=user) | Q(assignees=user),
                due_at__lt=now,
                status__in=['TO_DO', 'IN_PROGRESS', 'REVIEW']
            ).count()
            
            # Get user's tasks due next week
            next_week_start = week_start + timedelta(days=7)
            next_week_end = next_week_start + timedelta(days=7)
            due_next_week = Task.objects.filter(
                Q(assignee=user) | Q(assignees=user),
                due_at__gte=next_week_start,
                due_at__lt=next_week_end,
                status__in=['TO_DO', 'IN_PROGRESS', 'REVIEW']
            ).count()
            
            # Create weekly summary message
            message_parts = []
            if completed_this_week > 0:
                message_parts.append(f"{completed_this_week} tasks completed this week")
            
            if due_next_week > 0:
                message_parts.append(f"{due_next_week} tasks due next week")
            
            if overdue_tasks > 0:
                message_parts.append(f"{overdue_tasks} overdue tasks")
            
            if not message_parts:
                message_parts.append("No tasks completed this week")
            
            message = f"Weekly Update: {', '.join(message_parts)}"
            
            Notification.objects.create(
                user=user,
                type='WEEKLY_UPDATE',
                message=message,
                payload={
                    'completed_this_week': completed_this_week,
                    'due_next_week': due_next_week,
                    'overdue_tasks': overdue_tasks,
                    'week_start': week_start.date().isoformat(),
                    'week_end': (week_start + timedelta(days=6)).date().isoformat()
                }
            )
            notifications_sent += 1
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully sent {notifications_sent} weekly summary notifications')
        )
