import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { workouts, comments } from '../services/api';

function WorkoutDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [workout, setWorkout] = useState(null);
  const [commentList, setCommentList] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const wsRef = useRef(null);

  useEffect(() => {
    loadWorkout();
    loadComments();

    // WebSocket connection
    const socket = new WebSocket(`ws://127.0.0.1:8000/ws/workouts/${id}/`);
    wsRef.current = socket;

    socket.onopen = () => {
      console.log('WebSocket connected');
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('WebSocket message:', data);
      if (data.comment) {
        setCommentList(prev => {
          // Проверяем, нет ли уже такого комментария
          const exists = prev.some(c => c.id === data.comment.id);
          if (exists) return prev;
          return [data.comment, ...prev];
        });
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    socket.onclose = () => {
      console.log('WebSocket closed');
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
      console.log('Comments loaded:', response.data);
      const commentsData = response.data?.results || response.data || [];
      setCommentList(commentsData);
    } catch (error) {
      console.error('Ошибка загрузки комментариев:', error);
      setCommentList([]);
    } finally {
      setLoading(false);
    }
  };

  const sendComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !user) return;

    const tempId = Date.now();
    const tempComment = {
      id: tempId,
      text: commentText,
      author_name: user.username,
      created_at: 'Отправка...',
      isTemp: true
    };

    setCommentList(prev => [tempComment, ...prev]);
    const currentText = commentText;
    setCommentText('');

    try {
      const response = await comments.create({
        workout_id: parseInt(id),
        text: currentText
      });

      console.log('Comment created:', response.data);

      // Заменяем временный комментарий на реальный
      setCommentList(prev =>
        prev.map(c => c.id === tempId ? response.data : c)
      );

      // Отправляем через WebSocket
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          text: currentText,
          user_id: user.id
        }));
      }
    } catch (error) {
      console.error('Ошибка отправки:', error);
      // Удаляем временный комментарий при ошибке
      setCommentList(prev => prev.filter(c => c.id !== tempId));
      alert('Ошибка отправки комментария');
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
            Категория: {workout.category?.name || workout.category_name} | Длительность: {workout.duration_minutes} мин |
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

          <h3>Комментарии ({commentList.length})</h3>

          {user ? (
            <form onSubmit={sendComment} className="mb-4">
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Написать комментарий..."
                />
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