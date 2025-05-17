<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log; // Import the Log facade


class TestController extends Controller
{
    public function generateError()
    {
        // Intentionally trigger an error
        Log::error('This is a test error for logging purposes.');
        abort(500, 'This is a test error.');
    }
}
