# Stage 1: build frontend
FROM node:20-alpine AS frontend
WORKDIR /app
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install
COPY frontend ./frontend
RUN cd frontend && npm run build

# Stage 2: PHP + Laravel
FROM php:8.2-cli-alpine
RUN apk add --no-cache libpq-dev oniguruma-dev icu-dev libxml2-dev zip unzip \
  && docker-php-ext-install pdo pdo_pgsql mbstring intl xml

# Composer
COPY --from=composer:2.7 /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Backend deps
COPY backend/composer*.json ./
RUN composer install --no-dev --optimize-autoloader

# Backend source
COPY backend ./

# Frontend dist -> public
COPY --from=frontend /app/frontend/dist/ ./public/

# Ensure required dirs exist
RUN mkdir -p storage/framework/{cache,sessions,views} storage/logs bootstrap/cache

ENV APP_ENV=production
ENV APP_DEBUG=false
ENV PORT=8080

EXPOSE 8080

# Serve Laravel with built-in server
CMD ["sh", "-c", "php -S 0.0.0.0:${PORT} -t public public/index.php"]
