from django.conf import settings
from django.urls import path
from rest_framework.routers import DefaultRouter
from rest_framework.routers import SimpleRouter

from todo_lisp.users.api.auth_views import AuthLogoutView
from todo_lisp.users.api.auth_views import AuthProvidersView
from todo_lisp.users.api.auth_views import AuthSessionView
from todo_lisp.users.api.views import UserViewSet

router = DefaultRouter() if settings.DEBUG else SimpleRouter()

router.register("users", UserViewSet)


app_name = "api"
urlpatterns = [
    *router.urls,
    path("v1/auth/session", AuthSessionView.as_view(), name="auth-session"),
    path("v1/auth/providers", AuthProvidersView.as_view(), name="auth-providers"),
    path("v1/auth/logout", AuthLogoutView.as_view(), name="auth-logout"),
]
