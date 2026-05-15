<?php

namespace App\Jobs;

use App\Models\Audit;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Process;

class PerformSiteAuditProcess implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public string $url
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $js = base_path('scripst/crawler/crawler.js');
        $process = Process::timeout(120)->start("node {$js} \"{$this->url}\"");

        while ($process->running()) {
            Log::debug('OUTPUT', $process->latestOutput());
            Log::debug('ERROR', $process->latestErrorOutput());

            sleep(1);
        }
    }
}
