<?php

namespace App\Support;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;

class CrawlerHttpClient
{
    protected PendingRequest $client;

    public function __construct(
        protected string $host,
        protected int $port,
        string $secret
    ) {
        $this->client = Http::withToken($secret);
    }

    protected function endpoint(?string $path = ''): string
    {
        return "http://$this->host:$this->port/{$path}";
    }

    public function stats(string $id)
    {
        $response = $this->client->get(
            $this->endpoint("crawler/{$id}")
        )->throw();

        return $response->json();
    }

    public function health()
    {
        $response = $this->client->get(
            $this->endpoint("health")
        )->throw();

        return $response->json();
    }

    public function cancel(string $id)
    {
        $response = $this->client->delete(
            $this->endpoint("crawler/{$id}/cancel")
        )->throw();

        return $response->json();
    }

    public function queue(string $url, string $callback)
    {
        $response = $this->client->post(
            $this->endpoint("crawler?callback={$callback}"),
            ['url' => $url]
        )->throw();

        return $response->json();
    }
}
