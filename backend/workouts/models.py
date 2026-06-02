from django.db import models
from django.conf import settings

class ExerciseCategory(models.Model):
    name = models.CharField('Название', max_length=100, db_index=True)
    slug = models.SlugField('URL', unique=True, blank=True)
    description = models.TextField('Описание', blank=True)
    image = models.ImageField('Изображение', upload_to='categories/', blank=True)

    class Meta:
        verbose_name = 'Категория'
        verbose_name_plural = 'Категории'
        ordering = ['name']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            from django.utils.text import slugify
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Workout(models.Model):
    title = models.CharField('Название тренировки', max_length=200)
    description = models.TextField('Описание')
    category = models.ForeignKey(
        ExerciseCategory,
        on_delete=models.PROTECT,
        verbose_name='Категория',
        related_name='workouts'
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        verbose_name='Автор',
        related_name='workouts'
    )
    duration_minutes = models.PositiveIntegerField('Длительность (мин)', default=30)
    calories_burn = models.PositiveIntegerField('Сжигаемые калории', default=200)
    video_url = models.URLField('Ссылка на видео', blank=True)
    image = models.ImageField('Превью', upload_to='workouts/', blank=True)
    created_at = models.DateTimeField('Дата создания', auto_now_add=True)
    updated_at = models.DateTimeField('Дата обновления', auto_now=True)
    is_published = models.BooleanField('Опубликовано', default=True)
    views = models.PositiveIntegerField('Просмотры', default=0)

    class Meta:
        verbose_name = 'Тренировка'
        verbose_name_plural = 'Тренировки'
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class Comment(models.Model):
    workout = models.ForeignKey(
        Workout,
        on_delete=models.CASCADE,
        verbose_name='Тренировка',
        related_name='comments'
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        verbose_name='Автор',
        related_name='comments'
    )
    text = models.TextField('Текст комментария')
    created_at = models.DateTimeField('Дата создания', auto_now_add=True)

    class Meta:
        verbose_name = 'Комментарий'
        verbose_name_plural = 'Комментарии'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.author.username} - {self.workout.title}'