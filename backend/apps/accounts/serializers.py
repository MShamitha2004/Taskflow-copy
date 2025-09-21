from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework import exceptions
from django.utils.crypto import get_random_string
from .models import UserProfile


class RegisterSerializer(serializers.ModelSerializer):
    """Email-first registration. Username is auto-derived and hidden from clients.

    Accepts: email (required), password (required), first_name/last_name (optional).
    Enforces unique email at application level.
    """

    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ["email", "password", "first_name", "last_name"]

    def validate_email(self, value):
        # Enforce unique email at app level (DB field not unique by default)
        if User.objects.filter(email__iexact=value).exists():
            raise exceptions.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        password = validated_data.pop("password")
        email = validated_data.pop("email").strip().lower()
        # Derive a unique username since Django's default user requires it
        base_username = email
        username = base_username
        suffix_attempts = 0
        while User.objects.filter(username=username).exists():
            suffix_attempts += 1
            username = f"{base_username}-{get_random_string(6)}"
            if suffix_attempts > 5:
                # fallback to a stronger random username
                username = f"user-{get_random_string(12)}"
                break
        user = User(username=username, email=email, **validated_data)
        user.set_password(password)
        user.save()
        
        # Create user profile with default notification settings
        UserProfile.objects.create(user=user)
        
        return user


class UserSlimSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "first_name", "last_name"]


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user notification preferences and settings."""
    
    class Meta:
        model = UserProfile
        fields = [
            'notifications_created',
            'notifications_assigned', 
            'notifications_reported',
            'notifications_watching',
            'notifications_mentions',
            'do_not_disturb_enabled',
            'do_not_disturb_until',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


