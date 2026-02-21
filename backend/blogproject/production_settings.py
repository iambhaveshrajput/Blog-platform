"""
Production settings for Render deployment
"""
from .settings import *
import os
import dj_database_url

DEBUG = os.environ.get('DEBUG', 'False') == 'True'

ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '*').split(',')

# Database
if 'DATABASE_URL' in os.environ:
    DATABASES = {
        'default': dj_database_url.config(
            default=os.environ.get('DATABASE_URL'),
            conn_max_age=600,
            conn_health_checks=True,
        )
    }

# Static files — WhiteNoise serves admin CSS/JS
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATIC_URL = '/static/'

# FIX: WhiteNoise middleware must be inserted BEFORE other middleware
# so admin panel CSS/JS loads properly (was missing — admin was unstyled/broken)
if 'whitenoise.middleware.WhiteNoiseMiddleware' not in MIDDLEWARE:
    MIDDLEWARE.insert(1, 'whitenoise.middleware.WhiteNoiseMiddleware')

STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Media files
# On Render free tier, the filesystem is ephemeral — uploaded images are lost on redeploy.
# If CLOUDINARY_URL env var is set, use Cloudinary for persistent media storage.
# Otherwise fall back to local storage (images will not persist across deploys).
CLOUDINARY_URL = os.environ.get('CLOUDINARY_URL', '')

if CLOUDINARY_URL:
    import cloudinary
    import cloudinary.uploader
    import cloudinary.api
    from cloudinary_storage.storage import MediaCloudinaryStorage

    INSTALLED_APPS += ['cloudinary', 'cloudinary_storage']

    cloudinary.config(cloudinary_url=CLOUDINARY_URL)

    DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'
    MEDIA_URL = '/media/'
else:
    # Fallback: local media (ephemeral on Render free plan)
    MEDIA_ROOT = os.path.join(BASE_DIR, 'mediafiles')
    MEDIA_URL = '/media/'

# Security — do NOT redirect SSL on Render (Render handles it at proxy level)
SECURE_SSL_REDIRECT = False
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False

# Tell Django it's behind Render's proxy
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# FIX: CORS — reads from environment variable set in render.yaml
# Added explicit CORS_ALLOW_HEADERS so Authorization header passes preflight
CORS_ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.environ.get(
        'CORS_ALLOWED_ORIGINS',
        'http://localhost:3000'
    ).split(',')
    if origin.strip()
]

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_ALL_ORIGINS = False

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]
