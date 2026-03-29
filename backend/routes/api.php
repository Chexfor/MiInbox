<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes v1
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {

    // Auth – Public routes
    Route::prefix('auth')->group(function () {
        Route::post('login', [AuthController::class, 'login']);
    });

    // Auth – Protected routes (require valid JWT)
    Route::middleware('auth:api')->group(function () {
        Route::prefix('auth')->group(function () {
            Route::get('me', [AuthController::class, 'me']);
            Route::post('logout', [AuthController::class, 'logout']);
        });

        // Users
        Route::get('users', [\App\Http\Controllers\Api\UserController::class, 'index']);

        // Messaging
        Route::prefix('messaging')->group(function () {
            Route::get('threads', [\App\Http\Controllers\Api\ThreadController::class, 'index']);
            Route::post('threads', [\App\Http\Controllers\Api\ThreadController::class, 'store']);
            
            Route::prefix('threads/{threadId}')->group(function () {
                Route::get('messages', [\App\Http\Controllers\Api\MessageController::class, 'index']);
                Route::post('messages', [\App\Http\Controllers\Api\MessageController::class, 'store']);
            });
        });
    });
});
