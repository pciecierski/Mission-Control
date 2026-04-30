# Mission Control

Mission scheduling app with:
- **Backend**: Laravel API (`backend/`)
- **Frontend**: React + Vite (`frontend/`)

## Local Setup

### 1) Backend
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve --host=127.0.0.1 --port=8001
```

### 2) Frontend
```bash
cd frontend
npm ci
npm run dev
```

By default local frontend should use `http://127.0.0.1:8001` as API base.

## Quality Checks

### Backend tests
```bash
cd backend
php artisan test
```

### Frontend lint + build
```bash
cd frontend
npm run lint
npm run build
```

## Railway
- Container startup is handled by `backend/start.sh`.
- On startup app runs migrations automatically (`php artisan migrate --force`) before starting PHP server.

## Key API Endpoints
- `GET /api/queue`
- `PATCH /api/queue/{queueItem}`
- `GET /api/employees`
- `POST /api/employees`
- `PATCH /api/employees/{employee}`
- `DELETE /api/employees/{employee}`
