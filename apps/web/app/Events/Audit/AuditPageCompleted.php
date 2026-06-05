<?php

namespace App\Events\Audit;

use App\Value\RedisStreamData;

/** @see { PageCompletedPayload } from '@equalsite/types' */
class AuditPageCompleted extends BaseEvent
{
    public function broadcastData(RedisStreamData $stream): array
    {
        return $stream->payload;
    }
}
