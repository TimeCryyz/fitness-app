from django.contrib import admin
from .models import ExerciseCategory, Workout, Comment

@admin.register(ExerciseCategory)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name',)

@admin.register(Workout)
class WorkoutAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'author', 'duration_minutes', 'is_published', 'views')
    list_filter = ('category', 'is_published', 'created_at')
    search_fields = ('title', 'description')
    readonly_fields = ('views',)

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('workout', 'author', 'created_at')
    list_filter = ('created_at',)