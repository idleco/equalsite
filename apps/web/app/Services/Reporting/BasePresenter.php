<?php

namespace App\Services\Reporting;

use App\Models\Audit;

class BasePresenter
{
    public function __construct(
        public Audit $audit,
    ) {}

    public function id(): int
    {
        return $this->audit->getKey();
    }

    public function siteId(): int
    {
        return $this->audit->site_id;
    }

    public function pagesScannedCount(): int
    {
        return count($this->audit->pages_scanned);
    }

    public function unlocksFullReport(): bool
    {
        return $this->audit->unlocksFullReport();
    }

    public function status(): Status
    {
        return $this->audit->status;
    }
}
