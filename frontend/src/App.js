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
        <Link className="navbar-brand" to="/">FITNESS APP</Link>
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
  const [totalWorkouts, setTotalWorkouts] = useState(0);
  const [totalCategories, setTotalCategories] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [workoutsRes, categoriesRes] = await Promise.all([
        workouts.getAll(),
        categories.getAll(),
      ]);

      const workoutsData = workoutsRes.data.results || workoutsRes.data;
      setTotalWorkouts(workoutsData.length);
      setPopularWorkouts(workoutsData.slice(0, 4));

      const categoriesData = categoriesRes.data.results || categoriesRes.data;
      setTotalCategories(categoriesData.length);

      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const usersRes = await fetch('http://127.0.0.1:8000/api/auth/register/');
          const usersData = await usersRes.json();
          setTotalUsers(usersData.length || 1);
        } catch (e) {
          setTotalUsers(1);
        }
      } else {
        setTotalUsers(1);
      }
    } catch (error) {
      console.error('Ошибка загрузки:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="hero">
        <h1>FITNESS TRAINING</h1>
        <p>Достигайте своих целей с лучшими тренировками</p>
        <Link to="/workouts" className="btn btn-primary btn-lg">Начать тренировки</Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{totalWorkouts}</div>
          <div className="stat-label">Тренировок</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{totalCategories}</div>
          <div className="stat-label">Категорий</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{totalUsers}+</div>
          <div className="stat-label">Пользователей</div>
        </div>
      </div>

      {popularWorkouts.length > 0 && (
        <div className="mt-5">
          <h2 className="text-center mb-4">Популярные тренировки</h2>
          <div className="row">
            {popularWorkouts.map((workout, index) => (
              <div className="col-md-3 mb-3" key={workout.id} style={{ '--i': index }}>
                <div className="card h-100">
                  {workout.image && <img src={workout.image} className="card-img-top" alt={workout.title} />}
                  <div className="card-body">
                    <h5 className="card-title">{workout.title}</h5>
                    <p className="card-text text-muted">{workout.category_name} | {workout.views} просмотров</p>
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
      <div className="row mt-4">
        <div className="col-md-3">
          <div className="filter-card">
            <h5 className="filter-title">Фильтр</h5>
            <div className="category-list">
              <div
                className={`category-item ${selectedCategory === '' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('')}
              >
                Все категории
              </div>
              {categoriesList.map((cat) => (
                <div
                  key={cat.id}
                  className={`category-item ${selectedCategory == cat.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {cat.name}
                </div>
              ))}
            </div>
          </div>

          {selectedCategoryData && selectedCategoryData.description && (
            <div className="category-info-card">
              <h6>О категории</h6>
              <p>{selectedCategoryData.description}</p>
            </div>
          )}
        </div>

        <div className="col-md-9">
          <h1>Все тренировки</h1>
          <p className="lead">Выберите программу, которая подходит именно вам</p>

          {selectedCategoryData && (
            <div className="category-alert">
              <span className="category-alert-title">{selectedCategoryData.name}</span>
              <span className="category-alert-desc">{selectedCategoryData.description || 'Тренировки этой категории помогут вам достичь целей'}</span>
            </div>
          )}

          {loading ? (<div className="text-center">Загрузка...</div>
          ) : workoutList.length === 0 ? (<div className="empty-state">Нет тренировок в этой категории</div>
          ) : (
            <div className="row">
              {workoutList.map((workout, index) => (
                <div className="col-md-6 mb-3" key={workout.id} style={{ '--i': index }}>
                  <div className="card h-100">
                    {workout.image && <img src={workout.image} className="card-img-top" alt={workout.title} />}
                    <div className="card-body">
                      <h5 className="card-title">{workout.title}</h5>
                      <div className="workout-meta">
                        <span className="meta-badge">{workout.category_name}</span>
                        <span className="meta-text">{workout.duration_minutes} мин</span>
                        <span className="meta-text">{workout.calories_burn} кал</span>
                      </div>
                      <p className="card-text">{workout.description?.substring(0, 100)}...</p>
                      {workout.video_url && (
                        <a href={workout.video_url} className="video-link" target="_blank" rel="noopener noreferrer">
                          Смотреть видео
                        </a>
                      )}
                      <div className="mt-2">
                        <Link to={`/workout/${workout.id}`} className="btn btn-primary btn-sm">Подробнее</Link>
                      </div>
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
        <div className="empty-state">
          <p>Авторизуйтесь, чтобы просматривать свои тренировки</p>
          <Link to="/login" className="btn btn-primary">Войти</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="page-header">
        <h1>Мои тренировки</h1>
        <Link to="/create" className="btn btn-primary">Создать тренировку</Link>
      </div>

      {loading ? (
        <div className="text-center">Загрузка...</div>
      ) : error ? (
        <div className="empty-state">{error}</div>
      ) : workoutList.length === 0 ? (
        <div className="empty-state">
          <p>У вас пока нет созданных тренировок</p>
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
                  <div className="workout-meta">
                    <span className="meta-badge">{workout.category_name}</span>
                    <span className="meta-text">{workout.duration_minutes} мин</span>
                    <span className="meta-text">{workout.calories_burn} кал</span>
                  </div>
                  <p className="card-text">{workout.description?.substring(0, 100)}...</p>
                  <div className="card-actions">
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
        setSuccess('Тренировка успешно создана');
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
        <div className="empty-state">
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
          <h1>Создать тренировку</h1>
          <p className="lead">Поделитесь своей программой с сообществом</p>

          {success && <div className="success-message">{success}</div>}
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="create-form">
            <div className="form-group">
              <label className="form-label">Название тренировки</label>
              <input type="text" name="title" className="form-control" value={formData.title} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="form-label">Описание</label>
              <textarea name="description" className="form-control" rows="5" value={formData.description} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="form-label">Категория</label>
              <select name="category" className="form-control" value={formData.category} onChange={handleChange} required>
                <option value="">Выберите категорию</option>
                {categoriesList.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group half">
                <label className="form-label">Длительность (минуты)</label>
                <input type="number" name="duration_minutes" className="form-control" value={formData.duration_minutes} onChange={handleChange} />
              </div>
              <div className="form-group half">
                <label className="form-label">Сжигаемые калории</label>
                <input type="number" name="calories_burn" className="form-control" value={formData.calories_burn} onChange={handleChange} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Ссылка на видео</label>
              <input type="url" name="video_url" className="form-control" value={formData.video_url} onChange={handleChange} placeholder="https://youtube.com/..." />
            </div>

            <div className="form-group">
              <label className="form-label">Изображение</label>
              <input type="file" className="form-control" accept="image/*" onChange={handleImageChange} />
              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" />
                </div>
              )}
            </div>

            <div className="form-group checkbox">
              <input type="checkbox" name="is_published" className="checkbox-input" checked={formData.is_published} onChange={handleChange} />
              <label className="checkbox-label">Опубликовать сразу</label>
            </div>

            <button type="submit" className="btn btn-primary submit-btn" disabled={loading}>
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