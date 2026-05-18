<?php

namespace App\Listeners;

use App\Events\CrawlerMessageReceived;
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
        Log::channel('crawler')->debug('Crawler stream message listener ', [
            'type' => $event->type,
            'payload' => $event->payload
        ]);
    }
}
