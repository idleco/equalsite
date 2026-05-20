<?php

namespace App\Events;

use App\Value\Status;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Override;

class CrawlerStarted implements StatusChangeEvent
{
    use Dispatchable, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public string $crawlId,
        public string $timestamp
    ) {}

    #[Override]
    public function crawlerId(): string
    {
        return $this->crawlId;
    }

    #[Override]
    public function getStatus(): Status
    {
        return Status::Started;
    }
}
