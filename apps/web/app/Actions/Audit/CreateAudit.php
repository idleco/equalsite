<?php

namespace App\Actions\Audit;

use App\Models\Audit;
use App\Support\SpiderClient;
use App\Value\Status;

class CreateAudit
{
    public function __construct(
        protected SpiderClient $spider,
    ) {}

    public function create(string $url, string $callback, array $options = []): Audit
    {
        $response = $this->spider->create(
            $url,
            $callback,
            $this->resolveOptions($options)
        );

        return Audit::create([
            'domain' => parse_url($url, PHP_URL_HOST),
            'url' => $url,
            'status' => Status::Queued,
            'crawler_id' => $response['data']['auditId']
        ]);
    }

    protected function resolveOptions(array $options): array
    {
        $result = [];

        if (isset($options['maxPages'])) {
            $result['maxPages'] = $options['maxPages'];
        }

        return $result;
    }
}
