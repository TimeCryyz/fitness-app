import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { workouts, comments } from '../services/api';

function WorkoutDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [workout, setWorkout] = useState(null);
  const [commentList, setCommentList] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [ws, setWs] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkout();
    loadComments();

    const socket = new WebSocket(`ws://127.0.0.1:8000/ws/workouts/${id}/`);
    setWs(socket);

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setCommentList(prev => [data.comment, ...prev]);
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, [id]);

  const loadWorkout = async () => {
    try {
      const response = await workouts.getById(id);
      setWorkout(response.data);
      await workouts.incrementViews(id);
    } catch (error) {
      console.error('Ошибка загрузки тренировки:', error);
    }
  };

  const loadComments = async () => {
    try {
      const response = await comments.getByWorkout(id);
      setCommentList(response.data);
    } catch (error) {
      console.error('Ошибка загрузки комментариев:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !user) return;

    const tempComment = {
      id: Date.now(),
      text: commentText,
      author_name: user.username,
      created_at: 'Отправка...'
    };
    setCommentList(prev => [tempComment, ...prev]);
    setCommentText('');

    try {
      await comments.create({ workout_id: id, text: commentText });
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ text: commentText, user_id: user.id }));
      }
    } catch (error) {
      console.error('Ошибка отправки комментария:', error);
      loadComments();
    }
  };

  if (loading) return <div className="container mt-4">Загрузка...</div>;
  if (!workout) return <div className="container mt-4">Тренировка не найдена</div>;

  return (
    <div className="container mt-4">
      <Link to="/" className="btn btn-secondary mb-3">← Назад</Link>

      <div className="row">
        <div className="col-md-8">
          <h1>{workout.title}</h1>
          <p className="text-muted">
            Категория: {workout.category?.name} | Длительность: {workout.duration_minutes} мин |
            Калории: {workout.calories_burn} | Просмотров: {workout.views}
          </p>
          {workout.image && (
            <img src={workout.image} className="img-fluid mb-3" alt={workout.title} style={{ maxHeight: '300px', objectFit: 'cover' }} />
          )}
          <div className="card mb-4">
            <div className="card-body">
              <p>{workout.description}</p>
              {workout.video_url && (
                <a href={workout.video_url} className="btn btn-primary" target="_blank" rel="noopener noreferrer">
                  Смотреть видео
                </a>
              )}
            </div>
          </div>

          <h3>Комментарии {commentList.length > 0 && `(${commentList.length})`}</h3>

          {user ? (
            <form onSubmit={sendComment} className="mb-4">
              <div className="input-group">
                <input type="text" className="form-control" value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Написать комментарий..." />
                <button type="submit" className="btn btn-primary">Отправить</button>
              </div>
            </form>
          ) : (
            <div className="alert alert-info">
              <Link to="/login">Авторизуйтесь</Link>, чтобы оставить комментарий
            </div>
          )}

          <div className="comments-list">
            {commentList.length === 0 ? (
              <p className="text-muted">Пока нет комментариев. Будьте первым!</p>
            ) : (
              commentList.map((comment) => (
                <div key={comment.id} className="card mb-2">
                  <div className="card-body">
                    <strong>{comment.author_name}</strong>
                    <small className="text-muted ms-2">{comment.created_at}</small>
                    <p className="mt-2 mb-0">{comment.text}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default WorkoutDetail;