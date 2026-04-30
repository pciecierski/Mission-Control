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

### System dependencies
PHP 8.2, Composer 2.x, and Node.js 20 (via nvm) are installed in the VM snapshot. The ondrej/php PPA is the PHP source.

### Backend setup
- No `.env.example` exists in the repo. Create `backend/.env` manually with at minimum: `APP_ENV=local`, `APP_DEBUG=true`, `DB_CONNECTION=sqlite`, and a generated `APP_KEY`.
- SQLite database file must be created: `touch backend/database/database.sqlite`.
- Laravel storage directories must exist before running tests or serving: `mkdir -p backend/storage/framework/{cache,sessions,views} backend/storage/logs backend/bootstrap/cache`.
- Run `php artisan key:generate` and `php artisan migrate --force` after creating `.env`.
- Start backend dev server: `cd backend && php artisan serve --host=127.0.0.1 --port=8001`.

### Frontend setup
- Use `npm install --legacy-peer-deps` (not `npm ci`) because `@hello-pangea/dnd` has a React 18 peer-dep conflict with the project's React 19. The production `Dockerfile` also uses `--legacy-peer-deps`.
- Frontend `.env.development` already points `VITE_API_BASE` at `http://127.0.0.1:8001`.
- Start frontend dev server: `cd frontend && npm run dev` (Vite on port 5173).

### Known test issues
- `Tests\Feature\ExampleTest::test_the_application_returns_a_successful_response` fails because the backend has no `GET /` route (API-only). This is a pre-existing issue, not a regression.

### Running quality checks
- Backend tests: `cd backend && php artisan test`
- Frontend lint: `cd frontend && npm run lint`
- Frontend build: `cd frontend && npm run build`
