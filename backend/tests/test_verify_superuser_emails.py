import importlib

import pytest
from allauth.account.models import EmailAddress
from django.apps import apps
from django.db import connection

from allauth_http import PASSWORD
from ong_gabriel_api.accounts.models import User

pytestmark = pytest.mark.django_db

verify_superuser_emails = importlib.import_module(
    'ong_gabriel_api.accounts.migrations.0003_verify_superuser_emails'
).verify_superuser_emails


def _run_verify_superuser_emails() -> None:
    with connection.schema_editor() as schema_editor:
        verify_superuser_emails(apps, schema_editor)


def test_migration_verifies_existing_superuser_emails() -> None:
    missing = User.objects.create_user(
        'legacy-admin',
        'legacy-admin@example.com',
        PASSWORD,
        is_staff=True,
        is_superuser=True,
    )
    unverified = User.objects.create_user(
        'unverified-admin',
        'unverified-admin@example.com',
        PASSWORD,
        is_staff=True,
        is_superuser=True,
    )
    EmailAddress.objects.create(
        user=unverified,
        email=unverified.email,
        verified=False,
        primary=True,
    )
    normal = User.objects.create_user('normal', 'normal@example.com', PASSWORD)
    EmailAddress.objects.create(user=normal, email=normal.email, verified=False, primary=True)

    _run_verify_superuser_emails()
    _run_verify_superuser_emails()

    missing_address = EmailAddress.objects.get(user=missing)
    assert missing_address.email == missing.email
    assert missing_address.verified is True
    assert missing_address.primary is True
    assert EmailAddress.objects.filter(user=missing).count() == 1

    unverified_address = EmailAddress.objects.get(user=unverified)
    assert unverified_address.email == unverified.email
    assert unverified_address.verified is True
    assert unverified_address.primary is True
    assert EmailAddress.objects.filter(user=unverified).count() == 1

    normal_address = EmailAddress.objects.get(user=normal)
    assert normal_address.verified is False
    assert normal_address.primary is True
    assert EmailAddress.objects.filter(user=normal).count() == 1
