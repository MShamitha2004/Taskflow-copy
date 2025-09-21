from django.db.models import Q
from rest_framework import viewsets, permissions
from rest_framework.exceptions import PermissionDenied
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import FileResponse, Http404
from django.conf import settings
from django.core.files.storage import default_storage
from django.utils import timezone
from django.db.models.functions import TruncWeek
from django.db.models import Count
from django.contrib.auth.models import User
from .models import Project, ProjectMembership, Task, Comment, ActivityEvent, Notification, Attachment, ProjectChatMessage
from .notification_service import create_notification
from .serializers import (
    ProjectSerializer,
    TaskSerializer,
    CommentSerializer,
    NotificationSerializer,
    ActivityEventSerializer,
    AttachmentSerializer,
    ProjectChatMessageSerializer,
    ProjectMembershipSerializer,
)


class IsAuthenticatedOrReadOnly(permissions.IsAuthenticatedOrReadOnly):
    pass


class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def list(self, request, *args, **kwargs):
        print(f"ProjectViewSet.list called by user {request.user.id} ({request.user.email})")
        print(f"Request headers: {dict(request.headers)}")
        
        # Force queryset recalculation
        queryset = self.get_queryset()
        print(f"Queryset from get_queryset(): {queryset.count()} projects")
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def get_queryset(self):
        user = self.request.user
        print(f"ProjectViewSet.get_queryset: User {user.id} ({user.email}) requesting projects")
        print(f"User is authenticated: {user.is_authenticated}")
        print(f"User ID: {user.id}")
        
        # Get projects created by user
        created_projects = Project.objects.filter(created_by=user)
        print(f"Projects created by user: {created_projects.count()}")
        for project in created_projects:
            print(f"  - Created project {project.id}: {project.name}")
        
        # Get projects where user is a member
        member_projects = Project.objects.filter(memberships__user=user, memberships__status='ACCEPTED')
        print(f"Projects where user is member: {member_projects.count()}")
        for project in member_projects:
            print(f"  - Member project {project.id}: {project.name}")
        
        # Debug: Check all projects in database
        all_projects = Project.objects.all()
        print(f"Total projects in database: {all_projects.count()}")
        for project in all_projects:
            print(f"  - All project {project.id}: {project.name} (created_by: {project.created_by.email})")
        
        # Combine both
        queryset = (
            Project.objects.filter(Q(created_by=user) | Q(memberships__user=user, memberships__status='ACCEPTED'))
            .distinct()
            .order_by('-created_at')
        )
        
        print(f"Total projects returned: {queryset.count()}")
        for project in queryset:
            print(f"  - Project {project.id}: {project.name} (created_by: {project.created_by.email})")
        
        return queryset

    def perform_create(self, serializer):
        project = serializer.save(created_by=self.request.user)
        # Create the project owner membership
        ProjectMembership.objects.get_or_create(
            project=project, 
            user=self.request.user, 
            defaults={
                'role': 'OWNER',
                'status': 'ACCEPTED',
                'joined_at': timezone.now()
            }
        )

    def partial_update(self, request, *args, **kwargs):
        project = self.get_object()
        old_due_date = project.due_date
        
        response = super().partial_update(request, *args, **kwargs)
        
        # Check if due date changed
        project.refresh_from_db()
        if old_due_date != project.due_date:
            # Notify all project members about deadline change
            memberships = ProjectMembership.objects.filter(
                project=project, 
                status='ACCEPTED'
            ).exclude(user=request.user)
            
            for membership in memberships:
                Notification.objects.create(
                    user=membership.user,
                    type='PROJECT_DEADLINE_CHANGED',
                    message=f'Project Owner changed the deadline of {project.name} to {project.due_date.strftime("%B %d, %Y") if project.due_date else "No deadline"}',
                    payload={
                        'project_id': project.id,
                        'project_name': project.name,
                        'old_due_date': old_due_date.isoformat() if old_due_date else None,
                        'new_due_date': project.due_date.isoformat() if project.due_date else None,
                        'changed_by': request.user.get_full_name() or request.user.email
                    }
                )
        
        return response

    def destroy(self, request, *args, **kwargs):
        project = self.get_object()
        
        # Notify all project members about project deletion before deleting
        memberships = ProjectMembership.objects.filter(
            project=project, 
            status='ACCEPTED'
        ).exclude(user=request.user)
        
        for membership in memberships:
            Notification.objects.create(
                user=membership.user,
                type='PROJECT_DELETED',
                message=f'The project {project.name} was deleted by the owner',
                payload={
                    'project_id': project.id,
                    'project_name': project.name,
                    'deleted_by': request.user.get_full_name() or request.user.email
                }
            )
        
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=['get'])
    def activity(self, request, pk=None):
        """Project-level activity feed.

        Scrum Masters see all task events in the project.
        Employees see events relevant to them (their assigned tasks, their own actions, or tasks they created).
        """
        project = self.get_object()
        user = request.user
        is_owner_or_sm = (project.created_by_id == user.id or 
                          ProjectMembership.objects.filter(
                              project=project, 
                              user=user, 
                              role__in=['OWNER', 'SCRUM_MASTER'], 
                              status='ACCEPTED'
                          ).exists())

        task_ids = Task.objects.filter(project=project).values_list('id', flat=True)
        events = ActivityEvent.objects.filter(entity_type='TASK', entity_id__in=task_ids).select_related('actor').order_by('-created_at')

        if not is_owner_or_sm:
            my_task_ids = Task.objects.filter(project=project).filter(Q(assignee=user) | Q(created_by=user)).values_list('id', flat=True)
            events = events.filter(Q(actor=user) | Q(entity_id__in=my_task_ids))

        # limit to latest 200 for performance
        events = events[:200]
        return Response(ActivityEventSerializer(events, many=True).data)
    
    @action(detail=True, methods=['post'])
    def invite_member(self, request, pk=None):
        """Invite a user to join the project as an employee."""
        project = self.get_object()
        user = request.user
        
        # Only project owners can invite members
        if not self._is_project_owner(project, user):
            raise PermissionDenied('Only project owners can invite members')
        
        email = request.data.get('email', '').strip().lower()
        if not email:
            return Response({'detail': 'Email is required'}, status=400)
        
        try:
            invited_user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return Response({'detail': 'User with this email does not exist'}, status=404)
        
        # Check if user is already a member
        if ProjectMembership.objects.filter(project=project, user=invited_user).exists():
            return Response({'detail': 'User is already a member of this project'}, status=400)
        
        # Create invitation
        membership = ProjectMembership.objects.create(
            project=project,
            user=invited_user,
            role='EMPLOYEE',
            status='PENDING',
            invited_by=user,
            invited_at=timezone.now()
        )
        
        # Create notification
        Notification.objects.create(
            user=invited_user,
            type='PROJECT_INVITATION',
            message=f'You have been invited to join the project {project.name}',
            payload={
                'project_id': project.id,
                'project_name': project.name,
                'invited_by': user.get_full_name() or user.email,
                'membership_id': membership.id
            }
        )
        
        return Response({
            'detail': f'Invitation sent to {invited_user.email}',
            'membership': ProjectMembershipSerializer(membership).data
        }, status=201)
    
    @action(detail=True, methods=['get'])
    def members(self, request, pk=None):
        """Get all project members including owner and team assignees."""
        project = self.get_object()
        user = request.user
        
        # Only project members can see the member list
        if not self._is_project_member(project, user):
            raise PermissionDenied('Only project members can view member list')
        
        # Get invited members from ProjectMembership
        memberships = ProjectMembership.objects.filter(project=project).select_related('user', 'invited_by')
        members_data = []
        
        # Add project owner (only if not already in memberships)
        if project.created_by:
            owner_already_exists = any(m.user.id == project.created_by.id for m in memberships)
            if not owner_already_exists:
                owner_data = {
                    'id': f'owner_{project.created_by.id}',
                    'project': project.id,
                    'user': {
                        'id': project.created_by.id,
                        'email': project.created_by.email,
                        'first_name': project.created_by.first_name,
                        'last_name': project.created_by.last_name
                    },
                    'role': 'OWNER',
                    'status': 'ACCEPTED',
                    'invited_by': None,
                    'invited_at': None,
                    'responded_at': None,
                    'joined_at': project.created_at
                }
                members_data.append(owner_data)
        
        # Add team assignees from project.team field
        if project.team:
            team_emails = [email.strip() for email in project.team.split(',') if email.strip()]
            for email in team_emails:
                try:
                    team_user = User.objects.get(email=email)
                    # Check if user is already in memberships to avoid duplicates
                    if not any(m.user.email == email for m in memberships):
                        team_data = {
                            'id': f'team_{team_user.id}',
                            'project': project.id,
                            'user': {
                                'id': team_user.id,
                                'email': team_user.email,
                                'first_name': team_user.first_name,
                                'last_name': team_user.last_name
                            },
                            'role': 'EMPLOYEE',
                            'status': 'ACCEPTED',
                            'invited_by': None,
                            'invited_at': None,
                            'responded_at': None,
                            'joined_at': project.created_at
                        }
                        members_data.append(team_data)
                except User.DoesNotExist:
                    # User doesn't exist yet, create placeholder
                    team_data = {
                        'id': f'team_email_{email}',
                        'project': project.id,
                        'user': {
                            'id': None,
                            'email': email,
                            'first_name': '',
                            'last_name': ''
                        },
                        'role': 'EMPLOYEE',
                        'status': 'PENDING',
                        'invited_by': None,
                        'invited_at': None,
                        'responded_at': None,
                        'joined_at': None
                    }
                    members_data.append(team_data)
        
        # Add invited members and update owner role if needed
        for membership in memberships:
            membership_data = ProjectMembershipSerializer(membership).data
            # If this is the project owner, ensure they have OWNER role
            if membership.user.id == project.created_by.id:
                membership_data['role'] = 'OWNER'
            members_data.append(membership_data)
        
        return Response(members_data)
    
    def _is_project_owner(self, project, user):
        """Check if user is the project owner."""
        return (project.created_by_id == user.id or 
                ProjectMembership.objects.filter(
                    project=project, 
                    user=user, 
                    role='OWNER', 
                    status='ACCEPTED'
                ).exists())
    
    def _is_project_member(self, project, user):
        """Check if user is a project member (any role, accepted)."""
        return (project.created_by_id == user.id or 
                ProjectMembership.objects.filter(
                    project=project, 
                    user=user, 
                    status='ACCEPTED'
                ).exists())
    
    def _is_project_owner_or_scrum_master(self, project, user):
        """Check if user is project owner or scrum master."""
        return (project.created_by_id == user.id or 
                ProjectMembership.objects.filter(
                    project=project, 
                    user=user, 
                    role__in=['OWNER', 'SCRUM_MASTER'], 
                    status='ACCEPTED'
                ).exists())


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.select_related('project', 'assignee').all().order_by('-updated_at')
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        base_qs = (
            Task.objects.select_related('project', 'assignee')
            .filter(Q(project__created_by=user) | Q(project__memberships__user=user, project__memberships__status='ACCEPTED'))
            .distinct()
        )
        # Role-based visibility:
        # Project Owner/Scrum Master sees all project tasks.
        # Employee sees tasks in visible projects but only ones assigned to them or unassigned.
        member_roles = ProjectMembership.objects.filter(
            project__tasks__in=base_qs, 
            user=user, 
            status='ACCEPTED'
        ).values_list('project_id', 'role')
        owner_sm_project_ids = {pid for (pid, role) in member_roles if role in ['OWNER', 'SCRUM_MASTER']}
        # Always include projects created by the user (Owner by definition)
        owner_sm_project_ids.update(Project.objects.filter(created_by=user).values_list('id', flat=True))

        if owner_sm_project_ids:
            return base_qs.order_by('-updated_at')

        # Employee view: only assigned to self or unassigned tasks (supports M2M)
        return base_qs.filter(Q(assignee=user) | Q(assignee__isnull=True) | Q(assignees=user)).order_by('-updated_at')

    def perform_create(self, serializer):
        # Only Project Owners and Scrum Masters can create tasks in a project
        user = self.request.user
        project = Project.objects.get(pk=self.request.data.get('project'))
        is_owner_or_sm = (project.created_by_id == user.id or 
                          ProjectMembership.objects.filter(
                              project=project, 
                              user=user, 
                              role__in=['OWNER', 'SCRUM_MASTER'], 
                              status='ACCEPTED'
                          ).exists())
        if not is_owner_or_sm:
            raise PermissionDenied('Only Project Owners and Scrum Masters can create tasks')
        # Assign per-project sequence (max + 1), starting at 1
        from django.db.models import Max
        max_seq = project.tasks.aggregate(ms=Max('sequence'))['ms'] or 0
        task = serializer.save(created_by=user, sequence=max_seq + 1)
        
        # Generate notifications for task assignment if assignee is set during creation
        if task.assignee and task.assignee.id != user.id:
            # Check if user was recently invited to the project (within last 5 minutes)
            # to avoid duplicate notifications
            from django.utils import timezone
            from datetime import timedelta
            recent_invitation = Notification.objects.filter(
                user=task.assignee,
                type='PROJECT_INVITATION',
                project_id=task.project.id,
                created_at__gte=timezone.now() - timedelta(minutes=5)
            ).exists()
            
            # Only send task assignment notification if user wasn't recently invited
            if not recent_invitation:
                # Format task name with project key and sequence
                task_name = f"{task.project.key}#{task.sequence or task.id}"
                
                # Get project manager (project creator)
                project_manager_email = task.project.created_by.email
                
                # Format deadline
                deadline_text = "No deadline set"
                if task.due_at:
                    deadline_text = task.due_at.strftime("%B %d, %Y at %I:%M %p")
                
                # Create detailed notification message
                notification_message = f"""Task Assigned
{task.project.name}
{task_name}
{project_manager_email}
{deadline_text}"""
                
                create_notification(
                    user=task.assignee,
                    notification_type='TASK_ASSIGNED',
                    message=notification_message,
                    payload={
                        'task_id': task.id,
                        'task_title': task.title,
                        'task_name': task_name,
                        'project_id': task.project.id,
                        'project_name': task.project.name,
                        'project_manager_email': project_manager_email,
                        'task_deadline': task.due_at.isoformat() if task.due_at else None,
                        'deadline_text': deadline_text,
                        'assigned_by': user.get_full_name() or user.email,
                        'assigned_by_email': user.email
                    }
                )
        
        # Generate notifications for multiple assignees if set during creation
        if task.assignees.exists():
            for assignee in task.assignees.all():
                if assignee.id != user.id and assignee.id != task.assignee.id:
                    # Check if user was recently invited to the project (within last 5 minutes)
                    # to avoid duplicate notifications
                    recent_invitation = Notification.objects.filter(
                        user=assignee,
                        type='PROJECT_INVITATION',
                        project_id=task.project.id,
                        created_at__gte=timezone.now() - timedelta(minutes=5)
                    ).exists()
                    
                    # Only send task assignment notification if user wasn't recently invited
                    if not recent_invitation:
                        # Format task name with project key and sequence
                        task_name = f"{task.project.key}#{task.sequence or task.id}"
                        
                        # Get project manager (project creator)
                        project_manager_email = task.project.created_by.email
                        
                        # Format deadline
                        deadline_text = "No deadline set"
                        if task.due_at:
                            deadline_text = task.due_at.strftime("%B %d, %Y at %I:%M %p")
                        
                        # Create detailed notification message
                        notification_message = f"""Task Assigned
{task.project.name}
{task_name}
{project_manager_email}
{deadline_text}"""
                        
                        Notification.objects.create(
                            user=assignee,
                            type='TASK_ASSIGNED',
                            message=notification_message,
                            payload={
                                'task_id': task.id,
                                'task_title': task.title,
                                'task_name': task_name,
                                'project_id': task.project.id,
                                'project_name': task.project.name,
                                'project_manager_email': project_manager_email,
                                'task_deadline': task.due_at.isoformat() if task.due_at else None,
                                'deadline_text': deadline_text,
                                'assigned_by': user.get_full_name() or user.email,
                                'assigned_by_email': user.email
                            }
                        )
        
        ActivityEvent.objects.create(
            actor=self.request.user,
            entity_type='TASK',
            entity_id=task.id,
            action='CREATED',
            metadata={'title': task.title},
        )

    def partial_update(self, request, *args, **kwargs):
        # allow updating core fields including assignee via assignee_id
        data = request.data.copy()
        assignee_id = data.pop('assignee_id', None)
        assignee_ids = data.pop('assignee_ids', None)
        task = self.get_object()
        # Only Project Owners/Scrum Masters or the assignee can update; assignee change limited to Project Owners/Scrum Masters
        user = request.user
        is_owner_or_sm = (task.project.created_by_id == user.id or 
                          ProjectMembership.objects.filter(
                              project=task.project, 
                              user=user, 
                              role__in=['OWNER', 'SCRUM_MASTER'], 
                              status='ACCEPTED'
                          ).exists())
        # Check if user is a project member
        is_project_member = ProjectMembership.objects.filter(
            project=task.project, 
            user=user, 
            status='ACCEPTED'
        ).exists()
        
        if not is_project_member:
            raise PermissionDenied('Not a project member')
            
        if not is_owner_or_sm:
            # Non-Owner/SM can update tasks if they are project members
            # Allow all project members to update tasks, but with some restrictions
            allowed_fields = {'status', 'assignee_id', 'assignee_ids', 'title', 'description', 'priority', 'tags', 'due_at'}  # Core task fields
            restricted_fields = set(request.data.keys()) - allowed_fields
            if restricted_fields:
                raise PermissionDenied(f'Employees can only update basic task fields. Restricted fields: {restricted_fields}')
        if assignee_id is not None:
            if not is_owner_or_sm:
                raise PermissionDenied('Only Project Owners and Scrum Masters can reassign')
            if assignee_id == '' or assignee_id is None:
                task.assignee = None
            else:
                task.assignee = User.objects.filter(pk=assignee_id).first()
        response = super().partial_update(request, *args, **kwargs)
        if assignee_id is not None:
            task.save(update_fields=['assignee', 'updated_at'])
            # Generate notification for task assignment
            if assignee_id and assignee_id != request.user.id:
                try:
                    assignee = User.objects.get(id=assignee_id)
                    
                    # Check if user was recently invited to the project (within last 5 minutes)
                    # to avoid duplicate notifications
                    from django.utils import timezone
                    from datetime import timedelta
                    recent_invitation = Notification.objects.filter(
                        user=assignee,
                        type='PROJECT_INVITATION',
                        project_id=task.project.id,
                        created_at__gte=timezone.now() - timedelta(minutes=5)
                    ).exists()
                    
                    # Only send task assignment notification if user wasn't recently invited
                    if not recent_invitation:
                        # Format task name with project key and sequence
                        task_name = f"{task.project.key}#{task.sequence or task.id}"
                        
                        # Get project manager (project creator)
                        project_manager_email = task.project.created_by.email
                        
                        # Format deadline
                        deadline_text = "No deadline set"
                        if task.due_at:
                            deadline_text = task.due_at.strftime("%B %d, %Y at %I:%M %p")
                        
                        # Create detailed notification message
                        notification_message = f"""Task Assigned
{task.project.name}
{task_name}
{project_manager_email}
{deadline_text}"""
                        
                        Notification.objects.create(
                            user=assignee,
                            type='TASK_ASSIGNED',
                            message=notification_message,
                            payload={
                                'task_id': task.id,
                                'task_title': task.title,
                                'task_name': task_name,
                                'project_id': task.project.id,
                                'project_name': task.project.name,
                                'project_manager_email': project_manager_email,
                                'task_deadline': task.due_at.isoformat() if task.due_at else None,
                                'deadline_text': deadline_text,
                                'assigned_by': request.user.get_full_name() or request.user.email,
                                'assigned_by_email': request.user.email
                            }
                        )
                except User.DoesNotExist:
                    pass
        
        if assignee_ids is not None:
            if not is_owner_or_sm:
                raise PermissionDenied('Only Project Owners and Scrum Masters can reassign')
            # normalize to list
            ids = assignee_ids if isinstance(assignee_ids, list) else [assignee_ids]
            users = User.objects.filter(pk__in=ids)
            task.assignees.set(users)
            task.save(update_fields=['updated_at'])
            # Generate notifications for multiple assignees
            for user in users:
                if user.id != request.user.id:
                    # Check if user was recently invited to the project (within last 5 minutes)
                    # to avoid duplicate notifications
                    recent_invitation = Notification.objects.filter(
                        user=user,
                        type='PROJECT_INVITATION',
                        project_id=task.project.id,
                        created_at__gte=timezone.now() - timedelta(minutes=5)
                    ).exists()
                    
                    # Only send task assignment notification if user wasn't recently invited
                    if not recent_invitation:
                        # Format task name with project key and sequence
                        task_name = f"{task.project.key}#{task.sequence or task.id}"
                        
                        # Get project manager (project creator)
                        project_manager_email = task.project.created_by.email
                        
                        # Format deadline
                        deadline_text = "No deadline set"
                        if task.due_at:
                            deadline_text = task.due_at.strftime("%B %d, %Y at %I:%M %p")
                        
                        # Create detailed notification message
                        notification_message = f"""Task Assigned
{task.project.name}
{task_name}
{project_manager_email}
{deadline_text}"""
                        
                        Notification.objects.create(
                            user=user,
                            type='TASK_ASSIGNED',
                            message=notification_message,
                            payload={
                                'task_id': task.id,
                                'task_title': task.title,
                                'task_name': task_name,
                                'project_id': task.project.id,
                                'project_name': task.project.name,
                                'project_manager_email': project_manager_email,
                                'task_deadline': task.due_at.isoformat() if task.due_at else None,
                                'deadline_text': deadline_text,
                                'assigned_by': request.user.get_full_name() or request.user.email,
                                'assigned_by_email': request.user.email
                            }
                        )
        
        ActivityEvent.objects.create(
            actor=request.user,
            entity_type='TASK',
            entity_id=task.id,
            action='UPDATED',
            metadata={'fields': list(request.data.keys())},
        )
        return response

    @action(detail=True, methods=['post'])
    def transition(self, request, pk=None):
        task = self.get_object()
        user = request.user
        is_owner_or_sm = (task.project.created_by_id == user.id or 
                          ProjectMembership.objects.filter(
                              project=task.project, 
                              user=user, 
                              role__in=['OWNER', 'SCRUM_MASTER'], 
                              status='ACCEPTED'
                          ).exists())
        
        # Check if user is a project member
        is_project_member = ProjectMembership.objects.filter(
            project=task.project, 
            user=user, 
            status='ACCEPTED'
        ).exists()
        
        if not is_project_member:
            raise PermissionDenied('Not a project member')
        status_next = request.data.get('status')
        if status_next not in dict(Task.STATUS_CHOICES):
            return Response({'detail': 'Invalid status'}, status=400)
        old_status = task.status
        task.status = status_next
        if status_next == 'DONE':
            task.completed_at = timezone.now()
        task.save(update_fields=['status', 'updated_at'])
        
        # Generate notifications for status changes
        if old_status != status_next:
            # Notify project owner/scrum master about status change
            project_owner = task.project.created_by
            if project_owner.id != request.user.id:
                Notification.objects.create(
                    user=project_owner,
                    type='TASK_STATUS_CHANGED',
                    message=f'{request.user.get_full_name() or request.user.email} updated the task {task.title} to {status_next.replace("_", " ")}',
                    payload={
                        'task_id': task.id,
                        'task_title': task.title,
                        'project_id': task.project.id,
                        'project_name': task.project.name,
                        'old_status': old_status,
                        'new_status': status_next,
                        'updated_by': request.user.get_full_name() or request.user.email
                    }
                )
            
            # Notify task assignee about status change (if different from updater)
            if task.assignee and task.assignee.id != request.user.id:
                Notification.objects.create(
                    user=task.assignee,
                    type='TASK_STATUS_CHANGED',
                    message=f'The task {task.title} was updated to {status_next.replace("_", " ")} by {request.user.get_full_name() or request.user.email}',
                    payload={
                        'task_id': task.id,
                        'task_title': task.title,
                        'project_id': task.project.id,
                        'project_name': task.project.name,
                        'old_status': old_status,
                        'new_status': status_next,
                        'updated_by': request.user.get_full_name() or request.user.email
                    }
                )
            
            # Notify multiple assignees
            for assignee in task.assignees.all():
                if assignee.id != request.user.id and assignee.id != project_owner.id:
                    Notification.objects.create(
                        user=assignee,
                        type='TASK_STATUS_CHANGED',
                        message=f'The task {task.title} was updated to {status_next.replace("_", " ")} by {request.user.get_full_name() or request.user.email}',
                        payload={
                            'task_id': task.id,
                            'task_title': task.title,
                            'project_id': task.project.id,
                            'project_name': task.project.name,
                            'old_status': old_status,
                            'new_status': status_next,
                            'updated_by': request.user.get_full_name() or request.user.email
                        }
                    )
            
            # Special notification for task completion
            if status_next == 'DONE':
                # Notify project owner/scrum master about completion
                if project_owner.id != request.user.id:
                    Notification.objects.create(
                        user=project_owner,
                        type='TASK_COMPLETED',
                        message=f'The task {task.title} was marked as Done by {request.user.get_full_name() or request.user.email}',
                        payload={
                            'task_id': task.id,
                            'task_title': task.title,
                            'project_id': task.project.id,
                            'project_name': task.project.name,
                            'completed_by': request.user.get_full_name() or request.user.email
                        }
                    )
        
        ActivityEvent.objects.create(
            actor=request.user,
            entity_type='TASK',
            entity_id=task.id,
            action='MOVED',
            metadata={'status': status_next},
        )
        return Response(TaskSerializer(task).data)

    @action(detail=True, methods=['get', 'post'])
    def comments(self, request, pk=None):
        task = self.get_object()
        if request.method == 'GET':
            qs = Comment.objects.filter(task=task).select_related('author').order_by('-created_at')
            return Response(CommentSerializer(qs, many=True).data)
        # POST create
        serializer = CommentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        comment = Comment.objects.create(
            task=task,
            author=request.user,
            body=serializer.validated_data['body'],
        )
        ActivityEvent.objects.create(
            actor=request.user,
            entity_type='TASK',
            entity_id=task.id,
            action='COMMENTED',
            metadata={'comment_id': comment.id},
        )
        return Response(CommentSerializer(comment).data, status=201)

    @action(detail=True, methods=['get'])
    def activity(self, request, pk=None):
        task = self.get_object()
        events = ActivityEvent.objects.filter(entity_type='TASK', entity_id=task.id).select_related('actor').order_by('-created_at')
        return Response(ActivityEventSerializer(events, many=True).data)

    @action(detail=True, methods=['get', 'post'], parser_classes=[MultiPartParser, FormParser, JSONParser])
    def attachments(self, request, pk=None):
        task = self.get_object()
        if request.method == 'GET':
            qs = Attachment.objects.filter(task=task).order_by('-created_at')
            data = AttachmentSerializer(qs, many=True).data
            # Ensure absolute URLs so frontend (different origin) can open files
            for item in data:
                url = item.get('url') or ''
                if url and url.startswith('/'):
                    item['url'] = request.build_absolute_uri(url)
                # Provide a stable download URL even if url is missing
                item['download_url'] = request.build_absolute_uri(f"/api/attachments/{item['id']}/download/")
            return Response(data)
        # POST upload files
        files = request.FILES.getlist('files') or ([] if request.FILES else [])
        single = request.FILES.get('file')
        if single and not files:
            files = [single]
        saved = []
        from django.core.files.storage import default_storage
        import os
        base_dir = 'task_attachments'
        for f in files:
            filename = f.name
            path = default_storage.save(os.path.join(base_dir, filename), f)
            try:
                media_url = settings.MEDIA_URL
            except Exception:
                media_url = '/media/'
            url = f"{media_url}{path}"
            att = Attachment.objects.create(task=task, filename=filename, url=url, uploaded_by=request.user)
            saved.append(att)
        data = AttachmentSerializer(saved, many=True).data
        for item in data:
            url = item.get('url') or ''
            if url and url.startswith('/'):
                item['url'] = request.build_absolute_uri(url)
            # Also include a direct download URL that forces inline rendering
            item['download_url'] = request.build_absolute_uri(f"/api/attachments/{item['id']}/download/")
        
        # Generate notifications for attachment uploads
        if saved:
            task = self.get_object()
            project_owner = task.project.created_by
            
            # Notify project owner/scrum master about attachment upload
            if project_owner.id != request.user.id:
                Notification.objects.create(
                    user=project_owner,
                    type='ATTACHMENT_UPLOADED',
                    message=f'Attachment uploaded by {request.user.get_full_name() or request.user.email} in task {task.title}',
                    payload={
                        'task_id': task.id,
                        'task_title': task.title,
                        'project_id': task.project.id,
                        'project_name': task.project.name,
                        'attachment_count': len(saved),
                        'uploaded_by': request.user.get_full_name() or request.user.email
                    }
                )
            
            # Notify task assignee about attachment upload
            if task.assignee and task.assignee.id != request.user.id and task.assignee.id != project_owner.id:
                Notification.objects.create(
                    user=task.assignee,
                    type='ATTACHMENT_UPLOADED',
                    message=f'Attachment uploaded by {request.user.get_full_name() or request.user.email} in task {task.title}',
                    payload={
                        'task_id': task.id,
                        'task_title': task.title,
                        'project_id': task.project.id,
                        'project_name': task.project.name,
                        'attachment_count': len(saved),
                        'uploaded_by': request.user.get_full_name() or request.user.email
                    }
                )
            
            # Notify multiple assignees
            for assignee in task.assignees.all():
                if (assignee.id != request.user.id and 
                    assignee.id != project_owner.id and 
                    assignee.id != task.assignee.id):
                    Notification.objects.create(
                        user=assignee,
                        type='ATTACHMENT_UPLOADED',
                        message=f'Attachment uploaded by {request.user.get_full_name() or request.user.email} in task {task.title}',
                        payload={
                            'task_id': task.id,
                            'task_title': task.title,
                            'project_id': task.project.id,
                            'project_name': task.project.name,
                            'attachment_count': len(saved),
                            'uploaded_by': request.user.get_full_name() or request.user.email
                        }
                    )
        
        return Response(data)


