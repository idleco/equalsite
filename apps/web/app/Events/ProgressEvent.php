<?php

namespace App\Events;

use App\Models\Audit;
use App\Value\CrawlerStats;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ProgressEvent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Audit $audit,
        public string $url,
        public int $violations,
        public CrawlerStats $stats,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new Channel('audits.' . $this->audit->crawler_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'audit.progress';
    }

    public function broadcastWith(): array
    {
        return [
            'event' => $this->broadcastAs(),
            'data' => [
                'id' => $this->audit->crawler_id,
                'url' => $this->url,
                'violations' => $this->violations,
                'stats' => $this->stats,
            ]
        ];
    }
}
