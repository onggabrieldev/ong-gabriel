from allauth.account.adapter import DefaultAccountAdapter
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from allauth.socialaccount.models import SocialLogin
from django.conf import settings
from django.core.exceptions import ValidationError
from django.http import HttpRequest

from ong_gabriel_api.accounts.models import User
from ong_gabriel_api.accounts.usernames import generate_unique_username

_GENERIC_LOGIN_ERROR = 'invalid_login'


def _text(value: object) -> str:
    return value.strip() if isinstance(value, str) else ''


class AccountAdapter(DefaultAccountAdapter):
    def is_open_for_signup(self, request: HttpRequest) -> bool:
        return bool(settings.PASSWORD_SIGNUP_ENABLED)

    def validation_error(self, code: str, *args: object) -> ValidationError:
        if code in {'username_password_mismatch', 'email_password_mismatch'}:
            code = _GENERIC_LOGIN_ERROR
        return super().validation_error(code, *args)


class SocialAccountAdapter(DefaultSocialAccountAdapter):
    def is_open_for_signup(self, request: HttpRequest, sociallogin: SocialLogin) -> bool:
        return True

    def populate_user(self, request: HttpRequest, sociallogin: SocialLogin, data: dict[str, str | None]) -> User:
        user = super().populate_user(request, sociallogin, data)
        extra = sociallogin.account.extra_data
        given_name = _text(extra.get('given_name')) or _text(data.get('first_name'))
        full_name = _text(extra.get('name')) or _text(data.get('name'))
        user.username = generate_unique_username(given_name=given_name, name=full_name)
        return user