def attachment_download(request, pk: int):
    try:
        att = Attachment.objects.get(pk=pk)
    except Attachment.DoesNotExist:
        raise Http404
    url = att.url or ''
    media_url = getattr(settings, 'MEDIA_URL', '/media/') or '/media/'
    # Derive storage-relative path
    if url.startswith('http://') or url.startswith('https://'):
        # Strip scheme+host if it contains media_url
        idx = url.find(media_url)
        rel_path = url[idx + len(media_url):] if idx != -1 else ''
    else:
        rel_path = url[len(media_url):] if url.startswith(media_url) else url.lstrip('/')
    if not rel_path:
        raise Http404
    try:
        f = default_storage.open(rel_path, 'rb')
    except Exception:
        raise Http404
    import mimetypes
    ct, _ = mimetypes.guess_type(att.filename or rel_path)
    resp = FileResponse(f, content_type=ct or 'application/octet-stream')
    # Inline to render in-browser when possible (e.g., PDFs)
    resp['Content-Disposition'] = f'inline; filename="{att.filename or rel_path.split("/")[-1]}"'
    return resp


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.select_related('task', 'author').all().order_by('-created_at')
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return (
            Comment.objects.select_related('task', 'author')
            .filter(Q(task__project__created_by=user) | Q(task__project__memberships__user=user))
            .distinct()
            .order_by('-created_at')
        )

    def perform_create(self, serializer):
        comment = serializer.save(author=self.request.user)
        ActivityEvent.objects.create(
            actor=self.request.user,
            entity_type='TASK',
            entity_id=comment.task_id,
            action='COMMENTED',
            metadata={'comment_id': comment.id},
        )
        
        # Generate notification for new comment
        task = comment.task
        project_owner = task.project.created_by
        
        # Notify project owner/scrum master about new comment
        if project_owner.id != self.request.user.id:
            Notification.objects.create(
                user=project_owner,
                type='COMMENT_ADDED',
                message=f'New comment added to task {task.title}',
                payload={
                    'task_id': task.id,
                    'task_title': task.title,
                    'project_id': task.project.id,
                    'project_name': task.project.name,
                    'comment_id': comment.id,
                    'comment_author': self.request.user.get_full_name() or self.request.user.email
                }
            )
        
        # Notify task assignee about new comment
        if task.assignee and task.assignee.id != self.request.user.id and task.assignee.id != project_owner.id:
            create_notification(
                user=task.assignee,
                notification_type='COMMENT_ADDED',
                message=f'New comment added to task {task.title}',
                payload={
                    'task_id': task.id,
                    'task_title': task.title,
                    'project_id': task.project.id,
                    'project_name': task.project.name,
                    'comment_id': comment.id,
                    'comment_author': self.request.user.get_full_name() or self.request.user.email
                }
            )
        
        # Notify multiple assignees
        for assignee in task.assignees.all():
            if (assignee.id != self.request.user.id and 
                assignee.id != project_owner.id and 
                assignee.id != task.assignee.id):
                create_notification(
                    user=assignee,
                    notification_type='COMMENT_ADDED',
                    message=f'New comment added to task {task.title}',
                    payload={
                        'task_id': task.id,
                        'task_title': task.title,
                        'project_id': task.project.id,
                        'project_name': task.project.name,
                        'comment_id': comment.id,
                        'comment_author': self.request.user.get_full_name() or self.request.user.email
                    }
                )
        
        # rudimentary @mention detection
        import re
        mentions = set(re.findall(r"@([A-Za-z0-9_\.\-]+)", comment.body))
        if mentions:
            from django.contrib.auth.models import User
            users = User.objects.filter(username__in=list(mentions))
            for u in users:
                Notification.objects.create(
                    user=u,
                    type='COMMENT_MENTION',
                    message=f'{self.request.user.get_full_name() or self.request.user.email} mentioned you in a comment: @{u.username} {comment.body[:100]}{"..." if len(comment.body) > 100 else ""}',
                    payload={
                        'task_id': comment.task_id, 
                        'comment_id': comment.id,
                        'task_title': task.title,
                        'project_name': task.project.name
                    },
                )


