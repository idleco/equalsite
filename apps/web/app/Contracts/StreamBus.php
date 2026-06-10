<?php

namespace App\Contracts;

interface StreamBus
{
    public function publish(
        string $stream,
        string $event,
        array $payload,
        int $maxLen = 10000
    );

    public function consume(
        string $stream,
        string $group,
        string $consumer,
        callable $handler,
        int $blockMs = 5000,
        int $count = 10
    );
}
