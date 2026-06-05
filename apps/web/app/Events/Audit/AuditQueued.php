<?php

namespace App\Events\Audit;

use App\Value\RedisStreamData;

/** @see { QueuedPayload } from '@equalsite/types' */
class AuditQueued extends BaseEvent
{
    public function broadcastData(RedisStreamData $stream): array
    {
        // position: number;
        // ahead: number;
        // waiting: number;
        return $stream->payload;
    }
}
