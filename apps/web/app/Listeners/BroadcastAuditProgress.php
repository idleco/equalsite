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

        $audit->patchCustomData(
            'urls',
            function ($urls) use ($event) {
                $urls = collect($urls ?? []);
                $urls->push([
                    'url' => $event->url,
                    'violations' => $event->violations
                ]);
                return $urls->unique('url')->values()->all();
            }
        );

        broadcast(new ProgressEvent(
            audit: $audit,
            url: $event->url,
            violations: $event->violations,
            stats: $event->stats
        ));
    }
}
