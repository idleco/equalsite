<?php

namespace App\Listeners;

use App\Events\StatusChangeEvent;
use App\Events\StatusUpdated;
use App\Models\Audit;

class BroadcastAuditStatusUpdate
{
    public function __invoke(StatusChangeEvent $event): void
    {
        $audit = Audit::query()
            ->where('crawler_id', $event->crawlerId())
            ->first();

        if ($audit === null) {
            return;
        }

        broadcast(new StatusUpdated($audit));
    }
}
