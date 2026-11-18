from django.apps import AppConfig


class TestimonialsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'ong_gabriel_api.testimonials'
    label = 'testimonials'
    verbose_name = 'Testimonials'

    def ready(self) -> None:
        from django.db.models.signals import post_delete

        from ong_gabriel_api.testimonials.models import Testimonial
        from ong_gabriel_api.testimonials.signals import delete_portrait_file

        post_delete.connect(
            delete_portrait_file,
            sender=Testimonial,
            dispatch_uid='testimonials.delete_portrait_file',
        )
