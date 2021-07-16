from rest_framework import permissions

class IsAuthorOrReadOnly(permissions.BasePermission):
    """
    Permiso personalizado para que un objeto solo pueda ser modificado por su autor
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True

        return obj.autor == request.user