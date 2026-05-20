<?php

namespace App\Events;

use App\Value\CrawlerStats;
use App\Value\Status;

interface StatusChangeEvent
{
    public function getStats(): ?CrawlerStats;

    public function crawlerId(): string;

    public function getStatus(): Status;
}
