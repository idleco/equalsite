<?php

namespace App\Listeners;

use App\Events\Audit\AuditProgress;
use App\Models\Audit;
use Illuminate\Contracts\Queue\ShouldQueue;

class AuditProgressListener implements ShouldQueue
{
    public function __invoke(AuditProgress $event)
    {
        $audit = Audit::where('crawler_id', $event->crawlerId())->first();

        if ($audit) {
            $payload = $event->payload();

            $audit->setCustomData('progress_state', [
                'completedRequests' => $payload['completedRequests'],
                'pendingRequests' => $payload['pendingRequests'],
                'totalRequests' => $payload['totalRequests'],
                'progressPercentage' => $payload['progressPercentage']
            ]);
        }
    }
}
