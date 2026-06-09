import React from 'react';
import { Link } from 'react-router-dom';
import { useFavorites } from '../hooks/useWorkouts';

function FavoritesPage() {
  const { data: favorites, isLoading } = useFavorites();

  if (isLoading) return <div className="container mt-4">Загрузка...</div>;

  return (
    <div className="container mt-4">
      <h1>Избранные тренировки</h1>
      {favorites?.length === 0 ? (
        <p>У вас пока нет избранных тренировок</p>
      ) : (
        <div className="row">
          {favorites?.map((fav) => (
            <div className="col-md-4 mb-3" key={fav.id}>
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">{fav.workout_title}</h5>
                  <Link to={`/workout/${fav.workout_id}`} className="btn btn-primary">
                    Открыть
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FavoritesPage;