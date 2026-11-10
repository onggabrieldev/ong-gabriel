import pytest
from django.core.exceptions import FieldDoesNotExist, ValidationError
from django.db import IntegrityError, transaction

from ong_gabriel_api.accounts.models import User


def test_user_has_no_cpf() -> None:
    with pytest.raises(FieldDoesNotExist):
        User._meta.get_field('cpf')


@pytest.mark.django_db
def test_username_unique_ignoring_case() -> None:
    User.objects.create_user('Alice', 'alice@example.com', 'test-pass-ok-9x')
    with pytest.raises(ValidationError):
        User.objects.create_user('alice', 'other@example.com', 'test-pass-ok-9x')


@pytest.mark.django_db
def test_email_unique_ignoring_case() -> None:
    User.objects.create_user('alice', 'alice@example.com', 'test-pass-ok-9x')
    with pytest.raises(ValidationError):
        User.objects.create_user('bob', 'Alice@example.com', 'test-pass-ok-9x')


@pytest.mark.django_db
def test_email_unique_ignoring_case_at_database() -> None:
    User.objects.create_user('alice', 'alice@example.com', 'test-pass-ok-9x')
    with pytest.raises(IntegrityError), transaction.atomic():
        User.objects.create(username='bob', email='Alice@example.com')


@pytest.mark.django_db
def test_username_rejects_at() -> None:
    with pytest.raises(ValidationError):
        User.objects.create_user('alice@ong', 'alice@example.com', 'test-pass-ok-9x')


@pytest.mark.django_db
def test_email_is_normalized() -> None:
    user = User.objects.create_user('alice', 'Alice@Example.COM', 'test-pass-ok-9x')
    assert user.email == 'Alice@example.com'


@pytest.mark.django_db
def test_create_superuser_sets_flags() -> None:
    user = User.objects.create_superuser('admin', 'admin@example.com', 'test-pass-ok-9x')
    assert user.is_staff is True
    assert user.is_superuser is True
    assert user.is_active is True
