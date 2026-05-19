<?php

namespace App\Console\Commands;

use App\Events\CrawlerMessageReceived;
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
        $streamName = 'crawler.streams';
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
            handler: function (array $message) {
                /**
                 * message structure
                 * {"id":"1779115927230-0","stream":"crawler.streams","type":"progress","payload":{"test":1},"version":1}
                 */
                $type = $message['type'] ?? '';
                $payload = $message['payload'] ?? [];

                event(new CrawlerMessageReceived($type, $payload));
            }
        );

        return self::SUCCESS;
    }
}
