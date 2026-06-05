<?php

namespace App\Events\Audit;

use App\Value\RedisStreamData;

/** @see { CompletedPayload } from '@equalsite/types' */
class AuditCompleted extends BaseEvent
{
    public function broadcastData(RedisStreamData $stream): array
    {
        return $stream->payload;
    }
}
