import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
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
            <li className="nav-item">
              <Link className="nav-link" to="/">Главная</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/workouts">Тренировки</Link>
            </li>
            {isAuthenticated ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/my-workouts">Мои тренировки</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/create">Создать</Link>
                </li>
                <li className="nav-item">
                  <button className="nav-link btn btn-link" onClick={logout}>Выйти ({user?.username})</button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">Вход</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">Регистрация</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

function Home() {
  const [workoutList, setWorkoutList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
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
    } catch (error) {
      console.error('Ошибка загрузки:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h1>🏋️ Фитнес и тренировки</h1>
      <p className="lead">Найдите лучшие тренировки для достижения ваших целей</p>

      <div className="row mt-4">
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Фильтр по категориям</h5>
              <select
                className="form-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">Все категории</option>
                {categoriesList.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="col-md-9">
          {loading ? (
            <div className="text-center">Загрузка...</div>
          ) : workoutList.length === 0 ? (
            <div className="alert alert-info">Нет тренировок</div>
          ) : (
            <div className="row">
              {workoutList.map((workout) => (
                <div className="col-md-6 mb-3" key={workout.id}>
                  <div className="card h-100">
                    {workout.image && (
                      <img src={workout.image} className="card-img-top" alt={workout.title} />
                    )}
                    <div className="card-body">
                      <h5 className="card-title">{workout.title}</h5>
                      <p className="card-text text-muted">
                        Категория: {workout.category_name} | {workout.duration_minutes} мин | {workout.calories_burn} кал
                      </p>
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

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/workouts" element={<Home />} />
          <Route path="/workout/:id" element={<div className="container mt-4"><h2>Детали тренировки</h2></div>} />
          <Route path="/login" element={<div className="container mt-4"><h2>Вход</h2></div>} />
          <Route path="/register" element={<div className="container mt-4"><h2>Регистрация</h2></div>} />
          <Route path="/my-workouts" element={<div className="container mt-4"><h2>Мои тренировки</h2></div>} />
          <Route path="/create" element={<div className="container mt-4"><h2>Создать тренировку</h2></div>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;