<?php

$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/');

// Normalize /OpenAPI → /OpenAPI/ so relative asset resolution stays under the docs dir
if ($uri === '/OpenAPI') {
    header('Location: /OpenAPI/', true, 301);
    exit;
}

$publicPath = __DIR__ . '/public' . $uri;

// Serve existing static files directly; for directories prefer index.html
if ($uri !== '/' && file_exists($publicPath)) {
    if (is_dir($publicPath)) {
        $index = rtrim($publicPath, '/') . '/index.html';
        if (is_file($index)) {
            header('Content-Type: text/html; charset=UTF-8');
            readfile($index);
            exit;
        }
    }

    return false;
}

// Fallback to Laravel front controller
require_once __DIR__ . '/public/index.php';
