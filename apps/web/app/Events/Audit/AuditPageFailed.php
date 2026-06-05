<?php

namespace App\Events\Audit;

use App\Value\RedisStreamData;

/** @see { PageFailedPayload } from '@equalsite/types' */
class AuditPageFailed extends BaseEvent
{
    public function broadcastData(RedisStreamData $stream): array
    {
        return $stream->payload;
    }
}
