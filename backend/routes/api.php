<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\QueueItemController;

Route::get('/queue', [QueueItemController::class, 'index']);
Route::post('/queue', [QueueItemController::class, 'store']);
Route::patch('/queue/{queueItem}', [QueueItemController::class, 'update']);
Route::delete('/queue/{queueItem}', [QueueItemController::class, 'destroy']);
Route::post('/queue/reorder', [QueueItemController::class, 'reorder']);

