from django.core.files.storage import default_storage
from django.db import transaction


def delete_stored_file(name: str) -> None:
    if name and default_storage.exists(name):
        default_storage.delete(name)


def schedule_file_delete(name: str) -> None:
    transaction.on_commit(lambda stored=name: delete_stored_file(stored))
