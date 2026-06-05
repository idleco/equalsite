<?php

namespace App\Listeners;

use App\Events\Audit\AuditPageCompleted;
use App\Events\Audit\AuditPageFailed;
use App\Events\Audit\AuditPageSkipped;
use App\Events\Audit\AuditPageStarted;
use App\Models\Audit;
use Carbon\Carbon;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Events\Dispatcher;
use Illuminate\Support\Arr;

class AuditPageSubscriber implements ShouldQueue
{
    public function handlePageStarted(AuditPageStarted $event): void
    {
        $payload = $event->payload();
        $timestamp = $this->carbonTimestamp($event->timestamp());

        $this->updatePage($event->crawlerId(), $payload['pageUrl'], [
            'status' => 'started',
            'attemptsCount' => $payload['attemptsCount'] ?? 0,
            'startedAt' => $timestamp->toDateTimeString(),
        ]);
    }

    public function handlePageSkipped(AuditPageSkipped $event): void
    {
        $payload = $event->payload();
        $timestamp = $this->carbonTimestamp($event->timestamp());

        $this->updatePage($event->crawlerId(), $payload['pageUrl'], [
            'status' => 'skipped',
            'skippingReason' => $payload['reason'],
            'skippedAt' => $timestamp->toDateTimeString()
        ]);
    }

    public function handlePageFailed(AuditPageFailed $event): void
    {
        $payload = $event->payload();
        $timestamp = $this->carbonTimestamp($event->timestamp());

        $this->updatePage($event->crawlerId(), $payload['pageUrl'], [
            'status' => 'failed',
            'attemptsCount' => $payload['attemptsCount'],
            'errorMessage' => $payload['errorMessage'],
            'failedAt' => $timestamp->toDateTimeString()
        ]);
    }

    public function handlePageCompleted(AuditPageCompleted $event): void
    {
        $payload = $event->payload();
        $timestamp = $this->carbonTimestamp($event->timestamp());

        $this->updatePage($event->crawlerId(), $payload['pageUrl'], [
            'status' => 'completed',
            'accessibilityViolationsCount' => $payload['accessibilityViolationsCount'],
            'severityBreakdown' => $payload['severityBreakdown'],
            'completedAt' => $timestamp->toDateTimeString()
        ]);
    }

    protected function updatePage(string $crawlerId, string $url, array $attributes = []): void
    {
        $audit = Audit::where('crawler_id', $crawlerId)->first();

        if ($audit) {
            $audit->patchCustomData('scanned_urls', function ($urls) use ($url, $attributes) {
                $urls = $urls ?? [];
                $prev = Arr::get($urls, $url, []);
                Arr::set($urls, $url, array_merge($prev, $attributes));
                return $urls;
            })->save();
        }
    }

    protected function carbonTimestamp(int $timestamp)
    {
        return Carbon::createFromTimestampMs($timestamp);
    }

    public function subscribe(Dispatcher $events): void
    {
        $events->listen(
            AuditPageStarted::class,
            [AuditPageSubscriber::class, 'handlePageStarted']
        );

        $events->listen(
            AuditPageSkipped::class,
            [AuditPageSubscriber::class, 'handlePageSkipped']
        );

        $events->listen(
            AuditPageFailed::class,
            [AuditPageSubscriber::class, 'handlePageFailed']
        );

        $events->listen(
            AuditPageCompleted::class,
            [AuditPageSubscriber::class, 'handlePageCompleted']
        );
    }
}
