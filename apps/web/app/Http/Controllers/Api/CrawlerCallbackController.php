<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CrawlerCallbackController extends Controller
{
    public function __invoke(Request $request)
    {
        if ($request->hasFile('artifact')) {
            $uniqueId = $request->uniqueId;
            $request->file('artifact')->store("audits");

            Log::channel('crawler')->debug('crawler callback', [
                'completed' => true,
                'crawlId' => $uniqueId
            ]);
        }

        return response()->json([
            'ok' => true
        ]);
    }
}
