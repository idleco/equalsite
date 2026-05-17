<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class CrawlerCallbackController extends Controller
{
    public function __invoke(Request $request)
    {
        if ($request->hasFile('artifact')) {
            $uniqueId = $request->uniqueId;
            $request->file('artifact')->store("audits");
        }

        return response()->json([
            'ok' => true
        ]);
    }
}
