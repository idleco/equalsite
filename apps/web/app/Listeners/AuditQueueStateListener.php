<?php

namespace App\Listeners;

use App\Events\Audit\AuditQueued;
use App\Models\Audit;
use Illuminate\Contracts\Queue\ShouldQueue;

class AuditQueueStateListener implements ShouldQueue
{
    public function __invoke(AuditQueued $event)
    {
        $audit = Audit::where('crawler_id', $event->crawlerId())->first();

        if ($audit) {
            $payload = $event->payload();

            $audit->setCustomData('queue_state', [
                'position' => $payload['position'],
                'ahead' => $payload['ahead'],
                'waiting' => $payload['waiting'],
            ]);
        }
    }
}
