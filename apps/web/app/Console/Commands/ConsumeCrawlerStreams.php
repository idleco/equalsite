<?php

namespace App\Console\Commands;

use App\Events\RedisStreamEvent;
use App\Support\RedisStream;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('crawler:listen')]
#[Description('Command description')]
class ConsumeCrawlerStreams extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(
        RedisStream $stream
    ) {
        $streamName = env('STREAM_NAME', 'equalsite:crawler:events');
        $group = 'laravel-workers';

        $consumer = sprintf(
            '%s-%s',
            gethostname(),
            getmypid()
        );

        // create group if not exists
        $stream->createConsumerGroup($streamName, $group);

        $this->info(sprintf(
            'Listening to stream [%s] as consumer [%s]',
            $streamName,
            $consumer
        ));

        $stream->consume(
            stream: $streamName,
            group: $group,
            consumer: $consumer,
            handler: function ($data) {
                event(new RedisStreamEvent($data));
            }
        );

        return self::SUCCESS;
    }
}
