<?php

namespace App\Events\Audit;

use App\Value\RedisStreamData;

/** @see { PageSkippedPayload } from '@equalsite/types' */
class AuditPageSkipped extends BaseEvent
{
    public function broadcastData(RedisStreamData $stream): array
    {
        return $stream->payload;
    }
}
