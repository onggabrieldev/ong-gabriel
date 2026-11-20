from django.apps import AppConfig


class ActivitiesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'ong_gabriel_api.activities'
    label = 'activities'
    verbose_name = 'Activities'

    def ready(self) -> None:
        from django.db.models.signals import post_delete

        from ong_gabriel_api.activities.models import Activity
        from ong_gabriel_api.activities.signals import delete_image_file

        post_delete.connect(
            delete_image_file,
            sender=Activity,
            dispatch_uid='activities.delete_image_file',
        )