class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        from django.utils import timezone
        Notification.objects.filter(user=request.user, read_at__isnull=True).update(read_at=timezone.now())
        return Response({"status": "ok"})

    @action(detail=False, methods=['delete'])
    def clear_all(self, request):
        Notification.objects.filter(user=request.user).delete()
        return Response({"status": "ok"})
    
    @action(detail=True, methods=['post'])
    def accept_invitation(self, request, pk=None):
        """Accept a project invitation."""
        notification = self.get_object()
        user = request.user
        
        if notification.type != 'PROJECT_INVITATION':
            return Response({'detail': 'This is not a project invitation'}, status=400)
        
        if notification.user_id != user.id:
            return Response({'detail': 'You can only accept your own invitations'}, status=403)
        
        membership_id = notification.payload.get('membership_id')
        if not membership_id:
            return Response({'detail': 'Invalid invitation'}, status=400)
        
        try:
            membership = ProjectMembership.objects.get(id=membership_id, user=user, status='PENDING')
        except ProjectMembership.DoesNotExist:
            return Response({'detail': 'Invitation not found or already processed'}, status=404)
        
        # Accept the invitation
        membership.status = 'ACCEPTED'
        membership.responded_at = timezone.now()
        membership.save()
        
        # Update notification
        notification.type = 'PROJECT_INVITATION_ACCEPTED'
        notification.message = f'You have accepted the invitation to join the project {membership.project.name}'
        notification.payload['responded_at'] = membership.responded_at.isoformat()
        notification.save()
        
        # Notify project owner about acceptance
        Notification.objects.create(
            user=membership.project.created_by,
            type='PROJECT_INVITE_RESPONSE',
            message=f'{user.get_full_name() or user.email} has accepted your invitation to join the project {membership.project.name}',
            payload={
                'project_id': membership.project.id,
                'project_name': membership.project.name,
                'accepted_by': user.get_full_name() or user.email,
                'membership_id': membership.id
            }
        )
        
        return Response({
            'detail': f'You have joined the project {membership.project.name}',
            'project': ProjectSerializer(membership.project).data
        })
    
    @action(detail=True, methods=['post'])
    def decline_invitation(self, request, pk=None):
        """Decline a project invitation."""
        notification = self.get_object()
        user = request.user
        
        if notification.type != 'PROJECT_INVITATION':
            return Response({'detail': 'This is not a project invitation'}, status=400)
        
        if notification.user_id != user.id:
            return Response({'detail': 'You can only decline your own invitations'}, status=403)
        
        membership_id = notification.payload.get('membership_id')
        if not membership_id:
            return Response({'detail': 'Invalid invitation'}, status=400)
        
        try:
            membership = ProjectMembership.objects.get(id=membership_id, user=user, status='PENDING')
        except ProjectMembership.DoesNotExist:
            return Response({'detail': 'Invitation not found or already processed'}, status=404)
        
        # Decline the invitation
        membership.status = 'DECLINED'
        membership.responded_at = timezone.now()
        membership.save()
        
        # Update notification
        notification.type = 'PROJECT_INVITATION_DECLINED'
        notification.message = f'You have declined the invitation to join the project {membership.project.name}'
        notification.payload['responded_at'] = membership.responded_at.isoformat()
        notification.save()
        
        # Notify project owner about decline
        Notification.objects.create(
            user=membership.project.created_by,
            type='PROJECT_INVITE_RESPONSE',
            message=f'{user.get_full_name() or user.email} has declined your invitation to join the project {membership.project.name}',
            payload={
                'project_id': membership.project.id,
                'project_name': membership.project.name,
                'declined_by': user.get_full_name() or user.email,
                'membership_id': membership.id
            }
        )
        
        return Response({
            'detail': f'You declined the invitation for project {membership.project.name}'
        })


class AnalyticsViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def summary(self, request):
        user = request.user
        # tasks completed per week (user's visible projects)
        tasks_qs = Task.objects.filter(
            Q(project__created_by=user) | Q(project__memberships__user=user),
            status='DONE',
        ).annotate(week=TruncWeek('completed_at')).values('week').annotate(count=Count('id')).order_by('week')

        # current WIP by status
        wip = Task.objects.filter(
            Q(project__created_by=user) | Q(project__memberships__user=user)
        ).values('status').annotate(count=Count('id')).order_by()

        return Response({
            'completed_per_week': list(tasks_qs),
            'wip_by_status': list(wip),
        })


class ProjectChatViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectChatMessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        user = self.request.user
        qs = ProjectChatMessage.objects.select_related('sender', 'project').filter(
            Q(project__created_by=user) | Q(project__memberships__user=user)
        ).distinct().order_by('created_at')
        project_id = self.request.query_params.get('project')
        if project_id:
            qs = qs.filter(project_id=project_id)
        after = self.request.query_params.get('after')
        if after:
            try:
                from django.utils.dateparse import parse_datetime
                dt = parse_datetime(after)
                if dt is not None:
                    qs = qs.filter(created_at__gt=dt)
            except Exception:
                pass
        return qs

    def perform_create(self, serializer):
        project = serializer.validated_data.get('project')
        user = self.request.user
        # ensure member
        is_member = (project.created_by_id == user.id) or ProjectMembership.objects.filter(project=project, user=user).exists()
        if not is_member:
            raise PermissionDenied('Only project members can chat')
        
        # Save file name if file is provided
        file_obj = serializer.validated_data.get('file')
        if file_obj:
            serializer.save(sender=user, file_name=file_obj.name)
        else:
            serializer.save(sender=user)

    @action(detail=True, methods=['post'])
    def pin_message(self, request, pk=None):
        """Pin a message (only project owners can pin)"""
        message = self.get_object()
        user = request.user
        
        # Only project owners can pin messages
        if message.project.created_by_id != user.id:
            raise PermissionDenied('Only project owners can pin messages')
        
        message.pinned = True
        message.pinned_by = user
        message.pinned_at = timezone.now()
        message.save()
        
        return Response({'detail': 'Message pinned successfully'})

    @action(detail=True, methods=['post'])
    def unpin_message(self, request, pk=None):
        """Unpin a message (only project owners can unpin)"""
        message = self.get_object()
        user = request.user
        
        # Only project owners can unpin messages
        if message.project.created_by_id != user.id:
            raise PermissionDenied('Only project owners can unpin messages')
        
        message.pinned = False
        message.pinned_by = None
        message.pinned_at = None
        message.save()
        
        return Response({'detail': 'Message unpinned successfully'})

