"""
Notification service utilities that respect user preferences.
"""
from django.contrib.auth.models import User
from .models import Notification
from apps.accounts.models import UserProfile
from django.utils import timezone


def should_send_notification(user, notification_type):
    """
    Check if a notification should be sent to a user based on their preferences.
    
    Args:
        user: User instance
        notification_type: Type of notification (e.g., 'TASK_ASSIGNED', 'MENTION', etc.)
    
    Returns:
        bool: True if notification should be sent, False otherwise
    """
    try:
        profile = user.profile
    except UserProfile.DoesNotExist:
        # If no profile exists, create one with default settings
        profile = UserProfile.objects.create(user=user)
    
    # Check Do Not Disturb first
    if profile.is_do_not_disturb_active():
        return False
    
    # Map notification types to user preferences
    notification_mapping = {
        # Created notifications
        'TASK_CREATED': 'notifications_created',
        'PROJECT_CREATED': 'notifications_created',
        
        # Assigned notifications
        'TASK_ASSIGNED': 'notifications_assigned',
        'PROJECT_INVITATION': 'notifications_assigned',
        'PROJECT_INVITE': 'notifications_assigned',
        
        # Reporter notifications
        'PROJECT_REPORTER_ASSIGNED': 'notifications_reported',
        
        # Watching notifications (when user is watching a project/task)
        'TASK_STATUS_CHANGED': 'notifications_watching',
        'TASK_DEADLINE_REMINDER': 'notifications_watching',
        'PROJECT_DEADLINE_CHANGED': 'notifications_watching',
        'COMMENT_ADDED': 'notifications_watching',
        'ATTACHMENT_UPLOADED': 'notifications_watching',
        
        # Mention notifications
        'MENTION': 'notifications_mentions',
        'COMMENT_MENTION': 'notifications_mentions',
        
        # System notifications (always sent)
        'PASSWORD_CHANGED': True,
        'APP_UPDATE': True,
        'NOTIFICATIONS_SNOOZED': True,
        'DAILY_SUMMARY': True,
        'WEEKLY_UPDATE': True,
    }
    
    preference_key = notification_mapping.get(notification_type)
    
    # If no mapping found, default to sending the notification
    if preference_key is None:
        return True
    
    # If preference_key is True, always send
    if preference_key is True:
        return True
    
    # Check the specific preference
    return getattr(profile, preference_key, True)


def create_notification(user, notification_type, message, payload=None):
    """
    Create a notification for a user if their preferences allow it.
    
    Args:
        user: User instance
        notification_type: Type of notification
        message: Notification message
        payload: Optional payload data
    
    Returns:
        Notification instance if created, None if not sent due to preferences
    """
    if not should_send_notification(user, notification_type):
        return None
    
    return Notification.objects.create(
        user=user,
        type=notification_type,
        message=message,
        payload=payload or {}
    )


def create_notifications_for_users(users, notification_type, message, payload=None):
    """
    Create notifications for multiple users, respecting each user's preferences.
    
    Args:
        users: List of User instances
        notification_type: Type of notification
        message: Notification message
        payload: Optional payload data
    
    Returns:
        List of created Notification instances
    """
    created_notifications = []
    for user in users:
        notification = create_notification(user, notification_type, message, payload)
        if notification:
            created_notifications.append(notification)
    return created_notifications


def get_notification_preferences(user):
    """
    Get notification preferences for a user.
    
    Args:
        user: User instance
    
    Returns:
        dict: User's notification preferences
    """
    try:
        profile = user.profile
    except UserProfile.DoesNotExist:
        profile = UserProfile.objects.create(user=user)
    
    return {
        'notifications_created': profile.notifications_created,
        'notifications_assigned': profile.notifications_assigned,
        'notifications_reported': profile.notifications_reported,
        'notifications_watching': profile.notifications_watching,
        'notifications_mentions': profile.notifications_mentions,
        'do_not_disturb_enabled': profile.do_not_disturb_enabled,
        'do_not_disturb_until': profile.do_not_disturb_until,
        'is_do_not_disturb_active': profile.is_do_not_disturb_active()
    }
