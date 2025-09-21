from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
    """Extended user profile to store notification preferences and other settings."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    
    # Notification preferences
    notifications_created = models.BooleanField(default=True, help_text="Notify when projects/tasks are created")
    notifications_assigned = models.BooleanField(default=True, help_text="Notify when tasks/projects are assigned to user")
    notifications_reported = models.BooleanField(default=True, help_text="Notify when user is set as reporter")
    notifications_watching = models.BooleanField(default=True, help_text="Notify when user is watching a project/task")
    notifications_mentions = models.BooleanField(default=True, help_text="Notify when someone mentions the user (@mailID)")
    
    # Do Not Disturb settings
    do_not_disturb_enabled = models.BooleanField(default=False, help_text="Whether Do Not Disturb is currently active")
    do_not_disturb_until = models.DateTimeField(null=True, blank=True, help_text="Do Not Disturb expires at this time")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Profile for {self.user.email}"
    
    def is_do_not_disturb_active(self):
        """Check if Do Not Disturb is currently active."""
        if not self.do_not_disturb_enabled:
            return False
        if not self.do_not_disturb_until:
            return False
        from django.utils import timezone
        return timezone.now() < self.do_not_disturb_until


class PasswordResetOTP(models.Model):
    email = models.EmailField()
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    used = models.BooleanField(default=False)

    class Meta:
        indexes = [
            models.Index(fields=["email", "code"]),
            models.Index(fields=["expires_at"]),
        ]

    def __str__(self) -> str:
        return f"OTP for {self.email} ({'used' if self.used else 'active'})"


