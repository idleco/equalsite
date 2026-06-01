<?php

namespace App\Listeners;

use App\Events\RedisStreamEvent;
use Illuminate\Support\Facades\Log;

class RedisStreamEventLogger
{
    public function __invoke(RedisStreamEvent $event): void
    {
        Log::channel('crawler')->debug('Redis Stream Event', $event->data->toArray());
    }
}
