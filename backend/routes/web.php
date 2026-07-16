<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\File;

Route::get('/OpenAPI/{path?}', function (?string $path = '') {
    $base = public_path('OpenAPI');
    $realBase = realpath($base);
    abort_unless($realBase !== false && is_dir($realBase), 404);

    $relative = trim((string) $path, '/');
    $candidate = $relative === ''
        ? $realBase . DIRECTORY_SEPARATOR . 'index.html'
        : $realBase . DIRECTORY_SEPARATOR . str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $relative);

    if (is_dir($candidate)) {
        $candidate = rtrim($candidate, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . 'index.html';
    }

    $realFile = realpath($candidate);
    abort_unless(
        $realFile !== false
            && is_file($realFile)
            && str_starts_with($realFile, $realBase . DIRECTORY_SEPARATOR),
        404
    );

    $mime = match (strtolower(pathinfo($realFile, PATHINFO_EXTENSION))) {
        'html', 'htm' => 'text/html; charset=UTF-8',
        'yaml', 'yml' => 'application/yaml; charset=UTF-8',
        'json' => 'application/json; charset=UTF-8',
        'css' => 'text/css; charset=UTF-8',
        'js' => 'application/javascript; charset=UTF-8',
        'svg' => 'image/svg+xml',
        'png' => 'image/png',
        default => 'application/octet-stream',
    };

    return response(File::get($realFile), 200)
        ->header('Content-Type', $mime)
        ->header('Cache-Control', 'public, max-age=60');
})->where('path', '.*');

Route::get('/{any?}', function () {
    $index = public_path('index.html');
    abort_unless(File::exists($index), 404);
    return response(File::get($index), 200)->header('Content-Type', 'text/html');
})->where('any', '.*');
