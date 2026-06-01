<?php

namespace App\Http\Controllers\Audit;

use App\Support\SpiderClient;
use Illuminate\Http\Request;

class CancelAuditController
{
    public function __construct(
        protected SpiderClient $client
    ) {}

    public function __invoke(Request $request)
    {
        $id = $request->route('id');

        $this->client->cancel($id);

        return back();
    }
}
