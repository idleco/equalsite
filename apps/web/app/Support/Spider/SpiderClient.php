<?php

namespace App\Support\Spider;

use App\Contracts\Spider;
use Illuminate\Support\Facades\Http;

class SpiderClient implements Spider
{
    public function cancel(string $id)
    {
        return Http::spider()->delete("audit/{$id}")->json();
    }

    public function ping()
    {
        return Http::spider()->get('ping')->json();
    }

    public function create(SpiderOptions $options)
    {
        return Http::spider()->post('audit', $options->toArray())->json();
    }
}
