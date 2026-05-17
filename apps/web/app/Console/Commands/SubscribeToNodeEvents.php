<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redis;

#[Signature('spider:listen')]
#[Description('Subscribe to events published by Node.js')]
class SubscribeToNodeEvents extends Command
{
    public function handle()
    {
        while (true) {
            try {
                $this->info("Connecting to redis subcriber...");

                $connection = Redis::connection('crawler');

                $connection->subscribe(
                    ['laravel_events'],
                    function (string $payload, string $channel) {
                        $this->handleMessage($payload, $channel);
                    }
                );
            } catch (\Throwable $e) {
                Log::error(
                    'Spider listener crashed',
                    [
                        'message' => $e->getMessage()
                    ]
                );

                sleep(5);
            }
        }
    }

    private function handleMessage(string $payload, string $channel): void
    {
        $data = json_decode($payload, true);

        Log::channel('crawler')->info('Received from Node.js:', [
            'channel' => $channel,
            'payload' => $data,
        ]);
    }
}
