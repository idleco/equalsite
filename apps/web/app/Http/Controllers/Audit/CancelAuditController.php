<?php

namespace App\Http\Controllers\Audit;

use App\Support\CrawlerHttpClient;
use Illuminate\Http\Request;

class CancelAuditController
{
    public function __construct(
        protected CrawlerHttpClient $client
    ) {}

    public function __invoke(Request $request)
    {
        $id = $request->route('id');

        $this->client->cancel($id);

        return back();
    }
}
