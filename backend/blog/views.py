"""
Blog Views - Posts, Comments, Tags, Likes, Bookmarks
"""
from rest_framework import generics, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import Post, Tag, Comment, Like, Bookmark
from .serializers import (
    PostListSerializer,
    PostDetailSerializer,
    PostCreateUpdateSerializer,
    TagSerializer,
    CommentSerializer
)
from .permissions import IsAuthorOrReadOnly


class PostListView(generics.ListAPIView):
    serializer_class = PostListSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'author', 'tags', 'is_pinned']
    search_fields = ['title', 'content', 'excerpt']
    ordering_fields = ['created_at', 'published_at', 'views', 'is_pinned']
    ordering = ['-is_pinned', '-created_at']

    def get_queryset(self):
        queryset = Post.objects.select_related('author').prefetch_related('tags', 'likes', 'bookmarks')

        if not self.request.user.is_authenticated:
            queryset = queryset.filter(status='published')
        else:
            queryset = queryset.filter(
                Q(status='published') | Q(author=self.request.user)
            )

        tag_slug = self.request.query_params.get('tag', None)
        if tag_slug:
            queryset = queryset.filter(tags__slug=tag_slug)

        # FIX: Support filtering by author username (used by UserProfile page)
        author_username = self.request.query_params.get('author__username', None)
        if author_username:
            queryset = queryset.filter(author__username=author_username)

        return queryset.order_by('-is_pinned', '-created_at')


class PostDetailView(generics.RetrieveAPIView):
    queryset = Post.objects.select_related('author').prefetch_related('tags', 'likes', 'bookmarks', 'comments')
    serializer_class = PostDetailSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.views += 1
        instance.save(update_fields=['views'])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class PostCreateView(generics.CreateAPIView):
    queryset = Post.objects.all()
    serializer_class = PostCreateUpdateSerializer
    permission_classes = [IsAuthenticated]
    # FIX: Accept multipart/form-data so featured_image file uploads work
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class PostUpdateView(generics.UpdateAPIView):
    queryset = Post.objects.all()
    serializer_class = PostCreateUpdateSerializer
    permission_classes = [IsAuthenticated, IsAuthorOrReadOnly]
    lookup_field = 'slug'
    # FIX: Accept multipart/form-data so featured_image file uploads work on edit
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)


class PostDeleteView(generics.DestroyAPIView):
    queryset = Post.objects.all()
    permission_classes = [IsAuthenticated, IsAuthorOrReadOnly]
    lookup_field = 'slug'


class MyPostsListView(generics.ListAPIView):
    serializer_class = PostListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Post.objects.filter(author=self.request.user).select_related('author').prefetch_related('tags')


class TagListView(generics.ListAPIView):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class TagCreateView(generics.CreateAPIView):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [IsAuthenticated]


class CommentListView(generics.ListAPIView):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        post_slug = self.kwargs.get('post_slug')
        return Comment.objects.filter(post__slug=post_slug, parent=None).select_related('author', 'post')


class CommentCreateView(generics.CreateAPIView):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        post_slug = self.kwargs.get('post_slug')
        post = Post.objects.get(slug=post_slug)
        serializer.save(author=self.request.user, post=post)


class CommentDeleteView(generics.DestroyAPIView):
    queryset = Comment.objects.all()
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Comment.objects.filter(author=self.request.user)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_like(request, slug):
    try:
        post = Post.objects.get(slug=slug)
    except Post.DoesNotExist:
        return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)

    like, created = Like.objects.get_or_create(post=post, user=request.user)
    if not created:
        like.delete()
        return Response({'message': 'Post unliked', 'liked': False}, status=status.HTTP_200_OK)
    return Response({'message': 'Post liked', 'liked': True}, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_bookmark(request, slug):
    try:
        post = Post.objects.get(slug=slug)
    except Post.DoesNotExist:
        return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)

    bookmark, created = Bookmark.objects.get_or_create(post=post, user=request.user)
    if not created:
        bookmark.delete()
        return Response({'message': 'Bookmark removed', 'bookmarked': False}, status=status.HTTP_200_OK)
    return Response({'message': 'Post bookmarked', 'bookmarked': True}, status=status.HTTP_201_CREATED)


class BookmarkedPostsView(generics.ListAPIView):
    serializer_class = PostListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        bookmarks = Bookmark.objects.filter(user=self.request.user).values_list('post_id', flat=True)
        return Post.objects.filter(id__in=bookmarks).select_related('author').prefetch_related('tags')


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_pin(request, slug):
    if not (request.user.is_staff or request.user.is_superuser):
        return Response({'error': 'Only admin users can pin/unpin posts'}, status=status.HTTP_403_FORBIDDEN)

    try:
        post = Post.objects.get(slug=slug)
    except Post.DoesNotExist:
        return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)

    post.is_pinned = not post.is_pinned
    post.save()
    message = 'Post pinned to top' if post.is_pinned else 'Post unpinned'
    return Response({'message': message, 'is_pinned': post.is_pinned}, status=status.HTTP_200_OK)
