<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Inertia\Inertia;
use Throwable;

class Handler extends ExceptionHandler
{
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });
    }
    public function render($request, Throwable $e)
    {
        $response = parent::render($request, $e);
        $status = $response->getStatusCode();

        // Handle JSON request (e.g. from API)
        if ($request->expectsJson()) {
            return response()->json([
                'message' => $e->getMessage(),
                'trace' => config('app.debug') ? $e->getTrace() : [],
            ], $status);
        }

        // Show custom Inertia error page (only in production or staging)
        if (! app()->environment(['local', 'testing']) && in_array($status, [500, 503, 404])) {
            return Inertia::render('Error', ['status' => $status])
                ->toResponse($request)
                ->setStatusCode($status);
        }

        // CSRF token mismatch or page expired
        if ($status === 419) {
            return redirect()->back()->with([
                'error' => 'The page has expired. Please refresh your page and try again.',
            ]);
        }

        // Forbidden / no permission
        if ($status === 403) {
            return redirect()->back()->with([
                'error' => 'Unauthorized. You do not have permission to access this resource.',
            ]);
        }

        return $response;
    }
}
