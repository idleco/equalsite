<?php

namespace App\Providers;

use App\Events\CrawlerMessageReceived;
use App\Listeners\CrawlerStreamMessagesListener;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        Event::listen(CrawlerMessageReceived::class, CrawlerStreamMessagesListener::class);
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
