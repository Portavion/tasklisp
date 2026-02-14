How To - Project Documentation
======================================================================

Get Started
----------------------------------------------------------------------

Documentation can be written as rst files in `todo_lisp/docs`.


To build and serve docs, use the commands::

    docker compose -f docker-compose.docs.yml up



Changes to files in `docs/_source` will be picked up and reloaded automatically.

`Sphinx <https://www.sphinx-doc.org/>`_ is the tool used to build documentation.


Social Auth Providers
----------------------------------------------------------------------

Google and Apple providers are enabled through ``django-allauth``.

1. Set provider env vars in ``.envs/.local/.django`` and ``.envs/.production/.django``.
2. Configure callback URLs at the OAuth providers:

   - ``https://<domain>/accounts/google/login/callback/``
   - ``https://<domain>/accounts/apple/login/callback/``

3. Run:

   ::

      uv run python manage.py migrate
      uv run python manage.py sync_social_apps

4. Verify ``SocialApp`` entries in Django admin.

Docstrings to Documentation
----------------------------------------------------------------------

The sphinx extension `apidoc <https://www.sphinx-doc.org/en/master/man/sphinx-apidoc.html>`_ is used to automatically document code using signatures and docstrings.

Numpy or Google style docstrings will be picked up from project files and available for documentation. See the `Napoleon <https://sphinxcontrib-napoleon.readthedocs.io/en/latest/>`_ extension for details.

For an in-use example, see the `page source <_sources/users.rst.txt>`_ for :ref:`users`.

To compile all docstrings automatically into documentation source files, use the command:
    ::

        uv run make apidocs


This can be done in the docker container:
    ::

        docker run --rm docs make apidocs
