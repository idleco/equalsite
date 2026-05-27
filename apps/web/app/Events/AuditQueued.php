<?php

namespace App\Events;

use DateTimeInterface;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AuditQueued implements ShouldBroadcastNow
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
        return 'audit.queued';
    }

    public function broadcastWith(): array
    {
        return [
            'version' => $this->version,
            'type' => $this->broadcastAs(),
            'payload' => [
                'crawlId' => $this->payload['crawlId'],
                'position' => $this->payload['position'],
                'ahead' => $this->payload['ahead'],
                'waiting' => $this->payload['waiting'],
                'receivedAt' => $this->receivedAt,

            ],
        ];
    }
}
