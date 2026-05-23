<?php

namespace App\Listeners;

use App\Events\CrawlerProgress;
use App\Models\Audit;

class CacheProgressData
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
                    'violations' => $event->violations,
                    'severityBreakdown' => $event->severityBreakdown->toArray(),
                    'timestamp' => $event->timestamp
                ]);
                return $urls->unique('url')->values()->all();
            }
        );
    }
}
