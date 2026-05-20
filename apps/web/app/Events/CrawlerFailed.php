<?php

namespace App\Events;

use App\Value\CrawlerStats;
use App\Value\Status;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CrawlerFailed implements StatusChangeEvent
{
    use Dispatchable, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public string $crawlId,
        public string $timestamp,
        public array $errors,
        public CrawlerStats $stats,
    ) {}

    public function getStats(): ?CrawlerStats
    {
        return $this->stats;
    }

    public function crawlerId(): string
    {
        return $this->crawlId;
    }

    public function getStatus(): Status
    {
        return Status::Failed;
    }
}
