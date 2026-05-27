<?php

namespace App\Events;

use DateTimeInterface;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AuditFailed implements ShouldBroadcastNow
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
        return 'audit.failed';
    }

    public function broadcastWith(): array
    {
        return [
            'version' => $this->version,
            'type' => $this->broadcastAs(),
            'payload' => [
                'crawlId' => $this->payload['crawlId'],
                'error' => $this->payload['error'],
                'receivedAt' => $this->receivedAt,
            ],
        ];
    }
}
