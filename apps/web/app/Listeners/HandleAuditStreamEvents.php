<?php

namespace App\Listeners;

use App\Events\AuditWebsocketEvent;
use App\Events\RedisStreamEvent;
use App\Models\Audit;
use App\Value\Status;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Psr\Log\LoggerInterface;

class HandleAuditStreamEvents implements ShouldQueue
{
    protected static ?Audit $audit = null;

    protected LoggerInterface $logger;

    public function __construct()
    {
        $this->logger = Log::channel('crawler');
    }

    protected static function getAudit(string $crawlId): Audit
    {
        if (! static::$audit) {
            static::$audit = Audit::query()
                ->where('crawler_id', $crawlId)
                ->first();
        }

        return static::$audit;
    }

    public function __invoke(RedisStreamEvent $event): void
    {
        if ($event->type === 'crawler.telemetry') {
            $this->handleTelemetry($event);
            return;
        }

        match ($event->type) {
            'audit.queued' => $this->onQueued($event),
            'audit.progress' => $this->onProgress($event),
            'audit.started' => $this->onStarted($event),
            'audit.completed' => $this->onCompleted($event),
            'audit.failed' => $this->onFailed($event),
            'audit.cancelled' => $this->onCancelled($event),
        };

        $this->broadcastWebsocketEvent($event);
    }

    protected function handleTelemetry(RedisStreamEvent $event): void
    {
        // $this->logger->info("Crawler Telemetry", $event->data->toArray());
    }

    protected function onFailed(RedisStreamEvent $event)
    {
        $audit = static::getAudit($event->payload['crawlId']);

        $audit->forceFill([
            'status' => Status::Failed,
            'failure_reason' => $event->payload['error'] ?? '',
        ])->save();
    }

    protected function onCancelled(RedisStreamEvent $event)
    {
        $audit = static::getAudit($event->payload['crawlId']);

        $audit->forceFill([
            'status' => Status::Cancelled,
            'cancelled_at' => $this->resolveTimestamp($event),
        ])->save();
    }

    protected function onCompleted(RedisStreamEvent $event)
    {
        $audit = static::getAudit($event->payload['crawlId']);

        $audit->forceFill([
            'status' => Status::Completed,
            'completed_at' => $this->resolveTimestamp($event),
        ])->save();
    }

    protected function onStarted(RedisStreamEvent $event)
    {
        $audit = static::getAudit($event->payload['crawlId']);

        $audit->forceFill([
            'status' => Status::Started,
            'started_at' => $this->resolveTimestamp($event),
        ])->save();

        Cache::forget("audit-{$audit->crawler_id}:queue-status");
    }

    protected function onQueued(RedisStreamEvent $event): void
    {
        if ($crawlId = $event->payload['crawlId']) {
            Cache::put("audit-{$crawlId}:queue-status", $event->data->payload);
        }
    }

    protected function onProgress(RedisStreamEvent $event): void
    {
        $audit = static::getAudit($event->payload['crawlId']);

        // store processed urls and their violations summary
        $audit->patchCustomData('scanned_urls', function ($prev) use ($event) {
            $currentUrl = $event->payload['currentUrl'];
            $severityBreakdown = $event->payload['severityBreakdown'];

            $urls = $prev ?? [];
            $urls[$currentUrl] = $severityBreakdown;

            return $urls;
        });

        // cache progress stats for progress monitoring
        Cache::put(
            "audit-{$audit->crawl_id}:progress",
            [
                'totalRequests' => $event->payload['totalRequests'],
                'pendingRequests' => $event->payload['pendingRequests'],
                'completedRequests' => $event->payload['completedRequests'],
                'progressPercentage' => $event->payload['progressPercentage'],
            ],
            300
        );
    }

    protected function broadcastWebsocketEvent(RedisStreamEvent $event): void
    {
        broadcast(new AuditWebsocketEvent(
            type: $event->type,
            payload: $event->payload,
            timestamp: $event->timestamp,
            version: $event->version
        ));
    }

    protected function resolveTimestamp(RedisStreamEvent $event)
    {
        return Carbon::createFromTimestampMs($event->timestamp);
    }
}
