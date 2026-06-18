<?php

namespace App\Actions\Audit;

use App\Models\Audit;
use App\Contracts\Spider;
use App\Support\Spider\EnqueueStrategy;
use App\Support\Spider\SpiderOptions;
use App\Value\Status;

class CreateAudit
{
    public function __construct(
        protected Spider $spider,
    ) {}

    public function create(string $url): Audit
    {
        $response = $this->spider->create(
            SpiderOptions::make(
                urls: [$url],
                callbackUrl: 'http://web' . route('api.crawler.callback', absolute: false)
            )->setOptions([
                'maxPages' => 50,
                'enqueueLinks' => true,
                'enqueueStrategy' => EnqueueStrategy::SameDomain
            ])
        );

        return Audit::create([
            'domain' => parse_url($url, PHP_URL_HOST),
            'url' => $url,
            'status' => Status::Queued,
            'crawler_id' => $response['id']
        ]);
    }
}
