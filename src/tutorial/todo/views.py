from django.contrib.auth.models import User, Group
from rest_framework import viewsets
from rest_framework.permissions import BasePermission
from .serializers import UserSerializer, GroupSerializer, TodoSerializer
from .models import Todo

class CustomPermission(BasePermission):

    def has_permission(self, request, view):
        return True


class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer


class GroupViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    queryset = Group.objects.all()
    serializer_class = GroupSerializer


class TodoViewSet(viewsets.ModelViewSet):
    queryset = Todo.objects.all().order_by('-id')
    serializer_class = TodoSerializer
    permission_classes = [CustomPermission]
