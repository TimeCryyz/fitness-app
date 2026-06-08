import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { workouts, categories } from '../services/api';

function CreateWorkout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [categoriesList, setCategoriesList] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    duration_minutes: 30,
    calories_burn: 200,
    video_url: '',
    image: null,
    is_published: true
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await categories.getAll();
      setCategoriesList(response.data.results || response.data);
    } catch (error) {
      console.error('Ошибка загрузки категорий:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('duration_minutes', formData.duration_minutes);
      data.append('calories_burn', formData.calories_burn);
      data.append('video_url', formData.video_url);
      data.append('is_published', formData.is_published);
      if (formData.image) {
        data.append('image', formData.image);
      }

      const token = localStorage.getItem('access_token');
      const response = await fetch('http://127.0.0.1:8000/api/workouts/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: data
      });

      if (response.ok) {
        setSuccess('Тренировка успешно создана!');
        setTimeout(() => {
          navigate('/my-workouts');
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Ошибка при создании');
      }
    } catch (error) {
      console.error('Ошибка создания:', error);
      setError('Ошибка при создании тренировки');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning">
          <p>Авторизуйтесь, чтобы создавать тренировки</p>
          <Link to="/login" className="btn btn-primary">Войти</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <h1>➕ Создать тренировку</h1>
          <p className="lead">Поделитесь своей программой с сообществом</p>

          {success && <div className="alert alert-success">{success}</div>}
          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit} className="card p-4">
            <div className="mb-3">
              <label className="form-label">Название тренировки *</label>
              <input type="text" name="title" className="form-control" value={formData.title} onChange={handleChange} required />
            </div>

            <div className="mb-3">
              <label className="form-label">Описание *</label>
              <textarea name="description" className="form-control" rows="5" value={formData.description} onChange={handleChange} required />
            </div>

            <div className="mb-3">
              <label className="form-label">Категория *</label>
              <select name="category" className="form-select" value={formData.category} onChange={handleChange} required>
                <option value="">Выберите категорию</option>
                {categoriesList.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
              </select>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Длительность (минуты)</label>
                <input type="number" name="duration_minutes" className="form-control" value={formData.duration_minutes} onChange={handleChange} />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Сжигаемые калории</label>
                <input type="number" name="calories_burn" className="form-control" value={formData.calories_burn} onChange={handleChange} />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Ссылка на видео</label>
              <input type="url" name="video_url" className="form-control" value={formData.video_url} onChange={handleChange} placeholder="https://youtube.com/..." />
            </div>

            <div className="mb-3">
              <label className="form-label">Изображение</label>
              <input type="file" className="form-control" accept="image/*" onChange={handleImageChange} />
              {imagePreview && (
                <div className="mt-2">
                  <img src={imagePreview} alt="Preview" style={{ maxHeight: '150px', maxWidth: '100%' }} />
                </div>
              )}
            </div>

            <div className="mb-3 form-check">
              <input type="checkbox" name="is_published" className="form-check-input" checked={formData.is_published} onChange={handleChange} />
              <label className="form-check-label">Опубликовать сразу</label>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Создание...' : 'Создать тренировку'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateWorkout;