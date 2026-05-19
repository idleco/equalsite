<?php

namespace App\Http\Controllers\Api;

use App\Actions\UnzipCrawlerArtifacts;
use App\Http\Controllers\Controller;
use App\Jobs\ProcessCrawlerArtifacts;
use Illuminate\Http\Request;

class CrawlerCallbackController extends Controller
{
    public function __construct(
        protected UnzipCrawlerArtifacts $unzipper,
    ) {}

    public function __invoke(Request $request)
    {
        if ($request->hasFile('artifact')) {
            $crawlId = $request->crawlId;

            $zipFile = $request->file('artifact');
            $this->unzipper->unzip($crawlId, $zipFile->getRealPath());

            ProcessCrawlerArtifacts::dispatch($crawlId);
        }

        return response()->json([
            'ok' => true
        ]);
    }
}
