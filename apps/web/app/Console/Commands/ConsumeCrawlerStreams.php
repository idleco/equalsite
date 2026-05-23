<?php

namespace App\Console\Commands;

use App\Events\CrawlerCancelled;
use App\Events\CrawlerCompleted;
use App\Events\CrawlerFailed;
use App\Events\CrawlerProgress;
use App\Events\CrawlerStarted;
use App\Events\MessageReceived;
use App\Support\RedisStream;
use App\Value\CrawlerStats;
use App\Value\MessageType;
use App\Value\SeverityBreakdown;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Arr;

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
            handler: function (array $message) use ($streamName) {
                $crawlId = Arr::get($message, 'payload.crawlId');
                $version = Arr::get($message, 'version');
                $channel = Arr::get($message, 'channel', $streamName);
                $errors = Arr::get($message, 'payload.errors', []);
                $timestamp = Arr::get($message, 'payload.timestamp', now()->toDateTimeString());

                $stats = $this->resolveStats($message);
                $severityBreakdown = $this->resolveSeverityBreakdown($message);

                $type = MessageType::tryFrom($message['type']);
                event(match ($type) {
                    MessageType::Started => new CrawlerStarted(
                        crawlId: $crawlId,
                        timestamp: $timestamp
                    ),

                    MessageType::Cancelled => new CrawlerCancelled(
                        crawlId: $crawlId,
                        timestamp: $timestamp,
                        stats: $stats
                    ),

                    MessageType::Failed => new CrawlerFailed(
                        crawlId: $crawlId,
                        timestamp: $timestamp,
                        errors: $errors,
                        stats: $stats
                    ),

                    MessageType::Completed => new CrawlerCompleted(
                        crawlId: $crawlId,
                        timestamp: $timestamp,
                        stats: $stats
                    ),

                    MessageType::Progress => new CrawlerProgress(
                        crawlId: $crawlId,
                        url: Arr::get($message, 'payload.url'),
                        violations: Arr::get($message, 'payload.violations', 0),
                        timestamp: $timestamp,
                        stats: $stats,
                        severityBreakdown: $severityBreakdown
                    ),

                    default => new MessageReceived(
                        channel: $channel,
                        type: $message['type'],
                        payload: $message['payload'],
                        version: $version,
                    )
                });
            }
        );

        return self::SUCCESS;
    }

    protected function resolveSeverityBreakdown(array $message)
    {
        $breakdown = Arr::get($message, 'payload.severityBreakdown', []);

        return new SeverityBreakdown(
            critical: Arr::get($breakdown, 'critical', 0),
            serious: Arr::get($breakdown, 'serious', 0),
            moderate: Arr::get($breakdown, 'moderate', 0),
            minor: Arr::get($breakdown, 'minor', 0),
        );
    }

    protected function resolveStats(array $message)
    {
        $stats = Arr::get($message, 'payload.stats', []);

        return new CrawlerStats(
            totalRequests: Arr::get($stats, 'totalRequests', 0),
            pendingRequests: Arr::get($stats, 'pendingRequests', 0),
            processedRequests: Arr::get($stats, 'processedRequests', 0),
            failedRequests: Arr::get($stats, 'failedRequests', 0),
            concurrency: Arr::get($stats, 'concurrency', 0)
        );
    }
}
