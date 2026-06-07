<?php

namespace App\Providers;

use App\Support\SpiderClient;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\ServiceProvider;

class SpiderServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $config = $this->app->make('config');

        Http::macro('spider', function () use ($config) {
            $crawler = $config->get('services.crawler');
            $hostname = $crawler['host'] . ':' . $crawler['port'];
            return Http::withToken($crawler['secret'])
                ->baseUrl("http://{$hostname}/api/v1")
                ->asJson();
        });

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
