<?php

namespace App\Events;

use App\Models\Audit;
use App\Value\CrawlerStats;
use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class StatusUpdated implements ShouldBroadcastNow
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public Audit $audit,
        public ?CrawlerStats $stats,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new Channel('audits.' . $this->audit->crawler_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'audit.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'event' => $this->broadcastAs(),
            'data' => [
                'id' => $this->audit->crawler_id,
                'status' => $this->audit->status->value,
                'failureReason' => $this->audit->failureReason,
                'cancelledAt' => $this->audit->cancelled_at?->toDateTimeString(),
                'completedAt' => $this->audit->completed_at?->toDateTimeString(),
                'startedAt' => $this->audit->started_at?->toDateTimeString(),
                'stats' => $this->stats,
            ]
        ];
    }
}
