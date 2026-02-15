from urllib.parse import urlencode
from urllib.parse import urlsplit
from urllib.parse import urlunsplit

from allauth.socialaccount.models import SocialApp
from django.contrib.auth import logout as django_logout
from django.contrib.sites.shortcuts import get_current_site
from django.middleware.csrf import get_token
from django.urls import reverse
from rest_framework import status
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .auth_serializers import AuthProvidersResponseSerializer
from .auth_serializers import SessionResponseSerializer

SUPPORTED_PROVIDERS = ("google", "apple")
LOGIN_URL_NAMES = {"google": "google_login", "apple": "apple_login"}
DEFAULT_NEXT_PATH = "/inbox"


def sanitize_next_path(raw_next: str | None, default: str = DEFAULT_NEXT_PATH) -> str:
    if not raw_next:
        return default

    parsed = urlsplit(raw_next)
    if parsed.scheme or parsed.netloc:
        return default

    if not parsed.path.startswith("/"):
        return default

    if "\\" in raw_next:
        return default

    return urlunsplit(("", "", parsed.path, parsed.query, ""))


def get_configured_providers(request) -> list[str]:
    current_site = get_current_site(request)
    configured = set(
        SocialApp.objects.filter(
            provider__in=SUPPORTED_PROVIDERS,
            sites=current_site,
        ).values_list("provider", flat=True),
    )
    return [provider for provider in SUPPORTED_PROVIDERS if provider in configured]


def build_provider_login_url(provider: str, next_path: str) -> str:
    login_path = reverse(LOGIN_URL_NAMES[provider])
    query = urlencode({"process": "login", "next": next_path})
    return f"{login_path}?{query}"


class AuthSessionView(APIView):
    authentication_classes = (SessionAuthentication,)
    permission_classes = (AllowAny,)

    def get(self, request):
        payload: dict[str, object] = {
            "authenticated": request.user.is_authenticated,
            "providers": get_configured_providers(request),
            "csrf_token": get_token(request),
        }

        if request.user.is_authenticated:
            payload["user"] = {
                "id": str(request.user.pk),
                "email": request.user.email,
                "name": request.user.name,
            }

        serializer = SessionResponseSerializer(data=payload)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)


class AuthProvidersView(APIView):
    authentication_classes = (SessionAuthentication,)
    permission_classes = (AllowAny,)

    def get(self, request):
        next_path = sanitize_next_path(request.query_params.get("next"))
        configured = set(get_configured_providers(request))
        payload: dict[str, str | None] = {
            "google_login_url": None,
            "apple_login_url": None,
        }

        for provider in SUPPORTED_PROVIDERS:
            if provider in configured:
                payload[f"{provider}_login_url"] = build_provider_login_url(
                    provider=provider,
                    next_path=next_path,
                )

        serializer = AuthProvidersResponseSerializer(data=payload)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)


class AuthLogoutView(APIView):
    authentication_classes = (SessionAuthentication,)
    permission_classes = (AllowAny,)

    def post(self, request):
        if request.user.is_authenticated:
            django_logout(request)

        return Response(status=status.HTTP_204_NO_CONTENT)
