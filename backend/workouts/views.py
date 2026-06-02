from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import ExerciseCategory, Workout, Comment
from .serializers import (
    CategorySerializer,
    WorkoutListSerializer,
    WorkoutDetailSerializer,
    WorkoutCreateUpdateSerializer,
    CommentSerializer
)
from .permissions import IsAuthorOrReadOnly


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet для категорий упражнений (только чтение)"""
    queryset = ExerciseCategory.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]


class WorkoutViewSet(viewsets.ModelViewSet):
    """ViewSet для тренировок (CRUD + дополнительные действия)"""
    queryset = Workout.objects.filter(is_published=True)
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'views', 'duration_minutes']

    def get_serializer_class(self):
        if self.action == 'list':
            return WorkoutListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return WorkoutCreateUpdateSerializer
        return WorkoutDetailSerializer

    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            return [IsAuthorOrReadOnly()]
        elif self.action == 'create':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    @action(detail=True, methods=['post'])
    def increment_views(self, request, pk=None):
        """Увеличить счётчик просмотров тренировки"""
        workout = self.get_object()
        workout.views += 1
        workout.save(update_fields=['views'])
        return Response({'views': workout.views})

    @action(detail=False, methods=['get'])
    def my_workouts(self, request):
        """Получить тренировки текущего пользователя"""
        workouts = Workout.objects.filter(author=request.user)
        serializer = self.get_serializer(workouts, many=True)
        return Response(serializer.data)


class CommentViewSet(viewsets.ModelViewSet):
    """ViewSet для комментариев"""
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        workout_id = self.request.query_params.get('workout_id')
        if workout_id:
            return Comment.objects.filter(workout_id=workout_id)
        return Comment.objects.all()

    def perform_create(self, serializer):
        workout_id = self.request.data.get('workout_id')
        workout = Workout.objects.get(id=workout_id)
        serializer.save(author=self.request.user, workout=workout)