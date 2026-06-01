<?php

namespace App\Http\Controllers;

use App\Actions\CreateAudit;
use Illuminate\Http\Request;
use App\Support\SpiderClient;
use App\Value\SpiderRequestBody;
use Inertia\Inertia;

class WebsiteScanController extends Controller
{
    public function __construct(
        protected SpiderClient $spider,
        protected CreateAudit $auditCreator
    ) {}

    public function store(Request $request)
    {
        $validated = $request->validate([
            'url' => ['required', 'active_url']
        ]);

        $body = SpiderRequestBody::make()
            ->setUrl($validated['url'])
            ->setMaxPages(15);

        $response = $this->spider->create($body);
        $created = $this->auditCreator->create(
            url: $response['url'],
            crawlId: $response['auditId']
        );

        return redirect()->route('audit.scan.progress', [
            'id' => $created->crawler_id
        ]);
    }
}
