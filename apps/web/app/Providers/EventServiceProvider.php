<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        \App\Events\Audit\AuditQueued::class => [
            \App\Listeners\AuditQueueStateListener::class
        ],

        \App\Events\Audit\AuditProgress::class => [
            \App\Listeners\AuditProgressListener::class
        ],
    ];

    protected $subscribe = [
        \App\Listeners\AuditPageSubscriber::class,
        \App\Listeners\AuditStatusSubscriber::class
    ];

    public function boot(): void
    {
        static::disableEventDiscovery();
    }
}
