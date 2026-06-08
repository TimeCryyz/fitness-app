import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import WorkoutDetail from './pages/WorkoutDetail';
import { workouts, categories } from './services/api';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <nav className="navbar navbar-expand-lg">
      <div className="container">
        <Link className="navbar-brand" to="/">🏋️ FitnessApp</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item"><Link className="nav-link" to="/">Главная</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/workouts">Тренировки</Link></li>
            {isAuthenticated ? (
              <>
                <li className="nav-item"><Link className="nav-link" to="/my-workouts">Мои тренировки</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/create">Создать</Link></li>
                <li className="nav-item"><button className="nav-link btn btn-link" onClick={logout}>Выйти ({user?.username})</button></li>
              </>
            ) : (
              <>
                <li className="nav-item"><Link className="nav-link" to="/login">Вход</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/register">Регистрация</Link></li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

function Home() {
  const [popularWorkouts, setPopularWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPopularWorkouts();
  }, []);

  const loadPopularWorkouts = async () => {
    try {
      const response = await workouts.getAll({ ordering: '-views' });
      const data = response.data.results || response.data;
      setPopularWorkouts(data.slice(0, 4));
    } catch (error) {
      console.error('Ошибка загрузки:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="text-center mb-5">
        <h1>🏋️ Добро пожаловать в FitnessApp!</h1>
        <p className="lead">Ваш персональный гид в мире фитнеса и здорового образа жизни</p>
        <Link to="/workouts" className="btn btn-primary btn-lg mt-3">Начать тренировки →</Link>
      </div>

      <div className="row mt-5">
        <div className="col-md-4 mb-4">
          <div className="card h-100 text-center">
            <div className="card-body">
              <h2>💪</h2>
              <h5>Эффективные тренировки</h5>
              <p>Профессиональные программы для любого уровня подготовки</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-4">
          <div className="card h-100 text-center">
            <div className="card-body">
              <h2>🎯</h2>
              <h5>Отслеживайте прогресс</h5>
              <p>Следите за своими достижениями и улучшайте результаты</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-4">
          <div className="card h-100 text-center">
            <div className="card-body">
              <h2>👥</h2>
              <h5>Сообщество</h5>
              <p>Делитесь опытом и общайтесь с единомышленниками</p>
            </div>
          </div>
        </div>
      </div>

      {popularWorkouts.length > 0 && (
        <div className="mt-5">
          <h2 className="text-center mb-4">⭐ Популярные тренировки</h2>
          <div className="row">
            {popularWorkouts.map((workout) => (
              <div className="col-md-3 mb-3" key={workout.id}>
                <div className="card h-100">
                  <div className="card-body">
                    <h5 className="card-title">{workout.title}</h5>
                    <p className="card-text text-muted">{workout.category_name} | 👁️ {workout.views} просмотров</p>
                    <Link to={`/workout/${workout.id}`} className="btn btn-primary btn-sm">Подробнее</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function WorkoutsPage() {
  const [workoutList, setWorkoutList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCategoryData, setSelectedCategoryData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [selectedCategory]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = selectedCategory ? { category: selectedCategory } : {};
      const [workoutsRes, categoriesRes] = await Promise.all([
        workouts.getAll(params),
        categories.getAll(),
      ]);
      setWorkoutList(workoutsRes.data.results || workoutsRes.data);
      setCategoriesList(categoriesRes.data.results || categoriesRes.data);

      if (selectedCategory) {
        const found = (categoriesRes.data.results || categoriesRes.data).find(c => c.id === parseInt(selectedCategory));
        setSelectedCategoryData(found);
      } else {
        setSelectedCategoryData(null);
      }
    } catch (error) {
      console.error('Ошибка загрузки:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h1>📋 Все тренировки</h1>
      <p className="lead">Выберите программу, которая подходит именно вам</p>

      <div className="row mt-4">
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Фильтр по категориям</h5>
              <select className="form-select" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                <option value="">Все категории</option>
                {categoriesList.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
              </select>
            </div>
          </div>

          {selectedCategoryData && selectedCategoryData.description && (
            <div className="card mt-3">
              <div className="card-body">
                <h6 className="card-title">📖 О категории</h6>
                <p className="card-text small">{selectedCategoryData.description}</p>
              </div>
            </div>
          )}
        </div>

        <div className="col-md-9">
          {selectedCategoryData && (
            <div className="alert alert-info mb-3">
              <strong>{selectedCategoryData.name}</strong>: {selectedCategoryData.description || 'Тренировки этой категории помогут вам достичь целей'}
            </div>
          )}

          {loading ? (<div className="text-center">Загрузка...</div>
          ) : workoutList.length === 0 ? (<div className="alert alert-info">Нет тренировок в этой категории</div>
          ) : (
            <div className="row">
              {workoutList.map((workout) => (
                <div className="col-md-6 mb-3" key={workout.id}>
                  <div className="card h-100">
                    {workout.image && <img src={workout.image} className="card-img-top" alt={workout.title} />}
                    <div className="card-body">
                      <h5 className="card-title">{workout.title}</h5>
                      <p className="card-text text-muted">{workout.category_name} | {workout.duration_minutes} мин | {workout.calories_burn} кал</p>
                      <p className="card-text">{workout.description?.substring(0, 100)}...</p>
                      <Link to={`/workout/${workout.id}`} className="btn btn-primary">Подробнее</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MyWorkouts() {
  const { user, isAuthenticated } = useAuth();
  const [workoutList, setWorkoutList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      loadMyWorkouts();
    }
  }, [isAuthenticated]);

  const loadMyWorkouts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await workouts.getMyWorkouts();
      setWorkoutList(response.data);
    } catch (error) {
      console.error('Ошибка загрузки:', error);
      setError('Не удалось загрузить ваши тренировки');
      setWorkoutList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Удалить тренировку?')) {
      try {
        await workouts.delete(id);
        setWorkoutList(workoutList.filter(w => w.id !== id));
      } catch (error) {
        console.error('Ошибка удаления:', error);
        alert('Ошибка при удалении');
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning">
          <p>Авторизуйтесь, чтобы просматривать свои тренировки</p>
          <Link to="/login" className="btn btn-primary">Войти</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>📝 Мои тренировки</h1>
        <Link to="/create" className="btn btn-primary">+ Создать тренировку</Link>
      </div>

      {loading ? (
        <div className="text-center">Загрузка...</div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : workoutList.length === 0 ? (
        <div className="text-center py-5">
          <p className="lead">У вас пока нет созданных тренировок</p>
          <Link to="/create" className="btn btn-primary">Создать первую тренировку</Link>
        </div>
      ) : (
        <div className="row">
          {workoutList.map((workout) => (
            <div className="col-md-6 mb-3" key={workout.id}>
              <div className="card h-100">
                {workout.image && <img src={workout.image} className="card-img-top" alt={workout.title} />}
                <div className="card-body">
                  <h5 className="card-title">{workout.title}</h5>
                  <p className="card-text text-muted">
                    {workout.category_name} | {workout.duration_minutes} мин | {workout.calories_burn} кал
                  </p>
                  <p className="card-text">{workout.description?.substring(0, 100)}...</p>
                  <div className="d-flex gap-2">
                    <Link to={`/workout/${workout.id}`} className="btn btn-primary btn-sm">Просмотр</Link>
                    <button onClick={() => handleDelete(workout.id)} className="btn btn-danger btn-sm">Удалить</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

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

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/workouts" element={<WorkoutsPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/workout/:id" element={<WorkoutDetail />} />
          <Route path="/my-workouts" element={<MyWorkouts />} />
          <Route path="/create" element={<CreateWorkout />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;