<?php

namespace App\Listeners;

use App\Events\CrawlerCancelled;
use App\Events\CrawlerCompleted;
use App\Events\CrawlerFailed;
use App\Events\CrawlerStarted;
use App\Events\StatusChangeEvent;
use App\Models\Audit;
use App\Value\Status;
use Illuminate\Support\Carbon;

class SaveAuditStatusUpdate
{
    public function __invoke(StatusChangeEvent $event): void
    {
        $audit = Audit::query()
            ->where('crawler_id', $event->crawlId)
            ->first();

        if ($audit === null) {
            return;
        }

        $audit->forceFill(
            match ($event->getStatus()) {
                Status::Started => $this->startedAttributes($event),
                Status::Completed => $this->completedAttributes($event),
                Status::Cancelled => $this->cancelledAttributes($event),
                Status::Failed => $this->failedAttributes($event)
            }
        )->save();
    }

    protected function failedAttributes(CrawlerFailed $event): array
    {
        return [
            'status' => Status::Failed,
            'failure_reason' => json_encode($event->errors)
        ];
    }

    protected function completedAttributes(CrawlerCompleted $event): array
    {
        return [
            'status' => Status::Completed,
            'completed_at' => Carbon::parse($event->timestamp)
        ];
    }

    protected function cancelledAttributes(CrawlerCancelled $event): array
    {
        return [
            'status' => Status::Cancelled,
            'cancelled_at' => Carbon::parse($event->timestamp)
        ];
    }

    protected function startedAttributes(CrawlerStarted $event): array
    {
        return [
            'status' => Status::Started,
            'started_at' => Carbon::parse($event->timestamp)
        ];
    }
}
