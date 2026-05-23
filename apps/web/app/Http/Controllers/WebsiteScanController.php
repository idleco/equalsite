<?php

namespace App\Http\Controllers;

use App\Actions\CreateAudit;
use Illuminate\Http\Request;
use App\Support\CrawlerHttpClient;
use Inertia\Inertia;

class WebsiteScanController extends Controller
{
    public function __construct(
        protected CrawlerHttpClient $client,
        protected CreateAudit $auditCreator
    ) {}

    public function store(Request $request)
    {
        $validated = $request->validate([
            'url' => ['required']
        ]);

        $response = $this->client->queue(
            url: $validated['url'],
            callback: 'http://web' . route('api.crawler.callback', absolute: false)
        );

        $crawlerId = $response['crawlId'];

        $created = $this->auditCreator->create(
            url: $validated['url'],
            crawlId: $crawlerId
        );

        return redirect()->route('audit.scan.progress', [
            'id' => $created->crawler_id
        ]);
    }
}
