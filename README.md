# FitnessApp — Онлайн-фитнес-платформа с тренировками

Курсовой проект по дисциплине «Технология разработки программного обеспечения»  
Траектория В: Django REST + React SPA + AJAX + JWT + WebSocket

---

## Содержание

1. [О проекте](#1-о-проекте)
2. [Технологический стек](#2-технологический-стек)
3. [Структура репозитория](#3-структура-репозитория)
4. [Требования к окружению](#4-требования-к-окружению)
5. [Установка и настройка Backend](#5-установка-и-настройка-backend)
6. [Установка и настройка Frontend](#6-установка-и-настройка-frontend)
7. [Запуск приложения](#7-запуск-приложения)
8. [Переменные окружения](#8-переменные-окружения)
9. [API — эндпоинты](#9-api--эндпоинты)
10. [Функциональность](#10-функциональность)
11. [Механика тренировок](#11-механика-тренировок)
12. [Администрирование](#12-администрирование)
13. [Тестирование](#13-тестирование)

---

## 1. О проекте

**FitnessApp** — веб-приложение для поиска, создания и обсуждения фитнес-тренировок.  
Поддерживает два режима работы:

- **Каталог тренировок** — просмотр, фильтрация по категориям и поиск тренировок.
- **Мои тренировки** — создание, редактирование и удаление собственных тренировок.

Авторизованные пользователи получают доступ к личному кабинету.  
При добавлении нового комментария приложение мгновенно обновляет интерфейс через WebSocket.

---

## 2. Технологический стек

### Backend

| Компонент | Технология |
|-----------|------------|
| Язык | Python 3.13 |
| Фреймворк | Django 6.0 + Django REST Framework 3.17 |
| Аутентификация | JWT (djangorestframework-simplejwt) |
| WebSocket | Django Channels 4.3 + Daphne 4.3 |
| База данных | SQLite |
| CORS | django-cors-headers |
| Фильтрация | django-filter |
| Документация API | drf-yasg (Swagger) |

### Frontend

| Компонент | Технология |
|-----------|------------|
| Язык | JavaScript (ES2022) + JSX |
| Фреймворк | React 18 |
| Маршрутизация | React Router 6 |
| HTTP-клиент | Axios (с JWT-интерцепторами) |
| Кэширование | RTK Query |
| Сборщик | Create React App |
| Стили | Bootstrap 5 + CSS |

---

## 3. Структура репозитория


```
fitness-app/
├── backend/ # Django REST API + Channels
│ ├── config/
│ │ ├── init.py
│ │ ├── settings.py
│ │ ├── urls.py
│ │ ├── asgi.py # ASGI + WebSocket
│ │ └── wsgi.py
│ ├── workouts/ # Приложение тренировок
│ │ ├── models.py # ExerciseCategory, Workout, Comment
│ │ ├── serializers.py
│ │ ├── views.py
│ │ ├── urls.py
│ │ ├── admin.py
│ │ ├── permissions.py
│ │ ├── consumers.py # WebSocket consumer
│ │ └── tests.py
│ ├── users/ # Аутентификация и профиль
│ │ ├── models.py # Расширенная модель User
│ │ ├── serializers.py
│ │ ├── views.py
│ │ ├── urls.py
│ │ ├── admin.py
│ │ └── tests.py
│ ├── manage.py
│ ├── requirements.txt
│ └── .env.example
│
├── frontend/ # React SPA
│ ├── public/
│ │ └── index.html
│ ├── src/
│ │ ├── components/
│ │ ├── pages/
│ │ │ ├── Login.js
│ │ │ ├── Register.js
│ │ │ └── WorkoutDetail.js
│ │ ├── contexts/
│ │ │ └── AuthContext.jsx
│ │ ├── services/
│ │ │ └── api.js
│ │ ├── App.js
│ │ ├── App.css
│ │ └── index.js
│ ├── package.json
│ └── .env.example
│
└── README.md
```


---

## 4. Требования к окружению

| Инструмент | Версия |
|---|---|
| Python | ≥ 3.11 |
| Node.js | ≥ 18.0 |
| npm | ≥ 9.0 |
| Git | ≥ 2.40 |

---

## 5. Установка и настройка Backend

### 5.1. Клонирование репозитория

```bash
git clone https://github.com/TimeCryyz/fitness-app.git
cd fitness-app/backend
```

### 5.2. Виртуальное окружение

```bash
# Создание
python -m venv venv

# Активация (Windows)
venv\Scripts\activate

# Активация (Linux / macOS)
source venv/bin/activate
```

### 5.3. Установка зависимостей

```bash
pip install -r requirements.txt
```

**`requirements.txt`:**
```
django==6.0.5
djangorestframework==3.17.1
djangorestframework-simplejwt==5.5.1
django-cors-headers==4.9.0
channels==4.3.2
daphne==4.3.2
python-dotenv==1.2.2
Pillow==12.2.0
django-filter==25.1
drf-yasg==1.21.7
```

### 5.4. Переменные окружения

```bash
cp .env.example .env
# Отредактировать .env (см. раздел 8)
```

### 5.5. Миграции и начальные данные

```bash
python manage.py makemigrations users
python manage.py makemigrations workouts
python manage.py migrate

# Создание суперпользователя (администратора)
python manage.py createsuperuser


```

### 5.6. Запуск тестов

```bash
python manage.py test
```

---

## 6. Установка и настройка Frontend

### 6.1. Переход в директорию

```bash
cd fitness-app/frontend
```

### 6.2. Установка зависимостей

```bash
npm install
```

### 6.3. Переменные окружения

```bash
cp .env.example .env
# Отредактировать .env (см. раздел 8)
```

---

## 7. Запуск приложения

### Backend

WebSocket требует ASGI-сервера. Используйте **Daphne**:

```bash
cd fitness-app/backend

# Активировать venv, затем:
daphne -p 8000 config.asgi:application
```

> Альтернативно (только HTTP, без WebSocket):
> ```bash
> python manage.py runserver
> ```

### Frontend

```bash
cd fitness-app/frontend
npm start
```

Приложение откроется по адресу **http://localhost:3000**  
Backend доступен по адресу **http://localhost:8000**  
Django Admin — **http://localhost:8000/admin/**

---

## 8. Переменные окружения

### `backend/.env`

```env
SECRET_KEY=django-insecure-your-secret-key-here-change-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# JWT
JWT_ACCESS_TOKEN_LIFETIME=30       # минуты
JWT_REFRESH_TOKEN_LIFETIME=1440    # минуты (1 сутки)

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### `frontend/.env`

```env
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_WS_URL=ws://localhost:8000
```

---

## 9. API — эндпоинты
### Избранное (`/api/workouts/`)

| Метод | Эндпоинт | Доступ | Описание |
|-------|----------|--------|----------|
| POST | `/{id}/favorite/` | Авторизован | Добавить/удалить из избранного |
| GET | `/favorites/` | Авторизован | Список избранных тренировок |
| GET | `/{id}/is_favorited/` | Авторизован | Проверить в избранном |

### Аутентификация (`/api/auth/`)

| Метод | Эндпоинт | Доступ | Описание |
|---|---|---|---|
| POST | `/api/auth/register/` | Все | Регистрация |
| POST | `/api/auth/login/` | Все | Получение JWT access/refresh |
| POST | `/api/auth/token/refresh/` | Все | Обновление access-токена |
| GET | `/api/auth/profile/` | Авторизован | Профиль пользователя |
| PUT/PATCH | `/api/auth/profile/` | Авторизован | Обновление профиля |

### Тренировки (`/api/workouts/`)

| Метод | Эндпоинт | Доступ | Описание |
|---|---|---|---|
| GET | `/api/workouts/` | Все | Список тренировок |
| GET | `/api/workouts/?category=1` | Все | Фильтр по категории |
| GET | `/api/workouts/?search=текст` | Все | Поиск по названию/описанию |
| POST | `/api/workouts/` | Авторизован | Создать тренировку |
| GET | `/api/workouts/{id}/` | Все | Детали тренировки |
| PUT | `/api/workouts/{id}/` | Автор | Изменить тренировку |
| DELETE | `/api/workouts/{id}/` | Автор | Удалить тренировку |
| POST | `/api/workouts/{id}/increment_views/` | Все | Увеличить просмотры |
| GET | `/api/workouts/my_workouts/` | Авторизован | Мои тренировки |

### Категории (`/api/categories/`)

| Метод | Эндпоинт | Доступ | Описание |
|---|---|---|---|
| GET | `/api/categories/` | Все | Список категорий |

### Комментарии (`/api/comments/`)

| Метод | Эндпоинт | Доступ | Описание |
|---|---|---|---|
| GET | `/api/comments/?workout_id=1` | Все | Комментарии тренировки |
| POST | `/api/comments/` | Авторизован | Добавить комментарий |
| DELETE | `/api/comments/{id}/` | Автор | Удалить комментарий |

### WebSocket

| URL | Описание |
|---|---|
| `ws://localhost:8000/ws/workouts/{workout_id}/` | Real-time комментарии |

**Формат сообщения:**
```json
{
  "comment": {
    "id": 12,
    "text": "Отличная тренировка!",
    "author_name": "Анна",
    "created_at": "08.06.2026 15:30"
  }
}

```

---
## 10. Документация API

Swagger документация доступна по адресу:

- http://127.0.0.1:8000/swagger/

## 11. Функциональность

### Неавторизованный пользователь

- Просмотр списка тренировок с пагинацией
- Фильтрация по категориям
- Поиск по названию или описанию
- Детальный просмотр тренировки
- Просмотр комментариев

### Авторизованный пользователь

- Все возможности неавторизованного пользователя
- Создание тренировок (название, описание, категория, длительность, калории, видео, изображение)
- Редактирование и удаление своих тренировок
- Добавление комментариев (мгновенное отображение через WebSocket)
- Страница «Мои тренировки»
- Добавление тренировок в избранное
- Страница «Избранное»
- Real-time комментарии с оптимистичными обновлениями

### Администратор

- CRUD тренировок через Django Admin
- Управление категориями и пользователями


---

## 12. Механика тренировок

| Правило | Описание |
|---|---|
| Просмотры | Автоматически увеличиваются при открытии детальной страницы |
| Фильтрация | По категориям через параметр `category` |
| Поиск | По полям `title` и `description` |
| Пагинация | 10 тренировок на страницу |
| Изображения | Загружаются через FormData и сохраняются на сервере |
| Комментарии | Real-time через WebSocket + оптимистичные обновления |

---

## 13. Администрирование

Django Admin доступен по адресу `/admin/`.

### Модели в админке

| Модель | Поля | Особенности |
|---|---|---|
| **User** | username, email, bio, avatar, phone | Расширенная модель AbstractUser |
| **ExerciseCategory** | name, slug, description, image | Авто-генерация slug |
| **Workout** | title, category, author, duration, calories, video_url, image, is_published, views | Только чтение для views |
| **Comment** | workout, author, text, created_at | Сортировка по дате |

### Начальные данные

После миграций загружаются:
- Категории: Силовые тренировки, Кардио, Растяжка, Боевые искусства, Кроссфит
- Тренировки: 8+ готовых тренировок
- Пользователи: администратор и тестовые пользователи

---

## 14. Тестирование

```bash
# Backend — запуск всех тестов
cd backend
python manage.py test

# Тесты конкретного приложения
python manage.py test users
python manage.py test workouts
```

Тесты покрывают:
- Регистрацию и аутентификацию (JWT)
- CRUD операции с тренировками
- Права доступа (IsAuthorOrReadOnly)
- Создание и получение комментариев
- Фильтрацию и поиск

---

---
Проект выполнен в рамках дисциплины "Технология разработки программного обеспечения"
