<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class CrawlerService
{
    public function __construct(
        protected string $host,
        protected int $port,
        protected string $secret
    ) {}

    public function crawl(string $url)
    {
        $response = Http::withToken($this->secret)
            ->post("http://{$this->host}:{$this->port}/crawler?callback=http://web/api/crawler/callback", ['url' => $url]);

        dd($response->json());
    }
}
