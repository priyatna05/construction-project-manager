<?php

namespace App\Providers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Schema; // Required for Schema operations

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Configure default string length for MySQL to prevent key length errors
        Schema::defaultStringLength(125);

        JsonResource::withoutWrapping();

        foreach (['info', 'success', 'warning', 'error'] as $type) {
            RedirectResponse::macro(
                $type,
                function ($title, $message = null) use ($type) {
                    return $this->with('flash', ['type' => $type, 'title' => $title, 'message' => $message]);
                }
            );
        }
    }
}
