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
        $id = $request->route('id');

        $audit = Audit::query()
            ->where('crawler_id', $id)
            ->firstOrFail();

        $stats = $this->client->stats($id);

        return Inertia::render('audit/scanning', [
            'stats' => $stats,
            'audit' => [
                'id' => $audit->crawler_id,
                'url' => $audit->url,
                'urls' => $audit->getCustomData('urls', []),
                'stats' => $audit->getCustomData('stats', CrawlerStats::default()),
                'failureReason' => $audit->failure_reason,
                'startedAt' => $audit->started_at?->toDateTimeString(),
                'completedAt' => $audit->completed_at?->toDateTimeString(),
                'cancelledAt' => $audit->cancelled_at?->toDateTimeString(),
                'createdAt' => $audit->created_at->toDateTimeString(),
                'status' => [
                    'value' => $audit->status->value,
                ],
            ]
        ]);
    }
}
