"""
Authentication and User Profile Views
"""
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.contrib.auth.models import User
from .serializers import RegisterSerializer, UserSerializer, UpdateProfileSerializer


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({
            "user": UserSerializer(user).data,
            "message": "User created successfully. Please login."
        }, status=status.HTTP_201_CREATED)


class UserDetailView(generics.RetrieveAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class UpdateProfileView(generics.UpdateAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = UpdateProfileSerializer
    # FIX: Accept multipart/form-data so avatar image uploads work
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_object(self):
        return self.request.user

    # FIX: Allow PATCH (partial update). Without this override, only PUT worked.
    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()

        # FIX: Handle flat multipart FormData keys like "profile.bio" -> nested dict
        data = {}
        profile_data = {}

        for key, value in request.data.items():
            if key.startswith('profile.'):
                field = key.split('.', 1)[1]
                if field == 'avatar' and key in request.FILES:
                    profile_data[field] = request.FILES[key]
                else:
                    profile_data[field] = value[0] if isinstance(value, list) else value
            else:
                data[key] = value[0] if isinstance(value, list) else value

        # Handle avatar uploaded via FILES
        if 'profile.avatar' in request.FILES:
            profile_data['avatar'] = request.FILES['profile.avatar']

        if profile_data:
            data['profile'] = profile_data

        serializer = self.get_serializer(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        # Return refreshed full user data
        return Response(UserSerializer(instance).data)


class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = (AllowAny,)


class UserPublicProfileView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = (AllowAny,)
    lookup_field = 'username'
