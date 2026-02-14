from __future__ import annotations

from typing import Any

from allauth.socialaccount.models import SocialApp
from django.conf import settings
from django.contrib.sites.models import Site
from django.core.management.base import BaseCommand
from django.core.management.base import CommandError
from django.db import transaction


class Command(BaseCommand):
    help = (
        "Create/update django-allauth SocialApp records for configured providers "
        "and attach them to the active Site."
    )

    def add_arguments(self, parser) -> None:  # type: ignore[no-untyped-def]
        parser.add_argument(
            "--site-id",
            type=int,
            default=settings.SITE_ID,
            help="Django Site ID to attach SocialApp records to.",
        )
        parser.add_argument(
            "--provider",
            action="append",
            choices=("google", "apple"),
            help="Limit syncing to one or more providers.",
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Show what would change without writing to the database.",
        )

    def handle(self, *args: Any, **options: Any) -> None:
        try:
            site = Site.objects.get(id=options["site_id"])
        except Site.DoesNotExist as exc:
            msg = f"Site with id={options['site_id']} does not exist."
            raise CommandError(msg) from exc

        configured_apps: dict[str, dict[str, str]] = getattr(
            settings,
            "SOCIALACCOUNT_BOOTSTRAP_APPS",
            {},
        )

        if not configured_apps:
            self.stdout.write(
                self.style.WARNING("No SOCIALACCOUNT_BOOTSTRAP_APPS configured."),
            )
            return

        selected_providers = set(options.get("provider") or configured_apps.keys())
        dry_run = options["dry_run"]

        synced = 0
        skipped = 0

        for provider in selected_providers:
            provider_config = configured_apps.get(provider)
            if not provider_config:
                self.stdout.write(
                    self.style.WARNING(f"Skipping {provider}: no config found."),
                )
                skipped += 1
                continue

            client_id = provider_config.get("client_id", "").strip()
            secret = provider_config.get("secret", "").strip()
            key = provider_config.get("key", "").strip()
            name = provider_config.get("name", provider.title())

            if not client_id or not secret:
                self.stdout.write(
                    self.style.WARNING(
                        (
                            f"Skipping {provider}: missing client_id/secret. "
                            "Set env vars and rerun sync_social_apps."
                        ),
                    ),
                )
                skipped += 1
                continue

            existing = (
                SocialApp.objects.filter(provider=provider, sites=site)
                .order_by("id")
                .first()
            )
            if existing is None:
                existing = (
                    SocialApp.objects.filter(provider=provider, name=name)
                    .order_by("id")
                    .first()
                )

            created = existing is None
            action = "create" if created else "update"

            if dry_run:
                self.stdout.write(
                    (
                        f"[dry-run] Would {action} SocialApp "
                        f"provider={provider!r} for site={site.id}."
                    ),
                )
                synced += 1
                continue

            with transaction.atomic():
                app = existing or SocialApp(provider=provider, name=name)
                app.name = name
                app.provider = provider
                app.client_id = client_id
                app.secret = secret
                app.key = key
                app.save()
                app.sites.add(site)

            self.stdout.write(
                self.style.SUCCESS(
                    (
                        f"Synced SocialApp provider={provider!r} "
                        f"name={name!r} site={site.id}."
                    ),
                ),
            )
            synced += 1

        self.stdout.write(
            (
                f"Finished sync_social_apps: "
                f"synced={synced}, skipped={skipped}, site={site.id}."
            ),
        )
