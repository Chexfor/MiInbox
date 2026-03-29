<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(
            \App\Domain\Communication\Contracts\ThreadRepositoryInterface::class,
            \App\Infrastructure\Communication\Repositories\EloquentThreadRepository::class
        );

        $this->app->bind(
            \App\Domain\Communication\Contracts\MessageRepositoryInterface::class,
            \App\Infrastructure\Communication\Repositories\EloquentMessageRepository::class
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
