<?php

namespace App\Events;

use App\Value\CrawlerStats;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CrawlerProgress
{
    use SerializesModels, Dispatchable;

    public function __construct(
        public string $crawlId,
        public string $url,
        public int $violations,
        public CrawlerStats $stats
    ) {}
}
