<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\QueueItemController;
use App\Http\Controllers\QrLinkController;
use App\Http\Controllers\EmployeeController;

Route::get('/queue', [QueueItemController::class, 'index']);
Route::post('/queue', [QueueItemController::class, 'store']);
Route::patch('/queue/{queueItem}', [QueueItemController::class, 'update']);
Route::delete('/queue/{queueItem}', [QueueItemController::class, 'destroy']);
Route::post('/queue/reorder', [QueueItemController::class, 'reorder']);
Route::post('/closed', [QueueItemController::class, 'close']);
Route::post('/debug/method', [QueueItemController::class, 'debugMethod']);
Route::get('/employees', [EmployeeController::class, 'index']);
Route::post('/employees', [EmployeeController::class, 'store']);
Route::patch('/employees/{employee}', [EmployeeController::class, 'update']);
Route::delete('/employees/{employee}', [EmployeeController::class, 'destroy']);

// Proxy to external QR upload service to avoid CORS from frontend
Route::post('/links/proxy', [QrLinkController::class, 'store']);

