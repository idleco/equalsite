<?php

namespace App\Http\Controllers\Audit;

use Inertia\Inertia;
use App\Models\Audit;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Value\{ScanInfo, ScannedUrl, ScanProgress, ScanQueue};

class ProgressController extends Controller
{
    public function __invoke(Request $request)
    {
        $audit = Audit::where('crawler_id', $request->route('id'))->firstOrFail();

        return Inertia::render('audit/progress', [
            'scanInfo' => ScanInfo::fromAudit($audit),
            'scanQueue' => ScanQueue::fromAudit($audit),
            'scanUrls' => ScannedUrl::mapFromAudit($audit),
            'scanProgress' => ScanProgress::fromAudit($audit),
        ]);
    }
}
