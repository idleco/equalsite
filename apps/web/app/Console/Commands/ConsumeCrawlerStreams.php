<?php

namespace App\Console\Commands;

use App\Events;
use App\Events\RedisStreamEvent;
use App\Support\RedisStream;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

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
                $this->info(sprintf(
                    '%s - [%s] %s',
                    Carbon::createFromTimestampMs($data->timestamp)->toDateTimeString(),
                    $data->type,
                    json_encode($data->payload),
                ));

                event(match ($data->type) {
                    'audit.queued' => new Events\Audit\AuditQueued($data),
                    'audit.started' => new Events\Audit\AuditStarted($data),
                    'audit.progress' => new Events\Audit\AuditProgress($data),
                    'audit.completed' => new Events\Audit\AuditCompleted($data),
                    'audit.failed' => new Events\Audit\AuditFailed($data),
                    'audit.cancelled' => new Events\Audit\AuditCancelled($data),
                    'audit.page.started' => new Events\Audit\AuditPageStarted($data),
                    'audit.page.skipped' => new Events\Audit\AuditPageSkipped($data),
                    'audit.page.failed' => new Events\Audit\AuditPageFailed($data),
                    'audit.page.completed' => new Events\Audit\AuditPageCompleted($data),
                    default => new RedisStreamEvent($data)
                });
            }
        );

        return self::SUCCESS;
    }
}
