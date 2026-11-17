from allauth.account.models import EmailAddress

from ong_gabriel_api.accounts.models import User


def sync_verified_primary_email(user: User) -> None:
    email = user.email
    current = EmailAddress.objects.filter(user=user, email__iexact=email).first()
    if current is None:
        EmailAddress.objects.filter(user=user).delete()
        EmailAddress.objects.create(user=user, email=email, verified=True, primary=True)
        return
    current.email = email
    current.verified = True
    current.primary = True
    current.save()
    EmailAddress.objects.filter(user=user).exclude(pk=current.pk).delete()
