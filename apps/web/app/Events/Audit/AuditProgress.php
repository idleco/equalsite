<?php

namespace App\Events\Audit;

use App\Value\RedisStreamData;

/** @see { ProgressPayload } from '@equalsite/types' */
class AuditProgress extends BaseEvent
{
    public function broadcastData(RedisStreamData $stream): array
    {
        // auditId: string;
        // completedRequests: number;
        // pendingRequests: number;
        // totalRequests: number;
        // progressPercentage: number
        return $stream->payload;
    }
}
