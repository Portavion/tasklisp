"""
With these settings, tests run faster.
"""

from pathlib import Path
from tempfile import gettempdir

from .base import *  # noqa: F403
from .base import TEMPLATES
from .base import env

# GENERAL
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#secret-key
SECRET_KEY = env(
    "DJANGO_SECRET_KEY",
    default="sxp3Y0Np25oa1L6rRkMRIYDGzkqZ3lZIyCtwt5fgO5nQ69uQa6svxYP0dklmwseY",
)
# https://docs.djangoproject.com/en/dev/ref/settings/#test-runner
TEST_RUNNER = "django.test.runner.DiscoverRunner"

# PASSWORDS
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#password-hashers
PASSWORD_HASHERS = ["django.contrib.auth.hashers.MD5PasswordHasher"]

# EMAIL
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#email-backend
EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"

# DEBUGGING FOR TEMPLATES
# ------------------------------------------------------------------------------
TEMPLATES[0]["OPTIONS"]["debug"] = True  # type: ignore[index]

# MEDIA
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#media-url
MEDIA_URL = "http://media.testserver/"

# STATIC
# ------------------------------------------------------------------------------
# Keep WhiteNoise active in tests while avoiding missing-dir warnings.
STATIC_ROOT = str(Path(gettempdir()) / "todo_lisp_test_staticfiles")
Path(STATIC_ROOT).mkdir(parents=True, exist_ok=True)
# Your stuff...
# ------------------------------------------------------------------------------
