import re
from collections.abc import Iterator

import pytest
from allauth.socialaccount.models import SocialAccount, SocialLogin
from django.test import RequestFactory

from allauth_http import PASSWORD
from ong_gabriel_api.accounts.adapters import SocialAccountAdapter
from ong_gabriel_api.accounts.models import USERNAME_MAX_LENGTH, User
from ong_gabriel_api.accounts.usernames import (
    ATTEMPTS_PER_WIDTH,
    INITIAL_SUFFIX_DIGITS,
    generate_unique_username,
    username_stem_from_social,
)

pytestmark = pytest.mark.django_db

_FOUR_DIGITS = re.compile(rf'\d{{{INITIAL_SUFFIX_DIGITS}}}$')


def _forced_suffixes(values: Iterator[str]) -> object:
    def fake_suffix(digits: int) -> str:
        value = next(values)
        assert len(value) == digits
        return value

    return fake_suffix


def test_stem_uses_given_name_and_strips_accents() -> None:
    assert username_stem_from_social(given_name='José') == 'Jose'
    assert username_stem_from_social(given_name='María') == 'Maria'


def test_stem_falls_back_to_first_word_of_name() -> None:
    assert username_stem_from_social(name='María Costa') == 'Maria'


def test_stem_falls_back_to_usuario_when_name_is_empty() -> None:
    assert username_stem_from_social() == 'usuario'
    assert username_stem_from_social(given_name='!!!', name='+++') == 'usuario'


def _populate_google_user(rf: RequestFactory, extra_data: dict[str, str], data: dict[str, str | None]) -> User:
    account = SocialAccount(provider='google', uid='google-uid', extra_data=extra_data)
    sociallogin = SocialLogin(user=User(), account=account)
    return SocialAccountAdapter().populate_user(rf.get('/'), sociallogin, data)


def test_adapter_username_comes_from_name_not_email(rf: RequestFactory) -> None:
    email = 'jose.silva.1987@gmail.com'
    user = _populate_google_user(
        rf,
        {'email': email, 'given_name': 'Maria', 'name': 'Maria Silva'},
        {'email': email, 'first_name': 'Maria', 'name': 'Maria Silva'},
    )
    assert user.username.startswith('Maria')
    assert 'jose' not in user.username.lower()


def test_generated_username_has_random_numeric_suffix() -> None:
    username = generate_unique_username(given_name='José')
    assert _FOUR_DIGITS.search(username)
    assert username.startswith('Jose')
    assert len(username) == 4 + INITIAL_SUFFIX_DIGITS


def test_generated_username_for_empty_name_uses_usuario() -> None:
    username = generate_unique_username()
    assert username.startswith('usuario')
    assert _FOUR_DIGITS.search(username)


def test_generated_username_cuts_long_name_to_max_length() -> None:
    username = generate_unique_username(given_name='A' * 40)
    assert len(username) == USERNAME_MAX_LENGTH
    assert username[: USERNAME_MAX_LENGTH - INITIAL_SUFFIX_DIGITS] == 'A' * (
        USERNAME_MAX_LENGTH - INITIAL_SUFFIX_DIGITS
    )
    assert username[USERNAME_MAX_LENGTH - INITIAL_SUFFIX_DIGITS :].isdigit()


def test_adapter_username_without_name_ignores_email(rf: RequestFactory) -> None:
    email = 'jose.silva.1987@gmail.com'
    user = _populate_google_user(rf, {'email': email}, {'email': email})
    assert user.username.startswith('usuario')
    assert 'jose' not in user.username.lower()


def test_unique_username_retries_on_case_insensitive_collision(monkeypatch: pytest.MonkeyPatch) -> None:
    User.objects.create_user('Jose4821', 'alice@example.com', PASSWORD)
    suffixes = iter(['4821', '9901'])
    monkeypatch.setattr(
        'ong_gabriel_api.accounts.usernames.numeric_suffix',
        _forced_suffixes(suffixes),
    )
    assert generate_unique_username(given_name='José') == 'Jose9901'


def test_unique_username_widens_suffix_after_a_few_collisions(monkeypatch: pytest.MonkeyPatch) -> None:
    User.objects.create_user('Jose0000', 'alice@example.com', PASSWORD)
    suffixes = iter(['0000'] * ATTEMPTS_PER_WIDTH + ['12345'])
    monkeypatch.setattr(
        'ong_gabriel_api.accounts.usernames.numeric_suffix',
        _forced_suffixes(suffixes),
    )
    assert generate_unique_username(given_name='José') == 'Jose12345'
