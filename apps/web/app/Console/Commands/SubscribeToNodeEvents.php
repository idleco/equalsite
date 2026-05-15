<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redis;

#[Signature('redis:subscribe-node')]
#[Description('Subscribe to events published by Node.js')]
class SubscribeToNodeEvents extends Command
{
    public function handle()
    {
        Redis::connection('crawler')->subscribe(['laravel_events'], function ($message) {
            $data = json_decode($message, true);
            Log::info('Received from Node.js:', $data);
        });
    }
}
