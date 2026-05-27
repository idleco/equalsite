<?php

namespace App\Events;

use DateTimeInterface;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AuditProgress implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public array $payload,
        public DateTimeInterface $receivedAt,
        public string $version,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new Channel('audit-' . $this->payload['crawlId']),
        ];
    }

    public function broadcastAs(): string
    {
        return 'audit.progress';
    }

    public function broadcastWith(): array
    {
        return [
            'version' => $this->version,
            'type' => $this->broadcastAs(),
            'payload' => [
                'crawlId' => $this->payload['crawlId'],
                'pagesCompleted' => $this->payload['pagesCompleted'],
                'pagesTotal' => $this->payload['pagesTotal'],
                'currentUrl' => $this->payload['currentUrl'],
                'violations' => $this->payload['violations'],
                'progress' => $this->payload['progress'],
                'receivedAt' => $this->receivedAt,
            ],
        ];
    }
}
