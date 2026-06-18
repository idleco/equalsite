<?php

namespace App\Http\Controllers\Audit;

use App\Http\Controllers\Controller;
use App\Models\Audit;
use App\Services\HealthScoreCalculator;
use App\Services\ReportPresenter;
use App\Value\ScannedUrl;
use App\Value\SeverityBreakdown;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function show(string $id)
    {
        $audit = Audit::where('crawler_id', $id)->firstOrFail();

        if (! $audit->status->completed()) {
            abort(404);
        }

        $audit->loadMissing(['violations']);

        $presenter = new ReportPresenter($audit);

        // $calculator = new HealthScoreCalculator;

        return Inertia::render('audit/teaser-report', [
            'report' => [
                'auditId' => $audit->crawler_id,
                'siteUrl' => $audit->url,
                'healthScore' => $presenter->healthScore(),
                // 'healthScore' => $calculator->calculateScore($audit),
                'severityBreakdown' => SeverityBreakdown::fromAudit($audit),
                'scannedUrls' => ScannedUrl::mapFromAudit($audit),
                'summary' => $presenter->summary($presenter->scannedUrls()),
                'highlights' => $presenter->highlights($presenter->scannedUrls()),
                'pages' => $presenter->pages($presenter->scannedUrls()),
                'remediation' => $presenter->remediation($presenter->scannedUrls()),
            ]
        ]);
    }
}
