from django.urls import resolve
from django.urls import reverse


def test_auth_session():
    assert reverse("api:auth-session") == "/api/v1/auth/session"
    assert resolve("/api/v1/auth/session").view_name == "api:auth-session"


def test_auth_providers():
    assert reverse("api:auth-providers") == "/api/v1/auth/providers"
    assert resolve("/api/v1/auth/providers").view_name == "api:auth-providers"


def test_auth_logout():
    assert reverse("api:auth-logout") == "/api/v1/auth/logout"
    assert resolve("/api/v1/auth/logout").view_name == "api:auth-logout"
