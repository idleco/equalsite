<?php

namespace App\Events\Audit;

use App\Value\RedisStreamData;

/** @see { PageStartedPayload } from '@equalsite/types' */
class AuditPageStarted extends BaseEvent
{
    public function broadcastData(RedisStreamData $stream): array
    {
        return $stream->payload;
    }
}
