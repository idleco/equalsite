<?php

namespace App\Actions\Audit;

use App\Models\Audit;
use App\Support\SpiderClient;
use App\Value\Status;
use Illuminate\Support\Arr;

class CreateAudit
{
    public function __construct(
        protected SpiderClient $spider,
    ) {}

    public function create(string $url, string $callback, array $options = []): Audit
    {
        $id = $this->spider->create($url, $callback, $this->resolveOptions($options));

        return Audit::create([
            'url' => $url,
            'domain' => parse_url($url, PHP_URL_HOST),
            'status' => Status::Queued,
            'crawler_id' => $id
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
