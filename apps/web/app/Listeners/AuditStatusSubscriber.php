<?php

namespace App\Listeners;

use App\Events\Audit\AuditCompleted;
use App\Events\Audit\AuditFailed;
use App\Events\Audit\AuditPageCompleted;
use App\Events\Audit\AuditPageFailed;
use App\Events\Audit\AuditPageStarted;
use App\Events\Audit\AuditQueued;
use App\Events\Audit\AuditStarted;
use App\Models\Audit;
use App\Value\Status;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Events\Dispatcher;
use Illuminate\Support\Carbon;

class AuditStatusSubscriber implements ShouldQueue
{
    public function handleAuditStarted(AuditStarted $event): void
    {
        $this->updateAudit($event->crawlerId(), [
            'status' => Status::Started,
            'started_at' => $this->carbonTimestamp($event->timestamp())
        ]);
    }

    public function handleAuditFailed(AuditFailed $event): void
    {
        $this->updateAudit($event->crawlerId(), [
            'status' => Status::Failed,
            'failure_reason' => $event->payload()['error'] ?? ''
        ]);
    }

    public function handleAuditCompleted(AuditCompleted $event): void
    {
        $this->updateAudit($event->crawlerId(), [
            'status' => Status::Completed,
            'completed_at' => $this->carbonTimestamp($event->timestamp())
        ]);
    }

    protected function carbonTimestamp(int $timestamp)
    {
        return Carbon::createFromTimestampMs($timestamp);
    }

    protected function updateAudit(int $crawlerId, array $attributes): void
    {
        $audit = Audit::where('crawler_id', $crawlerId)->first();

        if ($audit) {
            $audit->update($attributes);
        }
    }

    public function subscribe(Dispatcher $events): void
    {
        $events->listen(
            AuditStarted::class,
            [AuditStatusSubscriber::class, 'handleAuditStarted']
        );

        $events->listen(
            AuditFailed::class,
            [AuditStatusSubscriber::class, 'handleAuditFailed']
        );

        $events->listen(
            AuditCompleted::class,
            [AuditStatusSubscriber::class, 'handleAuditCompleted']
        );
    }
}
