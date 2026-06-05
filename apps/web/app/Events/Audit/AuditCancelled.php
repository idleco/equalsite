<?php

namespace App\Events\Audit;

use App\Value\RedisStreamData;

/** @see { CancelledPayload } from '@equalsite/types' */
class AuditCancelled extends BaseEvent
{
    public function broadcastData(RedisStreamData $stream): array
    {
        return $stream->payload;
    }
}
