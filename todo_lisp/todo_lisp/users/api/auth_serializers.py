from rest_framework import serializers


class SessionUserSerializer(serializers.Serializer):
    id = serializers.CharField()
    email = serializers.EmailField()
    name = serializers.CharField(allow_blank=True)


class SessionResponseSerializer(serializers.Serializer):
    authenticated = serializers.BooleanField()
    user = SessionUserSerializer(required=False)
    providers = serializers.ListField(
        child=serializers.ChoiceField(choices=["google", "apple"]),
    )
    csrf_token = serializers.CharField()


class AuthProvidersResponseSerializer(serializers.Serializer):
    google_login_url = serializers.CharField(allow_null=True)
    apple_login_url = serializers.CharField(allow_null=True)
