<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\QueueItemController;
use App\Http\Controllers\QrLinkController;

Route::get('/queue', [QueueItemController::class, 'index']);
Route::post('/queue', [QueueItemController::class, 'store']);
Route::patch('/queue/{queueItem}', [QueueItemController::class, 'update']);
Route::delete('/queue/{queueItem}', [QueueItemController::class, 'destroy']);
Route::post('/queue/reorder', [QueueItemController::class, 'reorder']);

// Proxy to external QR upload service to avoid CORS from frontend
Route::post('/links/proxy', [QrLinkController::class, 'store']);

