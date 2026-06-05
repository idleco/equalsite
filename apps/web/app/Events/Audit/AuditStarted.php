<?php

namespace App\Events\Audit;

use App\Value\RedisStreamData;

/** @see { StartedPayload } from '@equalsite/types' */
class AuditStarted extends BaseEvent
{
    public function broadcastData(RedisStreamData $stream): array
    {
        return $stream->payload;
    }
}
