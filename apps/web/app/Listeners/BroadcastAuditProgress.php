<?php

namespace App\Listeners;

use App\Events\CrawlerProgress;
use App\Events\ProgressEvent;
use App\Models\Audit;

class BroadcastAuditProgress
{
    public function __invoke(CrawlerProgress $event): void
    {
        $audit = Audit::query()
            ->where('crawler_id', $event->crawlId)
            ->first();

        if ($audit === null) {
            return;
        }

        broadcast(new ProgressEvent(
            audit: $audit,
            url: $event->url,
            violations: $event->violations,
            stats: $event->stats
        ));
    }
}
