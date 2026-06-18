<?php

namespace App\Http\Controllers\Audit;

use App\Actions\Audit\CancelAudit;
use App\Actions\Audit\CreateAudit;
use App\Http\Controllers\Controller;
use App\Http\Requests\Audit\AuditCreateRequest;
use App\Models\Audit;
use App\Value\ScanInfo;
use App\Value\ScannedUrl;
use App\Value\ScanProgress;
use App\Value\ScanQueue;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ScanningController extends Controller
{
    public function store(AuditCreateRequest $request, CreateAudit $creator)
    {
        $audit = $creator->create($request->url);

        return redirect()->route('scanning.progress', [
            'id' => $audit->crawler_id
        ]);
    }

    public function progress(Request $request)
    {
        $audit = $this->getAudit($request->route('id'));

        return Inertia::render('audit/scan-progress', [
            'scanInfo' => ScanInfo::fromAudit($audit),
            'scanQueue' => ScanQueue::fromAudit($audit),
            'scanUrls' => ScannedUrl::mapFromAudit($audit),
            'scanProgress' => ScanProgress::fromAudit($audit),
        ]);
    }

    public function cancel(Request $request, CancelAudit $action)
    {
        $action->cancel(
            $this->getAudit($request->route('id'))
        );

        return back();
    }

    private function getAudit(string $id): Audit
    {
        return Audit::where('crawler_id', $id)->firstOrFail();
    }
}
