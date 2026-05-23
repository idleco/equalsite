<?php

namespace App\Listeners;

use App\Events\StatusChangeEvent;
use App\Models\Audit;
use App\Value\CrawlerStats;

class CacheCrawlStats
{
    public function __invoke(StatusChangeEvent $event): void
    {
        $audit = Audit::query()
            ->where('crawler_id', $event->crawlId)
            ->first();

        if ($audit === null) {
            return;
        }

        $stats = $event->getStats();
        if ($stats) {
            $audit->patchCustomData('stats', fn() => $stats->toArray());
        }
    }
}
