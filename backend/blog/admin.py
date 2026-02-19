"""
Blog Admin Configuration
"""
from django.contrib import admin
from .models import Post, Tag, Comment, Like, Bookmark

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'status', 'is_pinned', 'created_at', 'published_at', 'views']
    list_filter = ['status', 'is_pinned', 'created_at', 'published_at', 'tags']
    search_fields = ['title', 'content', 'author__username']
    prepopulated_fields = {'slug': ('title',)}
    date_hierarchy = 'created_at'
    ordering = ['-is_pinned', '-created_at']
    filter_horizontal = ['tags']
    list_editable = ['is_pinned']  # Allow quick toggle of pinned status
    
    def get_queryset(self, request):
        """Show pinned posts at the top in admin"""
        qs = super().get_queryset(request)
        return qs.order_by('-is_pinned', '-created_at')

@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ['name']

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['author', 'post', 'created_at', 'parent']
    list_filter = ['created_at']
    search_fields = ['content', 'author__username', 'post__title']
    date_hierarchy = 'created_at'

@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display = ['user', 'post', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username', 'post__title']

@admin.register(Bookmark)
class BookmarkAdmin(admin.ModelAdmin):
    list_display = ['user', 'post', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username', 'post__title']
