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
        $this->client = Http::withToken($secret);
    }

    public function cancel(string $id)
    {
        return $this->client
            ->delete($this->url("audit/{$id}"))
            ->throw()
            ->json();
    }

    public function create(SpiderRequestBody $request)
    {
        $urlCallback = 'http://web' . route('api.crawler.callback', absolute: false);

        return $this->client
            ->asJson()
            ->post($this->url('audit?' . http_build_query(['callback' => $urlCallback])), $request->toArray())
            ->throw()
            ->json();
    }

    protected function url(?string $path = ''): string
    {
        return "http://{$this->host}:{$this->port}/api/v1/{$path}";
    }
}
