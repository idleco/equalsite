<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Support\CrawlerHttpClient;
use Illuminate\Support\Carbon;

class WebsiteScanController extends Controller
{
    public function __construct(
        protected CrawlerHttpClient $client
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

        $crawlId = $response['crawlId'];
        $status = $response['status'];
        $timestamp = Carbon::parse($response['timestamp']);

        dd($crawlId, $timestamp, $status);

        throw new \Exception('Not implemented');
    }
}
