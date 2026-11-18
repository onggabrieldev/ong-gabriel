from ong_gabriel_api.testimonials.files import schedule_file_delete
from ong_gabriel_api.testimonials.models import Testimonial


def delete_portrait_file(sender: type[Testimonial], instance: Testimonial, **kwargs: object) -> None:
    portrait_name = instance.portrait.name if instance.portrait else ''
    if portrait_name:
        schedule_file_delete(portrait_name)
