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
