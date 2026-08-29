<?php

namespace App\Providers;

use App\Services\CategoryService;
use App\Services\EventYearService;
use App\Services\FileUploadService;
use App\Services\FilmService;
use App\Services\RegistrationService;
use App\Services\StatisticsService;
use App\Services\SubmissionService;
use App\Services\TelegramService;
use App\Services\UserService;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Register services
        $this->app->singleton(FileUploadService::class);
        $this->app->singleton(EventYearService::class);
        $this->app->singleton(StatisticsService::class);
        $this->app->singleton(FilmService::class);
        $this->app->singleton(CategoryService::class);
        $this->app->singleton(UserService::class);
        $this->app->singleton(RegistrationService::class);
        $this->app->singleton(SubmissionService::class);
        $this->app->singleton(TelegramService::class, function ($app) {
            return new TelegramService;
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
