"""
Accounts URL Configuration
"""
from django.urls import path
from .views import (
    RegisterView,
    UserDetailView,
    UpdateProfileView,
    UserListView,
    UserPublicProfileView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('profile/', UserDetailView.as_view(), name='user-profile'),
    path('profile/update/', UpdateProfileView.as_view(), name='update-profile'),
    path('users/', UserListView.as_view(), name='user-list'),
    path('users/<str:username>/', UserPublicProfileView.as_view(), name='user-public-profile'),
]
