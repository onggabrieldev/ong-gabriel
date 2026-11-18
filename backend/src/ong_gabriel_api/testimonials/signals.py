from ong_gabriel_api.testimonials.models import Testimonial, _schedule_file_delete


def delete_portrait_file(sender: type[Testimonial], instance: Testimonial, **kwargs: object) -> None:
    portrait_name = instance.portrait.name if instance.portrait else ''
    if portrait_name:
        _schedule_file_delete(portrait_name)
