<?php

namespace App\Providers;

use App\Events\RedisStreamEvent;
use App\Listeners\RedisStreamEventLogger;
use App\Support\SpiderClient;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;

class SpiderServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        Event::listen(RedisStreamEvent::class, [
            RedisStreamEventLogger::class
            // HandleAuditStreamEvents::class
        ]);
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        $this->app->singleton(SpiderClient::class, function ($app) {
            $config = $app->make('config')->get('services.crawler');
            return new SpiderClient(
                host: $config['host'],
                port: $config['port'],
                secret: $config['secret']
            );
        });
    }
}
