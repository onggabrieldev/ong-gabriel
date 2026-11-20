from ong_gabriel_api.events.models import Event
from ong_gabriel_api.uploads.files import schedule_file_delete


def delete_image_file(sender: type[Event], instance: Event, **kwargs: object) -> None:
    image_name = instance.image.name if instance.image else ''
    if image_name:
        schedule_file_delete(image_name)
