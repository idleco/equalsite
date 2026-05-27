<?php

namespace App\Listeners;

use App\Events\AuditCancelled;
use App\Events\AuditCompleted;
use App\Events\AuditFailed;
use App\Events\AuditProgress;
use App\Events\AuditQueued;
use App\Events\AuditStarted;
use App\Events\CrawlerStreamEvent;
use App\Models\Audit;
use App\Value\Status;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;

class HandleAuditStreamEvents
{
    public function __invoke(CrawlerStreamEvent $event): void
    {
        if ($event->type === 'crawler.telemetry') {
            return;
        }

        Log::channel('crawler')->debug('Audit Stream', [
            'type' => $event->type,
            'payload' => $event->payload,
            'timestamp' => $event->timestamp,
        ]);

        $audit = Audit::query()
            ->where('crawler_id', $event->payload['crawlId'])
            ->first();

        if ($audit === null) {
            return;
        }

        match ($event->type) {
            'audit.queued' => $this->handleQueued($audit, $event),
            'audit.progress' => $this->handleProgress($audit, $event),
            'audit.started' => $this->handleStarted($audit, $event),
            'audit.completed' => $this->handleCompleted($audit, $event),
            'audit.failed' => $this->handleFailed($audit, $event),
            'audit.cancelled' => $this->handleCancelled($audit, $event)
        };
    }

    protected function handleFailed(Audit $audit, CrawlerStreamEvent $event)
    {
        $receivedAt = $this->resolveTimestamp($event);

        $audit->forceFill([
            'status' => Status::Failed,
            'failure_reason' => $event->payload['error'] ?? '',
        ])->save();

        broadcast(new AuditFailed(
            payload: $event->payload,
            receivedAt: $receivedAt,
            version: $event->version
        ));
    }

    protected function handleCancelled(Audit $audit, CrawlerStreamEvent $event)
    {
        $receivedAt = $this->resolveTimestamp($event);

        $audit->forceFill([
            'status' => Status::Cancelled,
            'cancelled_at' => $receivedAt,
        ])->save();

        broadcast(new AuditCancelled(
            payload: $event->payload,
            receivedAt: $receivedAt,
            version: $event->version
        ));
    }

    protected function handleCompleted(Audit $audit, CrawlerStreamEvent $event)
    {
        $receivedAt = $this->resolveTimestamp($event);

        $audit->forceFill([
            'status' => Status::Completed,
            'completed_at' => $receivedAt,
        ])->save();

        broadcast(new AuditCompleted(
            payload: $event->payload,
            receivedAt: $receivedAt,
            version: $event->version
        ));
    }

    protected function handleStarted(Audit $audit, CrawlerStreamEvent $event)
    {
        $receivedAt = $this->resolveTimestamp($event);

        $audit->forceFill([
            'status' => Status::Started,
            'started_at' => $receivedAt,
        ])->save();

        broadcast(new AuditStarted(
            payload: $event->payload,
            receivedAt: $receivedAt,
            version: $event->version
        ));
    }

    protected function handleQueued(Audit $audit, CrawlerStreamEvent $event)
    {
        $receivedAt = $this->resolveTimestamp($event);

        broadcast(new AuditQueued(
            payload: $event->payload,
            receivedAt: $receivedAt,
            version: $event->version
        ));
    }

    protected function handleProgress(Audit $audit, CrawlerStreamEvent $event)
    {
        $receivedAt = $this->resolveTimestamp($event);

        $audit->patchCustomData(
            'progress',
            fn($state) => collect([
                ...($state ?? []),
                array_merge($event->payload, [
                    'receivedAt' => $receivedAt
                ])
            ])->unique('currentUrl')->all()
        );

        broadcast(new AuditProgress(
            payload: $event->payload,
            receivedAt: $receivedAt,
            version: $event->version
        ));
    }

    protected function resolveTimestamp($event)
    {
        return Carbon::createFromTimestampMs($event->timestamp);
    }
}
