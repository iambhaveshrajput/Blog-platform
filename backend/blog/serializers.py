"""
Blog Serializers
"""
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Post, Tag, Comment, Like, Bookmark

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug']
        read_only_fields = ['slug']

class AuthorSerializer(serializers.ModelSerializer):
    avatar = serializers.SerializerMethodField()
    
    def get_avatar(self, obj):
        if hasattr(obj, 'profile') and obj.profile.avatar:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.profile.avatar.url)
        return None
    
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'avatar']

class CommentSerializer(serializers.ModelSerializer):
    author = AuthorSerializer(read_only=True)
    replies = serializers.SerializerMethodField()
    
    def get_replies(self, obj):
        if obj.replies.exists():
            return CommentSerializer(obj.replies.all(), many=True, context=self.context).data
        return []
    
    class Meta:
        model = Comment
        fields = ['id', 'post', 'author', 'parent', 'content', 'created_at', 'updated_at', 'replies']
        read_only_fields = ['author', 'created_at', 'updated_at']

class PostListSerializer(serializers.ModelSerializer):
    author = AuthorSerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    reading_time = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    is_bookmarked = serializers.SerializerMethodField()
    
    def get_reading_time(self, obj):
        return obj.reading_time()
    
    def get_likes_count(self, obj):
        return obj.likes.count()
    
    def get_comments_count(self, obj):
        return obj.comments.count()
    
    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Like.objects.filter(post=obj, user=request.user).exists()
        return False
    
    def get_is_bookmarked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Bookmark.objects.filter(post=obj, user=request.user).exists()
        return False
    
    class Meta:
        model = Post
        fields = [
            'id', 'title', 'slug', 'excerpt', 'featured_image', 'author', 
            'tags', 'status', 'is_pinned', 'created_at', 'published_at', 'reading_time',
            'likes_count', 'comments_count', 'is_liked', 'is_bookmarked', 'views'
        ]

class PostDetailSerializer(serializers.ModelSerializer):
    author = AuthorSerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    tag_ids = serializers.PrimaryKeyRelatedField(
        many=True, 
        queryset=Tag.objects.all(), 
        source='tags', 
        write_only=True,
        required=False
    )
    reading_time = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    is_bookmarked = serializers.SerializerMethodField()
    content_html = serializers.SerializerMethodField()
    
    def get_reading_time(self, obj):
        return obj.reading_time()
    
    def get_likes_count(self, obj):
        return obj.likes.count()
    
    def get_comments_count(self, obj):
        return obj.comments.count()
    
    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Like.objects.filter(post=obj, user=request.user).exists()
        return False
    
    def get_is_bookmarked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Bookmark.objects.filter(post=obj, user=request.user).exists()
        return False
    
    def get_content_html(self, obj):
        return obj.content_html()
    
    class Meta:
        model = Post
        fields = [
            'id', 'title', 'slug', 'content', 'content_html', 'excerpt', 
            'featured_image', 'author', 'tags', 'tag_ids', 'status', 'is_pinned',
            'created_at', 'updated_at', 'published_at', 'reading_time',
            'likes_count', 'comments_count', 'is_liked', 'is_bookmarked', 'views'
        ]
        read_only_fields = ['author', 'slug', 'created_at', 'updated_at', 'published_at', 'views']

class PostCreateUpdateSerializer(serializers.ModelSerializer):
    tag_ids = serializers.PrimaryKeyRelatedField(
        many=True, 
        queryset=Tag.objects.all(), 
        source='tags',
        required=False
    )
    is_pinned = serializers.BooleanField(required=False)
    
    class Meta:
        model = Post
        fields = ['title', 'content', 'excerpt', 'featured_image', 'tag_ids', 'status', 'is_pinned']
    
    def validate_is_pinned(self, value):
        """Only allow admin/staff to pin posts"""
        request = self.context.get('request')
        if value and request and not (request.user.is_staff or request.user.is_superuser):
            raise serializers.ValidationError("Only admin users can pin posts")
        return value
    
    def create(self, validated_data):
        tags = validated_data.pop('tags', [])
        post = Post.objects.create(**validated_data)
        post.tags.set(tags)
        return post
    
    def update(self, instance, validated_data):
        tags = validated_data.pop('tags', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if tags is not None:
            instance.tags.set(tags)
        
        return instance
