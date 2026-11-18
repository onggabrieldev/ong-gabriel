import pytest
from allauth.account.models import EmailAddress
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


@pytest.mark.django_db
def test_create_superuser_creates_verified_primary_email() -> None:
    user = User.objects.create_superuser('admin', 'admin@example.com', 'test-pass-ok-9x')
    addresses = EmailAddress.objects.filter(user=user)
    assert addresses.count() == 1
    address = addresses.get()
    assert address.email == 'admin@example.com'
    assert address.verified is True
    assert address.primary is True


@pytest.mark.django_db
def test_create_user_creates_no_verified_address() -> None:
    user = User.objects.create_user('alice', 'alice@example.com', 'test-pass-ok-9x')
    assert not EmailAddress.objects.filter(user=user).exists()
