<?php

namespace App\Events;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CrawlerStreamEvent
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public string $id,
        public string $streamName,
        public string $type,
        public array $payload,
        public string $timestamp,
        public string $version,
    ) {}
}
