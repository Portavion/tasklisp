from http import HTTPStatus
from urllib.parse import parse_qs
from urllib.parse import urlparse

import pytest
from allauth.socialaccount.models import SocialApp
from django.conf import settings
from django.contrib.sites.models import Site
from django.test import Client
from django.urls import reverse

from todo_lisp.users.models import User

pytestmark = pytest.mark.django_db


def create_social_app(*, provider: str, site: Site) -> SocialApp:
    social_app = SocialApp.objects.create(
        provider=provider,
        name=f"{provider.title()} App",
        client_id=f"{provider}-client-id",
        secret=f"{provider}-secret",
    )
    social_app.sites.add(site)
    return social_app


def parse_login_url(login_url: str) -> tuple[str, dict[str, list[str]]]:
    parsed = urlparse(login_url)
    return parsed.path, parse_qs(parsed.query)


def test_session_anonymous_returns_bootstrap(client):
    site = Site.objects.get(id=settings.SITE_ID)
    create_social_app(provider="google", site=site)
    create_social_app(provider="apple", site=site)

    response = client.get(reverse("api:auth-session"))

    assert response.status_code == HTTPStatus.OK
    payload = response.json()
    assert payload["authenticated"] is False
    assert payload["providers"] == ["google", "apple"]
    assert "user" not in payload
    assert payload["csrf_token"]
    assert settings.CSRF_COOKIE_NAME in response.cookies


def test_session_authenticated_returns_user(client, user: User):
    site = Site.objects.get(id=settings.SITE_ID)
    create_social_app(provider="google", site=site)
    client.force_login(user)

    response = client.get(reverse("api:auth-session"))

    assert response.status_code == HTTPStatus.OK
    payload = response.json()
    assert payload["authenticated"] is True
    assert payload["providers"] == ["google"]
    assert payload["csrf_token"]
    assert payload["user"] == {
        "id": str(user.pk),
        "email": user.email,
        "name": user.name,
    }


def test_session_authenticated_allows_blank_user_name(client, user: User):
    site = Site.objects.get(id=settings.SITE_ID)
    create_social_app(provider="google", site=site)
    user.name = ""
    user.save(update_fields=["name"])
    client.force_login(user)

    response = client.get(reverse("api:auth-session"))

    assert response.status_code == HTTPStatus.OK
    payload = response.json()
    assert payload["authenticated"] is True
    assert payload["user"]["name"] == ""


def test_providers_defaults_to_inbox_next(client):
    site = Site.objects.get(id=settings.SITE_ID)
    create_social_app(provider="google", site=site)
    create_social_app(provider="apple", site=site)

    response = client.get(reverse("api:auth-providers"))

    assert response.status_code == HTTPStatus.OK
    payload = response.json()
    google_path, google_query = parse_login_url(payload["google_login_url"])
    apple_path, apple_query = parse_login_url(payload["apple_login_url"])
    assert google_path == "/accounts/google/login/"
    assert apple_path == "/accounts/apple/login/"
    assert google_query["process"] == ["login"]
    assert apple_query["process"] == ["login"]
    assert google_query["next"] == ["/inbox"]
    assert apple_query["next"] == ["/inbox"]


def test_providers_accepts_safe_next_path(client):
    site = Site.objects.get(id=settings.SITE_ID)
    create_social_app(provider="google", site=site)
    create_social_app(provider="apple", site=site)

    response = client.get(reverse("api:auth-providers"), {"next": "/today"})

    assert response.status_code == HTTPStatus.OK
    payload = response.json()
    google_path, google_query = parse_login_url(payload["google_login_url"])
    apple_path, apple_query = parse_login_url(payload["apple_login_url"])
    assert google_path == "/accounts/google/login/"
    assert apple_path == "/accounts/apple/login/"
    assert google_query["next"] == ["/today"]
    assert apple_query["next"] == ["/today"]


def test_providers_rejects_unsafe_next_path(client):
    site = Site.objects.get(id=settings.SITE_ID)
    create_social_app(provider="google", site=site)
    create_social_app(provider="apple", site=site)

    response = client.get(
        reverse("api:auth-providers"),
        {"next": "https://evil.example/phish"},
    )

    assert response.status_code == HTTPStatus.OK
    payload = response.json()
    _, google_query = parse_login_url(payload["google_login_url"])
    _, apple_query = parse_login_url(payload["apple_login_url"])
    assert google_query["next"] == ["/inbox"]
    assert apple_query["next"] == ["/inbox"]


def test_providers_only_returns_configured_provider_urls(client):
    site = Site.objects.get(id=settings.SITE_ID)
    create_social_app(provider="google", site=site)

    response = client.get(reverse("api:auth-providers"))

    assert response.status_code == HTTPStatus.OK
    payload = response.json()
    assert payload["google_login_url"] is not None
    assert payload["apple_login_url"] is None


def test_logout_rejects_authenticated_request_without_csrf(user: User):
    client = Client(enforce_csrf_checks=True)
    client.force_login(user)

    response = client.post(reverse("api:auth-logout"))

    assert response.status_code == HTTPStatus.FORBIDDEN


def test_logout_accepts_authenticated_request_with_csrf(user: User):
    client = Client(enforce_csrf_checks=True)
    client.force_login(user)

    session_response = client.get(reverse("api:auth-session"))
    csrf_token = session_response.json()["csrf_token"]

    response = client.post(
        reverse("api:auth-logout"),
        HTTP_X_CSRFTOKEN=csrf_token,
    )

    assert response.status_code == HTTPStatus.NO_CONTENT
    post_logout_session = client.get(reverse("api:auth-session"))
    assert post_logout_session.json()["authenticated"] is False


def test_logout_anonymous_is_idempotent_without_csrf():
    client = Client(enforce_csrf_checks=True)

    response = client.post(reverse("api:auth-logout"))

    assert response.status_code == HTTPStatus.NO_CONTENT
