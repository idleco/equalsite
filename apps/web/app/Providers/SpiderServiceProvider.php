<?php

namespace App\Providers;

use App\Support\SpiderClient;
use Illuminate\Support\ServiceProvider;

class SpiderServiceProvider extends ServiceProvider
{
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
