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
  const hasIncrementedRef = useRef(false);

  useEffect(() => {
    loadWorkout();
    loadComments();

    const socket = new WebSocket(`ws://127.0.0.1:8000/ws/workouts/${id}/`);
    wsRef.current = socket;

    socket.onopen = () => {
      console.log('WebSocket connected');
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.comment) {
        setCommentList(prev => {
          const exists = prev.some(c => c.id === data.comment.id);
          if (exists) return prev;
          return [data.comment, ...prev];
        });
      }
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
      if (!hasIncrementedRef.current) {
        await workouts.incrementViews(id);
        hasIncrementedRef.current = true;
      }
    } catch (error) {
      console.error('Ошибка загрузки тренировки:', error);
    }
  };

  const loadComments = async () => {
    try {
      const response = await comments.getByWorkout(id);
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

      setCommentList(prev =>
        prev.map(c => c.id === tempId ? response.data : c)
      );
    } catch (error) {
      console.error('Ошибка отправки:', error);
      setCommentList(prev => prev.filter(c => c.id !== tempId));
      alert('Ошибка отправки комментария');
    }
  };

  if (loading) return <div className="container mt-4" style={{ color: '#fff' }}>Загрузка...</div>;
  if (!workout) return <div className="container mt-4" style={{ color: '#fff' }}>Тренировка не найдена</div>;

  return (
    <div className="container mt-4">
      <Link to="/workouts" className="btn btn-secondary mb-3">← Назад</Link>

      <div className="row">
        <div className="col-md-8">
          <h1 style={{ color: '#fff' }}>{workout.title}</h1>
          <p style={{ color: '#8b949e' }}>
            Категория: {workout.category?.name || workout.category_name} | Длительность: {workout.duration_minutes} мин |
            Калории: {workout.calories_burn} | Просмотров: {workout.views}
          </p>
          {workout.image && (
            <img src={workout.image} className="img-fluid mb-3" alt={workout.title} style={{ maxHeight: '300px', objectFit: 'cover', borderRadius: '16px' }} />
          )}
          <div className="card mb-4" style={{ background: '#2c2c2e', border: '1px solid #3a3a3c' }}>
            <div className="card-body">
              <p style={{ color: '#e1e1e6', lineHeight: 1.6 }}>{workout.description}</p>
              {workout.video_url && (
                <a href={workout.video_url} className="btn btn-primary" target="_blank" rel="noopener noreferrer" style={{ marginTop: '1rem' }}>
                  Смотреть видео
                </a>
              )}
            </div>
          </div>

          <h3 style={{ color: '#fff', marginTop: '2rem' }}>Комментарии ({commentList.length})</h3>

          {user ? (
            <form onSubmit={sendComment} className="mb-4">
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Написать комментарий..."
                  style={{
                    flex: 1,
                    background: '#1c1c1e',
                    border: '1px solid #3a3a3c',
                    color: '#ffffff',
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    fontSize: '0.9rem'
                  }}
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{
                    background: 'linear-gradient(135deg, #ff3b30 0%, #ff9500 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '0.75rem 1.5rem',
                    fontWeight: '600'
                  }}
                >
                  Отправить
                </button>
              </div>
            </form>
          ) : (
            <div className="alert alert-info" style={{ background: 'rgba(255, 59, 48, 0.15)', borderLeft: '4px solid #ff3b30', color: '#e1e1e6' }}>
              <Link to="/login" style={{ color: '#ff3b30' }}>Авторизуйтесь</Link>, чтобы оставить комментарий
            </div>
          )}

          <div className="comments-list">
            {commentList.length === 0 ? (
              <p style={{ color: '#8b949e' }}>Пока нет комментариев. Будьте первым!</p>
            ) : (
              commentList.map((comment) => (
                <div key={comment.id} className="card mb-2" style={{ background: '#1c1c1e', border: '1px solid #3a3a3c' }}>
                  <div className="card-body">
                    <strong style={{ color: '#ff3b30' }}>{comment.author_name}</strong>
                    <small style={{ color: '#8b949e', marginLeft: '0.5rem' }}>{comment.created_at}</small>
                    <p style={{ color: '#e1e1e6', marginTop: '0.5rem', marginBottom: 0 }}>{comment.text}</p>
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