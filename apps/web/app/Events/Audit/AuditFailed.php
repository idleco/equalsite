<?php

namespace App\Events\Audit;

use App\Value\RedisStreamData;

/** @see { FailedPayload } from '@equalsite/types' */
class AuditFailed extends BaseEvent
{
    public function broadcastData(RedisStreamData $stream): array
    {
        return $stream->payload;
    }
}
