"""
Blog URL Configuration
"""
from django.urls import path
from .views import (
    PostListView,
    PostDetailView,
    PostCreateView,
    PostUpdateView,
    PostDeleteView,
    MyPostsListView,
    TagListView,
    TagCreateView,
    CommentListView,
    CommentCreateView,
    CommentDeleteView,
    toggle_like,
    toggle_bookmark,
    toggle_pin,
    BookmarkedPostsView,
)

urlpatterns = [
    # Posts
    path('posts/', PostListView.as_view(), name='post-list'),
    path('posts/create/', PostCreateView.as_view(), name='post-create'),
    path('posts/my-posts/', MyPostsListView.as_view(), name='my-posts'),
    path('posts/bookmarked/', BookmarkedPostsView.as_view(), name='bookmarked-posts'),
    path('posts/<slug:slug>/', PostDetailView.as_view(), name='post-detail'),
    path('posts/<slug:slug>/update/', PostUpdateView.as_view(), name='post-update'),
    path('posts/<slug:slug>/delete/', PostDeleteView.as_view(), name='post-delete'),
    path('posts/<slug:slug>/like/', toggle_like, name='toggle-like'),
    path('posts/<slug:slug>/bookmark/', toggle_bookmark, name='toggle-bookmark'),
    path('posts/<slug:slug>/pin/', toggle_pin, name='toggle-pin'),
    
    # Tags
    path('tags/', TagListView.as_view(), name='tag-list'),
    path('tags/create/', TagCreateView.as_view(), name='tag-create'),
    
    # Comments
    path('posts/<slug:post_slug>/comments/', CommentListView.as_view(), name='comment-list'),
    path('posts/<slug:post_slug>/comments/create/', CommentCreateView.as_view(), name='comment-create'),
    path('comments/<int:pk>/delete/', CommentDeleteView.as_view(), name='comment-delete'),
]
