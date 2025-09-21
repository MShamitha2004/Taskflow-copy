from django.contrib.auth.models import User
from django.utils.crypto import get_random_string
from rest_framework import serializers

from .models import Project, ProjectMembership, Task, Comment, Attachment, ActivityEvent, Notification, ProjectChatMessage


class UserSlimSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "first_name", "last_name"]


class ProjectSerializer(serializers.ModelSerializer):
    key = serializers.CharField(required=False, allow_blank=True)
    created_by = UserSlimSerializer(read_only=True)
    reporter = UserSlimSerializer(read_only=True)
    reporter_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source="reporter", write_only=True, allow_null=True, required=False
    )
    attachment = serializers.FileField(required=False, allow_null=True)

    class Meta:
        model = Project
        fields = [
            "id",
            "name",
            "key",
            "description",
            "team",
            "start_date",
            "due_date",
            "reporter",
            "reporter_id",
            "attachment",
            "created_by",
            "created_at",
        ]

    def create(self, validated_data):
        # Auto-generate a project key from name first 3 letters (lowercase), ensure uniqueness: des, des1, des2...
        from .models import Project
        raw_name = (validated_data.get("name") or "").strip()
        provided = (validated_data.get("key") or "").strip()
        if provided:
            validated_data["key"] = provided
            return super().create(validated_data)

        # Normalize: letters only, take first 3, fallback to 'prj'
        import re
        letters_only = re.sub(r"[^a-zA-Z]", "", raw_name)
        base = (letters_only[:3].lower() or "prj")

        # Ensure uniqueness with incremental numeric suffixes
        existing = set(Project.objects.filter(key__startswith=base).values_list("key", flat=True))
        if base not in existing:
            key = base
        else:
            i = 1
            while True:
                candidate = f"{base}{i}"
                if candidate not in existing:
                    key = candidate
                    break
                i += 1

        validated_data["key"] = key
        return super().create(validated_data)


class ProjectMembershipSerializer(serializers.ModelSerializer):
    user = UserSlimSerializer(read_only=True)
    invited_by = UserSlimSerializer(read_only=True)

    class Meta:
        model = ProjectMembership
        fields = ["id", "project", "user", "role", "status", "invited_by", "invited_at", "responded_at", "joined_at"]
        read_only_fields = ["joined_at"]


class TaskSerializer(serializers.ModelSerializer):
    assignee = UserSlimSerializer(read_only=True)
    assignee_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source="assignee", write_only=True, allow_null=True, required=False
    )
    assignees = UserSlimSerializer(read_only=True, many=True)
    assignee_ids = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), many=True, write_only=True, required=False, source='assignees')
    project_key = serializers.CharField(source="project.key", read_only=True)
    sequence = serializers.IntegerField(read_only=True)

    class Meta:
        model = Task
        fields = [
            "id",
            "project",
            "project_key",
            "sequence",
            "title",
            "description",
            "status",
            "assignee",
            "assignee_id",
            "assignees",
            "assignee_ids",
            "priority",
            "tags",
            "due_at",
            "points",
            "created_by",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_by", "created_at", "updated_at"]


class CommentSerializer(serializers.ModelSerializer):
    author = UserSlimSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ["id", "task", "author", "body", "created_at"]
        read_only_fields = ["created_at"]


class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = ["id", "task", "filename", "url", "uploaded_by", "created_at"]
        read_only_fields = ["created_at"]


class ActivityEventSerializer(serializers.ModelSerializer):
    actor = UserSlimSerializer(read_only=True)

    class Meta:
        model = ActivityEvent
        fields = ["id", "actor", "entity_type", "entity_id", "action", "metadata", "created_at"]
        read_only_fields = ["created_at"]


class NotificationSerializer(serializers.ModelSerializer):
    recipient_id = serializers.IntegerField(write_only=True, required=False)
    
    class Meta:
        model = Notification
        fields = ["id", "type", "message", "payload", "read_at", "created_at", "user", "recipient_id"]
        read_only_fields = ["created_at", "user"]
    
    def create(self, validated_data):
        # If recipient_id is provided, find the user and set it
        recipient_id = validated_data.pop('recipient_id', None)
        if recipient_id:
            from django.contrib.auth.models import User
            try:
                recipient_user = User.objects.get(id=recipient_id)
                validated_data['user'] = recipient_user
            except User.DoesNotExist:
                raise serializers.ValidationError(f"User with id {recipient_id} does not exist")
        else:
            # Default to the current user
            validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class ProjectChatMessageSerializer(serializers.ModelSerializer):
    sender = UserSlimSerializer(read_only=True)
    pinned_by = UserSlimSerializer(read_only=True)
    file = serializers.FileField(required=False, allow_null=True)

    class Meta:
        model = ProjectChatMessage
        fields = ["id", "project", "sender", "text", "file", "file_name", "pinned", "pinned_by", "pinned_at", "created_at"]
        read_only_fields = ["created_at", "sender", "pinned_by", "pinned_at"]

