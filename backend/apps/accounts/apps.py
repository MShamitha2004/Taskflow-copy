from django.apps import AppConfig


class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.accounts'
    def ready(self):
        # Ensure models are loaded (for migrations)
        from . import models  # noqa


