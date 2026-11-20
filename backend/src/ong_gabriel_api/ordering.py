from collections.abc import Sequence
from uuid import UUID

from django.db import models, transaction
from django.utils import timezone
from rest_framework.exceptions import ValidationError


def next_position(queryset: models.QuerySet[models.Model]) -> int:
    # Call inside transaction.atomic(): the rows stay locked until it commits.
    max_position = queryset.select_for_update().order_by('-position').values_list('position', flat=True).first()
    return 0 if max_position is None else max_position + 1


def reorder_rows(queryset: models.QuerySet[models.Model], incoming: Sequence[UUID], mismatch_message: str) -> None:
    incoming_ids = [str(item) for item in incoming]
    if len(incoming_ids) != len(set(incoming_ids)):
        raise ValidationError({'ids': ['A lista contém identificadores duplicados.']})
    with transaction.atomic():
        current = {str(pk): position for pk, position in queryset.select_for_update().values_list('pk', 'position')}
        if set(incoming_ids) != set(current):
            raise ValidationError({'ids': [mismatch_message]})
        now = timezone.now()
        for position, pk in enumerate(incoming_ids):
            if current[pk] != position:
                queryset.filter(pk=pk).update(position=position, updated_at=now)
