<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Existing route
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
