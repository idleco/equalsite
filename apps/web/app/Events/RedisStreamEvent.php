<?php

namespace App\Events;

use App\Value\RedisStreamData;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class RedisStreamEvent
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public readonly RedisStreamData $data
    ) {}

    public function __get(string $property)
    {
        return $this->data->{$property};
    }
}
