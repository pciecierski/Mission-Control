#!/bin/sh
set -e

# Resolve PORT with default
PORT_VALUE="${PORT:-8080}"

# Ensure required runtime dirs
mkdir -p bootstrap/cache \
  storage/framework/cache \
  storage/framework/sessions \
  storage/framework/views \
  storage/logs
chmod -R 775 bootstrap/cache storage

echo "Starting PHP server on 0.0.0.0:${PORT_VALUE}"
exec php -S 0.0.0.0:${PORT_VALUE} -t public server.php
