<?php

namespace App\Http\Controllers\Audit;

use App\Http\Controllers\Controller;
use App\Models\Audit;
use App\Support\CrawlerHttpClient;
use App\Value\CrawlerStats;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ScanController extends Controller
{
    public function __construct(
        protected CrawlerHttpClient $client
    ) {}

    public function __invoke(Request $request)
    {
        $crawlId = $request->route('id');

        $audit = Audit::query()
            ->where('crawler_id', $crawlId)
            ->firstOrFail();

        return Inertia::render('audit/scanning', [
            'queueStatus' => fn() => $this->client->stats($crawlId),
            'stats' => $audit->getCustomData('stats', CrawlerStats::default()),
            'processedUrls' => $audit->getCustomData('urls', []),
            'audit' => [
                'siteUrl' => $audit->url,
                'id' => $audit->id,
                'crawlId' => $crawlId,
                'isActive' => $audit->isActive(),
                'failureReason' => $audit->failure_reason,
                'status' => $audit->status->value,
                'startedAt' => $audit->started_at?->toDateTimeString(),
                'completedAt' => $audit->completed_at?->toDateTimeString(),
                'cancelledAt' => $audit->cancelled_at?->toDateTimeString(),
                'createdAt' => $audit->created_at->toDateTimeString(),
            ],
        ]);
    }
}
