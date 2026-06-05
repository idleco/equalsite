<?php

namespace App\Events;

use App\Value\RedisStreamData;

class RedisStreamEvent
{
    public function __construct(
        public readonly RedisStreamData $data
    ) {}
}
