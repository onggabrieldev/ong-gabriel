from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
from django.utils.translation import gettext_lazy as _

username_charset_validator = RegexValidator(
    regex=r'^[A-Za-z0-9._-]+$',
    message=_('Enter a username using letters, digits, dots, underscores, or hyphens.'),
)


def validate_username_without_at(value: str) -> None:
    if '@' in value:
        raise ValidationError(_('Username cannot contain @.'), code='invalid')
