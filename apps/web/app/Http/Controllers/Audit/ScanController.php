<?php

namespace App\Http\Controllers\Audit;

use App\Http\Controllers\Controller;
use App\Models\Audit;
use App\Support\CrawlerHttpClient;
use App\Value\CrawlerStats;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
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

        $logs = collect($audit->getCustomData('progress'));

        $recentLogs = $logs->sortByDesc('receivedAt')->first();
        $totalPages = $recentLogs['pagesTotal'] ?? 0;
        $pagesCompleted = $recentLogs['pagesCompleted'] ?? 0;
        $stats = new CrawlerStats(
            totalRequests: $totalPages,
            pendingRequests: $totalPages - $pagesCompleted,
            processedRequests: $pagesCompleted,
            failedRequests: 0,
            concurrency: 0
        );

        return Inertia::render('audit/scanning', [
            'queueStatus' => fn() => $this->client->stats($crawlId),
            'stats' => $stats->toArray(),
            'processedUrls' => $logs->map(fn($i) => Arr::only($i, ['currentUrl', 'violations', 'receivedAt']))
                ->sortBy('receivedAt')
                ->all(),
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
