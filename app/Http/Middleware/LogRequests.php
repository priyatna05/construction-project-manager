<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class LogRequests
{
    public function handle(Request $request, Closure $next)
    {
        if ($request->is('*/tasks') || $request->is('*/tasks/*')) {
            // Log::info('🌐 [REQUEST] Incoming', [
            //     'method' => $request->method(),
            //     'url' => $request->fullUrl(),
            //     'route' => $request->route()?->getName(),
            //     'ip' => $request->ip(),
            //     'user_id' => auth()->id(),
            //     'has_files' => $request->hasFile('attachment_files'),
            // ]);
        }

        $response = $next($request);

        if ($request->is('*/tasks') || $request->is('*/tasks/*')) {
            // Log::info('📤 [RESPONSE]', [
            //     'status' => $response->status(),
            //     'route' => $request->route()?->getName(),
            // ]);
        }

        return $response;
    }
}
