from django.apps import AppConfig


class EventsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'ong_gabriel_api.events'
    label = 'events'
    verbose_name = 'Events'

    def ready(self) -> None:
        from django.db.models.signals import post_delete

        from ong_gabriel_api.events.models import Event
        from ong_gabriel_api.events.signals import delete_image_file

        post_delete.connect(
            delete_image_file,
            sender=Event,
            dispatch_uid='events.delete_image_file',
        )
