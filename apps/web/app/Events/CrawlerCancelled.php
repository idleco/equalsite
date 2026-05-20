<?php

namespace App\Events;

use App\Value\CrawlerStats;
use App\Value\Status;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Override;

class CrawlerCancelled implements StatusChangeEvent
{
    use Dispatchable, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public string $crawlId,
        public string $timestamp,
        public CrawlerStats $stats,
    ) {}

    #[Override]
    public function crawlerId(): string
    {
        return $this->crawlId;
    }

    #[Override]
    public function getStatus(): Status
    {
        return Status::Cancelled;
    }
}
