<?php

namespace App\Http\Controllers\Api;

use App\Actions\UnzipCrawlerArtifacts;
use App\Http\Controllers\Controller;
use App\Jobs\ExtractCrawlerArtifacts;
use Illuminate\Http\Request;

class CrawlerCallbackController extends Controller
{
    public function __construct(
        protected UnzipCrawlerArtifacts $unzipper,
    ) {}

    public function __invoke(Request $request)
    {
        if ($request->boolean('probe')) {
            return response()->json(['ok' => true]);
        }

        if ($request->hasFile('artifact')) {
            $crawlId = $request->crawlId;

            $zipFile = $request->file('artifact');
            $this->unzipper->unzip($crawlId, $zipFile->getRealPath());

            ExtractCrawlerArtifacts::dispatch($crawlId);
        }

        return response()->json([
            'ok' => true
        ]);
    }
}
