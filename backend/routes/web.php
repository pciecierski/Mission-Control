<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\File;

Route::get('/{any?}', function () {
    $index = public_path('index.html');
    abort_unless(File::exists($index), 404);
    return response(File::get($index), 200)->header('Content-Type', 'text/html');
})->where('any', '.*');
