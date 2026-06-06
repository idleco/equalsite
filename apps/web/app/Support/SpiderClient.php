<?php

namespace App\Support;

use App\Value\SpiderRequestBody;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class SpiderClient
{
    protected PendingRequest $client;

    public function __construct(
        protected string $host,
        protected int $port,
        string $secret
    ) {
        $this->client = Http::withToken($secret)->asJson();
    }

    public function cancel(string $id)
    {
        return $this->client
            ->delete($this->url("audit/{$id}"))
            ->throw()
            ->json();
    }

    public function ping()
    {
        return $this->client
            ->get($this->url('ping'))
            ->throw()
            ->json();
    }

    public function create(string $url, string $callback, array $options = [])
    {
        $queryString = http_build_query(['callback' => $callback]);

        return $this->client
            ->post($this->url('audit?' . $queryString), [
                'url' => $url,
                'options' => $options
            ])
            ->throw()
            ->json();
    }

    protected function url(?string $path = ''): string
    {
        return "http://{$this->host}:{$this->port}/api/v1/{$path}";
    }
}
