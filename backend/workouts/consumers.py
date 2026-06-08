import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Workout, Comment
from django.contrib.auth import get_user_model

User = get_user_model()


class CommentConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.workout_id = self.scope['url_route']['kwargs']['workout_id']
        self.room_group_name = f'workout_{self.workout_id}'

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()
        print(f"WebSocket connected to workout {self.workout_id}")

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        print(f"WebSocket disconnected from workout {self.workout_id}")

    async def receive(self, text_data):
        data = json.loads(text_data)
        comment = await self.save_comment(data['text'], data['user_id'])

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'new_comment',
                'comment': comment
            }
        )

    async def new_comment(self, event):
        await self.send(text_data=json.dumps({
            'comment': event['comment']
        }))

    @database_sync_to_async
    def save_comment(self, text, user_id):
        workout = Workout.objects.get(id=self.workout_id)
        user = User.objects.get(id=user_id)
        comment = Comment.objects.create(
            workout=workout,
            author=user,
            text=text
        )
        return {
            'id': comment.id,
            'text': comment.text,
            'author_name': comment.author.username,
            'created_at': comment.created_at.strftime('%d.%m.%Y %H:%M')
        }