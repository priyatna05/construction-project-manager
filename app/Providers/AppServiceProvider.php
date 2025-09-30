<?php

namespace App\Providers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Faker\Factory as FakerFactory;
use Illuminate\Database\Eloquent\Factories\Factory;  //if production need adjust data real

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
                    /** @var \Illuminate\Http\RedirectResponse $this */
                    return $this->with('flash', ['type' => $type, 'title' => $title, 'message' => $message]);
                }
            );
        }

        Blueprint::macro('archivedAt', function () {
        /** @var \Illuminate\Database\Schema\Blueprint $this */
        return $this->timestamp('archived_at')->nullable();
        });

        Factory::guessFactoryNamesUsing(function (string $modelName) {
        return 'Database\\Factories\\'.class_basename($modelName).'Factory';
        });

        // Override global locale faker (penting!)
        $this->app->singleton(\Faker\Generator::class, function () {
            return FakerFactory::create('id_ID');
        });
    }
}
