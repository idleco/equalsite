<?php

namespace App\Providers;

use App\Events\CrawlerStreamEvent;
use App\Listeners\HandleAuditStreamEvents;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        Event::listen(CrawlerStreamEvent::class, HandleAuditStreamEvents::class);
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
