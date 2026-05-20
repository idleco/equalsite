<?php

namespace App\Value;

use Illuminate\Contracts\Support\Arrayable;

class CrawlerStats implements Arrayable
{
    public function __construct(
        public readonly int $totalRequests,
        public readonly int $pendingRequests,
        public readonly int $processedRequests,
        public readonly int $failedRequests,
        public readonly int $concurrency
    ) {}

    public function toArray(): array
    {
        return [
            'totalRequests' => $this->totalRequests,
            'pendingRequests' => $this->pendingRequests,
            'processedRequests' => $this->processedRequests,
            'failedRequests' => $this->failedRequests,
            'concurrency' => $this->concurrency
        ];
    }
}
