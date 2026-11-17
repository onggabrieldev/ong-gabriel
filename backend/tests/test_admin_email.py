import pytest
from allauth.account.models import EmailAddress
from django.contrib.admin.sites import AdminSite
from django.test import RequestFactory

from allauth_http import PASSWORD, create_verified_user
from ong_gabriel_api.accounts.admin import UserAdmin
from ong_gabriel_api.accounts.models import User

pytestmark = pytest.mark.django_db


def _save(admin_user: User, target: User) -> None:
    request = RequestFactory().post('/django-admin/accounts/user/')
    request.user = admin_user
    UserAdmin(User, AdminSite()).save_model(request, target, form=None, change=True)


def test_superuser_save_verifies_email() -> None:
    superuser = User.objects.create_superuser('admin', 'admin@example.com', PASSWORD)
    user = User.objects.create_user('editor1', 'editor@example.com', PASSWORD)
    _save(superuser, user)
    address = EmailAddress.objects.get(user=user)
    assert address.email == 'editor@example.com'
    assert address.verified is True
    assert address.primary is True


def test_superuser_save_follows_email_change() -> None:
    superuser = User.objects.create_superuser('admin', 'admin@example.com', PASSWORD)
    user = create_verified_user('editor1', 'editor@example.com')
    user.email = 'new-editor@example.com'
    user.save()
    _save(superuser, user)
    assert EmailAddress.objects.filter(user=user).count() == 1
    address = EmailAddress.objects.get(user=user)
    assert address.email == 'new-editor@example.com'
    assert address.verified is True
    assert address.primary is True


def test_non_superuser_admin_save_does_not_verify() -> None:
    staff = User.objects.create_user('staff', 'staff@example.com', PASSWORD, is_staff=True)
    user = User.objects.create_user('editor1', 'editor@example.com', PASSWORD)
    _save(staff, user)
    assert not EmailAddress.objects.filter(user=user).exists()
