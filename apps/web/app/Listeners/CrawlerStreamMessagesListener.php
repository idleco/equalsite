<?php

namespace App\Listeners;

use App\Events\CrawlerMessageReceived;
use App\Jobs\MarkAuditAsFailed;
use App\Jobs\MarkAuditAsStarted;
use App\Models\Audit;
use App\Value\MessageType;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class CrawlerStreamMessagesListener
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(CrawlerMessageReceived $event): void
    {
        // {"type":"started","payload":{"crawlId":"823d10d4-90a8-41a1-8c48-b09869300273","timestamp":"2026-05-18T21:23:47.918Z"}}
        $payload = $event->payload;
        $type = MessageType::tryFrom($event->type);

        match ($type) {
            MessageType::Started => $this->handleStarted($payload),
            MessageType::Failed => $this->handleFailure($payload),
            MessageType::Progress => $this->handleProgress($payload),
            default => null
        };
    }

    protected function handleProgress(array $payload)
    {
        Log::channel('crawler')->debug('Crawler stream', [
            'type' => 'progress',
            'payload' => $payload
        ]);
    }

    protected function handleStarted(array $payload)
    {
        MarkAuditAsStarted::dispatch(
            $payload['crawlId'],
            $payload['timestamp']
        );
    }

    protected function handleFailure(array $payload)
    {
        $errors = $payload['errors'];

        MarkAuditAsFailed::dispatch(
            $payload['crawlId'],
            is_array($errors) ? json_encode($errors) : $errors
        );
    }
}
