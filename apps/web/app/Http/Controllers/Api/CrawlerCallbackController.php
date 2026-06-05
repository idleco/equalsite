<?php

namespace App\Http\Controllers\Api;

use App\Actions\Audit\UnzipCrawlerArtifacts;
use App\Http\Controllers\Controller;
use App\Jobs\ProcessAuditArtifacts;
use Illuminate\Http\Request;

class CrawlerCallbackController extends Controller
{
    public function __invoke(Request $request, UnzipCrawlerArtifacts $zip)
    {
        if ($request->boolean('probe')) {
            return response()->json(['ok' => true]);
        }

        if ($request->hasFile('artifact')) {
            $crawlId = $request->crawlId;

            $zipFile = $request->file('artifact');
            $zip->unzip($crawlId, $zipFile->getRealPath());

            ProcessAuditArtifacts::dispatch($crawlId);
        }

        return response()->json([
            'ok' => true
        ]);
    }
}
