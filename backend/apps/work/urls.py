from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import ProjectViewSet, TaskViewSet, CommentViewSet, NotificationViewSet, AnalyticsViewSet, ProjectChatViewSet, attachment_download


router = DefaultRouter()
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'comments', CommentViewSet, basename='comment')
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'analytics', AnalyticsViewSet, basename='analytics')
router.register(r'project-chat', ProjectChatViewSet, basename='project-chat')

urlpatterns = router.urls + [
    path('attachments/<int:pk>/download/', attachment_download, name='attachment-download'),
]


