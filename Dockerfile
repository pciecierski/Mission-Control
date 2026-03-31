# Stage 1: build frontend
FROM node:20-alpine AS frontend
WORKDIR /app
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install --legacy-peer-deps
COPY frontend ./frontend
RUN cd frontend && npm run build

# Stage 2: PHP + Laravel
FROM php:8.2-cli-alpine
RUN apk add --no-cache libpq-dev oniguruma-dev icu-dev libxml2-dev zip unzip \
  && docker-php-ext-install pdo pdo_pgsql mbstring intl xml

# Composer
COPY --from=composer:2.7 /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Backend source (including artisan) then install deps
COPY backend ./
RUN mkdir -p bootstrap/cache storage/framework/{cache,sessions,views} storage/logs \
 && chmod -R 775 bootstrap/cache storage \
 && composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist --no-progress

# Frontend dist -> public
COPY --from=frontend /app/frontend/dist/ ./public/

ENV APP_ENV=production
ENV APP_DEBUG=false
ENV PORT=8080

EXPOSE 8080

# Runtime entrypoint to ensure cache/logs exist and start PHP server
COPY backend/start.sh /app/start.sh
RUN sed -i 's/\r$//' /app/start.sh && chmod +x /app/start.sh

# Force entrypoint so Railway/Nixpacks cannot override command with literal ${PORT}
ENTRYPOINT ["sh", "/app/start.sh"]
