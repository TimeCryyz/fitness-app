from rest_framework import serializers
from .models import ExerciseCategory, Workout, Comment

class CategorySerializer(serializers.ModelSerializer):
    workout_count = serializers.IntegerField(source='workouts.count', read_only=True)

    class Meta:
        model = ExerciseCategory
        fields = ['id', 'name', 'slug', 'description', 'image', 'workout_count']


class CommentSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.username', read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'text', 'author_name', 'created_at']
        read_only_fields = ['author', 'created_at']


class WorkoutListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    author_name = serializers.CharField(source='author.username', read_only=True)

    class Meta:
        model = Workout
        fields = ['id', 'title', 'duration_minutes', 'calories_burn', 'image', 'views', 'category_name', 'author_name', 'created_at']


class WorkoutDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    author_name = serializers.CharField(source='author.username', read_only=True)
    comments = CommentSerializer(many=True, read_only=True)

    class Meta:
        model = Workout
        fields = '__all__'


class WorkoutCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Workout
        fields = ['title', 'description', 'category', 'duration_minutes', 'calories_burn', 'video_url', 'image', 'is_published']