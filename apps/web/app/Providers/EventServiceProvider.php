<?php

namespace App\Providers;

use App\Events\CrawlerProgress;
use App\Events\StatusChangeEvent;
use App\Listeners\BroadcastAuditProgress;
use App\Listeners\BroadcastAuditStatusUpdate;
use App\Listeners\SaveAuditStatusUpdate;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        Event::listen(CrawlerProgress::class, BroadcastAuditProgress::class);

        Event::listen(StatusChangeEvent::class, [
            SaveAuditStatusUpdate::class,
            BroadcastAuditStatusUpdate::class,
        ]);
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
