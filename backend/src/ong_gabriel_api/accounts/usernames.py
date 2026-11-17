import re
import secrets
import unicodedata

from ong_gabriel_api.accounts.models import USERNAME_MAX_LENGTH, User

INITIAL_SUFFIX_DIGITS = 4
MAX_SUFFIX_DIGITS = 8
ATTEMPTS_PER_WIDTH = 5
FALLBACK_STEM = 'usuario'

_INVALID_USERNAME_CHARS = re.compile(r'[^A-Za-z0-9._-]')


def slug_username_part(value: str) -> str:
    normalized = unicodedata.normalize('NFKD', value)
    ascii_only = normalized.encode('ascii', 'ignore').decode('ascii')
    return _INVALID_USERNAME_CHARS.sub('', ascii_only)


def numeric_suffix(digits: int) -> str:
    return f'{secrets.randbelow(10**digits):0{digits}d}'


def username_stem_from_social(*, given_name: str = '', name: str = '') -> str:
    stem = slug_username_part(given_name.strip())
    if not stem:
        first_word = name.split(None, 1)[0] if name.strip() else ''
        stem = slug_username_part(first_word)
    if not stem:
        stem = FALLBACK_STEM
    return stem[: USERNAME_MAX_LENGTH - INITIAL_SUFFIX_DIGITS]


def generate_unique_username(*, given_name: str = '', name: str = '') -> str:
    stem = username_stem_from_social(given_name=given_name, name=name)
    for digits in range(INITIAL_SUFFIX_DIGITS, MAX_SUFFIX_DIGITS + 1):
        trimmed = stem[: USERNAME_MAX_LENGTH - digits] or FALLBACK_STEM[: USERNAME_MAX_LENGTH - digits]
        for _ in range(ATTEMPTS_PER_WIDTH):
            candidate = f'{trimmed}{numeric_suffix(digits)}'
            if not User.objects.filter(username__iexact=candidate).exists():
                return candidate
    raise RuntimeError('Could not generate a unique username.')
