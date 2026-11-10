import uuid
from typing import ClassVar

from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.models import PermissionsMixin
from django.core.validators import MinLengthValidator
from django.db import models
from django.db.models.functions import Lower
from django.utils import timezone

from ong_gabriel_api.accounts.validators import username_charset_validator, validate_username_without_at

USERNAME_MAX_LENGTH = 32


class UserManager(BaseUserManager):
    use_in_migrations = True

    def create_user(
        self,
        username: str,
        email: str,
        password: str | None = None,
        **extra_fields: object,
    ) -> User:
        if not username:
            raise ValueError('A username is required.')
        if not email:
            raise ValueError('An email is required.')
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.full_clean()
        user.save(using=self._db)
        return user

    def create_superuser(
        self,
        username: str,
        email: str,
        password: str | None = None,
        **extra_fields: object,
    ) -> User:
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        return self.create_user(username, email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = models.CharField(
        max_length=USERNAME_MAX_LENGTH,
        unique=True,
        validators=[
            MinLengthValidator(3),
            username_charset_validator,
            validate_username_without_at,
        ],
    )
    email = models.EmailField(unique=True)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(default=timezone.now)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS: ClassVar[list[str]] = ['email']

    objects = UserManager()

    class Meta:
        constraints: ClassVar[list[models.BaseConstraint]] = [
            models.UniqueConstraint(Lower('username'), name='accounts_user_username_lower_uniq'),
            models.UniqueConstraint(Lower('email'), name='accounts_user_email_lower_uniq'),
        ]

    def __str__(self) -> str:
        return self.username

    def clean(self) -> None:
        super().clean()
        self.email = UserManager.normalize_email(self.email)
