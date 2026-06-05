<?php

namespace App\Actions\Audit;

use App\Models\Audit;
use App\Support\SpiderClient;
use App\Value\Status;

class CancelAudit
{
    public function __construct(
        protected SpiderClient $spider,
    ) {}

    public function cancel(Audit $audit): void
    {
        $this->spider->cancel($audit->crawler_id);

        $audit->update([
            'status' => Status::Cancelled,
            'cancelled_at' => now()
        ]);
    }
}
