# Mission Control Agent Guide

## Project Structure
- `backend/` - Laravel 12 API.
- `frontend/` - React + Vite UI.

## Default Workflow
1. Read current state with `git status --short`.
2. For backend edits, run:
   - `composer install` (if needed)
   - `php artisan test`
3. For frontend edits, run:
   - `npm ci` (if needed)
   - `npm run lint`
   - `npm run build`
4. Keep API contracts backward compatible unless task explicitly asks for a breaking change.

## Backend Conventions
- Keep validation in controllers explicit and strict.
- Prefer API responses as JSON with proper HTTP status codes.
- For schema changes:
  - Add migration.
  - Update model `fillable`/casts as needed.
  - Add/adjust feature tests.

## Frontend Conventions
- Keep user-facing copy in Polish (matching current UI).
- Reuse existing API base handling in `frontend/src/App.jsx`.
- When adding async actions:
  - show clear error messages,
  - keep optimistic updates reversible on API failure.

## Deployment Notes
- Railway deploy uses `backend/start.sh`.
- Runtime migrations are expected via `php artisan migrate --force`.

## Cursor Cloud specific instructions

### Backend setup (one-time per environment)
The repo does not ship a `.env.example`; create `backend/.env` manually:
```
APP_NAME="Mission Control"
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://127.0.0.1:8001
DB_CONNECTION=sqlite
SESSION_DRIVER=array
CACHE_STORE=array
QUEUE_CONNECTION=sync
```
Then run:
```bash
cd backend
php artisan key:generate
mkdir -p storage/framework/{cache,sessions,views} storage/logs bootstrap/cache
chmod -R 775 storage bootstrap/cache
touch database/database.sqlite
php artisan migrate --force
```

### Frontend install note
`npm ci` fails due to `@hello-pangea/dnd@16` peer-dep conflict with React 19. Use `npm install --legacy-peer-deps` instead (matches the Dockerfile).

### Running services
- **Backend:** `cd backend && php artisan serve --host=127.0.0.1 --port=8001`
- **Frontend:** `cd frontend && npm run dev` (Vite on port 5173, proxies API to 8001 via `VITE_API_BASE`)

### Tests & quality
- `cd backend && php artisan test` — 4 feature tests pass; `ExampleTest` (GET `/`) is a known pre-existing failure (returns 404 because the app is API-only with a SPA catch-all).
- `cd frontend && npm run lint` — ESLint, clean.
- `cd frontend && npm run build` — Vite production build (chunk size warning is expected).

### Database
SQLite file at `backend/database/database.sqlite`. Tests use `:memory:` (see `phpunit.xml`).
