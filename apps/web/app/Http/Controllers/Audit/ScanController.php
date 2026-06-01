<?php

namespace App\Http\Controllers\Audit;

use App\Contracts\CacheProgressRepository;
use App\Http\Controllers\Controller;
use App\Models\Audit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class ScanController extends Controller
{
    public function __construct(
        protected CacheProgressRepository $cacher,
    ) {}

    public function __invoke(Request $request)
    {
        $crawlId = $request->route('id');

        $audit = Audit::query()
            ->where('crawler_id', $crawlId)
            ->firstOrFail();

        return Inertia::render('audit/scanning', [
            'queueStatus' => $this->getQueueStatus($audit),
            'progress' => $this->getProgress($audit),
            'processedUrls' => $audit->getCustomData('scanned_urls', []),
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

    protected function getProgress(Audit $audit)
    {
        return Cache::get(
            "audit-{$audit->crawl_id}:progress",
            [
                'totalRequests' => 0,
                'pendingRequests' => 0,
                'completedRequests' => 0,
                'progressPercentage' => 0,
            ]
        );
    }

    protected function getQueueStatus(Audit $audit)
    {
        return Cache::get(
            "audit-{$audit->crawler_id}:queue-status",
            [
                'position' => -1,
                'ahead' => 0,
                'waiting' => 0
            ]
        );
    }
}
